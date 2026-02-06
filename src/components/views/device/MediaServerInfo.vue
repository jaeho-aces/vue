<template>
  <Table
    :model-value="rawData"
    :columns="columns"
    :default-visible-columns="defaultVisibleColumns"
    :form-fields="formFields"
    modal-title="미디어 서버 정보"
    :checkbox-column-width="checkboxColumnWidth"
    :id-column-width="idColumnWidth"
    id-field="fms_id"
    preference-key="vms_media_server_info"
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
import { useMediaServerInfoStore, type MediaServer } from '../../../stores/mediaServerInfo'
import { useCommonCodeStore } from '../../../stores/commonCode'
import { useAlertStore } from '../../../stores/alert'

// Pinia 스토어 사용
const mediaServerStore = useMediaServerInfoStore()
const commonCodeStore = useCommonCodeStore()
const alertStore = useAlertStore()
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
    // Boolean 값 처리
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
    // Boolean 값 처리: true -> 'Y', false -> 'N'
    const statusValue = typeof props.value === 'boolean' 
      ? (props.value ? 'Y' : 'N')
      : String(props.value || '')
    
    const statusClass = statusValue === 'Y' || statusValue === 'active' ? 'bg-green-50 text-green-700' :
                       statusValue === 'warning' ? 'bg-orange-50 text-orange-700' :
                       'bg-slate-100 text-slate-600'
    const dotClass = statusValue === 'Y' || statusValue === 'active' ? 'bg-green-500' :
                     statusValue === 'warning' ? 'bg-orange-500' :
                     'bg-slate-400'
    
    const displayText = statusValue === 'Y' ? '정상' : 
                       statusValue === 'N' ? '비활성' :
                       statusValue.toUpperCase()
    
    return () => h('span', {
      class: ['inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', statusClass]
    }, [
      h('span', { class: ['w-1.5 h-1.5 rounded-full', dotClass] }),
      displayText
    ])
  }
})

// MediaServer 인터페이스는 stores/mediaServerInfo.ts에서 import하므로 여기서는 제거

// 기본 컬럼 너비 설정
const checkboxColumnWidth = 50
const idColumnWidth = 120

