<template>
  <div class="flex-1 flex flex-col gap-4 min-h-0">
    <!-- Server Overview Cards -->
    <div class="grid grid-cols-6 gap-4 shrink-0">
      <div class="server-status-overview-card">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-slate-500">전체 서버</span>
          <Activity :size="16" class="text-blue-500" />
        </div>
        <div class="text-2xl font-bold text-slate-800">{{ effectiveServerData.length }}</div>
        <div class="text-xs text-slate-400 mt-1">개</div>
      </div>
      <div class="server-status-overview-card">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-slate-500">정상</span>
          <CheckCircle :size="16" class="text-green-500" />
        </div>
        <div class="text-2xl font-bold text-green-600">{{ normalCount }}</div>
        <div class="text-xs text-slate-400 mt-1">{{ normalPercentage }}%</div>
      </div>
      <div class="server-status-overview-card">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-slate-500">경고</span>
          <AlertTriangle :size="16" class="text-orange-500" />
        </div>
        <div class="text-2xl font-bold text-orange-600">{{ warningCount }}</div>
        <div class="text-xs text-slate-400 mt-1">{{ warningPercentage }}%</div>
      </div>
      <div class="server-status-overview-card">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-slate-500">위험</span>
          <AlertTriangle :size="16" class="text-red-500" />
        </div>
        <div class="text-2xl font-bold text-red-600">{{ dangerCount }}</div>
        <div class="text-xs text-slate-400 mt-1">{{ dangerPercentage }}%</div>
      </div>
      <div class="server-status-overview-card">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-slate-500">중지</span>
          <Activity :size="16" class="text-slate-400" />
        </div>
        <div class="text-2xl font-bold text-slate-600">{{ stoppedCount }}</div>
        <div class="text-xs text-slate-400 mt-1">{{ stoppedPercentage }}%</div>
      </div>
      <div class="server-status-overview-card">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-slate-500">평균 CPU</span>
          <Activity :size="16" class="text-indigo-500" />
        </div>
        <div class="text-2xl font-bold text-indigo-600">{{ averageCpu }}%</div>
        <div class="text-xs text-slate-400 mt-1">서버 평균</div>
      </div>
    </div>

    <!-- View Toggle and Content -->
    <div class="flex-1 flex flex-col min-h-0 bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div class="p-4 border-b border-slate-200 flex items-center justify-between shrink-0">
        <div class="server-status-tab-container">
          <button
            @click="handleServerFilterChange('transcoding')"
            :class="[
              'server-status-tab-button',
              serverFilter === 'transcoding' ? 'server-status-tab-button-active' : 'server-status-tab-button-inactive'
            ]"
          >
            변환/분배 서버
          </button>
          <button
            @click="handleServerFilterChange('media')"
            :class="[
              'server-status-tab-button',
              serverFilter === 'media' ? 'server-status-tab-button-active' : 'server-status-tab-button-inactive'
            ]"
          >
            미디어 서버
          </button>
        </div>

        <div class="server-status-view-toggle-buttons">
          <button
            @click="handleServerViewModeChange('grid')"
            :class="['server-status-view-toggle-btn', { 'server-status-view-toggle-btn-active': serverViewMode === 'grid' }]"
          >
            <Grid3x3 :size="20" />
          </button>
          <button
            @click="handleServerViewModeChange('chart')"
            :class="['server-status-view-toggle-btn', { 'server-status-view-toggle-btn-active': serverViewMode === 'chart' }]"
          >
            <Activity :size="20" />
          </button>
        </div>
      </div>

      <!-- Server List Content -->
      <div class="flex-1 overflow-hidden flex flex-col">
        <div v-if="currentServers.length === 0" class="flex-1 flex items-center justify-center text-slate-400">
          등록된 서버가 없습니다.
        </div>
        <div v-else-if="serverViewMode === 'grid'" class="flex-1 overflow-auto custom-scrollbar flex flex-col">
          <p v-if="filteredServerCount !== totalServerCount" class="shrink-0 px-4 py-2 text-sm text-slate-500">
            (표시: <strong>{{ filteredServerCount }}</strong>개 / 전체 {{ totalServerCount }}개)
          </p>
          <table class="w-full border-collapse">
            <thead class="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th
                  v-for="col in SERVER_TABLE_COLUMNS"
                  :key="col.id"
                  class="table-header-cell text-center p-3 text-sm font-semibold text-slate-600 border-b border-r border-slate-200"
                  :class="{ 'table-filtered': isColumnFiltered(col.id) }"
                >
                  <div class="flex items-center justify-center gap-1">
                    <span>{{ col.label }}</span>
                    <button
                      type="button"
                      class="table-filter-button"
                      :class="{ active: openFilterDropdown === col.id || isColumnFiltered(col.id) }"
                      @click.stop="toggleFilterDropdown(col.id, $event)"
                    >
                      <span class="table-filter-icon">🔍</span>
                    </button>
                  </div>
                  <div v-if="openFilterDropdown === col.id" class="table-filter-dropdown">
                    <div class="table-filter-section">
                      <div class="table-filter-section-title">정렬</div>
                      <div class="table-filter-options">
                        <button
                          type="button"
                          class="table-filter-option"
                          :class="{ active: serverSort?.id === col.id && !serverSort?.desc }"
                          @click="handleServerSort(col.id, 'asc')"
                        >
                          오름차순
                        </button>
                        <button
                          type="button"
                          class="table-filter-option"
                          :class="{ active: serverSort?.id === col.id && serverSort?.desc }"
                          @click="handleServerSort(col.id, 'desc')"
                        >
                          내림차순
                        </button>
                      </div>
                    </div>
                    <div class="table-filter-section">
                      <div class="table-filter-section-title">검색</div>
                      <input
                        :value="serverColumnFilters[col.id]?.search ?? ''"
                        type="text"
                        placeholder="검색..."
                        class="table-filter-search-input"
                        @input="(e) => setServerColumnSearch(col.id, (e.target as HTMLInputElement).value)"
                      />
                    </div>
                    <div class="table-filter-section">
                      <button
                        type="button"
                        class="table-filter-clear-button"
                        :disabled="!(serverColumnFilters[col.id]?.search?.trim() || serverSort?.id === col.id)"
                        @click="clearServerFilter(col.id)"
                      >
                        필터 해제
                      </button>
                    </div>
                  </div>
                </th>
                <th class="text-center p-3 text-sm font-semibold text-slate-600 border-b border-slate-200 w-28">상세보기</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(server, idx) in filteredAndSortedServers"
                :key="idx"
                class="border-b border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <td class="p-3 text-center border-r border-slate-200">
                  <div class="font-medium text-slate-700">{{ server.name }}</div>
                </td>
                <td class="p-3 text-sm text-slate-600 text-center border-r border-slate-200">{{ server.location }}</td>
                <td class="p-3 text-center border-r border-slate-200">
                  <span
                    :class="[
                      'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                      statusBadgeClass(server.status)
                    ]"
                  >
                    <span :class="['w-1.5 h-1.5 rounded-full', statusDotClass(server.status)]"></span>
                    {{ statusLabel(server.status) }}
                  </span>
                </td>
                <td class="p-3 text-center border-r border-slate-200">
                  <div class="server-status-grid-progress-container flex justify-center">
                    <div class="server-status-grid-progress-bar">
                      <div
                        class="server-status-grid-progress-fill"
                        :class="server.cpu > 70 ? 'bg-orange-500' : 'bg-blue-500'"
                        :style="{ width: `${server.cpu}%` }"
                      ></div>
                    </div>
                    <span class="server-status-grid-progress-value">{{ server.cpu }}%</span>
                  </div>
                </td>
                <td class="p-3 text-center border-r border-slate-200">
                  <div class="server-status-grid-progress-container flex justify-center">
                    <div class="server-status-grid-progress-bar">
                      <div
                        class="server-status-grid-progress-fill"
                        :class="server.memory > 70 ? 'bg-orange-500' : 'bg-green-500'"
                        :style="{ width: `${server.memory}%` }"
                      ></div>
                    </div>
                    <span class="server-status-grid-progress-value">{{ server.memory }}%</span>
                  </div>
                </td>
                <td class="p-3 text-center border-r border-slate-200">
                  <div class="server-status-grid-progress-container flex justify-center">
                    <div class="server-status-grid-progress-bar">
                      <div
                        class="server-status-grid-progress-fill"
                        :class="server.disk > 70 ? 'bg-orange-500' : 'bg-indigo-500'"
                        :style="{ width: `${server.disk}%` }"
                      ></div>
                    </div>
                    <span class="server-status-grid-progress-value">{{ server.disk }}%</span>
                  </div>
                </td>
                <td class="p-3 text-center border-r border-slate-200">
                  <span class="text-sm font-medium text-slate-600">{{ server.network }}</span>
                </td>
                <td class="p-3 text-center">
                  <button
                    type="button"
                    class="px-3 py-1.5 text-sm rounded bg-sky-500 text-white hover:bg-sky-600 transition-colors"
                    @click="goToDetail(server)"
                  >
                    상세보기
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="flex-1 overflow-auto custom-scrollbar p-6">
          <div class="grid grid-cols-6 gap-4">
            <div
              v-for="(server, idx) in currentServers"
              :key="idx"
              class="server-status-server-card"
            >
              <!-- Header -->
              <div class="server-status-server-card-header">
                <div
                  class="server-status-server-icon-wrapper flex items-center justify-center shrink-0"
                  :class="statusBadgeClass(server.status)"
                >
                  <span class="text-xs font-medium">{{ statusLabel(server.status) }}</span>
                </div>
                <div class="flex flex-1 flex-col gap-1 min-w-0">
                  <h3 class="server-status-server-title truncate">{{ server.name }}</h3>
                  <div class="server-status-server-location flex items-center gap-1.5 text-sm text-slate-500">
                    <MapPin :size="14" class="text-slate-400 shrink-0" />
                    <span class="truncate">{{ server.ip || server.location || '-' }}</span>
                  </div>
                </div>
              </div>

              <!-- Uptime -->
              <div class="server-status-server-uptime">
                <Clock :size="14" class="text-slate-400 shrink-0" />
                <span>{{ server.uptime || `${90 + idx * 5}일 ${10 + idx * 2}시간` }}</span>
              </div>

              <!-- Resource Usage -->
              <div class="server-status-server-resources">
                <!-- CPU -->
                <div class="server-status-resource-item">
                  <div class="server-status-resource-header">
                    <Activity :size="16" class="shrink-0 text-blue-500" />
                    <span class="text-sm text-slate-600 flex-1">CPU</span>
                    <span class="text-sm font-semibold text-blue-600">{{ server.cpu }}%</span>
                  </div>
                  <div class="server-status-progress-bar">
                    <div
                      class="server-status-progress-fill bg-blue-500"
                      :style="{ width: `${server.cpu}%` }"
                    ></div>
                  </div>
                </div>

                <!-- Memory -->
                <div class="server-status-resource-item">
                  <div class="server-status-resource-header">
                    <Database :size="16" class="shrink-0 text-green-500" />
                    <span class="text-sm text-slate-600 flex-1">Memory</span>
                    <span class="text-sm font-semibold text-green-600">{{ server.memory }}%</span>
                  </div>
                  <div class="server-status-progress-bar">
                    <div
                      class="server-status-progress-fill bg-green-500"
                      :style="{ width: `${server.memory}%` }"
                    ></div>
                  </div>
                </div>

                <!-- Disk -->
                <div class="server-status-resource-item">
                  <div class="server-status-resource-header">
                    <HardDrive :size="16" class="shrink-0 text-orange-500" />
                    <span class="text-sm text-slate-600 flex-1">Disk</span>
                    <span class="text-sm font-semibold text-orange-600">{{ server.disk }}%</span>
                  </div>
                  <div class="server-status-progress-bar">
                    <div
                      class="server-status-progress-fill bg-orange-500"
                      :style="{ width: `${server.disk}%` }"
                    ></div>
                  </div>
                </div>

                <!-- Network -->
                <div class="server-status-resource-item">
                  <div class="server-status-resource-header">
                    <Wifi :size="16" class="shrink-0 text-purple-500" />
                    <span class="text-sm text-slate-600 flex-1">Network</span>
                    <span class="text-sm font-semibold text-purple-600">{{ server.network }}</span>
                  </div>
                  <div class="server-status-progress-bar">
                    <div
                      class="server-status-progress-fill bg-purple-500"
                      :style="{ width: `${getNetworkPercentage(server.network)}%` }"
                    ></div>
                  </div>
                </div>
              </div>

              <!-- 상세보기 버튼 -->
              <div class="mt-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  class="w-full px-3 py-2 text-sm rounded bg-sky-500 text-white hover:bg-sky-600 transition-colors"
                  @click="goToDetail(server)"
                >
                  상세보기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Activity, CheckCircle, AlertTriangle, Grid3x3, MapPin, Clock, Database, HardDrive, Wifi } from 'lucide-vue-next'
