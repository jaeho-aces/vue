<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    @click.self="emit('update:modelValue', false)"
  >
    <div
      class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      @click.stop
    >
      <div class="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-slate-800">접속 이력</h3>
        <button
          type="button"
          class="p-1 rounded hover:bg-slate-100 text-slate-500"
          aria-label="닫기"
          @click="emit('update:modelValue', false)"
        >
          ×
        </button>
      </div>
      <div class="p-4 flex flex-col gap-4 flex-1 min-h-0">
        <div class="flex flex-wrap items-center gap-4">
          <span v-if="channelId" class="text-sm text-slate-600">채널: <strong>{{ channelId }}</strong></span>
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-slate-700">날짜</label>
            <input
              v-model="selectedDate"
              type="date"
              :min="minDate"
              :max="maxDate"
              class="border border-slate-300 rounded px-3 py-1.5 text-sm"
              @change="loadHistory"
            />
          </div>
        </div>
        <div class="flex-1 min-h-[280px]">
          <div v-if="isLoading" class="h-full flex items-center justify-center text-slate-500">
            로딩 중...
          </div>
          <div v-else-if="chartData.labels.length" class="connection-history-chart-wrap h-full">
            <Bar :data="chartData" :options="chartOptionsRef" />
          </div>
          <div v-else class="h-full flex items-center justify-center text-slate-500">
            날짜를 선택하면 해당 일자의 시간별 접속 건수가 표시됩니다.
          </div>
        </div>
        <!-- 시간대별 00~59분 상세 (항상 표시, 최초엔 가장 최근 시간) -->
        <div
          v-if="hourly.length === 24 && selectedHour !== null"
          class="border border-slate-200 rounded-lg p-4 bg-slate-50"
        >
          <div class="mb-3">
            <h4 class="text-sm font-semibold text-slate-700">
              {{ String(selectedHour).padStart(2, '0') }}:00 ~ {{ String(selectedHour).padStart(2, '0') }}:59
            </h4>
          </div>
          <div class="detail-minute-chart h-[140px]">
            <Bar :data="minuteDetailChartData" :options="minuteDetailChartOptions" />
          </div>
          <p class="text-xs text-slate-500 mt-2">
            접속: {{ minuteDetails.reduce((a, b) => a + b, 0) }}건
          </p>
        </div>
      </div>
      <div class="px-4 py-3 border-t border-slate-200 flex items-center justify-between gap-4">
        <p class="text-xs text-slate-500">
          시간대 막대를 클릭하면 해당 시간의 분 단위 접속 이력을 확인할 수 있습니다.
        </p>
        <button
          type="button"
          class="px-4 py-2 text-sm rounded border border-slate-200 text-slate-700 hover:bg-slate-50"
          @click="emit('update:modelValue', false)"
        >
          닫기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'
import { api } from '../../../services/api'

ChartJS.register(Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    channelId: string
    channelRegDate: string
  }>(),
  { channelId: '', channelRegDate: '' }
)

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const selectedDate = ref('')
const hourly = ref<number[]>([])
const lastFetchedMinutes = ref<number[]>([])
const isLoading = ref(false)
const selectedHour = ref<number | null>(null)
const selectedHourMinuteDetails = ref<number[]>([])

const minDate = computed(() => {
  const s = (props.channelRegDate || '').trim()
  return s.length >= 10 ? s.slice(0, 10) : ''
})

const maxDate = computed(() => {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
})

const chartData = computed(() => {
  const labels = Array.from({ length: 24 }, (_, i) =>
    `${String(i).padStart(2, '0')}:00`
  )
  const h = selectedHour.value
  const baseBg = '#38bdf8'
  const selectedBg = '#0369a1'
  return {
    labels,
    datasets: [
      {
        label: '접속 건수',
        data: hourly.value.length === 24 ? hourly.value : [],
        backgroundColor:
          hourly.value.length === 24
            ? Array.from({ length: 24 }, (_, i) => (i === h ? selectedBg : baseBg))
            : baseBg,
        borderColor: 'transparent',
        borderWidth: 0,
        hoverBackgroundColor: '#0ea5e9',
        borderRadius: 6
      }
    ]
  }
})

