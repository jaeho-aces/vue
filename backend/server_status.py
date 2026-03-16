"""
서버별 현황: DB에서 서버 목록·alive 조회 + Prometheus 메트릭과 조합해 SSE 스트림 제공.
Prometheus API 호출은 prometheus 모듈에 위임한다.
"""
import asyncio
import json
from typing import Any, Dict, List, Optional

from fastapi import Request
from fastapi.responses import StreamingResponse

try:
    POLL_INTERVAL_SEC = int(__import__("os").environ.get("PROMETHEUS_POLL_INTERVAL_SEC") or "60")
except (TypeError, ValueError):
    POLL_INTERVAL_SEC = 60

# SSE 연결된 클라이언트별 (큐, optional_ip, optional_range)
_sse_queues: List[tuple] = []
_poll_task: Optional[asyncio.Task] = None


def _parse_ts_param(s: Optional[str]) -> Optional[float]:
    """Query param start/end -> timestamp (float) or None."""
    if s is None or str(s).strip() == "":
        return None
    s = str(s).strip()
    try:
        return float(s)
    except (TypeError, ValueError):
        pass
    try:
        from datetime import datetime
        return datetime.fromisoformat(s.replace("Z", "+00:00")).timestamp()
    except (TypeError, ValueError):
        return None


async def get_server_ips_from_db() -> List[str]:
    """MGMT_TRANS.trans_ip, MGMT_FMS.fms_ip from DB (unique list)."""
    try:
        from database import db_pool
        from database import format_table_name, var_name
    except ImportError:
        return []
    if not db_pool:
        return []
    ips = []
    for table, col in [("mgmt_trans", "trans_ip"), ("mgmt_fms", "fms_ip")]:
        try:
            async with db_pool.connection() as conn:
                async with conn.cursor() as cur:
                    await cur.execute(
                        f"SELECT {var_name(col)} FROM {format_table_name(table)} WHERE {var_name(col)} IS NOT NULL AND TRIM({var_name(col)}) != ''"
                    )
                    rows = await cur.fetchall()
                    for row in rows:
                        if row and row[0]:
                            ip = (row[0] or "").strip()
                            if ip:
                                ips.append(ip)
        except Exception:
            continue
    return list(dict.fromkeys(ips))


async def get_server_alive_by_ip_from_db() -> Dict[str, str]:
    """MGMT_TRANS(trans_ip, alive), MGMT_FMS(fms_ip, alive) from DB. IP -> 'y' or 'n'."""
    try:
        from database import db_pool
        from database import format_table_name, var_name
    except ImportError:
        return {}
    if not db_pool:
        return {}
    out: Dict[str, str] = {}
    for table, ip_col in [("mgmt_trans", "trans_ip"), ("mgmt_fms", "fms_ip")]:
        try:
            async with db_pool.connection() as conn:
                async with conn.cursor() as cur:
                    await cur.execute(
                        f"SELECT {var_name(ip_col)}, {var_name('alive')} FROM {format_table_name(table)} WHERE {var_name(ip_col)} IS NOT NULL AND TRIM({var_name(ip_col)}) != ''"
                    )
                    rows = await cur.fetchall()
                    for row in rows:
                        if row and row[0]:
                            ip = (row[0] or "").strip()
                            if ip:
                                raw = row[1] if len(row) > 1 else None
                                out[ip] = "y" if (raw and str(raw).strip().lower() == "y") else "n"
        except Exception:
            continue
    return out


