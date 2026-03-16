<template>
  <Table
    ref="tableRef"
    :model-value="rawData"
    :columns="columns"
    :default-visible-columns="defaultVisibleColumns"
    :form-fields="formFields"
    modal-title="영상 변환 채널 정보"
    modal-size="xlarge"
    :checkbox-column-width="checkboxColumnWidth"
    :id-column-width="idColumnWidth"
    id-field="ch_id"
    preference-key="vms_video_conversion_info"
    hide-new-button
    hide-edit-button
    @update="handleDataUpdate"
    @delete="handleDataDelete"
  >
    <template #toolbar-actions-left>
      <Button
        @click="handleTransferHistory"
        variant="secondary"
        :disabled="isEditButtonDisabled"
      >
        전송 이력
      </Button>
      <Button
        @click="handleConnectionHistory"
        variant="secondary"
        :disabled="isEditButtonDisabled"
      >
        접속 이력
      </Button>
      <Button
        @click="handleStopTranscoder"
        variant="danger"
        :disabled="isEditButtonDisabled"
      >
        중지
      </Button>
      <Button @click="handleNewOpen" variant="primary">
        신규
      </Button>
      <Button
        @click="handleEditOpen"
        variant="secondary"
        :disabled="isEditButtonDisabled"
      >
        수정
      </Button>
      <Button @click="handleBatchUpdate" variant="info" :disabled="isBatchButtonDisabled">
        일괄 변경
      </Button>
    </template>
  </Table>
  
  <!-- 일괄 변경 모달 (수정 모달과 동일 레이아웃) -->
  <div
    v-if="isBatchModalOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    @click.self="handleBatchModalClose"
  >
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
      <div class="px-4 py-3 border-b border-slate-200">
        <h3 class="text-lg font-semibold text-slate-800">일괄 변경</h3>
        <p class="text-xs text-slate-500 mt-0.5">변경할 값을 선택하세요. 선택한 항목만 반영됩니다.</p>
      </div>
      <div class="flex-1 overflow-y-auto p-4">
        <!-- 수정 모달과 동일: 상단 안내 영역 -->
        <div class="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-slate-200">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">선택된 항목</label>
            <span class="block text-sm text-slate-600">{{ batchSelectedCount }}개</span>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">적용 방식</label>
            <span class="block text-sm text-slate-600">선택한 필드만 반영</span>
          </div>
        </div>
        <table class="w-full border-collapse text-sm">
          <thead>
            <tr class="border-b border-slate-200">
              <th class="text-left py-2 pr-4 font-medium text-slate-600 w-28"></th>
              <th class="text-left py-2 px-2 font-medium text-slate-600">사용</th>
              <th class="text-left py-2 px-2 font-medium text-slate-600">크기</th>
              <th class="text-left py-2 px-2 font-medium text-slate-600">Bit rate</th>
              <th class="text-left py-2 px-2 font-medium text-slate-600">코덱</th>
              <th class="text-left py-2 px-2 font-medium text-slate-600">Frame</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-slate-100">
              <td class="py-2 pr-4 font-medium text-slate-700">Bypass</td>
              <td class="py-2 px-2">
                <BatchCell v-model:value="batchFieldState.ch_bypass" type="use" />
              </td>
            </tr>
            <tr class="border-b border-slate-100">
              <td class="py-2 pr-4 font-medium text-slate-700">실시간 영상</td>
              <td class="py-2 px-2">
                <BatchCell v-model:value="batchFieldState.ch_alive" type="use" :disabled="isBatchBypassOn" />
              </td>
              <td class="py-2 px-2">
                <BatchCell
                  v-model:value="batchFieldState.ch_vsize"
                  type="select"
                  :options="videoSizeOptions"
                  :disabled="isBatchBypassOn"
                />
              </td>
              <td class="py-2 px-2">
                <BatchCell
                  v-model:value="batchFieldState.ch_vkpbs"
                  type="select"
                  :options="bitRateOptions"
                  :disabled="isBatchBypassOn"
                />
              </td>
              <td class="py-2 px-2">
                <BatchCell
                  v-model:value="batchFieldState.ch_venc"
                  type="select"
                  :options="encodingOptions"
                  :disabled="isBatchBypassOn"
                />
              </td>
              <td class="py-2 px-2">
                <BatchCell
                  v-model:value="batchFieldState.ch_vfps"
                  type="select"
                  :options="frameOptions"
                  :disabled="isBatchBypassOn"
                />
              </td>
            </tr>
            <tr class="border-b border-slate-100">
              <td class="py-2 pr-4 font-medium text-slate-700">저장 영상</td>
              <td class="py-2 px-2">
                <BatchCell v-model:value="batchFieldState.ch_wmv_yn" type="use" :disabled="isBatchBypassOn" />
              </td>
              <td class="py-2 px-2">
                <BatchCell
                  v-model:value="batchFieldState.ch_wmv_vsize"
                  type="select"
                  :options="videoSizeOptions"
                  :disabled="isBatchBypassOn"
                />
              </td>
              <td class="py-2 px-2">
                <BatchCell
                  v-model:value="batchFieldState.ch_wmv_vkpbs"
                  type="select"
                  :options="bitRateOptions"
                  :disabled="isBatchBypassOn"
                />
              </td>
              <td class="py-2 px-2">
                <BatchCell
                  v-model:value="batchFieldState.ch_wmv_venc"
                  type="select"
                  :options="wmvFormatOptions"
                  :disabled="isBatchBypassOn"
                />
              </td>
              <td class="py-2 px-2">
                <BatchCell
                  v-model:value="batchFieldState.ch_wmv_vfps"
                  type="select"
                  :options="frameOptions"
                  :disabled="isBatchBypassOn"
                />
              </td>
            </tr>
            <tr class="border-b border-slate-100">
              <td class="py-2 pr-4 font-medium text-slate-700">정지 영상</td>
              <td class="py-2 px-2">
                <label class="flex items-center gap-1.5 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    class="rounded border-slate-300"
                    :checked="batchFieldState.ch_jpg_keep_count !== '0' && batchFieldState.ch_jpg_keep_count !== ''"
                    @change="onBatchJpgUseChange($event)"
                  />
                </label>
              </td>
              <td class="py-2 px-2">
                <BatchCell
                  v-model:value="batchFieldState.ch_jpg_size"
                  type="select"
                  :options="videoSizeOptions"
                />
              </td>
              <td class="py-2 px-2">
                <BatchCell
                  v-model:value="batchFieldState.ch_jpg_kbps"
                  type="select"
                  :options="bitRateOptions"
                />
              </td>
            </tr>
            <tr class="border-b border-slate-100">
              <td class="py-2 pr-4 pl-6 text-slate-400 text-xs"></td>
              <td class="py-2 px-2">
                <label class="flex items-center gap-1.5 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    class="rounded border-slate-300"
                    :checked="batchFieldState.ch_jpg_show_date === 'y'"
                    @change="batchFieldState.ch_jpg_show_date = ($event.target as HTMLInputElement).checked ? 'y' : 'n'"
                  />
                  <span>날짜 표시</span>
                </label>
              </td>
              <td class="py-2 px-2">
                <span class="flex items-center gap-1 text-sm text-slate-700">
                  최대
                  <input
                    v-model="batchJpgKeepCountRef"
                    type="text"
                    inputmode="numeric"
                    maxlength="2"
                    class="border border-slate-300 rounded px-2 py-1 text-sm w-16 max-w-[80px]"
                    :disabled="batchFieldState.ch_jpg_keep_count === '0'"
                    @input="syncBatchJpgFromRef"
                    @blur="clampBatchJpgKeepCount"
                  />
                  장
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="px-4 py-3 border-t border-slate-200 flex justify-end gap-2">
        <Button variant="secondary" @click="handleBatchModalClose">취소</Button>
        <Button variant="primary" :disabled="isSubmitting" @click="handleBatchModalSubmit">적용</Button>
      </div>
    </div>
  </div>

  <!-- 채널정보 신규/수정 모달 (동일 레이아웃, 수정 시 채널ID·CCTV 읽기전용) -->
  <div
    v-if="isNewModalOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    @click.self="handleNewModalClose"
  >
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
      <div class="px-4 py-3 border-b border-slate-200">
        <h3 class="text-lg font-semibold text-slate-800">{{ isChannelModalEditMode ? '채널정보 수정' : '채널정보 신규' }}</h3>
        <p class="text-xs text-slate-500 mt-0.5">{{ isChannelModalEditMode ? '채널 ID, CCTV 관리 번호는 읽기 전용입니다.' : '필수 항목을 입력하고, 실시간/저장/정지 영상 설정을 선택하세요.' }}</p>
      </div>
      <div class="flex-1 overflow-y-auto p-4">
        <!-- 필수 입력: 채널 ID, CCTV, 영상변환 서버, 미디어 서버 (수정 시 채널ID·CCTV 읽기전용) -->
        <div class="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-slate-200">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">채널 ID <span class="text-red-500">*</span></label>
            <input
              v-if="!isChannelModalEditMode"
              v-model="newFormState.ch_id"
              type="text"
              placeholder="CH0000XXXX"
              maxlength="10"
              class="border border-slate-300 rounded px-2 py-1.5 text-sm w-full"
            />
            <input
              v-else
              type="text"
              :value="newFormState.ch_id"
              readonly
              class="border border-slate-200 rounded px-2 py-1.5 text-sm w-full bg-slate-50 text-slate-600"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">CCTV 관리 번호 <span class="text-red-500">*</span></label>
            <select
              v-if="!isChannelModalEditMode"
              v-model="newFormState.cctv_id"
              class="border border-slate-300 rounded px-2 py-1.5 text-sm w-full"
            >
              <option value="">카메라 선택</option>
              <option v-for="opt in cameraOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
            <input
              v-else
              type="text"
              :value="cctvIdDisplayName"
              readonly
              class="border border-slate-200 rounded px-2 py-1.5 text-sm w-full bg-slate-50 text-slate-600"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">영상 변환 서버 <span class="text-red-500">*</span></label>
            <select
              v-model="newFormState.trans_id"
              class="border border-slate-300 rounded px-2 py-1.5 text-sm w-full"
            >
              <option value="">영상 변환 서버 선택</option>
              <option v-for="opt in conversionServerOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">미디어 서버 <span class="text-red-500">*</span></label>
            <select
              v-model="newFormState.fms_id"
              class="border border-slate-300 rounded px-2 py-1.5 text-sm w-full"
            >
              <option value="">미디어 서버 선택</option>
              <option v-for="opt in mediaServerOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
        </div>
        <table class="w-full border-collapse text-sm">
          <thead>
            <tr class="border-b border-slate-200">
              <th class="text-left py-2 pr-4 font-medium text-slate-600 w-28"></th>
              <th class="text-left py-2 px-2 font-medium text-slate-600">사용</th>
              <th class="text-left py-2 px-2 font-medium text-slate-600">크기</th>
              <th class="text-left py-2 px-2 font-medium text-slate-600">Bit rate</th>
              <th class="text-left py-2 px-2 font-medium text-slate-600">코덱</th>
              <th class="text-left py-2 px-2 font-medium text-slate-600">Frame</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-slate-100">
              <td class="py-2 pr-4 font-medium text-slate-700">Bypass</td>
              <td class="py-2 px-2">
                <BatchCell v-model:value="newFormState.ch_bypass" type="use" />
              </td>
            </tr>
            <tr class="border-b border-slate-100">
              <td class="py-2 pr-4 font-medium text-slate-700">실시간 영상</td>
              <td class="py-2 px-2">
                <BatchCell v-model:value="newFormState.ch_alive" type="use" :disabled="isNewBypassOn" />
              </td>
              <td class="py-2 px-2">
                <BatchCell
                  v-model:value="newFormState.ch_vsize"
                  type="select"
                  :options="videoSizeOptions"
                  :disabled="isNewBypassOn || !isNewRealtimeOn"
                />
              </td>
              <td class="py-2 px-2">
                <BatchCell
                  v-model:value="newFormState.ch_vkpbs"
                  type="select"
                  :options="bitRateOptions"
                  :disabled="isNewBypassOn || !isNewRealtimeOn"
                />
              </td>
              <td class="py-2 px-2">
                <BatchCell
                  v-model:value="newFormState.ch_venc"
                  type="select"
                  :options="encodingOptions"
                  :disabled="isNewBypassOn || !isNewRealtimeOn"
                />
              </td>
              <td class="py-2 px-2">
                <BatchCell
                  v-model:value="newFormState.ch_vfps"
                  type="select"
                  :options="frameOptions"
                  :disabled="isNewBypassOn || !isNewRealtimeOn"
                />
              </td>
            </tr>
            <tr class="border-b border-slate-100">
              <td class="py-2 pr-4 font-medium text-slate-700">저장 영상</td>
              <td class="py-2 px-2">
                <BatchCell v-model:value="newFormState.ch_wmv_yn" type="use" :disabled="isNewBypassOn" />
              </td>
              <td class="py-2 px-2">
                <BatchCell
                  v-model:value="newFormState.ch_wmv_vsize"
                  type="select"
                  :options="videoSizeOptions"
                  :disabled="isNewBypassOn || !isNewStorageOn"
                />
              </td>
              <td class="py-2 px-2">
                <BatchCell
                  v-model:value="newFormState.ch_wmv_vkpbs"
                  type="select"
                  :options="bitRateOptions"
                  :disabled="isNewBypassOn || !isNewStorageOn"
                />
              </td>
              <td class="py-2 px-2">
                <BatchCell
                  v-model:value="newFormState.ch_wmv_venc"
                  type="select"
                  :options="wmvFormatOptions"
                  :disabled="isNewBypassOn || !isNewStorageOn"
                />
              </td>
              <td class="py-2 px-2">
                <BatchCell
                  v-model:value="newFormState.ch_wmv_vfps"
                  type="select"
                  :options="frameOptions"
                  :disabled="isNewBypassOn || !isNewStorageOn"
                />
              </td>
            </tr>
            <tr class="border-b border-slate-100">
              <td class="py-2 pr-4 font-medium text-slate-700">정지 영상</td>
              <td class="py-2 px-2">
                <label class="flex items-center gap-1.5 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    class="rounded border-slate-300"
                    :checked="newFormState.ch_jpg_keep_count !== '0' && newFormState.ch_jpg_keep_count !== ''"
                    @change="onNewJpgUseChange($event)"
                  />
                </label>
              </td>
              <td class="py-2 px-2">
                <BatchCell
                  v-model:value="newFormState.ch_jpg_size"
                  type="select"
                  :options="videoSizeOptions"
                  :disabled="!isNewJpgOn"
                />
              </td>
              <td class="py-2 px-2">
                <BatchCell
                  v-model:value="newFormState.ch_jpg_kbps"
                  type="select"
                  :options="bitRateOptions"
                  :disabled="!isNewJpgOn"
                />
              </td>
            </tr>
            <tr class="border-b border-slate-100">
              <td class="py-2 pr-4 pl-6 text-slate-400 text-xs"></td>
              <td class="py-2 px-2 text-slate-400"></td>
              <td class="py-2 px-2">
                <label class="flex items-center gap-1.5 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    class="rounded border-slate-300"
                    :checked="newFormState.ch_jpg_show_date === 'y'"
                    @change="newFormState.ch_jpg_show_date = ($event.target as HTMLInputElement).checked ? 'y' : 'n'"
                  />
                  <span>날짜 표시</span>
                </label>
              </td>
              <td class="py-2 px-2">
                <span class="flex items-center gap-1 text-sm text-slate-700">
                  최대
                  <input
                    v-model="newJpgKeepCountRef"
                    type="text"
                    inputmode="numeric"
                    maxlength="2"
                    class="border border-slate-300 rounded px-2 py-1 text-sm w-16 max-w-[80px]"
                    :disabled="newFormState.ch_jpg_keep_count === '0'"
                    @input="syncNewJpgFromRef"
                    @blur="clampNewJpgKeepCount"
                  />
                  장
                </span>
              </td>
              <td class="py-2 px-2 text-slate-400"></td>
              <td class="py-2 px-2 text-slate-400"></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="px-4 py-3 border-t border-slate-200 flex justify-end gap-2">
        <Button variant="secondary" @click="handleNewModalClose">취소</Button>
        <Button variant="primary" :disabled="isSubmitting" @click="handleChannelModalSubmit">{{ isChannelModalEditMode ? '저장' : '등록' }}</Button>
      </div>
    </div>
  </div>

  <TransferHistoryModal
    v-model="isTransferHistoryModalOpen"
    :channel-id="transferHistoryChannel.ch_id"
    :channel-reg-date="transferHistoryChannel.reg_date"
  />
  <ConnectionHistoryModal
    v-model="isConnectionHistoryModalOpen"
    :channel-id="connectionHistoryChannel.ch_id"
    :channel-reg-date="connectionHistoryChannel.reg_date"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, nextTick, defineComponent, h, ref, reactive, watch } from 'vue'
