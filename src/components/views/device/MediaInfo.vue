<template>
  <Table
    v-model="rawData"
    :columns="columns"
    :default-visible-columns="defaultVisibleColumns"
    :form-fields="formFields"
    modal-title="미디어 정보"
    :checkbox-column-width="checkboxColumnWidth"
    :id-column-width="idColumnWidth"
    :hide-edit-button="true"
  >
    <template #toolbar-actions-left>
      <Button @click="handleTransferHistory" variant="info">
        전송 이력 보기
      </Button>
    </template>
  </Table>
</template>

<script setup lang="ts">
import { ref, defineComponent, h } from 'vue'
import Table, { type TableColumn } from '../../common/Table.vue'
import { type FormField } from '../../common/DataFormModal.vue'
import Button from '../../common/Button.vue'

// 셀 컴포넌트들
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

const StatusCell = defineComponent({
  props: {
    value: {
      type: [String, Number],
      default: ''
    }
  },
  setup(props) {
    const statusClass = props.value === 'active' ? 'bg-green-50 text-green-700' :
                       props.value === 'warning' ? 'bg-orange-50 text-orange-700' :
                       'bg-slate-100 text-slate-600'
    const dotClass = props.value === 'active' ? 'bg-green-500' :
                     props.value === 'warning' ? 'bg-orange-500' :
                     'bg-slate-400'
    
    return () => h('span', {
      class: ['inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', statusClass]
    }, [
      h('span', { class: ['w-1.5 h-1.5 rounded-full', dotClass] }),
      String(props.value || '').toUpperCase()
    ])
  }
})

const YesNoCell = defineComponent({
  props: {
    value: {
      type: [String, Number],
      default: ''
    }
  },
  setup(props) {
    return () => h('span', {
      class: [
        'inline-block px-2 py-0.5 rounded text-xs font-bold',
        props.value === 'Y' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
      ]
    }, String(props.value || ''))
  }
})

interface Media {
  id: string
  type: string
  camId: string
  location: string
  route: string
  publicUrl: string
  streamType: string
  internalStream: string
  externalStream: string
  ktCctv: string
  status: 'active' | 'warning' | 'inactive'
  registered: string
}

// 기본 컬럼 너비 설정
const checkboxColumnWidth = 50
const idColumnWidth = 120
const columnWidths = [100, 120, 120, 110, 150, 120, 150, 150, 100, 120, 120]

// 컬럼 정의
const columns: TableColumn[] = [
  { id: 'type', header: '구분', size: columnWidths[0], cellComponent: TextCell },
  { id: 'camId', header: '카메라 번호', size: columnWidths[1], cellComponent: TextCell },
  { id: 'location', header: '설치 위치', size: columnWidths[2], cellComponent: TextCell },
  { id: 'route', header: '노선', size: columnWidths[3], cellComponent: TextCell },
  { id: 'publicUrl', header: '공인 URL 주소', size: columnWidths[4], cellComponent: TextCell },
  { id: 'streamType', header: 'Stream 용도구분', size: columnWidths[5], cellComponent: TextCell },
  { id: 'status', header: '상태', size: columnWidths[6], cellComponent: StatusCell },
  { id: 'internalStream', header: '내부 Stream', size: columnWidths[7], cellComponent: TextCell },
  { id: 'externalStream', header: '외부 Stream', size: columnWidths[8], cellComponent: TextCell },
  { id: 'ktCctv', header: 'KT CCTV', size: columnWidths[9], cellComponent: YesNoCell },
  { id: 'registered', header: '등록 일자', size: columnWidths[10], cellComponent: TextCell }
]

// 기본 표시 컬럼
const defaultVisibleColumns = ['type', 'camId', 'location', 'route', 'status', 'registered']

// 데이터 관리
const rawData = ref<Media[]>([])

// 선택된 행 관리 (Table 컴포넌트에서 v-model로 전달되므로, 여기서는 직접 관리하지 않음)
// 하지만 버튼의 disabled 상태를 위해 selectedRowIds가 필요할 수 있음.
// Table 컴포넌트에서 selectedRowIds를 prop으로 노출하거나,
// 여기서는 임시로 selectedRowIds를 정의하여 사용.
// 실제 구현에서는 Table 컴포넌트의 emit 이벤트를 통해 selectedRowIds를 받아와야 함.
const selectedRowIds = ref<Set<string>>(new Set()) // 임시 정의

// 버튼 핸들러
const handleTransferHistory = () => {
  console.log('전송 이력 보기 버튼 클릭:', Array.from(selectedRowIds.value))
  alert(`선택된 미디어의 전송 이력 보기: ${Array.from(selectedRowIds.value).join(', ')}`)
  // TODO: 전송 이력 보기 로직 구현
}

// 폼 필드 정의
const formFields: FormField[] = [
  { id: 'id', label: 'ID', type: 'text', required: true, placeholder: '예: MI-001' },
  { 
    id: 'type', 
    label: '구분', 
    type: 'select', 
    required: true,
    options: [
      { value: '본부', label: '본부' },
      { value: '지사', label: '지사' }
    ]
  },
  { id: 'camId', label: '카메라 번호', type: 'text', required: true, placeholder: '예: CAM-001' },
  { id: 'location', label: '설치 위치', type: 'text', required: true },
  { id: 'route', label: '노선', type: 'text', required: true },
  { id: 'publicUrl', label: '공인 URL 주소', type: 'text', required: true },
  { id: 'streamType', label: 'Stream 용도구분', type: 'text', required: true },
  { 
    id: 'status', 
    label: '상태', 
    type: 'select', 
    required: true,
    options: [
      { value: 'active', label: '정상' },
      { value: 'warning', label: '경고' },
      { value: 'inactive', label: '비활성' }
    ]
  },
  { id: 'internalStream', label: '내부 Stream', type: 'text', required: true },
  { id: 'externalStream', label: '외부 Stream', type: 'text' },
  { id: 'ktCctv', label: 'KT CCTV', type: 'yesno', required: true },
  { id: 'registered', label: '등록 일자', type: 'text', placeholder: 'YYYY-MM-DD' }
]
</script>

<style scoped>
/* 스타일은 Table 컴포넌트에 포함되어 있음 */
</style>
