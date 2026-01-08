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
  data: Array<{ time: string; value: number }>
  color?: string
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  color: '#3b82f6',
  label: 'Value'
})

const chartData = computed(() => ({
  labels: props.data.map(d => d.time),
  datasets: [
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
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      titleColor: '#1e293b',
      bodyColor: '#1e293b',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 12,
      displayColors: false,
      callbacks: {
        title: () => '',
        label: (context: any) => `${props.label}: ${context.parsed.y}`
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
        maxRotation: 0,
        autoSkip: true,
        maxTicksLimit: 6
      },
      border: {
        display: false
      }
    },
    y: {
      display: false,
      grid: {
        display: false
      },
      min: (context: any) => {
        const values = context.chart.data.datasets[0].data
        const min = Math.min(...values)
        return Math.max(0, min - 10)
      },
      max: (context: any) => {
        const values = context.chart.data.datasets[0].data
        const max = Math.max(...values)
        return max + 10
      }
    }
  },
  interaction: {
    intersect: false,
    mode: 'index' as const
  }
}
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>












