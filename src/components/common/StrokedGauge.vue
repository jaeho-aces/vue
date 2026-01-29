<template>
  <div class="stroked-gauge-wrapper flashy-gauge gauge-panel">
    <!-- 외곽 링 (광택) -->
    <div class="gauge-outer-ring"></div>
    <!-- 계기판 베젤 -->
    <div class="gauge-bezel">
      <div class="gauge-bezel-shine"></div>
      <div class="gauge-bezel-inner">
        <!-- 내부 반사광 -->
        <div class="gauge-inner-glow"></div>
        <!-- 눈금 -->
        <div class="gauge-ticks" aria-hidden="true">
          <span v-for="i in 11" :key="i" class="tick" :style="{ '--i': i - 1 }"></span>
        </div>
        <div ref="chartRef" class="chart-container"></div>
        <!-- 중앙 렌즈 효과 -->
        <div class="gauge-center-lens"></div>
      </div>
    </div>
    <div v-if="showRatio" class="gauge-ratio-display">
      <span class="ratio-normal">{{ normal }}</span>
      <span v-if="waiting && waiting > 0" class="ratio-separator">/</span>
      <span v-if="waiting && waiting > 0" class="ratio-waiting">{{ waiting }}</span>
      <span class="ratio-separator">/</span>
      <span class="ratio-error">{{ error }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import ApexCharts from 'apexcharts'

interface Props {
  normal: number
  error: number
  waiting?: number
  normalColor?: string
  errorColor?: string
  waitingColor?: string
  showRatio?: boolean
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  normalColor: '#10B981',
  errorColor: '#EF4444',
  waitingColor: '#9ca3af',
  waiting: 0,
  showRatio: false,
  height: 200
})

const total = computed(() => props.normal + props.error + (props.waiting || 0))
const normalPercentage = computed(() => total.value > 0 ? (props.normal / total.value) * 100 : 0)
const errorPercentage = computed(() => total.value > 0 ? (props.error / total.value) * 100 : 0)
const waitingPercentage = computed(() => total.value > 0 ? ((props.waiting || 0) / total.value) * 100 : 0)

const chartRef = ref<HTMLElement | null>(null)
let chart: ApexCharts | null = null

const chartOptions = computed(() => {
  const primary = props.normalColor
  const lighter = primary === '#10B981' ? '#6EE7B7' : primary === '#3B82F6' ? '#93C5FD' : '#6EE7B7'
  const dark = primary === '#10B981' ? '#047857' : primary === '#3B82F6' ? '#1D4ED8' : '#047857'
  const accent = primary === '#10B981' ? '#10B981' : primary === '#3B82F6' ? '#3B82F6' : '#10B981'
  const midLight = primary === '#10B981' ? '#34D399' : primary === '#3B82F6' ? '#60A5FA' : '#34D399'

  return {
    chart: {
      type: 'radialBar',
      height: props.height,
      background: 'transparent',
      parentHeightOffset: 0,
      sparkline: { enabled: false },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 1600
      }
    },
    grid: {
      show: false,
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
      row: { colors: [] },
      column: { colors: [] }
    },
    series: [normalPercentage.value],
    plotOptions: {
      radialBar: {
        startAngle: -126,
        endAngle: 126,
        hollow: {
          margin: 0,
          size: '38%',
          background: 'transparent',
          position: 'front',
          dropShadow: {
            enabled: true,
            top: 0,
            left: 0,
            blur: 16,
            opacity: 0.35,
            color: '#000'
          }
        },
        track: {
          show: false,
          background: 'transparent',
          strokeWidth: '98%',
          opacity: 0,
          margin: 4,
          dropShadow: { enabled: false }
        },
        dataLabels: {
          name: { show: false },
          value: {
            show: true,
            fontSize: '36px',
            fontWeight: 800,
            offsetY: -14,
            color: '#f8fafc',
            fontFamily: 'system-ui, sans-serif',
            formatter: function () {
              return total.value.toString()
            }
          },
          total: {
            show: true,
            label: '대',
            fontSize: '12px',
            fontWeight: 700,
            color: 'rgba(248, 250, 252, 0.65)',
            formatter: function () {
              return ''
            }
          }
        }
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'diagonal1',
        shadeIntensity: 0.5,
        gradientToColors: [lighter],
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 25, 50, 75, 100],
        colorStops: [
          { offset: 0, color: dark, opacity: 1 },
          { offset: 25, color: accent, opacity: 1 },
          { offset: 50, color: midLight, opacity: 1 },
          { offset: 75, color: primary, opacity: 1 },
          { offset: 100, color: lighter, opacity: 1 }
        ]
      }
    },
    stroke: {
      lineCap: 'butt',
      curve: 'smooth'
    },
    labels: ['대'],
    colors: [primary],
    theme: { mode: 'dark' },
    tooltip: { enabled: false }
  }
})

