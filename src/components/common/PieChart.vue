<template>
  <div class="pie-chart-container">
    <Doughnut
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

interface DataItem {
  name: string
  value: number
  color: string
}

interface Props {
  data: DataItem[]
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 120
})

const chartData = computed(() => ({
  labels: props.data.map(d => d.name),
  datasets: [
    {
      data: props.data.map(d => d.value),
      backgroundColor: props.data.map(d => d.color),
      borderWidth: 0,
      cutout: '60%'
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
      cornerRadius: 8,
      displayColors: true,
      callbacks: {
        label: (context: any) => {
          const label = context.label || ''
          const value = context.parsed || 0
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
          return `${label}: ${value} (${percentage}%)`
        }
      }
    }
  }
}
</script>

<style scoped>
.pie-chart-container {
  width: 100%;
  height: 100%;
  position: relative;
  min-height: 120px;
}
</style>












