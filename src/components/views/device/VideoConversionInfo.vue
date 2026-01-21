<template>
  <Table
    ref="tableRef"
    :model-value="rawData"
    :columns="columns"
    :default-visible-columns="defaultVisibleColumns"
    :form-fields="formFields"
    modal-title="영상변환 채널정보"
    :checkbox-column-width="checkboxColumnWidth"
    :id-column-width="idColumnWidth"
    id-field="ch_id"
    @update="handleDataUpdate"
    @delete="handleDataDelete"
  >
    <template #toolbar-actions-left>
      <Button @click="handleBatchUpdate" variant="info" :disabled="isBatchButtonDisabled">
        일괄 변경
      </Button>
    </template>
  </Table>
  
  <!-- 일괄 변경 모달 -->
  <DataFormModal
    v-if="batchFormFields && batchFormFields.length > 0"
    :is-open="isBatchModalOpen"
    title="일괄 변경"
    :fields="batchFormFields"
    :initial-data="batchUpdateData || undefined"
    @close="handleBatchModalClose"
    @submit="handleBatchModalSubmit"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, nextTick, defineComponent, h, ref } from 'vue'
import Table, { type TableColumn } from '../../common/Table.vue'
import { type FormField } from '../../common/DataFormModal.vue'
import Button from '../../common/Button.vue'
import DataFormModal from '../../common/DataFormModal.vue'
import { useVideoConversionInfoStore, type VideoConversion } from '../../../stores/videoConversionInfo'
import { useCommonCodeStore } from '../../../stores/commonCode'

// Pinia 스토어 사용
const videoConversionStore = useVideoConversionInfoStore()
const commonCodeStore = useCommonCodeStore()
const isSubmitting = ref(false) // 중복 요청 방지

// Table 컴포넌트 참조
const tableRef = ref<InstanceType<typeof Table> | null>(null)

// 일괄 변경 모달 상태
const isBatchModalOpen = ref(false)
const batchUpdateData = ref<Partial<VideoConversion>>({})

// 일괄 변경 버튼 비활성화 상태
const isBatchButtonDisabled = computed(() => {
  return !tableRef.value?.selectedRowIds || tableRef.value.selectedRowIds.size === 0
})

// 셀 컴포넌트들
const TextCell = defineComponent({
  props: {
    value: {
      type: [String, Number, Boolean],
      default: ''
    }
  },
  setup(props) {
    const displayValue = typeof props.value === 'boolean' 
      ? String(props.value)
      : String(props.value || '')
    return () => h('span', { class: 'text-sm text-slate-700' }, displayValue)
  }
})

const LiveCell = defineComponent({
  props: {
    value: {
      type: [String, Number, Boolean],
      default: ''
    }
  },
  setup(props) {
    const isLive = props.value === 'Y' || props.value === true || props.value === 'true'
    return () => h('div', { class: 'text-center' }, [
      h('span', {
        class: [
          'inline-block w-2 h-2 rounded-full',
          isLive ? 'bg-red-500 animate-pulse' : 'bg-slate-300'
        ]
      })
    ])
  }
})

const StatusCell = defineComponent({
  props: {
    value: {
      type: [String, Number, Boolean],
      default: ''
    }
  },
  setup(props) {
    const statusValue = typeof props.value === 'boolean' 
      ? (props.value ? 'active' : 'inactive')
      : String(props.value || '')
    
    const statusClass = statusValue === 'active' ? 'bg-green-50 text-green-700' :
                       statusValue === 'warning' ? 'bg-orange-50 text-orange-700' :
                       'bg-slate-100 text-slate-600'
    const dotClass = statusValue === 'active' ? 'bg-green-500' :
                     statusValue === 'warning' ? 'bg-orange-500' :
                     'bg-slate-400'
    
    return () => h('span', {
      class: ['inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', statusClass]
    }, [
      h('span', { class: ['w-1.5 h-1.5 rounded-full', dotClass] }),
      statusValue.toUpperCase()
    ])
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
    const isYes = props.value === 'Y' || props.value === true || props.value === 'true'
    return () => h('span', {
      class: [
        'inline-block px-2 py-0.5 rounded text-xs font-bold',
        isYes ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
      ]
    }, isYes ? 'Y' : 'N')
  }
})

