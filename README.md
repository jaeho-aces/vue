# Video Management System

Vue 3 + TypeScript + FastAPI + PostgreSQL 기반의 영상 관리 시스템입니다.

## 프로젝트 구조

```
.
├── backend/          # FastAPI 백엔드
├── src/              # Vue 3 프론트엔드
├── .env.example      # 환경 변수 예제
└── README.md
```

## 사전 요구사항

- Node.js 18+ 및 npm
- Python 3.10+
- PostgreSQL 14+

## 환경 설정

### 프론트엔드 환경 변수

1. `.env.example`을 복사하여 환경별 파일 생성:
   ```bash
   cp .env.example .env.development  # 개발 환경
   cp .env.example .env.production   # 운영 환경
   ```

2. `.env.development` 파일 수정:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   VITE_APP_ENV=development
   ```

3. `.env.production` 파일 수정:
   ```env
   VITE_API_BASE_URL=https://api.yourdomain.com/api
   VITE_APP_ENV=production
   ```

### 백엔드 환경 변수

백엔드 설정은 `backend/README.md`를 참조하세요.

## 프론트엔드 실행

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

개발 서버는 `http://localhost:5173`에서 실행됩니다.

### 프로덕션 빌드

```bash
npm run build
```

빌드된 파일은 `dist/` 디렉토리에 생성됩니다.

### 미리보기

```bash
npm run preview
```

## 백엔드 실행

백엔드 실행 방법은 `backend/README.md`를 참조하세요.

## 환경별 설정

### 개발 환경

- 프론트엔드: `http://localhost:5173`
- 백엔드: `http://localhost:8000`
- 환경 변수: `.env.development` 사용

### 운영 환경

- 환경 변수: `.env.production` 사용
- 빌드 시 자동으로 운영 환경 변수 적용

## API 사용

프론트엔드에서 API를 사용하는 방법:

```typescript
import api from '@/services/api'

// GET 요청
const response = await api.get('/items')

// POST 요청
const newItem = await api.post('/items', { name: 'Item 1' })

// PUT 요청
const updated = await api.put('/items/1', { name: 'Updated Item' })

// DELETE 요청
await api.delete('/items/1')
```

## 주요 기능

- 환경별 설정 분리 (개발/운영)
- PostgreSQL 데이터베이스 연결
- RESTful API 클라이언트
- 인증 토큰 자동 관리
- 에러 처리 및 인터셉터

## 추가 정보

- 백엔드 문서: `backend/README.md`
- API 문서: 백엔드 실행 후 `http://localhost:8000/docs`에서 확인 가능





