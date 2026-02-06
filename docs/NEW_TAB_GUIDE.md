# 새 탭 구현 가이드

## 1. 프로젝트 구조

```
src/
├── stores/              # Pinia 스토어 (데이터 관리)
├── components/
│   ├── common/         # 공통 컴포넌트 (Table, DataFormModal 등)
│   └── views/          # 페이지 컴포넌트
└── utils/
    └── apiStore.ts     # 공통 CRUD 로직 (ApiStoreHelper)
```

## 2. 새 탭 구현 3단계

### Step 1: 스토어 생성
기존 스토어 파일(`mediaServerInfo.ts`) 복사 → 파일명/인터페이스명 변경 → 테이블명 수정

```typescript
// src/stores/headquartersInfo.ts
export interface Headquarters {
  hq_id: string
  hq_code: string
  hq_name: string
  // ...
}

export const useHeadquartersInfoStore = defineStore('headquartersInfo', {
  // 기존 스토어와 동일한 패턴
  getPhpTableName() { return 'MGMT_HEADQUARTERS' },
  getPhpTableKey() { return 'HQ_ID' },
  // ...
})
```

### Step 2: Vue 컴포넌트 생성
기존 컴포넌트(`MediaServerInfo.vue`) 복사 → 스토어 import 변경 → 컬럼/폼 필드 수정

```vue
<!-- src/components/views/general/HeadquartersInfo.vue -->
<script setup>
import { useHeadquartersInfoStore } from '../../../stores/headquartersInfo'

const store = useHeadquartersInfoStore()
const rawData = computed(() => store.items)

// 컬럼 정의, 폼 필드 정의만 수정
const columns = [ /* ... */ ]
const formFields = [ /* ... */ ]

onMounted(() => {
  store.fetchHeadquarters()
})
</script>
```

### Step 3: 탭에 등록
`ManagementView.vue` 또는 `DeviceManagementView.vue`에 탭 추가

```typescript
import HeadquartersInfo from './general/HeadquartersInfo.vue'

const tabs = ['본부 정보', ...]
const tabContent = {
  '본부 정보': HeadquartersInfo,
  // ...
}
```

## 3. 핵심 포인트

### 공통 함수 재사용
- `ApiStoreHelper`: 모든 CRUD 로직 자동 처리
- `Table.vue`: 테이블 UI 자동 생성
- `DataFormModal.vue`: 폼 모달 자동 생성

### 필수 작업만
1. 스토어 파일 생성 (기존 복사 후 수정)
2. 컴포넌트 파일 생성 (기존 복사 후 수정)
3. 탭 등록

### 백엔드는 자동 처리
- `backend/tables.py`에 테이블만 정의하면 FastAPI가 자동으로 CRUD 처리

## 4. 체크리스트

- [ ] 스토어 파일 생성 (`stores/xxxInfo.ts`)
- [ ] 컴포넌트 파일 생성 (`components/views/xxx/xxxInfo.vue`)
- [ ] 탭에 등록 (`ManagementView.vue` 또는 `DeviceManagementView.vue`)
- [ ] `backend/tables.py`에 테이블 스키마 확인/추가

## 5. 참고 파일

- 스토어 예제: `src/stores/mediaServerInfo.ts`
- 컴포넌트 예제: `src/components/views/device/MediaServerInfo.vue`

---

**요약**: 기존 파일을 복사해서 파일명과 테이블명만 바꾸면 됩니다. 나머지는 공통 함수가 자동으로 처리합니다.
