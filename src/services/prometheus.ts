/**
 * Prometheus 관련 타입 정의.
 * 브라우저는 Prometheus에 직접 요청하지 않으며, SSE(/api/prometheus/stream)와 REST(/api/prometheus/range-chart) 응답 타입으로만 사용.
 */

/** Instant 메트릭 (서버별 현황 SSE 및 range-chart 응답에서 사용) */
export interface InstantMetrics {
  cpu: number
  memory: number
  disk: number
  networkMb: number
}

/** 차트 데이터 포인트 (range-chart 응답 및 AreaChart 등에서 사용). memory/disk는 usedGb 포함 가능. */
export interface ChartPoint {
  time: string
  value: number
  usedGb?: number
}
