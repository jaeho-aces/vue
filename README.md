# 도로공사 영상변환 시스템

Vue 3 + TypeScript + FastAPI + PostgreSQL 기반의 영상 관리 시스템입니다.

## 프로젝트 구조

```
.
├── backend/              # FastAPI 백엔드
│   ├── main.py          # FastAPI 메인 애플리케이션
│   ├── auth.py          # 인증 엔드포인트 (SHA-256 + bcrypt)
│   ├── database.py      # PostgreSQL 데이터베이스 연결
│   ├── tables.py        # 테이블 스키마 정의 (TableSchema)
│   ├── prometheus.py    # 메트릭 수집 엔드포인트
│   ├── requirements.txt # Python 의존성
│   ├── .env            # 백엔드 환경 변수 (CORS, DB 등)
│   └── README.md        # 백엔드 문서
├── src/                 # Vue 3 프론트엔드
│   ├── App.vue          # 루트 애플리케이션 컴포넌트
│   ├── main.ts          # 애플리케이션 진입점
│   ├── assets/          # 정적 자산
│   │   ├── fonts/       # 커스텀 폰트 (Pretendard woff2)
│   │   └── layout.css   # 전역 스타일, @font-face, CSS 변수
│   ├── components/      # Vue 컴포넌트
│   │   ├── common/      # 공통 재사용 컴포넌트
│   │   │   ├── Table.vue          # 범용 테이블 (정렬, 필터, CRUD)
│   │   │   ├── DataFormModal.vue  # 범용 폼 모달
│   │   │   ├── IpInput.vue        # IP 주소 입력 (4칸 분리, 자동 포커스)
│   │   │   ├── PortInput.vue      # 포트 번호 입력 (0~65535)
│   │   │   ├── IdInput.vue        # ID 입력 (숫자 4자리)
│   │   │   ├── AlertModal.vue     # 토스트 알림 컨테이너
│   │   │   ├── Button.vue         # 버튼 컴포넌트
│   │   │   └── ...                # 차트, 게이지 등
│   │   ├── views/       # 페이지 레벨 컴포넌트
│   │   │   ├── device/            # 장비 관리 화면들
│   │   │   ├── general/           # 일반 설정 화면들
│   │   │   └── ...                # 대시보드, 영상, 로그인 등
│   │   ├── shared/      # 도메인 공유 컴포넌트
│   │   └── layout/      # 레이아웃 컴포넌트 (Header, Sidebar)
│   ├── stores/          # Pinia 스토어 (상태 관리)
│   │   ├── auth.ts      # 인증 상태
│   │   ├── alert.ts     # 토스트 알림 상태
│   │   ├── cameraInfo.ts           # 카메라 정보
│   │   ├── videoConversionServerInfo.ts # 영상 변환 서버
│   │   └── ...          # 기타 도메인 스토어
│   ├── services/        # API 서비스
│   │   └── api.ts       # Axios 인스턴스, FastAPI 래퍼
│   ├── router/          # Vue Router
│   │   └── index.ts     # 라우트 정의, 인증 가드
│   ├── composables/     # Vue Composables
│   │   └── useAuth.ts   # 인증 상태 훅
│   ├── utils/           # 유틸리티 함수
│   │   ├── apiStore.ts  # 공통 CRUD 로직 (ApiStoreHelper)
│   │   └── crypto.ts    # SHA-256 해싱 (Web Crypto + js-sha256)
│   ├── config/          # 설정 파일
│   │   └── api.ts       # API 베이스 URL 등
│   └── types/           # TypeScript 타입 정의
│       ├── form.ts      # FormField 타입
│       └── index.ts     # 공통 타입
├── docs/                # 프로젝트 문서
│   ├── AUTH.md          # 인증 시스템 문서
│   ├── NEW_TAB_GUIDE.md # 새 탭 구현 가이드
│   └── TROUBLESHOOTING.md # 트러블슈팅
├── .env.development     # 개발 환경 변수
├── .env.production      # 운영 환경 변수
├── .env.example         # 환경 변수 예시
├── vite.config.ts       # Vite 빌드 설정
├── package.json         # 프론트엔드 의존성
└── README.md
```

## 디렉토리 상세 설명