function clearChartRectBackground() {
  if (!chartRef.value) return
  const container = chartRef.value
  const svg = container.querySelector('.apexcharts-svg')
  const canvas = container.querySelector('.apexcharts-canvas')
  if (svg) {
    svg.style.background = 'transparent'
    svg.style.backgroundColor = 'transparent'
    const foreign = svg.querySelector('foreignObject')
    if (foreign) {
      foreign.setAttribute('width', '0')
      foreign.setAttribute('height', '0')
      foreign.setAttribute('x', '-9999')
      foreign.setAttribute('y', '-9999')
      foreign.setAttribute('visibility', 'hidden')
      ;(foreign as HTMLElement).style.cssText =
        'display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;overflow:hidden!important;background:transparent!important'
      const legend = foreign.querySelector('.apexcharts-legend')
      if (legend) (legend as HTMLElement).style.setProperty('display', 'none', 'important')
    }
    container.querySelectorAll('.apexcharts-ycrosshairs, .apexcharts-ycrosshairs-hidden').forEach((el) => {
      el.setAttribute('stroke', 'none')
      ;(el as HTMLElement).style.display = 'none'
    })
    container.querySelectorAll('.apexcharts-tracks, .apexcharts-radialbar-track').forEach((el) => {
      ;(el as HTMLElement).style.setProperty('display', 'none', 'important')
    })
    container.querySelectorAll('.apexcharts-tracks path, .apexcharts-radialbar-track path').forEach((el) => {
      el.setAttribute('stroke', 'none')
      el.setAttribute('visibility', 'hidden')
      ;(el as HTMLElement).style.setProperty('display', 'none', 'important')
    })
  }
  if (canvas) {
    canvas.style.background = 'transparent'
    canvas.style.backgroundColor = 'transparent'
  }
  container.querySelectorAll('rect').forEach((el) => {
    if (el.closest('defs') || el.closest('clipPath')) return
    el.setAttribute('fill', 'none')
  })
}

onMounted(() => {
  nextTick(() => {
    if (chartRef.value) {
      chart = new ApexCharts(chartRef.value, chartOptions.value)
      chart.render().then(() => {
        nextTick(clearChartRectBackground)
        setTimeout(clearChartRectBackground, 50)
      })
    }
  })
})

watch([() => props.normal, () => props.error, () => props.waiting], () => {
  if (chart) {
    chart.updateSeries([normalPercentage.value])
    chart.updateOptions(chartOptions.value, false, true)
    nextTick(clearChartRectBackground)
    setTimeout(clearChartRectBackground, 50)
  }
})

onBeforeUnmount(() => {
  if (chart) {
    chart.destroy()
    chart = null
  }
})
</script>

<style scoped>
/* 계기판 전체 */
.stroked-gauge-wrapper.flashy-gauge.gauge-panel {
  position: relative;
  width: 100%;
  min-width: 180px;
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  --gauge-glow: rgba(16, 185, 129, 0.4);
  filter: drop-shadow(0 0 28px var(--gauge-glow)) drop-shadow(0 12px 40px rgba(0, 0, 0, 0.55));
  animation: gaugeAmbient 4s ease-in-out infinite;
}

@keyframes gaugeAmbient {
  0%, 100% { filter: drop-shadow(0 0 28px var(--gauge-glow)) drop-shadow(0 12px 40px rgba(0, 0, 0, 0.55)); }
  50% { filter: drop-shadow(0 0 36px var(--gauge-glow)) drop-shadow(0 12px 40px rgba(0, 0, 0, 0.55)); }
}

/* 외곽 링 (얇은 광택) */
.gauge-outer-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.12) 0%,
    transparent 40%,
    transparent 60%,
    rgba(255, 255, 255, 0.06) 100%);
  pointer-events: none;
  z-index: 0;
}

