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
</script>

<style scoped>
/* 스타일은 Table 컴포넌트에 포함되어 있음 */
</style>

