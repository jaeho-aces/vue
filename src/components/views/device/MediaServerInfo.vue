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

// 컬럼 정의 (백엔드 스키마에 맞춤)
const columns: TableColumn[] = [
  { id: 'fms_id', header: '미디어 서버 ID', size: 140, cellComponent: TextCell },
  { id: 'fms_name', header: '미디어 서버 이름', size: 150, cellComponent: TextCell },
  { id: 'fms_ip', header: '미디어 서버 IP', size: 130, cellComponent: TextCell },
  { id: 'fms_port', header: '포트 번호', size: 100, cellComponent: TextCell },
  { id: 'fms_con_id', header: '사용자 ID', size: 120, cellComponent: TextCell },
  { id: 'svr_type', header: '서버 종류', size: 120, cellComponent: ServerTypeCell }
]

// 기본 표시 컬럼
const defaultVisibleColumns = [
  'fms_id', 'fms_name', 'fms_ip', 'fms_port', 'svr_type'
]

// 스토어의 데이터를 직접 참조 (computed 사용)
const rawData = computed(() => {
  console.log('미디어 서버 데이터:', mediaServerStore.items.length, '개')
  if (mediaServerStore.error) {
    console.error('미디어 서버 스토어 에러:', mediaServerStore.error)
  }
  return mediaServerStore.items
})

// 서버 종류 옵션: 공통코드 grp_gbn='C', grp_code='11'
const serverTypeOptions = computed(() =>
  commonCodeStore.getByGrpGbn('C')
    .filter((item: { grp_code: string }) => String(item.grp_code) === '11')
    .map((item: { code: string; code_name: string }) => ({
      value: item.code || '',
      label: (item.code_name || '').trim() || item.code || ''
    }))
)

// 폼 필드 정의 (백엔드 스키마에 맞춤)
const formFields = computed<FormField[]>(() => [
  { id: 'fms_id', label: '미디어 서버 ID', type: 'id', required: true, placeholder: '숫자 4자리', maxLength: 4 },
  { id: 'fms_name', label: '미디어 서버 이름', type: 'text', required: true, placeholder: '한글/영문' },
  { id: 'fms_ip', label: 'IP 주소', type: 'ip', required: true, placeholder: '' },
  { id: 'fms_port', label: '포트', type: 'number', required: true, placeholder: '0~65535', min: 0, max: 65535 },
  { id: 'fms_con_id', label: '접속 ID', type: 'text', placeholder: '접속 ID' },
  { id: 'fms_passwd', label: '접속 PW', type: 'password', placeholder: '접속 암호' },
  { id: 'svr_type', label: '서버 종류', type: 'select', required: true, placeholder: '서버 종류 선택', options: serverTypeOptions.value }
])

// 데이터 업데이트 처리 (생성/수정)
const handleDataUpdate = async (data: Record<string, any>, isNew: boolean) => {
  if (isSubmitting.value || mediaServerStore.isLoading) {
    console.warn('이미 처리 중인 요청이 있습니다.')
    return
  }
  try {
    isSubmitting.value = true
    if (isNew) {
      // IdInput 4자리 → 미디어 서버 ID 형식 (FMS + 8자리, 앞 0 패딩)
      const idRaw = String(data.fms_id ?? '').replace(/\D/g, '').slice(0, 8)
      const fms_id = idRaw.length <= 4 ? `FMS${idRaw.padStart(8, '0')}` : `FMS${idRaw}`
      const payload = { ...data, fms_id }
      await mediaServerStore.createMediaServer(payload as MediaServer)
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
    await commonCodeStore.fetchCommonCodes()
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
