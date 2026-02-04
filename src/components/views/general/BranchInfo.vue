<template>
  <Table
    v-model="rawData"
    :columns="columns"
    :default-visible-columns="defaultVisibleColumns"
    :form-fields="formFields"
    modal-title="지사 정보"
    :checkbox-column-width="checkboxColumnWidth"
    :id-column-width="0"
    id-field="id"
    :hide-id-column="true"
    preference-key="vms_branch_info"
    @update="handleDataUpdate"
    @delete="handleDataDelete"
  />
</template>

<script setup lang="ts">
import { computed, defineComponent, h } from 'vue'
import Table, { type TableColumn } from '../../common/Table.vue'
import { type FormField } from '../../common/DataFormModal.vue'
import { useCommonCodeStore, type CommonCode } from '../../../stores/commonCode'
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

const YesNoCell = defineComponent({
  props: {
    value: {
      type: [String, Number],
      default: ''
    }
  },
  setup(props) {
    const isYes = props.value === 'Y' || props.value === 1 || String(props.value).toUpperCase() === 'Y'
    return () => h('span', {
      class: [
        'inline-block px-2 py-0.5 rounded text-xs font-bold',
        isYes ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
      ]
    }, isYes ? 'Y' : 'N')
  }
})

// 소속 본부: 코드 → 본부 이름 표시 (본부는 GRP_GBN='1', GRP_CODE='0')
const HeadquartersNameCell = defineComponent({
  props: {
    value: { type: [String, Number], default: '' }
  },
  setup(props) {
    const store = useCommonCodeStore()
    return () => h('span', { class: 'text-sm text-slate-700' }, store.getCodeName('1', '0', String(props.value || '')))
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
const columnWidths = [70, 150, 150, 250, 100, 100, 120]

// 컬럼 정의
const columns: TableColumn[] = [
  { id: 'code', header: '코드', size: columnWidths[0], cellComponent: TextCell },
  { id: 'name', header: '지사 이름', size: columnWidths[1], cellComponent: TextCell },
  { id: 'headquarters', header: '소속 본부', size: columnWidths[2], cellComponent: HeadquartersNameCell },
  { id: 'description', header: '설명', size: columnWidths[3], cellComponent: TextCell },
  { id: 'sortOrder', header: '표시 순서', size: columnWidths[4], cellComponent: TextCell },
  { id: 'useYn', header: '사용 여부', size: columnWidths[5], cellComponent: YesNoCell },
  { id: 'registered', header: '등록 일자', size: columnWidths[6], cellComponent: TextCell }
]

// 기본 표시 컬럼
const defaultVisibleColumns = ['code', 'name', 'headquarters', 'description', 'sortOrder', 'useYn', 'registered']

// 공통코드 스토어 (본부 목록·저장 등에서 사용)
const commonCodeStore = useCommonCodeStore()

// 본부 목록 (GRP_GBN='1', GRP_CODE='0') → 소속 본부 셀렉트 옵션
const headquartersOptions = computed(() => {
  const list = commonCodeStore.getByGrpGbn('1').filter((item: CommonCode) => String(item.grp_code || '') === '0')
  return list.map((item: CommonCode) => ({
    value: item.code || '',
    label: (item.code_name || '').trim() || String(item.code || '')
  }))
})

// GRP_GBN='2' (지사) 데이터를 Branch 형식으로 변환. 수정 키는 (그룹구분, 코드) 2개만 사용.
const rawData = computed<Branch[]>(() => {
  const branchCodes = commonCodeStore.getByGrpGbn('2')
  return branchCodes.map((item: CommonCode) => ({
    id: `${item.grp_gbn}_${item.code}`,
    code: item.code || '',
    name: item.code_name || '',
    headquarters: item.grp_code || '',
    description: item.remarks || '',
    sortOrder: item.ord || 0,
    useYn: item.use_yn || 'N',
    registered: item.reg_timestamp || ''
  }))
})

// 데이터 업데이트 처리 (생성/수정)
const handleDataUpdate = async (data: Record<string, any>, isNew: boolean) => {
  try {
    const now = new Date()
    const regTimestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
    // Branch 데이터를 CommonCode 형식으로 변환
    const commonCodeData: CommonCode = {
      grp_gbn: '2', // 지사는 GRP_GBN = '2'
      grp_code: data.headquarters || data.code || '',
      code: data.code || '',
      code_name: data.name || '',
      short_code_name: data.name || '',
      remarks: data.description || null,
      ord: data.sortOrder || 0,
      use_yn: data.useYn || 'Y',
      reg_timestamp: isNew ? regTimestamp : (data.registered || null)
    }
    
    if (isNew) {
      // 신규 생성
      await commonCodeStore.createCommonCode(commonCodeData)
    } else {
      // 수정: 키는 (그룹구분, 코드) 2개. id 형식 "grpGbn_code", 그룹 코드(소속 본부) 수정 가능
      const originalId = data.id || ''
      const parts = originalId.split('_')
      if (parts.length < 2) {
        alertStore.show('잘못된 데이터 키입니다.', 'error')
        return
      }
      const grpGbn = parts[0]
      const code = parts.slice(1).join('_')
      await commonCodeStore.updateCommonCodeByGbnAndCode(grpGbn, code, commonCodeData)
    }
    alertStore.show(isNew ? '신규 생성 완료' : '수정 완료', 'success')
    // 스토어가 자동으로 업데이트되므로 별도 로드 불필요
  } catch (error: any) {
    console.error('데이터 저장 실패:', error)
    const errorMessage = commonCodeStore.error || error.response?.data?.detail || '데이터 저장 중 오류가 발생했습니다.'
    alertStore.show(errorMessage, 'error')
  }
}

// 데이터 삭제 처리
const handleDataDelete = async (ids: string[]) => {
  try {
    // 스토어의 deleteCommonCodes 메서드 사용 (복합 키 배열 전달)
    await commonCodeStore.deleteCommonCodes(ids)
    alertStore.show('삭제 완료', 'success')
  } catch (error: any) {
    console.error('데이터 삭제 실패:', error)
    const errorMessage = commonCodeStore.error || error.response?.data?.detail || '데이터 삭제 중 오류가 발생했습니다.'
    alertStore.show(errorMessage, 'error')
  }
}

// 폼 필드 정의 (등록 일자는 신규 시 현재시간 자동 설정, 수정 시 기존값 유지를 위해 hidden)
// id: 수정 시 복합 키 파싱용으로 전달되도록 hidden 포함 (모달 제출 데이터에 id가 들어가야 함)
// 소속 본부: 본부 정보(GRP_GBN=1) 셀렉트 선택 → 선택한 본부 코드가 그룹 코드(GRP_CODE)로 사용됨, 그룹구분(GRP_GBN)은 2 고정
const formFields = computed<FormField[]>(() => [
  { id: 'id', type: 'hidden' },
  { id: 'code', label: '코드', type: 'text', required: true, placeholder: '예: BR01', readonlyInEdit: true, maxLength: 5 },
  { id: 'name', label: '지사 이름', type: 'text', required: true, placeholder: '예: 동부지사', maxLength: 500 },
  { id: 'headquarters', label: '소속 본부', type: 'select', required: true, placeholder: '본부 선택', options: headquartersOptions.value },
  { id: 'description', label: '설명', type: 'textarea', required: false, rows: 3, maxLength: 500 },
  { id: 'sortOrder', label: '표시 순서', type: 'number', required: true, placeholder: '예: 1', min: 0, max: 99, maxLength: 2 },
  { id: 'useYn', label: '사용 여부', type: 'yesno', required: true },
  { id: 'registered', label: '등록 일자', type: 'hidden' }
])
</script>

<style scoped>
/* 스타일은 Table 컴포넌트에 포함되어 있음 */
</style>

