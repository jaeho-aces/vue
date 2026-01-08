<template>
  <div class="system-status-container">
    <!-- Top: Camera Status Summary (Compacted) -->
    <div class="camera-status-section">
      <div class="flex items-center gap-6">
        <h3 class="text-base font-bold text-slate-800 shrink-0 mr-4">전체 카메라 현황</h3>

        <div class="flex-1 flex items-center gap-4">
          <div class="flex-1 bg-slate-50 rounded-lg px-3 py-2 flex items-center justify-between border border-slate-100">
            <span class="text-slate-500 text-sm font-medium flex items-center gap-2">
              <Video :size="16" class="text-green-500" /> 전체
            </span>
            <span class="text-2xl font-bold text-slate-800">242</span>
          </div>
          <div class="flex-1 bg-green-50 rounded-lg px-3 py-2 flex items-center justify-between border border-green-100">
            <span class="text-green-700 text-sm font-medium flex items-center gap-2">
              <CheckCircle :size="16" /> 정상
            </span>
            <span class="text-2xl font-bold text-green-700">225</span>
          </div>
          <div class="flex-1 bg-red-50 rounded-lg px-3 py-2 flex items-center justify-between border border-red-100">
            <span class="text-red-700 text-sm font-medium flex items-center gap-2">
              <AlertTriangle :size="16" /> 장애
            </span>
            <span class="text-2xl font-bold text-red-700">17</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Middle: Split Charts -->
    <div class="charts-section">
      <!-- Left: User Connections -->
      <div class="chart-card">
        <h3 class="chart-title">
          <Users :size="16" class="text-cyan-600" /> 실시간 접속자 추이
        </h3>
        <div class="chart-content">
          <AreaChart :data="userData" color="#0891b2" label="접속자 수" />
        </div>
      </div>

      <!-- Right: Network Bandwidth -->
      <div class="chart-card">
        <h3 class="chart-title">
          <Wifi :size="16" class="text-indigo-500" /> 네트워크 대역폭
        </h3>
        <div class="chart-content">
          <AreaChart :data="networkData" color="#6366f1" label="대역폭 (Mbps)" />
        </div>
      </div>

      <!-- Right: Recent Alert Logs -->
      <div class="chart-card">
        <h3 class="chart-title-small">
          <Bell :size="16" class="text-orange-500" /> 최근 알림 로그
        </h3>
        <div class="log-content">
          <div
            v-for="log in displayedLogs"
            :key="log.id"
            class="log-item"
          >
            <div class="log-item-content">
              <span
                :class="[
                  'log-dot',
                  log.type === 'success' ? 'bg-green-500' :
                  log.type === 'warning' ? 'bg-orange-400' :
                  log.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                ]"
              ></span>
              <span class="log-message">{{ log.message }}</span>
            </div>
            <span class="log-time">{{ log.time }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Split: Locations -->
    <div class="locations-section">
      <LocationPanelExtended
        title="김천 본사"
        :icon="LayoutDashboard"
        color-class="text-indigo-600"
        :video-server-data="[{ name: '정상', value: 78, color: '#10B981' }, { name: '장애', value: 4, color: '#EF4444' }]"
        :media-server-data="[{ name: '정상', value: 28, color: '#10B981' }, { name: '장애', value: 0, color: '#EF4444' }]"
      />
      <LocationPanelExtended
        title="교통 센터"
        :icon="Activity"
        color-class="text-rose-600"
        :video-server-data="[{ name: '정상', value: 62, color: '#10B981' }, { name: '장애', value: 5, color: '#EF4444' }]"
        :media-server-data="[{ name: '정상', value: 18, color: '#10B981' }, { name: '장애', value: 2, color: '#EF4444' }]"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Video, CheckCircle, AlertTriangle, Users, Wifi, Bell, LayoutDashboard, Activity } from 'lucide-vue-next'
import LocationPanelExtended from '../shared/LocationPanelExtended.vue'
import AreaChart from '../common/AreaChart.vue'

interface NetworkData {
  time: string
  value: number
}

interface UserData {
  time: string
  value: number
}

interface AlertLog {
  id: number
  time: string
  message: string
  type: string
}

interface Props {
  networkData?: NetworkData[]
  userData?: UserData[]
  alertLogs?: AlertLog[]
}

const props = withDefaults(defineProps<Props>(), {
  networkData: () => [
    { time: '00:00', value: 45 },
    { time: '04:00', value: 52 },
    { time: '08:00', value: 68 },
    { time: '12:00', value: 75 },
    { time: '16:00', value: 82 },
    { time: '20:00', value: 65 },
    { time: '24:00', value: 48 }
  ],
  userData: () => [
    { time: '00:00', value: 12 },
    { time: '04:00', value: 8 },
    { time: '08:00', value: 35 },
    { time: '12:00', value: 48 },
    { time: '16:00', value: 52 },
    { time: '20:00', value: 38 },
    { time: '24:00', value: 15 }
  ],
  alertLogs: () => [
    { id: 1, time: '14:23:15', message: '시스템 정상 작동 중', type: 'success' },
    { id: 2, time: '14:20:10', message: '서버 부하율 증가 감지', type: 'warning' },
    { id: 3, time: '14:15:05', message: '네트워크 연결 복구 완료', type: 'success' },
    { id: 4, time: '14:10:30', message: '카메라 #03 응답 지연', type: 'warning' },
    { id: 5, time: '14:05:20', message: '데이터베이스 백업 완료', type: 'success' }
  ]
})

