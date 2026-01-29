import os
from typing import Any, Dict, List, Optional, Union
from fastapi import Request, HTTPException
from pydantic import BaseModel
from psycopg_pool import AsyncConnectionPool
from psycopg.rows import dict_row
from dotenv import load_dotenv
from tables import (
    TABLES,
    get_table_key as get_table_key_from_schema,
    is_table_exists as is_table_exists_in_schema
)

load_dotenv()

# PostgreSQL 연결 설정
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:acest@172.16.17.11:5432/postgres"
)

# 데이터베이스 연결 풀
db_pool: Optional[AsyncConnectionPool] = None


def init_db_pool():
    """데이터베이스 연결 풀을 초기화합니다."""
    global db_pool
    if db_pool is None:
        db_pool = AsyncConnectionPool(DATABASE_URL, min_size=1, max_size=10)
    return db_pool


async def close_db_pool():
    """데이터베이스 연결 풀을 종료합니다."""
    global db_pool
    if db_pool:
        await db_pool.close()
        db_pool = None


# PostgreSQL 헬퍼 함수들
def var_name(val: str) -> str:
    """컬럼명을 PostgreSQL 형식으로 변환"""
    if val == "*" or val == '*':
        return "*"
    # PostgreSQL은 기본적으로 소문자로 변환하므로 소문자로 변환
    return f'"{val.lower()}"'


def var_value(val: Any) -> str:
    """값을 PostgreSQL 형식으로 변환"""
    if val is None or val == '':
        return 'NULL'
    if isinstance(val, str):
        # 날짜 형식 처리 (YYYY-MM-DD HH:MM:SS)
        if len(val) == 19 and val[4] == '-' and val[7] == '-':
            return f"timestamp '{val}'"
        # 문자열 이스케이프
        escaped = val.replace("'", "''")
        return f"'{escaped}'"
    return str(val)


def format_table_name(table: str) -> str:
    """테이블명을 PostgreSQL 형식으로 변환"""
    # PostgreSQL은 기본적으로 소문자로 변환하므로 소문자로 변환
    return f'"{table.lower()}"'

# 하위 호환성을 위한 별칭
table_name = format_table_name


def get_field_list(layout: List[Dict]) -> str:
    """필드 목록 생성"""
    fields = []
    for item in layout:
        if isinstance(item, dict):
            if 'field' in item:
                field = item['field']
                if field == "*" or field == '*':
                    return "*"
                fields.append(var_name(field))
            elif 'subrow' in item:
                fields.append(get_field_list(item['subrow']))
        elif isinstance(item, list):
            fields.append(get_field_list(item))
    return ", ".join(fields) if fields else "*"


def get_conditions(table: str, vars: Dict, count: int = 1) -> str:
    """WHERE 절 생성"""
    conditions = []
    i = 0
    for key, val in vars.items():
        if key in ["dojo_preventCache", "SQL_ORDER"]:
            continue
        if i >= count:
            break
        conditions.append(f'{var_name(key)} = {var_value(val)}')
        i += 1
    return " AND ".join(conditions) if conditions else "1=1"


def get_quoted_order(order: str) -> str:
    """ORDER BY 절 생성"""
    if not order:
        return ""
    # '$'로 시작하면 그대로 사용
    if order.startswith('$'):
        return order[1:]
    # 콤마로 구분된 필드들을 처리
    parts = []
    for token in order.split(','):
        token = token.strip()
        if not token:
            continue
        # 공백으로 필드명과 정렬 방향 분리
        name_len = len(token.split()[0]) if ' ' in token else len(token)
        field_name = token[:name_len].strip()
        rest = token[name_len:].strip()
        parts.append(f'{var_name(field_name)}{rest}')
    return ", ".join(parts)


def get_cs_list(vars: Dict) -> str:
    """UPDATE SET 절 생성"""
    sets = []
    for key, val in vars.items():
        sets.append(f'{var_name(key)} = {var_value(val)}')
    return ", ".join(sets)


# DB에서 테이블 존재 여부 확인
async def is_table_exists(table_name: str) -> bool:
    """실제 DB에서 테이블 존재 여부 확인"""
    # 먼저 tables.py에 정의되어 있는지 확인
    if is_table_exists_in_schema(table_name):
        return True
    
    # DB에서 확인
    try:
        async with db_pool.connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute("""
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = 'public' 
                        AND LOWER(table_name) = LOWER(%s)
                    )
                """, (table_name,))
                result = await cur.fetchone()
                return result[0] if result else False
    except Exception:
        return False


# DB에서 PRIMARY KEY 조회
async def get_table_key(table_name: str) -> Union[str, List[str]]:
    """실제 DB에서 테이블의 PRIMARY KEY 조회"""
    # 먼저 tables.py에 정의되어 있으면 사용
    if is_table_exists_in_schema(table_name):
        try:
            return get_table_key_from_schema(table_name)
        except ValueError:
            pass  # tables.py에 없으면 DB에서 조회
    
    # DB에서 PRIMARY KEY 조회
    try:
        async with db_pool.connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute("""
                    SELECT column_name
                    FROM information_schema.table_constraints tc
                    JOIN information_schema.key_column_usage kcu
                      ON tc.constraint_name = kcu.constraint_name
                      AND tc.table_schema = kcu.table_schema
                    WHERE tc.table_schema = 'public'
                      AND LOWER(tc.table_name) = LOWER(%s)
                      AND tc.constraint_type = 'PRIMARY KEY'
                    ORDER BY kcu.ordinal_position
                """, (table_name,))
                rows = await cur.fetchall()
                
                if not rows:
                    raise ValueError(f"Table {table_name} has no PRIMARY KEY")
                
                keys = [row[0] for row in rows]
                
                # 단일 키면 문자열로, 복합 키면 리스트로 반환
                if len(keys) == 1:
                    return keys[0]
                else:
                    return keys
    except Exception as e:
        raise ValueError(f"Failed to get PRIMARY KEY for table {table_name}: {str(e)}")


# 요청 모델
class GetDbArrayRequest(BaseModel):
    target: str  # "/TABLE_NAME/" 형식
    layout: List[Any] = [{"field": "*"}]
    query: List[Any] = []
    where: str = ""
    order: str = ""


def register_database_routes(app):
    """데이터베이스 관련 엔드포인트를 FastAPI 앱에 등록합니다."""
    
    # get-db-array.php 기능
    @app.post("/get-db-array")
    async def get_db_array(request: GetDbArrayRequest):
        """
        PHP get-db-array.php와 동일한 기능
        POST /get-db-array
        Body: { target: "/TABLE_NAME/", layout: [...], query: [], where: "", order: "" }
        """
        try:
            # 테이블 이름 추출 (앞뒤 '/' 제거)
            table = request.target.strip('/')
            
            # 테이블 존재 확인
            if not await is_table_exists(table):
                raise HTTPException(status_code=404, detail=f"Table {table} not found")
            
            # 필드 목록 생성
            fields = get_field_list(request.layout)
            
            # WHERE 절 생성
            if request.where:
                condition = request.where
            else:
                # query를 처리하여 WHERE 절 생성
                # IN 절 처리: 같은 키에 대해 여러 값이 있으면 IN 절로 변환
                # 예: [{cctv_id: '1'}, {cctv_id: '2'}] -> cctv_id IN ('1', '2')
                key_values: Dict[str, List[Any]] = {}
                
                if isinstance(request.query, list):
                    # 리스트인 경우: 각 항목에서 키-값 쌍 추출
                    for item in request.query:
                        if isinstance(item, dict):
                            for key, val in item.items():
                                if key not in ["dojo_preventCache", "SQL_ORDER"]:
                                    if key not in key_values:
                                        key_values[key] = []
                                    if val not in key_values[key]:
                                        key_values[key].append(val)
                elif isinstance(request.query, dict):
                    # 딕셔너리인 경우: 기존 방식 사용
                    for key, val in request.query.items():
                        if key not in ["dojo_preventCache", "SQL_ORDER"]:
                            if key not in key_values:
                                key_values[key] = []
                            if val not in key_values[key]:
                                key_values[key].append(val)
                
                # 조건 생성
                conditions = []
                for key, values in key_values.items():
                    if len(values) > 1:
                        # 여러 값이면 IN 절 생성 (SQL Injection 방지: var_value 사용)
                        quoted_values = [var_value(val) for val in values]
                        conditions.append(f'{var_name(key)} IN ({", ".join(quoted_values)})')
                    elif len(values) == 1:
                        # 단일 값은 등호 조건 사용
                        conditions.append(f'{var_name(key)} = {var_value(values[0])}')
                
                condition = " AND ".join(conditions) if conditions else "1=1"
            
            # ORDER BY 절
            order_clause = ""
            if request.order:
                order_clause = f" ORDER BY {get_quoted_order(request.order)}"
            
            # SQL 생성
            where_clause = f" WHERE {condition}" if condition and condition != "1=1" else ""
            sql = f'SELECT {fields} FROM {format_table_name(table)}{where_clause}{order_clause}'
            
            # 쿼리 실행
            async with db_pool.connection() as conn:
                async with conn.cursor(row_factory=dict_row) as cur:
                    await cur.execute(sql)
                    rows = await cur.fetchall()
                    
                    # 결과를 딕셔너리 리스트로 변환 (필드명 소문자로)
                    result = []
                    for row in rows:
                        row_dict = {}
                        for key, value in row.items():
                            row_dict[key.lower()] = value
                        result.append(row_dict)
                    
                    return result
                
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    # rest-access-page.php 기능
    @app.get("/rest-access-page/{table_name}")
    async def rest_access_get(table_name: str, request: Request):
        """
        PHP rest-access-page.php GET 기능
        GET /rest-access-page/{table_name}?param1=value1&param2=value2
        """
        try:
            if not await is_table_exists(table_name):
                raise HTTPException(status_code=404, detail=f"Table {table_name} not found")
            
            # 쿼리 파라미터를 Dict로 변환
            query_params = dict(request.query_params)
            order = get_quoted_order(query_params.pop("SQL_ORDER", ""))
            
            # WHERE 절 생성
            condition = get_conditions(table_name, query_params, len(query_params))
            
            # SQL 생성
            order_clause = f" ORDER BY {order}" if order else ""
            sql = f'SELECT * FROM {format_table_name(table_name)} WHERE {condition}{order_clause}'
            
            # 쿼리 실행
            async with db_pool.connection() as conn:
                async with conn.cursor(row_factory=dict_row) as cur:
                    await cur.execute(sql)
                    rows = await cur.fetchall()
                    
                    result = []
                    for row in rows:
                        row_dict = {}
                        for key, value in row.items():
                            row_dict[key.lower()] = value
                        result.append(row_dict)
                    
                    return result
                
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.post("/rest-access-page/{table_name}")
    async def rest_access_post(table_name: str, request: Request):
        """
        PHP rest-access-page.php POST 기능
        POST /rest-access-page/{table_name}
        Body: { field1: value1, field2: value2, ... }
        """
        try:
            if not await is_table_exists(table_name):
                raise HTTPException(status_code=404, detail=f"Table {table_name} not found")
            
            body = await request.json()
            
            # INSERT 쿼리 생성
            keys = []
            values = []
            for key, val in body.items():
                keys.append(var_name(key))
                values.append(var_value(val))
            
            sql = f'INSERT INTO {format_table_name(table_name)} ({", ".join(keys)}) VALUES ({", ".join(values)}) RETURNING *'
            
            # 쿼리 실행
            async with db_pool.connection() as conn:
                async with conn.cursor(row_factory=dict_row) as cur:
                    await cur.execute(sql)
                    row = await cur.fetchone()
                    
                    result = {}
                    for key, value in row.items():
                        result[key.lower()] = value
                    
                    return result
                
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.put("/rest-access-page/{table_name}")
    async def rest_access_put(table_name: str, request: Request):
        """
        PHP rest-access-page.php PUT 기능
        PUT /rest-access-page/{table_name}
        Body: { key_field: key_value, field1: value1, ... }
        """
        try:
            if not await is_table_exists(table_name):
                raise HTTPException(status_code=404, detail=f"Table {table_name} not found")
            
            body = await request.json()
            table_key = await get_table_key(table_name)
            
            # 키 필드 추출
            if isinstance(table_key, list):
                # 복합 키
                keys = {}
                for key_field in table_key:
                    if key_field not in body:
                        raise HTTPException(status_code=400, detail=f"Key field {key_field} not found")
                    keys[key_field] = body[key_field]
            else:
                # 단일 키
                if table_key not in body:
                    raise HTTPException(status_code=400, detail=f"Key field {table_key} not found")
                keys = {table_key: body[table_key]}
            
            # 업데이트할 필드 추출 (키 필드 제외)
            update_fields = {k: v for k, v in body.items() if k not in keys}
            
            if not update_fields:
                raise HTTPException(status_code=400, detail="No fields to update")
            
            # UPDATE 쿼리 생성
            set_clause = get_cs_list(update_fields)
            where_clause = get_conditions(table_name, keys, len(keys))
            sql = f'UPDATE {format_table_name(table_name)} SET {set_clause} WHERE {where_clause} RETURNING *'
            
            # 쿼리 실행
            async with db_pool.connection() as conn:
                async with conn.cursor(row_factory=dict_row) as cur:
                    await cur.execute(sql)
                    row = await cur.fetchone()
                    
                    if not row:
                        raise HTTPException(status_code=404, detail="Record not found")
                    
                    result = {}
                    for key, value in row.items():
                        result[key.lower()] = value
                    
                    return result
                
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.delete("/rest-access-page/{table_name}")
    async def rest_access_delete(table_name: str, request: Request):
        """
        PHP rest-access-page.php DELETE 기능
        DELETE /rest-access-page/{table_name}?key=value
        또는 복합 키: DELETE /rest-access-page/{table_name}?key1=value1&key2=value2
        """
        try:
            if not await is_table_exists(table_name):
                raise HTTPException(status_code=404, detail=f"Table {table_name} not found")
            
            table_key = await get_table_key(table_name)
            query_params = dict(request.query_params)
            
            # 키 파라미터 처리
            if isinstance(table_key, list):
                # 복합 키
                keys = {}
                for key_field in table_key:
                    if key_field not in query_params:
                        raise HTTPException(status_code=400, detail=f"Key field {key_field} not found in query parameters")
                    keys[key_field] = query_params[key_field]
            else:
                # 단일 키
                if 'key' not in query_params:
                    raise HTTPException(status_code=400, detail="Key parameter not found")
                keys = {table_key: query_params['key']}
            
            # DELETE 쿼리 생성
            where_clause = get_conditions(table_name, keys, len(keys))
            sql = f'DELETE FROM {format_table_name(table_name)} WHERE {where_clause} RETURNING *'
            
            # 쿼리 실행
            async with db_pool.connection() as conn:
                async with conn.cursor(row_factory=dict_row) as cur:
                    await cur.execute(sql)
                    row = await cur.fetchone()
                    
                    if not row:
                        raise HTTPException(status_code=404, detail="Record not found")
                    
                    result = {}
                    for key, value in row.items():
                        result[key.lower()] = value
                    
                    return result
                
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.get("/health")
    async def health_check():
        """헬스 체크"""
        try:
            async with db_pool.connection() as conn:
                async with conn.cursor() as cur:
                    await cur.execute("SELECT 1")
            return {"status": "ok", "database": "connected"}
        except Exception as e:
            return {"status": "error", "database": str(e)}
    
    @app.get("/tables")
    async def list_tables():
        """등록된 모든 테이블 목록 반환 (tables.py에 정의된 테이블 + DB의 모든 테이블)"""
        # tables.py에 정의된 테이블
        schema_tables = [
            {
                "name": name,
                "key": schema.key,
                "comment": schema.comment,
                "field_count": len(schema.fields),
                "source": "schema"
            }
            for name, schema in TABLES.items()
        ]
        
        # DB의 모든 테이블 조회
        db_tables = []
        try:
            async with db_pool.connection() as conn:
                async with conn.cursor() as cur:
                    await cur.execute("""
                        SELECT table_name
                        FROM information_schema.tables
                        WHERE table_schema = 'public'
                        AND table_type = 'BASE TABLE'
                        ORDER BY table_name
                    """)
                    rows = await cur.fetchall()
                    
                    for row in rows:
                        table_name_db = row[0]
                        # tables.py에 없는 테이블만 추가
                        if not is_table_exists_in_schema(table_name_db):
                            try:
                                key = await get_table_key(table_name_db)
                                db_tables.append({
                                    "name": table_name_db,
                                    "key": key,
                                    "comment": "",
                                    "field_count": 0,
                                    "source": "database"
                                })
                            except Exception:
                                # PRIMARY KEY가 없거나 조회 실패한 경우
                                db_tables.append({
                                    "name": table_name_db,
                                    "key": None,
                                    "comment": "",
                                    "field_count": 0,
                                    "source": "database"
                                })
        except Exception as e:
            pass  # DB 조회 실패 시 무시
        
        return {
            "tables": schema_tables + db_tables
        }
