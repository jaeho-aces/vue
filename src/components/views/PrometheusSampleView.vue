<template>
  <div class="prometheus-sample-view">
    <div class="header">
      <h1 class="title">프로메테우스 모니터링 대시보드</h1>
      <div class="status-bar">
        <div :class="['status-indicator', { connected: isConnected, disconnected: !isConnected }]">
          <span class="status-dot"></span>
          <span class="status-text">{{ isConnected ? '연결됨' : '연결 끊김' }}</span>
        </div>
        <button 
          v-if="!isConnected" 
          @click="connect" 
          class="connect-button"
        >
          재연결
        </button>
        <button 
          v-if="isConnected" 
          @click="disconnect" 
          class="disconnect-button"
        >
          연결 끊기
        </button>
      </div>
    </div>

    <div class="content">
      <!-- 탭 메뉴 -->
      <div class="tabs">
        <button 
          :class="['tab-button', { active: viewMode === 'chart' }]"
          @click="viewMode = 'chart'"
        >
          차트
        </button>
        <button 
          :class="['tab-button', { active: viewMode === 'structured' }]"
          @click="viewMode = 'structured'"
        >
          구조화
        </button>
        <button 
          :class="['tab-button', { active: viewMode === 'json' }]"
          @click="viewMode = 'json'"
        >
          JSON
        </button>
      </div>

      <!-- 차트 뷰 -->
      <div v-if="viewMode === 'chart'" class="charts-grid">
        <!-- CPU Idle 시간 차트 -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>CPU Idle 시간</h3>
            <div class="chart-value">
              <span class="value-number">{{ currentValues.cpu.toFixed(2) }}초</span>
            </div>
          </div>
          <div class="chart-container">
            <AreaChart 
              :data="chartData.cpu" 
              color="#3b82f6" 
              label="CPU Idle 시간 (초)"
            />
          </div>
        </div>

        <!-- Memory 사용률 차트 -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Memory 사용률</h3>
            <div class="chart-value">
              <span class="value-number">{{ Math.max(0, Math.min(100, currentValues.memory)).toFixed(1) }}%</span>
            </div>
          </div>
          <div class="chart-container">
            <AreaChart 
              :data="chartData.memory" 
              color="#10b981" 
              label="Memory 사용률 (%)"
              :min="0"
              :max="100"
            />
          </div>
        </div>

        <!-- Network 수신 차트 -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Network 수신</h3>
            <div class="chart-value">
              <span class="value-number">{{ formatNetworkValue(currentValues.networkReceive) }}</span>
            </div>
          </div>
          <div class="chart-container">
            <AreaChart 
              :data="chartData.networkReceive" 
              color="#f59e0b" 
              label="수신 속도 (bytes/s)"
            />
          </div>
        </div>

        <!-- Network 송신 차트 -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Network 송신</h3>
            <div class="chart-value">
              <span class="value-number">{{ formatNetworkValue(currentValues.networkTransmit) }}</span>
            </div>
          </div>
          <div class="chart-container">
            <AreaChart 
              :data="chartData.networkTransmit" 
              color="#ef4444" 
              label="송신 속도 (bytes/s)"
            />
          </div>
        </div>
      </div>

      <!-- 구조화 뷰 -->
      <div v-if="viewMode === 'structured'" class="structured-view">
        <div class="metrics-grid">
          <div 
            v-for="(queryResult, queryName) in latestQueries" 
            :key="queryName"
            class="metric-card"
            :class="{ 'metric-error': queryResult.status === 'error' }"
          >
            <div class="metric-header">
              <h3 class="metric-name">{{ getMetricDisplayName(String(queryName)) }}</h3>
              <span 
                :class="['metric-status', queryResult.status === 'success' ? 'status-success' : 'status-error']"
              >
                {{ queryResult.status === 'success' ? '정상' : '오류' }}
              </span>
            </div>
            <div class="metric-description">
              {{ getMetricDescription(String(queryName)) }}
            </div>
            
            <!-- 성공한 쿼리 결과 -->
            <div v-if="queryResult.status === 'success' && queryResult.data" class="metric-results">
              <div v-if="queryResult.data.result && queryResult.data.result.length > 0">
                <div 
                  v-for="(result, index) in queryResult.data.result" 
                  :key="index"
                  class="result-item"
                >
                  <div class="result-labels" v-if="result.metric && Object.keys(result.metric).length > 0">
                    <div 
                      v-for="(value, key) in result.metric" 
                      :key="key"
                      class="label-item"
                    >
                      <span class="label-key">{{ key }}:</span>
                      <span class="label-value">{{ value }}</span>
                    </div>
                  </div>
                  <div class="result-value">
                    <span class="value-label">값:</span>
                    <span class="value-number">{{ formatValue(result.value?.[1]) }}</span>
                    <span class="value-unit">{{ getValueUnit(String(queryName), result.value?.[1]) }}</span>
                  </div>
                  <div class="result-timestamp" v-if="result.value?.[0]">
                    타임스탬프: {{ formatTimestamp(result.value[0]) }}
                  </div>
                </div>
              </div>
              <div v-else class="no-data">
                데이터 없음 (메트릭이 수집되지 않음)
              </div>
            </div>
            
            <!-- 에러 쿼리 결과 -->
            <div v-else-if="queryResult.status === 'error'" class="metric-error-info">
              <div class="error-message">
                <strong>오류:</strong> {{ queryResult.error || '알 수 없는 오류' }}
              </div>
              <div class="error-type" v-if="queryResult.errorType">
                오류 타입: {{ queryResult.errorType }}
              </div>
            </div>
          </div>
          
          <div v-if="Object.keys(latestQueries).length === 0" class="empty-state">
            데이터가 없습니다. SSE 연결을 확인하세요.
          </div>
        </div>
      </div>

      <!-- JSON 뷰 -->
      <div v-if="viewMode === 'json'" class="json-view">
        <div class="json-header">
          <h3>원본 JSON 데이터</h3>
          <span class="update-time" v-if="latestData">
            마지막 업데이트: {{ formatTimestamp(latestData.timestamp) }}
          </span>
        </div>
        <div class="json-content">
          <pre>{{ JSON.stringify(latestData, null, 2) }}</pre>
          <div v-if="!latestData" class="empty-state">
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

