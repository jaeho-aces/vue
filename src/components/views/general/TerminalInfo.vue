<template>
  <Table
    v-model="rawData"
    :columns="columns"
    :default-visible-columns="defaultVisibleColumns"
    :form-fields="formFields"
    modal-title="운영단말"
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

interface Terminal {
  id: string
  name: string
  ip: string
  note: string
}

// 기본 컬럼 너비 설정
const checkboxColumnWidth = 50
const idColumnWidth = 120
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

// 폼 필드 정의
const formFields: FormField[] = [
  { id: 'id', label: 'ID', type: 'text', required: true, placeholder: '예: TERM-001' },
  { id: 'name', label: '운영 단말 이름', type: 'text', required: true, placeholder: '예: 운영단말-01' },
  { id: 'ip', label: '단말기 IP 주소', type: 'text', required: true, placeholder: '예: 192.168.1.100' },
  { id: 'note', label: '비고', type: 'textarea', required: false, rows: 3 }
]

// 데이터 생성 함수
const generateData = (count: number): Terminal[] => {
  const names = ['운영단말-01', '운영단말-02', '운영단말-03', '운영단말-04', '운영단말-05', '운영단말-06', '운영단말-07', '운영단말-08']
  const ips = ['192.168.1.100', '192.168.1.101', '192.168.1.102', '192.168.1.103', '192.168.1.104', '192.168.1.105', '192.168.1.106', '192.168.1.107']
  const notes = [
    '본사 3층 관제실에 설치된 운영단말입니다.',
    '본사 2층 관제실에 설치된 운영단말입니다.',
    '지사 1층 관제실에 설치된 운영단말입니다.',
    '지사 2층 관제실에 설치된 운영단말입니다.',
    '본사 1층 관제실에 설치된 운영단말입니다.',
    '본사 4층 관제실에 설치된 운영단말입니다.',
    '지사 3층 관제실에 설치된 운영단말입니다.',
    '본사 5층 관제실에 설치된 운영단말입니다.'
  ]

  const data: Terminal[] = []
  
  for (let i = 0; i < count && i < names.length; i++) {
    data.push({
      id: `TERM-${String(i + 1).padStart(3, '0')}`,
      name: names[i],
      ip: ips[i],
      note: notes[i]
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

