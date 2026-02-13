# 에이전트 가이드: 도로공사 영상변환 시스템

당신은 Vue 3, FastAPI, PostgreSQL에 정통한 풀스택 개발자입니다. 프로젝트의 고유한 아키텍처와 재사용 가능한 컴포넌트 패턴, 자동화된 CRUD 로직을 엄격히 준수하여 코드를 작성해야 합니다.

## 🛠 기술 스택
- **프론트엔드:** Vue 3 (Composition API), TypeScript, Pinia, Tailwind CSS, Vite.
- **백엔드:** FastAPI, PostgreSQL, Psycopg (연결 풀).
- **주요 라이브러리:** TanStack Table/Virtual (대용량 데이터 최적화), Chart.js/ECharts, Axios.
- **인증/보안:** 클라이언트 SHA-256 + 서버 bcrypt, Nonce 기반 인증.

## 📂 아키텍처 및 주요 패턴

### 1. 자동화된 CRUD (ApiStoreHelper)
대부분의 Pinia 스토어는 `src/utils/apiStore.ts`의 `ApiStoreHelper`를 상속받아 구현됩니다.
- **표준 흐름:** 컴포넌트 -> 스토어 (Helper) -> API 서비스 -> FastAPI (범용 CRUD).
- **캐싱:** 기본 5분간 캐싱됩니다. 불필요한 API 호출을 지양하고 캐시 로직을 존중하세요.

### 2. 백엔드 스키마 기반 개발
백엔드는 `backend/tables.py`에 정의된 스키마를 바탕으로 동적 CRUD를 수행합니다.
- 새로운 테이블 추가 시 `tables.py`에 `TableSchema`를 정의하는 것이 최우선입니다.
- 필드명 매핑 규칙(DB 대문자 <-> 앱 소문자)을 자동으로 처리합니다.

### 3. 프론트엔드 컴포넌트 표준
일관성을 위해 다음 특수 컴포넌트를 반드시 재사용하세요.
- **데이터 테이블:** 목록 표시 시 `src/components/common/Table.vue` 사용.
- **입력 컴포넌트:**
  - IP 주소: `IpInput.vue` (4개 세그먼트 분리, 자동 포커스).
  - 포트 번호: `PortInput.vue` (0-65535 검증).
  - ID 입력: `IdInput.vue` (숫자 4자리 제한).
- **알림:** 모달 대신 `alert.ts` 스토어를 통한 `AlertModal.vue` 토스트 알림 사용.

## 📜 코딩 규칙
1. **스크립트 형식:** 반드시 `<script setup lang="ts">`를 사용합니다.
2. **타입 안전성:** `src/types/`에 엄격한 TypeScript 타입을 정의하고 유지합니다.
3. **날짜 포맷:** 모든 날짜 컬럼은 `YYYY-MM-DD` 형식을 유지합니다.
4. **인증 흐름:** `docs/AUTH.md`에 정의된 Nonce + SHA-256 핸드셰이크 방식을 따릅니다.
5. **기능 확장:** 새 탭(관리 화면) 추가 시 `docs/NEW_TAB_GUIDE.md`의 구조를 복제하여 사용합니다.

## 💡 에이전트 수행 가이드
- 새로운 스토어를 만들 때 `ApiStoreHelper` 상속이 가능한지 먼저 확인하세요.
- UI 수정 시 Tailwind CSS 유틸리티 클래스를 우선적으로 사용하세요.
- 모든 API 호출은 `src/services/api.ts`에 정의된 래퍼를 거쳐야 합니다.