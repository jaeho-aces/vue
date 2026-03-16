<template>
  <div class="chart-container">
    <Line
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import type { ChartData, ChartDataset, ChartOptions } from 'chart.js'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface Props {
  data: Array<{ time: string; value: number; usedGb?: number }>
  color?: string
  label?: string
  min?: number
  max?: number
  showYAxis?: boolean
  /** 툴팁·Y축 값 표시 소수 자릿수 (예: 1이면 23.5) */
  valueDecimals?: number
  /** 툴팁 값 뒤 접미사 (예: "%", " MB/s"). usedGb 포인트일 때는 사용하지 않음 */
  valueSuffix?: string
  /** 두 번째 시리즈(예: 송신 트래픽). 있으면 한 차트에 두 선 표시 */
  data2?: Array<{ time: string; value: number }>
  label2?: string
  color2?: string
  valueSuffix2?: string
}

const props = withDefaults(defineProps<Props>(), {
  color: '#3b82f6',
  label: 'Value',
  min: undefined,
  max: undefined,
  showYAxis: false,
  valueDecimals: undefined,
  valueSuffix: '',
  data2: undefined,
  label2: '',
  color2: '#e879f9',
  valueSuffix2: ''
})

function formatValue(v: number): string {
  if (props.valueDecimals == null) return String(v)
  return Number(v).toFixed(props.valueDecimals)
}

function getVisibleTickIndices(labelCount: number, maxVisibleTicks = 6): Set<number> {
  if (labelCount <= 0) return new Set()
  if (labelCount <= maxVisibleTicks) {
    return new Set(Array.from({ length: labelCount }, (_, i) => i))
  }

  const lastIndex = labelCount - 1
  const indices = new Set<number>([0, lastIndex])
  const segments = Math.max(1, maxVisibleTicks - 1)

  for (let i = 1; i < segments; i += 1) {
    indices.add(Math.round((lastIndex * i) / segments))
  }

  return indices
}

const chartData = computed((): ChartData<'line', (number | null)[], string> => {
  const labels = props.data.map(d => d.time)
  const datasets: ChartDataset<'line', (number | null)[]>[] = [
    {
      label: props.label,
      data: props.data.map(d => d.value),
      borderColor: props.color,
      backgroundColor: `${props.color}20`,
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 6,
      pointHoverBackgroundColor: props.color,
      pointHoverBorderColor: '#fff',
      pointHoverBorderWidth: 2
    }
  ]
  if (props.data2?.length) {
    datasets.push({
      label: props.label2 || 'Series 2',
      data: props.data2.map(d => d.value),
      borderColor: props.color2,
      backgroundColor: `${props.color2}20`,
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 6,
      pointHoverBackgroundColor: props.color2,
      pointHoverBorderColor: '#fff',
      pointHoverBorderWidth: 2
    })
  }
  return { labels, datasets }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: !!props.data2?.length
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      titleColor: '#1e293b',
      bodyColor: '#1e293b',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 12,
      displayColors: true,
      callbacks: {
        title: (context: any) => (context[0]?.label ?? '') as string,
        label: (context: any) => {
          const idx = context.dataIndex
          const datasetIndex = context.datasetIndex
          if (datasetIndex === 1 && props.data2?.length) {
            const lab = props.label2 || 'Series 2'
            return `${lab}: ${formatValue(context.parsed.y)}${props.valueSuffix2 || props.valueSuffix}`
          }
          const point = props.data[idx]
          if (point?.usedGb != null) {
            return `${formatValue(point.usedGb)} GB (${formatValue(context.parsed.y)}%)`
          }
          return `${props.label}: ${formatValue(context.parsed.y)}${props.valueSuffix}`
        }
      }
    }
  },
  scales: {
    x: {
      display: true,
      grid: {
        display: false
      },
      ticks: {
        color: '#94a3b8',
        font: {
          size: 12
        },
        align: 'inner',
        maxRotation: 0,
        autoSkip: false,
        maxTicksLimit: 6,
        callback: function (this: any, value: number | string) {
          return this.getLabelForValue(Number(value))
        }
      },
      afterBuildTicks: (scale: any) => {
        const labels = scale.chart?.data?.labels as string[] | undefined
        if (!labels?.length) return

        const visibleIndices = Array.from(getVisibleTickIndices(labels.length, 6))
          .sort((a, b) => a - b)
          .map((value) => ({ value }))

        scale.ticks = visibleIndices
      },
      border: {
        display: false
      }
    },
    y: {
      display: props.showYAxis,
      grid: {
        display: props.showYAxis,
        color: 'rgba(0,0,0,0.06)'
      },
      ticks: props.showYAxis ? {
        color: '#94a3b8',
        font: { size: 11 },
        maxTicksLimit: 6,
        ...(props.valueDecimals != null ? { callback: (value: number | string) => formatValue(Number(value)) } : {})
      } : {},
      border: {
        display: false
      },
      min: props.min !== undefined ? props.min : (context: any) => {
        const allValues = (context.chart.data.datasets as Array<{ data: number[] }>).flatMap(d => d.data).filter((v: unknown) => typeof v === 'number' && Number.isFinite(v)) as number[]
        if (!allValues.length) return 0
        const min = Math.min(...allValues)
        return Math.max(0, min - (min * 0.1))
      },
      max: props.max !== undefined ? props.max : (context: any) => {
        const allValues = (context.chart.data.datasets as Array<{ data: number[] }>).flatMap(d => d.data).filter((v: unknown) => typeof v === 'number' && Number.isFinite(v)) as number[]
        if (!allValues.length) return 100
        const max = Math.max(...allValues)
        return max + (max * 0.1)
      }
    }
  },
  interaction: {
    intersect: false,
    mode: 'index' as const
  }
}) as ChartOptions<'line'>)
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>