import Table, { type TableColumn } from '../../common/Table.vue'
import TransferHistoryModal from './TransferHistoryModal.vue'
import ConnectionHistoryModal from './ConnectionHistoryModal.vue'
import { type FormField } from '../../common/DataFormModal.vue'
import Button from '../../common/Button.vue'
import { useVideoConversionInfoStore, type VideoConversion } from '../../../stores/videoConversionInfo'
import { useCommonCodeStore } from '../../../stores/commonCode'
import { useAlertStore } from '../../../stores/alert'
import { useCameraInfoStore } from '../../../stores/cameraInfo'
import { useVideoConversionServerInfoStore } from '../../../stores/videoConversionServerInfo'
import { useMediaServerInfoStore } from '../../../stores/mediaServerInfo'
import { api } from '../../../services/api'

// Pinia 스토어 사용
const videoConversionStore = useVideoConversionInfoStore()
const commonCodeStore = useCommonCodeStore()
const alertStore = useAlertStore()
const cameraStore = useCameraInfoStore()
const conversionServerStore = useVideoConversionServerInfoStore()
const mediaServerStore = useMediaServerInfoStore()
const isSubmitting = ref(false) // 중복 요청 방지

// Table 컴포넌트 참조
const tableRef = ref<InstanceType<typeof Table> | null>(null)

