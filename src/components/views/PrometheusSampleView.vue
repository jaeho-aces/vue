<template>
  <div class="flex flex-col h-full overflow-hidden">
    <div class="flex justify-between items-center py-5 border-b border-gray-200 mb-5">
      <h1 class="text-2xl font-semibold text-gray-900 m-0">프로메테우스 모니터링 대시보드</h1>
      <div class="flex items-center gap-3">
        <div
          :class="[
            'flex items-center gap-2 px-3 py-2 rounded-md text-sm',
            isConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
          ]"
        >
          <span class="prometheus-status-dot"></span>
          <span>{{ isConnected ? '연결됨' : '연결 끊김' }}</span>
        </div>
        <button
          v-if="!isConnected"
          @click="connect"
          class="px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition bg-blue-500 text-white hover:bg-blue-600"
        >
          재연결
        </button>
        <button
          v-if="isConnected"
          @click="disconnect"
          class="px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition bg-red-500 text-white hover:bg-red-600"
        >
          연결 끊기
        </button>
      </div>
    </div>

    <div class="flex-1 flex flex-col overflow-hidden gap-5">
      <!-- 탭 메뉴 -->
      <div class="flex gap-2 border-b border-gray-200">
        <button
          :class="[
            'py-3 px-6 border-none bg-transparent text-sm font-medium cursor-pointer border-b-2 -mb-px transition',
            viewMode === 'chart'
              ? 'text-gray-900 border-blue-500 font-semibold'
              : 'text-gray-500 border-transparent hover:text-gray-900 hover:bg-gray-100'
          ]"
          @click="viewMode = 'chart'"
        >
          차트
        </button>
        <button
          :class="[
            'py-3 px-6 border-none bg-transparent text-sm font-medium cursor-pointer border-b-2 -mb-px transition',
            viewMode === 'structured'
              ? 'text-gray-900 border-blue-500 font-semibold'
              : 'text-gray-500 border-transparent hover:text-gray-900 hover:bg-gray-100'
          ]"
          @click="viewMode = 'structured'"
        >
          구조화
        </button>
        <button
          :class="[
            'py-3 px-6 border-none bg-transparent text-sm font-medium cursor-pointer border-b-2 -mb-px transition',
            viewMode === 'json'
              ? 'text-gray-900 border-blue-500 font-semibold'
              : 'text-gray-500 border-transparent hover:text-gray-900 hover:bg-gray-100'
          ]"
          @click="viewMode = 'json'"
        >
          JSON
        </button>
      </div>

      <!-- 차트 뷰 -->
      <div v-if="viewMode === 'chart'" class="grid grid-cols-2 gap-5 flex-1 min-h-0">
        <div class="bg-white border border-gray-200 rounded-lg p-5 flex flex-col min-h-0">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-base font-semibold text-gray-900 m-0">CPU Idle 시간</h3>
            <div class="flex items-baseline gap-1">
              <span class="text-xl font-bold text-gray-900 font-mono">{{ currentValues.cpu.toFixed(2) }}초</span>
            </div>
          </div>
          <div class="flex-1 min-h-[200px] relative">
            <AreaChart
              :data="chartData.cpu"
              color="#3b82f6"
              label="CPU Idle 시간 (초)"
            />
          </div>
        </div>

        <div class="bg-white border border-gray-200 rounded-lg p-5 flex flex-col min-h-0">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-base font-semibold text-gray-900 m-0">Memory 사용률</h3>
            <div class="flex items-baseline gap-1">
              <span class="text-xl font-bold text-gray-900 font-mono">{{ Math.max(0, Math.min(100, currentValues.memory)).toFixed(1) }}%</span>
            </div>
          </div>
          <div class="flex-1 min-h-[200px] relative">
            <AreaChart
              :data="chartData.memory"
              color="#10b981"
              label="Memory 사용률 (%)"
              :min="0"
              :max="100"
            />
          </div>
        </div>

        <div class="bg-white border border-gray-200 rounded-lg p-5 flex flex-col min-h-0">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-base font-semibold text-gray-900 m-0">Network 수신</h3>
            <div class="flex items-baseline gap-1">
              <span class="text-xl font-bold text-gray-900 font-mono">{{ formatNetworkValue(currentValues.networkReceive) }}</span>
            </div>
          </div>
          <div class="flex-1 min-h-[200px] relative">
            <AreaChart
              :data="chartData.networkReceive"
              color="#f59e0b"
              label="수신 속도 (bytes/s)"
            />
          </div>
        </div>

        <div class="bg-white border border-gray-200 rounded-lg p-5 flex flex-col min-h-0">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-base font-semibold text-gray-900 m-0">Network 송신</h3>
            <div class="flex items-baseline gap-1">
              <span class="text-xl font-bold text-gray-900 font-mono">{{ formatNetworkValue(currentValues.networkTransmit) }}</span>
            </div>
          </div>
          <div class="flex-1 min-h-[200px] relative">
            <AreaChart
              :data="chartData.networkTransmit"
              color="#ef4444"
              label="송신 속도 (bytes/s)"
            />
          </div>
        </div>
      </div>

      <!-- 구조화 뷰 -->
      <div v-if="viewMode === 'structured'" class="flex-1 overflow-hidden flex flex-col">
        <div
          class="flex-1 overflow-y-auto p-5 grid gap-5 prometheus-metrics-grid"
          style="grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));"
        >
          <div
            v-for="(queryResult, queryName) in latestQueries"
            :key="queryName"
            class="bg-white border rounded-lg p-5 transition hover:shadow-md"
            :class="queryResult.status === 'error' ? 'border-red-500 bg-red-50' : 'border-gray-200'"
          >
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-base font-semibold text-gray-900 m-0">{{ getMetricDisplayName(String(queryName)) }}</h3>
              <span
                :class="[
                  'px-2 py-1 rounded text-xs font-medium',
                  queryResult.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                ]"
              >
                {{ queryResult.status === 'success' ? '정상' : '오류' }}
              </span>
            </div>
            <div class="text-[13px] text-gray-500 mb-4 leading-relaxed">
              {{ getMetricDescription(String(queryName)) }}
            </div>

            <div v-if="queryResult.status === 'success' && queryResult.data" class="mt-3">
              <div v-if="queryResult.data.result && queryResult.data.result.length > 0">
                <div
                  v-for="(result, index) in queryResult.data.result"
                  :key="index"
                  class="p-3 bg-gray-50 rounded-md mb-3 last:mb-0"
                >
                  <div v-if="result.metric && Object.keys(result.metric).length > 0" class="mb-2 pb-2 border-b border-gray-200">
                    <div
                      v-for="(value, key) in result.metric"
                      :key="key"
                      class="flex gap-2 mb-1 text-xs"
                    >
                      <span class="font-semibold text-gray-500 min-w-[100px]">{{ key }}:</span>
                      <span class="text-gray-900 font-mono">{{ value }}</span>
                    </div>
                  </div>
                  <div class="flex items-baseline gap-2 mb-2">
                    <span class="text-[13px] font-semibold text-gray-500">값:</span>
                    <span class="text-lg font-bold text-gray-900 font-mono">{{ formatValue(result.value?.[1]) }}</span>
                    <span class="text-xs text-gray-500">{{ getValueUnit(String(queryName), result.value?.[1]) }}</span>
                  </div>
                  <div v-if="result.value?.[0]" class="text-[11px] text-gray-500 mt-1">
                    타임스탬프: {{ formatTimestamp(result.value[0]) }}
                  </div>
                </div>
              </div>
              <div v-else class="p-3 bg-amber-100 rounded-md text-amber-800 text-[13px] text-center">
                데이터 없음 (메트릭이 수집되지 않음)
              </div>
            </div>

            <div v-else-if="queryResult.status === 'error'" class="p-3 bg-red-100 rounded-md">
              <div class="text-red-800 text-[13px] mb-2">
                <strong>오류:</strong> {{ queryResult.error || '알 수 없는 오류' }}
              </div>
              <div v-if="queryResult.errorType" class="text-[11px] text-red-700 italic">
                오류 타입: {{ queryResult.errorType }}
              </div>
            </div>
          </div>

          <div v-if="Object.keys(latestQueries).length === 0" class="flex items-center justify-center h-full text-gray-500 text-sm">
            데이터가 없습니다. SSE 연결을 확인하세요.
          </div>
        </div>
      </div>

      <!-- JSON 뷰 -->
      <div v-if="viewMode === 'json'" class="flex-1 flex flex-col overflow-hidden bg-gray-50 rounded-lg p-5">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-base font-semibold text-gray-900 m-0">원본 JSON 데이터</h3>
          <span v-if="latestData" class="text-sm text-gray-500">
            마지막 업데이트: {{ formatTimestamp(latestData.timestamp) }}
          </span>
        </div>
        <div class="flex-1 overflow-y-auto bg-white rounded p-4 prometheus-json-content">
          <pre class="m-0 text-xs font-mono text-gray-900 whitespace-pre-wrap break-words">{{ JSON.stringify(latestData, null, 2) }}</pre>
          <div v-if="!latestData" class="flex items-center justify-center h-full text-gray-500 text-sm">
            데이터가 없습니다. SSE 연결을 확인하세요.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import AreaChart from '../common/AreaChart.vue'
