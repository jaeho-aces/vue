<template>
  <div class="flex-1 flex flex-col gap-4 min-h-0">
    <!-- 상단: 뒤로가기 버튼 + 제목 -->
    <div class="flex items-center gap-4 shrink-0">
      <button
        type="button"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium shadow-sm hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 transition-colors"
        @click="goBack"
      >
        <ChevronLeft :size="20" />
        <span>서버별 현황</span>
      </button>
      <h1 class="text-lg font-semibold text-slate-800 truncate">
        {{ pageTitle }}
      </h1>
    </div>

    <!-- 서버 없음 -->
    <div v-if="notFound" class="flex-1 flex flex-col items-center justify-center gap-4 text-slate-500">
      <AlertCircle :size="48" class="text-slate-300" />
      <p class="text-sm">서버를 찾을 수 없습니다.</p>
      <button
        type="button"
        class="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium"
        @click="goBack"
      >
        목록으로
      </button>
    </div>

    <template v-else>
      <!-- 상단: 서버 정보 테이블 (변환/분배·미디어 공통 3열 2행) -->
      <div class="shrink-0 bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table class="w-full text-sm">
          <tbody class="divide-y divide-slate-100">
            <tr class="divide-x divide-slate-100">
              <td class="py-3 px-4 align-top w-1/3">
                <div class="text-slate-500 font-medium mb-0.5">서버 유형</div>
                <span class="text-slate-800">{{ serverTypeLabel }}</span>
              </td>
              <td class="py-3 px-4 align-top w-1/3">
                <div class="text-slate-500 font-medium mb-0.5">IP</div>
                <span class="text-slate-800">{{ serverIp }}</span>
              </td>
              <td class="py-3 px-4 align-top">
                <div class="text-slate-500 font-medium mb-0.5">Port</div>
                <span class="text-slate-800">{{ serverPort || '-' }}</span>
              </td>
            </tr>
            <tr class="divide-x divide-slate-100">
              <td class="py-3 px-4 align-top w-1/3">
                <div class="text-slate-500 font-medium mb-0.5">상태</div>
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                  :class="serverStatusClass"
                >
                  <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="serverStatusDotClass"></span>
                  {{ serverStatusText }}
                </span>
              </td>
              <td class="py-3 px-4 align-top w-1/3">
                <div class="text-slate-500 font-medium mb-0.5">
                  {{ serverType === 'transcoding' ? '버전' : '서버 종류' }}
                </div>
                <span class="text-slate-800">
                  {{
                    serverType === 'transcoding'
                      ? (transcodingServer?.version || '-')
                      : (mediaServerTypeName || '-')
                  }}
                </span>
              </td>
              <td class="py-3 px-4 align-top">
                <div class="text-slate-500 font-medium mb-0.5">
                  {{ serverType === 'transcoding' ? '등록일자' : '' }}
                </div>
                <span class="text-slate-800">
                  {{ serverType === 'transcoding' ? (serverRegDateFormatted || '-') : '' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 날짜·범위 선택 + 시간선 차트 2x2 -->
      <div class="flex-1 min-h-0 flex flex-col gap-4 overflow-hidden">
        <div class="shrink-0 flex flex-wrap items-center gap-4">
          <p v-if="chartLoading" class="text-sm text-slate-500">차트 데이터 로딩 중...</p>
          <div class="flex items-center gap-2">
            <label for="chart-date" class="text-sm font-medium text-slate-600">날짜</label>
            <input
              id="chart-date"
              v-model="chartDate"
              type="date"
              :min="chartDateMin"
              :max="chartDateMax"
              class="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white"
            />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-slate-600">범위</span>
            <select
              v-model="chartRangeHours"
              class="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white min-w-[100px]"
            >
              <option v-for="opt in rangeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
        </div>

        <div class="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-auto">
          <div class="bg-white rounded-xl border border-slate-200 p-4 flex flex-col min-h-[220px]">
            <div class="flex items-center justify-between gap-2 mb-2 shrink-0">
              <div class="flex items-center gap-2">
                <Activity :size="18" class="text-blue-500 shrink-0" />
                <span class="text-sm font-medium text-slate-700">CPU (%)</span>
              </div>
              <span v-if="latestCpu != null" class="text-sm font-semibold text-slate-800">{{ formatChartValue(latestCpu, 1) }}%</span>
            </div>
            <div class="h-[180px] w-full relative">
              <AreaChart
                :data="chartDataCpu"
                color="#3b82f6"
                label="CPU"
                :min="0"
                :max="100"
                :show-y-axis="true"
                :value-decimals="1"
                value-suffix="%"
              />
            </div>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 p-4 flex flex-col min-h-[220px]">
            <div class="flex items-center justify-between gap-2 mb-2 shrink-0">
              <div class="flex items-center gap-2">
                <Database :size="18" class="text-green-500 shrink-0" />
                <span class="text-sm font-medium text-slate-700">Memory (%)</span>
              </div>
              <span v-if="latestMemoryText != null" class="text-sm font-semibold text-slate-800">{{ latestMemoryText }}</span>
            </div>
            <div class="h-[180px] w-full relative">
              <AreaChart
                :data="chartDataMemory"
                color="#22c55e"
                label="Memory"
                :min="0"
                :max="100"
                :show-y-axis="true"
                :value-decimals="1"
                value-suffix="%"
              />
            </div>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 p-4 flex flex-col min-h-[220px]">
            <div class="flex items-center justify-between gap-2 mb-2 shrink-0">
              <div class="flex items-center gap-2">
                <HardDrive :size="18" class="text-orange-500 shrink-0" />
                <span class="text-sm font-medium text-slate-700">Disk (%)</span>
              </div>
              <span v-if="latestDiskText != null" class="text-sm font-semibold text-slate-800">{{ latestDiskText }}</span>
            </div>
            <div class="h-[180px] w-full relative">
              <AreaChart
                :data="chartDataDisk"
                color="#f97316"
                label="Disk"
                :min="0"
                :max="100"
                :show-y-axis="true"
                :value-decimals="1"
                value-suffix="%"
              />
            </div>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 p-4 flex flex-col min-h-[220px]">
            <div class="flex items-center justify-between gap-2 mb-2 shrink-0">
              <div class="flex items-center gap-2">
                <Wifi :size="18" class="text-purple-500 shrink-0" />
                <span class="text-sm font-medium text-slate-700">Network (MB/s)</span>
              </div>
              <span v-if="latestNetwork != null" class="text-sm font-semibold text-slate-800">{{ formatChartValue(latestNetwork, 1) }} MB/s</span>
            </div>
            <div class="h-[180px] w-full relative">
              <AreaChart
                :data="chartDataNetwork"
                color="#a855f7"
                label="수신"
                :show-y-axis="true"
                :value-decimals="1"
                value-suffix=" MB/s"
                :data2="chartDataNetworkTransmit"
                label2="송신"
                color2="#e879f9"
                value-suffix2=" MB/s"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeft, AlertCircle, Activity, Database, HardDrive, Wifi } from 'lucide-vue-next'
import AreaChart from '../common/AreaChart.vue'
import { useVideoConversionServerInfoStore } from '../../stores/videoConversionServerInfo'
import { useMediaServerInfoStore } from '../../stores/mediaServerInfo'
import { useCommonCodeStore } from '../../stores/commonCode'
import type { VideoConversionServer } from '../../stores/videoConversionServerInfo'
import type { MediaServer } from '../../stores/mediaServerInfo'
import type { ChartPoint } from '../../services/prometheus'
import * as prometheusSse from '../../services/prometheusSse'
import { prometheusChartStep } from '../../config/prometheus'

const route = useRoute()
const router = useRouter()
const conversionServerStore = useVideoConversionServerInfoStore()
const mediaServerStore = useMediaServerInfoStore()
const commonCodeStore = useCommonCodeStore()

const serverType = computed(() => (route.query.type as string) || '')
const serverId = computed(() => (route.query.id as string) || '')

const transcodingServer = computed<VideoConversionServer | null>(() =>
  serverId.value && serverType.value === 'transcoding'
    ? conversionServerStore.getById(serverId.value) ?? null
    : null
)
const mediaServer = computed<MediaServer | null>(() =>
  serverId.value && serverType.value === 'media'
    ? mediaServerStore.getById(serverId.value) ?? null
    : null
)

const notFound = computed(
  () =>
    !serverType.value ||
    !serverId.value ||
    (serverType.value === 'transcoding' && !transcodingServer.value) ||
    (serverType.value === 'media' && !mediaServer.value)
)

const pageTitle = computed(() => {
  if (transcodingServer.value) return transcodingServer.value.trans_name || transcodingServer.value.trans_id
  if (mediaServer.value) return mediaServer.value.fms_name || mediaServer.value.fms_id
  return '서버 상세'
})

const serverTypeLabel = computed(() =>
  serverType.value === 'transcoding' ? '변환/분배 서버' : serverType.value === 'media' ? '미디어 서버' : ''
)

const serverStatusText = computed(() => {
  const alive = transcodingServer.value?.alive ?? mediaServer.value?.alive
  return (alive ?? '').toLowerCase() === 'y' ? '정상' : '경고'
})

const serverStatusClass = computed(() =>
  serverStatusText.value === '정상' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'
)

const serverStatusDotClass = computed(() =>
  serverStatusText.value === '정상' ? 'bg-green-500' : 'bg-orange-500'
)

const serverIp = computed(() => transcodingServer.value?.trans_ip ?? mediaServer.value?.fms_ip ?? '-')

/** 차트 데이터의 마지막 포인트(현재값) 표시용 */
const latestCpu = computed(() => {
  const d = chartDataCpu.value
  return d.length ? d[d.length - 1].value : null
})
const latestNetwork = computed(() => {
  const d = chartDataNetwork.value
  return d.length ? d[d.length - 1].value : null
})
/** Memory/Disk 카드 헤더: usedGb 있으면 "12GB(38%)", 없으면 "38%" */
const latestMemoryText = computed(() => {
  const d = chartDataMemory.value
  if (!d.length) return null
  const last = d[d.length - 1]
  const pct = formatChartValue(last.value, 1)
  if (last.usedGb != null) return `${formatChartValue(last.usedGb, 1)}GB(${pct}%)`
  return `${pct}%`
})
const latestDiskText = computed(() => {
  const d = chartDataDisk.value
  if (!d.length) return null
  const last = d[d.length - 1]
  const pct = formatChartValue(last.value, 1)
  if (last.usedGb != null) return `${formatChartValue(last.usedGb, 1)}GB(${pct}%)`
  return `${pct}%`
})
function formatChartValue(v: number, decimals: number): string {
  return Number(v).toFixed(decimals)
}

const serverPort = computed(() =>
  transcodingServer.value?.trans_port != null
    ? String(transcodingServer.value.trans_port)
    : mediaServer.value?.fms_port != null
      ? String(mediaServer.value.fms_port)
      : ''
)

const mediaServerTypeName = computed(() => {
  const code = mediaServer.value?.svr_type
  if (!code) return ''
  // 장치관리 > 미디어 서버와 동일: 공통코드 grp_gbn='C', grp_code='11'
  return commonCodeStore.getCodeName('C', '11', String(code)) || code
})

// 변환/분배 서버 시작일: YYYY년 MM월 DD일 (년월일만 표시)
function formatStartDate(raw: string | null | undefined): string {
  if (!raw || !raw.trim()) return ''
  const s = raw.trim()
  const datePart = s.split(/\s|T/)[0] || ''
  const [y, m, day] = datePart.split('-')
  if (!y || !m || !day) return ''
  const month = m.padStart(2, '0')
  const dayPadded = day.padStart(2, '0')
  return `${y}년 ${month}월 ${dayPadded}일`
}
// 날짜 입력용 min (등록일자): "YYYY-MM-DD" — 등록일자 ~ 오늘만 선택 가능
const chartDateMin = computed(() => {
  if (serverType.value !== 'transcoding' || !transcodingServer.value?.reg_date) return ''
  const datePart = String(transcodingServer.value.reg_date).trim().split(/\s|T/)[0] || ''
  const [y, m, day] = datePart.split('-')
  if (!y || !m || !day) return ''
  return `${y}-${m.padStart(2, '0')}-${day.padStart(2, '0')}`
})
const chartDateMax = computed(() => todayString())
const serverRegDateFormatted = computed(() => {
  if (serverType.value !== 'transcoding' || !transcodingServer.value?.reg_date) return ''
  return formatStartDate(transcodingServer.value.reg_date)
})

// 날짜·범위 선택 (최소 1시간)
function todayString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const chartDate = ref(todayString())
const chartRangeHours = ref(1)
const rangeOptions = [
  { value: 1, label: '1시간' },
  { value: 3, label: '3시간' },
  { value: 6, label: '6시간' },
  { value: 12, label: '12시간' },
  { value: 24, label: '24시간' }
]

const chartDataCpu = ref<ChartPoint[]>([])
const chartDataMemory = ref<ChartPoint[]>([])
const chartDataDisk = ref<ChartPoint[]>([])
const chartDataNetwork = ref<ChartPoint[]>([])
const chartDataNetworkTransmit = ref<ChartPoint[]>([])
const chartLoading = ref(false)
const liveRefreshTick = ref(0)
let liveRefreshTimer: number | null = null

function getChartTimeRange(): { start: Date; end: Date } {
  const today = todayString()
  const endDate =
    chartDate.value === today
      ? new Date()
      : new Date(`${chartDate.value}T23:59:59`)
  const hours = Math.max(1, chartRangeHours.value)
  const startDate = new Date(endDate.getTime() - hours * 60 * 60 * 1000)
  return { start: startDate, end: endDate }
}

function connectChartSse() {
  const ip = serverIp.value
  if (!ip || ip === '-') {
    chartDataCpu.value = []
    chartDataMemory.value = []
    chartDataDisk.value = []
    chartDataNetwork.value = []
    chartDataNetworkTransmit.value = []
    chartLoading.value = false
    return
  }
  const { start, end } = getChartTimeRange()
  const startStr = start.toISOString()
  const endStr = end.toISOString()
  const step = prometheusChartStep
  chartLoading.value = true
  prometheusSse.connect((data) => {
    if (data.type === 'detail' && data.rangeChart) {
      chartDataCpu.value = data.rangeChart.cpu ?? []
      chartDataMemory.value = data.rangeChart.memory ?? []
      chartDataDisk.value = data.rangeChart.disk ?? []
      chartDataNetwork.value = data.rangeChart.network ?? []
      chartDataNetworkTransmit.value = data.rangeChart.networkTransmit ?? []
      chartLoading.value = false
    }
  }, { ip, start: startStr, end: endStr, step })
}

watch(
  [serverIp, chartDate, chartRangeHours, liveRefreshTick],
  () => {
    if (notFound.value) return
    prometheusSse.disconnect()
    connectChartSse()
  },
  { immediate: false }
)

function goBack() {
  // 이전 페이지(대부분 서버별 현황)의 선택 상태/뷰 모드를 그대로 복원하기 위해 history back 사용
  router.back()
}

onMounted(async () => {
  await Promise.all([
    conversionServerStore.fetchVideoConversionServers(),
    mediaServerStore.fetchMediaServers()
  ])
  liveRefreshTimer = window.setInterval(() => {
    if (chartDate.value === todayString() && !notFound.value) {
      liveRefreshTick.value += 1
    }
  }, 60 * 1000)
  if (!notFound.value) connectChartSse()
})

onUnmounted(() => {
  if (liveRefreshTimer != null) {
    window.clearInterval(liveRefreshTimer)
    liveRefreshTimer = null
  }
  prometheusSse.disconnect()
})
</script>