// 전송 이력 모달 상태 (채널 1개 선택 시에만 열기)
const isTransferHistoryModalOpen = ref(false)
const transferHistoryChannel = ref<{ ch_id: string; reg_date: string }>({ ch_id: '', reg_date: '' })

// 접속 이력 모달 상태 (채널 1개 선택 시에만 열기)
const isConnectionHistoryModalOpen = ref(false)
const connectionHistoryChannel = ref<{ ch_id: string; reg_date: string }>({ ch_id: '', reg_date: '' })

// 일괄 변경 모달 상태 (선택한 항목만 적용)
const isBatchModalOpen = ref(false)
const batchSelectedCount = computed(() => tableRef.value?.selectedRowIds?.size ?? 0)
const BATCH_FIELD_IDS = [
  'ch_bypass',
  'ch_alive', 'ch_vsize', 'ch_vkpbs', 'ch_venc', 'ch_vfps',
  'ch_wmv_yn', 'ch_wmv_vsize', 'ch_wmv_vkpbs', 'ch_wmv_venc', 'ch_wmv_vfps',
  'ch_jpg_keep_count', 'ch_jpg_show_date', 'ch_jpg_size', 'ch_jpg_kbps'
] as const
function createBatchFieldState(): Record<string, string> {
  const state: Record<string, string> = {}
  BATCH_FIELD_IDS.forEach((id) => {
    state[id] = id === 'ch_jpg_keep_count' ? '0' : ''
  })
  return state
}
const batchFieldState = reactive(createBatchFieldState())