import { useVideoConversionServerInfoStore } from '../../stores/videoConversionServerInfo'
import { useMediaServerInfoStore } from '../../stores/mediaServerInfo'
import { useServerStatusUiStore } from '../../stores/serverStatusUi'
import { connect as prometheusSseConnect, disconnect as prometheusSseDisconnect } from '../../services/prometheusSse'

/** 상태: alive n → 중지, alive y + (cpu|mem|disk) 80% 이상 → 위험, 60% 이상 80% 미만 → 경고, 그 외 → 정상 */
export type ServerStatus = 'stopped' | 'normal' | 'warning' | 'danger'

interface Server {
  name: string
  location: string
  status: ServerStatus
  cpu: number
  memory: number
  disk: number
  network: string
  ip?: string
  uptime?: string
  serverType?: 'transcoding' | 'media'
  serverId?: string
}

function computeServerStatus(
  alive: string | null | undefined,
  cpu: number,
  memory: number,
  disk: number
): ServerStatus {
  const isAlive = (alive ?? '').toLowerCase() === 'y'
  if (!isAlive) return 'stopped'
  const max = Math.max(cpu, memory, disk)
  if (max >= 80) return 'danger'
  if (max >= 60) return 'warning'
  return 'normal'
}

function statusLabel(status: ServerStatus): string {
  switch (status) {
    case 'stopped': return '중지'
    case 'normal': return '정상'
    case 'warning': return '경고'
    case 'danger': return '위험'
    default: return '정상'
  }
}

