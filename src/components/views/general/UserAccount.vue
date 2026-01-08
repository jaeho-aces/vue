<template>
  <Table
    v-model="rawData"
    :columns="columns"
    :default-visible-columns="defaultVisibleColumns"
    :form-fields="formFields"
    modal-title="사용자 계정"
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

interface UserAccount {
  id: string
  userId: string
  name: string
  group: string
  videoSave: string
  smsSend: string
  maxSplit: number
  phone: string
  note: string
}

// 기본 컬럼 너비 설정
const checkboxColumnWidth = 50
const idColumnWidth = 120
const columnWidths = [150, 150, 150, 100, 100, 120, 150, 200]

// 컬럼 정의
const columns: TableColumn[] = [
  { id: 'userId', header: 'ID', size: columnWidths[0], cellComponent: TextCell },
  { id: 'name', header: '이름', size: columnWidths[1], cellComponent: TextCell },
  { id: 'group', header: '그룹', size: columnWidths[2], cellComponent: TextCell },
  { id: 'videoSave', header: '영상 저장', size: columnWidths[3], cellComponent: YesNoCell },
  { id: 'smsSend', header: 'SMS 송출', size: columnWidths[4], cellComponent: YesNoCell },
  { id: 'maxSplit', header: '분할 허용 최대', size: columnWidths[5], cellComponent: TextCell },
  { id: 'phone', header: '전화번호', size: columnWidths[6], cellComponent: TextCell },
  { id: 'note', header: '비고', size: columnWidths[7], cellComponent: TextCell }
]

// 기본 표시 컬럼
const defaultVisibleColumns = ['userId', 'name', 'group', 'videoSave', 'smsSend', 'maxSplit', 'phone', 'note']

// 데이터 관리
const rawData = ref<UserAccount[]>([])

// 폼 필드 정의
const formFields: FormField[] = [
  { id: 'id', label: 'ID', type: 'text', required: true, placeholder: '예: USER-001' },
  { id: 'userId', label: 'ID', type: 'text', required: true, placeholder: '예: admin' },
  { id: 'name', label: '이름', type: 'text', required: true, placeholder: '예: 홍길동' },
  { id: 'group', label: '그룹', type: 'text', required: true, placeholder: '예: 관리자그룹' },
  { id: 'videoSave', label: '영상 저장', type: 'yesno', required: true },
  { id: 'smsSend', label: 'SMS 송출', type: 'yesno', required: true },
  { id: 'maxSplit', label: '분할 허용 최대', type: 'number', required: true, placeholder: '예: 4' },
  { id: 'phone', label: '전화번호', type: 'text', required: false, placeholder: '예: 010-1234-5678' },
  { id: 'note', label: '비고', type: 'textarea', required: false, rows: 3 }
]

// 데이터 생성 함수
const generateData = (count: number): UserAccount[] => {
  const userIds = ['admin', 'user01', 'user02', 'user03', 'user04', 'user05', 'user06', 'user07', 'user08', 'user09', 'user10']
  const names = ['홍길동', '김철수', '이영희', '박민수', '최지영', '정수진', '한소희', '강동원', '송혜교', '이병헌', '전지현']
  const groups = ['관리자그룹', '운영자그룹', '사용자그룹', '관리자그룹', '사용자그룹', '조회자그룹', '운영자그룹', '사용자그룹', '조회자그룹', '운영자그룹', '사용자그룹']
  const phones = ['010-1234-5678', '010-2345-6789', '010-3456-7890', '010-4567-8901', '010-5678-9012', '010-6789-0123', '010-7890-1234', '010-8901-2345', '010-9012-3456', '010-0123-4567', '010-1234-5678']
  const notes = ['시스템 관리자', '일반 사용자', '일반 사용자', '시스템 관리자', '일반 사용자', '조회 전용', '운영 담당자', '일반 사용자', '조회 전용', '운영 담당자', '일반 사용자']

  const data: UserAccount[] = []
  
  for (let i = 0; i < count && i < userIds.length; i++) {
    data.push({
      id: `USER-${String(i + 1).padStart(3, '0')}`,
      userId: userIds[i],
      name: names[i],
      group: groups[i],
      videoSave: Math.random() > 0.3 ? 'Y' : 'N',
      smsSend: Math.random() > 0.3 ? 'Y' : 'N',
      maxSplit: Math.floor(Math.random() * 5) + 1,
      phone: phones[i],
      note: notes[i]
    })
  }
  
  return data
}

// 데이터 초기화 (11개)
rawData.value = generateData(11)
</script>

<style scoped>
/* 스타일은 Table 컴포넌트에 포함되어 있음 */
</style>

