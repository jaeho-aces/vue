<template>
  <Table
    v-model="rawData"
    :columns="columns"
    :default-visible-columns="defaultVisibleColumns"
    :form-fields="formFields"
    modal-title="사용자 계정"
    :checkbox-column-width="checkboxColumnWidth"
    :id-column-width="0"
    id-field="id"
    preference-key="vms_user_account"
    @update="handleDataUpdate"
    @delete="handleDataDelete"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, defineComponent, h } from 'vue'
import Table, { type TableColumn } from '../../common/Table.vue'
import { type FormField } from '../../common/DataFormModal.vue'
import { api } from '../../../services/api'
import { useAlertStore } from '../../../stores/alert'
import { sha256Hex } from '../../../utils/crypto'

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
    const isYes = props.value === 'Y' || props.value === 1
    return () => h('span', {
      class: [
        'inline-block px-2 py-0.5 rounded text-xs font-bold',
        isYes ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
      ]
    }, isYes ? 'Y' : 'N')
  }
})

interface UserAccount {
  id: string
  userId: string
  name: string
  password?: string
  email: string
  phone: string
  memo: string
  canSendSms: number
  groupName: string
}

// 기본 컬럼 너비 설정
const checkboxColumnWidth = 50
const columnWidths = [120, 100, 80, 90, 120, 100, 150]

// 컬럼 정의
const columns: TableColumn[] = [
  { id: 'userId', header: '사용자 ID', size: columnWidths[0], cellComponent: TextCell },
  { id: 'name', header: '사용자 이름', size: columnWidths[1], cellComponent: TextCell },
  { id: 'groupName', header: '그룹', size: columnWidths[2], cellComponent: TextCell },
  { id: 'canSendSms', header: 'SMS 허용', size: columnWidths[3], cellComponent: YesNoCell },
  { id: 'phone', header: '전화번호', size: columnWidths[4], cellComponent: TextCell },
  { id: 'email', header: 'Email', size: columnWidths[5], cellComponent: TextCell },
  { id: 'memo', header: '메모', size: columnWidths[6], cellComponent: TextCell }
]

// 기본 표시 컬럼
const defaultVisibleColumns = ['userId', 'name', 'groupName', 'canSendSms', 'phone', 'email', 'memo']

// 데이터 관리
const rawData = ref<UserAccount[]>([])

// MGMT_USER 테이블에서 사용자 정보 로드
const loadUserData = async () => {
  try {
    const response = await api.get('/api/rest-access-page/MGMT_USER')
    
    // MGMT_USER 데이터를 UserAccount 형식으로 변환
    const transformedData: UserAccount[] = response.data.map((item: any) => ({
      id: item.user_id ?? item.USER_ID ?? '',
      userId: item.user_id ?? item.USER_ID ?? '',
      name: item.user_name ?? item.USER_NAME ?? '',
      email: item.email ?? item.EMAIL ?? '',
      phone: item.phone ?? item.PHONE ?? '',
      memo: item.memo ?? item.MEMO ?? '',
      canSendSms: item.can_send_sms ?? item.CAN_SEND_SMS ?? 0,
      groupName: item.group_name ?? item.GROUP_NAME ?? ''
    }))
    
    rawData.value = transformedData
  } catch (error) {
    console.error('사용자 계정 로드 실패:', error)
    rawData.value = []
  }
}

// 데이터 업데이트 처리 (생성/수정). 비밀번호는 클라이언트 SHA-256 + 넌스로 전송, 서버에서 bcrypt 저장.
const handleDataUpdate = async (data: Record<string, any>, isNew: boolean) => {
  try {
    const mgmtUserData: any = {
      USER_ID: data.userId || data.id || '',
      USER_NAME: data.name || '',
      EMAIL: data.email || null,
      PHONE: data.phone || null,
      MEMO: data.memo || null,
      CAN_SEND_SMS: data.canSendSms === 'Y' || data.canSendSms === 1 ? 1 : 0,
      GROUP_NAME: data.groupName || null
    }
    if (isNew) {
      if (!data.password?.trim()) {
        alertStore.show('신규 사용자는 암호를 입력해야 합니다.', 'warning')
        return
      }
      const nonceRes = await api.get<{ nonce: string }>('/api/auth/nonce')
      const nonce = nonceRes.data?.nonce
      if (!nonce) {
        alertStore.show('넌스 발급에 실패했습니다.', 'error')
        return
      }
      mgmtUserData.PASSWORD = await sha256Hex(data.password.trim())
      mgmtUserData.NONCE = nonce
      await api.post('/api/rest-access-page/MGMT_USER', mgmtUserData)
    } else {
      if (data.password?.trim()) {
        const nonceRes = await api.get<{ nonce: string }>('/api/auth/nonce')
        const nonce = nonceRes.data?.nonce
        if (!nonce) {
          alertStore.show('넌스 발급에 실패했습니다.', 'error')
          return
        }
        mgmtUserData.PASSWORD = await sha256Hex(data.password.trim())
        mgmtUserData.NONCE = nonce
      }
      await api.put('/api/rest-access-page/MGMT_USER', mgmtUserData)
    }
    alertStore.show(isNew ? '신규 생성 완료' : '수정 완료', 'success')
    await loadUserData()
  } catch (error: any) {
    console.error('데이터 저장 실패:', error)
    const detail = error.response?.data?.detail
    const errorMessage = typeof detail === 'string' ? detail : Array.isArray(detail) ? detail.map((d: any) => d?.msg ?? d).join(', ') : (detail?.message || '데이터 저장 중 오류가 발생했습니다.')
    alertStore.show(`저장 실패: ${errorMessage}`, 'error')
  }
}

// 데이터 삭제 처리
const handleDataDelete = async (ids: string[]) => {
  try {
    // 각 ID를 USER_ID로 사용하여 삭제
    for (const id of ids) {
      await api.delete('/api/rest-access-page/MGMT_USER', {
        params: {
          key: id
        }
      })
    }
    alertStore.show('삭제 완료', 'success')
    // 데이터 다시 로드
    await loadUserData()
  } catch (error: any) {
    console.error('데이터 삭제 실패:', error)
    const errorMessage = error.response?.data?.detail || '데이터 삭제 중 오류가 발생했습니다.'
    alertStore.show(errorMessage, 'error')
  }
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  loadUserData()
})

// 폼 필드 정의
const formFields: FormField[] = [
  { id: 'userId', label: '사용자 ID', type: 'text', required: true, placeholder: '' },
  { id: 'name', label: '사용자 이름', type: 'text', required: true, placeholder: '' },
  { id: 'password', label: '암호', type: 'password', required: false, placeholder: '신규: 필수, 수정: 변경 시만 입력' },
  { id: 'groupName', label: '그룹', type: 'toggle', required: false, options: [{ value: 'user', label: 'User' }, { value: 'admin', label: 'Admin' }] },
  { id: 'email', label: 'Email', type: 'text', required: false, placeholder: '예: user@example.com', maxLength: 100, pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', patternMessage: '올바른 이메일 형식으로 입력해 주세요.' },
  { id: 'phone', label: '전화 번호', type: 'text', required: false, placeholder: '예: 010-1234-5678', maxLength: 64, pattern: '^[0-9\\s-()+]*$', patternMessage: '숫자, 공백, 하이픈(-), 괄호만 입력 가능합니다.' },
  { id: 'canSendSms', label: 'SMS 전송 허용', type: 'yesno', required: false },
  { id: 'memo', label: '메모', type: 'textarea', required: false, rows: 3 }
]
</script>

<style scoped>
/* 스타일은 Table 컴포넌트에 포함되어 있음 */
</style>