const ServerTypeCell = defineComponent({
  props: {
    value: {
      type: [String, Number],
      default: ''
    }
  },
  setup(props) {
    const mappedName = computed(() => {
      if (!props.value) return ''
      return commonCodeStore.getCodeName('C', '11', String(props.value))
    })
    return () => h('span', { class: 'text-sm text-slate-700' }, mappedName.value)
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

// 컬럼 정의 (백엔드 스키마에 맞춤)
const columns: TableColumn[] = [
  { id: 'fms_id', header: '미디어 서버 구분자', size: 140, cellComponent: TextCell },
  { id: 'fms_name', header: '미디어 서버 이름', size: 150, cellComponent: TextCell },
  { id: 'fms_ip', header: '미디어 서버 IP', size: 130, cellComponent: TextCell },
  { id: 'fms_ext_ip', header: '외부 주소', size: 130, cellComponent: TextCell },
  { id: 'fms_port', header: '포트 번호', size: 100, cellComponent: TextCell },
  { id: 'fms_con_id', header: '사용자 ID', size: 120, cellComponent: TextCell },
  { id: 'svr_type', header: '서버 종류', size: 120, cellComponent: ServerTypeCell },
  { id: 'alive', header: '동작 여부', size: 100, cellComponent: StatusCell },
  { id: 'alive_time', header: '최종 확인 시간', size: 180, cellComponent: DateOnlyCell },
  { id: 'json_job', header: 'JSON 가능', size: 120, cellComponent: TextCell },
  { id: 'json_yn', header: 'JSON 사용', size: 100, cellComponent: YesNoCell }
]

// 기본 표시 컬럼
const defaultVisibleColumns = [
  'fms_id', 'fms_name', 'fms_ip', 'fms_port', 'svr_type', 'alive', 'alive_time'
]

// 스토어의 데이터를 직접 참조 (computed 사용)
const rawData = computed(() => {
  console.log('미디어 서버 데이터:', mediaServerStore.items.length, '개')
  if (mediaServerStore.error) {
    console.error('미디어 서버 스토어 에러:', mediaServerStore.error)
  }
  return mediaServerStore.items
})

// 폼 필드 정의 (백엔드 스키마에 맞춤)
const formFields: FormField[] = [
  { id: 'fms_id', label: '미디어 서버 구분자', type: 'text', required: true, placeholder: '예: FMS0000XXXX' },
  { id: 'fms_name', label: '미디어 서버 이름', type: 'text', required: true, placeholder: '한글/영문' },
  { id: 'fms_ip', label: '미디어 서버 IP 주소', type: 'text', required: true, placeholder: '예: 172.16.33.180' },
  { id: 'fms_ext_ip', label: '외부 주소', type: 'text', placeholder: '예: 192.168.1.151' },
  { id: 'fms_port', label: '서버 포트 번호', type: 'number', placeholder: '0~65535' },
  { id: 'fms_con_id', label: '사용자 ID', type: 'text' },
  { id: 'fms_passwd', label: '사용자 암호', type: 'text' }, // 암호화 필드이나 UI에서는 텍스트로 처리
  { id: 'svr_type', label: '미디어 서버 종류', type: 'text', required: true },
  { id: 'alive', label: '동작 여부', type: 'text', placeholder: 'Y / N' },
  { id: 'alive_time', label: '최종 확인 시간', type: 'text', placeholder: 'YYYY/MM/DD HH:mm:SS' },
  { id: 'json_job', label: 'JSON 프로토콜 가능 여부', type: 'text' },
  { id: 'json_yn', label: 'JSON 프로토콜 사용 여부', type: 'text', placeholder: 'Y / N' }
]

// 데이터 업데이트 처리 (생성/수정)
const handleDataUpdate = async (data: Record<string, any>, isNew: boolean) => {
  if (isSubmitting.value || mediaServerStore.isLoading) {
    console.warn('이미 처리 중인 요청이 있습니다.')
    return
  }
  try {
    isSubmitting.value = true
    if (isNew) {
      await mediaServerStore.createMediaServer(data as MediaServer)
    } else {
      await mediaServerStore.updateMediaServer(data.fms_id, data)
    }
    alertStore.show(isNew ? '신규 생성 완료' : '수정 완료', 'success')
  } catch (error: any) {
    console.error('데이터 저장 실패:', error)
    const errorMessage = mediaServerStore.error || error.response?.data?.detail || '데이터 저장 중 오류가 발생했습니다.'
    alertStore.show(errorMessage, 'error')
  } finally {
    isSubmitting.value = false
  }
}

// 데이터 삭제 처리
const handleDataDelete = async (ids: string[]) => {
  if (isSubmitting.value || mediaServerStore.isLoading) {
    console.warn('이미 처리 중인 요청이 있습니다.')
    return
  }
  try {
    isSubmitting.value = true
    await mediaServerStore.deleteMediaServers(ids)
    alertStore.show('삭제 완료', 'success')
  } catch (error: any) {
    console.error('데이터 삭제 실패:', error)
    const errorMessage = mediaServerStore.error || error.response?.data?.detail || '데이터 삭제 중 오류가 발생했습니다.'
    alertStore.show(errorMessage, 'error')
  } finally {
    isSubmitting.value = false
  }
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(async () => {
  try {
    await mediaServerStore.fetchMediaServers()
    console.log('미디어 서버 정보 로드 완료:', mediaServerStore.items.length, '개')
    if (mediaServerStore.error) {
      console.error('미디어 서버 정보 로드 에러:', mediaServerStore.error)
    }
  } catch (error) {
    console.error('미디어 서버 정보 로드 실패:', error)
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
