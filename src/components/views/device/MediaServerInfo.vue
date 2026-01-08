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

// Pinia 스토어 사용
const mediaServerStore = useMediaServerInfoStore()
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
const columnWidths = [150, 130, 100, 120, 120, 120, 120, 120, 180, 140, 120, 120]

// 컬럼 정의 (백엔드 스키마에 맞춤)
const columns: TableColumn[] = [
  { id: 'fms_name', header: '미디어 서버 이름', size: columnWidths[0], cellComponent: TextCell },
  { id: 'fms_ip', header: '미디어 서버 IP', size: columnWidths[1], cellComponent: TextCell },
  { id: 'fms_ext_ip', header: '외부 IP', size: columnWidths[1], cellComponent: TextCell },
  { id: 'fms_port', header: 'Port', size: columnWidths[2], cellComponent: TextCell },
  { id: 'fms_con_id', header: '접속 ID', size: columnWidths[3], cellComponent: TextCell },
  { id: 'fms_passwd', header: '접속 암호', size: columnWidths[7], cellComponent: TextCell },
  { id: 'svr_type', header: '서버 종류', size: columnWidths[4], cellComponent: TextCell },
  { id: 'alive', header: '동작 상태', size: columnWidths[6], cellComponent: StatusCell },
  { id: 'alive_time', header: '최종 확인 시간', size: columnWidths[9], cellComponent: TextCell }
]

// 기본 표시 컬럼
const defaultVisibleColumns = ['fms_name', 'fms_ip', 'fms_port', 'svr_type', 'alive', 'alive_time']

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
  { id: 'fms_id', label: '서버 ID', type: 'text', required: true, placeholder: '예: ms00001' },
  { id: 'fms_name', label: '미디어 서버 이름', type: 'text', required: true },
  { id: 'fms_ip', label: '미디어 서버 IP', type: 'text', required: true, placeholder: '예: 172.16.33.180' },
  { id: 'fms_ext_ip', label: '외부 IP', type: 'text', required: false, placeholder: '예: 192.168.1.151' },
  { id: 'fms_port', label: 'Port', type: 'number', required: true, placeholder: '예: 1935' },
  { id: 'fms_con_id', label: '접속 ID', type: 'text', required: false },
  { id: 'fms_passwd', label: '접속 암호', type: 'text', required: false },
  { 
    id: 'svr_type', 
    label: '서버 종류', 
    type: 'select', 
    required: true,
    options: [
      { value: 'Streaming', label: 'Streaming' },
      { value: 'Storage', label: 'Storage' },
      { value: 'Relay', label: 'Relay' },
      { value: 'WebRTC', label: 'WebRTC' }
    ]
  },
  { 
    id: 'alive', 
    label: '동작 상태', 
    type: 'select', 
    required: true,
    options: [
      { value: 'Y', label: '정상' },
      { value: 'N', label: '비활성' }
    ]
  },
  { id: 'alive_time', label: '최종 확인 시간', type: 'text', placeholder: 'YYYY-MM-DD HH:mm:ss' }
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
  } catch (error: any) {
    console.error('데이터 저장 실패:', error)
    const errorMessage = mediaServerStore.error || error.response?.data?.detail || '데이터 저장 중 오류가 발생했습니다.'
    alert(errorMessage)
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
  } catch (error: any) {
    console.error('데이터 삭제 실패:', error)
    const errorMessage = mediaServerStore.error || error.response?.data?.detail || '데이터 삭제 중 오류가 발생했습니다.'
    alert(errorMessage)
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
