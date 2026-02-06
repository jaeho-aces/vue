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
    preference-key="vms_video_conversion_info"
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
import { useAlertStore } from '../../../stores/alert'

// Pinia 스토어 사용
const videoConversionStore = useVideoConversionInfoStore()
const commonCodeStore = useCommonCodeStore()
const alertStore = useAlertStore()
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

// 공통 코드 매핑용 범용 셀
const CodeMappedCell = (grpGbn: string, grpCode: string) => defineComponent({
  props: {
    value: {
      type: [String, Number],
      default: ''
    }
  },
  setup(props) {
    const mappedName = computed(() => {
      if (!props.value) return ''
      return commonCodeStore.getCodeName(grpGbn, grpCode, String(props.value))
    })
    return () => h('span', { class: 'text-sm text-slate-700' }, mappedName.value)
  }
})

const ResolutionCell = CodeMappedCell('C', '4')
const VideoFormatCell = CodeMappedCell('C', '5')
const StorageFormatCell = CodeMappedCell('C', '7')
const OutputResolutionCell = CodeMappedCell('C', '8')

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

// 컬럼 정의 (백엔드 스키마에 맞춤 - 실제 필드명은 API 응답 확인 후 수정 필요)
const columns: TableColumn[] = [
  { id: 'ch_id', header: '채널 구분자', size: 120, cellComponent: TextCell },
  { id: 'hq_code', header: '소속 본부', size: 120, cellComponent: TextCell }, // UI 매핑 필드
  { id: 'branch_code', header: '소속 지사', size: 120, cellComponent: TextCell }, // UI 매핑 필드
  { id: 'route_code', header: '노선', size: 120, cellComponent: TextCell }, // UI 매핑 필드
  { id: 'cctv_id', header: 'CCTV ID', size: 140, cellComponent: TextCell },
  { id: 'trans_id', header: '영상변환 서버 ID', size: 140, cellComponent: TextCell },
  { id: 'fms_id', header: '미디어 서버 ID', size: 140, cellComponent: TextCell },
  { id: 'ch_venc', header: '인코딩 방식', size: 100, cellComponent: VideoFormatCell },
  { id: 'ch_vsize', header: '영상 크기', size: 100, cellComponent: ResolutionCell },
  { id: 'ch_vfps', header: 'FPS', size: 80, cellComponent: TextCell },
  { id: 'ch_vkpbs', header: 'BPS', size: 100, cellComponent: TextCell },
  { id: 'ch_alive', header: '동작여부', size: 80, cellComponent: StatusCell },
  { id: 'ch_alive_time', header: '최종 확인 시간', size: 160, cellComponent: DateOnlyCell },
  { id: 'ch_alive_yn', header: '동작 확인 여부', size: 100, cellComponent: YesNoCell },
  { id: 'reg_date', header: '등록 일자', size: 160, cellComponent: DateOnlyCell },
  { id: 'job_status', header: '동작 상태', size: 100, cellComponent: TextCell },
  { id: 'json_job', header: 'JSON 작업', size: 100, cellComponent: YesNoCell },
  { id: 'json_yn', header: 'JSON 사용', size: 100, cellComponent: YesNoCell },
  { id: 'kt_cctv', header: 'KT 개시지점', size: 140, cellComponent: TextCell },
  { id: 'ch_wmv_yn', header: 'WMV 저장', size: 100, cellComponent: YesNoCell },
  { id: 'ch_wmv_venc', header: 'WMV 형식', size: 100, cellComponent: StorageFormatCell },
  { id: 'ch_wmv_vsize', header: 'WMV 크기', size: 100, cellComponent: OutputResolutionCell },
  { id: 'sms_session', header: 'SMS 세션', size: 140, cellComponent: TextCell },
  { id: 'sms_host_ip', header: 'SMS 호스트 IP', size: 140, cellComponent: TextCell },
  { id: 'ch_jpg_size', header: 'JPG 크기', size: 100, cellComponent: OutputResolutionCell },
  { id: 'ch_jpg_kbps', header: 'JPG BPS', size: 100, cellComponent: TextCell }
]

