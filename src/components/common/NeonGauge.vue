<template>
  <div class="neon-gauge-wrapper">
    <v-chart
      class="neon-gauge-chart"
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
  normalColor: '#00FFFF',
  errorColor: '#FF00FF',
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

  // 배경 트랙 (외곽 링 - 네온 효과)
  series.push({
    name: 'OuterTrack',
    type: 'gauge',
    startAngle: 90,
    endAngle: -270,
    min: 0,
    max: 100,
    splitNumber: 0,
    radius: '100%',
    center: ['50%', '50%'],
    axisLine: {
      lineStyle: {
        width: 20,
        color: [[1, 'rgba(0, 255, 255, 0.15)']],
        shadowBlur: 20,
        shadowColor: 'rgba(0, 255, 255, 0.3)'
      }
    },
    pointer: { show: false },
    axisTick: { show: false },
    splitLine: { show: false },
    axisLabel: { show: false },
    detail: { show: false }
  })

  // 중간 트랙 (기계적 느낌)
  series.push({
    name: 'MiddleTrack',
    type: 'gauge',
    startAngle: 90,
    endAngle: -270,
    min: 0,
    max: 100,
    splitNumber: 0,
    radius: '85%',
    center: ['50%', '50%'],
    axisLine: {
      lineStyle: {
        width: 12,
        color: [[1, 'rgba(255, 255, 255, 0.08)']]
      }
    },
    pointer: { show: false },
    axisTick: { show: false },
    splitLine: { show: false },
    axisLabel: { show: false },
    detail: { show: false }
  })

  // 정상 (네온 시안)
  if (normalPercentage.value > 0) {
    const normalEnd = normalPercentage.value
    series.push({
      name: 'Normal',
      type: 'gauge',
      startAngle: 90,
      endAngle: -270,
      min: 0,
      max: 100,
      splitNumber: 0,
      radius: '85%',
      center: ['50%', '50%'],
      axisLine: {
        lineStyle: {
          width: 12,
          color: [
            [normalEnd / 100, {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#00FFFF' },
                { offset: 0.5, color: '#00CED1' },
                { offset: 1, color: '#008B8B' }
              ],
              global: false
            }],
            [1, 'transparent']
          ],
          shadowBlur: 25,
          shadowColor: 'rgba(0, 255, 255, 0.8)',
          shadowOffsetY: 0
        }
      },
      pointer: { show: false },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      detail: { show: false },
      data: [{ value: normalEnd, name: 'Normal' }],
      animation: true,
      animationDuration: 1500,
      animationEasing: 'cubicOut'
    })
  }

  // 대기 (회색 네온)
  if (waitingPercentage.value > 0) {
    const waitingStart = normalPercentage.value
    const waitingEnd = normalPercentage.value + waitingPercentage.value
    series.push({
      name: 'Waiting',
      type: 'gauge',
      startAngle: 90,
      endAngle: -270,
      min: 0,
      max: 100,
      splitNumber: 0,
      radius: '85%',
      center: ['50%', '50%'],
      axisLine: {
        lineStyle: {
          width: 12,
          color: [
            [waitingStart / 100, 'transparent'],
            [waitingEnd / 100, {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#9ca3af' },
                { offset: 1, color: '#6b7280' }
              ]
            }],
            [1, 'transparent']
          ],
          shadowBlur: 15,
          shadowColor: 'rgba(156, 163, 175, 0.5)'
        }
      },
      pointer: { show: false },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      detail: { show: false },
      data: [{ value: waitingEnd, name: 'Waiting' }],
      animation: true,
      animationDuration: 1500,
      animationEasing: 'cubicOut'
    })
  }

  // 비정상 (네온 마젠타)
  if (errorPercentage.value > 0) {
    const errorStart = normalPercentage.value + waitingPercentage.value
    const errorEnd = totalPercent
    series.push({
      name: 'Error',
      type: 'gauge',
      startAngle: 90,
      endAngle: -270,
      min: 0,
      max: 100,
      splitNumber: 0,
      radius: '85%',
      center: ['50%', '50%'],
      axisLine: {
        lineStyle: {
          width: 12,
          color: [
            [errorStart / 100, 'transparent'],
            [errorEnd / 100, {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#FF00FF' },
                { offset: 0.5, color: '#FF1493' },
                { offset: 1, color: '#DC143C' }
              ]
            }],
            [1, 'transparent']
          ],
          shadowBlur: 25,
          shadowColor: 'rgba(255, 0, 255, 0.8)'
        }
      },
      pointer: { show: false },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      detail: { show: false },
      data: [{ value: errorEnd, name: 'Error' }],
      animation: true,
      animationDuration: 1500,
      animationEasing: 'cubicOut' as const
    })
  }

  // 내부 링 (기계적 디테일)
  series.push({
    name: 'InnerRing',
    type: 'gauge',
    startAngle: 90,
    endAngle: -270,
    min: 0,
    max: 100,
    splitNumber: 0,
    radius: '70%',
    center: ['50%', '50%'],
    axisLine: {
      lineStyle: {
        width: 8,
        color: [[1, 'rgba(0, 255, 255, 0.1)']],
        shadowBlur: 10,
        shadowColor: 'rgba(0, 255, 255, 0.2)'
      }
    },
    pointer: { show: false },
    axisTick: { show: false },
    splitLine: { show: false },
    axisLabel: { show: false },
    detail: { show: false }
  })

  // 눈금 표시 (기계적 느낌)
  const splitNumber = 20
  const splitLineData: any[] = []
  for (let i = 0; i <= splitNumber; i++) {
    const angle = 90 - (i / splitNumber) * 360
    const radian = (angle * Math.PI) / 180
    const isMajor = i % 5 === 0
    
    splitLineData.push({
      type: 'line',
      shape: {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: isMajor ? -85 : -90
      },
      style: {
        stroke: isMajor ? 'rgba(0, 255, 255, 0.4)' : 'rgba(0, 255, 255, 0.2)',
        lineWidth: isMajor ? 2 : 1,
        shadowBlur: isMajor ? 5 : 2,
        shadowColor: 'rgba(0, 255, 255, 0.5)'
      },
      rotation: radian,
      position: ['50%', '50%']
    })
  }

  return {
    backgroundColor: 'transparent',
    animation: true,
    animationDuration: 2000,
    animationEasing: 'cubicOut' as const,
    series: series,
    graphic: [
      ...splitLineData,
      // 중앙 원형 패널 (기계적 느낌)
      {
        type: 'circle',
        left: 'center',
        top: 'center',
        z: 100,
        shape: {
          r: 60
        },
        style: {
          fill: {
            type: 'radial',
            x: 0.5,
            y: 0.5,
            r: 0.5,
            colorStops: [
              { offset: 0, color: 'rgba(0, 0, 0, 0.9)' },
              { offset: 0.7, color: 'rgba(20, 20, 40, 0.8)' },
              { offset: 1, color: 'rgba(0, 20, 40, 0.7)' }
            ]
          },
          stroke: '#00FFFF',
          lineWidth: 3,
          shadowBlur: 30,
          shadowColor: 'rgba(0, 255, 255, 0.6)'
        }
      },
      // 내부 작은 원
      {
        type: 'circle',
        left: 'center',
        top: 'center',
        z: 101,
        shape: {
          r: 45
        },
        style: {
          fill: 'transparent',
          stroke: 'rgba(0, 255, 255, 0.3)',
          lineWidth: 1,
          shadowBlur: 10,
          shadowColor: 'rgba(0, 255, 255, 0.3)'
        }
      }
    ],
    title: [
      {
        show: true,
        text: total.value.toString(),
        left: 'center',
        top: 'center',
        textStyle: {
          fontSize: 42,
          fontWeight: 900,
          color: '#00FFFF',
          fontFamily: 'Courier New, monospace',
          textShadowBlur: 20,
          textShadowColor: 'rgba(0, 255, 255, 0.8)',
          textShadowOffsetX: 0,
          textShadowOffsetY: 0
        }
      },
      {
        show: true,
        text: '대',
        left: 'center',
        top: '55%',
        textStyle: {
          fontSize: 18,
          fontWeight: 600,
          color: 'rgba(0, 255, 255, 0.7)',
          fontFamily: 'Courier New, monospace',
          textShadowBlur: 10,
          textShadowColor: 'rgba(0, 255, 255, 0.5)'
        }
      }
    ]
  }
})
</script>

