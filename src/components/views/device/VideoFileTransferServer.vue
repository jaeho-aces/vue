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

// 서버 종류 옵션: 공통코드 grp_gbn='C', grp_code='11' (미디어 서버 정보와 동일)
const serverTypeOptions = computed(() =>
  commonCodeStore.getByGrpGbn('C')
    .filter((item: { grp_code: string }) => String(item.grp_code) === '11')
    .map((item: { code: string; code_name: string }) => ({
      value: item.code || '',
      label: (item.code_name || '').trim() || item.code || ''
    }))
)

// 폼 필드 정의 (미디어 서버 정보 신규 모달과 동일 형식: IdInput, IpInput, 셀렉트 등)
const formFields = computed<FormField[]>(() => [
  { id: 'fts_id', label: '영상 파일 전송 서버 ID', type: 'id', required: true, placeholder: '숫자 2자리', maxLength: 2 },
  { id: 'fts_name', label: '서버 이름', type: 'text', required: true, placeholder: '한글/영문' },
  { id: 'ip_addr', label: 'IP 주소', type: 'ip', required: true, placeholder: '' },
  { id: 'fts_target_ip', label: '대상 서버 IP', type: 'ip', required: true, placeholder: '' },
  { id: 'fts_target_root_dir', label: '대상 서버 루트 경로', type: 'text', placeholder: '경로 문자열' },
  { id: 'user_id', label: '접속 ID', type: 'text', required: true, placeholder: '접속 ID' },
  { id: 'password', label: '접속 PW', type: 'password', required: true, placeholder: '접속 암호' },
  { id: 'fts_type', label: '서버 종류', type: 'select', required: true, placeholder: '서버 종류 선택', options: serverTypeOptions.value }
])

// 데이터 업데이트 처리 (생성/수정)
const handleDataUpdate = async (data: Record<string, any>, isNew: boolean) => {
  if (isSubmitting.value || transferServerStore.isLoading) {
    console.warn('이미 처리 중인 요청이 있습니다.')
    return
  }
  try {
    isSubmitting.value = true
    if (isNew) {
      // IdInput 2자리 → 영상 파일 전송 서버 ID 형식 (FTSXX, 앞 0 패딩)
      const idRaw = String(data.fts_id ?? '').replace(/\D/g, '').slice(0, 2)
      const fts_id = `FTS${idRaw.padStart(2, '0')}`
      const payload = { ...data, fts_id }
      await transferServerStore.createTransferServer(payload as VideoFileTransferServer)
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

// 컴포넌트 마운트 시 데이터 로드 (공통코드 → 서버 종류 셀렉트 옵션용)
onMounted(async () => {
  try {
    await commonCodeStore.fetchCommonCodes()
    await transferServerStore.fetchTransferServers()
  } catch (error) {
    console.error('영상 파일 전송 서버 정보 로드 실패:', error)
  }
})
</script>

<style scoped>
/* 스타일은 Table 컴포넌트에 포함되어 있음 */
</style>




