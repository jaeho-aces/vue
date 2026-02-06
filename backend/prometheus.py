import os
import asyncio
import time
import json
from typing import Any, Dict, Optional
import httpx
from fastapi import Request
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv

load_dotenv()

# 프로메테우스 서버 URL 설정
PROMETHEUS_URL = os.getenv(
    "PROMETHEUS_URL"
)

# 프로메테우스 HTTP 클라이언트 (재사용)
_prometheus_client: Optional[httpx.AsyncClient] = None


async def get_prometheus_client() -> httpx.AsyncClient:
    """프로메테우스 HTTP 클라이언트를 가져오거나 생성합니다."""
    global _prometheus_client
    if _prometheus_client is None:
        _prometheus_client = httpx.AsyncClient(
            timeout=httpx.Timeout(10.0, connect=5.0),
            limits=httpx.Limits(max_keepalive_connections=5, max_connections=10)
        )
    return _prometheus_client


async def close_prometheus_client():
    """프로메테우스 HTTP 클라이언트를 종료합니다."""
    global _prometheus_client
    if _prometheus_client:
        await _prometheus_client.aclose()
        _prometheus_client = None


# 프로메테우스 쿼리 함수
async def query_prometheus(query: str) -> Dict[str, Any]:
    """
    프로메테우스 서버에 PromQL 쿼리를 실행합니다.
    
    Args:
        query: PromQL 쿼리 문자열
        
    Returns:
        프로메테우스 API 응답 딕셔너리
    """
    client = await get_prometheus_client()
    try:
        url = f"{PROMETHEUS_URL}/api/v1/query"
        params = {"query": query}
        response = await client.get(url, params=params)
        response.raise_for_status()
        result = response.json()
        # status 필드가 없으면 추가
        if "status" not in result:
            result["status"] = "success"
        return result
    except httpx.TimeoutException:
        return {
            "status": "error",
            "error": f"프로메테우스 서버 응답 시간 초과 (URL: {PROMETHEUS_URL})",
            "errorType": "timeout",
            "query": query
        }
    except httpx.ConnectError as e:
        return {
            "status": "error",
            "error": f"프로메테우스 서버 연결 실패: {PROMETHEUS_URL}에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.",
            "errorType": "connection_error",
            "query": query,
            "details": str(e)
        }
    except httpx.RequestError as e:
        return {
            "status": "error",
            "error": f"프로메테우스 서버 요청 실패: {str(e)}",
            "errorType": "request_error",
            "query": query,
            "details": str(e)
        }
    except httpx.HTTPStatusError as e:
        return {
            "status": "error",
            "error": f"프로메테우스 서버 HTTP 오류: {e.response.status_code} {e.response.text[:200]}",
            "errorType": "http_error",
            "query": query,
            "statusCode": e.response.status_code
        }
    except Exception as e:
        return {
            "status": "error",
            "error": f"프로메테우스 쿼리 실행 실패: {str(e)}",
            "errorType": "unknown",
            "query": query,
            "details": str(e)
        }


# 프로메테우스 Range Query 함수
async def query_prometheus_range(
    query: str,
    start: Optional[float] = None,
    end: Optional[float] = None,
    step: str = "15s"
) -> Dict[str, Any]:
    """
    프로메테우스 Range Query를 실행합니다.
    
    Args:
        query: PromQL 쿼리 문자열
        start: 시작 시간 (Unix timestamp), None이면 현재 시간 - 5분
        end: 종료 시간 (Unix timestamp), None이면 현재 시간
        step: 샘플링 간격 (예: "15s", "1m")
    
    Returns:
        Range Query 결과
    """
    client = await get_prometheus_client()
    
    # 기본값 설정
    if end is None:
        end = time.time()
    if start is None:
        start = end - 300  # 5분 전
    
    try:
        url = f"{PROMETHEUS_URL}/api/v1/query_range"
        params = {
            "query": query,
            "start": start,
            "end": end,
            "step": step
        }
        response = await client.get(url, params=params)
        response.raise_for_status()
        result = response.json()
        if "status" not in result:
            result["status"] = "success"
        return result
    except httpx.TimeoutException:
        return {
            "status": "error",
            "error": f"프로메테우스 서버 응답 시간 초과 (URL: {PROMETHEUS_URL})",
            "errorType": "timeout"
        }
    except httpx.ConnectError as e:
        return {
            "status": "error",
            "error": f"프로메테우스 서버 연결 실패: {PROMETHEUS_URL}에 연결할 수 없습니다.",
            "errorType": "connection_error",
            "details": str(e)
        }
    except httpx.RequestError as e:
        return {
            "status": "error",
            "error": f"프로메테우스 서버 요청 실패: {str(e)}",
            "errorType": "request_error",
            "details": str(e)
        }
    except httpx.HTTPStatusError as e:
        return {
            "status": "error",
            "error": f"프로메테우스 서버 HTTP 오류: {e.response.status_code} {e.response.text[:200]}",
            "errorType": "http_error",
            "statusCode": e.response.status_code
        }
    except Exception as e:
        return {
            "status": "error",
            "error": f"프로메테우스 Range Query 실행 실패: {str(e)}",
            "errorType": "unknown",
            "details": str(e)
        }