// 채널정보 신규/수정 모달 상태 (동일 레이아웃, 수정 시 채널ID·CCTV 읽기전용)
const isNewModalOpen = ref(false)
const isChannelModalEditMode = ref(false)
function createNewFormState(): Record<string, string> {
  const state: Record<string, string> = {
    ch_id: '',
    cctv_id: '',
    trans_id: '',
    fms_id: ''
  }
  BATCH_FIELD_IDS.forEach((id) => {
    state[id] = id === 'ch_jpg_keep_count' ? '0' : ''
  })
  return state
}
const newFormState = reactive(createNewFormState())

// 최대 N장 입력용 ref (v-model이 확실히 동작하도록 reactive 대신 사용)
const batchJpgKeepCountRef = ref('')
const newJpgKeepCountRef = ref('')

function syncBatchJpgFromRef() {
  const digits = String(batchJpgKeepCountRef.value ?? '').replace(/\D/g, '').slice(0, 2)
  batchJpgKeepCountRef.value = digits
  batchFieldState.ch_jpg_keep_count = digits
}
function syncNewJpgFromRef() {
  const digits = String(newJpgKeepCountRef.value ?? '').replace(/\D/g, '').slice(0, 2)
  newJpgKeepCountRef.value = digits
  newFormState.ch_jpg_keep_count = digits
}

function onBatchJpgUseChange(e: Event) {
  const checked = (e.target as HTMLInputElement).checked
  batchFieldState.ch_jpg_keep_count = checked ? '1' : '0'
  batchJpgKeepCountRef.value = checked ? '1' : ''
}
function onNewJpgUseChange(e: Event) {
  const checked = (e.target as HTMLInputElement).checked
  newFormState.ch_jpg_keep_count = checked ? '1' : '0'
  newJpgKeepCountRef.value = checked ? '1' : ''
}

// Bit rate / Frame 고정 옵션 (공통코드 없음)
const bitRateOptions = computed(() => [
  { value: '', label: '선택' },
  { value: '256', label: '256' },
  { value: '512', label: '512' },
  { value: '1024', label: '1024' },
  { value: '2048', label: '2048' },
  { value: '4096', label: '4096' },
  { value: '8192', label: '8192' }
])
const frameOptions = computed(() => [
  { value: '', label: '선택' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '5', label: '5' },
  { value: '10', label: '10' },
  { value: '15', label: '15' },
  { value: '20', label: '20' },
  { value: '25', label: '25' },
  { value: '30', label: '30' }
])

// 일괄 변경 모달용 셀 컴포넌트 (값 선택만, 테이블 셀용)
const BATCH_CELL_NUMBER_MAX = 99
const BatchCell = defineComponent({
  name: 'BatchCell',
  props: {
    value: { type: String, default: '' },
    type: { type: String as () => 'use' | 'select' | 'jpgUse' | 'number', required: true },
    options: { type: Array as () => { value: string; label: string }[], default: () => [] },
    max: { type: Number, default: BATCH_CELL_NUMBER_MAX },
    disabled: { type: Boolean, default: false }
  },
  emits: ['update:value'],
  setup(props, { emit }) {
    return () =>
      h('div', { class: ['flex items-center gap-2', props.disabled ? 'opacity-70 pointer-events-none' : ''] }, [
        props.type === 'use'
          ? h('input', {
              type: 'checkbox',
              class: 'rounded border-slate-300',
              checked: props.value === 'y',
              disabled: props.disabled,
              onChange: (e: Event) => {
                if (props.disabled) return
                emit('update:value', (e.target as HTMLInputElement).checked ? 'y' : 'n')
              }
            })
          : props.type === 'jpgUse'
            ? h('input', {
                type: 'checkbox',
                class: 'rounded border-slate-300',
                checked: props.value === '1',
                disabled: props.disabled,
                onChange: (e: Event) => {
                  if (props.disabled) return
                  emit('update:value', (e.target as HTMLInputElement).checked ? '1' : '0')
                }
              })
            : props.type === 'number'
              ? h('input', {
                  type: 'number',
                  class: 'border border-slate-300 rounded px-2 py-1 text-sm w-full min-w-0 max-w-[80px]',
                  min: 0,
                  max: props.max,
                  placeholder: 'N',
                  title: '최대 N장',
                  value: props.value,
                  disabled: props.disabled,
                  onInput: (e: Event) => {
                    if (props.disabled) return
                    const v = (e.target as HTMLInputElement).value
                    const num = v === '' ? '' : String(Math.min(Math.max(0, parseInt(v, 10) || 0), props.max))
                    emit('update:value', num)
                  }
                })
              : h('select', {
                  class: 'border border-slate-300 rounded px-2 py-1 text-sm w-full min-w-0 max-w-[140px]',
                  value: props.value,
                  disabled: props.disabled,
                  onChange: (e: Event) => {
                    if (props.disabled) return
                    emit('update:value', (e.target as HTMLSelectElement).value)
                  }
                }, [
                  h('option', { value: '' }, '선택'),
                  ...(props.options || []).map((opt) =>
                    h('option', { value: opt.value }, opt.label)
                  )
                ])
      ])
  }
})

// 일괄 변경 버튼 비활성화 상태
const isBatchButtonDisabled = computed(() => {
  return !tableRef.value?.selectedRowIds || tableRef.value.selectedRowIds.size === 0
})
const isEditButtonDisabled = computed(() => {
  return !tableRef.value?.selectedRowIds || tableRef.value.selectedRowIds.size !== 1
})
// 수정 모달에서 CCTV 읽기전용 표시용 (cctv_id → 라벨)
const cctvIdDisplayName = computed(() => {
  const id = newFormState.cctv_id
  if (!id) return ''
  const opt = cameraOptions.value.find((o) => o.value === id)
  return opt ? opt.label : id
})

// Bypass 사용 시 실시간/저장 영상 행 읽기전용용
const isNewBypassOn = computed(() => newFormState.ch_bypass === 'y')
const isBatchBypassOn = computed(() => batchFieldState.ch_bypass === 'y')
// 신규 모달: 실시간/저장/정지 영상 사용 체크 시에만 해당 영상의 크기·Bit rate·코덱·Frame 활성화
const isNewRealtimeOn = computed(() => newFormState.ch_alive === 'y')
const isNewStorageOn = computed(() => newFormState.ch_wmv_yn === 'y')
const isNewJpgOn = computed(() => {
  const v = newFormState.ch_jpg_keep_count ?? ''
  return v !== '0' && v !== ''
})

