"""
Prometheus 연동: query/query_range API 호출 및 range 차트 REST.
SSE 스트림(서버별 현황)은 server_status 모듈에서 DB와 조합해 제공한다.
"""
import os
import time
from typing import Any, Dict, List, Optional
import httpx
from dotenv import load_dotenv

load_dotenv()

PROMETHEUS_URL = (os.getenv("PROMETHEUS_URL") or "").strip()
NODE_EXPORTER_PORT = 9100
# 차트 range 쿼리 step (예: "1m", "5m"). 환경변수 PROMETHEUS_STEP
PROMETHEUS_STEP = (os.getenv("PROMETHEUS_STEP") or "1m").strip() or "1m"
_prometheus_client: Optional[httpx.AsyncClient] = None


async def get_prometheus_client() -> httpx.AsyncClient:
    global _prometheus_client
    if _prometheus_client is None:
        _prometheus_client = httpx.AsyncClient(
            timeout=httpx.Timeout(15.0, connect=5.0),
            limits=httpx.Limits(max_keepalive_connections=5, max_connections=10),
        )
    return _prometheus_client


async def close_prometheus_client():
    global _prometheus_client
    if _prometheus_client:
        await _prometheus_client.aclose()
        _prometheus_client = None


async def query_prometheus(query: str) -> Dict[str, Any]:
    if not PROMETHEUS_URL:
        return {"status": "error", "error": "PROMETHEUS_URL not set"}
    client = await get_prometheus_client()
    try:
        url = f"{PROMETHEUS_URL}/api/v1/query"
        response = await client.get(url, params={"query": query})
        response.raise_for_status()
        result = response.json()
        if "status" not in result:
            result["status"] = "success"
        return result
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "errorType": "request_error",
            "query": query,
        }


async def query_prometheus_range(
    query: str,
    start: Optional[float] = None,
    end: Optional[float] = None,
    step: Optional[str] = None,
) -> Dict[str, Any]:
    if step is None:
        step = PROMETHEUS_STEP
    if not PROMETHEUS_URL:
        return {"status": "error", "error": "PROMETHEUS_URL not set"}
    if end is None:
        end = time.time()
    if start is None:
        start = end - 3600
    client = await get_prometheus_client()
    try:
        url = f"{PROMETHEUS_URL}/api/v1/query_range"
        params = {"query": query, "start": start, "end": end, "step": step}
        response = await client.get(url, params=params)
        response.raise_for_status()
        result = response.json()
        if "status" not in result:
            result["status"] = "success"
        return result
    except Exception as e:
        return {"status": "error", "error": str(e), "errorType": "request_error"}


def _instance_matcher(ip: str) -> str:
    if not ip:
        return ""
    return f'instance="{ip}:{NODE_EXPORTER_PORT}"'


def _promql_cpu(ip: str) -> str:
    m = _instance_matcher(ip)
    if not m:
        return ""
    return f'round(avg by (instance) (irate(node_cpu_seconds_total{{{m}, mode!="idle"}}[1m])) * 100, 0.1)'


def _promql_memory(ip: str) -> str:
    m = _instance_matcher(ip)
    if not m:
        return ""
    return f"100 * (1 - (node_memory_MemAvailable_bytes{{{m}}} / node_memory_MemTotal_bytes{{{m}}}))"


def _promql_disk(ip: str) -> str:
    m = _instance_matcher(ip)
    if not m:
        return ""
    fs = 'fstype!~"tmpfs|overlay"'
    return f'100 * (1 - (node_filesystem_avail_bytes{{mountpoint="/",{fs},{m}}} / node_filesystem_size_bytes{{mountpoint="/",{fs},{m}}}))'


def _promql_memory_used_gb(ip: str) -> str:
    m = _instance_matcher(ip)
    if not m:
        return ""
    return f"(node_memory_MemTotal_bytes{{{m}}} - node_memory_MemAvailable_bytes{{{m}}}) / 1024 / 1024 / 1024"


def _promql_disk_used_gb(ip: str) -> str:
    m = _instance_matcher(ip)
    if not m:
        return ""
    fs = 'fstype!~"tmpfs|overlay"'
    return f'(node_filesystem_size_bytes{{mountpoint="/",{fs},{m}}} - node_filesystem_avail_bytes{{mountpoint="/",{fs},{m}}}) / 1024 / 1024 / 1024'