function statusBadgeClass(status: ServerStatus): string {
  switch (status) {
    case 'stopped': return 'bg-slate-100 text-slate-600'
    case 'normal': return 'bg-green-50 text-green-700'
    case 'warning': return 'bg-orange-50 text-orange-700'
    case 'danger': return 'bg-red-50 text-red-700'
    default: return 'bg-slate-100 text-slate-600'
  }
}

function statusDotClass(status: ServerStatus): string {
  switch (status) {
    case 'stopped': return 'bg-slate-400'
    case 'normal': return 'bg-green-500'
    case 'warning': return 'bg-orange-500'
    case 'danger': return 'bg-red-500'
    default: return 'bg-slate-400'
  }
}

interface Props {
  serverFilter?: 'transcoding' | 'media'
  serverViewMode?: 'grid' | 'chart'
}

const props = withDefaults(defineProps<Props>(), {
  serverFilter: 'transcoding',
  serverViewMode: 'grid'
})

const router = useRouter()
const uiStore = useServerStatusUiStore()
const conversionServerStore = useVideoConversionServerInfoStore()
const mediaServerStore = useMediaServerInfoStore()

function goToDetail(server: Server) {
  if (!server.serverType || !server.serverId) return
  router.push({
    path: '/ServerStatusDetail',
    query: { type: server.serverType, id: server.serverId }
  })
}

