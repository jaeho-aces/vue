# 네트워크 오류 해결 가이드

## ERR_CONNECTION_REFUSED 오류

이 오류는 프론트엔드가 백엔드 서버에 연결할 수 없을 때 발생합니다.

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

### 2. 환경 변수 확인

프론트엔드의 `.env.development` 파일을 확인하세요:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

또는 원격 서버를 사용하는 경우:

```env
VITE_API_BASE_URL=http://172.16.17.11:8000/api
```

**중요**: 환경 변수를 변경한 후에는 개발 서버를 재시작해야 합니다.

### 3. CORS 설정 확인

백엔드의 `backend/.env.development` 파일에서 CORS 설정을 확인하세요:

```env
CORS_ORIGINS=http://localhost:5173,http://172.16.17.11:5173
```

프론트엔드가 실행되는 URL을 CORS_ORIGINS에 포함해야 합니다.

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

## 일반적인 해결 방법

1. **백엔드 서버 실행**: `cd backend && python main.py`
2. **환경 변수 확인**: `.env.development` 파일 확인
3. **CORS 설정 확인**: 백엔드 `.env.development`의 CORS_ORIGINS 확인
4. **개발 서버 재시작**: 환경 변수 변경 후 `npm run dev` 재시작
5. **브라우저 콘솔 확인**: 네트워크 탭에서 실제 요청 URL 확인

## 디버깅 팁

브라우저 개발자 도구의 Network 탭에서:
- 실제 요청 URL 확인
- 응답 상태 코드 확인
- CORS 오류 메시지 확인

콘솔에서 다음 정보를 확인할 수 있습니다:
- API 기본 URL
- 요청 URL
- 에러 상세 정보



