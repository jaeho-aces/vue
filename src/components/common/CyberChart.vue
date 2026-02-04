<template>
  <div class="chart-container" :id="chartId">
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

interface Props {
  data: Array<{ time: string; value: number }>
  color?: string
  label?: string
  glowColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  color: '#00f3ff',
  label: 'Value',
})

const chartId = `cyber-chart-${Math.random().toString(36).substr(2, 9)}`

const chartData = computed(() => {
  return {
    labels: props.data.map(d => d.time),
    datasets: [
      {
        label: props.label,
        data: props.data.map(d => d.value),
        fill: true,
        borderColor: props.color,
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, `${props.color}44`);
          gradient.addColorStop(0.5, `${props.color}11`);
          gradient.addColorStop(1, `${props.color}00`);
          return gradient;
        },
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: props.color,
        pointHoverBorderWidth: 2,
        segment: {
          borderColor: () => props.color,
        },
      }
    ]
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(5, 5, 10, 0.9)',
      titleColor: '#888',
      bodyColor: '#fff',
      borderColor: props.color,
      borderWidth: 1,
      padding: 10,
      displayColors: false,
      callbacks: {
        title: () => '',
        label: (context: any) => `${context.parsed.y} ${props.label === '실시간 접속자' ? '명' : 'Mbps'}`
      }
    }
  },
  scales: {
    x: {
      display: true,
      grid: {
        display: true,
        color: 'rgba(255, 255, 255, 0.03)',
        drawTicks: false,
      },
      ticks: {
        color: '#555',
        font: { size: 10, family: 'Orbitron' },
        maxRotation: 0,
        autoSkip: true,
        maxTicksLimit: 5
      }
    },
    y: {
      display: true,
      grid: {
        display: true,
        color: 'rgba(255, 255, 255, 0.03)',
        drawTicks: false,
      },
      ticks: {
        color: '#555',
        font: { size: 10, family: 'Orbitron' },
        maxTicksLimit: 4
      }
    }
  },
  animations: {
    tension: {
      duration: 1000,
      easing: 'linear' as const
    }
  },
  interaction: { intersect: false, mode: 'index' as const }
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