/** Prometheus instant metrics per server IP (cpu/memory/disk %, network MB/s) — SSE로 수신 */
const metricsByIp = ref<Record<string, { cpu: number; memory: number; disk: number; networkMb: number }>>({})
/** IP별 alive (y/n) — SSE 주기 조회와 함께 수신 */
const aliveByIp = ref<Record<string, string>>({})

let clickOutsideHandler: ((e: MouseEvent) => void) | null = null
onMounted(async () => {
  await Promise.all([
    conversionServerStore.fetchVideoConversionServers(),
    mediaServerStore.fetchMediaServers()
  ])
  prometheusSseConnect((payload) => {
    metricsByIp.value = payload.metricsByIp ?? {}
    if (payload.aliveByIp != null) aliveByIp.value = payload.aliveByIp
  })
  clickOutsideHandler = (e: MouseEvent) => {
    const target = e.target as Node
    if (openFilterDropdown.value && !(target as Element).closest?.('.table-filter-button') && !(target as Element).closest?.('.table-filter-dropdown')) {
      openFilterDropdown.value = null
    }
  }
  document.addEventListener('click', clickOutsideHandler, true)
})

onUnmounted(() => {
  prometheusSseDisconnect()
  if (clickOutsideHandler) document.removeEventListener('click', clickOutsideHandler, true)
})