// Bypass 체크 시 실시간 영상·저장 영상 사용 해제
watch(() => newFormState.ch_bypass, (val) => {
  if (val === 'y') {
    newFormState.ch_alive = 'n'
    newFormState.ch_wmv_yn = 'n'
  }
})
watch(() => batchFieldState.ch_bypass, (val) => {
  if (val === 'y') {
    batchFieldState.ch_alive = 'n'
    batchFieldState.ch_wmv_yn = 'n'
  }
})

// 신규 모달에서 CCTV 선택 시 해당 카메라의 기존 채널이 있으면 영상 변환 서버·미디어 서버 자동 설정
watch(() => newFormState.cctv_id, (cctvId) => {
  if (isChannelModalEditMode.value || !cctvId) return
  const channel = videoConversionStore.getByCctvId(cctvId)
  if (channel) {
    newFormState.trans_id = channel.trans_id || ''
    newFormState.fms_id = channel.fms_id || ''
  }
})

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
    const valueStr = String(props.value || '').toLowerCase()
    const isAlive = valueStr === 'y' || valueStr === 'true' || props.value === true

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

// 공통 코드 매핑용 범용 셀
const CodeMappedCell = (grpGbn: string, grpCode: string) => defineComponent({
  props: {
    value: {
      type: [String, Number],
      default: ''
    }
  },
  setup(props) {
    const mappedName = computed(() => {
      if (!props.value) return ''
      return commonCodeStore.getCodeName(grpGbn, grpCode, String(props.value))
    })
    return () => h('span', { class: 'text-sm text-slate-700' }, mappedName.value)
  }
})

const ResolutionCell = CodeMappedCell('C', '4')
const VideoFormatCell = CodeMappedCell('C', '5')
const StorageFormatCell = CodeMappedCell('C', '7')
const OutputResolutionCell = CodeMappedCell('C', '8')

const YesNoCell = defineComponent({
  props: {
    value: {
      type: [String, Number, Boolean],
      default: ''
    }
  },
  setup(props) {
    const isYes = props.value === 'Y' || props.value === true || props.value === 'true'
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
      type: [String, Number],
      default: ''
    }
  },
  setup(props) {
    return () => h('span', { class: 'text-sm text-slate-700' }, toDateOnly(props.value))
  }
})

// 기본 컬럼 너비 설정
const checkboxColumnWidth = 50
const idColumnWidth = 120

// 컬럼 정의 (백엔드 스키마에 맞춤 - 실제 필드명은 API 응답 확인 후 수정 필요)
const columns: TableColumn[] = [
  { id: 'hq_code', header: '소속 본부', size: 120, cellComponent: TextCell }, // UI 매핑 필드
  { id: 'branch_code', header: '소속 지사', size: 120, cellComponent: TextCell }, // UI 매핑 필드
  { id: 'route_code', header: '노선', size: 120, cellComponent: TextCell }, // UI 매핑 필드
  { id: 'cctv_id', header: 'CCTV ID', size: 140, cellComponent: TextCell },
  { id: 'trans_id', header: '영상변환 서버 ID', size: 140, cellComponent: TextCell },
  { id: 'trans_name', header: '영상 변환 서버', size: 140, cellComponent: TextCell },
  { id: 'fms_id', header: '미디어 서버 ID', size: 140, cellComponent: TextCell },
  { id: 'fms_name', header: '미디어 서버', size: 140, cellComponent: TextCell },
  { id: 'ch_venc', header: '인코딩 방식', size: 100, cellComponent: VideoFormatCell },
  { id: 'ch_vsize', header: '영상 크기', size: 100, cellComponent: ResolutionCell },
  { id: 'ch_vfps', header: 'FPS', size: 80, cellComponent: TextCell },
  { id: 'ch_vkpbs', header: 'BPS', size: 100, cellComponent: TextCell },
  { id: 'ch_alive', header: '동작여부', size: 80, cellComponent: StatusCell },
  { id: 'ch_alive_time', header: '최종 확인 시간', size: 160, cellComponent: DateOnlyCell },
  { id: 'ch_alive_yn', header: '동작 확인 여부', size: 100, cellComponent: YesNoCell },
  { id: 'job_status', header: '동작 상태', size: 100, cellComponent: TextCell },
  { id: 'json_job', header: 'JSON 작업', size: 100, cellComponent: YesNoCell },
  { id: 'json_yn', header: 'JSON 사용', size: 100, cellComponent: YesNoCell },
  { id: 'kt_cctv', header: 'KT 개시지점', size: 140, cellComponent: TextCell },
  { id: 'ch_wmv_yn', header: 'WMV 저장', size: 100, cellComponent: YesNoCell },
  { id: 'ch_wmv_venc', header: 'WMV 형식', size: 100, cellComponent: StorageFormatCell },
  { id: 'ch_wmv_vsize', header: 'WMV 크기', size: 100, cellComponent: OutputResolutionCell },
  { id: 'sms_session', header: 'SMS 세션', size: 140, cellComponent: TextCell },
  { id: 'sms_host_ip', header: 'SMS 호스트 IP', size: 140, cellComponent: TextCell },
  { id: 'ch_jpg_size', header: 'JPG 크기', size: 100, cellComponent: OutputResolutionCell },
  { id: 'ch_jpg_kbps', header: 'JPG BPS', size: 100, cellComponent: TextCell },
  { id: 'reg_date', header: '등록 일자', size: 160, cellComponent: DateOnlyCell }
]

// 기본 표시 컬럼
const defaultVisibleColumns = [
  'hq_code', 'route_code', 'cctv_id', 'trans_id', 'trans_name', 'fms_id', 'fms_name', 'ch_alive', 'ch_alive_time', 'reg_date'
]

// 스토어의 데이터를 직접 참조 (computed 사용)
// trans_name, fms_name은 영상변환서버/미디어서버 스토어에서 ID로 조회해 매핑
const rawData = computed(() => {
  const items = videoConversionStore.items
  return items.map((row) => {
    const trans = conversionServerStore.getById(row.trans_id)
    const fms = mediaServerStore.getById(row.fms_id)
    return {
      ...row,
      trans_name: trans?.trans_name ?? '',
      fms_name: fms?.fms_name ?? ''
    }
  })
})

// 셀렉트 옵션: 카메라 목록, 영상변환서버 목록, 미디어 서버 목록
const cameraOptions = computed(() =>
  cameraStore.items.map((c) => ({
    value: c.cctv_id,
    label: c.camera_no ? `${c.cctv_id} (${c.camera_no})` : c.cctv_id
  }))
)
const conversionServerOptions = computed(() =>
  conversionServerStore.items.map((s) => ({
    value: s.trans_id,
    label: s.trans_name ? `${s.trans_id} (${s.trans_name})` : s.trans_id
  }))
)
const mediaServerOptions = computed(() =>
  mediaServerStore.items.map((s) => ({
    value: s.fms_id,
    label: s.fms_name ? `${s.fms_id} (${s.fms_name})` : s.fms_id
  }))
)