// 화면에 맞는 개수만 표시 (스크롤 없이)
const displayedLogs = computed(() => {
  // 3개만 표시
  return props.alertLogs.slice(0, 3)
})
</script>

<style scoped>
/* Tailwind CSS 유틸리티 클래스들 */
.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.gap-4 {
  gap: 1rem;
}

.h-full {
  height: 100%;
}

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

.shrink-0 {
  flex-shrink: 0;
}

.flex-shrink-0 {
  flex-shrink: 0;
}

.overflow-hidden {
  overflow: hidden;
}

.items-center {
  align-items: center;
}

.gap-6 {
  gap: 1.5rem;
}

.text-base {
  font-size: 1rem;
  line-height: 1.5rem;
}

.font-bold {
  font-weight: 700;
}

.text-slate-800 {
  color: #1e293b;
}

.mr-4 {
  margin-right: 1rem;
}

.flex-1 {
  flex: 1 1 0%;
}

.gap-4 {
  gap: 1rem;
}

.bg-slate-50 {
  background-color: #f8fafc;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.px-3 {
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.justify-between {
  justify-content: space-between;
}

.border-slate-100 {
  border-color: #f1f5f9;
}

.text-slate-500 {
  color: #64748b;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.font-medium {
  font-weight: 500;
}

.gap-2 {
  gap: 0.5rem;
}

.text-2xl {
  font-size: 1.5rem;
  line-height: 2rem;
}

.text-green-50 {
  background-color: #f0fdf4;
}

.border-green-100 {
  border-color: #dcfce7;
}

.text-green-700 {
  color: #15803d;
}

.bg-red-50 {
  background-color: #fef2f2;
}

.border-red-100 {
  border-color: #fee2e2;
}

.text-red-700 {
  color: #b91c1c;
}

.grid {
  display: grid;
}

.grid-cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.h-48 {
  height: 12rem;
}

.border-slate-200 {
  border-color: #e2e8f0;
}

.mb-4 {
  margin-bottom: 1rem;
}

.text-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}

.text-cyan-600 {
  color: #0891b2;
}

.text-indigo-500 {
  color: #6366f1;
}

.min-h-0 {
  min-height: 0;
}

.justify-center {
  justify-content: center;
}

.text-slate-400 {
  color: #94a3b8;
}

.text-orange-500 {
  color: #f97316;
}

.overflow-hidden {
  overflow: hidden;
}

.relative {
  position: relative;
}

.absolute {
  position: absolute;
}

.inset-0 {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.overflow-y-auto {
  overflow-y: auto;
}

.custom-scrollbar {
  scrollbar-width: thin;
}

.pr-2 {
  padding-right: 0.5rem;
}

.gap-3 {
  gap: 0.75rem;
}

.py-1 {
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}

.border-b {
  border-bottom-width: 1px;
}

.border-slate-50 {
  border-color: #f8fafc;
}

.last\:border-0:last-child {
  border-width: 0;
}

.hover\:bg-slate-50:hover {
  background-color: #f8fafc;
}

.transition-colors {
  transition-property: color, background-color, border-color;
}

.px-1 {
  padding-left: 0.25rem;
  padding-right: 0.25rem;
}

.rounded {
  border-radius: 0.25rem;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.min-w-0 {
  min-width: 0;
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

.bg-orange-400 {
  background-color: #fb923c;
}

.bg-red-500 {
  background-color: #ef4444;
}

.bg-blue-500 {
  background-color: #3b82f6;
}

.text-slate-700 {
  color: #334155;
}

.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
}

.ml-2 {
  margin-left: 0.5rem;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.system-status-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0;
  height: calc(100vh - 70px - 48px); /* 1080px - header 70px - padding 48px */
  max-height: calc(100vh - 70px - 48px);
  overflow: hidden;
}

.camera-status-section {
  background-color: #ffffff;
  border-radius: 1rem;
  padding: 0.75rem 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border-width: 2px;
  border-color: #e2e8f0;
  margin-bottom: 0.75rem;
  width: 100%;
  flex-shrink: 0;
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 0.75rem;
  width: 100%;
  position: relative;
  z-index: 1;
  flex-shrink: 0;
}

.chart-card {
  background-color: #ffffff;
  border-radius: 1rem;
  padding: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border-width: 2px;
  border-color: #e2e8f0;
  display: flex;
  flex-direction: column;
  height: 8.5rem;
}

.chart-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.chart-title-small {
  font-size: 0.875rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.375rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.chart-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.log-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  overflow: hidden;
}

.log-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  border-bottom: 1px solid #f8fafc;
}

.log-item:last-child {
  border-bottom: none;
}

.log-item:hover {
  background-color: #f8fafc;
  transition: background-color 0.15s;
  padding-left: 0.25rem;
  padding-right: 0.25rem;
  border-radius: 0.25rem;
}

.log-item-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.log-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.log-message {
  color: #334155;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
  font-size: 0.75rem;
}

.log-time {
  font-size: 0.625rem;
  color: #94a3b8;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  flex-shrink: 0;
  margin-left: 0.5rem;
}

.locations-section {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  width: 100%;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  position: relative;
  z-index: 1;
}
</style>