<style scoped>
.neon-gauge-wrapper {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 0 30px rgba(0, 255, 255, 0.4));
  animation: neonPulse 3s ease-in-out infinite;
}

@keyframes neonPulse {
  0%, 100% {
    filter: drop-shadow(0 0 30px rgba(0, 255, 255, 0.4));
  }
  50% {
    filter: drop-shadow(0 0 40px rgba(0, 255, 255, 0.6));
  }
}

.neon-gauge-chart {
  width: 100%;
  height: 100%;
  min-height: 200px;
}

:deep(.echarts) {
  filter: drop-shadow(0 0 20px rgba(0, 255, 255, 0.5));
}

.gauge-ratio-display {
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
  font-weight: 700;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(0, 20, 40, 0.95));
  padding: 8px 16px;
  border-radius: 8px;
  border: 2px solid rgba(0, 255, 255, 0.5);
  box-shadow: 
    0 4px 15px rgba(0, 0, 0, 0.6),
    0 0 25px rgba(0, 255, 255, 0.4),
    inset 0 0 15px rgba(0, 255, 255, 0.1);
  z-index: 10;
  backdrop-filter: blur(10px);
  animation: borderGlow 2s ease-in-out infinite;
}

@keyframes borderGlow {
  0%, 100% {
    border-color: rgba(0, 255, 255, 0.5);
    box-shadow: 
      0 4px 15px rgba(0, 0, 0, 0.6),
      0 0 25px rgba(0, 255, 255, 0.4),
      inset 0 0 15px rgba(0, 255, 255, 0.1);
  }
  50% {
    border-color: rgba(0, 255, 255, 0.8);
    box-shadow: 
      0 4px 15px rgba(0, 0, 0, 0.6),
      0 0 35px rgba(0, 255, 255, 0.6),
      inset 0 0 20px rgba(0, 255, 255, 0.2);
  }
}

.ratio-normal {
  color: #00FFFF;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
  font-weight: 900;
}

.ratio-waiting {
  color: #9ca3af;
  text-shadow: 0 0 8px rgba(156, 163, 175, 0.5);
  font-weight: 700;
}

.ratio-error {
  color: #FF00FF;
  text-shadow: 0 0 10px rgba(255, 0, 255, 0.8);
  font-weight: 900;
}

.ratio-separator {
  color: rgba(0, 255, 255, 0.6);
  margin: 0 2px;
  font-weight: 700;
}
</style>
