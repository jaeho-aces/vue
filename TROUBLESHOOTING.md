# 트러블슈팅 가이드

## 네트워크 오류

### ERR_CONNECTION_REFUSED 오류

프론트엔드가 백엔드 서버에 연결할 수 없을 때 발생합니다.

### 1. 백엔드 서버 실행 확인

백엔드 서버가 실행 중인지 확인하세요:

```bash
cd backend
python main.py
```

또는:

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

서버가 정상적으로 실행되면 다음과 같은 메시지가 표시됩니다:
```
Starting Video Management API v1.0.0
Environment: development
Database URL: ...
Database initialized successfully
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 2. Vite 프록시 설정 확인

`vite.config.ts`에서 프록시 설정을 확인하세요:

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
```

프록시가 `/api` 경로를 `http://localhost:8000`으로 전달합니다.

**중요**: 프록시 설정을 변경한 경우 개발 서버를 재시작해야 합니다.

### 3. CORS 설정 확인

FastAPI 백엔드에서 CORS가 올바르게 설정되어 있는지 확인하세요. `backend/main.py`에서 CORS 설정을 확인할 수 있습니다.

### 4. 네트워크 연결 확인

원격 서버를 사용하는 경우:

1. 서버가 실행 중인지 확인
2. 방화벽 설정 확인
3. 네트워크 연결 확인

```bash
# 서버 연결 테스트
curl http://172.16.17.11:8000/health
```

### 5. 포트 충돌 확인

다른 프로세스가 8000 포트를 사용하고 있는지 확인:

```bash
# Windows
netstat -ano | findstr :8000

# Linux/Mac
lsof -i :8000
```

### 6. 개발 서버 재시작

환경 변수를 변경한 경우 반드시 개발 서버를 재시작하세요:

```bash
# 개발 서버 중지 (Ctrl+C)
# 그 다음 다시 시작
npm run dev
```

## 데이터베이스 오류

### "relation does not exist" 오류

테이블이 존재하지 않는다는 오류입니다.

**해결 방법:**
1. `backend/tables.py`에 테이블 스키마가 정의되어 있는지 확인
2. PostgreSQL에서 실제 테이블이 존재하는지 확인
3. 테이블명 대소문자 확인 (PostgreSQL은 소문자로 저장됨)

### "column does not exist" 오류

컬럼이 존재하지 않는다는 오류입니다.

**해결 방법:**
1. `backend/tables.py`의 테이블 스키마에서 컬럼명 확인
2. PostgreSQL에서 실제 컬럼명 확인 (소문자로 저장됨)
3. FastAPI가 자동으로 소문자 변환하므로 대문자로 전달해도 됨

## 필드명 매핑 오류

### 프론트엔드에서 데이터가 표시되지 않음

백엔드 필드명과 프론트엔드 필드명이 일치하지 않을 수 있습니다.

**해결 방법:**
1. 스토어의 `transformFromAPI` 함수 확인
2. 백엔드 응답 필드명 확인 (브라우저 콘솔)
3. 필드명 매핑 추가:

```typescript
transformFromAPI(data: any): MyType {
  return {
    frontendField: data.backend_field || data.BACKEND_FIELD,
    // ...
  }
}
```

## 일반적인 해결 방법

1. **백엔드 서버 실행**: `cd backend && python main.py`
2. **FastAPI 서버 확인**: `http://localhost:8000/health` 접속 테스트
3. **Vite 프록시 확인**: `vite.config.ts`의 프록시 설정 확인
4. **개발 서버 재시작**: 설정 변경 후 `npm run dev` 재시작
5. **브라우저 콘솔 확인**: 네트워크 탭에서 실제 요청 URL 및 에러 확인

## 디버깅 팁

### 브라우저 개발자 도구

**Network 탭:**
- 실제 요청 URL 확인 (`/api/get-db-array`)
- 응답 상태 코드 확인 (200, 404, 500 등)
- CORS 오류 메시지 확인
- 응답 데이터 확인

**Console 탭:**
- API 요청/응답 로그 확인 (개발 환경에서 자동 로깅)
- 에러 스택 트레이스 확인
- 스토어 상태 확인

### Vue DevTools

- Pinia 스토어 상태 확인
- 컴포넌트 props/state 확인
- 반응성 추적

### 백엔드 로그

FastAPI 서버 콘솔에서:
- SQL 쿼리 확인
- 에러 메시지 확인
- 요청/응답 로그 확인



