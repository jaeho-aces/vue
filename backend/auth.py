"""
계정/인증 관련 로직: 넌스 발급·검증, 비밀번호 bcrypt 해시.
passlib 대신 bcrypt 패키지를 직접 사용 (passlib과 bcrypt 4.1+ 호환 이슈 회피).
토큰은 httpOnly 쿠키로 전달 (XSS로부터 토큰 탈취 방지).
로그인: 클라이언트가 SHA-256(평문) 전송 → 서버는 DB의 bcrypt(SHA-256(평문))와 비교.
사용자 생성/수정 시 클라이언트가 이미 SHA-256(평문)을 보내므로 bcrypt만 적용해 저장.
"""
import os
import secrets
import time
from typing import Dict

import bcrypt
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse

BCRYPT_MAX_BYTES = 72


def _truncate_for_bcrypt(s: str) -> str:
    """bcrypt는 최대 72바이트만 허용. UTF-8 바이트 기준으로 자른다."""
    if not s:
        return s
    raw = s.encode("utf-8")
    if len(raw) <= BCRYPT_MAX_BYTES:
        return s
    return raw[:BCRYPT_MAX_BYTES].decode("utf-8", errors="replace")


def hash_password(plain: str) -> str:
    truncated = _truncate_for_bcrypt(plain)
    return bcrypt.hashpw(truncated.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    truncated = _truncate_for_bcrypt(plain)
    return bcrypt.checkpw(truncated.encode("utf-8"), hashed.encode("utf-8"))


# 넌스 캐시 (재전송 방지): nonce -> 만료 시각
_nonce_cache: Dict[str, float] = {}
NONCE_TTL_SECONDS = 60


def _store_nonce(nonce: str) -> None:
    _nonce_cache[nonce] = time.time() + NONCE_TTL_SECONDS


def consume_nonce(nonce: str) -> bool:
    now = time.time()
    expired = [k for k, v in _nonce_cache.items() if v < now]
    for k in expired:
        del _nonce_cache[k]
    if not nonce or nonce not in _nonce_cache:
        return False
    del _nonce_cache[nonce]
    return True


def process_mgmt_user_password_body(body: dict, table_name: str) -> None:
    """
    MGMT_USER 테이블에 대한 POST/PUT body에서 비밀번호가 있으면
    넌스 검증 후 bcrypt(SHA-256(평문)) 저장(로그인 검증과 동일), nonce 키 제거.
    body를 직접 수정한다. 조건에 해당하지 않으면 아무 작업도 하지 않는다.
    """
    if str(table_name).upper() != "MGMT_USER":
        return
    body_lower = {str(k).lower(): k for k in body.keys()}
    if "password" not in body_lower:
        return
    nonce = body.get("nonce") or body.get("NONCE")
    if not nonce:
        raise HTTPException(status_code=400, detail="NONCE required for password")
    if not consume_nonce(str(nonce)):
        raise HTTPException(status_code=400, detail="Invalid or expired nonce")
    pw_key = body_lower["password"]
    # 클라이언트가 이미 SHA-256(평문)을 보내므로 그대로 bcrypt만 적용 (로그인 검증과 일치)
    body[pw_key] = hash_password(str(body[pw_key]))
    for k in list(body.keys()):
        if str(k).lower() == "nonce":
            del body[k]
            break


# 로그인 발급 토큰 저장 (토큰 -> user_id). 추후 Redis 등으로 교체 가능.
_login_tokens: Dict[str, str] = {}

# httpOnly 쿠키 이름 및 설정
AUTH_COOKIE_NAME = "session_token"
AUTH_COOKIE_MAX_AGE = 86400 * 7  # 7일


async def _get_user_by_user_id(user_id: str) -> dict | None:
    """DB에서 user_id로 사용자 한 명 조회. 없으면 None."""
    from database import db_pool
    from psycopg.rows import dict_row
    if not db_pool:
        return None
    async with db_pool.connection() as conn:
        async with conn.cursor(row_factory=dict_row) as cur:
            await cur.execute(
                "SELECT user_id, user_name, email FROM mgmt_user WHERE TRIM(user_id) = TRIM(%s)",
                (user_id,),
            )
            return await cur.fetchone()


def register_auth_routes(app):
    """인증 관련 엔드포인트를 FastAPI 앱에 등록합니다."""

    @app.get("/auth/nonce")
    @app.get("/api/auth/nonce")
    async def get_nonce():
        """비밀번호 전송 시 재전송 방지용 넌스 발급."""
        nonce = secrets.token_hex(32)
        _store_nonce(nonce)
        return {"nonce": nonce}

    @app.post("/auth/login")
    @app.post("/api/auth/login")
    async def login(request: Request):
        """
        로그인. Body: { user_id, password, nonce }
        password는 클라이언트에서 SHA-256 해시한 hex 문자열.
        """
        import logging
        try:
            body = await request.json()
        except Exception as e:
            logging.warning("login: request body parse failed: %s", e)
            raise HTTPException(status_code=400, detail="Invalid JSON body")
        user_id = (body.get("user_id") or body.get("USER_ID") or "").strip()
        password = body.get("password") or body.get("PASSWORD")
        nonce = body.get("nonce") or body.get("NONCE")
        if not user_id:
            raise HTTPException(status_code=400, detail="user_id required")
        if not password:
            raise HTTPException(status_code=400, detail="password required")
        if not nonce:
            raise HTTPException(status_code=400, detail="NONCE required for login")
        if not consume_nonce(str(nonce)):
            raise HTTPException(status_code=400, detail="Invalid or expired nonce")
        # DB에서 사용자 조회 (순환 임포트 방지를 위해 라우트 내부에서 import)
        from database import db_pool
        from psycopg.rows import dict_row
        if not db_pool:
            raise HTTPException(status_code=503, detail="Database not available")
        try:
            async with db_pool.connection() as conn:
                async with conn.cursor(row_factory=dict_row) as cur:
                    await cur.execute(
                        'SELECT user_id, user_name, email, password FROM mgmt_user WHERE TRIM(user_id) = TRIM(%s)',
                        (user_id,),
                    )
                    row = await cur.fetchone()
        except Exception as e:
            logging.exception("login: database error for user_id=%s: %s", user_id, e)
            raise HTTPException(status_code=503, detail="Database error")
        if not row:
            raise HTTPException(status_code=401, detail="Invalid user_id or password")
        stored_hash = (row.get("password") or row.get("PASSWORD") or "").strip()
        if not verify_password(str(password), stored_hash):
            raise HTTPException(status_code=401, detail="Invalid user_id or password")
        token = secrets.token_hex(32)
        _login_tokens[token] = user_id
        user_payload = {
            "id": row.get("user_id") or row.get("USER_ID") or user_id,
            "name": (row.get("user_name") or row.get("USER_NAME") or "").strip(),
            "email": (row.get("email") or row.get("EMAIL") or "").strip() or "",
        }
        response = JSONResponse(content={"user": user_payload})
        secure = os.getenv("AUTH_COOKIE_SECURE", "false").lower() in ("1", "true", "yes")
        response.set_cookie(
            key=AUTH_COOKIE_NAME,
            value=token,
            max_age=AUTH_COOKIE_MAX_AGE,
            httponly=True,
            secure=secure,
            samesite="lax",
            path="/",
        )
        return response

    @app.get("/auth/me")
    @app.get("/api/auth/me")
    async def get_me(request: Request):
        """쿠키의 토큰으로 현재 로그인 사용자 정보 반환. 없거나 무효면 401."""
        token = request.cookies.get(AUTH_COOKIE_NAME)
        if not token or token not in _login_tokens:
            raise HTTPException(status_code=401, detail="Not authenticated")
        user_id = _login_tokens[token]
        row = await _get_user_by_user_id(user_id)
        if not row:
            del _login_tokens[token]
            raise HTTPException(status_code=401, detail="User not found")
        return {
            "user": {
                "id": row.get("user_id") or row.get("USER_ID") or user_id,
                "name": (row.get("user_name") or row.get("USER_NAME") or "").strip(),
                "email": (row.get("email") or row.get("EMAIL") or "").strip() or "",
            },
        }

    @app.post("/auth/logout")
    @app.post("/api/auth/logout")
    async def logout(request: Request):
        """쿠키 삭제 후 로그아웃 처리."""
        token = request.cookies.get(AUTH_COOKIE_NAME)
        if token and token in _login_tokens:
            del _login_tokens[token]
        response = JSONResponse(content={"ok": True})
        response.delete_cookie(key=AUTH_COOKIE_NAME, path="/")
        return response
