<template>
  <Table
    ref="tableRef"
    :model-value="rawData"
    :columns="columns"
    :default-visible-columns="defaultVisibleColumns"
    :form-fields="formFields"
    modal-title="미디어 서버 정보"
    :checkbox-column-width="checkboxColumnWidth"
    :id-column-width="idColumnWidth"
    id-field="fms_id"
    preference-key="vms_media_server_info"
    @update="handleDataUpdate"
    @delete="handleDataDelete"
  >
    <template #toolbar-actions-left>
      <Button @click="handleRestart" variant="info">
        재시작
      </Button>
      <Button @click="handleStop" variant="info">
        중지
      </Button>
      <Button @click="handleSwUpdate" variant="info">
        SW 업데이트
      </Button>
    </template>
  </Table>

  <!-- 재시작/중지 확인 모달 -->
  <div
    v-if="isConfirmModalOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    @click.self="closeConfirmModal"
  >
    <div class="bg-white rounded-lg shadow-xl w-full max-w-sm p-5">
      <p class="text-slate-700">{{ confirmModalMessage }}</p>
      <div class="mt-4 flex justify-end gap-2">
        <Button variant="secondary" @click="closeConfirmModal">취소</Button>
        <Button variant="primary" @click="handleConfirmAction">확인</Button>
      </div>
    </div>
  </div>

  <!-- SW 업데이트 모달 (mgmt_version 테이블 + 선택 후 업데이트) -->
  <div
    v-if="isSwUpdateModalOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    @click.self="closeSwUpdateModal"
  >
    <div class="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
      <div class="px-4 py-3 border-b border-slate-200">
        <h3 class="text-lg font-semibold text-slate-800">SW 업데이트</h3>
        <p class="text-xs text-slate-500 mt-0.5">버전 목록에서 적용할 항목을 선택한 뒤 업데이트하세요.</p>
      </div>
      <div class="flex-1 overflow-y-auto p-4">
        <table class="w-full border-collapse text-sm">
          <thead>
            <tr class="border-b border-slate-200">
              <th class="text-left py-2 pr-2 w-10">
                <input
                  type="checkbox"
                  class="rounded border-slate-300"
                  :checked="swUpdateAllChecked"
                  :indeterminate="swUpdateIndeterminate"
                  @change="toggleSwUpdateSelectAll"
                />
              </th>
              <th class="text-left py-2 px-2 font-medium text-slate-600">제품</th>
              <th class="text-left py-2 px-2 font-medium text-slate-600">버전</th>
              <th class="text-left py-2 px-2 font-medium text-slate-600">저장 경로</th>
              <th class="text-left py-2 px-2 font-medium text-slate-600">배포일자</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in versionList"
              :key="swUpdateRowKey(item)"
              class="border-b border-slate-100 hover:bg-slate-50"
            >
              <td class="py-2 pr-2">
                <input
                  type="checkbox"
                  class="rounded border-slate-300"
                  :checked="selectedVersionIds.has(swUpdateRowKey(item))"
                  @change="toggleSwUpdateSelection(swUpdateRowKey(item))"
                />
              </td>
              <td class="py-2 px-2 text-slate-700">{{ item.product_name }}</td>
              <td class="py-2 px-2 text-slate-700">{{ item.version }}</td>
              <td class="py-2 px-2 text-slate-600">{{ item.storage_path || '—' }}</td>
              <td class="py-2 px-2 text-slate-600">{{ formatReleaseDate(item.release_date) }}</td>
            </tr>
            <tr v-if="versionList.length === 0 && !versionStore.isLoading">
              <td colspan="5" class="py-6 text-center text-slate-500">버전 데이터가 없습니다.</td>
            </tr>
            <tr v-if="versionStore.isLoading">
              <td colspan="5" class="py-6 text-center text-slate-500">불러오는 중...</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="px-4 py-3 border-t border-slate-200 flex justify-end gap-2">
        <Button variant="secondary" @click="closeSwUpdateModal">취소</Button>
        <Button variant="primary" :disabled="isSubmitting || selectedVersionIds.size === 0" @click="handleSwUpdateSubmit">
          업데이트
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, defineComponent, h, ref } from 'vue'
import Table, { type TableColumn } from '../../common/Table.vue'
import { type FormField } from '../../common/DataFormModal.vue'
import Button from '../../common/Button.vue'
import { useMediaServerInfoStore, type MediaServer } from '../../../stores/mediaServerInfo'
import { useVersionMgtStore, type Version } from '../../../stores/versionMgt'
import { useCommonCodeStore } from '../../../stores/commonCode'
import { useAlertStore } from '../../../stores/alert'

// Pinia 스토어 사용
const mediaServerStore = useMediaServerInfoStore()
const versionStore = useVersionMgtStore()
const commonCodeStore = useCommonCodeStore()
const alertStore = useAlertStore()
const isSubmitting = ref(false) // 중복 요청 방지
const tableRef = ref<InstanceType<typeof Table> | null>(null)