import { api } from '../../services/api'

interface ChartDataPoint {
  time: string
  value: number
}

interface ChartData {
  cpu: ChartDataPoint[]
  memory: ChartDataPoint[]
  networkReceive: ChartDataPoint[]
  networkTransmit: ChartDataPoint[]
}

interface CurrentValues {
  cpu: number
  memory: number
  networkReceive: number
  networkTransmit: number
}

const isConnected = ref(false)
const viewMode = ref<'chart' | 'structured' | 'json'>('chart')
const latestData = ref<any>(null)
const dataLog = ref<Array<{ timestamp: number; data: any }>>([])
let eventSource: EventSource | null = null

// 차트 데이터
const chartData = reactive<ChartData>({
  cpu: [],
  memory: [],
  networkReceive: [],
  networkTransmit: []
})

// 현재 값
const currentValues = reactive<CurrentValues>({
  cpu: 0,
  memory: 0,
  networkReceive: 0,
  networkTransmit: 0
})

// 초기 데이터 로드 (최근 5분)
const loadInitialData = async () => {
  try {
    const response = await api.get('/api/prometheus/initial-data')
    const data = response.data
    
    if (data.status === 'success' && data.metrics) {
      // 각 메트릭의 Range Query 결과를 차트 데이터로 변환
      processRangeData(data.metrics)
    }
  } catch (error) {
    console.error('초기 데이터 로드 실패:', error)
  }
}