function formatNetworkMb(value: number): string {
  return `${Math.round(value)} MB/s`
}

const effectiveTranscodingServers = computed<Server[]>(() => {
  const items = conversionServerStore.items
  const metrics = metricsByIp.value
  const alive = aliveByIp.value
  if (!items.length) return []
  return items.map((s, idx) => {
    const ip = s.trans_ip || ''
    const m = ip ? metrics[ip] : undefined
    const cpu = m ? Math.round(m.cpu) : 0
    const memory = m ? Math.round(m.memory) : 0
    const disk = m ? Math.round(m.disk) : 0
    const aliveVal = ip ? (alive[ip] ?? s.alive ?? undefined) : (s.alive ?? undefined)
    const status = computeServerStatus(aliveVal, cpu, memory, disk)
    return {
      name: s.trans_name || s.trans_id || `변환-${String(idx + 1).padStart(2, '0')}`,
      location: s.trans_ip || '-',
      status,
      cpu,
      memory,
      disk,
      network: m ? formatNetworkMb(m.networkMb) : '0 MB/s',
      ip: s.trans_ip || undefined,
      uptime: `${30 + (idx % 200)}일 ${(idx % 24)}시간`,
      serverType: 'transcoding' as const,
      serverId: s.trans_id
    }
  })
})

const effectiveMediaServers = computed<Server[]>(() => {
  const items = mediaServerStore.items
  const metrics = metricsByIp.value
  const alive = aliveByIp.value
  if (!items.length) return []
  return items.map((s, idx) => {
    const ip = s.fms_ip || ''
    const m = ip ? metrics[ip] : undefined
    const cpu = m ? Math.round(m.cpu) : 0
    const memory = m ? Math.round(m.memory) : 0
    const disk = m ? Math.round(m.disk) : 0
    const aliveVal = ip ? (alive[ip] ?? s.alive ?? undefined) : (s.alive ?? undefined)
    const status = computeServerStatus(aliveVal, cpu, memory, disk)
    return {
      name: s.fms_name || s.fms_id || `미디어-${String(idx + 1).padStart(2, '0')}`,
      location: s.fms_ip || '-',
      status,
      cpu,
      memory,
      disk,
      network: m ? formatNetworkMb(m.networkMb) : '0 MB/s',
      ip: s.fms_ip || undefined,
      uptime: `${40 + (idx % 200)}일 ${(idx % 24)}시간`,
      serverType: 'media' as const,
      serverId: s.fms_id
    }
  })
})

const effectiveServerData = computed(() => {
  const trans = effectiveTranscodingServers.value
  const media = effectiveMediaServers.value
  return [...trans, ...media]
})

// 서버별 현황 탭/뷰 모드 사용 기록 유지 (탭 이동 후 상세보기 → 뒤로가기 시 복원)
const serverFilter = ref(uiStore.serverFilter || props.serverFilter)
const serverViewMode = ref(uiStore.serverViewMode || props.serverViewMode)
uiStore.setFilter(serverFilter.value)
uiStore.setViewMode(serverViewMode.value)

const normalCount = computed(() => effectiveServerData.value.filter(s => s.status === 'normal').length)
const warningCount = computed(() => effectiveServerData.value.filter(s => s.status === 'warning').length)
const dangerCount = computed(() => effectiveServerData.value.filter(s => s.status === 'danger').length)
const stoppedCount = computed(() => effectiveServerData.value.filter(s => s.status === 'stopped').length)
const totalServerCountForPct = computed(() => effectiveServerData.value.length)
const normalPercentage = computed(() => {
  const total = totalServerCountForPct.value
  return total ? ((normalCount.value / total) * 100).toFixed(1) : '0'
})
const warningPercentage = computed(() => {
  const total = totalServerCountForPct.value
  return total ? ((warningCount.value / total) * 100).toFixed(1) : '0'
})
const dangerPercentage = computed(() => {
  const total = totalServerCountForPct.value
  return total ? ((dangerCount.value / total) * 100).toFixed(1) : '0'
})
const stoppedPercentage = computed(() => {
  const total = totalServerCountForPct.value
  return total ? ((stoppedCount.value / total) * 100).toFixed(1) : '0'
})
const averageCpu = computed(() => {
  const metrics = metricsByIp.value
  const list = effectiveServerData.value.filter(s => s.ip && metrics[s.ip])
  return list.length ? Math.round(list.reduce((sum, s) => sum + s.cpu, 0) / list.length) : 0
})

