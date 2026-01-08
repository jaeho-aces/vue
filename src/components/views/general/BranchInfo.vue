<template>
  <Table
    v-model="rawData"
    :columns="columns"
    :default-visible-columns="defaultVisibleColumns"
    :form-fields="formFields"
    modal-title="지사 정보"
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

interface Branch {
  id: string
  code: string
  name: string
  headquarters: string
  description: string
  sortOrder: number
  useYn: string
  registered: string
}

// 기본 컬럼 너비 설정
const checkboxColumnWidth = 50
const idColumnWidth = 120
const columnWidths = [120, 200, 200, 250, 100, 100, 120]

// 컬럼 정의
const columns: TableColumn[] = [
  { id: 'code', header: '코드', size: columnWidths[0], cellComponent: TextCell },
  { id: 'name', header: '지사 이름', size: columnWidths[1], cellComponent: TextCell },
  { id: 'headquarters', header: '소속 본부', size: columnWidths[2], cellComponent: TextCell },
  { id: 'description', header: '설명', size: columnWidths[3], cellComponent: TextCell },
  { id: 'sortOrder', header: '표시 순서', size: columnWidths[4], cellComponent: TextCell },
  { id: 'useYn', header: '사용 여부', size: columnWidths[5], cellComponent: YesNoCell },
  { id: 'registered', header: '등록 일자', size: columnWidths[6], cellComponent: TextCell }
]

// 기본 표시 컬럼
const defaultVisibleColumns = ['code', 'name', 'headquarters', 'description', 'sortOrder', 'useYn', 'registered']

// 데이터 관리
const rawData = ref<Branch[]>([])

// 폼 필드 정의
const formFields: FormField[] = [
  { id: 'id', label: 'ID', type: 'text', required: true, placeholder: '예: BR-001' },
  { id: 'code', label: '코드', type: 'text', required: true, placeholder: '예: BR01' },
  { id: 'name', label: '지사 이름', type: 'text', required: true, placeholder: '예: 동부지사' },
  { id: 'headquarters', label: '소속 본부', type: 'text', required: true, placeholder: '예: 수도권본부' },
  { id: 'description', label: '설명', type: 'textarea', required: false, rows: 3 },
  { id: 'sortOrder', label: '표시 순서', type: 'number', required: true, placeholder: '예: 1' },
  { id: 'useYn', label: '사용 여부', type: 'yesno', required: true },
  { id: 'registered', label: '등록 일자', type: 'text', required: false, placeholder: 'YYYY-MM-DD' }
]

// 데이터 생성 함수
const generateData = (count: number): Branch[] => {
  const codes = ['BR01', 'BR02', 'BR03', 'BR04', 'BR05', 'BR06', 'BR07', 'BR08', 'BR09', 'BR10', 'BR11', 'BR12']
  const names = ['동부지사', '서부지사', '남부지사', '북부지사', '원주지사', '강릉지사', '천안지사', '대전지사', '전주지사', '광주지사', '부산지사', '대구지사']
  const headquarters = ['수도권본부', '강원본부', '충청본부', '전라본부', '경상본부', '수도권본부', '충청본부', '충청본부', '전라본부', '전라본부', '경상본부', '경상본부']
  const descriptions = [
    '동부 지역 지사입니다.',
    '서부 지역 지사입니다.',
    '남부 지역 지사입니다.',
    '북부 지역 지사입니다.',
    '원주 지역 지사입니다.',
    '강릉 지역 지사입니다.',
    '천안 지역 지사입니다.',
    '대전 지역 지사입니다.',
    '전주 지역 지사입니다.',
    '광주 지역 지사입니다.',
    '부산 지역 지사입니다.',
    '대구 지역 지사입니다.'
  ]

  const data: Branch[] = []
  
  for (let i = 0; i < count && i < names.length; i++) {
    const registeredDate = new Date()
    registeredDate.setDate(registeredDate.getDate() - Math.floor(Math.random() * 365))
    const registered = registeredDate.toISOString().slice(0, 10)

    data.push({
      id: `BR-${String(i + 1).padStart(3, '0')}`,
      code: codes[i],
      name: names[i],
      headquarters: headquarters[i],
      description: descriptions[i],
      sortOrder: i + 1,
      useYn: Math.random() > 0.2 ? 'Y' : 'N',
      registered
    })
  }
  
  return data
}

// 데이터 초기화 (12개)
rawData.value = generateData(12)
</script>

<style scoped>
/* 스타일은 Table 컴포넌트에 포함되어 있음 */
</style>

