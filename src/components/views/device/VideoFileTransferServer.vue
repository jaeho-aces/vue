<template>
  <Table
    :model-value="rawData"
    :columns="columns"
    :default-visible-columns="defaultVisibleColumns"
    :form-fields="formFields"
    modal-title="영상 파일 전송 서버 정보"
    :checkbox-column-width="checkboxColumnWidth"
    :id-column-width="idColumnWidth"
    id-field="fts_id"
    preference-key="vms_video_file_transfer_server"
    @update="handleDataUpdate"
    @delete="handleDataDelete"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, defineComponent, h, ref } from 'vue'
import Table, { type TableColumn } from '../../common/Table.vue'
import { type FormField } from '../../common/DataFormModal.vue'
import { useVideoFileTransferServerStore, type VideoFileTransferServer } from '../../../stores/videoFileTransferServerInfo'
import { useCommonCodeStore } from '../../../stores/commonCode'
import { useAlertStore } from '../../../stores/alert'

// Pinia 스토어 사용
const transferServerStore = useVideoFileTransferServerStore()
const commonCodeStore = useCommonCodeStore()
const alertStore = useAlertStore()
const isSubmitting = ref(false) // 중복 요청 방지

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

const DateCell = defineComponent({
  props: {
    value: {
      type: [String, Number],
      default: ''
    }
  },
  setup(props) {
    const formattedDate = computed(() => {
      if (!props.value) return ''
      const str = String(props.value)
      // YYYY-MM-DD 형식으로 변환 (YYYY/MM/DD 또는 YYYY-MM-DD HH:mm:ss 대응)
      const match = str.match(/^(\d{4})[/-](\d{2})[/-](\d{2})/)
      if (match) {
        return `${match[1]}-${match[2]}-${match[3]}`
      }
      return str
    })
    return () => h('span', { class: 'text-sm text-slate-700' }, formattedDate.value)
  }
})

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

// 기본 컬럼 너비 설정
const checkboxColumnWidth = 50
const idColumnWidth = 120

// 컬럼 정의 (백엔드 스키마에 맞춤)
const columns: TableColumn[] = [
  { id: 'fts_id', header: '서버 ID', size: 100, cellComponent: TextCell },
  { id: 'fts_name', header: '서버 이름', size: 150, cellComponent: TextCell },
  { id: 'fts_type', header: '서버 종류', size: 100, cellComponent: ServerTypeCell },
  { id: 'ip_addr', header: 'IP 주소', size: 130, cellComponent: TextCell },
  { id: 'fts_target_ip', header: '대상 서버 IP', size: 130, cellComponent: TextCell },
  { id: 'fts_target_root_dir', header: '루트 경로', size: 150, cellComponent: TextCell },
  { id: 'user_id', header: '사용자 ID', size: 120, cellComponent: TextCell },
  { id: 'reg_date', header: '등록 일자', size: 160, cellComponent: DateCell }
]

// 기본 표시 컬럼
const defaultVisibleColumns = ['fts_id', 'fts_name', 'fts_type', 'ip_addr', 'fts_target_ip', 'reg_date']

// 스토어의 데이터를 직접 참조 (computed 사용)
const rawData = computed(() => transferServerStore.items)

// 폼 필드 정의 (실제 DB 스키마에 맞춤)
const formFields: FormField[] = [
  { id: 'fts_id', label: '서버 ID', type: 'text', required: true, placeholder: 'FTSXX (00~99)' },
  { id: 'fts_name', label: '서버 이름', type: 'text', required: true, placeholder: '한글/영문' },
  { id: 'fts_type', label: '서버 종류', type: 'text', required: true, placeholder: 'XXXXX (코드형식)' },
  { id: 'ip_addr', label: '서버 IP 주소', type: 'text', required: true, placeholder: 'A.B.C.D' },
  { id: 'fts_target_ip', label: '전송 대상 서버 IP', type: 'text', required: true, placeholder: 'A.B.C.D' },
  { id: 'fts_target_root_dir', label: '대상 서버 루트 경로', type: 'text', placeholder: '경로 문자열' },
  { id: 'user_id', label: '사용자 ID', type: 'text', required: true, placeholder: '사용자 계정' },
  { id: 'password', label: '사용자 암호', type: 'text', required: true, placeholder: '암호화된 문자열' },
  { id: 'reg_date', label: '등록 일자', type: 'text', placeholder: 'YYYY-MM-DD' }
]

// 데이터 업데이트 처리 (생성/수정)
const handleDataUpdate = async (data: Record<string, any>, isNew: boolean) => {
  if (isSubmitting.value || transferServerStore.isLoading) {
    console.warn('이미 처리 중인 요청이 있습니다.')
    return
  }
  try {
    isSubmitting.value = true
    if (isNew) {
      await transferServerStore.createTransferServer(data as VideoFileTransferServer)
    } else {
      await transferServerStore.updateTransferServer(data.fts_id, data)
    }
    alertStore.show(isNew ? '신규 생성 완료' : '수정 완료', 'success')
  } catch (error: any) {
    console.error('데이터 저장 실패:', error)
    const errorMessage = transferServerStore.error || error.response?.data?.detail || '데이터 저장 중 오류가 발생했습니다.'
    alertStore.show(errorMessage, 'error')
  } finally {
    isSubmitting.value = false
  }
}

// 데이터 삭제 처리
const handleDataDelete = async (ids: string[]) => {
  if (isSubmitting.value || transferServerStore.isLoading) {
    console.warn('이미 처리 중인 요청이 있습니다.')
    return
  }
  try {
    isSubmitting.value = true
    await transferServerStore.deleteTransferServers(ids)
    alertStore.show('삭제 완료', 'success')
  } catch (error: any) {
    console.error('데이터 삭제 실패:', error)
    const errorMessage = transferServerStore.error || error.response?.data?.detail || '데이터 삭제 중 오류가 발생했습니다.'
    alertStore.show(errorMessage, 'error')
  } finally {
    isSubmitting.value = false
  }
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(async () => {
  try {
    await transferServerStore.fetchTransferServers()
  } catch (error) {
    console.error('영상 파일 전송 서버 정보 로드 실패:', error)
  }
})
</script>

<style scoped>
/* 스타일은 Table 컴포넌트에 포함되어 있음 */
</style>