// 재시작/중지 확인 모달
const isConfirmModalOpen = ref(false)
const confirmAction = ref<'restart' | 'stop' | null>(null)
const confirmModalMessage = computed(() =>
  confirmAction.value === 'restart' ? '선택한 서버를 재시작하겠습니까?' : '선택한 서버를 중지하겠습니까?'
)
function closeConfirmModal() {
  isConfirmModalOpen.value = false
  confirmAction.value = null
}
function openConfirmModal(action: 'restart' | 'stop') {
  confirmAction.value = action
  isConfirmModalOpen.value = true
}
function handleConfirmAction() {
  if (confirmAction.value === 'restart') {
    // TODO: 서버 재시작 API 호출 (tableRef.value?.selectedRowIds)
    alertStore.show('재시작 요청되었습니다.', 'info')
  } else if (confirmAction.value === 'stop') {
    // TODO: 서버 중지 API 호출
    alertStore.show('중지 요청되었습니다.', 'info')
  }
  closeConfirmModal()
}

// SW 업데이트 모달 (mgmt_version)
const isSwUpdateModalOpen = ref(false)
const selectedVersionIds = ref<Set<string>>(new Set())
const versionList = computed(() => versionStore.items)
function swUpdateRowKey(item: Version) {
  return `${item.version_id}|${item.product_name}`
}
function formatReleaseDate(value: string | null | undefined) {
  if (value == null || value === '') return '—'
  const s = String(value).trim()
  return s.length >= 10 ? s.slice(0, 10) : s
}
function toggleSwUpdateSelection(key: string) {
  const next = new Set(selectedVersionIds.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  selectedVersionIds.value = next
}
const swUpdateAllChecked = computed(() => versionList.value.length > 0 && selectedVersionIds.value.size === versionList.value.length)
const swUpdateIndeterminate = computed(() => selectedVersionIds.value.size > 0 && selectedVersionIds.value.size < versionList.value.length)
function toggleSwUpdateSelectAll() {
  if (selectedVersionIds.value.size === versionList.value.length) {
    selectedVersionIds.value = new Set()
  } else {
    selectedVersionIds.value = new Set(versionList.value.map((item) => swUpdateRowKey(item)))
  }
}
function closeSwUpdateModal() {
  isSwUpdateModalOpen.value = false
  selectedVersionIds.value = new Set()
}
async function handleSwUpdateSubmit() {
  if (isSubmitting.value || selectedVersionIds.value.size === 0) return
  try {
    isSubmitting.value = true
    // TODO: 선택한 서버(selectedIds)에 선택한 버전(selectedVersionIds)으로 SW 업데이트 API 호출
    const versionKeys = Array.from(selectedVersionIds.value)
    alertStore.show(`선택한 버전 ${versionKeys.length}건으로 업데이트 요청되었습니다.`, 'success')
    closeSwUpdateModal()
  } catch (error: any) {
    const msg = versionStore.error || error?.message || 'SW 업데이트 중 오류가 발생했습니다.'
    alertStore.show(msg, 'error')
  } finally {
    isSubmitting.value = false
  }
}

// 셀 컴포넌트들
const TextCell = defineComponent({
  props: {
    value: {
      type: [String, Number, Boolean],
      default: ''
    }
  },
  setup(props) {
    // Boolean 값 처리
    const displayValue = typeof props.value === 'boolean' 
      ? String(props.value)
      : String(props.value || '')
    return () => h('span', { class: 'text-sm text-slate-700' }, displayValue)
  }
})

// MediaServer 인터페이스는 stores/mediaServerInfo.ts에서 import하므로 여기서는 제거

// 기본 컬럼 너비 설정
const checkboxColumnWidth = 50
const idColumnWidth = 120

const ServerTypeCell = defineComponent({
  props: {
    value: {
      type: [String, Number],
      default: ''
    }
  },
  setup(props) {
    const mappedName = computed(() => {
      if (!props.value) return ''
      return commonCodeStore.getCodeName('C', '11', String(props.value))
    })
    return () => h('span', { class: 'text-sm text-slate-700' }, mappedName.value)
  }
})

// 컬럼 정의 (백엔드 스키마에 맞춤)
const columns: TableColumn[] = [
  { id: 'fms_name', header: '서버 이름', size: 150, cellComponent: TextCell },
  { id: 'fms_ip', header: 'IP', size: 130, cellComponent: TextCell },
  { id: 'fms_port', header: 'Port', size: 100, cellComponent: TextCell },
  { id: 'fms_con_id', header: '사용자 ID', size: 120, cellComponent: TextCell },
  { id: 'svr_type', header: '서버 종류', size: 120, cellComponent: ServerTypeCell }
]

// 기본 표시 컬럼
const defaultVisibleColumns = [
  'fms_name', 'fms_ip', 'fms_port', 'svr_type'
]

// 스토어의 데이터를 직접 참조 (computed 사용)
const rawData = computed(() => mediaServerStore.items)

// 서버 종류 옵션: 공통코드 grp_gbn='C', grp_code='11'
const serverTypeOptions = computed(() =>
  commonCodeStore.getByGrpGbn('C')
    .filter((item: { grp_code: string }) => String(item.grp_code) === '11')
    .map((item: { code: string; code_name: string }) => ({
      value: item.code || '',
      label: (item.code_name || '').trim() || item.code || ''
    }))
)

// 폼 필드 정의 (백엔드 스키마에 맞춤)
const formFields = computed<FormField[]>(() => [
  { id: 'fms_id', label: '미디어 서버 ID', type: 'text', required: true, placeholder: 'fms0000XXXX', maxLength: 11, readonlyInEdit: true },
  { id: 'fms_name', label: '미디어 서버 이름', type: 'text', required: true, placeholder: '한글/영문' },
  { id: 'fms_ip', label: 'IP 주소', type: 'ip', required: true, placeholder: '' },
  { id: 'fms_port', label: '포트', type: 'number', required: true, placeholder: '0~65535', min: 0, max: 65535 },
  { id: 'fms_con_id', label: '접속 ID', type: 'text', placeholder: '접속 ID' },
  { id: 'fms_passwd', label: '접속 PW', type: 'password', placeholder: '접속 암호' },
  { id: 'svr_type', label: '서버 종류', type: 'select', required: true, placeholder: '서버 종류 선택', options: serverTypeOptions.value }
])

// 데이터 업데이트 처리 (생성/수정)
const handleDataUpdate = async (data: Record<string, any>, isNew: boolean) => {
  if (isSubmitting.value || mediaServerStore.isLoading) return
  try {
    isSubmitting.value = true
    if (isNew) {
      const fms_id = String(data.fms_id ?? '').trim().slice(0, 11)
      const payload = { ...data, fms_id }
      await mediaServerStore.createMediaServer(payload as MediaServer)
    } else {
      await mediaServerStore.updateMediaServer(data.fms_id, data)
    }
    await mediaServerStore.fetchMediaServers(true)
    alertStore.show(isNew ? '신규 생성 완료' : '수정 완료', 'success')
    tableRef.value?.closeModal?.()
  } catch (error: any) {
    const errorMessage = mediaServerStore.error || error.response?.data?.detail || '데이터 저장 중 오류가 발생했습니다.'
    alertStore.show(errorMessage, 'error')
  } finally {
    isSubmitting.value = false
  }
}

// 데이터 삭제 처리
const handleDataDelete = async (ids: string[]) => {
  if (isSubmitting.value || mediaServerStore.isLoading) return
  try {
    isSubmitting.value = true
    await mediaServerStore.deleteMediaServers(ids)
    await mediaServerStore.fetchMediaServers(true)
    alertStore.show('삭제 완료', 'success')
  } catch (error: any) {
    const errorMessage = mediaServerStore.error || error.response?.data?.detail || '데이터 삭제 중 오류가 발생했습니다.'
    alertStore.show(errorMessage, 'error')
  } finally {
    isSubmitting.value = false
  }
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(async () => {
  try {
    await commonCodeStore.fetchCommonCodes()
    await mediaServerStore.fetchMediaServers()
  } catch (_error) {}
})

// 재시작 버튼 핸들러
const handleRestart = () => {
  const selectedIds = tableRef.value?.selectedRowIds ? Array.from(tableRef.value.selectedRowIds) : []
  if (selectedIds.length === 0) {
    alertStore.show('재시작할 서버를 선택하세요.', 'warning')
    return
  }
  openConfirmModal('restart')
}

// 중지 버튼 핸들러
const handleStop = () => {
  const selectedIds = tableRef.value?.selectedRowIds ? Array.from(tableRef.value.selectedRowIds) : []
  if (selectedIds.length === 0) {
    alertStore.show('중지할 서버를 선택하세요.', 'warning')
    return
  }
  openConfirmModal('stop')
}

// SW 업데이트 버튼 핸들러
async function handleSwUpdate() {
  const selectedIds = tableRef.value?.selectedRowIds ? Array.from(tableRef.value.selectedRowIds) : []
  if (selectedIds.length === 0) {
    alertStore.show('업데이트할 서버를 선택하세요.', 'warning')
    return
  }
  selectedVersionIds.value = new Set()
  isSwUpdateModalOpen.value = true
  try {
    await versionStore.fetchVersions(true)
  } catch (_e) {
    alertStore.show('버전 목록을 불러오지 못했습니다.', 'error')
  }
}
</script>

<style scoped>
/* 스타일은 Table 컴포넌트에 포함되어 있음 */
</style>
