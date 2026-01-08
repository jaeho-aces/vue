<template>
  <div class="circular-gauge-container">
    <svg class="gauge-svg" viewBox="0 0 120 120">
      <!-- Background circle -->
      <circle
        cx="60"
        cy="60"
        r="50"
        fill="none"
        stroke="#e5e7eb"
        stroke-width="8"
      />
      <!-- Progress circle - Normal (green) -->
      <circle
        v-if="normalPercentage > 0"
        cx="60"
        cy="60"
        r="50"
        fill="none"
        :stroke="normalColor"
        stroke-width="8"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="normalOffset"
        transform="rotate(-90 60 60)"
        class="gauge-progress"
      />
      <!-- Progress circle - Error (red) -->
      <circle
        v-if="errorPercentage > 0"
        cx="60"
        cy="60"
        r="50"
        fill="none"
        :stroke="errorColor"
        stroke-width="8"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="errorOffset"
        :transform="`rotate(${normalAngle - 90} 60 60)`"
        class="gauge-progress"
      />
    </svg>
    <div class="gauge-center">
      <div class="gauge-value">{{ total }}</div>
      <div class="gauge-unit">대</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  normal: number
  error: number
  normalColor?: string
  errorColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  normalColor: '#10B981', // green-500
  errorColor: '#EF4444' // red-500
})

const total = computed(() => props.normal + props.error)
const normalPercentage = computed(() => (props.normal / total.value) * 100)
const errorPercentage = computed(() => (props.error / total.value) * 100)

const radius = 50
const circumference = 2 * Math.PI * radius

const normalAngle = computed(() => (normalPercentage.value / 100) * 360)
const normalOffset = computed(() => circumference - (normalPercentage.value / 100) * circumference)
const errorOffset = computed(() => circumference - (errorPercentage.value / 100) * circumference)
</script>

<style scoped>
.circular-gauge-container {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto;
}

.gauge-svg {
  width: 100%;
  height: 100%;
}

.gauge-progress {
  transition: stroke-dashoffset 0.5s ease;
}

.gauge-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.gauge-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
}

.gauge-unit {
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 0.25rem;
}
</style>