// 영상 인코딩 방식 옵션: 공통코드(MGMT_CODE) grp_gbn='C', grp_code='5'
const encodingOptions = computed(() =>
  commonCodeStore.getByGrpGbn('C')
    .filter((item: { grp_code: string }) => String(item.grp_code) === '5')
    .map((item: { code: string; code_name: string }) => ({
      value: item.code || '',
      label: (item.code_name || '').trim() || item.code || ''
    }))
)

// 영상 크기 옵션: 공통코드(MGMT_CODE) grp_gbn='C', grp_code='4' (WMV 영상 크기, JPG 크기 동일 사용)
const videoSizeOptions = computed(() =>
  commonCodeStore.getByGrpGbn('C')
    .filter((item: { grp_code: string }) => String(item.grp_code) === '4')
    .map((item: { code: string; code_name: string }) => ({
      value: item.code || '',
      label: (item.code_name || '').trim() || item.code || ''
    }))
)

// WMV 저장 형식 옵션: 공통코드(MGMT_CODE) grp_gbn='C', grp_code='8'
const wmvFormatOptions = computed(() =>
  commonCodeStore.getByGrpGbn('C')
    .filter((item: { grp_code: string }) => String(item.grp_code) === '8')
    .map((item: { code: string; code_name: string }) => ({
      value: item.code || '',
      label: (item.code_name || '').trim() || item.code || ''
    }))
)

// 폼 필드 정의 (백엔드 스키마에 맞춤)
const formFields = computed<FormField[]>(() => [
  { id: 'ch_id', label: '채널 ID', type: 'text', required: true, placeholder: 'CH0000XXXX', maxLength: 10, readonlyInEdit: true },
  { id: 'cctv_id', label: 'CCTV 관리 번호', type: 'select', required: true, placeholder: '카메라 선택', options: cameraOptions.value },
  { id: 'trans_id', label: '영상 변환 서버', type: 'select', required: true, placeholder: '영상 변환 서버 선택', options: conversionServerOptions.value },
  { id: 'fms_id', label: '미디어 서버', type: 'select', required: true, placeholder: '미디어 서버 선택', options: mediaServerOptions.value },
  { id: 'ch_venc', label: '영상 인코딩 방식', type: 'select', required: true, placeholder: '영상 인코딩 방식 선택', options: encodingOptions.value },
  { id: 'ch_vsize', label: '영상 크기', type: 'select', placeholder: '영상 크기 선택', options: videoSizeOptions.value },
  { id: 'ch_vfps', label: '영상 FPS', type: 'text', placeholder: '2~30' },
  { id: 'ch_vkpbs', label: '영상 BPS', type: 'text', placeholder: '00000~99999' },
  { id: 'ch_alive', label: '채널 동작여부', type: 'text', placeholder: 'Y / N' },
  { id: 'ch_alive_yn', label: '동작 확인 여부', type: 'text', placeholder: 'Y / N' },
  { id: 'reg_date', label: '등록 일자', type: 'text', required: true, placeholder: 'YYYY/MM/DD HH:mm:SS' },
  { id: 'json_job', label: 'JSON 작업', type: 'text', required: true, placeholder: 'Y / N' },
  { id: 'json_yn', label: 'JSON 사용 여부', type: 'text', required: true, placeholder: 'Y / N' },
  { id: 'json_date', label: 'JSON 사용 시간', type: 'text', required: true, placeholder: 'YYYY/MM/DD HH:mm:SS' },
  { id: 'kt_cctv', label: 'KT 개시지점 이름', type: 'text' },
  { id: 'ch_wmv_yn', label: 'WMV 저장 여부', type: 'text', placeholder: 'Y / N' },
  { id: 'ch_wmv_venc', label: 'WMV 저장 형식', type: 'select', required: true, placeholder: 'WMV 저장 형식 선택', options: wmvFormatOptions.value },
  { id: 'ch_wmv_vsize', label: 'WMV 영상 크기', type: 'select', required: true, placeholder: 'WMV 영상 크기 선택', options: videoSizeOptions.value },
  { id: 'ch_wmv_vfps', label: 'WMV FPS', type: 'text', placeholder: '2~30' },
  { id: 'ch_wmv_vkpbs', label: 'WMV 영상 BPS', type: 'text', placeholder: '00000~99999' },
  { id: 'sms_session', label: 'SMS 세션 이름', type: 'text' },
  { id: 'sms_host_ip', label: 'SMS 호스트 IP', type: 'text', placeholder: 'A.B.C.D 형식' },
  { id: 'sms_date', label: 'SMS 전송 날짜', type: 'text', placeholder: 'YYYY/MM/DD HH:mm:SS' },
  { id: 'job_status', label: '동작 상태', type: 'text' },
  { id: 'ch_jpg_size', label: 'JPG 크기', type: 'select', required: true, placeholder: 'JPG 크기 선택', options: videoSizeOptions.value },
  { id: 'ch_jpg_kbps', label: 'JPG BPS', type: 'text', placeholder: '00000~99999' },
  { id: 'ch_jpg_keep_count', label: 'JPG 파일 유지 개수', type: 'text', placeholder: '0~20' }
])

// 데이터 업데이트 처리 (생성/수정)
const handleDataUpdate = async (data: Record<string, any>, isNew: boolean) => {
  if (isSubmitting.value || videoConversionStore.isLoading) return
  try {
    isSubmitting.value = true
    if (isNew) {
      const now = new Date()
      const nowStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
      const ch_id = String(data.ch_id ?? '').trim().slice(0, 10)
      const payload = { ...data, ch_id, reg_date: nowStr }
      await videoConversionStore.createVideoConversion(payload as VideoConversion)
    } else {
      await videoConversionStore.updateVideoConversion(data.ch_id, data)
    }
    await videoConversionStore.fetchVideoConversions(true)
    alertStore.show(isNew ? '신규 생성 완료' : '수정 완료', 'success')
    tableRef.value?.closeModal?.()
  } catch (error: any) {
    const errorMessage = videoConversionStore.error || error.response?.data?.detail || '데이터 저장 중 오류가 발생했습니다.'
    alertStore.show(errorMessage, 'error')
  } finally {
    isSubmitting.value = false
  }
}

