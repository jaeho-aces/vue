<template>
  <Table
    v-model="rawData"
    :columns="columns"
    :default-visible-columns="defaultVisibleColumns"
    :form-fields="formFields"
    modal-title="운영단말"
    :checkbox-column-width="checkboxColumnWidth"
    :id-column-width="0"
    id-field=""
    @update="handleDataUpdate"
    @delete="handleDataDelete"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, defineComponent, h } from 'vue'
import Table, { type TableColumn } from '../../common/Table.vue'
import { type FormField } from '../../common/DataFormModal.vue'
import { api } from '../../../services/api'

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
  id: string
  name: string
  ip: string
  note: string
}

// 기본 컬럼 너비 설정
const checkboxColumnWidth = 50
const columnWidths = [250, 200, 400]

// 컬럼 정의
const columns: TableColumn[] = [
  { id: 'name', header: '운영 단말 이름', size: columnWidths[0], cellComponent: TextCell },
  { id: 'ip', header: '단말기 IP 주소', size: columnWidths[1], cellComponent: TextCell },
  { id: 'note', header: '비고', size: columnWidths[2], cellComponent: TextCell }
]

// 기본 표시 컬럼
const defaultVisibleColumns = ['name', 'ip', 'note']

// 데이터 관리
const rawData = ref<Terminal[]>([])

// MGMT_OPERATOR 테이블에서 운영단말 정보 로드
const loadTerminalData = async () => {
  try {
    const response = await api.get('/api/rest-access-page/MGMT_OPERATOR')
    
    // 실제 필드명: opr_name, opr_ip, opr_stream_svr_opr_etc
    const transformedData: Terminal[] = response.data.map((item: any, index: number) => ({
      id: item.opr_id || item.oprid || item.id || `term_${index}`,
      name: item.opr_name || '',
      ip: item.opr_ip || '',
      note: item.opr_stream_svr_opr_etc || item.opr_stream_svr_opr_etc || ''
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
    // Terminal 데이터를 MGMT_OPERATOR 형식으로 변환
    const mgmtOperatorData: any = {
      OPR_NAME: data.name || '',
      OPR_IP: data.ip || '',
      OPR_STREAM_SVR_OPR_ETC: data.note || null
    }
    
    if (isNew) {
      // 신규 생성
      await api.post('/api/rest-access-page/MGMT_OPERATOR', mgmtOperatorData)
    } else {
      // 수정 (OPR_ID를 키로 사용)
      await api.put('/api/rest-access-page/MGMT_OPERATOR', {
        OPR_ID: data.id || '',
        ...mgmtOperatorData
      })
    }
    
    // 데이터 다시 로드
    await loadTerminalData()
  } catch (error: any) {
    console.error('데이터 저장 실패:', error)
    const errorMessage = error.response?.data?.detail || '데이터 저장 중 오류가 발생했습니다.'
    alert(errorMessage)
  }
}

// 데이터 삭제 처리
const handleDataDelete = async (ids: string[]) => {
  try {
    // 각 ID를 OPR_ID로 사용하여 삭제
    for (const id of ids) {
      await api.delete('/api/rest-access-page/MGMT_OPERATOR', {
        params: {
          key: id
        }
      })
    }
    
    // 데이터 다시 로드
    await loadTerminalData()
  } catch (error: any) {
    console.error('데이터 삭제 실패:', error)
    const errorMessage = error.response?.data?.detail || '데이터 삭제 중 오류가 발생했습니다.'
    alert(errorMessage)
  }
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  loadTerminalData()
})

// 폼 필드 정의
const formFields: FormField[] = [
  { id: 'name', label: '운영 단말 이름', type: 'text', required: true, placeholder: '예: 운영단말-01' },
  { id: 'ip', label: '단말기 IP 주소', type: 'text', required: true, placeholder: '예: 192.168.1.100' },
  { id: 'note', label: '비고', type: 'textarea', required: false, rows: 3 }
]
</script>

<style scoped>
/* 스타일은 Table 컴포넌트에 포함되어 있음 */
</style>

