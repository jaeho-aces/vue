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
        position: 'top' as const,
        align: 'end' as const,
        labels: { color: '#94a3b8', font: { size: 10, weight: 'bold' as const }, boxWidth: 8, usePointStyle: true }
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      titleColor: '#94a3b8',
      bodyColor: '#fff',
      borderColor: 'rgba(0, 243, 255, 0.3)',
      borderWidth: 1,
      padding: 10,
      cornerRadius: 4,
      displayColors: false
    }
  },
  scales: {
    x: {
      display: true,
      grid: { color: 'rgba(255, 255, 255, 0.03)', drawTicks: false },
      ticks: { color: '#64748b', font: { size: 9 }, padding: 8 }
    },
    y: {
      display: true,
      min: 0,
      max: 10,
      grid: { color: 'rgba(255, 255, 255, 0.05)', drawTicks: false },
      ticks: { 
        color: '#64748b', 
        font: { size: 9 }, 
        padding: 8,
        stepSize: 1,
        callback: (value: any) => value + 'G'
      }
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