// Range Query 데이터 처리
const processRangeData = (metrics: any) => {
  // CPU Idle 시간
  if (metrics.cpu_usage?.status === 'success' && metrics.cpu_usage?.data?.result) {
    const result = metrics.cpu_usage.data.result[0]
    if (result?.values) {
      chartData.cpu = result.values.map(([timestamp, value]: [number, string]) => {
        const cpuValue = parseFloat(value) || 0
        return {
          time: formatTime(timestamp),
          value: cpuValue
        }
      })
      if (chartData.cpu.length > 0) {
        currentValues.cpu = chartData.cpu[chartData.cpu.length - 1].value
      }
    }
  }

  // Memory 사용률
  if (metrics.memory_usage?.status === 'success' && metrics.memory_usage?.data?.result) {
    const result = metrics.memory_usage.data.result[0]
    if (result?.values) {
      chartData.memory = result.values.map(([timestamp, value]: [number, string]) => {
        let memValue = parseFloat(value) || 0
        // 0~100 범위로 제한
        memValue = Math.max(0, Math.min(100, memValue))
        return {
          time: formatTime(timestamp),
          value: memValue
        }
      })
      if (chartData.memory.length > 0) {
        currentValues.memory = chartData.memory[chartData.memory.length - 1].value
      }
    }
  }

  // Network 수신
  if (metrics.network_receive?.status === 'success' && metrics.network_receive?.data?.result) {
    const result = metrics.network_receive.data.result[0]
    if (result?.values) {
      chartData.networkReceive = result.values.map(([timestamp, value]: [number, string]) => ({
        time: formatTime(timestamp),
        value: parseFloat(value) || 0
      }))
      if (chartData.networkReceive.length > 0) {
        currentValues.networkReceive = chartData.networkReceive[chartData.networkReceive.length - 1].value
      }
    }
  }

  // Network 송신
  if (metrics.network_transmit?.status === 'success' && metrics.network_transmit?.data?.result) {
    const result = metrics.network_transmit.data.result[0]
    if (result?.values) {
      chartData.networkTransmit = result.values.map(([timestamp, value]: [number, string]) => ({
        time: formatTime(timestamp),
        value: parseFloat(value) || 0
      }))
      if (chartData.networkTransmit.length > 0) {
        currentValues.networkTransmit = chartData.networkTransmit[chartData.networkTransmit.length - 1].value
      }
    }
  }
}

