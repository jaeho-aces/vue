<template>
  <Table
    v-model="rawData"
    :columns="columns"
    :default-visible-columns="defaultVisibleColumns"
    :form-fields="formFields"
    modal-title="사용자 계정"
    :checkbox-column-width="checkboxColumnWidth"
    :id-column-width="0"
    id-field=""
    @update="handleDataUpdate"
    @delete="handleDataDelete"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, defineComponent, h } from 'vue'
import Table, { type TableColumn } from '../../common/Table.vue'
import { type FormField } from '../../common/DataFormModal.vue'
import { api } from '../../../services/api'

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

// MGMT_USER 테이블에서 사용자 정보 로드
const loadUserData = async () => {
  try {
    const response = await api.get('/api/rest-access-page/MGMT_USER')
    
    // MGMT_USER 데이터를 UserAccount 형식으로 변환
    const transformedData: UserAccount[] = response.data.map((item: any) => ({
      id: item.user_id || item.USER_ID || '',
      userId: item.user_id || item.USER_ID || '',
      name: item.user_name || item.USER_NAME || '',
      group: item.user_group || item.USER_GROUP || '',
      videoSave: item.video_save_yn || item.VIDEO_SAVE_YN || 'N',
      smsSend: item.sms_send_yn || item.SMS_SEND_YN || 'N',
      maxSplit: item.max_split || item.MAX_SPLIT || 0,
      phone: item.phone || item.PHONE || '',
      note: item.note || item.NOTE || ''
    }))
    
    rawData.value = transformedData
  } catch (error) {
    console.error('사용자 계정 로드 실패:', error)
    rawData.value = []
  }
}

// 데이터 업데이트 처리 (생성/수정)
const handleDataUpdate = async (data: Record<string, any>, isNew: boolean) => {
  try {
    // UserAccount 데이터를 MGMT_USER 형식으로 변환
    const mgmtUserData: any = {
      USER_ID: data.userId || '',
      USER_NAME: data.name || '',
      USER_GROUP: data.group || '',
      VIDEO_SAVE_YN: data.videoSave || 'N',
      SMS_SEND_YN: data.smsSend || 'N',
      MAX_SPLIT: data.maxSplit || 0,
      PHONE: data.phone || null,
      NOTE: data.note || null
    }
    
    if (isNew) {
      // 신규 생성
      await api.post('/api/rest-access-page/MGMT_USER', mgmtUserData)
    } else {
      // 수정 (USER_ID를 키로 사용)
      await api.put('/api/rest-access-page/MGMT_USER', {
        USER_ID: data.userId || data.id,
        ...mgmtUserData
      })
    }
    
    // 데이터 다시 로드
    await loadUserData()
  } catch (error: any) {
    console.error('데이터 저장 실패:', error)
    const errorMessage = error.response?.data?.detail || '데이터 저장 중 오류가 발생했습니다.'
    alert(errorMessage)
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
    
    // 데이터 다시 로드
    await loadUserData()
  } catch (error: any) {
    console.error('데이터 삭제 실패:', error)
    const errorMessage = error.response?.data?.detail || '데이터 삭제 중 오류가 발생했습니다.'
    alert(errorMessage)
  }
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  loadUserData()
})

// 폼 필드 정의
const formFields: FormField[] = [
  { id: 'userId', label: '사용자 ID', type: 'text', required: true, placeholder: '예: admin' },
  { id: 'name', label: '이름', type: 'text', required: true, placeholder: '예: 홍길동' },
  { id: 'group', label: '그룹', type: 'text', required: true, placeholder: '예: 관리자그룹' },
  { id: 'videoSave', label: '영상 저장', type: 'yesno', required: true },
  { id: 'smsSend', label: 'SMS 송출', type: 'yesno', required: true },
  { id: 'maxSplit', label: '분할 허용 최대', type: 'number', required: true, placeholder: '예: 4' },
  { id: 'phone', label: '전화번호', type: 'text', required: false, placeholder: '예: 010-1234-5678' },
  { id: 'note', label: '비고', type: 'textarea', required: false, rows: 3 }
]
</script>

<style scoped>
/* 스타일은 Table 컴포넌트에 포함되어 있음 */
</style>

