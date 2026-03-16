import os
import sys
import asyncio
from contextlib import asynccontextmanager

# Windows에서 SelectorEventLoop 사용 (psycopg 호환성)
# 리눅스/맥OS에서는 기본 이벤트 루프 사용
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """앱 시작 시 DB 풀 초기화, 종료 시 정리."""
    from database import init_db_pool, open_db_pool, close_db_pool
    init_db_pool()
    await open_db_pool()
    yield
    from prometheus import close_prometheus_client
    await close_db_pool()
    await close_prometheus_client()


app = FastAPI(title="Video Management System API", lifespan=lifespan)

# CORS: credentials(쿠키) 사용 시 allow_origins는 * 불가. 프론트 출처를 명시해야 쿠키가 유지됨.
_cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").strip()
if _cors_origins:
    _origins_list = [o.strip() for o in _cors_origins.split(",") if o.strip()]
else:
    _origins_list = ["http://localhost:5173", "http://127.0.0.1:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 데이터베이스 관련 코드는 database.py로 분리됨
# 프로메테우스 관련 코드는 prometheus.py로 분리됨

# 데이터베이스 관련 코드는 database.py로 분리됨
from database import register_database_routes
# 계정/인증 관련 코드는 auth.py로 분리됨
from auth import register_auth_routes

# 프로메테우스 API는 prometheus.py, 서버별 현황 SSE는 server_status.py, TCS7000 제어는 tcs7000.py
from prometheus import register_prometheus_routes
from server_status import register_server_status_routes
from tcs7000 import register_tcs_routes

# 인증 라우트 등록 (넌스 등)
register_auth_routes(app)
# 데이터베이스 라우트 등록
register_database_routes(app)

# 프로메테우스 라우트 등록 (range-chart 등)
register_prometheus_routes(app)
# 서버별 현황 SSE 스트림 등록
register_server_status_routes(app)
# TCS7000 제어 라우트 등록
register_tcs_routes(app)

if __name__ == "__main__":
    import logging
    import uvicorn

    class SuppressAuthMe401(logging.Filter):
        """GET /api/auth/me 401은 비로그인 시 정상이므로 액세스 로그에서 제외."""
        def filter(self, record: logging.LogRecord) -> bool:
            msg = (record.getMessage() or "")
            if "401" in msg and "/api/auth/me" in msg and "GET" in msg:
                return False
            return True

    logging.getLogger("uvicorn.access").addFilter(SuppressAuthMe401())
    uvicorn.run(app, host="0.0.0.0", port=8000)
