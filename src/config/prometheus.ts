/**
 * Prometheus 차트/SSE 설정 (환경 변수)
 * 백엔드 PROMETHEUS_STEP, PROMETHEUS_POLL_INTERVAL_SEC 와 맞춰 설정할 것.
 */
const step = import.meta.env.VITE_PROMETHEUS_CHART_STEP
export const prometheusChartStep: string =
  step && String(step).trim() ? String(step).trim() : '1m'