### `backend/` - FastAPI 백엔드
- **`main.py`**: FastAPI 애플리케이션 진입점, CORS 설정, 라우터 등록
- **`auth.py`**: 인증 엔드포인트 (`/api/auth/login`, `/api/auth/me`, nonce 생성)
- **`database.py`**: PostgreSQL 연결 풀 관리
- **`tables.py`**: 테이블 메타데이터 정의 (`TableSchema`, `TableField`)
- **`prometheus.py`**: Prometheus 메트릭 수집 API
- **`.env`**: 백엔드 환경 변수 (`DATABASE_URL`, `CORS_ORIGINS`, `AUTH_COOKIE_SECURE`)

### `src/components/common/` - 공통 컴포넌트
- **`Table.vue`**: 범용 데이터 테이블 (정렬, 필터, 컬럼 설정, 가상 스크롤, CRUD 모달)
- **`DataFormModal.vue`**: 범용 폼 모달 (다양한 필드 타입: text, number, select, ip, id, toggle 등)
- **`IpInput.vue`**: IP 주소 입력 (4개 세그먼트, 자동 포커스, 0-255 검증)
- **`PortInput.vue`**: 포트 번호 입력 (숫자만, min/max 검증)
- **`IdInput.vue`**: ID 입력 (숫자 전용, 최대 자릿수 제한)
- **`AlertModal.vue`**: 토스트 알림 컨테이너 (우하단, 자동 사라짐)
- **차트/게이지**: `AreaChart`, `PieChart`, `CircularGauge`, `NeonGauge` 등

### `src/components/views/` - 페이지 컴포넌트
- **`device/`**: 장비 관리 화면
  - `CameraInfo.vue`: 카메라 정보 관리
  - `VideoConversionServerInfo.vue`: 영상 변환 서버 관리
  - `MediaServerInfo.vue`: 미디어 서버 관리
  - `VideoFileTransferServer.vue`: 파일 전송 서버 관리
  - `VersionManagement.vue`: 버전 관리
  - `VideoConversionInfo.vue`: 영상 변환 채널 정보
  - `MediaInfo.vue`: 미디어 정보
- **`general/`**: 일반 설정 화면
  - `HeadquartersInfo.vue`: 본부 정보
  - `BranchInfo.vue`: 지사 정보
  - `RouteInfo.vue`: 노선 정보
  - `TerminalInfo.vue`: 운영 단말 정보
  - `CommonCode.vue`: 공통 코드 관리
  - `UserAccount.vue`: 사용자 계정 관리

### `src/stores/` - Pinia 상태 관리
각 도메인별 스토어가 `ApiStoreHelper`를 사용하여 CRUD 작업을 자동화합니다:
- **`auth.ts`**: 인증 상태 (로그인, 로그아웃, 세션 확인)
- **`alert.ts`**: 토스트 알림 큐 관리
- **`cameraInfo.ts`**: 카메라 정보 CRUD
- **`videoConversionServerInfo.ts`**: 영상 변환 서버 CRUD
- **`commonCode.ts`**: 공통 코드 CRUD (본부, 지사, 노선 등)
- **`preference.ts`**: 사용자별 UI 설정 (컬럼 표시/숨김, 정렬 등)

### `src/services/` - API 통신
- **`api.ts`**: Axios 인스턴스, FastAPI 래퍼 메서드
  - `api.fastapi.getDbArray()`: 테이블 조회
  - `api.fastapi.restAccess()`: CRUD 작업 (POST/PUT/DELETE)
  - 인터셉터: 401 자동 로그아웃, 에러 로깅

### `src/utils/` - 유틸리티
- **`apiStore.ts`**: `ApiStoreHelper` 클래스 - 모든 스토어에서 공통으로 사용하는 CRUD 로직
- **`crypto.ts`**: SHA-256 해싱 (Web Crypto API + js-sha256 폴백)

### `src/router/` - 라우팅
- **`index.ts`**: Vue Router 설정, 인증 가드 (`beforeEach`)

### `docs/` - 문서
- **`AUTH.md`**: 인증 시스템 상세 문서 (nonce, SHA-256, bcrypt)
- **`NEW_TAB_GUIDE.md`**: 새 탭 추가 가이드
- **`TROUBLESHOOTING.md`**: 트러블슈팅 가이드

## 사전 요구사항

- Node.js 18+ 및 npm
- Python 3.10+
- PostgreSQL 14+

## 환경 설정

### 프론트엔드 환경 변수

프로젝트 루트에 환경별 설정 파일을 생성합니다:

