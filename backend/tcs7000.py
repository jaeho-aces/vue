"""
TCS7000 연동: 영상 변환 서버(JSON-RPC) 제어용 헬퍼 및 REST API.

- 외부 장비(TCS7000)에 JSON-RPC 요청을 보내는 역할만 담당한다.
- 실제 서버 IP/Port, tr_id 조회는 MGMT_TRANS 테이블을 통해 수행한다.
"""
import logging
import os
from typing import Any, Dict, Optional

import httpx
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel


logger = logging.getLogger("tcs7000")

TCS7000_PATH = os.getenv("TCS7000_PATH", "/tcs7000")
TCS7000_TIMEOUT = float(os.getenv("TCS7000_TIMEOUT_SEC", "5"))


async def _post_jsonrpc(ip: str, port: int, method: str, params: Dict[str, Any], request_id: int = 1) -> Dict[str, Any]:
    """
    단일 JSON-RPC 요청을 전송하고 응답을 반환한다.
    """
    if not ip or not port:
        raise HTTPException(status_code=400, detail="유효하지 않은 서버 IP 또는 포트입니다.")
    base = f"http://{ip}:{port}"
    url = f"{base}{TCS7000_PATH}"
    payload: Dict[str, Any] = {
        "jsonrpc": "2.0",
        "method": method,
        "param": params,
        "id": request_id,
    }
    logger.info("TCS7000 JSON-RPC 요청 전송: url=%s, method=%s, params=%s", url, method, params)
    try:
        async with httpx.AsyncClient(timeout=TCS7000_TIMEOUT) as client:
            res = await client.post(url, json=payload)
    except httpx.RequestError as e:
        logger.error("TCS7000 요청 오류: %s", e)
        raise HTTPException(status_code=502, detail=f"TCS7000 서버에 연결할 수 없습니다: {e}") from e

    if res.status_code != 200:
        logger.error("TCS7000 HTTP 상태 코드 오류: status=%s, body=%s", res.status_code, res.text)
        raise HTTPException(status_code=502, detail=f"TCS7000 응답 코드가 200이 아닙니다: {res.status_code}")

    try:
        data = res.json()
    except ValueError as e:
        logger.error("TCS7000 응답 JSON 파싱 실패: body=%s", res.text)
        raise HTTPException(status_code=502, detail="TCS7000 응답을 JSON으로 파싱할 수 없습니다.") from e

    if "error" in data and data["error"]:
        # JSON-RPC 표준 error 필드
        logger.error("TCS7000 JSON-RPC 오류 응답: %s", data["error"])
        raise HTTPException(status_code=502, detail=f"TCS7000 오류: {data['error']}")

    logger.info("TCS7000 JSON-RPC 응답 수신: %s", data)
    return data


async def stop_transcoder(ip: str, port: int, tr_id: str) -> Dict[str, Any]:
    """
    변환 서버 중지(tr_stop) 요청.
    """
    if not tr_id:
        raise HTTPException(status_code=400, detail="tr_id가 비어 있습니다.")
    params = {"tr_id": tr_id}
    return await _post_jsonrpc(ip, port, "tr_stop", params, request_id=1)


class TcsStopRequest(BaseModel):
    serverId: str  # MGMT_TRANS.TRANS_ID


