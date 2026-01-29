<template>
  <Table
    v-model="rawData"
    :columns="columns"
    :default-visible-columns="defaultVisibleColumns"
    :form-fields="formFields"
    modal-title="노선 정보"
    :checkbox-column-width="checkboxColumnWidth"
    :id-column-width="0"
    id-field=""
    @update="handleDataUpdate"
    @delete="handleDataDelete"
  />
</template>

<script setup lang="ts">
import { computed, defineComponent, h } from 'vue'
import Table, { type TableColumn } from '../../common/Table.vue'
import { type FormField } from '../../common/DataFormModal.vue'
import { useCommonCodeStore, type CommonCode } from '../../../stores/commonCode'

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

// 공통코드 스토어 사용
const commonCodeStore = useCommonCodeStore()

// GRP_GBN='4' (노선) 데이터를 Route 형식으로 변환
const rawData = computed<Route[]>(() => {
  const routeCodes = commonCodeStore.getByGrpGbn('4')
  return routeCodes.map((item: CommonCode) => ({
    id: `${item.grp_gbn}_${item.grp_code}_${item.code}`,
    code: item.code || '',
    fullName: item.code_name || '',
    shortName: item.short_code_name || item.code_name || '',
    description: item.remarks || '',
    sortOrder: item.ord || 0,
    useYn: item.use_yn || 'N',
    registered: item.reg_timestamp || ''
  }))
})

// 데이터 업데이트 처리 (생성/수정)
const handleDataUpdate = async (data: Record<string, any>, isNew: boolean) => {
  try {
    // Route 데이터를 CommonCode 형식으로 변환
    const commonCodeData: CommonCode = {
      grp_gbn: '4', // 노선은 GRP_GBN = '4'
      grp_code: data.code || '',
      code: data.code || '',
      code_name: data.fullName || '',
      short_code_name: data.shortName || data.fullName || '',
      remarks: data.description || null,
      ord: data.sortOrder || 0,
      use_yn: data.useYn || 'Y',
      reg_timestamp: data.registered || null
    }
    
    if (isNew) {
      // 신규 생성
      await commonCodeStore.createCommonCode(commonCodeData)
    } else {
      // 수정 (복합 키 사용: GRP_GBN, GRP_CODE, CODE)
      const originalId = data.id || ''
      const [grpGbn, grpCode, code] = originalId.split('_')
      
      await commonCodeStore.updateCommonCode(grpGbn, grpCode, code, commonCodeData)
    }
    
    // 스토어가 자동으로 업데이트되므로 별도 로드 불필요
  } catch (error: any) {
    console.error('데이터 저장 실패:', error)
    const errorMessage = commonCodeStore.error || error.response?.data?.detail || '데이터 저장 중 오류가 발생했습니다.'
    alert(errorMessage)
  }
}

// 데이터 삭제 처리
const handleDataDelete = async (ids: string[]) => {
  try {
    // 스토어의 deleteCommonCodes 메서드 사용 (복합 키 배열 전달)
    await commonCodeStore.deleteCommonCodes(ids)
  } catch (error: any) {
    console.error('데이터 삭제 실패:', error)
    const errorMessage = commonCodeStore.error || error.response?.data?.detail || '데이터 삭제 중 오류가 발생했습니다.'
    alert(errorMessage)
  }
}

// 폼 필드 정의
const formFields: FormField[] = [
  { id: 'code', label: '코드', type: 'text', required: true, placeholder: '예: RT01' },
  { id: 'fullName', label: '정식 노선 이름', type: 'text', required: true, placeholder: '예: 경부고속도로' },
  { id: 'shortName', label: '간략 노선 이름', type: 'text', required: true, placeholder: '예: 경부선' },
  { id: 'description', label: '설명', type: 'textarea', required: false, rows: 3 },
  { id: 'sortOrder', label: '표시 순서', type: 'number', required: true, placeholder: '예: 1' },
  { id: 'useYn', label: '사용 여부', type: 'yesno', required: true },
  { id: 'registered', label: '등록 일자', type: 'text', required: false, placeholder: 'YYYY-MM-DD' }
]
</script>

<style scoped>
/* 스타일은 Table 컴포넌트에 포함되어 있음 */
</style>

