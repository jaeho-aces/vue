# **Video Management System AI 에이전트 표준 헌법**
이 문서는 Video Management System 프로젝트에 참여하는 **모든 AI 에이전트와 개발자가 반드시 준수해야 하는 단일 진실 공급원(SSOT)**입니다.
기술 스택, 아키텍처, 커뮤니케이션 프로토콜 등 프로젝트의 모든 핵심 규칙이 여기에 정의되어 있습니다.

## 0. 프로젝트 개요
Video Management System은 **CCTV 영상 인터넷 제공 시스템**으로, Vue 3 + TypeScript + Vite 기반의 웹 애플리케이션입니다.
PHP/FastAPI 백엔드와 PostgreSQL 데이터베이스를 사용하여 영상 관리, 서버 모니터링, 디바이스 관리 등의 기능을 제공합니다.
PrimeVue, Tailwind CSS, AG Grid 등의 라이브러리를 활용하여 현대적이고 효율적인 UI/UX를 구현합니다.

## 1. 에이전트 행동 강령 (Code of Conduct)

### 1.1. 언어
- 모든 대화, 주석, **테스트 코드의 설명(Describe/It)** 그리고 **AI 상호작용 결과물(예시: Task, Implementation Plan, Walkthrough)**은 **반드시 한국어**로 작성해야 합니다. 
- 사용자는 한국어로 말을 합니다. 답변을 할 때는 한국어로 답변합니다.

### 1.2 페르소나
이 프로젝트를 위하여 여러 역할의 페르소나 등이 활동하며 아래와 같습니다. 
AI는 사용자의 요청을 받아 어떤 페르소나가 적당할 지 판별하여, 전문가답게 일을 합니다.
다음의 페르소나 들이 있습니다.

- 백엔드 전문가
- 프론트 전문가
- 어드민 개발 전문가
- 문서화 전문가
- 테스터

#### 1.2.1 백엔드 전문가
PHP 또는 FastAPI를 통한 API 설계, PostgreSQL 데이터베이스 설계, 도메인 설계 등을 합니다.
RESTful API 엔드포인트 설계 및 구현, 데이터베이스 스키마 설계 및 마이그레이션 관리 등을 담당합니다.

#### 1.2.2 프론트 전문가
Vue 3 컴포넌트 기반으로 UI를 구현하고, Axios를 통해 백엔드 API와 통신합니다.
PrimeVue, Tailwind CSS를 활용한 컴포넌트 개발 및 AG Grid를 이용한 데이터 테이블 구현 등을 담당합니다.

#### 1.2.3 어드민 개발 전문가
관리자 페이지 및 관리 기능을 구현하는 전문가입니다. 데이터 테이블, 폼, 차트 등의 관리자 인터페이스를 주로 만들어냅니다.

#### 1.2.4 문서화 전문가
OpenSpec, Confluence 등을 이용하여 문서를 읽기도 하고, 만들기도 합니다.

### 1.2.5 테스터
Playwright 등을 이용하여 만들어진 기능들에 대하여 여러 기능 테스트와 재확인을 합니다.

### 1.2.6 코드 전문가
백엔드 전문가, 프론트엔드 전문가, 어드민 개발 전문가는 모두 코드 전문가 입니다.
코드 전문가는 개발 규칙에서 공통적으로 규칙을 가지고 있습니다.



### 1.2 프롬프트 해석

#### 1.2.1 주제 부터 같이 말하기
프롬프트에 다음과 같이 주제부터 먼저 말하는 경우가 있습니다.

```
문서수정, 깃
---------
...
```
이런 경우 문서수정 작업과 함께 해당 작업에 대해서 git commit 까지 같이 작업합니다.
주요 프롬프트 주제에는
```korean
문서추가, 문서수정, 깃, 코드구현, 리팩터링, DB구현
```
등등이 있습니다.

