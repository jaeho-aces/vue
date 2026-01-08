<template>
  <Table
    :model-value="rawDataWithKey"
    :columns="columns"
    :default-visible-columns="defaultVisibleColumns"
    :form-fields="formFields"
    modal-title="공통 코드"
    :checkbox-column-width="checkboxColumnWidth"
    :id-column-width="idColumnWidth"
    id-field="key"
    @update="handleDataUpdate"
    @delete="handleDataDelete"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, defineComponent, h, ref } from 'vue'
import Table, { type TableColumn } from '../../common/Table.vue'
import { type FormField } from '../../common/DataFormModal.vue'
import { useCommonCodeStore, type CommonCode, getCommonCodeKey } from '../../../stores/commonCode'

// Pinia 스토어 사용
const commonCodeStore = useCommonCodeStore()
const isSubmitting = ref(false) // 중복 요청 방지

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

// 기본 컬럼 너비 설정
const checkboxColumnWidth = 50
const idColumnWidth = 120
const columnWidths = [120, 120, 120, 150, 120, 250, 100, 100, 120]

// 컬럼 정의
const columns: TableColumn[] = [
  { id: 'grp_gbn', header: '그룹 구분', size: columnWidths[0], cellComponent: TextCell },
  { id: 'grp_code', header: '그룹 코드', size: columnWidths[1], cellComponent: TextCell },
  { id: 'code', header: '코드', size: columnWidths[2], cellComponent: TextCell },
  { id: 'code_name', header: '코드 이름', size: columnWidths[3], cellComponent: TextCell },
  { id: 'short_code_name', header: '짧은 코드 이름', size: columnWidths[4], cellComponent: TextCell },
  { id: 'remarks', header: '설명', size: columnWidths[5], cellComponent: TextCell },
  { id: 'ord', header: '표시 순서', size: columnWidths[6], cellComponent: TextCell },
  { id: 'use_yn', header: '사용 여부', size: columnWidths[7], cellComponent: YesNoCell },
  { id: 'reg_timestamp', header: '등록 일자', size: columnWidths[8], cellComponent: TextCell }
]

// 기본 표시 컬럼
const defaultVisibleColumns = ['grp_gbn', 'grp_code', 'code', 'code_name', 'short_code_name', 'use_yn', 'reg_timestamp']

// 스토어의 데이터를 직접 참조 (computed 사용)
// Table 컴포넌트가 idField를 사용하므로, 복합 키를 추가
const rawDataWithKey = computed(() => {
  return commonCodeStore.items.map(item => ({
    ...item,
    key: getCommonCodeKey(item) // grp_gbn_grp_code_code 형식의 키
  }))
})

// 폼 필드 정의 (ID 필드 제거)
const formFields: FormField[] = [
  { id: 'grp_gbn', label: '그룹 구분', type: 'text', required: true, placeholder: '예: 시스템' },
  { id: 'grp_code', label: '그룹 코드', type: 'text', required: true, placeholder: '예: STATUS' },
  { id: 'code', label: '코드', type: 'text', required: true, placeholder: '예: ACTIVE' },
  { id: 'code_name', label: '코드 이름', type: 'text', required: true, placeholder: '예: 활성 상태' },
  { id: 'short_code_name', label: '짧은 코드 이름', type: 'text', required: false, placeholder: '예: 활성' },
  { id: 'remarks', label: '설명', type: 'textarea', required: false, rows: 3 },
  { id: 'ord', label: '표시 순서', type: 'number', required: true, placeholder: '예: 1' },
  { id: 'use_yn', label: '사용 여부', type: 'yesno', required: true },
  { id: 'reg_timestamp', label: '등록 일자', type: 'text', required: false, placeholder: 'YYYY-MM-DD' }
]

// 데이터 업데이트 처리 (생성/수정)
const handleDataUpdate = async (data: Record<string, any>, isNew: boolean) => {
  if (isSubmitting.value || commonCodeStore.isLoading) {
    console.warn('이미 처리 중인 요청이 있습니다.')
    return
  }
  try {
    isSubmitting.value = true
    if (isNew) {
      await commonCodeStore.createCommonCode(data as CommonCode)
    } else {
      // 수정 시에는 grp_gbn, grp_code, code를 사용
      await commonCodeStore.updateCommonCode(
        data.grp_gbn,
        data.grp_code,
        data.code,
        data
      )
    }
  } catch (error: any) {
    console.error('데이터 저장 실패:', error)
    const errorMessage = commonCodeStore.error || error.response?.data?.detail || '데이터 저장 중 오류가 발생했습니다.'
    alert(errorMessage)
  } finally {
    isSubmitting.value = false
  }
}

// 데이터 삭제 처리 (keys는 복합 키 배열)
const handleDataDelete = async (keys: string[]) => {
  if (isSubmitting.value || commonCodeStore.isLoading) {
    console.warn('이미 처리 중인 요청이 있습니다.')
    return
  }
  try {
    isSubmitting.value = true
    await commonCodeStore.deleteCommonCodes(keys)
  } catch (error: any) {
    console.error('데이터 삭제 실패:', error)
    const errorMessage = commonCodeStore.error || error.response?.data?.detail || '데이터 삭제 중 오류가 발생했습니다.'
    alert(errorMessage)
  } finally {
    isSubmitting.value = false
  }
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  commonCodeStore.fetchCommonCodes()
})
</script>

<style scoped>
/* 스타일은 Table 컴포넌트에 포함되어 있음 */
</style>