**`.env.development`** (개발 환경):
```env
VITE_API_BASE_URL=http://localhost:8000
```

**`.env.production`** (운영 환경):
```env
VITE_API_BASE_URL=http://your-server-ip:8000
```

**`.env.example`**: 환경 변수 템플릿 (Git에 포함)

**개발 환경에서는**:
- 프론트엔드: `http://localhost:5173`
- 백엔드: `http://localhost:8000`
- Vite 프록시: `/api/*` 요청 자동 전달

### 백엔드 환경 변수

`backend/.env` 파일을 생성하여 데이터베이스 및 CORS 설정:

```env
# 데이터베이스 연결
DATABASE_URL=postgresql://user:password@host:port/database

# CORS 허용 오리진 (쉼표로 구분)
CORS_ORIGINS=http://localhost:5173,http://172.16.17.11

# 쿠키 보안 설정 (HTTPS 사용 시 true)
AUTH_COOKIE_SECURE=false
```

상세 설정은 `backend/README.md`를 참조하세요.

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

**일반 빌드** (권장 - Nginx 배포용):
```bash
npm run build
```
빌드된 파일은 `dist/` 디렉토리에 생성됩니다:
- `index.html`
- `assets/` (JS, CSS, 폰트 등)

**단일 파일 빌드**:
```bash
npm run build:single
```
모든 자산이 `index.html` 하나로 번들됩니다 (테스트/배포 간소화).

### 미리보기

```bash
npm run preview
```

### 운영 환경 배포

**Nginx 설정 예시**:
```nginx
server {
    listen 80;
    server_name 172.16.17.11;
    root /var/www/html;  # dist/ 디렉토리 경로
    index index.html;

    # Vue 라우터 지원 (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # FastAPI 백엔드 프록시
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
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
- TanStack Table & Virtual (테이블, 가상 스크롤)
- Chart.js & ECharts (차트, 게이지)
- Lucide Vue (아이콘)
- Tailwind CSS (스타일링)
- Vite (빌드 도구)
- Axios (HTTP 클라이언트)

**백엔드:**
- FastAPI (Python 웹 프레임워크)
- PostgreSQL (데이터베이스)
- psycopg (PostgreSQL 드라이버, 연결 풀)
- bcrypt (비밀번호 해싱)
- httpx (비동기 HTTP 클라이언트)

## 주요 기능

### 공통 컴포넌트
- **Table.vue**: 범용 테이블 컴포넌트
  - 정렬, 필터링, 컬럼 표시/숨김, 크기 조절
  - 가상 스크롤 (대용량 데이터 최적화)
  - CRUD 모달 통합 (생성/수정/삭제)
  - 다중 선택, 일괄 삭제
- **DataFormModal.vue**: 범용 폼 모달
  - 다양한 필드 타입: `text`, `number`, `select`, `ip`, `port`, `id`, `toggle`, `hidden`
  - 자동 유효성 검사 (필수값, 패턴, min/max)
  - 필수값 미입력 시 토스트 알림
  - 모달 닫기: 백엔드 성공 응답 후에만 닫힘
- **특수 입력 컴포넌트**:
  - **IpInput.vue**: IP 주소 입력 (4개 세그먼트, 0-255 검증, 자동 포커스 이동)
  - **PortInput.vue**: 포트 번호 입력 (0~65535 범위, 숫자 전용)
  - **IdInput.vue**: ID 입력 (숫자 전용, 최대 4자리)
- **AlertModal.vue**: 토스트 알림 시스템
  - 우하단 표시, 5초 후 자동 사라짐
  - Success/Error/Info 타입별 스타일
  - 다중 토스트 큐 관리

### 공통 유틸리티
- **ApiStoreHelper**: 모든 CRUD 로직을 자동 처리하는 헬퍼 클래스
  - `fetchAll()`: 데이터 목록 조회 (5분 캐싱)
  - `create()`: 데이터 생성
  - `update()`: 데이터 수정
  - `delete()`: 데이터 삭제
  - `deleteMany()`: 다중 삭제
  - 에러 핸들링: 중복 키, 네트워크 오류 등

### 상태 관리
- **Pinia Store**: 각 테이블별로 독립적인 스토어 사용
- 메모리 캐싱: 5분간 데이터 캐싱 (불필요한 API 호출 방지)
- 자동 반응형 업데이트: 데이터 변경 시 UI 즉시 반영

### 인증 시스템
- **SHA-256 + bcrypt**: 클라이언트 측 SHA-256 해싱 → 서버 측 bcrypt 저장
- **Nonce 기반 인증**: 재전송 공격 방지 (5분 TTL)
- **HTTPOnly Cookie**: 세션 토큰 저장 (XSS 방어)
- **자동 로그아웃**: 401 응답 시 자동 로그인 페이지 이동
- HTTP 환경 지원: Web Crypto API 미지원 시 js-sha256 폴백

### 백엔드 자동화
- **테이블 기반 자동 CRUD**: `backend/tables.py`에 테이블만 정의하면 자동으로 CRUD 처리
- **동적 테이블/키 발견**: PostgreSQL `information_schema`에서 자동 감지
- **필드명 자동 변환**: 대문자 → 소문자 변환
- **복합키 지원**: 단일 키 및 복합 키 모두 지원 (예: `MGMT_VERSION`)

### UI/UX
- **Pretendard 폰트**: 전역 적용 (Thin ~ Black, 9개 weight)
- **날짜 포맷**: 모든 날짜 컬럼 `YYYY-MM-DD` 형식 통일
- **반응형 디자인**: Tailwind CSS 기반
- **토스트 알림**: 모달 대신 비침투적 알림 (성공/오류 메시지)

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
- **인증 시스템**: `docs/AUTH.md` (SHA-256, bcrypt, nonce 상세 설명)
- **새 탭 구현 가이드**: `docs/NEW_TAB_GUIDE.md`
- **트러블슈팅**: `docs/TROUBLESHOOTING.md`
- **API 문서**: 백엔드 실행 후 `http://localhost:8000/docs`에서 확인 가능
- **OpenSpec**: `openspec/` - 프로젝트 스펙 및 제안서 관리

