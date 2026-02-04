<template>
  <Table
    v-model="rawData"
    :columns="columns"
    :default-visible-columns="defaultVisibleColumns"
    :form-fields="formFields"
    modal-title="운영단말"
    :checkbox-column-width="checkboxColumnWidth"
    :id-column-width="0"
    id-field="key"
    preference-key="vms_terminal_info"
    @update="handleDataUpdate"
    @delete="handleDataDelete"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, defineComponent, h } from 'vue'
import Table, { type TableColumn } from '../../common/Table.vue'
import { type FormField } from '../../common/DataFormModal.vue'
import { api } from '../../../services/api'
import { useAlertStore } from '../../../stores/alert'

const alertStore = useAlertStore()

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

interface Terminal {
  key: string
  name: string
  ip: string
  regDate: string
}

// 기본 컬럼 너비 설정
const checkboxColumnWidth = 50
const columnWidths = [200, 200, 200]

// 컬럼 정의
const columns: TableColumn[] = [
  { id: 'name', header: '운영 단말 이름', size: columnWidths[0], cellComponent: TextCell },
  { id: 'ip', header: '단말기 IP 주소', size: columnWidths[1], cellComponent: TextCell },
  { id: 'regDate', header: '등록일시', size: columnWidths[2], cellComponent: TextCell }
]

// 기본 표시 컬럼
const defaultVisibleColumns = ['name', 'ip', 'regDate']

// 데이터 관리
const rawData = ref<Terminal[]>([])

// MGMT_OPER_TERMINAL 테이블에서 운영단말 정보 로드
const loadTerminalData = async () => {
  try {
    const response = await api.get('/api/rest-access-page/MGMT_OPER_TERMINAL')
    
    // DB 필드명: key, term_name, ip_addr, reg_date
    const transformedData: Terminal[] = response.data.map((item: any) => ({
      key: item.key,
      name: item.term_name || '',
      ip: item.ip_addr || '',
      regDate: item.reg_date || ''
    }))
    
    rawData.value = transformedData
  } catch (error) {
    console.error('운영단말 정보 로드 실패:', error)
    rawData.value = []
  }
}

// 데이터 업데이트 처리 (생성/수정)
const handleDataUpdate = async (data: Record<string, any>, isNew: boolean) => {
  try {
    // Terminal 데이터를 MGMT_OPER_TERMINAL 형식으로 변환
    const mgmtTerminalData: any = {
      term_name: data.name || '',
      ip_addr: data.ip || '',
      // reg_date는 백엔드에서 처리하거나 필요시 추가
    }
    
    if (isNew) {
      // 신규 생성: key는 사용자 입력 없이 자동 생성 (UUID 또는 임의 문자열)
      const generateKey = (): string => {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
          return crypto.randomUUID()
        }
        return `TERM_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
      }
      mgmtTerminalData.key = generateKey()
      await api.post('/api/rest-access-page/MGMT_OPER_TERMINAL', mgmtTerminalData)
    } else {
      // 수정 (key를 식별자로 사용)
      await api.put('/api/rest-access-page/MGMT_OPER_TERMINAL', {
        key: data.key,
        ...mgmtTerminalData
      })
    }
    alertStore.show(isNew ? '신규 생성 완료' : '수정 완료', 'success')
    // 데이터 다시 로드
    await loadTerminalData()
  } catch (error: any) {
    console.error('데이터 저장 실패:', error)
    const errorMessage = error.response?.data?.detail || '데이터 저장 중 오류가 발생했습니다.'
    alertStore.show(errorMessage, 'error')
  }
}

// 데이터 삭제 처리
const handleDataDelete = async (ids: string[]) => {
  try {
    // 각 ID를 key로 사용하여 삭제
    for (const key of ids) {
      await api.delete('/api/rest-access-page/MGMT_OPER_TERMINAL', {
        params: {
          key: key
        }
      })
    }
    alertStore.show('삭제 완료', 'success')
    // 데이터 다시 로드
    await loadTerminalData()
  } catch (error: any) {
    console.error('데이터 삭제 실패:', error)
    const errorMessage = error.response?.data?.detail || '데이터 삭제 중 오류가 발생했습니다.'
    alertStore.show(errorMessage, 'error')
  }
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  loadTerminalData()
})

// 폼 필드 정의 (key는 입력 없이 신규 시 자동 생성, 수정 시 기존값 유지용 hidden)
const formFields: FormField[] = [
  { id: 'key', label: '', type: 'hidden' },
  { id: 'name', label: '운영 단말 이름', type: 'text', required: true, placeholder: '예: 운영단말-01' },
  { id: 'ip', label: '단말기 IP 주소', type: 'ip', required: true, placeholder: '예: 192.168.1.100', pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$', patternMessage: '단말기 IP 주소는 0.0.0.0 ~ 255.255.255.255 형식으로 입력해 주세요.' }
]
</script>

<style scoped>
/* 스타일은 Table 컴포넌트에 포함되어 있음 */
</style>