def register_tcs_routes(app):
    """
    TCS7000 관련 REST 라우트 등록.
    """
    router = APIRouter()

    @router.post("/api/tcs/stop")
    async def tcs_stop(body: TcsStopRequest, request: Request):
        """
        선택한 영상 변환 서버의 tr_id 를 사용해 TCS7000에 tr_stop JSON-RPC 요청을 보낸다.

        - 입력: { "serverId": "<TRANS_ID>" }
        - 동작:
          1) MGMT_TRANS 에서 TRANS_ID 로 trans_ip, trans_port, trans_id 조회
          2) TCS7000 JSON-RPC tr_stop 호출
        """
        server_id = (body.serverId or "").strip()
        if not server_id:
            raise HTTPException(status_code=400, detail="serverId가 비어 있습니다.")

        logger.info("TCS7000 중지 요청 수신: serverId=%s", server_id)

        # 관리자만 호출 가능 (MGMT_TRANS 관리와 동일한 권한 정책 사용)
        try:
            from auth import get_current_user_from_request
        except ImportError:
            get_current_user_from_request = None

        if get_current_user_from_request:
            user_row = await get_current_user_from_request(request)
            group_name = (
                (user_row.get("group_name") or user_row.get("GROUP_NAME")) or ""
            ).strip().lower() if user_row else ""
            if group_name != "admin":
                raise HTTPException(status_code=403, detail="Admin role required for this resource")

        try:
            from database import db_pool, format_table_name, var_name
        except ImportError as e:
            raise HTTPException(status_code=500, detail=f"데이터베이스 모듈을 로드할 수 없습니다: {e}") from e

        if not db_pool:
            raise HTTPException(status_code=500, detail="데이터베이스 연결 풀이 초기화되지 않았습니다.")

        # MGMT_TRANS 에서 서버 정보 조회
        async with db_pool.connection() as conn:
            async with conn.cursor() as cur:
                table = format_table_name("mgmt_trans")
                col_id = var_name("trans_id")
                col_ip = var_name("trans_ip")
                col_port = var_name("trans_port")
                sql = f"SELECT {col_ip}, {col_port}, {col_id} FROM {table} WHERE {col_id} = {var_name('*').replace('*', '%s')}"
                await cur.execute(sql, (server_id,))
                row = await cur.fetchone()

        if not row:
            logger.warning("TCS7000 중지 요청: MGMT_TRANS 에서 서버를 찾을 수 없음: serverId=%s", server_id)
            raise HTTPException(status_code=404, detail=f"TRANS_ID '{server_id}' 에 해당하는 서버를 찾을 수 없습니다.")

        ip = (row[0] or "").strip() if row[0] is not None else ""
        port_raw: Optional[int] = row[1]
        tr_id = (row[2] or "").strip() if row[2] is not None else ""

        if not ip or not port_raw:
            logger.error("TCS7000 중지 요청: IP 또는 포트 정보 부족: serverId=%s, ip=%s, port=%s", server_id, ip, port_raw)
            raise HTTPException(status_code=400, detail="서버 IP 또는 포트 정보가 없습니다.")

        try:
            port = int(port_raw)
        except (TypeError, ValueError):
            logger.error("TCS7000 중지 요청: 포트 파싱 실패: raw=%s", port_raw)
            raise HTTPException(status_code=400, detail="서버 포트 정보가 올바르지 않습니다.")

        logger.info("TCS7000 중지 요청 실행: serverId=%s, tr_id=%s, ip=%s, port=%s", server_id, tr_id or server_id, ip, port)
        result = await stop_transcoder(ip, port, tr_id or server_id)
        logger.info("TCS7000 중지 요청 완료: serverId=%s, result=%s", server_id, result)

        # TCS7000 응답이 예외 없이 성공하면 MGMT_TRANS.alive 를 'n' 으로 갱신
        try:
            async with db_pool.connection() as conn:
                async with conn.cursor() as cur:
                    table = format_table_name("mgmt_trans")
                    col_id = var_name("trans_id")
                    col_alive = var_name("alive")
                    sql_update = f"UPDATE {table} SET {col_alive} = %s WHERE {col_id} = {var_name('*').replace('*', '%s')}"
                    await cur.execute(sql_update, ("n", server_id))
            logger.info("MGMT_TRANS.alive 갱신 완료: serverId=%s, alive=n", server_id)
        except Exception as e:
            # alive 업데이트 실패는 중지 요청 자체는 성공한 것으로 간주하고, 로그만 남긴다.
            logger.error("MGMT_TRANS.alive 갱신 중 오류: serverId=%s, error=%s", server_id, e)

        return {"ok": True, "result": result}

    app.include_router(router)