<style scoped>
.prometheus-sample-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  margin-bottom: 20px;
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary, #111827);
  margin: 0;
}

.status-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
}

.status-indicator.connected {
  background-color: #d1fae5;
  color: #065f46;
}

.status-indicator.disconnected {
  background-color: #fee2e2;
  color: #991b1b;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: currentColor;
  animation: pulse 2s infinite;
}

.status-indicator.connected .status-dot {
  background-color: #10b981;
}

.status-indicator.disconnected .status-dot {
  background-color: #ef4444;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.connect-button,
.disconnect-button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.connect-button {
  background-color: #3b82f6;
  color: white;
}

.connect-button:hover {
  background-color: #2563eb;
}

.disconnect-button {
  background-color: #ef4444;
  color: white;
}

.disconnect-button:hover {
  background-color: #dc2626;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  gap: 20px;
}

.tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  padding-bottom: 0;
}

.tab-button {
  padding: 12px 24px;
  border: none;
  background: none;
  color: var(--text-secondary, #6b7280);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all 0.2s;
}

.tab-button:hover {
  color: var(--text-primary, #111827);
  background-color: var(--bg-tertiary, #f3f4f6);
}

.tab-button.active {
  color: var(--text-primary, #111827);
  border-bottom-color: #3b82f6;
  font-weight: 600;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  flex: 1;
  min-height: 0;
}

.chart-card {
  background-color: var(--bg-primary, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chart-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #111827);
  margin: 0;
}

.chart-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.value-number {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary, #111827);
  font-family: 'Courier New', monospace;
}

.chart-container {
  flex: 1;
  min-height: 200px;
  position: relative;
}

.structured-view {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.metrics-grid {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.metric-card {
  background-color: var(--bg-primary, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  padding: 20px;
  transition: all 0.2s;
}

.metric-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.metric-card.metric-error {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.metric-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #111827);
  margin: 0;
}

.metric-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-success {
  background-color: #d1fae5;
  color: #065f46;
}

.status-error {
  background-color: #fee2e2;
  color: #991b1b;
}

.metric-description {
  font-size: 13px;
  color: var(--text-secondary, #6b7280);
  margin-bottom: 16px;
  line-height: 1.5;
}

.metric-results {
  margin-top: 12px;
}

.result-item {
  padding: 12px;
  background-color: var(--bg-secondary, #f9fafb);
  border-radius: 6px;
  margin-bottom: 12px;
}

.result-item:last-child {
  margin-bottom: 0;
}

.result-labels {
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.label-item {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
  font-size: 12px;
}

.label-key {
  font-weight: 600;
  color: var(--text-secondary, #6b7280);
  min-width: 100px;
}

.label-value {
  color: var(--text-primary, #111827);
  font-family: 'Courier New', monospace;
}

.result-value {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;
}

.value-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary, #6b7280);
}

.value-number {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary, #111827);
  font-family: 'Courier New', monospace;
}

.value-unit {
  font-size: 12px;
  color: var(--text-secondary, #6b7280);
}

.result-timestamp {
  font-size: 11px;
  color: var(--text-secondary, #6b7280);
  margin-top: 4px;
}

.no-data {
  padding: 12px;
  background-color: #fef3c7;
  border-radius: 6px;
  color: #92400e;
  font-size: 13px;
  text-align: center;
}

.metric-error-info {
  padding: 12px;
  background-color: #fee2e2;
  border-radius: 6px;
}

.error-message {
  color: #991b1b;
  font-size: 13px;
  margin-bottom: 8px;
}

.error-type {
  font-size: 11px;
  color: #b91c1c;
  font-style: italic;
}

.json-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--bg-secondary, #f9fafb);
  border-radius: 8px;
  padding: 20px;
}

.json-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.json-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #111827);
  margin: 0;
}

.json-content {
  flex: 1;
  overflow-y: auto;
  background-color: var(--bg-primary, #ffffff);
  border-radius: 4px;
  padding: 16px;
}

.json-content pre {
  margin: 0;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  color: var(--text-primary, #111827);
  white-space: pre-wrap;
  word-wrap: break-word;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-secondary, #6b7280);
  font-size: 14px;
}

/* 스크롤바 스타일링 */
.metrics-grid::-webkit-scrollbar,
.json-content::-webkit-scrollbar {
  width: 8px;
}

.metrics-grid::-webkit-scrollbar-track,
.json-content::-webkit-scrollbar-track {
  background: var(--bg-secondary, #f9fafb);
}

.metrics-grid::-webkit-scrollbar-thumb,
.json-content::-webkit-scrollbar-thumb {
  background: var(--border-color, #e5e7eb);
  border-radius: 4px;
}

.metrics-grid::-webkit-scrollbar-thumb:hover,
.json-content::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary, #6b7280);
}
</style>
