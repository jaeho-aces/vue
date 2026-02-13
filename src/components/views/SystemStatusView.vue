<template>
  <div class="flex flex-col w-full p-0 h-[calc(100vh-70px-48px)] max-h-[calc(100vh-70px-48px)] overflow-hidden">
    <!-- Top: Camera Status Summary (Compacted) -->
    <div class="bg-white rounded-2xl px-4 py-3 shadow-md border-2 border-slate-200 mb-3 w-full shrink-0">
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
    <div class="grid grid-cols-3 gap-4 mb-3 w-full relative z-[1] shrink-0">
      <!-- Left: User Connections -->
      <div class="system-status-chart-card">
        <h3 class="system-status-chart-title">
          <Users :size="16" class="text-cyan-600" /> 실시간 접속자 추이
        </h3>
        <div class="flex-1 min-h-0 overflow-hidden">
          <AreaChart :data="userData" color="#0891b2" label="접속자 수" />
        </div>
      </div>

      <!-- Right: Network Bandwidth -->
      <div class="system-status-chart-card">
        <h3 class="system-status-chart-title">
          <Wifi :size="16" class="text-indigo-500" /> 네트워크 대역폭
        </h3>
        <div class="flex-1 min-h-0 overflow-hidden">
          <AreaChart :data="networkData" color="#6366f1" label="대역폭 (Mbps)" />
        </div>
      </div>

      <!-- Right: Recent Alert Logs -->
      <div class="system-status-chart-card">
        <h3 class="system-status-chart-title-small">
          <Bell :size="16" class="text-orange-500" /> 최근 알림 로그
        </h3>
        <div class="flex-1 min-h-0 flex flex-col gap-1.5 overflow-hidden">
          <div
            v-for="log in displayedLogs"
            :key="log.id"
            class="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0 hover:bg-slate-50 hover:px-1 hover:rounded transition-colors"
          >
            <div class="flex items-center gap-2 truncate flex-1 min-w-0">
              <span
                :class="[
                  'w-2 h-2 rounded-full shrink-0',
                  log.type === 'success' ? 'bg-green-500' :
                  log.type === 'warning' ? 'bg-orange-400' :
                  log.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                ]"
              ></span>
              <span class="text-slate-700 truncate font-medium text-xs">{{ log.message }}</span>
            </div>
            <span class="text-[10px] text-slate-400 font-mono shrink-0 ml-2">{{ log.time }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Split: Locations -->
    <div class="grid grid-cols-2 gap-4 w-full flex-1 min-h-0 overflow-hidden relative z-[1]">
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