/* 베젤: 메탈릭 (테두리 작게) */
.gauge-bezel {
  position: relative;
  padding: 8px;
  border-radius: 50%;
  background: linear-gradient(155deg,
    #4a5160 0%,
    #2d323d 20%,
    #1e2229 45%,
    #252a35 70%,
    #3a404d 100%);
  box-shadow:
    inset 0 3px 8px rgba(255, 255, 255, 0.1),
    inset 0 -4px 12px rgba(0, 0, 0, 0.7),
    0 0 0 1px rgba(255, 255, 255, 0.08),
    0 6px 24px rgba(0, 0, 0, 0.6);
}

/* 베젤 하이라이트 (반사광) */
.gauge-bezel-shine {
  position: absolute;
  inset: 2px;
  border-radius: 50%;
  background: linear-gradient(165deg,
    rgba(255, 255, 255, 0.15) 0%,
    transparent 35%,
    transparent 100%);
  pointer-events: none;
  z-index: 1;
}

.gauge-bezel-inner {
  position: relative;
  border-radius: 50%;
  padding: 6px;
  background: linear-gradient(165deg,
    rgba(18, 22, 32, 0.99) 0%,
    rgba(8, 11, 18, 0.99) 100%);
  box-shadow:
    inset 0 0 50px rgba(0, 0, 0, 0.8),
    inset 0 2px 4px rgba(255, 255, 255, 0.02),
    0 0 0 1px rgba(0, 0, 0, 0.6);
  z-index: 2;
}

/* 내부 글로우 (상단 반사) - 차트 뒤에만 */
.gauge-inner-glow {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 70%;
  height: 45%;
  border-radius: 50% 50% 0 0;
  background: radial-gradient(ellipse 80% 100% at 50% 0%,
    rgba(255, 255, 255, 0.04) 0%,
    transparent 70%);
  pointer-events: none;
  z-index: 1;
}

/* 눈금 - 차트 위에 표시 */
.gauge-ticks {
  position: absolute;
  left: 50%;
  top: 10px;
  transform: translateX(-50%);
  width: 82%;
  height: 40%;
  pointer-events: none;
  z-index: 6;
}

.tick {
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 2px;
  height: 10px;
  background: linear-gradient(to top, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.05));
  border-radius: 1px;
  transform-origin: 50% 100%;
  transform: translateX(-50%) rotate(calc(-126deg + var(--i) * 25.2deg));
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.1);
}

.tick:nth-child(1),
.tick:nth-child(6),
.tick:nth-child(11) {
  height: 14px;
  width: 3px;
  background: linear-gradient(to top, rgba(255, 255, 255, 0.45), rgba(255, 255, 255, 0.08));
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.15);
}

.flashy-gauge .chart-container {
  width: 100%;
  min-width: 160px;
  min-height: 180px;
  position: relative;
  z-index: 5;
  background: transparent;
  overflow: hidden;
  /* 배경을 원형으로 클리핑 (가로·세로 중 짧은 쪽 기준 원) */
  clip-path: circle(closest-side at 50% 50%);
}

/* 게이지 원 크기 확대 + 링 굵게 */
.flashy-gauge .chart-container :deep(.apexcharts-inner) {
  transform: scale(1.48);
  transform-origin: center center;
}

/* 게이지 링 안쪽 원형(홀) 위로 이동 */
.flashy-gauge .chart-container :deep(.apexcharts-radialbar-hollow) {
  transform: translateY(-10px);
}

/* 사각형 배경 완전 제거 - ApexCharts 인라인 스타일 덮어씀 */
.flashy-gauge :deep(.apexcharts-inner),
.flashy-gauge :deep(.apexcharts-canvas),
.flashy-gauge :deep(.apexcharts-svg) {
  background: transparent !important;
  background-color: transparent !important;
}
.flashy-gauge .chart-container :deep(div) {
  background: transparent !important;
  background-color: transparent !important;
}
.flashy-gauge :deep(.apexcharts-svg rect) {
  fill: none !important;
}
.flashy-gauge .chart-container {
  background: transparent !important;
  background-color: transparent !important;
}

.flashy-gauge :deep(.apexcharts-grid),
.flashy-gauge :deep(.apexcharts-grid-row),
.flashy-gauge :deep(.apexcharts-grid-column) {
  display: none !important;
}

/* crosshairs 회색 가로선 숨김 (사각형/선 배경 제거) */
.flashy-gauge :deep(.apexcharts-ycrosshairs),
.flashy-gauge :deep(.apexcharts-ycrosshairs-hidden) {
  display: none !important;
  stroke: none !important;
}