def _promql_network(ip: str) -> str:
    m = _instance_matcher(ip)
    if not m:
        return ""
    return f'sum by (instance) (rate(node_network_receive_bytes_total{{{m},device!~"lo|veth.*"}}[5m])) / 1024 / 1024'


def _promql_network_transmit(ip: str) -> str:
    m = _instance_matcher(ip)
    if not m:
        return ""
    return f'sum by (instance) (rate(node_network_transmit_bytes_total{{{m},device!~"lo|veth.*"}}[5m])) / 1024 / 1024'


def _parse_vector_by_ip(res: Dict) -> Dict[str, float]:
    """Prometheus vector result -> ip -> value (average if multiple series per ip)."""
    out: Dict[str, List[float]] = {}
    if res.get("status") != "success" or res.get("data", {}).get("resultType") != "vector":
        return {}
    for r in res.get("data", {}).get("result") or []:
        instance = (r.get("metric") or {}).get("instance")
        if not instance:
            continue
        ip = instance.rsplit(":", 1)[0] if ":" in instance else instance
        val = r.get("value")
        if val is not None and len(val) >= 2:
            try:
                n = float(val[1])
                if ip not in out:
                    out[ip] = []
                out[ip].append(n)
            except (TypeError, ValueError):
                pass
    return {ip: sum(vals) / len(vals) for ip, vals in out.items()}


def _clamp_0_100(v: float) -> float:
    return max(0.0, min(100.0, v)) if isinstance(v, (int, float)) else 0.0


async def fetch_instant_metrics_for_ips(ips: List[str]) -> Dict[str, Dict[str, float]]:
    """IP별 CPU/Memory/Disk/Network instant 메트릭. 연결 0명일 때는 호출하지 않음."""
    result: Dict[str, Dict[str, float]] = {}
    for ip in ips:
        if not ip:
            continue
        cpu_res = await query_prometheus(_promql_cpu(ip))
        mem_res = await query_prometheus(_promql_memory(ip))
        disk_res = await query_prometheus(_promql_disk(ip))
        net_res = await query_prometheus(_promql_network(ip))
        cpu_map = _parse_vector_by_ip(cpu_res)
        mem_map = _parse_vector_by_ip(mem_res)
        disk_map = _parse_vector_by_ip(disk_res)
        net_map = _parse_vector_by_ip(net_res)
        raw_cpu = cpu_map.get(ip)
        memory = mem_map.get(ip)
        disk = disk_map.get(ip)
        network_mb = net_map.get(ip)
        if raw_cpu is None and memory is None and disk is None and network_mb is None:
            continue
        if raw_cpu is not None:
            cpu = _clamp_0_100(raw_cpu)
        else:
            cpu = 0.0
        result[ip] = {
            "cpu": _clamp_0_100(cpu),
            "memory": _clamp_0_100(memory if memory is not None else 0),
            "disk": _clamp_0_100(disk if disk is not None else 0),
            "networkMb": max(0.0, network_mb if network_mb is not None else 0),
        }
    return result


async def _fetch_range_chart_for_ip(ip: str, start_ts: float, end_ts: float, step: str) -> Dict[str, List[Dict[str, Any]]]:
    """단일 IP에 대해 range 차트 데이터 조회. memory/disk는 value(%) + usedGb 병합."""
    cpu_res = await query_prometheus_range(_promql_cpu(ip), start_ts, end_ts, step)
    mem_res = await query_prometheus_range(_promql_memory(ip), start_ts, end_ts, step)
    mem_used_res = await query_prometheus_range(_promql_memory_used_gb(ip), start_ts, end_ts, step)
    disk_res = await query_prometheus_range(_promql_disk(ip), start_ts, end_ts, step)
    disk_used_res = await query_prometheus_range(_promql_disk_used_gb(ip), start_ts, end_ts, step)
    net_res = await query_prometheus_range(_promql_network(ip), start_ts, end_ts, step)
    net_tx_res = await query_prometheus_range(_promql_network_transmit(ip), start_ts, end_ts, step)
    cpu_pts = _append_end_time_point(_parse_matrix_to_chart_points(cpu_res), end_ts)
    mem_merged = _merge_pct_with_used_gb(
        _parse_matrix_to_chart_points(mem_res),
        _parse_matrix_to_chart_points(mem_used_res),
    )
    mem_pts = _append_end_time_point(mem_merged, end_ts)
    disk_merged = _merge_pct_with_used_gb(
        _parse_matrix_to_chart_points(disk_res),
        _parse_matrix_to_chart_points(disk_used_res),
    )
    disk_pts = _append_end_time_point(disk_merged, end_ts)
    net_pts = _append_end_time_point(_parse_matrix_to_chart_points(net_res), end_ts)
    net_tx_pts = _append_end_time_point(_parse_matrix_to_chart_points(net_tx_res), end_ts)
    return {
        "cpu": cpu_pts,
        "memory": mem_pts,
        "disk": disk_pts,
        "network": net_pts,
        "networkTransmit": net_tx_pts,
    }


