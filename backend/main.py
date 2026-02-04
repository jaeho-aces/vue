import os
import sys
import asyncio

# Windows에서 SelectorEventLoop 사용 (psycopg 호환성)
# 리눅스/맥OS에서는 기본 이벤트 루프 사용
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Video Management System API")

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

@app.on_event("startup")
async def startup():
    from database import init_db_pool
    init_db_pool()

@app.on_event("shutdown")
async def shutdown():
    from database import close_db_pool
    from prometheus import close_prometheus_client
    await close_db_pool()
    await close_prometheus_client()

# 데이터베이스 관련 코드는 database.py로 분리됨

# 데이터베이스 관련 코드는 database.py로 분리됨
from database import register_database_routes
# 계정/인증 관련 코드는 auth.py로 분리됨
from auth import register_auth_routes

# 프로메테우스 관련 코드는 prometheus.py로 분리됨
from prometheus import register_prometheus_routes

# 인증 라우트 등록 (넌스 등)
register_auth_routes(app)
# 데이터베이스 라우트 등록
register_database_routes(app)

# 프로메테우스 라우트 등록
register_prometheus_routes(app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