// SSE 데이터 처리
const processSSEData = (data: any) => {
  if (!data.queries) return

  const now = new Date()
  const timeStr = formatTime(now.getTime() / 1000)

  // 쿼리 결과를 메트릭 이름으로 매핑
  const queryMap: Record<string, string> = {
    'node_cpu_seconds_total{mode="idle"}': 'cpu',
    '(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100': 'memory',
    'rate(node_network_receive_bytes_total[1m])': 'networkReceive',
    'rate(node_network_transmit_bytes_total[1m])': 'networkTransmit'
  }

  Object.entries(data.queries).forEach(([query, result]: [string, any]) => {
    const metricName = queryMap[query]
    if (!metricName || result.status !== 'success') return

    if (result.data?.result && result.data.result.length > 0) {
      const rawValue = result.data.result[0].value?.[1]
      let value = parseFloat(rawValue || '0')
      
      // NaN이나 Infinity 체크
      if (isNaN(value) || !isFinite(value)) {
        console.warn(`Invalid value for ${metricName}:`, rawValue)
        value = 0
      }
      
      // Memory는 0~100 범위로 제한
      if (metricName === 'memory') {
        value = Math.max(0, Math.min(100, value))
      }
      
      // CPU는 누적 카운터 값이므로 그대로 사용 (idle 시간 초)
      // CPU 값 디버깅 (임시)
      if (metricName === 'cpu') {
        console.log('CPU raw value:', rawValue, 'parsed:', value)
      }
      
      // 차트 데이터에 추가
      const chartArray = chartData[metricName as keyof ChartData] as ChartDataPoint[]
      chartArray.push({ time: timeStr, value })
      
      // 최대 20개 데이터 포인트만 유지 (약 5분간의 데이터)
      if (chartArray.length > 20) {
        chartArray.shift()
      }

      // 현재 값 업데이트
      if (metricName === 'cpu') currentValues.cpu = value
      else if (metricName === 'memory') currentValues.memory = value
      else if (metricName === 'networkReceive') currentValues.networkReceive = value
      else if (metricName === 'networkTransmit') currentValues.networkTransmit = value
    }
  })
}

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp * 1000)
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const formatNetworkValue = (value: number): string => {
  if (value >= 1024 * 1024 * 1024) {
    return `${(value / (1024 * 1024 * 1024)).toFixed(2)} GB/s`
  } else if (value >= 1024 * 1024) {
    return `${(value / (1024 * 1024)).toFixed(2)} MB/s`
  } else if (value >= 1024) {
    return `${(value / 1024).toFixed(2)} KB/s`
  }
  return `${value.toFixed(2)} B/s`
}

// 최신 쿼리 결과
const latestQueries = computed(() => {
  if (!latestData.value || !latestData.value.queries) {
    return {}
  }
  return latestData.value.queries
})

