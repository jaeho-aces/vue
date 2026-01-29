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

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

# 프로메테우스 관련 코드는 prometheus.py로 분리됨
from prometheus import register_prometheus_routes

# 데이터베이스 라우트 등록
register_database_routes(app)

# 프로메테우스 라우트 등록
register_prometheus_routes(app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