# 프로메테우스 수집할 지표 목록 (사용량 계산 쿼리)
PROMETHEUS_QUERIES = [
    "node_cpu_seconds_total{mode=\"idle\"}",  # CPU idle 시간
    "(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100",  # Memory 사용률 (%)
    "rate(node_network_receive_bytes_total[1m])",  # Network 수신 속도 (bytes/s)
    "rate(node_network_transmit_bytes_total[1m])"   # Network 송신 속도 (bytes/s)
]

# Range Query용 쿼리 (과거 데이터 조회)
PROMETHEUS_RANGE_QUERIES = {
    "cpu_usage": "node_cpu_seconds_total{mode=\"idle\"}",
    "memory_usage": "(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100",
    "network_receive": "rate(node_network_receive_bytes_total[1m])",
    "network_transmit": "rate(node_network_transmit_bytes_total[1m])"
}


def register_prometheus_routes(app):
    """프로메테우스 관련 엔드포인트를 FastAPI 앱에 등록합니다."""
    
    # SSE 스트리밍 엔드포인트
    @app.get("/prometheus/stream")
    async def prometheus_stream(request: Request):
        """
        프로메테우스 지표를 SSE로 실시간 스트리밍합니다.
        5초 간격으로 프로메테우스에 쿼리를 실행하고 결과를 전송합니다.
        연결 실패 시에도 에러 정보를 포함하여 계속 전송합니다.
        """
        async def event_generator():
            try:
                # 초기 연결 정보 전송
                initial_data = {
                    "timestamp": time.time(),
                    "type": "connection_info",
                    "prometheus_url": PROMETHEUS_URL,
                    "queries": PROMETHEUS_QUERIES,
                    "message": "프로메테우스 SSE 스트림 시작"
                }
                yield f"data: {json.dumps(initial_data, ensure_ascii=False)}\n\n"
                
                while True:
                    # 클라이언트 연결 확인
                    if await request.is_disconnected():
                        break
                    
                    try:
                        # 모든 쿼리 실행
                        results = {}
                        has_error = False
                        
                        for query in PROMETHEUS_QUERIES:
                            result = await query_prometheus(query)
                            results[query] = result
                            # 에러가 있는지 확인
                            if result.get("status") == "error":
                                has_error = True
                        
                        # SSE 형식으로 데이터 전송
                        data = {
                            "timestamp": time.time(),
                            "queries": results,
                            "has_error": has_error,
                            "prometheus_url": PROMETHEUS_URL
                        }
                        
                        yield f"data: {json.dumps(data, ensure_ascii=False)}\n\n"
                        
                    except Exception as e:
                        # 개별 쿼리 실행 중 에러 발생 시에도 계속 진행
                        error_data = {
                            "timestamp": time.time(),
                            "type": "query_error",
                            "error": str(e),
                            "message": "쿼리 실행 중 오류 발생, 계속 시도합니다."
                        }
                        yield f"data: {json.dumps(error_data, ensure_ascii=False)}\n\n"
                    
                    # 5초 대기
                    await asyncio.sleep(5)
                    
            except asyncio.CancelledError:
                # 클라이언트 연결이 끊어졌을 때
                pass
            except Exception as e:
                # 치명적 에러 발생 시 에러 메시지 전송
                error_data = {
                    "timestamp": time.time(),
                    "type": "fatal_error",
                    "error": str(e),
                    "message": "SSE 스트림 오류 발생"
                }
                yield f"data: {json.dumps(error_data, ensure_ascii=False)}\n\n"
        
        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )
    
    # Range Query 엔드포인트 (과거 데이터 조회)
    @app.get("/prometheus/range")
    async def prometheus_range(
        query: str,
        start: Optional[float] = None,
        end: Optional[float] = None,
        step: str = "15s"
    ):
        """
        프로메테우스 Range Query를 실행합니다.
        
        Args:
            query: PromQL 쿼리 문자열
            start: 시작 시간 (Unix timestamp), None이면 현재 시간 - 5분
            end: 종료 시간 (Unix timestamp), None이면 현재 시간
            step: 샘플링 간격 (예: "15s", "1m")
        
        Returns:
            Range Query 결과
        """
        return await query_prometheus_range(query, start, end, step)
    
    # 초기 데이터 로드 엔드포인트 (모든 메트릭의 최근 5분 데이터)
    @app.get("/prometheus/initial-data")
    async def prometheus_initial_data():
        """
        페이지 로드 시 최근 5분간의 모든 메트릭 데이터를 반환합니다.
        """
        end_time = time.time()
        start_time = end_time - 300  # 5분 전
        
        results = {}
        for metric_name, query in PROMETHEUS_RANGE_QUERIES.items():
            result = await query_prometheus_range(query, start_time, end_time, "15s")
            results[metric_name] = result
        
        return {
            "status": "success",
            "start_time": start_time,
            "end_time": end_time,
            "metrics": results
        }