// 데이터 삭제 처리
const handleDataDelete = async (ids: string[]) => {
  if (isSubmitting.value || videoConversionStore.isLoading) return
  try {
    isSubmitting.value = true
    await videoConversionStore.deleteVideoConversions(ids)
    await videoConversionStore.fetchVideoConversions(true)
    alertStore.show('삭제 완료', 'success')
  } catch (error: any) {
    const errorMessage = videoConversionStore.error || error.response?.data?.detail || '데이터 삭제 중 오류가 발생했습니다.'
    alertStore.show(errorMessage, 'error')
  } finally {
    isSubmitting.value = false
  }
}

// 채널정보 신규 모달 핸들러
function clampBatchJpgKeepCount() {
  const v = batchJpgKeepCountRef.value || batchFieldState.ch_jpg_keep_count
  if (v === '' || v === undefined) {
    batchFieldState.ch_jpg_keep_count = '1'
    batchJpgKeepCountRef.value = '1'
    return
  }
  const n = parseInt(String(v), 10)
  let clamped: string
  if (isNaN(n) || n < 0) clamped = '0'
  else if (n > 99) clamped = '99'
  else clamped = String(n)
  batchFieldState.ch_jpg_keep_count = clamped
  batchJpgKeepCountRef.value = clamped
}
function clampNewJpgKeepCount() {
  const v = newJpgKeepCountRef.value || newFormState.ch_jpg_keep_count
  if (v === '' || v === undefined) {
    newFormState.ch_jpg_keep_count = '1'
    newJpgKeepCountRef.value = '1'
    return
  }
  const n = parseInt(String(v), 10)
  let clamped: string
  if (isNaN(n) || n < 0) clamped = '0'
  else if (n > 99) clamped = '99'
  else clamped = String(n)
  newFormState.ch_jpg_keep_count = clamped
  newJpgKeepCountRef.value = clamped
}