async def _sse_poll_loop():
    """SSE 연결이 1명 이상일 때만 주기적으로 DB(alive) + Prometheus(메트릭) 조회 후 전송."""
    from prometheus import (
        fetch_instant_metrics_for_ips,
        _fetch_range_chart_for_ip,
    )
    from prometheus import PROMETHEUS_STEP

    while _sse_queues:
        try:
            has_list_client = any(client_ip is None for _, client_ip, _ in _sse_queues)
            if has_list_client:
                ips = await get_server_ips_from_db()
            else:
                ips = list({client_ip for _, client_ip, _ in _sse_queues if client_ip})
            metrics_by_ip = await fetch_instant_metrics_for_ips(ips) if ips else {}
            alive_by_ip = await get_server_alive_by_ip_from_db()
            dead = []
            for q, client_ip, range_params in _sse_queues:
                if range_params and client_ip:
                    start_ts = range_params.get("start")
                    end_ts = range_params.get("end")
                    step = range_params.get("step") or PROMETHEUS_STEP
                    if start_ts is not None and end_ts is not None:
                        range_chart = await _fetch_range_chart_for_ip(client_ip, start_ts, end_ts, step)
                    else:
                        range_chart = {"cpu": [], "memory": [], "disk": [], "network": [], "networkTransmit": []}
                    one_metrics = {client_ip: metrics_by_ip.get(client_ip)} if metrics_by_ip.get(client_ip) else {}
                    payload = {"type": "detail", "metricsByIp": one_metrics, "rangeChart": range_chart, "aliveByIp": alive_by_ip}
                elif client_ip is None:
                    payload = {"type": "metrics", "metricsByIp": metrics_by_ip, "aliveByIp": alive_by_ip}
                else:
                    one = {client_ip: metrics_by_ip.get(client_ip)} if metrics_by_ip.get(client_ip) else {}
                    payload = {"type": "metrics", "metricsByIp": one, "aliveByIp": alive_by_ip}
                msg = f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"
                try:
                    q.put_nowait(msg)
                except asyncio.QueueFull:
                    dead.append((q, client_ip, range_params))
                except Exception:
                    dead.append((q, client_ip, range_params))
            for item in dead:
                if item in _sse_queues:
                    _sse_queues.remove(item)
        except asyncio.CancelledError:
            break
        except Exception:
            pass
        await asyncio.sleep(POLL_INTERVAL_SEC)


def _start_poll_task_if_needed():
    global _poll_task
    if _sse_queues and (_poll_task is None or _poll_task.done()):
        _poll_task = asyncio.create_task(_sse_poll_loop())


def _stop_poll_task_if_no_clients():
    global _poll_task
    if not _sse_queues and _poll_task and not _poll_task.done():
        _poll_task.cancel()
        _poll_task = None


def _remove_queue_from_sse_queues(queue: asyncio.Queue):
    global _sse_queues
    _sse_queues = [(q, ip, r) for q, ip, r in _sse_queues if q is not queue]


def register_server_status_routes(app):
    """서버별 현황 SSE 스트림 라우트 등록."""
    from prometheus import (
        fetch_instant_metrics_for_ips,
        _fetch_range_chart_for_ip,
        PROMETHEUS_STEP,
    )

    @app.get("/api/prometheus/stream")
    async def prometheus_stream(request: Request):
        """SSE: 연결된 동안만 주기적으로 DB(alive) + Prometheus(메트릭) 조회 후 전송. ?ip=&start=&end=&step= 시 상세(instant+rangeChart)."""
        client_ip: Optional[str] = request.query_params.get("ip")
        if client_ip:
            client_ip = client_ip.strip() or None
        start_s = request.query_params.get("start")
        end_s = request.query_params.get("end")
        step_s = (request.query_params.get("step") or PROMETHEUS_STEP).strip() or PROMETHEUS_STEP
        start_ts = _parse_ts_param(start_s)
        end_ts = _parse_ts_param(end_s)
        range_params: Optional[Dict[str, Any]] = None
        if client_ip and start_ts is not None and end_ts is not None:
            range_params = {"start": start_ts, "end": end_ts, "step": step_s}
        queue: asyncio.Queue = asyncio.Queue(maxsize=8)
        _sse_queues.append((queue, client_ip, range_params))
        _start_poll_task_if_needed()
        if range_params and client_ip:
            try:
                range_chart = await _fetch_range_chart_for_ip(
                    client_ip, range_params["start"], range_params["end"], range_params["step"]
                )
                one_metrics = await fetch_instant_metrics_for_ips([client_ip])
                alive_by_ip = await get_server_alive_by_ip_from_db()
                payload = {"type": "detail", "metricsByIp": one_metrics, "rangeChart": range_chart, "aliveByIp": alive_by_ip}
                msg = f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"
                queue.put_nowait(msg)
            except Exception:
                pass

        async def event_gen():
            try:
                yield f"data: {json.dumps({'type': 'connected'}, ensure_ascii=False)}\n\n"
                while True:
                    if await request.is_disconnected():
                        break
                    try:
                        msg = await asyncio.wait_for(queue.get(), timeout=30.0)
                        yield msg
                    except asyncio.TimeoutError:
                        yield ": keepalive\n\n"
                    except asyncio.CancelledError:
                        break
            finally:
                _remove_queue_from_sse_queues(queue)
                _stop_poll_task_if_no_clients()

        return StreamingResponse(
            event_gen(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )
