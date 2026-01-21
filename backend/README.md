## FastAPI 백엔드 서버

PHP 백엔드를 FastAPI로 마이그레이션한 도로공사 영상변환 시스템 백엔드입니다.

### 설치

```bash
pip install -r requirements.txt
```

### 환경 변수 설정

`.env` 파일을 생성하거나 환경 변수를 설정합니다:

```env
DATABASE_URL=postgresql://user:password@host:port/database
```

### 실행

```bash
python main.py
```

또는:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### API 엔드포인트

#### 데이터 조회
- `POST /get-db-array` - PHP get-db-array.php와 동일한 기능
  - Body: `{ target: "/TABLE_NAME/", layout: [...], query: [], where: "", order: "" }`

#### REST API (CRUD)
- `GET /rest-access-page/{table_name}` - 데이터 조회
- `POST /rest-access-page/{table_name}` - 데이터 생성
- `PUT /rest-access-page/{table_name}` - 데이터 수정
- `DELETE /rest-access-page/{table_name}` - 데이터 삭제

#### 유틸리티
- `GET /health` - 헬스 체크
- `GET /tables` - 등록된 모든 테이블 목록 조회

### 테이블 스키마 관리

`tables.py` 파일에서 모든 테이블 스키마를 관리합니다. 도로공사 영상변환 시스템의 모든 MGMT_* 테이블이 정의되어 있습니다.

### 주요 기능

1. **테이블 기반 자동 CRUD**: URL에 테이블 이름을 포함하여 자동으로 CRUD 작업 수행
2. **복합 키 지원**: 단일 키 및 복합 키 모두 지원
3. **PostgreSQL 연결**: asyncpg를 사용한 비동기 데이터베이스 연결
4. **필드명 자동 변환**: 응답 데이터의 필드명을 소문자로 자동 변환

### PHP와의 호환성

- PHP `get-db-array.php`와 동일한 요청/응답 형식 지원
- PHP `rest-access-page.php`와 동일한 REST API 인터페이스 제공
- 기존 Vue.js 프론트엔드와 호환 가능