const handleNewOpen = () => {
  isChannelModalEditMode.value = false
  Object.assign(newFormState, createNewFormState())
  newJpgKeepCountRef.value = ''
  isNewModalOpen.value = true
}
const handleEditOpen = () => {
  const ids = tableRef.value?.selectedRowIds ? Array.from(tableRef.value.selectedRowIds) : []
  if (ids.length !== 1) return
  const row = rawData.value.find((r: any) => r.ch_id === ids[0]) as Record<string, unknown> | undefined
  if (!row) return
  isChannelModalEditMode.value = true
  newFormState.ch_id = String(row.ch_id ?? '')
  newFormState.cctv_id = String(row.cctv_id ?? '')
  newFormState.trans_id = String(row.trans_id ?? '')
  newFormState.fms_id = String(row.fms_id ?? '')
  const toYn = (v: unknown) => (v === 'Y' || v === 'y' || v === true || v === 'true' ? 'y' : 'n')
  BATCH_FIELD_IDS.forEach((id) => {
    const val = row[id]
    if (id === 'ch_bypass' || id === 'ch_alive' || id === 'ch_wmv_yn' || id === 'ch_jpg_show_date') {
      newFormState[id] = toYn(val)
    } else if (id === 'ch_jpg_keep_count') {
      const n = val !== undefined && val !== null && val !== '' ? Number(val) || 0 : 0
      newFormState[id] = String(n)
    } else if (val !== undefined && val !== null) {
      newFormState[id] = String(val)
    } else {
      newFormState[id] = ''
    }
  })
  const jpgCount = String(newFormState.ch_jpg_keep_count ?? '')
  newJpgKeepCountRef.value = jpgCount === '0' ? '' : jpgCount
  isNewModalOpen.value = true
}
const handleNewModalClose = () => {
  isNewModalOpen.value = false
  isChannelModalEditMode.value = false
}
const handleChannelModalSubmit = async () => {
  if (isChannelModalEditMode.value) {
    if (!newFormState.ch_id) {
      alertStore.show('채널 ID가 없습니다.', 'warning')
      return
    }
    if (!newFormState.trans_id || !newFormState.fms_id) {
      alertStore.show('영상 변환 서버, 미디어 서버를 선택하세요.', 'warning')
      return
    }
    if (isSubmitting.value || videoConversionStore.isLoading) return
    const payload: Record<string, any> = {
      ch_id: newFormState.ch_id,
      cctv_id: newFormState.cctv_id,
      trans_id: newFormState.trans_id,
      fms_id: newFormState.fms_id
    }
    BATCH_FIELD_IDS.forEach((id) => {
      const val = newFormState[id]
      if (val !== undefined && val !== '') {
        payload[id] = id === 'ch_jpg_keep_count' ? Number(val) || 0 : val
      }
    })
    try {
      isSubmitting.value = true
      await videoConversionStore.updateVideoConversion(newFormState.ch_id, payload as Partial<VideoConversion>)
      await videoConversionStore.fetchVideoConversions(true)
      handleNewModalClose()
      alertStore.show('수정 완료', 'success')
    } catch (error: any) {
      const errorMessage = videoConversionStore.error || error.response?.data?.detail || '데이터 수정 중 오류가 발생했습니다.'
      alertStore.show(errorMessage, 'error')
    } finally {
      isSubmitting.value = false
    }
  } else {
    await handleNewModalSubmit()
  }
}
const handleNewModalSubmit = async () => {
  const ch_id = String(newFormState.ch_id ?? '').trim().toLowerCase().slice(0, 10)
  if (!ch_id) {
    alertStore.show('채널 ID를 입력하세요.', 'warning')
    return
  }
  if (!newFormState.cctv_id || !newFormState.trans_id || !newFormState.fms_id) {
    alertStore.show('CCTV, 영상 변환 서버, 미디어 서버를 모두 선택하세요.', 'warning')
    return
  }
  if (isSubmitting.value || videoConversionStore.isLoading) return

  const now = new Date()
  const nowStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`

  const payload: Record<string, any> = {
    ch_id,
    cctv_id: newFormState.cctv_id,
    trans_id: newFormState.trans_id,
    fms_id: newFormState.fms_id,
    reg_date: nowStr
  }
  BATCH_FIELD_IDS.forEach((id) => {
    const val = newFormState[id]
    if (val !== undefined && val !== '') {
      payload[id] = id === 'ch_jpg_keep_count' ? Number(val) || 0 : val
    }
  })

  try {
    isSubmitting.value = true
    await videoConversionStore.createVideoConversion(payload as VideoConversion)
    await videoConversionStore.fetchVideoConversions(true)
    handleNewModalClose()
    alertStore.show('신규 생성 완료', 'success')
  } catch (error: any) {
    const errorMessage = videoConversionStore.error || error.response?.data?.detail || '데이터 저장 중 오류가 발생했습니다.'
    alertStore.show(errorMessage, 'error')
  } finally {
    isSubmitting.value = false
  }
}

// 일괄 변경 버튼 핸들러
const handleBatchUpdate = () => {
  if (tableRef.value && tableRef.value.selectedRowIds && tableRef.value.selectedRowIds.size > 0) {
    BATCH_FIELD_IDS.forEach((id) => {
      batchFieldState[id] = id === 'ch_jpg_keep_count' ? '0' : ''
    })
    batchJpgKeepCountRef.value = ''
    isBatchModalOpen.value = true
  } else {
    alertStore.show('선택된 항목이 없습니다.', 'warning')
  }
}

// 일괄 변경 모달 핸들러
const handleBatchModalClose = () => {
  isBatchModalOpen.value = false
}

const handleTransferHistory = () => {
  const ids = tableRef.value?.selectedRowIds ? Array.from(tableRef.value.selectedRowIds) : []
  if (ids.length !== 1) return
  const row = rawData.value.find((r: any) => r.ch_id === ids[0]) as Record<string, unknown> | undefined
  if (!row) return
  transferHistoryChannel.value = {
    ch_id: String(row.ch_id ?? ''),
    reg_date: String(row.reg_date ?? '')
  }
  isTransferHistoryModalOpen.value = true
}

const handleConnectionHistory = () => {
  const ids = tableRef.value?.selectedRowIds ? Array.from(tableRef.value.selectedRowIds) : []
  if (ids.length !== 1) {
    alertStore.show('채널을 1개 선택한 뒤 접속 이력을 조회하세요.', 'info')
    return
  }
  const row = rawData.value.find((r: any) => r.ch_id === ids[0]) as Record<string, unknown> | undefined
  if (!row) return
  connectionHistoryChannel.value = {
    ch_id: String(row.ch_id ?? ''),
    reg_date: String(row.reg_date ?? '')
  }
  isConnectionHistoryModalOpen.value = true
}

const handleStopTranscoder = async () => {
  const ids = tableRef.value?.selectedRowIds ? Array.from(tableRef.value.selectedRowIds) : []
  if (ids.length !== 1) {
    alertStore.show('채널을 1개 선택한 뒤 중지 요청을 보내세요.', 'info')
    return
  }
  const row = rawData.value.find((r: any) => r.ch_id === ids[0]) as Record<string, any> | undefined
  if (!row) {
    alertStore.show('선택한 채널 정보를 찾을 수 없습니다.', 'error')
    return
  }
  const serverId = String(row.trans_id ?? '').trim()
  if (!serverId) {
    alertStore.show('선택한 채널에 설정된 영상 변환 서버가 없습니다.', 'warning')
    return
  }
  const server = conversionServerStore.getById(serverId)
  const ip = server?.trans_ip || ''
  const port = server?.trans_port
  const alive = (server?.alive ?? '').toLowerCase()

  // 디버그 로그: 선택된 서버 정보
  // eslint-disable-next-line no-console
  console.log('[VideoConversionInfo] stopTranscoder click', {
    selectedChannelId: ids[0],
    serverId,
    ip,
    port,
    alive
  })

  const confirmMessageLines: string[] = []
  confirmMessageLines.push('선택한 영상 변환 서버에 중지(tr_stop) 요청을 전송합니다.')
  confirmMessageLines.push('')
  confirmMessageLines.push(`서버 ID: ${serverId}`)
  confirmMessageLines.push(`IP:Port: ${ip || '-'}${port ? `:${port}` : ''}`)
  if (alive === 'n') {
    confirmMessageLines.push('[주의] 현재 서버 상태가 이미 중지로 표시되어 있습니다.')
  }

  const confirmed = window.confirm(confirmMessageLines.join('\n'))
  if (!confirmed) return

  try {
    isSubmitting.value = true
    // eslint-disable-next-line no-console
    console.log('[VideoConversionInfo] calling /api/tcs/stop', { serverId })
    const res = await api.post('/api/tcs/stop', { serverId })
    // eslint-disable-next-line no-console
    console.log('[VideoConversionInfo] /api/tcs/stop response', res.data)
    alertStore.show('중지 요청이 전송되었습니다.', 'success')
    // 상태 갱신: 서버 목록과 채널 정보를 새로고침
    await Promise.all([
      conversionServerStore.fetchVideoConversionServers(true),
      videoConversionStore.fetchVideoConversions(true)
    ])
  } catch (error: any) {
    const message =
      error?.response?.data?.detail ||
      error?.message ||
      '영상 변환 서버 중지 요청 중 오류가 발생했습니다.'
    alertStore.show(message, 'error')
  } finally {
    isSubmitting.value = false
  }
}

// 선택한 값만 payload에 넣어 일괄 수정
const handleBatchModalSubmit = async () => {
  if (isSubmitting.value || videoConversionStore.isLoading) return

  const payload: Record<string, string | number> = {}
  BATCH_FIELD_IDS.forEach((id) => {
    const val = batchFieldState[id]
    if (val !== undefined && val !== '') {
      payload[id] = id === 'ch_jpg_keep_count' ? Number(val) || 0 : val
    }
  })

  if (Object.keys(payload).length === 0) {
    alertStore.show('변경할 값을 하나 이상 선택하세요.', 'warning')
    return
  }

  const selectedIds = tableRef.value?.selectedRowIds
    ? Array.from(tableRef.value.selectedRowIds)
    : []
  if (selectedIds.length === 0) {
    alertStore.show('선택된 항목이 없습니다.', 'warning')
    return
  }

  try {
    isSubmitting.value = true
    await videoConversionStore.batchUpdateVideoConversions(selectedIds, payload as Partial<VideoConversion>)
    await videoConversionStore.fetchVideoConversions(true)
    handleBatchModalClose()
    alertStore.show(`일괄 변경 완료: ${selectedIds.length}개 항목`, 'success')
  } catch (error: any) {
    const errorMessage = videoConversionStore.error || error.response?.data?.detail || '일괄 변경 중 오류가 발생했습니다.'
    alertStore.show(errorMessage, 'error')
  } finally {
    isSubmitting.value = false
  }
}

// 컴포넌트 마운트 시 데이터 로드
// fetchVideoConversions 내부에서 CommonCode 로드 및 매핑을 모두 처리
onMounted(async () => {
  try {
    // 셀렉트 옵션용 목록 로드 (공통코드: 영상 인코딩 방식 등)
    await commonCodeStore.fetchCommonCodes()
    await Promise.all([
      cameraStore.fetchCameras(),
      conversionServerStore.fetchVideoConversionServers(),
      mediaServerStore.fetchMediaServers()
    ])
    await videoConversionStore.fetchVideoConversions()
    await nextTick()
  } catch (_error) {}
})
</script>

<style scoped>
/* 스타일은 Table 컴포넌트에 포함되어 있음 */
</style>
