/**
 * Prometheus 메트릭 SSE 클라이언트.
 * 백엔드 /api/prometheus/stream 에 연결해 metricsByIp(및 상세 시 rangeChart)를 수신한다.
 */

import { apiConfig } from '../config/api'
import { prometheusChartStep } from '../config/prometheus'

export interface InstantMetricsByIp {
  cpu: number
  memory: number
  disk: number
  networkMb: number
}

export interface RangeChartPoint {
  time: string
  value: number
  usedGb?: number
}

export interface RangeChartByMetric {
  cpu: RangeChartPoint[]
  memory: RangeChartPoint[]
  disk: RangeChartPoint[]
  network: RangeChartPoint[]
  networkTransmit?: RangeChartPoint[]
}

export interface PrometheusSSEPayload {
  type: 'connected' | 'metrics' | 'detail'
  metricsByIp?: Record<string, InstantMetricsByIp>
  aliveByIp?: Record<string, string>
  rangeChart?: RangeChartByMetric
}

let eventSource: EventSource | null = null

export interface StreamOptions {
  ip?: string
  start?: string
  end?: string
  step?: string
}

function getStreamUrl(options?: StreamOptions): string {
  const base = (apiConfig.baseURL || '').replace(/\/$/, '')
  const path = '/api/prometheus/stream'
  const params = new URLSearchParams()
  if (options?.ip) params.set('ip', options.ip)
  if (options?.start) params.set('start', options.start)
  if (options?.end) params.set('end', options.end)
  if (options?.step) params.set('step', options.step ?? prometheusChartStep)
  const qs = params.toString()
  const pathWithQuery = qs ? `${path}?${qs}` : path
  return base ? `${base}${pathWithQuery}` : pathWithQuery
}

/**
 * SSE 연결. 콜백으로 payload 수신.
 * options에 ip, start, end, step 있으면 상세 스트림(1분마다 metricsByIp + rangeChart).
 */
export function connect(
  callback: (data: PrometheusSSEPayload) => void,
  options?: StreamOptions
): void {
  disconnect()
  const url = getStreamUrl(options)
  eventSource = new EventSource(url, { withCredentials: true })
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as PrometheusSSEPayload
      if (data?.type === 'metrics' && data.metricsByIp != null) {
        callback(data)
      } else if (data?.type === 'detail' && data.metricsByIp != null) {
        callback(data)
      }
    } catch {
      // ignore parse error
    }
  }
  eventSource.onerror = () => {
    // 연결 끊김/오류 시 재연결은 하지 않음. 컴포넌트에서 필요 시 connect 재호출.
  }
}

/**
 * SSE 연결 해제.
 */
export function disconnect(): void {
  if (eventSource) {
    eventSource.close()
    eventSource = null
  }
}
