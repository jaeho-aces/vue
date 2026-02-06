<template>
  <Table
    :model-value="rawData"
    :columns="columns"
    :default-visible-columns="defaultVisibleColumns"
    :form-fields="formFields"
    modal-title="버전 관리"
    :checkbox-column-width="checkboxColumnWidth"
    :id-column-width="idColumnWidth"
    id-field="version_id"
    :hide-id-column="true"
    preference-key="vms_version_management"
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
import { useAlertStore } from '../../../stores/alert'

// Pinia 스토어 사용
const versionStore = useVersionMgtStore()
const alertStore = useAlertStore()

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

function toDateOnly(value: unknown): string {
  if (value == null || value === '') return ''
  const s = String(value).trim()
  return s.length >= 10 ? s.slice(0, 10) : s
}

const DateOnlyCell = defineComponent({
  props: {
    value: {
      type: [String, Number],
      default: ''
    }
  },
  setup(props) {
    return () => h('span', { class: 'text-sm text-slate-700' }, toDateOnly(props.value))
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
  { id: 'release_date', header: '배포일자', size: columnWidths[3], cellComponent: DateOnlyCell }
]

// 기본 표시 컬럼
const defaultVisibleColumns = ['product_name', 'version', 'storage_path', 'release_date']

// 스토어의 데이터를 직접 참조 (computed 사용)
// Table 컴포넌트는 내부적으로 데이터를 관리하므로, 
// v-model 업데이트는 무시하고 @update 이벤트만 사용
const rawData = computed(() => versionStore.items)

// 폼 필드 정의 (KEY와 배포일자는 자동 생성)
const formFields: FormField[] = [
  { id: 'version_id', label: '', type: 'hidden' },
  { id: 'product_name', label: '제품명', type: 'text', required: true, placeholder: '예: TCS7000', readonlyInEdit: true },
  { id: 'version', label: '버전', type: 'text', required: true, placeholder: '예: v1.5.2' },
  { id: 'storage_path', label: '저장 경로', type: 'text', required: false, placeholder: '예: /opt/cctv/bin' },
  { id: 'release_date', label: '', type: 'hidden' }
]

// 버전 ID 자동 생성 (UUID 또는 임의 문자열)
function generateVersionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `VER_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
}

// 현재 timestamp 생성 (YYYY-MM-DD HH:mm:ss)
function nowAsTimestamp(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  return `${y}-${m}-${day} ${h}:${min}:${s}`
}

// 데이터 업데이트 처리 (생성/수정)
const handleDataUpdate = async (data: Record<string, any>, isNew: boolean) => {
  try {
    if (isNew) {
      // 신규 생성: version_id와 release_date 자동 생성
      const payload = {
        ...data,
        version_id: generateVersionId(),
        release_date: nowAsTimestamp()
      }
      await versionStore.createVersion(payload as Version)
    } else {
      // 수정
      await versionStore.updateVersion(data.version_id, data)
    }
    alertStore.show(isNew ? '신규 생성 완료' : '수정 완료', 'success')
  } catch (error: any) {
    console.error('데이터 저장 실패:', error)
    const detail = error.response?.data?.detail || versionStore.error || ''
    const detailText = typeof detail === 'string'
      ? detail
      : Array.isArray(detail)
        ? detail.map((d: any) => d?.msg ?? d).join(', ')
        : (detail?.message ?? '')
    const lower = detailText.toLowerCase()
    const isDuplicate = lower.includes('duplicate')
      || lower.includes('already exists')
      || lower.includes('conditionalcheckfailed')
      || lower.includes('key must have')
      || lower.includes('unique')
      || detailText.includes('고유 제약')
      || detailText.includes('키가 이미 있습니다')
      || detailText.includes('이미 있습니다')
    const errorMessage = isDuplicate
      ? '이미 존재하는 버전 ID 또는 제품명 조합입니다. 다른 값을 입력해주세요.'
      : (detailText || '데이터 저장 중 오류가 발생했습니다.')
    alertStore.show(errorMessage, 'error')
  }
}

// 데이터 삭제 처리
const handleDataDelete = async (ids: string[]) => {
  try {
    await versionStore.deleteVersions(ids)
    alertStore.show('삭제 완료', 'success')
  } catch (error: any) {
    console.error('데이터 삭제 실패:', error)
    const errorMessage = versionStore.error || error.response?.data?.detail || '데이터 삭제 중 오류가 발생했습니다.'
    alertStore.show(errorMessage, 'error')
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