// 기본 표시 컬럼
const defaultVisibleColumns = [
  'ch_id', 'hq_code', 'route_code', 'cctv_id', 'trans_id', 'fms_id', 'ch_alive', 'ch_alive_time', 'reg_date'
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
  { id: 'ch_id', label: '채널 구분자', type: 'text', required: true, placeholder: '예: CH000XXXXX' },
  { id: 'cctv_id', label: 'CCTV ID', type: 'text', required: true, placeholder: '예: CCTV000XXXXX' },
  { id: 'trans_id', label: '영상 변환 서버 ID', type: 'text', required: true, placeholder: '예: TR0000XXXX' },
  { id: 'fms_id', label: '미디어 서버 ID', type: 'text', required: true, placeholder: '예: FMS0000XXXX' },
  { id: 'ch_venc', label: '영상 인코딩 방식', type: 'text', required: true },
  { id: 'ch_vsize', label: '영상 크기', type: 'text' },
  { id: 'ch_vfps', label: '영상 FPS', type: 'text', placeholder: '2~30' },
  { id: 'ch_vkpbs', label: '영상 BPS', type: 'text', placeholder: '00000~99999' },
  { id: 'ch_alive', label: '채널 동작여부', type: 'text', placeholder: 'Y / N' },
  { id: 'ch_alive_yn', label: '동작 확인 여부', type: 'text', placeholder: 'Y / N' },
  { id: 'reg_date', label: '등록 일자', type: 'text', required: true, placeholder: 'YYYY/MM/DD HH:mm:SS' },
  { id: 'json_job', label: 'JSON 작업', type: 'text', required: true, placeholder: 'Y / N' },
  { id: 'json_yn', label: 'JSON 사용 여부', type: 'text', required: true, placeholder: 'Y / N' },
  { id: 'json_date', label: 'JSON 사용 시간', type: 'text', required: true, placeholder: 'YYYY/MM/DD HH:mm:SS' },
  { id: 'kt_cctv', label: 'KT 개시지점 이름', type: 'text' },
  { id: 'ch_wmv_yn', label: 'WMV 저장 여부', type: 'text', placeholder: 'Y / N' },
  { id: 'ch_wmv_venc', label: 'WMV 저장 형식', type: 'text', required: true },
  { id: 'ch_wmv_vsize', label: 'WMV 영상 크기', type: 'text', required: true },
  { id: 'ch_wmv_vfps', label: 'WMV FPS', type: 'text', placeholder: '2~30' },
  { id: 'ch_wmv_vkpbs', label: 'WMV 영상 BPS', type: 'text', placeholder: '00000~99999' },
  { id: 'sms_session', label: 'SMS 세션 이름', type: 'text' },
  { id: 'sms_host_ip', label: 'SMS 호스트 IP', type: 'text', placeholder: 'A.B.C.D 형식' },
  { id: 'sms_date', label: 'SMS 전송 날짜', type: 'text', placeholder: 'YYYY/MM/DD HH:mm:SS' },
  { id: 'job_status', label: '동작 상태', type: 'text' },
  { id: 'ch_jpg_size', label: 'JPG 크기', type: 'text', required: true },
  { id: 'ch_jpg_kbps', label: 'JPG BPS', type: 'text', placeholder: '00000~99999' },
  { id: 'ch_jpg_keep_count', label: 'JPG 파일 유지 개수', type: 'text', placeholder: '0~20' }
]

// 일괄 변경용 폼 필드 (ID 제외, 필수 항목도 선택적으로 변경 가능)
const batchFormFields: FormField[] = [
  { id: 'ch_venc', label: '영상 인코딩 방식', type: 'text' },
  { id: 'ch_vsize', label: '영상 크기', type: 'text' },
  { id: 'ch_vfps', label: '영상 FPS', type: 'text' },
  { id: 'ch_vkpbs', label: '영상 BPS', type: 'text' },
  { id: 'ch_alive', label: '채널 동작여부', type: 'text' },
  { id: 'json_job', label: 'JSON 작업', type: 'text' },
  { id: 'json_yn', label: 'JSON 사용 여부', type: 'text' },
  { id: 'ch_wmv_yn', label: 'WMV 저장 여부', type: 'text' },
  { id: 'ch_jpg_keep_count', label: 'JPG 파일 유지 개수', type: 'text' }
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
    alertStore.show(isNew ? '신규 생성 완료' : '수정 완료', 'success')
  } catch (error: any) {
    console.error('데이터 저장 실패:', error)
    const errorMessage = videoConversionStore.error || error.response?.data?.detail || '데이터 저장 중 오류가 발생했습니다.'
    alertStore.show(errorMessage, 'error')
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
    alertStore.show('삭제 완료', 'success')
  } catch (error: any) {
    console.error('데이터 삭제 실패:', error)
    const errorMessage = videoConversionStore.error || error.response?.data?.detail || '데이터 삭제 중 오류가 발생했습니다.'
    alertStore.show(errorMessage, 'error')
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
    alertStore.show('선택된 항목이 없습니다.', 'warning')
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
      alertStore.show('선택된 항목이 없습니다.', 'warning')
      return
    }
    
    await videoConversionStore.batchUpdateVideoConversions(selectedIds, data)
    handleBatchModalClose()
    alertStore.show(`일괄 변경 완료: ${selectedIds.length}개 항목`, 'success')
  } catch (error: any) {
    console.error('일괄 변경 실패:', error)
    const errorMessage = videoConversionStore.error || error.response?.data?.detail || '일괄 변경 중 오류가 발생했습니다.'
    alertStore.show(errorMessage, 'error')
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