## 기술 스택 버전

- **Node.js**: 18+
- **Python**: 3.10+
- **PostgreSQL**: 14+
- **Vue**: 3.x
- **TypeScript**: 5.x
- **Vite**: 5.x
- **FastAPI**: 0.x
- **Pinia**: 2.x
- **TailwindCSS**: 3.x

## 주요 라이브러리

**프론트엔드**:

### 테이블 & 가상화
- `@tanstack/vue-table`: 테이블 상태 관리, 정렬/필터링 로직
- `@tanstack/vue-virtual`: 가상 스크롤 (대용량 데이터 렌더링 최적화)

### 차트 & 시각화
- `chart.js` + `vue-chartjs`: 차트 라이브러리 (AreaChart, BarChart, CyberChart)
- `echarts` + `vue-echarts`: 고급 차트/게이지 (CircularGauge)

### 트리 구조
- 자체 구현: `VirtualTree.vue` (가상 스크롤 기반 계층형 트리)

### 아이콘 & UI
- `lucide-vue-next`: 아이콘 라이브러리
- `tailwindcss` + `@tailwindcss/vite`: 유틸리티 CSS 프레임워크

### 코어 라이브러리
- `vue`: Vue 3 (Composition API)
- `pinia`: 상태 관리
- `vue-router`: 라우팅
- `axios`: HTTP 클라이언트
- `js-sha256`: SHA-256 해싱 (Web Crypto API 폴백)

**백엔드**:
- `fastapi`: Python 웹 프레임워크
- `psycopg[binary]`: PostgreSQL 드라이버 (연결 풀 지원)
- `bcrypt`: 비밀번호 해싱
- `uvicorn[standard]`: ASGI 서버
- `httpx`: 비동기 HTTP 클라이언트 (Prometheus 연동)
- `python-dotenv`: 환경 변수 관리
- `pydantic`: 데이터 검증 및 스키마

## 프로젝트 규칙

- **컴포넌트 재사용**: `IpInput`, `PortInput`, `IdInput` 등 특수 입력은 컴포넌트 사용
- **타입 안정성**: TypeScript strict 모드, 모든 props/emit 타입 정의
- **상태 관리**: 각 도메인별 Pinia 스토어 분리, `ApiStoreHelper` 활용
- **에러 처리**: 토스트 알림으로 사용자 친화적 메시지 제공
- **코드 스타일**: Prettier, ESLint 규칙 준수
- **날짜 포맷**: 모든 날짜 컬럼 `YYYY-MM-DD` 형식 (시간 제외)

## 라이선스

이 프로젝트는 도로공사 내부 시스템용으로 개발되었습니다.





