<template>
  <Table
    :key="tableRefreshKey"
    ref="tableRef"
    :model-value="rawData"
    :columns="columns"
    :default-visible-columns="defaultVisibleColumns"
    :form-fields="formFields"
    modal-title="영상 변환 서버 정보"
    :checkbox-column-width="checkboxColumnWidth"
    :id-column-width="idColumnWidth"
    id-field="trans_id"
    preference-key="vms_video_conversion_server_info"
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
import { useVideoConversionServerInfoStore, type VideoConversionServer } from '../../../stores/videoConversionServerInfo'
import { useVersionMgtStore, type Version } from '../../../stores/versionMgt'
import { useAlertStore } from '../../../stores/alert'
import { api } from '../../../services/api'

// Pinia 스토어 사용
const videoConversionServerStore = useVideoConversionServerInfoStore()
const versionStore = useVersionMgtStore()
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
    // 서버 중지 API 호출
    const selectedIds = tableRef.value?.selectedRowIds
      ? Array.from(tableRef.value.selectedRowIds)
      : []
    if (selectedIds.length !== 1) {
      alertStore.show('중지할 서버를 1개만 선택하세요.', 'warning')
      closeConfirmModal()
      return
    }
    const serverId = String(selectedIds[0] ?? '').trim()
    if (!serverId) {
      alertStore.show('선택한 서버 ID를 확인할 수 없습니다.', 'error')
      closeConfirmModal()
      return
    }
    // eslint-disable-next-line no-console
    console.log('[VideoConversionServerInfo] stop confirm', { serverId })
    ;(async () => {
      try {
        isSubmitting.value = true
        // FastAPI TCS7000 중지 API 호출
        const res = await api.post('/api/tcs/stop', { serverId })
        // eslint-disable-next-line no-console
        console.log('[VideoConversionServerInfo] /api/tcs/stop response', res.data)
        alertStore.show('중지 요청되었습니다.', 'success')
        // 1) 스토어 상태를 즉시 alive='n' 으로 업데이트 (UI 즉시 반영)
        const idx = videoConversionServerStore.items.findIndex((s) => s.trans_id === serverId)
        if (idx !== -1) {
          const current = videoConversionServerStore.items[idx]
          videoConversionServerStore.items[idx] = {
            ...current,
            alive: 'n'
          }
        }
        // 2) 백엔드와 동기화를 위해 목록 재조회
        await videoConversionServerStore.fetchVideoConversionServers(true)
      } catch (error: any) {
        const detail =
          error?.response?.data?.detail ||
          error?.message ||
          '영상 변환 서버 중지 요청 중 오류가 발생했습니다.'
        alertStore.show(detail, 'error')
      } finally {
        isSubmitting.value = false
      }
    })()
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
    const displayValue = typeof props.value === 'boolean' 
      ? String(props.value)
      : String(props.value || '')
    return () => h('span', { class: 'text-sm text-slate-700' }, displayValue)
  }
})

const StatusCell = defineComponent({
  props: {
    value: {
      type: [String, Number, Boolean],
      default: ''
    }
  },
  setup(props) {
    const valueStr = String(props.value || '').toUpperCase()
    const isAlive = valueStr === 'Y' || valueStr === 'TRUE' || props.value === true
    
    const statusClass = isAlive ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'
    const dotClass = isAlive ? 'bg-green-500' : 'bg-slate-400'
    const statusText = isAlive ? '정상' : '중지'
    
    return () => h('span', {
      class: ['inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', statusClass]
    }, [
      h('span', { class: ['w-1.5 h-1.5 rounded-full', dotClass] }),
      statusText
    ])
  }
})

const YesNoCell = defineComponent({
  props: {
    value: {
      type: [String, Number, Boolean],
      default: ''
    }
  },
  setup(props) {
    const isYes = props.value === 'Y' || props.value === true || props.value === 'true' || String(props.value).toUpperCase() === 'Y'
    return () => h('span', {
      class: [
        'inline-block px-2 py-0.5 rounded text-xs font-bold',
        isYes ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
      ]
    }, isYes ? 'Y' : 'N')
  }
})

function toDateOnly(value: unknown): string {
  if (value == null || value === '') return ''
  const s = String(value).trim()
  return s.length >= 10 ? s.slice(0, 10) : s
}

const DateOnlyCell = defineComponent({
  props: {
    value: {
      type: [String, Number, Boolean],
      default: ''
    }
  },
  setup(props) {
    return () => h('span', { class: 'text-sm text-slate-700' }, toDateOnly(props.value))
  }
})

// VideoConversionServer 인터페이스는 stores/videoConversionServerInfo.ts에서 import하므로 여기서는 제거

// 기본 컬럼 너비 설정
const checkboxColumnWidth = 50
const idColumnWidth = 150

