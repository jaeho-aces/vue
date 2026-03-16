<template>
  <div class="flex-1 flex gap-4 min-h-0">
    <!-- Left Sidebar - Server Tree -->
    <div class="w-64 bg-white rounded-xl border border-slate-200 flex flex-col shrink-0">
      <div class="p-2 border-b border-slate-200">
        <div class="flex flex-wrap gap-1">
          <button
            v-for="filter in treeFilters"
            :key="filter.id"
            @click="handleTreeFilterChange(filter.id)"
            :class="[
              'px-2 py-1 text-xs rounded border transition-colors',
              treeFilter === filter.id
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            ]"
          >
            {{ filter.label }}
          </button>
        </div>
      </div>
      <div class="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-bold text-slate-800 text-sm">
            {{ treeFilter === 'display-group' ? '표출그룹' : '카메라 목록' }}
          </h3>
          <span class="text-xs text-slate-400">
            {{ treeFilter === 'display-group' ? displayGroupStore.items.length + '개' : getTotalCount(treeFilter) + '대' }}
          </span>
        </div>
        <div class="relative">
          <input
            v-if="treeFilter !== 'display-group'"
            type="text"
            placeholder="카메라 검색..."
            :value="searchTerm"
            @input="handleSearchChange"
            class="w-full text-xs bg-white border border-slate-200 rounded-md pl-8 pr-2 py-1.5 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <Search v-if="treeFilter !== 'display-group'" :size="12" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>
      <div class="flex-1 p-2 overflow-y-auto">
        <!-- 표출그룹: 목록 + 삭제 버튼 -->
        <template v-if="treeFilter === 'display-group'">
          <div v-if="filteredDisplayGroups.length === 0" class="text-center py-4">
            <p class="text-xs text-slate-400">{{ searchTerm ? '검색 결과가 없습니다.' : '표출그룹이 없습니다.' }}</p>
          </div>
          <div
            v-else
            v-for="g in filteredDisplayGroups"
            :key="g.group_id"
            class="flex items-center gap-1 py-1.5 px-2 rounded hover:bg-slate-100 group border border-transparent hover:border-slate-200"
          >
            <button
              type="button"
              class="flex-1 min-w-0 text-left text-sm text-slate-700 truncate"
              draggable="true"
              @dragstart="handleDisplayGroupDragStart($event, g.group_id)"
              @click="handleNodeClick({ id: g.group_id, label: g.group_name || g.group_id })"
              @dblclick="playDisplayGroup(g.group_id)"
            >
              {{ g.group_name || g.group_id }}
            </button>
            <button
              type="button"
              class="shrink-0 p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
              title="삭제"
              @click.stop="openDisplayGroupDeleteConfirm(g)"
            >
              <Trash2 :size="14" />
            </button>
          </div>
        </template>
        <!-- 그 외: Virtual Tree -->
        <template v-else>
          <div v-if="filteredTreeData.length === 0 && searchTerm" class="text-center py-4">
            <p class="text-xs text-slate-400">검색 결과가 없습니다.</p>
          </div>
          <VirtualTree
            v-else
            :data="filteredTreeData"
            :item-height="32"
            :search-term="searchTerm"
            @node-click="handleNodeClick"
            @node-dblclick="handleNodeDblclick"
          />
        </template>
      </div>

      <!-- 표출그룹 삭제 확인 모달 -->
      <div
        v-if="showDisplayGroupDeleteModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        @click.self="closeDisplayGroupDeleteModal"
      >
        <div class="bg-white rounded-lg shadow-xl w-full max-w-sm p-5">
          <p class="text-slate-700">표출그룹 "{{ displayGroupDeleteTargetName }}"을(를) 삭제하시겠습니까?</p>
          <div class="mt-4 flex justify-end gap-2">
            <button
              type="button"
              class="px-3 py-1.5 text-sm rounded border border-slate-200 text-slate-600 hover:bg-slate-50"
              @click="closeDisplayGroupDeleteModal"
            >
              취소
            </button>
            <button
              type="button"
              class="px-3 py-1.5 text-sm rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              :disabled="displayGroupDeleteLoading"
              @click="confirmDisplayGroupDelete"
            >
              {{ displayGroupDeleteLoading ? '삭제 중...' : '삭제' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Area - Video Grid -->
    <div class="flex-1 flex flex-col gap-2 min-h-0">
      <!-- 툴바: 스트림 타입 + 레이아웃 셀렉트 + 영상 정리 + 표출그룹 저장 -->
      <div class="video-view-button-group-container">
        <div class="video-view-button-group">
          <button
            v-for="type in streamTypes"
            :key="type.id"
            type="button"
            :title="streamTypeTooltip"
            @click="handleStreamTypeChange(type.id)"
            :class="[
              'video-view-button-group-item',
              streamType === type.id ? 'video-view-button-group-item-active' : 'video-view-button-group-item-inactive'
            ]"
          >
            {{ type.label }}
          </button>
        </div>
        <div class="video-view-button-group video-view-toolbar-right">
          <div class="video-view-layout-group">
            <span class="video-view-layout-label">레이아웃</span>
            <select
              id="video-view-layout-select"
              :value="gridLayout"
              @change="handleGridLayoutChange(($event.target as HTMLSelectElement).value)"
              class="video-view-layout-select"
            >
              <option
                v-for="layout in gridLayouts"
                :key="layout.id"
                :value="layout.id"
              >
                {{ layout.label }}
              </option>
            </select>
          </div>
          <button
            type="button"
            class="video-view-button-group-item video-view-button-group-item-inactive hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700"
            @click="clearAllVideos"
          >
            영상 정리
          </button>
          <button
            type="button"
            class="video-view-button-group-item video-view-button-group-item-inactive hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700"
            @click="openSaveDisplayGroupModal"
          >
            표출그룹 저장
          </button>
        </div>
      </div>

      <!-- 표출그룹 저장 모달 -->
      <div
        v-if="showSaveDisplayGroupModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        @click.self="closeSaveDisplayGroupModal"
      >
        <div class="bg-white rounded-lg shadow-xl p-4 w-80">
          <h4 class="font-semibold text-slate-800 mb-2">표출그룹 저장</h4>
          <p class="text-xs text-slate-500 mb-2">현재 재생 중인 영상과 위치를 저장합니다.</p>
          <div class="flex gap-4 mb-3">
            <label class="flex items-center gap-1.5 cursor-pointer">
              <input
                v-model="saveDisplayGroupMode"
                type="radio"
                value="new"
                class="rounded border-slate-300"
              />
              <span class="text-sm text-slate-700">신규</span>
            </label>
            <label class="flex items-center gap-1.5 cursor-pointer">
              <input
                v-model="saveDisplayGroupMode"
                type="radio"
                value="overwrite"
                class="rounded border-slate-300"
              />
              <span class="text-sm text-slate-700">수정</span>
            </label>
          </div>
          <select
            v-if="saveDisplayGroupMode === 'overwrite'"
            v-model="saveDisplayGroupSelectedId"
            class="w-full text-sm border border-slate-200 rounded-md px-3 py-2 mb-2 focus:outline-none focus:border-blue-500 bg-white"
            :disabled="saveDisplayGroupLoading"
          >
            <option :value="null">그룹 선택</option>
            <option
              v-for="g in displayGroupStore.items"
              :key="g.group_id"
              :value="g.group_id"
            >
              {{ g.group_name }}
            </option>
          </select>
          <input
            v-model="saveDisplayGroupName"
            type="text"
            placeholder="표출그룹 이름"
            class="w-full text-sm border border-slate-200 rounded-md px-3 py-2 mb-2 focus:outline-none focus:border-blue-500"
            :disabled="saveDisplayGroupLoading"
            @keydown.enter="confirmSaveDisplayGroup"
          />
          <p v-if="saveDisplayGroupError" class="text-xs text-red-600 mb-2">{{ saveDisplayGroupError }}</p>
          <div class="flex justify-end gap-2">
            <button
              type="button"
              class="px-3 py-1.5 text-sm rounded border border-slate-200 text-slate-600 hover:bg-slate-50"
              :disabled="saveDisplayGroupLoading"
              @click="closeSaveDisplayGroupModal"
            >
              취소
            </button>
            <button
              type="button"
              class="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              :disabled="saveDisplayGroupLoading"
              @click="confirmSaveDisplayGroup"
            >
              {{ saveDisplayGroupLoading ? '저장 중...' : '저장' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Video Grid (표출그룹 드래그 시 전체 영역 호버 + 드롭 시 재생). FHD(1080p) 기준 높이 제한 -->
      <div class="video-view-grid-wrapper flex-1 min-h-0 relative my-2">
        <div :class="['video-view-grid grid gap-x-0.5 gap-y-2 min-h-0 h-full', gridClass]" :style="gridStyle">
          <div
            v-for="i in gridCount"
            :key="i"
            class="video-grid-cell bg-slate-900 rounded-lg overflow-hidden relative group min-h-0"
            :class="{ 'video-grid-cell-drag-over': !dragOverDisplayGroup && dragOverIndex === i - 1 }"
            @mouseenter="slotAssignments[i - 1] && showHeader(i - 1)"
            @mouseleave="slotAssignments[i - 1] && scheduleHideHeader(i - 1)"
            @dragenter.prevent="handleDragOver($event, i - 1)"
            @dragover.prevent="handleDragOver($event, i - 1)"
            @dragleave="handleDragLeave"
            @drop.prevent="handleDrop($event, i - 1)"
          >
          <template v-if="slotAssignments[i - 1]">
            <!-- HLS: WebRTC가 아닌 HLS 요청(m3u8)으로 재생 -->
            <HlsVideoPlayer
              v-if="slotAssignments[i - 1]!.protocol === 'hls'"
              :stream-url="slotAssignments[i - 1]!.streamUrl"
              label=""
              class="absolute inset-0 video-grid-cell-player"
            />
            <!-- RTSP: WebRTC(AMS7000)로 재생 -->
            <WebRtcVideoPlayer
              v-else
              :rtsp-url="slotAssignments[i - 1]!.streamUrl"
              label=""
              class="absolute inset-0 video-grid-cell-player"
            />
            <!-- 헤더: 일정 시간 후 숨김, 마우스 오버 시 표시 -->
            <div
              v-show="isHeaderVisible(i - 1)"
              class="absolute top-0 left-0 right-0 z-10 flex items-center justify-between gap-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-t text-xs text-white transition-opacity duration-300 video-grid-cell-header"
            >
              <span class="min-w-0 truncate font-medium">{{ slotAssignments[i - 1]!.label }}</span>
              <div class="flex items-center gap-1.5 shrink-0">
                <span class="text-white/80">{{ getStreamTypeLabel(slotAssignments[i - 1]!.streamType) }}</span>
                <button
                  type="button"
                  class="video-grid-cell-close-btn"
                  title="영상 종료"
                  @click.stop="clearSlot(i - 1)"
                >
                  ×
                </button>
              </div>
            </div>
            <!-- 재생 중인 셀: 드래그 중일 때만 오버레이가 드롭 수신 → 기존 영상 종료 후 새 영상 재생 -->
            <div
              class="absolute inset-0 video-grid-cell-drop-overlay"
              :class="{ 'video-grid-cell-drag-over': dragOverIndex === i - 1 }"
              :style="{ zIndex: 10, pointerEvents: isDragging ? 'auto' : 'none' }"
              @dragenter.prevent="handleDragOver($event, i - 1)"
              @dragover.prevent="handleDragOver($event, i - 1)"
              @drop.prevent="handleDrop($event, i - 1)"
              @dragleave="handleDragLeave"
            />
          </template>
          <template v-else>
            <div class="absolute inset-0 flex items-center justify-center text-slate-600">
              <Video :size="48" class="text-slate-700" />
            </div>
          </template>
          </div>
        </div>
        <!-- 표출그룹 드래그 시 전체 영역 호버 레이어 -->
        <div
          v-show="dragOverDisplayGroup"
          class="absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-blue-500 bg-blue-500/20 transition-opacity"
          :class="dragOverDisplayGroup ? 'pointer-events-auto' : 'pointer-events-none'"
          @dragover.prevent="handleDisplayGroupDragOver"
          @drop.prevent="handleDisplayGroupDrop"
          @dragleave="handleDisplayGroupDragLeave"
        >
          <span class="text-lg font-medium text-blue-700 drop-zone-label">표출그룹을 여기에 놓으세요</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Search, Video, Trash2 } from 'lucide-vue-next'
import VirtualTree from '../shared/VirtualTree.vue'
import HlsVideoPlayer from './HlsVideoPlayer.vue'
import WebRtcVideoPlayer from './WebRtcVideoPlayer.vue'
import { useVideoConversionInfoStore } from '../../stores/videoConversionInfo'
import { useMediaServerInfoStore } from '../../stores/mediaServerInfo'
import { useCameraInfoStore } from '../../stores/cameraInfo'
import { useVideoConversionServerInfoStore } from '../../stores/videoConversionServerInfo'
import { useDisplayGroupStore } from '../../stores/displayGroup'
import { useAlertStore } from '../../stores/alert'

interface TreeFilter {
  id: string
  label: string
}

interface TreeNode {
  id: string
  label: string
  icon?: any
  children?: TreeNode[]
  defaultOpen?: boolean
}

export type StreamProtocol = 'rtsp' | 'hls'

interface SlotAssignment {
  chId: string
  cctvId: string
  label: string
  streamType: string
  streamUrl: string | null
  protocol: StreamProtocol
}

interface Props {
  treeFilters?: TreeFilter[]
  treeFilter?: string
  searchTerm?: string
  streamType?: string
  gridLayout?: string
  cctvTreeData?: Record<string, any[]>
}

const props = withDefaults(defineProps<Props>(), {
  treeFilters: () => [],
  treeFilter: 'media',
  searchTerm: '',
  streamType: 'original-rtsp',
  gridLayout: '2x2',
  cctvTreeData: () => ({})
})

const videoConversionStore = useVideoConversionInfoStore()
const mediaServerStore = useMediaServerInfoStore()
const cameraStore = useCameraInfoStore()
const conversionServerStore = useVideoConversionServerInfoStore()
const displayGroupStore = useDisplayGroupStore()
const alertStore = useAlertStore()

const VIDEO_VIEW_GRID_LAYOUT_KEY = 'vms_video_view_grid_layout'
const DISPLAY_GROUP_DRAG_TYPE = 'application/x-vms-display-group'
function getSavedGridLayout(): string {
  try {
    const saved = localStorage.getItem(VIDEO_VIEW_GRID_LAYOUT_KEY)
    const valid = new Set(['1x1', '2x2', '3x3', '4x4'])
    if (saved && valid.has(saved)) return saved
  } catch (_) {}
  return props.gridLayout || '2x2'
}

const treeFilter = ref(props.treeFilter)
const searchTerm = ref(props.searchTerm)
const streamType = ref(props.streamType)
const gridLayout = ref(getSavedGridLayout())
const showSaveDisplayGroupModal = ref(false)
const saveDisplayGroupMode = ref<'new' | 'overwrite'>('new')
const saveDisplayGroupSelectedId = ref<string | null>(null)
const saveDisplayGroupName = ref('')
const saveDisplayGroupLoading = ref(false)
const saveDisplayGroupError = ref('')
const showDisplayGroupDeleteModal = ref(false)
const displayGroupDeleteTargetId = ref<string | null>(null)
const displayGroupDeleteTargetName = ref('')
const displayGroupDeleteLoading = ref(false)

// ch_alive가 'y'인 채널만 (MGMT_CHANNEL 기준)
const aliveChannels = computed(() =>
  videoConversionStore.items.filter((item) => (item.ch_alive || '').toLowerCase() === 'y')
)

// 필터별 트리 데이터 (미디어/본부별/노선별/변환서버별 실데이터, 차단·SMS는 빈 배열)
const treeDataByFilter = computed<Record<string, TreeNode[]>>(() => {
  const channels = aliveChannels.value
  const media: TreeNode[] = []
  const conversionServer: TreeNode[] = []
  const hqMap = new Map<string, typeof channels>()
  const routeMap = new Map<string, typeof channels>()

  for (const ch of channels) {
    const fmsId = ch.fms_id || ''
    const transId = ch.trans_id || ''
    const hqCode = (ch.hq_code ?? '').toString().trim() || '(미지정)'
    const routeCode = (ch.route_code ?? '').toString().trim() || '(미지정)'
    const leaf: TreeNode = { id: ch.ch_id, label: ch.cctv_id || ch.ch_id }
    if (fmsId) {
      let group = media.find((n) => n.id === `media-${fmsId}`)
      if (!group) {
        const label = mediaServerStore.getById(fmsId)?.fms_name || fmsId
        group = { id: `media-${fmsId}`, label, children: [], defaultOpen: true }
        media.push(group)
      }
      group.children!.push(leaf)
    }
    if (transId) {
      let group = conversionServer.find((n) => n.id === `conversion-${transId}`)
      if (!group) {
        const label = conversionServerStore.getById(transId)?.trans_name || transId
        group = { id: `conversion-${transId}`, label, children: [], defaultOpen: true }
        conversionServer.push(group)
      }
      group.children!.push(leaf)
    }
    if (!hqMap.has(hqCode)) hqMap.set(hqCode, [])
    hqMap.get(hqCode)!.push(ch)
    if (!routeMap.has(routeCode)) routeMap.set(routeCode, [])
    routeMap.get(routeCode)!.push(ch)
  }

  const headquarters: TreeNode[] = Array.from(hqMap.entries()).map(([code, list]) => ({
    id: `hq-${code}`,
    label: code,
    children: list.map((ch) => ({ id: ch.ch_id, label: ch.cctv_id || ch.ch_id })),
    defaultOpen: true
  }))
  const route: TreeNode[] = Array.from(routeMap.entries()).map(([code, list]) => ({
    id: `route-${code}`,
    label: code,
    children: list.map((ch) => ({ id: ch.ch_id, label: ch.cctv_id || ch.ch_id })),
    defaultOpen: true
  }))

  const displayGroup: TreeNode[] = displayGroupStore.items.map((g) => ({
    id: g.group_id,
    label: g.group_name || g.group_id
  }))

  return {
    'conversion-server': conversionServer,
    media,
    headquarters,
    route,
    'block-sms': [],
    'display-group': displayGroup
  }
})

function onGlobalDragStart() {
  isDragging.value = true
}
function onGlobalDragEnd() {
  isDragging.value = false
}

onMounted(async () => {
  await Promise.all([
    videoConversionStore.fetchVideoConversions(),
    mediaServerStore.fetchMediaServers(),
    cameraStore.fetchCameras(),
    conversionServerStore.fetchVideoConversionServers()
  ])
  ensureSlotAssignmentsLength()
  document.addEventListener('dragstart', onGlobalDragStart)
  document.addEventListener('dragend', onGlobalDragEnd)
  document.addEventListener('drop', onGlobalDragEnd)
})
onUnmounted(() => {
  document.removeEventListener('dragstart', onGlobalDragStart)
  document.removeEventListener('dragend', onGlobalDragEnd)
  document.removeEventListener('drop', onGlobalDragEnd)
})

// 그룹핑 필터 옵션
const treeFilters = [
  { id: 'conversion-server', label: '변환서버' },
  { id: 'media', label: '미디어' },
  { id: 'headquarters', label: '본부별' },
  { id: 'route', label: '노선별' },
  { id: 'block-sms', label: '차단/SMS' },
  { id: 'display-group', label: '표출그룹' }
]

const streamTypes = [
  { id: 'original-rtsp', label: '원본(RTSP)' },
  { id: 'transcoded-rtsp', label: '변환(RTSP)' },
  { id: 'transcoded-hls', label: '변환(HLS)' },
  { id: 'media-rtsp', label: '미디어(RTSP)' },
  { id: 'media-hls', label: '미디어(HLS)' }
]

/** 스트림 타입 버튼 마우스 오버 시 툴팁 문구 */
const streamTypeTooltip =
  '이 타입을 선택한 후 영상을 재생하면, 선택한 타입에 맞는 스트림으로 요청합니다.'

function getStreamTypeLabel(typeId: string) {
  return streamTypes.find((t) => t.id === (typeId || streamType.value))?.label ?? '원본(RTSP)'
}

const gridLayouts = [
  { id: '1x1', label: '1x1' },
  { id: '2x2', label: '2x2' },
  { id: '3x3', label: '3x3' },
  { id: '4x4', label: '4x4' }
]
const VALID_GRID_LAYOUTS = new Set(gridLayouts.map((l) => l.id))

const filterTree = (nodes: any[], term: string): any[] => {
  if (!term) return nodes
  return nodes.reduce((acc: any[], node: any) => {
    const matches = node.label.toLowerCase().includes(term.toLowerCase())
    const filteredChildren = node.children ? filterTree(node.children, term) : []

    if (matches || filteredChildren.length > 0) {
      acc.push({
        ...node,
        defaultOpen: true,
        children: filteredChildren
      })
    }
    return acc
  }, [])
}

// 표출그룹 필터 시 검색어로 필터링된 목록
const filteredDisplayGroups = computed(() => {
  const list = displayGroupStore.items
  const term = (searchTerm.value || '').trim().toLowerCase()
  if (!term) return list
  return list.filter(
    (g) =>
      (g.group_name || '').toLowerCase().includes(term) ||
      (g.group_id || '').toLowerCase().includes(term)
  )
})

// 그룹핑 필터에 따라 트리 데이터 필터링 (실데이터: treeDataByFilter)
const filteredTreeData = computed(() => {
  const currentData = treeDataByFilter.value[treeFilter.value] || []
  const filtered = filterTree(currentData, searchTerm.value)
  return filtered
})

const gridClass = computed(() => {
  const [cols] = gridLayout.value.split('x').map(Number)
  return `grid-cols-${cols}`
})

const gridStyle = computed(() => {
  const [rows] = gridLayout.value.split('x').map(Number)
  return { gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }
})

const gridCount = computed(() => {
  const [rows, cols] = gridLayout.value.split('x').map(Number)
  return rows * cols
})

// 슬롯별 할당: 인덱스 → { chId, cctvId, label, streamUrl } | null
const slotAssignments = ref<(SlotAssignment | null)[]>([])
const dragOverIndex = ref<number | null>(null)
/** 드래그 중일 때만 재생 셀 오버레이가 이벤트를 받아 드롭이 확실히 동작하도록 함 */
const isDragging = ref(false)
const dragOverDisplayGroup = ref(false)

// 헤더 자동 숨김: 일정 시간 후 숨기고, 마우스 오버 시 다시 표시
const HEADER_VISIBLE_MS = 3000
const headerVisible = ref<Record<number, boolean>>({})
const headerHideTimers: Record<number, ReturnType<typeof setTimeout>> = {}
function clearHeaderHideTimer(slotIndex: number) {
  const t = headerHideTimers[slotIndex]
  if (t != null) {
    clearTimeout(t)
    delete headerHideTimers[slotIndex]
  }
}
function scheduleHideHeader(slotIndex: number) {
  clearHeaderHideTimer(slotIndex)
  headerHideTimers[slotIndex] = setTimeout(() => {
    headerVisible.value = { ...headerVisible.value, [slotIndex]: false }
    delete headerHideTimers[slotIndex]
  }, HEADER_VISIBLE_MS)
}
function showHeader(slotIndex: number) {
  headerVisible.value = { ...headerVisible.value, [slotIndex]: true }
  scheduleHideHeader(slotIndex)
}
function isHeaderVisible(slotIndex: number): boolean {
  return headerVisible.value[slotIndex] !== false
}

function ensureSlotAssignmentsLength() {
  const n = gridCount.value
  const current = slotAssignments.value
  if (current.length === n) return
  const next: (SlotAssignment | null)[] = Array.from({ length: n }, (_, i) => current[i] ?? null)
  slotAssignments.value = next
}

/** 레이아웃의 모든 영상 종료. 슬롯을 비우면 각 플레이어가 unmount 되며 WebRTC는 Aces shutdown(), HLS는 destroy() 호출 */
function clearAllVideos() {
  for (let i = 0; i < gridCount.value; i++) clearHeaderHideTimer(i)
  const n = gridCount.value
  slotAssignments.value = Array.from({ length: n }, () => null)
}

/** 해당 슬롯만 영상 종료(헤더 X 버튼용) */
function clearSlot(slotIndex: number) {
  clearHeaderHideTimer(slotIndex)
  const n = gridCount.value
  const current = slotAssignments.value
  const next = Array.from({ length: n }, (_, i) => (i === slotIndex ? null : (current[i] ?? null)))
  slotAssignments.value = next
}

// 레거시 CameraTree: cctvShortName = "cctv" + cctv_id.substr(8)
function getCctvShortName(cctvId: string): string {
  return 'cctv' + (cctvId.length >= 8 ? cctvId.substr(8) : cctvId)
}

function resolveStream(
  chId: string,
  cctvId: string,
  type: string
): { streamUrl: string | null; protocol: StreamProtocol } {
  const channel = videoConversionStore.getById(chId)
  const camera = cameraStore.getById(cctvId)
  const shortName = getCctvShortName(cctvId)

  switch (type) {
    case 'original-rtsp':
      return {
        streamUrl: camera?.enc_url || null,
        protocol: 'rtsp'
      }
    case 'transcoded-rtsp': {
      if (!channel?.trans_id) return { streamUrl: null, protocol: 'rtsp' }
      const server = conversionServerStore.getById(channel.trans_id)
      const url = server?.trans_ip ? `rtsp://${server.trans_ip}/${chId}` : null
      return { streamUrl: url, protocol: 'rtsp' }
    }
    case 'transcoded-hls': {
      if (!channel?.trans_id) return { streamUrl: null, protocol: 'hls' }
      const server = conversionServerStore.getById(channel.trans_id)
      if (!server?.trans_ip) return { streamUrl: null, protocol: 'hls' }
      const url = `http://${server.trans_ip}/livehttp/${chId}/chunklist.m3u8`
      return { streamUrl: url, protocol: 'hls' }
    }
    case 'media-rtsp': {
      if (!channel?.fms_id) return { streamUrl: null, protocol: 'rtsp' }
      const server = mediaServerStore.getById(channel.fms_id)
      const url = server?.fms_ip
        ? `rtsp://${server.fms_ip}/live/${shortName}.stream`
        : null
      return { streamUrl: url, protocol: 'rtsp' }
    }
    case 'media-hls':
      return {
        streamUrl: camera?.hls_url || null,
        protocol: 'hls'
      }
    default:
      return { streamUrl: null, protocol: 'rtsp' }
  }
}

/** 특정 슬롯에 카메라 할당. 기존 재생이 있으면 해당 슬롯이 교체되며 기존 플레이어는 unmount 시 정상 종료됨. 같은 영상이면 잠시 비운 뒤 다시 할당해 재생 재시작 */
function setSlotAssignment(slotIndex: number, chId: string, cctvId: string, label: string) {
  const slotType = streamType.value
  const { streamUrl, protocol } = resolveStream(chId, cctvId, slotType)
  if (streamUrl) {
    console.log('타입:', getStreamTypeLabel(slotType), ' 카메라:', cctvId, ' URL:', streamUrl)
  }
  const n = gridCount.value
  const current = slotAssignments.value
  const existing = current[slotIndex]
  const isSameCamera = existing && existing.chId === chId && existing.cctvId === cctvId

  if (isSameCamera) {
    const assignment = { chId, cctvId, label, streamType: slotType, streamUrl, protocol }
    const cleared = Array.from({ length: n }, (_, i) => (i === slotIndex ? null : (current[i] ?? null)))
    slotAssignments.value = cleared
    nextTick(() => {
      const next = Array.from({ length: n }, (_, i) => (i === slotIndex ? assignment : (slotAssignments.value[i] ?? null)))
      slotAssignments.value = next
    })
  } else {
    const next = Array.from({ length: n }, (_, i) =>
      i === slotIndex ? { chId, cctvId, label, streamType: slotType, streamUrl, protocol } : (current[i] ?? null)
    )
    slotAssignments.value = next
  }
}

/** 첫 번째 빈 슬롯 인덱스. 없으면 -1 */
function getFirstEmptySlotIndex(): number {
  return slotAssignments.value.findIndex((s) => s == null)
}

// 드래그앤드롭: 이벤트 전파 차단으로 브라우저 확장 프로그램(content.js 등)과의 충돌 방지. 드롭한 슬롯은 기존 영상 정상 종료 후 새 영상 재생
function handleDrop(evt: DragEvent, slotIndex: number) {
  evt.preventDefault()
  evt.stopPropagation()
  const groupId = evt.dataTransfer?.getData(DISPLAY_GROUP_DRAG_TYPE)
  if (groupId) {
    dragOverDisplayGroup.value = false
    dragOverIndex.value = null
    playDisplayGroup(groupId)
    return
  }
  dragOverIndex.value = null
  const raw = evt.dataTransfer?.getData('application/json')
  if (!raw) return
  try {
    const { chId, cctvId, label } = JSON.parse(raw) as { chId: string; cctvId: string; label: string }
    setSlotAssignment(slotIndex, chId, cctvId, label)
  } catch (_) {
    // ignore parse error
  }
}

function handleDragOver(evt: DragEvent, slotIndex: number) {
  if (evt.dataTransfer?.types.includes(DISPLAY_GROUP_DRAG_TYPE)) {
    evt.preventDefault()
    evt.stopPropagation()
    evt.dataTransfer.dropEffect = 'copy'
    dragOverDisplayGroup.value = true
    dragOverIndex.value = null
    return
  }
  evt.preventDefault()
  evt.stopPropagation()
  evt.dataTransfer && (evt.dataTransfer.dropEffect = 'copy')
  dragOverIndex.value = slotIndex
}

function handleDragLeave() {
  dragOverIndex.value = null
  dragOverDisplayGroup.value = false
}

function handleDisplayGroupDragOver(evt: DragEvent) {
  if (!evt.dataTransfer?.types.includes(DISPLAY_GROUP_DRAG_TYPE)) return
  evt.preventDefault()
  evt.dataTransfer.dropEffect = 'copy'
  dragOverDisplayGroup.value = true
}

function handleDisplayGroupDrop(evt: DragEvent) {
  const groupId = evt.dataTransfer?.getData(DISPLAY_GROUP_DRAG_TYPE)
  if (groupId) playDisplayGroup(groupId)
  dragOverDisplayGroup.value = false
}

function handleDisplayGroupDragLeave() {
  dragOverDisplayGroup.value = false
}

// 그리드 레이아웃 변경 시 슬롯 배열 길이 맞춤
watch(gridCount, () => ensureSlotAssignmentsLength(), { immediate: true })

// 슬롯에 영상이 할당되면 헤더 표시 후 일정 시간 뒤 숨김
watch(
  slotAssignments,
  (slots) => {
    slots.forEach((_, i) => {
      if (slots[i]) showHeader(i)
    })
  },
  { deep: true }
)

// 표출그룹 탭 선택 시 목록 로드
watch(treeFilter, (id) => {
  if (id === 'display-group') displayGroupStore.fetchDisplayGroups()
})

// 저장 모드 전환 시 선택 초기화
watch(saveDisplayGroupMode, (m) => {
  saveDisplayGroupSelectedId.value = null
  if (m === 'new') saveDisplayGroupName.value = ''
})

// 덮어쓰기 시 그룹 선택하면 이름 필드에 해당 그룹명 prefill
watch(saveDisplayGroupSelectedId, (id) => {
  if (id && saveDisplayGroupMode.value === 'overwrite') {
    const group = displayGroupStore.getById(id)
    if (group?.group_name) saveDisplayGroupName.value = group.group_name
  }
})

// 스트림 타입 변경 시 기존 슬롯은 각자 저장된 streamType으로 URL만 재계산
function recalcSlotUrls() {
  const next = slotAssignments.value.map((slot) => {
    if (!slot) return null
    const typeId = slot.streamType ?? streamType.value
    const { streamUrl, protocol } = resolveStream(slot.chId, slot.cctvId, typeId)
    return { ...slot, streamType: typeId, streamUrl, protocol }
  })
  slotAssignments.value = next
}

const handleTreeFilterChange = (id: string) => {
  treeFilter.value = id
}

const handleSearchChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  searchTerm.value = target.value
}

const handleStreamTypeChange = (id: string) => {
  streamType.value = id
  // 각 슬롯은 자신의 streamType 유지, URL만 재계산
  recalcSlotUrls()
}

const handleGridLayoutChange = (id: string) => {
  if (!VALID_GRID_LAYOUTS.has(id)) return
  gridLayout.value = id
  try {
    localStorage.setItem(VIDEO_VIEW_GRID_LAYOUT_KEY, id)
  } catch (_) {}
}

function closeSaveDisplayGroupModal() {
  showSaveDisplayGroupModal.value = false
  saveDisplayGroupError.value = ''
  saveDisplayGroupMode.value = 'new'
  saveDisplayGroupSelectedId.value = null
}

function openSaveDisplayGroupModal() {
  saveDisplayGroupMode.value = 'new'
  saveDisplayGroupSelectedId.value = null
  saveDisplayGroupName.value = ''
  saveDisplayGroupError.value = ''
  displayGroupStore.fetchDisplayGroups()
  showSaveDisplayGroupModal.value = true
}

async function confirmSaveDisplayGroup() {
  const name = saveDisplayGroupName.value.trim()
  const mode = saveDisplayGroupMode.value
  const selectedId = saveDisplayGroupSelectedId.value

  if (mode === 'new') {
    if (!name) {
      saveDisplayGroupError.value = '표출그룹 이름을 입력하세요.'
      return
    }
  } else {
    if (!selectedId) {
      saveDisplayGroupError.value = '덮어쓸 그룹을 선택하세요.'
      return
    }
    if (!name) {
      saveDisplayGroupError.value = '표출그룹 이름을 입력하세요.'
      return
    }
  }

  saveDisplayGroupError.value = ''
  saveDisplayGroupLoading.value = true
  try {
    const cameras = slotAssignments.value
      .map((slot, index) => {
        if (!slot) return null
        return {
          layout_index: index,
          ch_id: slot.chId,
          cctv_id: slot.cctvId,
          label: slot.label,
          stream_type: slot.streamType
        }
      })
      .filter((c): c is NonNullable<typeof c> => c != null)

    if (mode === 'new') {
      const result = await displayGroupStore.saveDisplayGroup({
        group_name: name,
        layout: gridLayout.value,
        cameras
      })
      if (result) {
        closeSaveDisplayGroupModal()
        treeFilter.value = 'display-group'
        await displayGroupStore.fetchDisplayGroups(true)
      } else {
        saveDisplayGroupError.value = displayGroupStore.error || '저장에 실패했습니다.'
      }
    } else {
      const ok = await displayGroupStore.updateDisplayGroup(selectedId!, {
        group_name: name,
        layout: gridLayout.value,
        cameras
      })
      if (ok) {
        closeSaveDisplayGroupModal()
        treeFilter.value = 'display-group'
      } else {
        saveDisplayGroupError.value = displayGroupStore.error || '덮어쓰기에 실패했습니다.'
      }
    }
  } finally {
    saveDisplayGroupLoading.value = false
  }
}

async function playDisplayGroup(groupId: string) {
  const group = displayGroupStore.getById(groupId)
  if (!group) return
  const cameras = await displayGroupStore.fetchCamerasByGroupId(groupId)
  if (!cameras.length) return
  gridLayout.value = group.layout
  await nextTick()
  ensureSlotAssignmentsLength()
  const n = gridCount.value
  const next: (SlotAssignment | null)[] = Array.from({ length: n }, () => null)
  for (const c of cameras) {
    const idx = Number(c.layout_index ?? 0)
    if (idx < 0 || idx >= n) continue
    const chId = c.ch_id || videoConversionStore.items.find((ch) => ch.cctv_id === c.cctv_id)?.ch_id || ''
    const streamTypeId = c.stream_type || 'original-rtsp'
    const { streamUrl, protocol } = resolveStream(chId, c.cctv_id, streamTypeId)
    if (streamUrl) {
      console.log('요청 타입:', getStreamTypeLabel(streamTypeId), '요청 카메라:', c.cctv_id, '요청 URL:', streamUrl)
    }
    next[idx] = {
      chId,
      cctvId: c.cctv_id,
      label: c.label ?? c.cctv_id,
      streamType: streamTypeId,
      streamUrl,
      protocol
    }
  }
  slotAssignments.value = next
}

const handleNodeClick = (_node: any) => {
  // 단일 클릭: 선택만 (표출그룹 재생은 더블클릭으로)
}

function handleNodeDblclick(node: any) {
  if (treeFilter.value === 'display-group' && node?.id) {
    playDisplayGroup(node.id)
    return
  }
  // 카메라 노드 더블클릭: 비어 있는 슬롯에 순서대로 재생
  if (node?.id && !node.hasChildren) {
    const emptyIndex = getFirstEmptySlotIndex()
    if (emptyIndex >= 0) {
      setSlotAssignment(emptyIndex, node.id, node.label, node.label)
    }
  }
}

function handleDisplayGroupDragStart(evt: DragEvent, groupId: string) {
  if (evt.dataTransfer) {
    evt.dataTransfer.setData(DISPLAY_GROUP_DRAG_TYPE, groupId)
    evt.dataTransfer.effectAllowed = 'copy'
  }
}
function openDisplayGroupDeleteConfirm(g: { group_id: string; group_name?: string }) {
  displayGroupDeleteTargetId.value = g.group_id
  displayGroupDeleteTargetName.value = g.group_name || g.group_id
  showDisplayGroupDeleteModal.value = true
}
function closeDisplayGroupDeleteModal() {
  showDisplayGroupDeleteModal.value = false
  displayGroupDeleteTargetId.value = null
  displayGroupDeleteTargetName.value = ''
}
async function confirmDisplayGroupDelete() {
  const id = displayGroupDeleteTargetId.value
  if (!id) return
  displayGroupDeleteLoading.value = true
  try {
    const ok = await displayGroupStore.deleteDisplayGroup(id)
    if (ok) {
      closeDisplayGroupDeleteModal()
      alertStore.show('표출그룹이 삭제되었습니다.', 'success')
    } else {
      alertStore.show(displayGroupStore.error || '삭제에 실패했습니다.', 'error')
    }
  } finally {
    displayGroupDeleteLoading.value = false
  }
}

// 트리 데이터에서 총 카메라 개수 계산
const countCameras = (nodes: any[]): number => {
  let count = 0
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      count += countCameras(node.children)
    } else {
      count += 1
    }
  }
  return count
}

const getTotalCount = (filter: string): number => {
  const data = treeDataByFilter.value[filter] || []
  return countCameras(data)
}
</script>

<style scoped>
/* FHD(1920x1080) 기준: 헤더(70px) + 패딩(48px) + 툴바(~52px) 여유 = 영상 영역 최대 높이 제한 */
.video-view-grid-wrapper {
  max-height: calc(100vh - 170px);
}
.video-view-grid {
  grid-auto-rows: minmax(0, 1fr);
}
/* 영상 셀: 그리드가 분배한 높이에 맞춤, 비디오는 object-fit으로 맞춤 재생 */
.video-grid-cell {
  min-height: 0;
}
.video-grid-cell-drag-over {
  outline: 2px solid rgb(59 130 246);
  outline-offset: -2px;
}
.video-grid-cell-drop-overlay {
  cursor: copy;
}
.video-grid-cell-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  border: none;
  border-radius: 0.25rem;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  transition: background 0.15s;
}
.video-grid-cell-close-btn:hover {
  background: rgba(239, 68, 68, 0.9);
}
</style>