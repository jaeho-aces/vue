<template>
  <Table
    v-model="rawData"
    :columns="columns"
    :default-visible-columns="defaultVisibleColumns"
    :form-fields="formFields"
    modal-title="노선 정보"
    :checkbox-column-width="checkboxColumnWidth"
    :id-column-width="idColumnWidth"
  />
</template>

<script setup lang="ts">
import { ref, defineComponent, h } from 'vue'
import Table, { type TableColumn } from '../../common/Table.vue'
import { type FormField } from '../../common/DataFormModal.vue'

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

interface Route {
  id: string
  code: string
  fullName: string
  shortName: string
  description: string
  sortOrder: number
  useYn: string
  registered: string
}

// 기본 컬럼 너비 설정
const checkboxColumnWidth = 50
const idColumnWidth = 120
const columnWidths = [120, 200, 150, 250, 100, 100, 120]

// 컬럼 정의
const columns: TableColumn[] = [
  { id: 'code', header: '코드', size: columnWidths[0], cellComponent: TextCell },
  { id: 'fullName', header: '정식 노선 이름', size: columnWidths[1], cellComponent: TextCell },
  { id: 'shortName', header: '간략 노선 이름', size: columnWidths[2], cellComponent: TextCell },
  { id: 'description', header: '설명', size: columnWidths[3], cellComponent: TextCell },
  { id: 'sortOrder', header: '표시 순서', size: columnWidths[4], cellComponent: TextCell },
  { id: 'useYn', header: '사용 여부', size: columnWidths[5], cellComponent: YesNoCell },
  { id: 'registered', header: '등록 일자', size: columnWidths[6], cellComponent: TextCell }
]

// 기본 표시 컬럼
const defaultVisibleColumns = ['code', 'fullName', 'shortName', 'description', 'sortOrder', 'useYn', 'registered']

// 데이터 관리
const rawData = ref<Route[]>([])

// 폼 필드 정의
const formFields: FormField[] = [
  { id: 'id', label: 'ID', type: 'text', required: true, placeholder: '예: RT-001' },
  { id: 'code', label: '코드', type: 'text', required: true, placeholder: '예: RT01' },
  { id: 'fullName', label: '정식 노선 이름', type: 'text', required: true, placeholder: '예: 경부고속도로' },
  { id: 'shortName', label: '간략 노선 이름', type: 'text', required: true, placeholder: '예: 경부선' },
  { id: 'description', label: '설명', type: 'textarea', required: false, rows: 3 },
  { id: 'sortOrder', label: '표시 순서', type: 'number', required: true, placeholder: '예: 1' },
  { id: 'useYn', label: '사용 여부', type: 'yesno', required: true },
  { id: 'registered', label: '등록 일자', type: 'text', required: false, placeholder: 'YYYY-MM-DD' }
]

// 데이터 생성 함수
const generateData = (count: number): Route[] => {
  const codes = ['RT01', 'RT02', 'RT03', 'RT04', 'RT05', 'RT06', 'RT07', 'RT08']
  const fullNames = ['경부고속도로', '영동고속도로', '동해고속도로', '중앙고속도로', '호남고속도로', '경전고속도로', '서해안고속도로', '중부고속도로']
  const shortNames = ['경부선', '영동선', '동해선', '중앙선', '호남선', '경전선', '서해안선', '중부선']
  const descriptions = [
    '서울-부산을 연결하는 고속도로입니다.',
    '인천-강릉을 연결하는 고속도로입니다.',
    '부산-포항을 연결하는 고속도로입니다.',
    '대구-춘천을 연결하는 고속도로입니다.',
    '광주-목포를 연결하는 고속도로입니다.',
    '대전-여수를 연결하는 고속도로입니다.',
    '울산-순천을 연결하는 고속도로입니다.',
    '수원-안산을 연결하는 고속도로입니다.'
  ]

  const data: Route[] = []
  
  for (let i = 0; i < count && i < codes.length; i++) {
    const registeredDate = new Date()
    registeredDate.setDate(registeredDate.getDate() - Math.floor(Math.random() * 365))
    const registered = registeredDate.toISOString().slice(0, 10)

    data.push({
      id: `RT-${String(i + 1).padStart(3, '0')}`,
      code: codes[i],
      fullName: fullNames[i],
      shortName: shortNames[i],
      description: descriptions[i],
      sortOrder: i + 1,
      useYn: Math.random() > 0.2 ? 'Y' : 'N',
      registered
    })
  }
  
  return data
}

// 데이터 초기화 (8개)
rawData.value = generateData(8)
</script>

<style scoped>
/* 스타일은 Table 컴포넌트에 포함되어 있음 */
</style>

