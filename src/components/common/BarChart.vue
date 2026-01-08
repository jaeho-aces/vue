<template>
  <div class="chart-container">
    <Bar :data="chartDataConfig" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

interface BarDataItem {
  label: string
  value: number
  color?: string
}

interface Props {
  chartData: BarDataItem[]
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: '값'
})

const chartDataConfig = computed(() => ({
  labels: props.chartData.map(item => item.label),
  datasets: [
    {
      label: props.label,
      backgroundColor: props.chartData.map(item => item.color || '#3b82f6'),
      borderColor: props.chartData.map(item => item.color || '#3b82f6'),
      borderWidth: 1,
      data: props.chartData.map(item => item.value)
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
      bodyColor: '#64748b',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
      displayColors: true,
      callbacks: {
        label: function(context: any) {
          return `${context.dataset.label}: ${context.parsed.y}%`
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        color: '#94a3b8',
        font: {
          size: 11
        }
      }
    },
    y: {
      beginAtZero: true,
      max: 100,
      grid: {
        color: '#f1f5f9'
      },
      ticks: {
        color: '#94a3b8',
        font: {
          size: 11
        },
        callback: function(value: any) {
          return value + '%'
        }
      }
    }
  }
}
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 100%;
  width: 100%;
}
</style>