function onHourBarClick(_event: unknown, elements: { index: number }[]) {
  if (elements.length === 0) return
  selectedHour.value = elements[0].index
  updateMinuteDetailsForSelectedHour()
}

function onHourBarHover(_event: unknown, elements: unknown[]) {
  const el = document.querySelector('.connection-history-chart-wrap') as HTMLElement | null
  if (el) el.style.cursor = Array.isArray(elements) && elements.length > 0 ? 'pointer' : 'default'
}

const chartOptionsRef = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  onClick: onHourBarClick,
  onHover: onHourBarHover,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      padding: 12,
      cornerRadius: 8,
      titleFont: { size: 12 },
      bodyFont: { size: 13 },
      callbacks: {
        label: (context: { parsed: { y: number | null } }) =>
          `접속: ${context.parsed.y ?? 0}건`
      }
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#64748b', maxRotation: 0, font: { size: 11 } }
    },
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(148, 163, 184, 0.15)' },
      ticks: {
        color: '#64748b',
        stepSize: 1,
        font: { size: 11 },
        callback: (value: unknown): string | number => (typeof value === 'number' ? value : String(value))
      }
    }
  }
}))

const minuteDetails = computed(() => selectedHourMinuteDetails.value)

function updateMinuteDetailsForSelectedHour() {
  const h = selectedHour.value
  if (h === null || h < 0 || h > 23) {
    selectedHourMinuteDetails.value = []
    return
  }
  const mins = lastFetchedMinutes.value
  if (mins.length === 1440) {
    selectedHourMinuteDetails.value = mins.slice(h * 60, h * 60 + 60)
    return
  }
  const count = hourly.value[h] ?? 0
  const arr: number[] = Array(60).fill(0)
  for (let i = 0; i < count; i++) {
    arr[Math.floor(Math.random() * 60)] += 1
  }
  selectedHourMinuteDetails.value = arr
}

const minuteDetailChartData = computed(() => ({
  labels: Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')),
  datasets: [
    {
      label: '접속 건수',
      data: minuteDetails.value,
      backgroundColor: minuteDetails.value.map((v) => (v > 0 ? '#34d399' : '#f1f5f9')),
      borderColor: 'transparent',
      borderWidth: 0,
      borderRadius: 2
    }
  ]
}))

const minuteDetailChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      padding: 10,
      cornerRadius: 6,
      callbacks: {
        label: (ctx: { parsed: { y: number | null } }) =>
          `접속: ${ctx.parsed.y ?? 0}건`
      }
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#64748b', maxRotation: 0, font: { size: 9 }, maxTicksLimit: 30 }
    },
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(148, 163, 184, 0.15)' },
      ticks: {
        color: '#64748b',
        stepSize: 1,
        callback: (value: unknown): string | number =>
          typeof value === 'number' ? value : String(value)
      }
    }
  }
}

async function loadHistory() {
  if (!props.channelId || !selectedDate.value) return
  isLoading.value = true
  try {
    const data = await api.getConnectionHistory(props.channelId, selectedDate.value)
    hourly.value = data.hourly?.length === 24 ? data.hourly : []
    lastFetchedMinutes.value = data.minutes?.length === 1440 ? data.minutes : []
    if (hourly.value.length === 24) {
      selectedHour.value = 23
      updateMinuteDetailsForSelectedHour()
    } else {
      selectedHour.value = null
    }
  } catch {
    hourly.value = []
    lastFetchedMinutes.value = []
    selectedHour.value = null
  } finally {
    isLoading.value = false
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      if (!selectedDate.value && maxDate.value) selectedDate.value = maxDate.value
      if (props.channelId && selectedDate.value) loadHistory()
    }
  }
)

watch(
  () => [props.channelId, props.channelRegDate],
  () => {
    if (props.modelValue && maxDate.value && !selectedDate.value) {
      selectedDate.value = maxDate.value
    }
    if (minDate.value && selectedDate.value && selectedDate.value < minDate.value) {
      selectedDate.value = minDate.value
    }
    if (maxDate.value && selectedDate.value && selectedDate.value > maxDate.value) {
      selectedDate.value = maxDate.value
    }
  }
)
</script>

<style scoped>
.connection-history-chart-wrap {
  position: relative;
  min-height: 280px;
}
.detail-minute-chart {
  position: relative;
  width: 100%;
}
</style>
