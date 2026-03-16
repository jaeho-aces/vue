<template>
  <Table
    ref="tableRef"
    :model-value="rawData"
    :columns="columns"
    :default-visible-columns="defaultVisibleColumns"
    :form-fields="formFields"
    modal-title="미디어 정보"
    :checkbox-column-width="checkboxColumnWidth"
    :id-column-width="idColumnWidth"
    id-field="seq"
    preference-key="vms_media_info"
    hide-new-button
    hide-edit-button
    @update="handleDataUpdate"
    @delete="handleDataDelete"
  >
  </Table>
</template>

<script setup lang="ts">
import { computed, onMounted, defineComponent, h, ref } from 'vue'
import Table, { type TableColumn } from '../../common/Table.vue'
import { type FormField } from '../../common/DataFormModal.vue'
import { useMediaInfoStore, type Media } from '../../../stores/mediaInfo'
import { useAlertStore } from '../../../stores/alert'

// Pinia 스토어 사용
const mediaStore = useMediaInfoStore()
const alertStore = useAlertStore()
const isSubmitting = ref(false) // 중복 요청 방지

// 셀 컴포넌트들
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

const YesNoCell = defineComponent({
  props: {
    value: {
      type: [String, Number, Boolean],
      default: ''
    }
  },
  setup(props) {
    const isYes = props.value === 'Y' || props.value === true || props.value === 'true' || String(props.value).toUpperCase() === 'Y'
    return () => h('span', {
      class: [
        'inline-block px-2 py-0.5 rounded text-xs font-bold',
        isYes ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
      ]
    }, isYes ? 'Y' : 'N')
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

const tableRef = ref<InstanceType<typeof Table> | null>(null)

// 컬럼 정의 (백엔드 스키마에 맞춤)
const columns: TableColumn[] = [
  { id: 'seq', header: '미디어 번호', size: 100, cellComponent: TextCell },
  { id: 'gbn', header: '구분 번호', size: 100, cellComponent: TextCell },
  { id: 'camid', header: '카메라 번호', size: 100, cellComponent: TextCell },
  { id: 'title', header: '내용 (타이틀)', size: 150, cellComponent: TextCell },
  { id: 'rtmp', header: 'RTMP 경로', size: 150, cellComponent: TextCell },
  { id: 'live', header: 'Live 경로', size: 150, cellComponent: TextCell },
  { id: 'stream', header: '스트림 URL', size: 200, cellComponent: TextCell },
  { id: 'stream1', header: '스트림 URL 1', size: 200, cellComponent: TextCell },
  { id: 'kt_cctv', header: 'KT 시작 지점', size: 120, cellComponent: TextCell },
  { id: 'state', header: '상태', size: 90, cellComponent: YesNoCell },
  { id: 'reg_date', header: '등록 일자', size: 160, cellComponent: DateOnlyCell }
]

// 기본 표시 컬럼
const defaultVisibleColumns = ['seq', 'camid', 'title', 'state', 'reg_date']

// 스토어의 데이터를 직접 참조 (computed 사용)
const rawData = computed(() => mediaStore.items)

// 폼 필드 정의
const formFields: FormField[] = [
  { id: 'seq', label: '미디어 번호', type: 'text', required: true, placeholder: '00000~99999', readonlyInEdit: true },
  { id: 'gbn', label: '구분 번호', type: 'text', placeholder: '코드(C1)' },
  { id: 'camid', label: '카메라 번호', type: 'text', required: true, placeholder: '00000~99999' },
  { id: 'title', label: '내용 (타이틀)', type: 'text', placeholder: '한글/영문' },
  { id: 'rtmp', label: 'RTMP 경로 이름', type: 'text', placeholder: '스트리밍 경로' },
  { id: 'live', label: 'Live 경로 이름', type: 'text', placeholder: '스트리밍 경로' },
  { id: 'stream', label: '최종 스트림 URL', type: 'text', placeholder: 'URL 형식' },
  { id: 'stream1', label: '최종 스트림 URL 1', type: 'text', placeholder: 'URL 형식' },
  { id: 'kt_cctv', label: 'KT 시작 지점', type: 'text', placeholder: '한글/영문' },
  { id: 'state', label: '현재 상태', type: 'text', placeholder: 'Y / N' },
  { id: 'reg_date', label: '등록 일자', type: 'text', placeholder: 'YYYY/MM/DD HH:mm:SS' }
]

// 데이터 업데이트 처리 (생성/수정)
const handleDataUpdate = async (data: Record<string, any>, isNew: boolean) => {
  if (isSubmitting.value || mediaStore.isLoading) return
  try {
    isSubmitting.value = true
    if (isNew) {
      await mediaStore.createMedia(data as Media)
    } else {
      await mediaStore.updateMedia(data.seq, data)
    }
    await mediaStore.fetchMediaList(true)
    alertStore.show(isNew ? '신규 생성 완료' : '수정 완료', 'success')
    tableRef.value?.closeModal?.()
  } catch (error: any) {
    const errorMessage = mediaStore.error || error.response?.data?.detail || '데이터 저장 중 오류가 발생했습니다.'
    alertStore.show(errorMessage, 'error')
  } finally {
    isSubmitting.value = false
  }
}

// 데이터 삭제 처리
const handleDataDelete = async (ids: string[]) => {
  if (isSubmitting.value || mediaStore.isLoading) return
  try {
    isSubmitting.value = true
    await mediaStore.deleteMediaList(ids)
    await mediaStore.fetchMediaList(true)
    alertStore.show('삭제 완료', 'success')
  } catch (error: any) {
    const errorMessage = mediaStore.error || error.response?.data?.detail || '데이터 삭제 중 오류가 발생했습니다.'
    alertStore.show(errorMessage, 'error')
  } finally {
    isSubmitting.value = false
  }
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(async () => {
  try {
    await mediaStore.fetchMediaList()
  } catch (_error) {}
})
</script>

<style scoped>
/* 스타일은 Table 컴포넌트에 포함되어 있음 */
</style>
