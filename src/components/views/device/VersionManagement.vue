<template>
  <Table
    :model-value="rawData"
    :columns="columns"
    :default-visible-columns="defaultVisibleColumns"
    :form-fields="formFields"
    modal-title="버전 관리"
    :checkbox-column-width="checkboxColumnWidth"
    :id-column-width="idColumnWidth"
    :hide-edit-button="true"
    @update="handleDataUpdate"
    @delete="handleDataDelete"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, defineComponent, h } from 'vue'
import Table, { type TableColumn } from '../../common/Table.vue'
import { type FormField } from '../../common/DataFormModal.vue'
import { useVersionMgtStore, type Version } from '../../../stores/versionMgt'

// Pinia 스토어 사용
const versionStore = useVersionMgtStore()

// 셀 컴포넌트
const TextCell = defineComponent({
  props: {
    value: {
      type: [String, Number],
      default: ''
    }
  },
  setup(props) {
    return () => h('span', { class: 'text-sm text-slate-700' }, String(props.value || ''))
  }
})

// 기본 컬럼 너비 설정
const checkboxColumnWidth = 50
const idColumnWidth = 120
const columnWidths = [150, 120, 200, 120]

// 컬럼 정의
const columns: TableColumn[] = [
  { id: 'product_name', header: '제품', size: columnWidths[0], cellComponent: TextCell },
  { id: 'version', header: '버전', size: columnWidths[1], cellComponent: TextCell },
  { id: 'storage_path', header: '저장 경로', size: columnWidths[2], cellComponent: TextCell },
  { id: 'release_date', header: '배포일자', size: columnWidths[3], cellComponent: TextCell }
]

// 기본 표시 컬럼
const defaultVisibleColumns = ['product_name', 'version', 'storage_path', 'release_date']

// 스토어의 데이터를 직접 참조 (computed 사용)
// Table 컴포넌트는 내부적으로 데이터를 관리하므로, 
// v-model 업데이트는 무시하고 @update 이벤트만 사용
const rawData = computed(() => versionStore.items)

// 폼 필드 정의
const formFields: FormField[] = [
  { id: 'version_id', label: '버전 ID', type: 'text', required: true, placeholder: '예: VER-001' },
  { id: 'product_name', label: '제품명', type: 'text', required: true, placeholder: '예: TCS7000' },
  { id: 'version', label: '버전', type: 'text', required: true, placeholder: '예: v1.5.2' },
  { id: 'storage_path', label: '저장 경로', type: 'text', required: false, placeholder: '예: /opt/cctv/bin' },
  { id: 'release_date', label: '배포일자', type: 'text', required: false, placeholder: 'YYYY-MM-DD' }
]

// 데이터 업데이트 처리 (생성/수정)
const handleDataUpdate = async (data: Record<string, any>, isNew: boolean) => {
  try {
    if (isNew) {
      // 신규 생성
      await versionStore.createVersion(data as Version)
    } else {
      // 수정
      await versionStore.updateVersion(data.version_id, data)
    }
  } catch (error: any) {
    console.error('데이터 저장 실패:', error)
    const errorMessage = versionStore.error || error.response?.data?.detail || '데이터 저장 중 오류가 발생했습니다.'
    alert(errorMessage)
  }
}

// 데이터 삭제 처리
const handleDataDelete = async (ids: string[]) => {
  try {
    await versionStore.deleteVersions(ids)
  } catch (error: any) {
    console.error('데이터 삭제 실패:', error)
    const errorMessage = versionStore.error || error.response?.data?.detail || '데이터 삭제 중 오류가 발생했습니다.'
    alert(errorMessage)
  }
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  versionStore.fetchVersions()
})
</script>

<style scoped>
/* 스타일은 Table 컴포넌트에 포함되어 있음 */
</style>