def _parse_matrix_to_chart_points(res: Dict) -> List[Dict[str, Any]]:
    """Prometheus matrix result -> [{ time: "HH:mm", value: number }, ...]."""
    out = []
    if res.get("status") != "success" or res.get("data", {}).get("resultType") != "matrix":
        return out
    results = res.get("data", {}).get("result") or []
    if not results:
        return out
    values = results[0].get("values") or []
    for pair in values:
        if len(pair) < 2:
            continue
        ts, raw = pair[0], pair[1]
        try:
            t = int(float(ts))
            v = float(raw)
        except (TypeError, ValueError):
            continue
        from datetime import datetime
        dt = datetime.fromtimestamp(t)
        time_str = f"{dt.hour:02d}:{dt.minute:02d}"
        out.append({"time": time_str, "value": v})
    return out


def _append_end_time_point(points: List[Dict[str, Any]], end_ts: float) -> List[Dict[str, Any]]:
    """x축 오른쪽 끝이 요청 종료 시각(현재 시각)이 되도록 마지막 포인트 추가."""
    from datetime import datetime
    dt = datetime.fromtimestamp(end_ts)
    time_str = f"{dt.hour:02d}:{dt.minute:02d}"
    last_value = points[-1]["value"] if points else 0
    if points and points[-1].get("time") == time_str:
        return points
    extra: Dict[str, Any] = {"time": time_str, "value": last_value}
    if points and "usedGb" in points[-1]:
        extra["usedGb"] = points[-1]["usedGb"]
    return points + [extra]


def _merge_pct_with_used_gb(
    pct_points: List[Dict[str, Any]],
    used_gb_points: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    """동일 step으로 조회한 % 시계열과 used GB 시계열을 인덱스로 병합. [{ time, value, usedGb }, ...]."""
    out = []
    for i, p in enumerate(pct_points):
        row: Dict[str, Any] = {"time": p["time"], "value": p["value"]}
        if i < len(used_gb_points):
            try:
                row["usedGb"] = round(float(used_gb_points[i]["value"]), 2)
            except (TypeError, ValueError, KeyError):
                pass
        out.append(row)
    return out


def register_prometheus_routes(app):
    """Prometheus API 전용 라우트 (query, range-chart). SSE 스트림은 server_status에서 등록."""
    @app.get("/api/prometheus/range-chart")
    async def prometheus_range_chart(
        ip: str,
        start: str,
        end: str,
        step: Optional[str] = None,
    ):
        """단일 서버(IP)에 대한 CPU/Memory/Disk/Network 시계열. 상세 페이지 차트용."""
        if step is None:
            step = PROMETHEUS_STEP
        if not ip or ip == "-":
            return {"cpu": [], "memory": [], "disk": [], "network": [], "networkTransmit": []}

        def _parse_ts(s: str) -> Optional[float]:
            try:
                return float(s)
            except (TypeError, ValueError):
                pass
            try:
                from datetime import datetime
                return datetime.fromisoformat(s.replace("Z", "+00:00")).timestamp()
            except (TypeError, ValueError):
                return None
        start_ts = _parse_ts(start)
        end_ts = _parse_ts(end)
        if start_ts is None or end_ts is None:
            return {"cpu": [], "memory": [], "disk": [], "network": [], "networkTransmit": []}
        return await _fetch_range_chart_for_ip(ip, start_ts, end_ts, step)

    @app.get("/prometheus/range")
    async def prometheus_range(
        query: str,
        start: Optional[float] = None,
        end: Optional[float] = None,
        step: str = "15s",
    ):
        return await query_prometheus_range(query, start, end, step)