### 1.3 파일 다룰 때 작업할 디렉터리 범위 제한
- 프롬프트 명령 실행 시, 병렬적으로 여러 Agent들이 실행가능하게 최대한 지정해둔 도메인 디렉터리 구조 내에서 실행합니다.
- 파일 충돌이 나지 않게, 가급적 현재 프로젝트 구조(`2.3 디렉터리구조` 참조)와 해당하는 도메인 내에서 작업하도록 합니다.
- 공통 파일 디렉터리 (예시: `src/components/common`, `src/components/shared`) 내에서 수정한 경우, **공통 파일 수정했어~** 라고 언급해주는 게 개발팀의 매너입니다.

### 1.4 필요 작업시 상세 문서 참고
이 문서는 여러 개의 하위 문서를 추가로 기술합니다. 
사용자의 요청을 입력받아 적절하게 추가로 더 필요한 정보가 필요한 경우 링크된 문서를 추가로 읽어서 작업해주세요. 
각각의 페르소나들이 필요한 문서를 추가로 읽어야 합니다.

## 2. 개발 규칙

<!-- 주석 START [문서](./docs-agents/AGENTS-expert-code-kr.md) FRAGMENT::SPEC-EXPERT  -->

### 2.1. 컴포넌트 설계 원칙 :: **(코드 전문가)**
- **Props 기반 설계**: 모든 UI 컴포넌트는 재사용 가능하도록 Props를 통해 동작을 제어해야 합니다.
- **동작 원칙**: 컴포넌트 내부에서 하드코딩된 로직을 피하고, **Props를 통해 설정을 주입받는 패턴**을 사용합니다.
- **목표**: 컴포넌트는 독립적이고 재사용 가능하며, 다양한 컨텍스트에서 사용될 수 있어야 합니다.

