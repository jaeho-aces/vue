<template>
  <div class="circular-gauge-container" :class="{ large: showRatio }">
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
      <!-- Progress circle - Waiting (gray) -->
      <circle
        v-if="waitingPercentage > 0"
        cx="60"
        cy="60"
        r="50"
        fill="none"
        :stroke="waitingColor"
        stroke-width="8"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="waitingOffset"
        :transform="`rotate(${normalAngle - 90} 60 60)`"
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
        :transform="`rotate(${normalAngle + waitingAngle - 90} 60 60)`"
        class="gauge-progress"
      />
    </svg>
    <div class="gauge-center">
      <div v-if="showRatio" class="gauge-ratio">
        <span class="gauge-normal">{{ normal }}</span>
        <span class="gauge-separator">/</span>
        <span v-if="waiting && waiting > 0" class="gauge-waiting">{{ waiting }}</span>
        <span v-if="waiting && waiting > 0" class="gauge-separator">/</span>
        <span class="gauge-error">{{ error }}</span>
      </div>
      <template v-else>
        <div class="gauge-value">{{ total }}</div>
        <div class="gauge-unit">대</div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

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
  normalColor: '#10B981', // green-500
  errorColor: '#EF4444', // red-500
  waitingColor: '#9ca3af', // gray-400
  waiting: 0,
  showRatio: false
})

const total = computed(() => props.normal + props.error + (props.waiting || 0))
const normalPercentage = computed(() => total.value > 0 ? (props.normal / total.value) * 100 : 0)
const errorPercentage = computed(() => total.value > 0 ? (props.error / total.value) * 100 : 0)
const waitingPercentage = computed(() => total.value > 0 ? ((props.waiting || 0) / total.value) * 100 : 0)

const radius = 50
const circumference = 2 * Math.PI * radius

const normalAngle = computed(() => (normalPercentage.value / 100) * 360)
const waitingAngle = computed(() => (waitingPercentage.value / 100) * 360)
const normalOffset = computed(() => circumference - (normalPercentage.value / 100) * circumference)
const waitingOffset = computed(() => circumference - (waitingPercentage.value / 100) * circumference)
const errorOffset = computed(() => circumference - (errorPercentage.value / 100) * circumference)
</script>

<style scoped>
.circular-gauge-container {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto;
}

.circular-gauge-container.large {
  width: 105px;
  height: 105px;
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

/* Dark mode support */
:deep(.gauge-value) {
  color: #e5e7eb;
}

:deep(.gauge-unit) {
  color: #9ca3af;
}

.gauge-ratio {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1;
}

.circular-gauge-container.large .gauge-ratio {
  font-size: 1.5rem;
}

.gauge-normal {
  color: #10B981;
  text-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
}

.gauge-separator {
  color: #e5e7eb;
  margin: 0 2px;
}

.gauge-error {
  color: #EF4444;
  text-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
}

.gauge-waiting {
  color: #9ca3af;
  text-shadow: 0 0 8px rgba(156, 163, 175, 0.3);
}
</style>