// 기본 컬럼 너비 설정
const checkboxColumnWidth = 50
const idColumnWidth = 120
const columnWidths = [110, 110, 130, 110, 110, 110, 130, 110, 120, 130, 120, 120, 110, 160]

// 컬럼 정의 (백엔드 스키마에 맞춤 - 실제 필드명은 API 응답 확인 후 수정 필요)
const columns: TableColumn[] = [
  { id: 'hq_code', header: '소속 본부', size: columnWidths[0], cellComponent: TextCell },
  { id: 'route_code', header: '노선', size: columnWidths[1], cellComponent: TextCell },
  { id: 'trans_name', header: '영상변환서버', size: columnWidths[2], cellComponent: TextCell },
  { id: 'live_yn', header: 'Live 생성', size: columnWidths[3], cellComponent: LiveCell },
  { id: 'status', header: '동작여부', size: columnWidths[4], cellComponent: StatusCell },
  { id: 'send_yn', header: '영상 전송', size: columnWidths[5], cellComponent: YesNoCell },
  { id: 'format', header: '영상변환 형식', size: columnWidths[6], cellComponent: TextCell },
  { id: 'size', header: '크기', size: columnWidths[7], cellComponent: TextCell },
  { id: 'fps', header: 'FPS', size: columnWidths[8], cellComponent: TextCell },
  { id: 'kbps', header: 'KBPS', size: columnWidths[9], cellComponent: TextCell },
  { id: 'jpg_res', header: 'JPG해상도', size: columnWidths[10], cellComponent: TextCell },
  { id: 'jpg_kbps', header: 'JPG KBPS', size: columnWidths[11], cellComponent: TextCell },
  { id: 'sms_yn', header: 'SMS송출', size: columnWidths[12], cellComponent: YesNoCell },
  { id: 'last_check', header: '최종 동작 확인 시점', size: columnWidths[13], cellComponent: TextCell },
  { id: 'branch_code', header: '소속 지사', size: columnWidths[0], cellComponent: TextCell },
  { id: 'area', header: '설치 지역', size: columnWidths[1], cellComponent: TextCell },
  { id: 'media_server_id', header: '미디어서버', size: columnWidths[2], cellComponent: TextCell },
  { id: 'jpg_yn', header: 'JPG 생성', size: columnWidths[3], cellComponent: YesNoCell },
  { id: 'wmv_yn', header: 'WMV 생성', size: columnWidths[4], cellComponent: YesNoCell },
  { id: 'save_yn', header: '영상 저장', size: columnWidths[5], cellComponent: YesNoCell },
  { id: 'wmv_conv_yn', header: 'WMV 변환', size: columnWidths[6], cellComponent: YesNoCell },
  { id: 'wmv_size', header: 'WMV 크기', size: columnWidths[7], cellComponent: TextCell },
  { id: 'wmv_fps', header: 'WMV FPS', size: columnWidths[8], cellComponent: TextCell },
  { id: 'wmv_kbps', header: 'WMV KBPS', size: columnWidths[9], cellComponent: TextCell },
  { id: 'max_save', header: '최대 저장', size: columnWidths[10], cellComponent: TextCell },
  { id: 'date_display_yn', header: '날짜 표시', size: columnWidths[11], cellComponent: YesNoCell },
  { id: 'sms_server', header: 'SMS 서버', size: columnWidths[12], cellComponent: TextCell },
  { id: 'reg_date', header: '등록 일자', size: columnWidths[13], cellComponent: TextCell }
]

// 기본 표시 컬럼
const defaultVisibleColumns = [
  'hq_code', 'route_code', 'trans_name', 'live_yn', 'status', 'send_yn', 
  'format', 'size', 'fps', 'kbps', 'sms_yn', 'last_check'
]

// 스토어의 데이터를 직접 참조 (computed 사용)
// 배열을 스프레드하여 새 참조를 반환하여 Table 컴포넌트의 watch가 확실히 감지하도록 함
const rawData = computed(() => {
  const items = videoConversionStore.items
  if (videoConversionStore.error) {
    console.error('영상변환 채널정보 스토어 에러:', videoConversionStore.error)
  }
  // 새 배열을 반환하여 참조 변경을 보장
  return [...items]
})

