<template>
  <div class="semi-circular-gauge-wrapper">
    <v-chart
      class="semi-circular-gauge-chart"
      :option="chartOption"
      :autoresize="true"
    />
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
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { GaugeChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

use([
  CanvasRenderer,
  GaugeChart,
  TitleComponent,
  TooltipComponent
])

interface Props {
  normal: number
  error: number
  waiting?: number
  normalColor?: string
  errorColor?: string
  waitingColor?: string
  showRatio?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  normalColor: '#3B82F6',
  errorColor: '#EF4444',
  waitingColor: '#9ca3af',
  waiting: 0,
  showRatio: false
})

const total = computed(() => props.normal + props.error + (props.waiting || 0))
const normalPercentage = computed(() => total.value > 0 ? (props.normal / total.value) * 100 : 0)
const errorPercentage = computed(() => total.value > 0 ? (props.error / total.value) * 100 : 0)
const waitingPercentage = computed(() => total.value > 0 ? ((props.waiting || 0) / total.value) * 100 : 0)

const chartOption = computed(() => {
  const totalPercent = normalPercentage.value + waitingPercentage.value + errorPercentage.value

  // 여러 개의 게이지를 겹쳐서 표시
  const series: any[] = []

  // 배경 트랙 (더 두껍게, 글로우 효과)
  series.push({
    name: 'Track',
    type: 'gauge',
    startAngle: 180,
    endAngle: 0,
    min: 0,
    max: 100,
    splitNumber: 0,
    radius: '95%',
    center: ['50%', '75%'],
    axisLine: {
      lineStyle: {
        width: 18,
        color: [[1, 'rgba(255, 255, 255, 0.15)']],
        shadowBlur: 10,
        shadowColor: 'rgba(255, 255, 255, 0.1)'
      }
    },
    pointer: {
      show: false
    },
    axisTick: {
      show: false
    },
    splitLine: {
      show: false
    },
    axisLabel: {
      show: false
    },
    detail: {
      show: false
    }
  })

  // 정상 (블루 그라데이션 + 글로우)
  if (normalPercentage.value > 0) {
    const normalEnd = normalPercentage.value
    series.push({
      name: 'Normal',
      type: 'gauge',
      startAngle: 180,
      endAngle: 0,
      min: 0,
      max: 100,
      splitNumber: 0,
      radius: '95%',
      center: ['50%', '75%'],
      axisLine: {
        lineStyle: {
          width: 18,
          color: [
            [normalEnd / 100, {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: '#3B82F6' },
                { offset: 0.5, color: '#60A5FA' },
                { offset: 1, color: '#93C5FD' }
              ],
              global: false
            }],
            [1, 'transparent']
          ],
          shadowBlur: 15,
          shadowColor: 'rgba(59, 130, 246, 0.6)',
          shadowOffsetY: 0
        }
      },
      pointer: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        show: false
      },
      axisLabel: {
        show: false
      },
      detail: {
        show: false
      },
      data: [{
        value: normalEnd,
        name: 'Normal'
      }],
      animation: true,
      animationDuration: 1000,
      animationEasing: 'cubicOut' as const
    })
  }

  // 대기 (회색 + 글로우)
  if (waitingPercentage.value > 0) {
    const waitingStart = normalPercentage.value
    const waitingEnd = normalPercentage.value + waitingPercentage.value
    series.push({
      name: 'Waiting',
      type: 'gauge',
      startAngle: 180,
      endAngle: 0,
      min: 0,
      max: 100,
      splitNumber: 0,
      radius: '95%',
      center: ['50%', '75%'],
      axisLine: {
        lineStyle: {
          width: 18,
          color: [
            [waitingStart / 100, 'transparent'],
            [waitingEnd / 100, {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: '#9ca3af' },
                { offset: 1, color: '#d1d5db' }
              ]
            }],
            [1, 'transparent']
          ],
          shadowBlur: 10,
          shadowColor: 'rgba(156, 163, 175, 0.4)'
        }
      },
      pointer: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        show: false
      },
      axisLabel: {
        show: false
      },
      detail: {
        show: false
      },
      data: [{
        value: waitingEnd,
        name: 'Waiting'
      }],
      animation: true,
      animationDuration: 1000,
      animationEasing: 'cubicOut' as const
    })
  }

  // 비정상 (빨간색 + 글로우)
  if (errorPercentage.value > 0) {
    const errorStart = normalPercentage.value + waitingPercentage.value
    const errorEnd = totalPercent
    series.push({
      name: 'Error',
      type: 'gauge',
      startAngle: 180,
      endAngle: 0,
      min: 0,
      max: 100,
      splitNumber: 0,
      radius: '95%',
      center: ['50%', '75%'],
      axisLine: {
        lineStyle: {
          width: 18,
          color: [
            [errorStart / 100, 'transparent'],
            [errorEnd / 100, {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: '#EF4444' },
                { offset: 1, color: '#F87171' }
              ]
            }],
            [1, 'transparent']
          ],
          shadowBlur: 15,
          shadowColor: 'rgba(239, 68, 68, 0.6)'
        }
      },
      pointer: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        show: false
      },
      axisLabel: {
        show: false
      },
      detail: {
        show: false
      },
      data: [{
        value: errorEnd,
        name: 'Error'
      }],
      animation: true,
      animationDuration: 1000,
      animationEasing: 'cubicOut' as const
    })
  }

  return {
    backgroundColor: 'transparent',
    animation: true,
    animationDuration: 1500,
    animationEasing: 'cubicOut' as const,
    series: series,
    title: [
      {
        show: true,
        text: total.value.toString(),
        left: 'center',
        bottom: '32%',
        textStyle: {
          fontSize: 36,
          fontWeight: 700,
          color: '#e5e7eb',
          fontFamily: 'Courier New, monospace',
          textShadowBlur: 15,
          textShadowColor: 'rgba(59, 130, 246, 0.6)',
          textShadowOffsetX: 0,
          textShadowOffsetY: 0
        }
      },
      {
        show: true,
        text: '대',
        left: 'center',
        bottom: '22%',
        textStyle: {
          fontSize: 16,
          fontWeight: 400,
          color: '#9ca3af',
          fontFamily: 'Courier New, monospace',
          textShadowBlur: 5,
          textShadowColor: 'rgba(255, 255, 255, 0.2)'
        }
      }
    ],
    graphic: [
      {
        type: 'circle',
        left: 'center',
        bottom: '25%',
        z: 100,
        shape: {
          r: 35
        },
        style: {
          fill: 'rgba(20, 20, 20, 0.9)',
          stroke: 'rgba(59, 130, 246, 0.6)',
          lineWidth: 2,
          shadowBlur: 20,
          shadowColor: 'rgba(59, 130, 246, 0.4)'
        }
      }
    ]
  }
})
</script>

<style scoped>
.semi-circular-gauge-wrapper {
  position: relative;
  width: 200px;
  height: 120px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.2));
}

.semi-circular-gauge-chart {
  width: 100%;
  height: 180px;
  min-height: 180px;
}

:deep(.echarts) {
  filter: drop-shadow(0 0 15px rgba(59, 130, 246, 0.3));
}

.gauge-ratio-display {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
  font-weight: 600;
  background: linear-gradient(135deg, rgba(20, 20, 20, 0.95), rgba(30, 30, 30, 0.95));
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(59, 130, 246, 0.2);
  z-index: 10;
  backdrop-filter: blur(10px);
}

.ratio-normal {
  color: #3B82F6;
  text-shadow: 0 0 8px rgba(59, 130, 246, 0.6);
  font-weight: 700;
}

.ratio-waiting {
  color: #9ca3af;
  text-shadow: 0 0 6px rgba(156, 163, 175, 0.4);
  font-weight: 600;
}

.ratio-error {
  color: #EF4444;
  text-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
  font-weight: 700;
}

.ratio-separator {
  color: #e5e7eb;
  margin: 0 2px;
  opacity: 0.7;
}
</style>
