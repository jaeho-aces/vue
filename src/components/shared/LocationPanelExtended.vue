<template>
  <div class="location-panel-container">
    <div class="header-section">
      <h3 class="text-lg font-bold flex items-center gap-2" :class="colorClass">
        <component :is="icon" :size="20" />
        {{ title }}
      </h3>
      <div class="display-video-text">
        표출 영상 : {{ displayVideo }}
      </div>
    </div>
    <div class="flex-1 flex flex-col gap-4">
      <!-- 영상 서버 섹션 -->
      <div class="server-section">
        <h4 class="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-green-500"></span>
          영상 서버
        </h4>
        <div class="server-content">
          <!-- 왼쪽: 게이지 -->
          <div class="gauge-section">
            <div class="gauge-wrapper">
              <CircularGauge
                :normal="videoNormal"
                :error="videoError"
                normal-color="#10B981"
                error-color="#EF4444"
              />
            </div>
            <div class="status-wrapper">
              <div class="status-item">
                <span class="status-dot bg-green-500"></span>
                <span class="status-label">정상</span>
                <span class="status-value">{{ videoNormal }}</span>
              </div>
              <div class="status-item">
                <span class="status-dot bg-red-500"></span>
                <span class="status-label">장애</span>
                <span class="status-value">{{ videoError }}</span>
              </div>
            </div>
          </div>
          <!-- 오른쪽: 비디오 플레이어 -->
          <div class="video-player-section">
            <div class="video-player">
              <div class="video-overlay">
                <div class="live-badge">
                  <span class="live-dot"></span>
                  <span class="live-text">LIVE</span>
                </div>
                <button class="video-button">원본</button>
                <div class="video-placeholder">
                  <Video :size="48" class="video-icon" />
                </div>
              </div>
            </div>
            <div class="video-label">
              <span class="w-2 h-2 rounded-full bg-green-500"></span>
              영상 서버 #01
            </div>
          </div>
        </div>
      </div>
      <!-- 미디어 서버 섹션 -->
      <div class="server-section">
        <h4 class="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-green-500"></span>
          미디어 서버
        </h4>
        <div class="server-content">
          <!-- 왼쪽: 게이지 -->
          <div class="gauge-section">
            <div class="gauge-wrapper">
              <CircularGauge
                :normal="mediaNormal"
                :error="mediaError"
                normal-color="#10B981"
                error-color="#EF4444"
              />
            </div>
            <div class="status-wrapper">
              <div class="status-item">
                <span class="status-dot bg-green-500"></span>
                <span class="status-label">정상</span>
                <span class="status-value">{{ mediaNormal }}</span>
              </div>
              <div class="status-item">
                <span class="status-dot bg-red-500"></span>
                <span class="status-label">장애</span>
                <span class="status-value">{{ mediaError }}</span>
              </div>
            </div>
          </div>
          <!-- 오른쪽: 비디오 플레이어 -->
          <div class="video-player-section">
            <div class="video-player">
              <div class="video-overlay">
                <div class="live-badge">
                  <span class="live-dot"></span>
                  <span class="live-text">LIVE</span>
                </div>
                <button class="video-button">송출</button>
                <div class="video-placeholder">
                  <Video :size="48" class="video-icon" />
                </div>
              </div>
            </div>
            <div class="video-label">
              <span class="w-2 h-2 rounded-full bg-green-500"></span>
              미디어 서버 #01
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Video } from 'lucide-vue-next'
import CircularGauge from '../common/CircularGauge.vue'

interface ServerDataItem {
  name: string
  value: number
  color: string
}

interface Props {
  title: string
  icon: any
  colorClass: string
  videoServerData: ServerDataItem[]
  mediaServerData: ServerDataItem[]
  displayVideo?: string
}

const props = withDefaults(defineProps<Props>(), {
  displayVideo: 'CAM-01'
})


const videoNormal = computed(() => {
  const item = props.videoServerData.find(d => d.name === '정상')
  return item?.value || 0
})

const videoError = computed(() => {
  const item = props.videoServerData.find(d => d.name === '장애')
  return item?.value || 0
})

const mediaNormal = computed(() => {
  const item = props.mediaServerData.find(d => d.name === '정상')
  return item?.value || 0
})

const mediaError = computed(() => {
  const item = props.mediaServerData.find(d => d.name === '장애')
  return item?.value || 0
})
</script>

<style scoped>
.bg-white {
  background-color: #ffffff;
}

.rounded-2xl {
  border-radius: 1rem;
}

.p-4 {
  padding: 1rem;
}

.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.border {
  border-width: 1px;
}

.border-2 {
  border-width: 2px;
}

.border-slate-100 {
  border-color: #f1f5f9;
}

.border-slate-200 {
  border-color: #e2e8f0;
}

.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.h-full {
  height: 100%;
}

.text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.font-bold {
  font-weight: 700;
}

.mb-4 {
  margin-bottom: 1rem;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  flex-shrink: 0;
}

.display-video-text {
  font-size: 0.875rem;
  color: #475569;
  font-weight: 500;
}

.items-center {
  align-items: center;
}

.gap-2 {
  gap: 0.5rem;
}

.flex-1 {
  flex: 1 1 0%;
}

.gap-4 {
  gap: 1rem;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.font-semibold {
  font-weight: 600;
}

.text-slate-600 {
  color: #475569;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.space-y-2 > * + * {
  margin-top: 0.5rem;
}

.justify-between {
  justify-content: space-between;
}

.text-slate-800 {
  color: #1e293b;
}

.font-medium {
  font-weight: 500;
}

.w-24 {
  width: 6rem;
}

.bg-slate-100 {
  background-color: #f1f5f9;
}

.rounded-full {
  border-radius: 9999px;
}

.h-2 {
  height: 0.5rem;
}

.overflow-hidden {
  overflow: hidden;
}

.w-8 {
  width: 2rem;
}

.text-right {
  text-align: right;
}

.gap-6 {
  gap: 1.5rem;
}

.gauge-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.status-wrapper {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.status-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-label {
  color: #475569;
}

.status-value {
  font-weight: 600;
  color: #1e293b;
}

.w-2 {
  width: 0.5rem;
}

.h-2 {
  height: 0.5rem;
}

.rounded-full {
  border-radius: 9999px;
}

.bg-green-500 {
  background-color: #22c55e;
}

.bg-red-500 {
  background-color: #ef4444;
}

.server-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.server-content {
  display: flex;
  gap: 1rem;
  flex: 1;
  min-height: 0;
}

.gauge-section {
  flex: 1.0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.video-player-section {
  flex: 0.5;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 45%;
}

.video-player {
  width: 100%;
  aspect-ratio: 4 / 3;
  background-color: #000000;
  border-radius: 0.5rem;
  overflow: hidden;
  position: relative;
}

.video-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.live-badge {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  background-color: #dc2626;
  padding: 0.25rem 0.5rem;
  border-radius: 0.125rem;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.live-dot {
  width: 0.375rem;
  height: 0.375rem;
  background-color: #ffffff;
  border-radius: 50%;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.live-text {
  font-size: 0.75rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.025em;
}

.video-button {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background-color: #2563eb;
  color: #ffffff;
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
}

.video-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-icon {
  color: #ffffff;
  opacity: 0.3;
}

.video-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #1e293b;
  font-weight: 500;
}

.location-panel-container {
  background-color: #ffffff;
  border-radius: 1rem;
  padding: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border-width: 2px;
  border-color: #e2e8f0;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
</style>