// 폼 필드 정의 (백엔드 스키마에 맞춤)
const formFields: FormField[] = [
  { id: 'ch_id', label: '채널 ID', type: 'text', required: true, placeholder: '예: TCH-001' },
  { id: 'hq_code', label: '소속 본부', type: 'text', required: true },
  { id: 'branch_code', label: '소속 지사', type: 'text', required: true },
  { id: 'route_code', label: '노선', type: 'text', required: true },
  { id: 'area', label: '설치 지역', type: 'text', required: true },
  { id: 'server_id', label: '영상변환서버', type: 'text', required: true },
  { id: 'media_server_id', label: '미디어서버', type: 'text', required: true },
  { id: 'live_yn', label: 'Live 생성', type: 'yesno', required: true },
  { 
    id: 'status', 
    label: '동작여부', 
    type: 'select', 
    required: true,
    options: [
      { value: 'active', label: '정상' },
      { value: 'warning', label: '경고' },
      { value: 'inactive', label: '비활성' }
    ]
  },
  { id: 'jpg_yn', label: 'JPG 생성', type: 'yesno', required: true },
  { id: 'wmv_yn', label: 'WMV 생성', type: 'yesno', required: true },
  { id: 'send_yn', label: '영상 전송', type: 'yesno', required: true },
  { id: 'save_yn', label: '영상 저장', type: 'yesno', required: true },
  { id: 'format', label: '영상변환 형식', type: 'text', required: true },
  { id: 'size', label: '크기', type: 'text', required: true },
  { id: 'fps', label: 'FPS', type: 'text', required: true },
  { id: 'kbps', label: 'KBPS', type: 'text', required: true },
  { id: 'wmv_conv_yn', label: 'WMV 변환', type: 'yesno', required: true },
  { id: 'wmv_size', label: 'WMV 크기', type: 'text' },
  { id: 'wmv_fps', label: 'WMV FPS', type: 'text' },
  { id: 'wmv_kbps', label: 'WMV KBPS', type: 'text' },
  { id: 'jpg_res', label: 'JPG해상도', type: 'text' },
  { id: 'jpg_kbps', label: 'JPG KBPS', type: 'text' },
  { id: 'max_save', label: '최대 저장', type: 'text' },
  { id: 'date_display_yn', label: '날짜 표시', type: 'yesno' },
  { id: 'sms_yn', label: 'SMS송출', type: 'yesno' },
  { id: 'sms_server', label: 'SMS 서버', type: 'text' },
  { id: 'last_check', label: '최종 동작 확인 시점', type: 'text', placeholder: 'YYYY-MM-DD HH:mm:ss' },
  { id: 'reg_date', label: '등록 일자', type: 'text', placeholder: 'YYYY-MM-DD' }
]

// 일괄 변경용 폼 필드 (ID 제외, 필수 항목도 선택적으로 변경 가능)
const batchFormFields: FormField[] = [
  { id: 'hq_code', label: '소속 본부', type: 'text', required: false },
  { id: 'branch_code', label: '소속 지사', type: 'text', required: false },
  { id: 'route_code', label: '노선', type: 'text', required: false },
  { id: 'area', label: '설치 지역', type: 'text', required: false },
  { id: 'server_id', label: '영상변환서버', type: 'text', required: false },
  { id: 'media_server_id', label: '미디어서버', type: 'text', required: false },
  { id: 'live_yn', label: 'Live 생성', type: 'yesno', required: false },
  { 
    id: 'status', 
    label: '동작여부', 
    type: 'select', 
    required: false,
    options: [
      { value: 'active', label: '정상' },
      { value: 'warning', label: '경고' },
      { value: 'inactive', label: '비활성' }
    ]
  },
  { id: 'jpg_yn', label: 'JPG 생성', type: 'yesno', required: false },
  { id: 'wmv_yn', label: 'WMV 생성', type: 'yesno', required: false },
  { id: 'send_yn', label: '영상 전송', type: 'yesno', required: false },
  { id: 'save_yn', label: '영상 저장', type: 'yesno', required: false },
  { id: 'format', label: '영상변환 형식', type: 'text', required: false },
  { id: 'size', label: '크기', type: 'text', required: false },
  { id: 'fps', label: 'FPS', type: 'text', required: false },
  { id: 'kbps', label: 'KBPS', type: 'text', required: false },
  { id: 'wmv_conv_yn', label: 'WMV 변환', type: 'yesno', required: false },
  { id: 'wmv_size', label: 'WMV 크기', type: 'text', required: false },
  { id: 'wmv_fps', label: 'WMV FPS', type: 'text', required: false },
  { id: 'wmv_kbps', label: 'WMV KBPS', type: 'text', required: false },
  { id: 'jpg_res', label: 'JPG해상도', type: 'text', required: false },
  { id: 'jpg_kbps', label: 'JPG KBPS', type: 'text', required: false },
  { id: 'max_save', label: '최대 저장', type: 'text', required: false },
  { id: 'date_display_yn', label: '날짜 표시', type: 'yesno', required: false },
  { id: 'sms_yn', label: 'SMS송출', type: 'yesno', required: false },
  { id: 'sms_server', label: 'SMS 서버', type: 'text', required: false }
]

