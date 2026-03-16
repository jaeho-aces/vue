<template>
  <Table
    :key="tableRefreshKey"
    ref="tableRef"
    :model-value="rawData"
    :columns="columns"
    :default-visible-columns="defaultVisibleColumns"
    :form-fields="formFields"
    modal-title="물리 서버 정보"
    :checkbox-column-width="checkboxColumnWidth"
    :id-column-width="idColumnWidth"
    id-field="ps_id"
    hide-id-column
    preference-key="vms_physical_server_info"
    @update="handleDataUpdate"
    @delete="handleDataDelete"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, defineComponent, h, ref } from 'vue'
import Table, { type TableColumn } from '../../common/Table.vue'
import { type FormField } from '../../common/DataFormModal.vue'
import { usePhysicalServerInfoStore, type PhysicalServer } from '../../../stores/physicalServerInfo'
import { useAlertStore } from '../../../stores/alert'

const physicalServerStore = usePhysicalServerInfoStore()
const alertStore = useAlertStore()
const isSubmitting = ref(false)
const tableRef = ref<InstanceType<typeof Table> | null>(null)
const tableRefreshKey = ref(0)

const TextCell = defineComponent({
  props: {
    value: {
      type: [String, Number, Boolean],
      default: ''
    }
  },
  setup(props) {
    const displayValue =
      typeof props.value === 'boolean' ? String(props.value) : String(props.value || '')
    return () => h('span', { class: 'text-sm text-slate-700' }, displayValue)
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
      type: [String, Number, Boolean],
      default: ''
    }
  },
  setup(props) {
    return () => h('span', { class: 'text-sm text-slate-700' }, toDateOnly(props.value))
  }
})

const checkboxColumnWidth = 50
const idColumnWidth = 120

const columns: TableColumn[] = [
  { id: 'name', header: '서버 이름', size: 140, cellComponent: TextCell },
  { id: 'ip', header: 'IP', size: 130, cellComponent: TextCell },
  { id: 'location', header: '위치', size: 120, cellComponent: TextCell },
  { id: 'vm_count', header: 'VM 수', size: 90, cellComponent: TextCell },
  { id: 'reg_date', header: '등록일자', size: 160, cellComponent: DateOnlyCell }
]

const defaultVisibleColumns = ['name', 'ip', 'location', 'vm_count', 'reg_date']

const rawData = computed(() => physicalServerStore.items)

const formFields: FormField[] = [
  {
    id: 'ps_id',
    label: '물리 서버 ID',
    type: 'text',
    required: true,
    placeholder: '최대 8자',
    maxLength: 8,
    readonlyInEdit: true
  },
  { id: 'name', label: '이름', type: 'text', required: true, placeholder: '최대 16자', maxLength: 16 },
  { id: 'ip', label: 'IP', type: 'ip', required: true, placeholder: '' },
  {
    id: 'location',
    label: '위치',
    type: 'select',
    required: true,
    placeholder: '위치 선택',
    options: [
      { value: '교통 센터', label: '교통 센터' },
      { value: '김천 본사', label: '김천 본사' }
    ]
  },
  {
    id: 'vm_count',
    label: 'VM 수',
    type: 'number',
    required: false,
    placeholder: '0',
    min: 0
  }
]

const handleDataUpdate = async (data: Record<string, any>, isNew: boolean) => {
  if (isSubmitting.value || physicalServerStore.isLoading) return
  try {
    isSubmitting.value = true
    if (isNew) {
      const psId = String(data.ps_id ?? '').trim().slice(0, 8)
      const payload = { ...data, ps_id: psId }
      await physicalServerStore.createPhysicalServer(payload as PhysicalServer)
    } else {
      await physicalServerStore.updatePhysicalServer(data.ps_id, data)
    }
    await physicalServerStore.fetchPhysicalServers(true)
    tableRefreshKey.value += 1
    alertStore.show(isNew ? '신규 생성 완료' : '수정 완료', 'success')
    tableRef.value?.closeModal?.()
  } catch (error: any) {
    const detail =
      error.response?.data?.detail || physicalServerStore.error || ''
    const detailText =
      typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
          ? detail.map((d: any) => d?.msg ?? d).join(', ')
          : detail?.message ?? ''
    const lower = detailText.toLowerCase()
    const isDuplicate =
      lower.includes('duplicate') ||
      lower.includes('already exists') ||
      lower.includes('unique') ||
      detailText.includes('고유 제약') ||
      detailText.includes('키가 이미 있습니다')
    const errorMessage = isDuplicate
      ? '이미 존재하는 물리 서버 ID입니다. 다른 값을 입력해주세요.'
      : detailText || '데이터 저장 중 오류가 발생했습니다.'
    alertStore.show(errorMessage, 'error')
  } finally {
    isSubmitting.value = false
  }
}

const handleDataDelete = async (ids: string[]) => {
  if (isSubmitting.value || physicalServerStore.isLoading) return
  try {
    isSubmitting.value = true
    await physicalServerStore.deletePhysicalServers(ids)
    await physicalServerStore.fetchPhysicalServers(true)
    tableRefreshKey.value += 1
    alertStore.show('삭제 완료', 'success')
  } catch (error: any) {
    const errorMessage =
      physicalServerStore.error ||
      error.response?.data?.detail ||
      '데이터 삭제 중 오류가 발생했습니다.'
    alertStore.show(errorMessage, 'error')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  try {
    await physicalServerStore.fetchPhysicalServers()
  } catch (_error) {}
})
</script>

<style scoped>
/* 스타일은 Table 컴포넌트에 포함되어 있음 */
</style>
