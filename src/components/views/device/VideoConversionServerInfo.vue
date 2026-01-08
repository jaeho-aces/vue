<template>
  <Table
    :model-value="rawData"
    :columns="columns"
    :default-visible-columns="defaultVisibleColumns"
    :form-fields="formFields"
    modal-title="영상변환서버 정보"
    :checkbox-column-width="checkboxColumnWidth"
    :id-column-width="idColumnWidth"
    id-field="trans_id"
    @update="handleDataUpdate"
    @delete="handleDataDelete"
  >
    <template #toolbar-actions-left>
      <Button @click="handleRestart" variant="info">
        재시작
      </Button>
      <Button @click="handleStop" variant="info">
        중지
      </Button>
      <Button @click="handleSwUpdate" variant="info">
        SW 업데이트
      </Button>
    </template>
  </Table>
</template>

<script setup lang="ts">
import { computed, onMounted, defineComponent, h, ref } from 'vue'
import Table, { type TableColumn } from '../../common/Table.vue'
import { type FormField } from '../../common/DataFormModal.vue'
import Button from '../../common/Button.vue'
import { useVideoConversionServerInfoStore, type VideoConversionServer } from '../../../stores/videoConversionServerInfo'

// Pinia 스토어 사용
const videoConversionServerStore = useVideoConversionServerInfoStore()
const isSubmitting = ref(false) // 중복 요청 방지

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
    const valueStr = String(props.value || '').toUpperCase()
    const isAlive = valueStr === 'Y' || valueStr === 'TRUE' || props.value === true
    
    const statusClass = isAlive ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'
    const dotClass = isAlive ? 'bg-green-500' : 'bg-slate-400'
    const statusText = isAlive ? '정상' : '비활성'
    
    return () => h('span', {
      class: ['inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', statusClass]
    }, [
      h('span', { class: ['w-1.5 h-1.5 rounded-full', dotClass] }),
      statusText
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
    const isYes = props.value === 'Y' || props.value === true || props.value === 'true' || String(props.value).toUpperCase() === 'Y'
    return () => h('span', {
      class: [
        'inline-block px-2 py-0.5 rounded text-xs font-bold',
        isYes ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
      ]
    }, isYes ? 'Y' : 'N')
  }
})

// VideoConversionServer 인터페이스는 stores/videoConversionServerInfo.ts에서 import하므로 여기서는 제거

// 기본 컬럼 너비 설정
const checkboxColumnWidth = 50
const idColumnWidth = 150
const columnWidths = [200, 180, 150, 300, 150, 150, 150, 220, 180, 250]

// 컬럼 정의 (백엔드 스키마에 맞춤)
const columns: TableColumn[] = [
  { id: 'trans_name', header: '서버 이름', size: columnWidths[0], cellComponent: TextCell },
  { id: 'trans_ip', header: '서버 IP 주소', size: columnWidths[1], cellComponent: TextCell },
  { id: 'trans_port', header: '통신 포트 번호', size: columnWidths[2], cellComponent: TextCell },
  { id: 'alive', header: '동작 여부', size: columnWidths[5], cellComponent: StatusCell },
  { id: 'alive_time', header: '마지막 동작 확인 시간', size: columnWidths[7], cellComponent: TextCell },
  { id: 'json_job', header: 'JSON 처리', size: columnWidths[3], cellComponent: TextCell },
  { id: 'json_yn', header: 'JSON 사용 여부', size: columnWidths[4], cellComponent: YesNoCell },
  { id: 'json_date', header: '마지막 명령 처리 일자', size: columnWidths[6], cellComponent: TextCell },
  { id: 'version', header: '서버 버전', size: columnWidths[4], cellComponent: TextCell },
  { id: 'build_date', header: '실행 파일 생성 일자', size: columnWidths[6], cellComponent: TextCell },
  { id: 'start_date', header: '서버 실행 시작 시간', size: columnWidths[8], cellComponent: TextCell },
  { id: 'reg_date', header: '등록 일자', size: columnWidths[9], cellComponent: TextCell }
]

// 기본 표시 컬럼
const defaultVisibleColumns = ['trans_name', 'trans_ip', 'trans_port', 'alive', 'alive_time', 'version', 'reg_date']

