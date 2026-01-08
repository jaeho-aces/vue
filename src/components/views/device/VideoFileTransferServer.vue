<template>
  <Table
    v-model="rawData"
    :columns="columns"
    :default-visible-columns="defaultVisibleColumns"
    :form-fields="formFields"
    modal-title="영상 파일 전송 서버 정보"
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

interface VideoTransferServer {
  id: string
  name: string
  ip: string
  targetIp: string
  type: string
  userId: string
  password: string
  targetRootPath: string
}

// 기본 컬럼 너비 설정
const checkboxColumnWidth = 50
const idColumnWidth = 120
const columnWidths = [150, 130, 130, 120, 120, 120, 200]

// 컬럼 정의
const columns: TableColumn[] = [
  { id: 'name', header: '서버 이름', size: columnWidths[0], cellComponent: TextCell },
  { id: 'ip', header: 'IP 주소', size: columnWidths[1], cellComponent: TextCell },
  { id: 'targetIp', header: '대상 서버 IP', size: columnWidths[2], cellComponent: TextCell },
  { id: 'type', header: '서버 종류', size: columnWidths[3], cellComponent: TextCell },
  { id: 'userId', header: '사용자 ID', size: columnWidths[4], cellComponent: TextCell },
  { id: 'password', header: '암호', size: columnWidths[5], cellComponent: TextCell },
  { id: 'targetRootPath', header: '대상 서버 루트 경로', size: columnWidths[6], cellComponent: TextCell }
]

// 기본 표시 컬럼
const defaultVisibleColumns = ['name', 'ip', 'targetIp', 'type', 'userId']

// 데이터 관리
const rawData = ref<VideoTransferServer[]>([])

// 폼 필드 정의
const formFields: FormField[] = [
  { id: 'id', label: 'ID', type: 'text', required: true, placeholder: '예: VTS-001' },
  { id: 'name', label: '서버 이름', type: 'text', required: true },
  { id: 'ip', label: 'IP 주소', type: 'text', required: true, placeholder: '예: 192.168.1.201' },
  { id: 'targetIp', label: '대상 서버 IP', type: 'text', required: true, placeholder: '예: 192.168.1.251' },
  { 
    id: 'type', 
    label: '서버 종류', 
    type: 'select', 
    required: true,
    options: [
      { value: 'FTP', label: 'FTP' },
      { value: 'SFTP', label: 'SFTP' },
      { value: 'NFS', label: 'NFS' }
    ]
  },
  { id: 'userId', label: '사용자 ID', type: 'text', required: true },
  { id: 'password', label: '암호', type: 'text', required: true },
  { id: 'targetRootPath', label: '대상 서버 루트 경로', type: 'text', required: true, placeholder: '예: /data/transfer' }
]

// 버튼 핸들러와 업데이트 핸들러는 Table 내부에서 자동으로 처리됨
// v-model로 데이터가 자동으로 동기화됨

// 데이터 생성 함수
const generateData = (count: number): VideoTransferServer[] => {
  const names = ['TransferServer-01', 'TransferServer-02', 'TransferServer-03', 'TransferServer-04', 'TransferServer-05']
  const ips = ['192.168.1.201', '192.168.1.202', '192.168.1.203', '192.168.1.204', '192.168.1.205']
  const targetIps = ['192.168.1.251', '192.168.1.252', '192.168.1.253', '192.168.1.254', '192.168.1.255']
  const types = ['FTP', 'SFTP', 'NFS']
  const userIds = ['admin', 'transfer', 'user']
  const paths = ['/data/transfer', '/storage/video', '/mnt/transfer']

  const data: VideoTransferServer[] = []
  
  for (let i = 1; i <= count; i++) {
    const id = `VTS-${String(i).padStart(3, '0')}`
    const name = names[Math.floor(Math.random() * names.length)]
    const ip = ips[Math.floor(Math.random() * ips.length)]
    const targetIp = targetIps[Math.floor(Math.random() * targetIps.length)]
    const type = types[Math.floor(Math.random() * types.length)]
    const userId = userIds[Math.floor(Math.random() * userIds.length)]
    const password = '••••••••'
    const targetRootPath = paths[Math.floor(Math.random() * paths.length)]

    data.push({
      id,
      name,
      ip,
      targetIp,
      type,
      userId,
      password,
      targetRootPath
    })
  }
  
  return data
}

// 데이터 초기화 (5000개)
rawData.value = generateData(5000)
</script>

<style scoped>
/* 스타일은 Table 컴포넌트에 포함되어 있음 */
</style>