// 메트릭 설명 맵
const metricDescriptions: Record<string, string> = {
  'node_cpu_seconds_total{mode="idle"}': 'CPU idle 시간 (초)',
  '(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100': 'Memory 사용률 (%)',
  'rate(node_network_receive_bytes_total[1m])': 'Network 수신 속도 (bytes/s)',
  'rate(node_network_transmit_bytes_total[1m])': 'Network 송신 속도 (bytes/s)'
}

const metricDisplayNames: Record<string, string> = {
  'node_cpu_seconds_total{mode="idle"}': 'CPU Idle 시간',
  '(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100': 'Memory 사용률',
  'rate(node_network_receive_bytes_total[1m])': 'Network 수신',
  'rate(node_network_transmit_bytes_total[1m])': 'Network 송신'
}

const getMetricDescription = (queryName: string): string => {
  return metricDescriptions[queryName] || '프로메테우스 메트릭'
}

const getMetricDisplayName = (queryName: string): string => {
  return metricDisplayNames[queryName] || queryName
}

const formatValue = (value: string | number | undefined): string => {
  if (value === undefined || value === null) return 'N/A'
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(numValue)) return String(value)
  
  if (numValue >= 1000) {
    return numValue.toLocaleString('ko-KR', { maximumFractionDigits: 2 })
  }
  return numValue.toFixed(2)
}

const getValueUnit = (queryName: string, value: string | number | undefined): string => {
  if (value === undefined || value === null) return ''
  
  if (queryName.includes('memory') || queryName.includes('Mem')) {
    const bytes = typeof value === 'string' ? parseFloat(value) : value
    if (bytes >= 1024 * 1024 * 1024) {
      return `(${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB)`
    } else if (bytes >= 1024 * 1024) {
      return `(${(bytes / (1024 * 1024)).toFixed(2)} MB)`
    } else if (bytes >= 1024) {
      return `(${(bytes / 1024).toFixed(2)} KB)`
    }
    return '(bytes)'
  }
  
  if (queryName.includes('network') || queryName.includes('receive') || queryName.includes('transmit')) {
    const bytes = typeof value === 'string' ? parseFloat(value) : value
    if (bytes >= 1024 * 1024 * 1024) {
      return `(${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB/s)`
    } else if (bytes >= 1024 * 1024) {
      return `(${(bytes / (1024 * 1024)).toFixed(2)} MB/s)`
    } else if (bytes >= 1024) {
      return `(${(bytes / 1024).toFixed(2)} KB/s)`
    }
    return '(bytes/s)'
  }
  
  if (queryName.includes('cpu')) {
    return '(%)'
  }
  
  return ''
}

const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp * 1000)
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3
  } as any)
}

const connect = () => {
  if (eventSource) {
    disconnect()
  }

  // SSE 연결
  eventSource = new EventSource('/api/prometheus/stream')

  eventSource.onopen = () => {
    isConnected.value = true
    console.log('SSE 연결 성공')
  }

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      latestData.value = data
      
      // 데이터 로그에 추가 (JSON 뷰용)
      dataLog.value.push({
        timestamp: data.timestamp || Date.now() / 1000,
        data: data
      })
      
      // 최대 100개 항목만 유지
      if (dataLog.value.length > 100) {
        dataLog.value.shift()
      }
      
      // 초기 연결 정보가 아닌 경우에만 데이터 처리
      if (data.type !== 'connection_info') {
        processSSEData(data)
      }
    } catch (error) {
      console.error('데이터 파싱 오류:', error)
    }
  }

  eventSource.onerror = (error) => {
    console.error('SSE 연결 오류:', error)
    isConnected.value = false
    if (eventSource) {
      eventSource.close()
      eventSource = null
    }
  }
}

const disconnect = () => {
  if (eventSource) {
    eventSource.close()
    eventSource = null
    isConnected.value = false
    console.log('SSE 연결 종료')
  }
}


onMounted(async () => {
  // 초기 데이터 로드
  await loadInitialData()
  // SSE 연결
  connect()
})

onUnmounted(() => {
  disconnect()
})
</script>