// 스토어의 데이터를 직접 참조 (computed 사용)
const rawData = computed(() => {
  console.log('영상변환서버 정보 데이터:', videoConversionServerStore.items.length, '개')
  if (videoConversionServerStore.error) {
    console.error('영상변환서버 정보 스토어 에러:', videoConversionServerStore.error)
  }
  return videoConversionServerStore.items
})

// 폼 필드 정의 (백엔드 스키마에 맞춤)
const formFields: FormField[] = [
  { id: 'trans_id', label: '구분자', type: 'text', required: true, placeholder: '예: TCS-001' },
  { id: 'trans_name', label: '서버 이름', type: 'text', required: true },
  { id: 'trans_ip', label: '서버 IP 주소', type: 'text', required: true, placeholder: '예: 192.168.1.101' },
  { id: 'trans_port', label: '통신 포트 번호', type: 'number', required: true, placeholder: '예: 8080' },
  { 
    id: 'alive', 
    label: '동작 여부', 
    type: 'select', 
    required: true,
    options: [
      { value: 'Y', label: '정상' },
      { value: 'N', label: '비활성' }
    ]
  },
  { id: 'alive_time', label: '마지막 동작 확인 시간', type: 'text', placeholder: 'YYYY-MM-DD HH:mm:ss' },
  { id: 'json_job', label: 'JSON 처리', type: 'text', required: false },
  { id: 'json_yn', label: 'JSON 사용 여부', type: 'yesno', required: true },
  { id: 'json_date', label: '마지막 명령 처리 일자', type: 'text', placeholder: 'YYYY-MM-DD' },
  { id: 'version', label: '서버 버전', type: 'text', required: true },
  { id: 'build_date', label: '실행 파일 생성 일자', type: 'text', placeholder: 'YYYY-MM-DD' },
  { id: 'start_date', label: '서버 실행 시작 시간', type: 'text', placeholder: 'YYYY-MM-DD HH:mm:ss' },
  { id: 'reg_date', label: '등록 일자', type: 'text', placeholder: 'YYYY-MM-DD' }
]

// 데이터 업데이트 처리 (생성/수정)
const handleDataUpdate = async (data: Record<string, any>, isNew: boolean) => {
  if (isSubmitting.value || videoConversionServerStore.isLoading) {
    console.warn('이미 처리 중인 요청이 있습니다.')
    return
  }
  try {
    isSubmitting.value = true
    if (isNew) {
      await videoConversionServerStore.createVideoConversionServer(data as VideoConversionServer)
    } else {
      await videoConversionServerStore.updateVideoConversionServer(data.trans_id, data)
    }
  } catch (error: any) {
    console.error('데이터 저장 실패:', error)
    const errorMessage = videoConversionServerStore.error || error.response?.data?.detail || '데이터 저장 중 오류가 발생했습니다.'
    alert(errorMessage)
  } finally {
    isSubmitting.value = false
  }
}

// 데이터 삭제 처리
const handleDataDelete = async (ids: string[]) => {
  if (isSubmitting.value || videoConversionServerStore.isLoading) {
    console.warn('이미 처리 중인 요청이 있습니다.')
    return
  }
  try {
    isSubmitting.value = true
    await videoConversionServerStore.deleteVideoConversionServers(ids)
  } catch (error: any) {
    console.error('데이터 삭제 실패:', error)
    const errorMessage = videoConversionServerStore.error || error.response?.data?.detail || '데이터 삭제 중 오류가 발생했습니다.'
    alert(errorMessage)
  } finally {
    isSubmitting.value = false
  }
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(async () => {
  try {
    await videoConversionServerStore.fetchVideoConversionServers()
    console.log('영상변환서버 정보 로드 완료:', videoConversionServerStore.items.length, '개')
    if (videoConversionServerStore.error) {
      console.error('영상변환서버 정보 로드 에러:', videoConversionServerStore.error)
    }
  } catch (error) {
    console.error('영상변환서버 정보 로드 실패:', error)
  }
})

// 재시작 버튼 핸들러
const handleRestart = () => {
  console.log('재시작 클릭')
  // TODO: 서버 재시작 로직 구현
}

// 중지 버튼 핸들러
const handleStop = () => {
  console.log('중지 클릭')
  // TODO: 서버 중지 로직 구현
}

// SW 업데이트 버튼 핸들러
const handleSwUpdate = () => {
  console.log('SW 업데이트 클릭')
  // TODO: SW 업데이트 로직 구현
}
</script>

<style scoped>
/* 스타일은 Table 컴포넌트에 포함되어 있음 */
</style>