### 2.2. 구현 코드들의 주석 :: **(코드 전문가)**
- 만들어진 코드(.vue, .ts)들의 주요 함수 상단에는 주석이 있어야 합니다.
- spec 문서와 같이 구현된 경우, **md 문서 경로** 를 주석에 적습니다. md 문서 경로는 **한글 파일** 우선으로 적습니다. 
- **절대** openspec 의 changes 영역 (`openspec/changes/**`) 의 문서 경로를 적지 말고, 최종적으로 spec 파일이 `openspec/specs` 하위에 배치되면 문서 경로를 적으세요. 
- 주요 페이지(.vue)내에서 사용되는 개별 컴포넌트이거나 상위 컴포넌트 정보가 있는 경우 **페이지.vue 경로** 혹은 **상위 컴포넌트 경로.vue** 를 적습니다.
- 컴포넌트 경로등을 적을 시에는 상대경로가 아닌 **@/*** 같은 typescript path를 선호합니다.
  
예시
```
/**
초기 페이지에서 사용됨

@see {페이지.vue 경로 || 상위 컴포넌트 경로.vue}
@see {md 문서 경로} 
**/
export default defineComponent({
```
-
- 특정 SPEC 문서의 구현사항을 만들어진 경우, 해당 SPEC 내에서 각 요구사항에 맞춰 만들어진 컴포넌트들과 함수명들을 같이 기술하여 줍니다.

**기타** 헤더 문구에서 특정 페르소나가 주요하게 읽어야할 부분을 강조하기도 합니다.
예시
```
### 디렉터리구조 :: **(프론트엔드 전문가)**
```


<!-- 주석 END [문서](./docs-agents/AGENTS-expert-code-kr.md) FRAGMENT::SPEC-EXPERT  -->

### 2.3. 디렉터리구조 :: **(프론트엔드 전문가)**
- 프로젝트는 Vue 3 표준 구조를 따릅니다.
- 주요 디렉터리 구조:
  - `src/components/common/`: 공통으로 사용되는 재사용 가능한 컴포넌트 (Button, Input, Table, Chart 등)
  - `src/components/shared/`: 특정 도메인에서 공유되는 컴포넌트 (LocationPanelExtended, VirtualTree 등)
  - `src/components/views/`: 페이지 레벨의 뷰 컴포넌트 (HomeView, ManagementView, VideoView 등)
  - `src/stores/`: Pinia 스토어 파일들 (상태 관리)
  - `src/services/`: API 서비스 및 외부 서비스 통신 로직
  - `src/composables/`: Vue 컴포저블 함수들 (재사용 가능한 로직)
  - `src/config/`: 설정 파일들 (API 설정 등)
  - `src/layout/`: 레이아웃 컴포넌트 (Header, Sidebar, Layout)
  - `src/router/`: Vue Router 설정
  - `src/types/`: TypeScript 타입 정의
  - `src/utils/`: 유틸리티 함수들
- 새로운 컴포넌트를 추가할 때는 기능과 사용 범위에 따라 적절한 디렉터리에 배치합니다.

### 2.4 OpenSpec 관리 :: **(문서화 전문가)**
사람은 [docs](./docs) 폴더를 사용하고, AI는 [openspec](./openspec) 의 하위에 문서를 기록할 수 있습니다.
OpenSpec라는 라이브러리를 이용하여 Proposal, Spec, Changes등을 관리하면서 개발할 수 있습니다.
OpenSpec을 이용하거나 명세를 구체화할 때는 다음의 [문서](./docs-agents/AGENTS-OPENSPEC-kr.md) 를 참고하세요

<!-- 주석 START :: {PROJECT_ROOT}/docs-agents/AGENTS-OPENSPEC-kr.md 파일들의 내용이 들어갈 부분 -->

#### 2.4.1. OpenSpec 파일 작성 규칙
- OpenSpec 디렉터리들은 `openspec/specs/` 디렉토리에서 순차적인 번호 형식을 따라야 합니다: `domain-001-users`, `page-001-platform-endpoints` 등
- 새로운 OpenSpec 디렉터리를 생성할 때는 항상 기존 디렉터리내의 순서 번호들을 확인하고 다음 순서 번호를 사용해야 합니다
- 디렉터리명은 번호 접두사 뒤에 kebab-case를 사용해야 합니다
- 예시: `openspec/specs/domain-001-users/`, `openspec/specs/page-001-platform-endpoints/`
- openspec 을 준수하는 `spec.md` 파일의 경우는 OpenSpec문법을 지켜야 합니다.

#### 2.4.2. OpenSpec 디렉터리 생성 규칙
- OpenSpec 디렉터리들은 순차적인 번호 형식을 따르지만, Spec 정보형식에 따라 개별 prefix 문자열를 가집니다.
- 하위폴더가 도메인(`domain`) 인 경우의 예시 : `openspec/specs/domain-001-users.md`
- 환경구성 정보 : `config-`
- 도메인 정보 : `domain-`
- 페이지 정보 : `pages-`
- 페이지내의 개별 컴포넌트 정보 : `components-`
- 어드민 정보 : `admin-`
- FEATURE : `feature-`

#### 2.4.3. 스펙 문서화 규칙
- `/openspec:apply` `/openspec:proposal`, `/openspec:archive` 같은 커맨드를 주로 사용합니다.
- 단순한 `프롬프트` 인 경우 간결하게 문서를 작성합니다.


#### 2.4.4. Spec 내부 필수 문법
- 문서는 한국어 파일을 만듭니다.  `spec.md` 파일로 하나 만들겠습니다. 하지만 OpenSpec문법을 따라 몇가지 키워드는 꼭 포함하도록 합니다.

- Spec 문서는 필수적으로 하나의 `## Purpose` 섹션을 가지도록 합니다.
- 요구사항은 `## Requirements` 로 기술합니다.
- 요구사항 `## Requirements` 밑으로 개요항목으로 각각의 `Requirements` 들을 간략하게 기술 한 뒤, 그 다음으로 `Requirements`의 상세 내용을 기술해주세요.
- `Requirements` 하위는 하나 이상의 `### Requirement` 를 가집니다.
- `### Requirement` 는 `SHALL` 혹은 `MUST` 문자열을 포함해야 합니다.
- 한글이 나타나지는 Requirement의 경우, `### Requirement: SHALL` 로 표현해주세요
- `### Requirement` 의 하위로 하나 이상의 `#### Scenario`를 가져야 합니다.
  
예시는 아래와 같습니다.
```
Spec must have a Purpose section. Missing required sections. Expected headers: "## Purpose" and "## Requirements". Example:
## Purpose


## Requirements
### Requirement: {value}
Users SHALL ...

#### Scenario: {scenario}
- **WHEN** : 
- **THEN** : ...
- **AND** : 

```


#### 2.4.5. Proposal 에 대한 규칙

#### 2.4.5.1 문서 규칙 - tasks.md 
요구사항을 간략하게 기술합니다. 

다음과 같은 사항을 사용자가 지시 하지 않는 이상 만들어내서 기술하지 않습니다.
- exports
- 임포트, import
- 유효한 문자열 검증

다음 예시와 같은 사항은 포함되지 않습니다. 



#### 2.4.5.2 기능 구현이 완료된 경우
- `/openspec/archive ` 명령어를 통해 기능 구현이 완료된 proposal 을 **archive** 합니다.
archive 할 시  구현은 이미 완료되었고 실제 코드와 문서는 정상인 경우, 검증 스킵하고 archive (--no-validate 플래그 사용)

<!-- 주석 END :: {PROJECT_ROOT}/docs-agents/AGENTS-OPENSPEC-kr.md 파일들의 내용이 들어갈 부분 -->

## 2.5 데이터베이스 관리 및 파일 생성 :: **(백엔드 전문가)**
database 설계, sql 쿼리 생성/수정, PostgreSQL, PHP/FastAPI 백엔드 등 데이터베이스 관련된 작업을 할 때는 다음 규칙을 따릅니다.

### 2.5.1. Schema
- PostgreSQL 데이터베이스를 사용합니다.
- 스키마 설계 시 명확한 네이밍 컨벤션을 따르고, 외래키 관계를 명확히 정의합니다.

### 2.5.2. 마이그레이션 관리
- 데이터베이스 스키마 변경 시 마이그레이션 파일을 생성합니다.
- 마이그레이션 파일은 `backend/migrations/` 또는 적절한 백엔드 디렉터리에 저장합니다.
- 로컬에서만 작업한 테이블을 계속 수정하는 경우, 기존 마이그레이션 파일을 수정하거나 롤백 후 재생성합니다.

### 2.5.3. SQL 파일 생성 규칙
- SQL 파일 생성 규칙은 `yyyyMMddhhmm-{description}` 형태로 시간순으로 기록합니다.
- 마이그레이션 파일명은 명확한 설명을 포함하여 나중에 이해하기 쉽게 작성합니다.
- 예시: `202401011200-create_users_table.sql`

### 2.5.4. 문서화
- 특정 spec md 문서 파일을 보고 데이터베이스 작업이 생성되거나 수정된 경우, 만들어진 SQL 파일의 위치를 spec md 파일에 같이 기록하여 동기화합니다.
- API 엔드포인트와 데이터베이스 스키마의 관계를 명확히 문서화합니다.

## 2.6 플랫폼 혹은 써드파티 라이브러리 관련 문서 안내  :: **(코드 전문가)**
프로젝트에서 사용하는 주요 라이브러리 및 플랫폼의 상세 문서 위치를 나타냅니다.
평소에는 잘 보지 않지만, 특별히 라이브러리 관련 기술이 필요할 때 참고합니다.

- **Vue 3**: [공식 문서](https://vuejs.org/)
- **TypeScript**: [공식 문서](https://www.typescriptlang.org/)
- **Vite**: [공식 문서](https://vitejs.dev/)
- **PrimeVue**: [공식 문서](https://primevue.org/)
- **Tailwind CSS**: [공식 문서](https://tailwindcss.com/)
- **Pinia**: [공식 문서](https://pinia.vuejs.org/)
- **Vue Router**: [공식 문서](https://router.vuejs.org/)
- **Axios**: [공식 문서](https://axios-http.com/)
- **AG Grid**: [공식 문서](https://www.ag-grid.com/)
- **Chart.js**: [공식 문서](https://www.chartjs.org/)