/* apexcharts-svg 내 legend용 foreignObject 완전 숨김 (사각형/회색 그라데이션 제거) */
.stroked-gauge-wrapper :deep(.apexcharts-svg foreignObject),
.stroked-gauge-wrapper :deep(.apexcharts-svg > foreignObject),
.flashy-gauge :deep(.apexcharts-svg foreignObject),
.flashy-gauge :deep(.apexcharts-svg > foreignObject) {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  width: 0 !important;
  height: 0 !important;
  pointer-events: none !important;
  clip-path: inset(100%) !important;
}
.flashy-gauge :deep(.apexcharts-legend) {
  background: transparent !important;
  background-color: transparent !important;
}

/* 게이지 바: 화려한 글로우 */
.flashy-gauge :deep(.apexcharts-radialbar-area) {
  filter: drop-shadow(0 0 12px currentColor) drop-shadow(0 0 8px currentColor);
}

.flashy-gauge :deep(.apexcharts-datalabels-value) {
  text-shadow:
    0 0 24px var(--gauge-glow),
    0 0 12px rgba(255, 255, 255, 0.35),
    0 2px 4px rgba(0, 0, 0, 0.6);
  letter-spacing: -0.02em;
}

/* 중앙 렌즈 (글래스 효과) - 차트 뒤에만, 위로 배치 */
.gauge-center-lens {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -40%);
  width: 55%;
  height: 35%;
  border-radius: 50%;
  background: radial-gradient(ellipse 100% 80% at 50% 50%,
    rgba(255, 255, 255, 0.03) 0%,
    transparent 70%);
  pointer-events: none;
  z-index: 2;
}

/* 비율 패널 */
.gauge-ratio-display {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
  font-weight: 800;
  padding: 10px 18px;
  border-radius: 8px;
  letter-spacing: 0.02em;
  background: linear-gradient(180deg,
    rgba(28, 33, 48, 0.98) 0%,
    rgba(12, 16, 24, 0.98) 100%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 6px 20px rgba(0, 0, 0, 0.5),
    0 0 24px rgba(16, 185, 129, 0.15);
  z-index: 10;
  backdrop-filter: blur(10px);
}

.ratio-normal {
  color: #34D399;
  text-shadow: 0 0 12px rgba(52, 211, 153, 0.8);
}

.ratio-waiting {
  color: #94a3b8;
  text-shadow: 0 0 8px rgba(148, 163, 184, 0.5);
}

.ratio-error {
  color: #F87171;
  text-shadow: 0 0 12px rgba(248, 113, 113, 0.8);
}

.ratio-separator {
  color: rgba(248, 250, 252, 0.45);
  margin: 0 1px;
  font-weight: 700;
}
</style>

<!-- legend foreignObject + crosshairs + 사각형 회색 그라데이션 배경 제거 (비스코프) -->
<style>
.stroked-gauge-wrapper .apexcharts-svg foreignObject,
.stroked-gauge-wrapper .apexcharts-svg > foreignObject {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  width: 0 !important;
  height: 0 !important;
  overflow: hidden !important;
  pointer-events: none !important;
  clip-path: inset(100%) !important;
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
}
.stroked-gauge-wrapper .apexcharts-legend {
  display: none !important;
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
}
.stroked-gauge-wrapper .apexcharts-svg .apexcharts-ycrosshairs,
.stroked-gauge-wrapper .apexcharts-svg .apexcharts-ycrosshairs-hidden {
  display: none !important;
  stroke: none !important;
}
.stroked-gauge-wrapper .apexcharts-svg rect {
  fill: none !important;
}
/* 사각형 회색 그라데이션 배경(트랙/클립 영역) 완전 숨김 */
.stroked-gauge-wrapper .apexcharts-radialbar-track,
.stroked-gauge-wrapper .apexcharts-tracks,
.stroked-gauge-wrapper .apexcharts-radialbar-track path,
.stroked-gauge-wrapper .apexcharts-tracks .apexcharts-radialbar-area {
  display: none !important;
  opacity: 0 !important;
  stroke: none !important;
  fill: none !important;
  visibility: hidden !important;
}
.stroked-gauge-wrapper .apexcharts-canvas,
.stroked-gauge-wrapper .chart-container,
.stroked-gauge-wrapper .apexcharts-svg {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
}
</style>
