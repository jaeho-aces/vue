# 도로공사 영상변환 시스템

Vue 3 + TypeScript + FastAPI + PostgreSQL 기반의 영상 관리 시스템입니다.

## 프로젝트 구조

```
.
├── backend/              # FastAPI 백엔드
│   ├── main.py          # FastAPI 메인 서버
│   ├── tables.py        # 테이블 스키마 정의
│   ├── requirements.txt # Python 의존성
│   └── README.md        # 백엔드 문서
├── src/                 # Vue 3 프론트엔드
│   ├── components/      # Vue 컴포넌트
│   │   ├── common/      # 공통 재사용 컴포넌트 (Table, DataFormModal 등)
│   │   ├── views/       # 페이지 레벨 컴포넌트
│   │   └── shared/      # 도메인 공유 컴포넌트
│   ├── stores/          # Pinia 스토어 (상태 관리)
│   ├── services/        # API 서비스
│   ├── utils/           # 유틸리티 함수
│   │   └── apiStore.ts  # 공통 CRUD 로직 (ApiStoreHelper)
│   ├── config/          # 설정 파일
│   └── types/           # TypeScript 타입 정의
├── NEW_TAB_GUIDE.md     # 새 탭 구현 가이드
├── TROUBLESHOOTING.md   # 트러블슈팅 가이드
└── README.md
```

## 사전 요구사항

- Node.js 18+ 및 npm
- Python 3.10+
- PostgreSQL 14+

## 환경 설정

### 프론트엔드 환경 변수

프론트엔드는 Vite 프록시를 통해 FastAPI 백엔드와 통신합니다. `vite.config.ts`에서 프록시 설정이 되어 있으므로 별도의 환경 변수 설정이 필요 없습니다.

개발 환경에서는:
- 프론트엔드: `http://localhost:5173`
- 백엔드: `http://localhost:8000` (자동 프록시)

### 백엔드 환경 변수

백엔드 설정은 `backend/README.md`를 참조하세요.

`backend/.env` 파일을 생성하여 데이터베이스 연결 정보를 설정합니다:

```env
DATABASE_URL=postgresql://user:password@host:port/database
```

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

## 아키텍처

### 프론트엔드 → 백엔드 요청 흐름

```
Vue 컴포넌트
  ↓
Pinia Store (상태 관리)
  ↓
ApiStoreHelper (공통 CRUD 로직)
  ↓
API Service (axios)
  ↓
Vite Proxy (/api → http://localhost:8000)
  ↓
FastAPI Backend
  ↓
PostgreSQL Database
```

### 주요 기술 스택

**프론트엔드:**
- Vue 3 (Composition API)
- TypeScript
- Pinia (상태 관리)
- TanStack Table (테이블 컴포넌트)
- Tailwind CSS (스타일링)
- Vite (빌드 도구)

**백엔드:**
- FastAPI (Python 웹 프레임워크)
- PostgreSQL (데이터베이스)
- psycopg (PostgreSQL 드라이버)

## 주요 기능

### 공통 컴포넌트
- **Table.vue**: 범용 테이블 컴포넌트 (필터링, 정렬, 가상 스크롤, CRUD)
- **DataFormModal.vue**: 범용 폼 모달 (다양한 필드 타입 지원)
- **Button.vue, Input.vue, Select.vue**: 기본 UI 컴포넌트

### 공통 유틸리티
- **ApiStoreHelper**: 모든 CRUD 로직을 자동 처리하는 헬퍼 클래스
  - `fetchAll()`: 데이터 목록 조회 (캐싱 지원)
  - `create()`: 데이터 생성
  - `update()`: 데이터 수정
  - `delete()`: 데이터 삭제
  - `deleteMany()`: 다중 삭제

### 상태 관리
- **Pinia Store**: 각 테이블별로 독립적인 스토어 사용
- 메모리 캐싱: 5분간 데이터 캐싱
- 자동 반응형 업데이트

### 백엔드 자동화
- 테이블 기반 자동 CRUD: `backend/tables.py`에 테이블만 정의하면 자동으로 CRUD 처리
- 동적 테이블/키 발견: PostgreSQL `information_schema`에서 자동 감지
- 필드명 자동 변환: 대문자 → 소문자 변환

## 새 탭 추가하기

새로운 데이터 테이블 탭을 추가하는 방법은 `NEW_TAB_GUIDE.md`를 참조하세요.

간단히 요약하면:
1. 기존 스토어 파일 복사 → 파일명/테이블명 수정
2. 기존 컴포넌트 파일 복사 → 컬럼/폼 필드 수정
3. 탭에 등록

모든 CRUD 로직은 `ApiStoreHelper`가 자동으로 처리합니다.

## API 사용

### Pinia Store를 통한 사용 (권장)

```typescript
import { useMediaServerInfoStore } from '@/stores/mediaServerInfo'

const store = useMediaServerInfoStore()

// 데이터 조회
await store.fetchMediaServers()

// 데이터 생성
await store.createMediaServer(data)

// 데이터 수정
await store.updateMediaServer(id, data)

// 데이터 삭제
await store.deleteMediaServer(id)
```

### 직접 API 호출

```typescript
import { api } from '@/services/api'

// FastAPI 백엔드 직접 호출
const response = await api.fastapi.getDbArray('MGMT_FMS', {
  layout: [{ field: '*' }],
  query: [],
  where: '',
  order: ''
})
```

## 추가 정보

- **백엔드 문서**: `backend/README.md`
- **새 탭 구현 가이드**: `NEW_TAB_GUIDE.md`
- **트러블슈팅**: `TROUBLESHOOTING.md`
- **API 문서**: 백엔드 실행 후 `http://localhost:8000/docs`에서 확인 가능