const currentServers = computed(() => {
  return serverFilter.value === 'transcoding' ? effectiveTranscodingServers.value : effectiveMediaServers.value
})

// 테이블 컬럼 필터/정렬 (그리드 뷰)
const SERVER_TABLE_COLUMNS = [
  { id: 'name', label: '서버명' },
  { id: 'location', label: 'IP' },
  { id: 'status', label: '상태' },
  { id: 'cpu', label: 'CPU' },
  { id: 'memory', label: 'Memory' },
  { id: 'disk', label: 'Disk' },
  { id: 'network', label: 'Network' }
] as const
type ServerColumnId = (typeof SERVER_TABLE_COLUMNS)[number]['id']
const serverColumnFilters = ref<Record<string, { search: string }>>({})
const serverSort = ref<{ id: ServerColumnId; desc: boolean } | null>(null)
const openFilterDropdown = ref<string | null>(null)

function getServerCellValue(server: Server, columnId: string): string | number {
  switch (columnId) {
    case 'name': return server.name ?? ''
    case 'location': return server.location ?? ''
    case 'status': return statusLabel(server.status)
    case 'cpu': return server.cpu
    case 'memory': return server.memory
    case 'disk': return server.disk
    case 'network': return server.network ?? ''
    default: return ''
  }
}

const filteredAndSortedServers = computed(() => {
  let list = [...currentServers.value]
  Object.entries(serverColumnFilters.value).forEach(([columnId, filter]) => {
    if (!filter?.search?.trim()) return
    const term = filter.search.toLowerCase().trim()
    list = list.filter(s => String(getServerCellValue(s, columnId)).toLowerCase().includes(term))
  })
  const sort = serverSort.value
  if (sort) {
    const id = sort.id
    const desc = sort.desc
    const isNum = ['cpu', 'memory', 'disk'].includes(id)
    list.sort((a, b) => {
      const va = getServerCellValue(a, id)
      const vb = getServerCellValue(b, id)
      if (isNum && typeof va === 'number' && typeof vb === 'number') {
        return desc ? vb - va : va - vb
      }
      const sa = String(va)
      const sb = String(vb)
      const cmp = sa.localeCompare(sb)
      return desc ? -cmp : cmp
    })
  }
  return list
})

const totalServerCount = computed(() => currentServers.value.length)
const filteredServerCount = computed(() => filteredAndSortedServers.value.length)

function toggleFilterDropdown(columnId: string, e: Event) {
  e.stopPropagation()
  openFilterDropdown.value = openFilterDropdown.value === columnId ? null : columnId
}

function handleServerSort(columnId: string, direction: 'asc' | 'desc' | false) {
  if (direction === false) {
    serverSort.value = null
  } else {
    serverSort.value = { id: columnId as ServerColumnId, desc: direction === 'desc' }
  }
}

function setServerColumnSearch(columnId: string, value: string) {
  serverColumnFilters.value = {
    ...serverColumnFilters.value,
    [columnId]: { search: value }
  }
}

function clearServerFilter(columnId: string) {
  const next = { ...serverColumnFilters.value }
  next[columnId] = { search: '' }
  serverColumnFilters.value = next
  if (serverSort.value?.id === columnId) serverSort.value = null
}

function isColumnFiltered(columnId: string): boolean {
  return !!(serverColumnFilters.value[columnId]?.search?.trim()) || (serverSort.value?.id === columnId)
}

const handleServerFilterChange = (filter: 'transcoding' | 'media') => {
  serverFilter.value = filter
  uiStore.setFilter(filter)
}

const handleServerViewModeChange = (mode: 'grid' | 'chart') => {
  serverViewMode.value = mode
  uiStore.setViewMode(mode)
}

const getNetworkPercentage = (network: string): number => {
  // "140 MB/s" 형식에서 숫자 추출
  const match = network.match(/(\d+)/)
  if (match) {
    const value = parseInt(match[1])
    // 1000 MB/s 기준 비율 계산 (최대 50%로 제한)
    return Math.min((value / 1000) * 50, 50)
  }
  return 20
}
</script>
