<template>
  <div class="chart-container">
    <Line
      v-if="chartData"
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

interface Dataset {
  label: string
  data: number[]
  color: string
}

interface Props {
  labels: string[]
  datasets: Dataset[]
}

const props = defineProps<Props>()

const chartData = computed(() => {
  return {
    labels: props.labels,
    datasets: props.datasets.map(ds => ({
      label: ds.label,
      data: ds.data,
      borderColor: ds.color,
      backgroundColor: (context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, `${ds.color}44`);
          gradient.addColorStop(1, `${ds.color}00`);
          return gradient;
      },
      borderWidth: 2,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 4,
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: ds.color,
      fill: true
    }))
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { 
        display: true,
        labels: { color: '#ccc', font: { size: 10 } }
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
      backgroundColor: 'rgba(5, 5, 10, 0.9)',
      titleColor: '#888',
      bodyColor: '#fff',
      borderColor: '#333',
      borderWidth: 1
    }
  },
  scales: {
    x: {
      display: false,
      grid: { color: 'rgba(255, 255, 255, 0.05)' },
      ticks: { color: '#666' }
    },
    y: {
      display: false,
      grid: { color: 'rgba(255, 255, 255, 0.05)' },
      ticks: { color: '#666' }
    }
  },
  interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
  }
}))
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
  position: relative;
  padding: 5px;
}
</style>