// 데이터 업데이트 처리 (생성/수정)
const handleDataUpdate = async (data: Record<string, any>, isNew: boolean) => {
  if (isSubmitting.value || videoConversionStore.isLoading) {
    console.warn('이미 처리 중인 요청이 있습니다.')
    return
  }
  try {
    isSubmitting.value = true
    if (isNew) {
      await videoConversionStore.createVideoConversion(data as VideoConversion)
    } else {
      await videoConversionStore.updateVideoConversion(data.ch_id, data)
    }
  } catch (error: any) {
    console.error('데이터 저장 실패:', error)
    const errorMessage = videoConversionStore.error || error.response?.data?.detail || '데이터 저장 중 오류가 발생했습니다.'
    alert(errorMessage)
  } finally {
    isSubmitting.value = false
  }
}

// 데이터 삭제 처리
const handleDataDelete = async (ids: string[]) => {
  if (isSubmitting.value || videoConversionStore.isLoading) {
    console.warn('이미 처리 중인 요청이 있습니다.')
    return
  }
  try {
    isSubmitting.value = true
    await videoConversionStore.deleteVideoConversions(ids)
  } catch (error: any) {
    console.error('데이터 삭제 실패:', error)
    const errorMessage = videoConversionStore.error || error.response?.data?.detail || '데이터 삭제 중 오류가 발생했습니다.'
    alert(errorMessage)
  } finally {
    isSubmitting.value = false
  }
}

// 일괄 변경 버튼 핸들러
const handleBatchUpdate = () => {
  if (tableRef.value && tableRef.value.selectedRowIds && tableRef.value.selectedRowIds.size > 0) {
    batchUpdateData.value = {}
    isBatchModalOpen.value = true
  } else {
    alert('선택된 항목이 없습니다.')
  }
}

// 일괄 변경 모달 핸들러
const handleBatchModalClose = () => {
  isBatchModalOpen.value = false
  batchUpdateData.value = {}
}

const handleBatchModalSubmit = async (data: Record<string, any>) => {
  if (isSubmitting.value || videoConversionStore.isLoading) {
    console.warn('이미 처리 중인 요청이 있습니다.')
    return
  }
  
  try {
    isSubmitting.value = true
    
    // Table 컴포넌트에서 선택된 행 ID 가져오기
    const selectedIds = tableRef.value?.selectedRowIds 
      ? Array.from(tableRef.value.selectedRowIds)
      : []
    
    if (selectedIds.length === 0) {
      alert('선택된 항목이 없습니다.')
      return
    }
    
    await videoConversionStore.batchUpdateVideoConversions(selectedIds, data)
    handleBatchModalClose()
    alert(`일괄 변경 완료: ${selectedIds.length}개 항목`)
  } catch (error: any) {
    console.error('일괄 변경 실패:', error)
    const errorMessage = videoConversionStore.error || error.response?.data?.detail || '일괄 변경 중 오류가 발생했습니다.'
    alert(errorMessage)
  } finally {
    isSubmitting.value = false
  }
}

// 컴포넌트 마운트 시 데이터 로드
// fetchVideoConversions 내부에서 CommonCode 로드 및 매핑을 모두 처리
onMounted(async () => {
  try {
    await videoConversionStore.fetchVideoConversions()
    // nextTick으로 DOM 업데이트 대기
    await nextTick()
  } catch (error) {
    console.error('영상변환 채널정보 로드 실패:', error)
  }
})
</script>

<style scoped>
/* 스타일은 Table 컴포넌트에 포함되어 있음 */
</style>