// 컬럼 정의 (백엔드 스키마에 맞춤)
const columns: TableColumn[] = [
  { id: 'trans_name', header: '서버 이름', size: 150, cellComponent: TextCell },
  { id: 'trans_ip', header: 'IP', size: 130, cellComponent: TextCell },
  { id: 'trans_port', header: 'Port', size: 120, cellComponent: TextCell },
  { id: 'alive', header: '동작 여부', size: 100, cellComponent: StatusCell },
  { id: 'alive_time', header: '마지막 동작 시간', size: 180, cellComponent: DateOnlyCell },
  { id: 'json_job', header: 'JSON 처리', size: 120, cellComponent: TextCell },
  { id: 'json_yn', header: 'JSON 사용 여부', size: 100, cellComponent: YesNoCell },
  { id: 'json_date', header: '마지막 명령 일자', size: 160, cellComponent: DateOnlyCell },
  { id: 'version', header: '버전', size: 120, cellComponent: TextCell },
  { id: 'build_date', header: '파일 생성 일자', size: 160, cellComponent: DateOnlyCell },
  { id: 'start_date', header: '시작 시간', size: 160, cellComponent: DateOnlyCell },
  { id: 'reg_date', header: '등록일자', size: 160, cellComponent: DateOnlyCell }
]

// 기본 표시 컬럼
const defaultVisibleColumns = [
  'trans_name', 'trans_ip', 'alive', 'version', 'start_date', 'reg_date'
]

// 스토어의 데이터를 직접 참조 (computed 사용)
const rawData = computed(() => videoConversionServerStore.items)
// fetch 후 테이블 강제 재렌더링용 (수정/삭제 후 즉시 반영)
const tableRefreshKey = ref(0)

// 폼 필드 정의: 서버 ID(문자 10자리), 서버 이름, 서버 IP 주소, 통신 포트 번호만 입력.
const formFields: FormField[] = [
  { id: 'trans_id', label: '변환 서버 ID', type: 'text', required: true, placeholder: 'tr0000XXXX', maxLength: 10, readonlyInEdit: true },
  { id: 'trans_name', label: '서버 이름', type: 'text', required: true, placeholder: '' },
  { id: 'trans_ip', label: 'IP', type: 'ip', required: true, placeholder: '' },
  { id: 'trans_port', label: '포트', type: 'number', required: true, placeholder: '0~65535', min: 0, max: 65535, maxLength: 5 }
]

// 데이터 업데이트 처리 (생성/수정)
const handleDataUpdate = async (data: Record<string, any>, isNew: boolean) => {
  if (isSubmitting.value || videoConversionServerStore.isLoading) return
  try {
    isSubmitting.value = true
    if (isNew) {
      const transId = String(data.trans_id || '').trim()
      const payload = {
        ...data,
        trans_id: transId
      }
      await videoConversionServerStore.createVideoConversionServer(payload as VideoConversionServer)
    } else {
      await videoConversionServerStore.updateVideoConversionServer(data.trans_id, data)
    }
    await videoConversionServerStore.fetchVideoConversionServers(true)
    tableRefreshKey.value += 1
    alertStore.show(isNew ? '신규 생성 완료' : '수정 완료', 'success')
    tableRef.value?.closeModal?.()
  } catch (error: any) {
    const detail = error.response?.data?.detail || videoConversionServerStore.error || ''
    const detailText = typeof detail === 'string'
      ? detail
      : Array.isArray(detail)
        ? detail.map((d: any) => d?.msg ?? d).join(', ')
        : (detail?.message ?? '')
    const lower = detailText.toLowerCase()
    const isDuplicate = lower.includes('duplicate')
      || lower.includes('already exists')
      || lower.includes('conditionalcheckfailed')
      || lower.includes('key must have')
      || lower.includes('unique')
      || detailText.includes('고유 제약')
      || detailText.includes('키가 이미 있습니다')
      || detailText.includes('이미 있습니다')
    const errorMessage = isDuplicate
      ? '이미 존재하는 서버 ID입니다. 다른 값을 입력해주세요.'
      : (detailText || '데이터 저장 중 오류가 발생했습니다.')
    alertStore.show(errorMessage, 'error')
  } finally {
    isSubmitting.value = false
  }
}

// 데이터 삭제 처리
const handleDataDelete = async (ids: string[]) => {
  if (isSubmitting.value || videoConversionServerStore.isLoading) return
  try {
    isSubmitting.value = true
    await videoConversionServerStore.deleteVideoConversionServers(ids)
    await videoConversionServerStore.fetchVideoConversionServers(true)
    tableRefreshKey.value += 1
    alertStore.show('삭제 완료', 'success')
  } catch (error: any) {
    const errorMessage = videoConversionServerStore.error || error.response?.data?.detail || '데이터 삭제 중 오류가 발생했습니다.'
    alertStore.show(errorMessage, 'error')
  } finally {
    isSubmitting.value = false
  }
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(async () => {
  try {
    await videoConversionServerStore.fetchVideoConversionServers()
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
