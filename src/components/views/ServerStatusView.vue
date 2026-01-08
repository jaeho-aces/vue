<template>
  <div class="flex-1 flex flex-col gap-4 min-h-0">
    <!-- Server Overview Cards -->
    <div class="grid grid-cols-4 gap-4 shrink-0">
      <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-slate-500">전체 서버</span>
          <Activity :size="16" class="text-blue-500" />
        </div>
        <div class="text-2xl font-bold text-slate-800">{{ serverData.length }}</div>
        <div class="text-xs text-slate-400 mt-1">대</div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-slate-500">정상</span>
          <CheckCircle :size="16" class="text-green-500" />
        </div>
        <div class="text-2xl font-bold text-green-600">{{ normalCount }}</div>
        <div class="text-xs text-slate-400 mt-1">{{ normalPercentage }}%</div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-slate-500">경고</span>
          <AlertTriangle :size="16" class="text-orange-500" />
        </div>
        <div class="text-2xl font-bold text-orange-600">{{ warningCount }}</div>
        <div class="text-xs text-slate-400 mt-1">{{ warningPercentage }}%</div>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-slate-500">평균 CPU</span>
          <Activity :size="16" class="text-indigo-500" />
        </div>
        <div class="text-2xl font-bold text-indigo-600">{{ averageCpu }}%</div>
        <div class="text-xs text-slate-400 mt-1">정상 범위</div>
      </div>
    </div>

    <!-- View Toggle and Content -->
    <div class="flex-1 flex flex-col min-h-0 bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div class="p-4 border-b border-slate-200 flex items-center justify-between shrink-0">
        <div class="tab-container">
          <button
            @click="handleServerFilterChange('transcoding')"
            :class="[
              'tab-button',
              serverFilter === 'transcoding' ? 'tab-button-active' : 'tab-button-inactive'
            ]"
          >
            변환/분배 서버
          </button>
          <button
            @click="handleServerFilterChange('media')"
            :class="[
              'tab-button',
              serverFilter === 'media' ? 'tab-button-active' : 'tab-button-inactive'
            ]"
          >
            미디어 서버
          </button>
        </div>

        <div class="view-toggle-buttons">
          <button
            @click="handleServerViewModeChange('grid')"
            :class="['view-toggle-btn', { 'view-toggle-btn-active': serverViewMode === 'grid' }]"
          >
            <Grid3x3 :size="20" />
          </button>
          <button
            @click="handleServerViewModeChange('chart')"
            :class="['view-toggle-btn', { 'view-toggle-btn-active': serverViewMode === 'chart' }]"
          >
            <Activity :size="20" />
          </button>
        </div>
      </div>

      <!-- Server List Content -->
      <div class="flex-1 overflow-hidden flex flex-col">
        <div v-if="currentServers.length === 0" class="flex-1 flex items-center justify-center text-slate-400">
          데이터가 없습니다.
        </div>
        <div v-else-if="serverViewMode === 'grid'" class="flex-1 overflow-auto custom-scrollbar">
          <table class="w-full">
            <thead class="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th class="text-left p-3 text-sm font-semibold text-slate-600 border-b border-slate-200">서버명</th>
                <th class="text-left p-3 text-sm font-semibold text-slate-600 border-b border-slate-200">위치</th>
                <th class="text-left p-3 text-sm font-semibold text-slate-600 border-b border-slate-200">상태</th>
                <th class="text-left p-3 text-sm font-semibold text-slate-600 border-b border-slate-200">CPU</th>
                <th class="text-left p-3 text-sm font-semibold text-slate-600 border-b border-slate-200">메모리</th>
                <th class="text-left p-3 text-sm font-semibold text-slate-600 border-b border-slate-200">디스크</th>
                <th class="text-left p-3 text-sm font-semibold text-slate-600 border-b border-slate-200">네트워크</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(server, idx) in currentServers"
                :key="idx"
                class="border-b border-slate-50 hover:bg-slate-50 transition-colors"
              >
                <td class="p-3">
                  <div class="font-medium text-slate-700">{{ server.name }}</div>
                </td>
                <td class="p-3 text-sm text-slate-600">{{ server.location }}</td>
                <td class="p-3">
                  <span
                    :class="[
                      'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                      server.status === 'normal' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'
                    ]"
                  >
                    <span
                      :class="[
                        'w-1.5 h-1.5 rounded-full',
                        server.status === 'normal' ? 'bg-green-500' : 'bg-orange-500'
                      ]"
                    ></span>
                    {{ server.status === 'normal' ? '정상' : '경고' }}
                  </span>
                </td>
                <td class="p-3">
                  <div class="grid-progress-container">
                    <div class="grid-progress-bar">
                      <div
                        class="grid-progress-fill"
                        :class="server.cpu > 70 ? 'grid-progress-warning' : 'grid-progress-cpu'"
                        :style="{ width: `${server.cpu}%` }"
                      ></div>
                    </div>
                    <span class="grid-progress-value">{{ server.cpu }}%</span>
                  </div>
                </td>
                <td class="p-3">
                  <div class="grid-progress-container">
                    <div class="grid-progress-bar">
                      <div
                        class="grid-progress-fill"
                        :class="server.memory > 70 ? 'grid-progress-warning' : 'grid-progress-memory'"
                        :style="{ width: `${server.memory}%` }"
                      ></div>
                    </div>
                    <span class="grid-progress-value">{{ server.memory }}%</span>
                  </div>
                </td>
                <td class="p-3">
                  <div class="grid-progress-container">
                    <div class="grid-progress-bar">
                      <div
                        class="grid-progress-fill"
                        :class="server.disk > 70 ? 'grid-progress-warning' : 'grid-progress-disk'"
                        :style="{ width: `${server.disk}%` }"
                      ></div>
                    </div>
                    <span class="grid-progress-value">{{ server.disk }}%</span>
                  </div>
                </td>
                <td class="p-3">
                  <span class="text-sm font-medium text-slate-600">{{ server.network }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="flex-1 overflow-auto custom-scrollbar p-6">
          <div class="grid grid-cols-6 gap-4">
            <div
              v-for="(server, idx) in currentServers"
              :key="idx"
              class="server-card"
            >
              <!-- Header -->
              <div class="server-card-header">
                <div class="server-icon-wrapper">
                  <Server :size="24" class="server-icon" />
                </div>
                <div class="server-title-section">
                  <h3 class="server-title">{{ server.name }}</h3>
                  <div class="server-status-badge">
                    <CheckCircle :size="14" />
                    <span>정상</span>
                  </div>
                </div>
              </div>

              <!-- Location and IP -->
              <div class="server-location">
                <MapPin :size="14" class="location-icon" />
                <span>{{ server.location }}</span>
                <span class="server-ip">{{ server.ip || '192.168.1.10' + (idx + 1) }}</span>
              </div>

              <!-- Uptime -->
              <div class="server-uptime">
                <Clock :size="14" class="uptime-icon" />
                <span>{{ server.uptime || `${90 + idx * 5}일 ${10 + idx * 2}시간` }}</span>
              </div>

              <!-- Resource Usage -->
              <div class="server-resources">
                <!-- CPU -->
                <div class="resource-item">
                  <div class="resource-header">
                    <Activity :size="16" class="resource-icon cpu-icon" />
                    <span class="resource-label">CPU</span>
                    <span class="resource-value cpu-value">{{ server.cpu }}%</span>
                  </div>
                  <div class="progress-bar">
                    <div
                      class="progress-fill cpu-fill"
                      :style="{ width: `${server.cpu}%` }"
                    ></div>
                  </div>
                </div>

                <!-- Memory -->
                <div class="resource-item">
                  <div class="resource-header">
                    <Database :size="16" class="resource-icon memory-icon" />
                    <span class="resource-label">메모리</span>
                    <span class="resource-value memory-value">{{ server.memory }}%</span>
                  </div>
                  <div class="progress-bar">
                    <div
                      class="progress-fill memory-fill"
                      :style="{ width: `${server.memory}%` }"
                    ></div>
                  </div>
                </div>

                <!-- Disk -->
                <div class="resource-item">
                  <div class="resource-header">
                    <HardDrive :size="16" class="resource-icon disk-icon" />
                    <span class="resource-label">디스크</span>
                    <span class="resource-value disk-value">{{ server.disk }}%</span>
                  </div>
                  <div class="progress-bar">
                    <div
                      class="progress-fill disk-fill"
                      :style="{ width: `${server.disk}%` }"
                    ></div>
                  </div>
                </div>

                <!-- Network -->
                <div class="resource-item">
                  <div class="resource-header">
                    <Wifi :size="16" class="resource-icon network-icon" />
                    <span class="resource-label">네트워크</span>
                    <span class="resource-value network-value">{{ server.network }}</span>
                  </div>
                  <div class="progress-bar">
                    <div
                      class="progress-fill network-fill"
                      :style="{ width: `${getNetworkPercentage(server.network)}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// 테스트 데이터 생성 함수 (모듈 스코프에서 선언)
interface Server {
  name: string
  location: string
  status: 'normal' | 'warning'
  cpu: number
  memory: number
  disk: number
  network: string
  ip?: string
  uptime?: string
}

function generateServerData(count: number): Server[] {
  const locations = ['김천 본사', '교통 센터', '서울 지사', '부산 지사', '대전 지사', '광주 지사', '인천 지사', '수원 지사']
  const networks = ['120 MB/s', '135 MB/s', '140 MB/s', '150 MB/s', '160 MB/s', '180 MB/s', '200 MB/s', '220 MB/s', '235 MB/s', '250 MB/s']
  const servers: Server[] = []
  
  for (let i = 1; i <= count; i++) {
    const location = locations[Math.floor(Math.random() * locations.length)]
    const status = Math.random() > 0.15 ? 'normal' : 'warning'
    const cpu = status === 'warning' 
      ? Math.floor(Math.random() * 20) + 75
      : Math.floor(Math.random() * 50) + 20
    const memory = status === 'warning'
      ? Math.floor(Math.random() * 20) + 75
      : Math.floor(Math.random() * 50) + 25
    const disk = status === 'warning'
      ? Math.floor(Math.random() * 20) + 75
      : Math.floor(Math.random() * 50) + 30
    const network = networks[Math.floor(Math.random() * networks.length)]
    const ip = `192.168.1.${100 + i}`
    const uptimeDays = Math.floor(Math.random() * 200) + 30
    const uptimeHours = Math.floor(Math.random() * 24)
    const uptime = `${uptimeDays}일 ${uptimeHours}시간`
    
    servers.push({
      name: `서버-${String(i).padStart(2, '0')}`,
      location,
      status: status as 'normal' | 'warning',
      cpu,
      memory,
      disk,
      network,
      ip,
      uptime
    })
  }
  return servers
}

function generateTranscodingServers(count: number): Server[] {
  const locations = ['김천 본사', '교통 센터', '서울 지사', '부산 지사', '대전 지사']
  const networks = ['120 MB/s', '135 MB/s', '140 MB/s', '150 MB/s', '160 MB/s', '180 MB/s', '200 MB/s']
  const servers: Server[] = []
  
  for (let i = 1; i <= count; i++) {
    const location = locations[Math.floor(Math.random() * locations.length)]
    const status = Math.random() > 0.2 ? 'normal' : 'warning'
    const cpu = status === 'warning'
      ? Math.floor(Math.random() * 20) + 75
      : Math.floor(Math.random() * 40) + 25
    const memory = status === 'warning'
      ? Math.floor(Math.random() * 20) + 75
      : Math.floor(Math.random() * 40) + 30
    const disk = status === 'warning'
      ? Math.floor(Math.random() * 20) + 75
      : Math.floor(Math.random() * 50) + 25
    const network = networks[Math.floor(Math.random() * networks.length)]
    const ip = `192.168.1.${150 + i}`
    const uptimeDays = Math.floor(Math.random() * 180) + 50
    const uptimeHours = Math.floor(Math.random() * 24)
    const uptime = `${uptimeDays}일 ${uptimeHours}시간`
    
    servers.push({
      name: `Media-${location.substring(0, 2)}-${String(i).padStart(2, '0')}`,
      location,
      status: status as 'normal' | 'warning',
      cpu,
      memory,
      disk,
      network,
      ip,
      uptime
    })
  }
  return servers
}

function generateMediaServers(count: number): Server[] {
  const locations = ['김천 본사', '교통 센터', '서울 지사', '부산 지사', '대전 지사', '광주 지사']
  const networks = ['150 MB/s', '160 MB/s', '180 MB/s', '200 MB/s', '220 MB/s', '235 MB/s', '250 MB/s', '280 MB/s']
  const servers: Server[] = []
  
  for (let i = 1; i <= count; i++) {
    const location = locations[Math.floor(Math.random() * locations.length)]
    const status = Math.random() > 0.2 ? 'normal' : 'warning'
    const cpu = status === 'warning'
      ? Math.floor(Math.random() * 20) + 75
      : Math.floor(Math.random() * 45) + 25
    const memory = status === 'warning'
      ? Math.floor(Math.random() * 20) + 75
      : Math.floor(Math.random() * 45) + 25
    const disk = status === 'warning'
      ? Math.floor(Math.random() * 20) + 75
      : Math.floor(Math.random() * 50) + 20
    const network = networks[Math.floor(Math.random() * networks.length)]
    const ip = `192.168.1.${200 + i}`
    const uptimeDays = Math.floor(Math.random() * 200) + 40
    const uptimeHours = Math.floor(Math.random() * 24)
    const uptime = `${uptimeDays}일 ${uptimeHours}시간`
    
    servers.push({
      name: `Media-${location.substring(0, 2)}-${String(i).padStart(2, '0')}`,
      location,
      status: status as 'normal' | 'warning',
      cpu,
      memory,
      disk,
      network,
      ip,
      uptime
    })
  }
  return servers
}

// 기본값을 모듈 스코프에서 생성 (같은 파일의 <script setup>에서 사용 가능)
const defaultServerData = generateServerData(50)
const defaultTranscodingServers = generateTranscodingServers(30)
const defaultMediaServers = generateMediaServers(40)
</script>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Activity, CheckCircle, AlertTriangle, Grid3x3, Server, MapPin, Clock, Database, HardDrive, Wifi } from 'lucide-vue-next'

interface Server {
  name: string
  location: string
  status: 'normal' | 'warning'
  cpu: number
  memory: number
  disk: number
  network: string
  ip?: string
  uptime?: string
}

interface Props {
  serverData?: Server[]
  transcodingServers?: Server[]
  mediaServers?: Server[]
  serverFilter?: 'transcoding' | 'media'
  serverViewMode?: 'grid' | 'chart'
}

const props = withDefaults(defineProps<Props>(), {
  serverData: () => defaultServerData,
  transcodingServers: () => defaultTranscodingServers,
  mediaServers: () => defaultMediaServers,
  serverFilter: 'transcoding',
  serverViewMode: 'grid'
})

const serverFilter = ref(props.serverFilter)
const serverViewMode = ref(props.serverViewMode)

const normalCount = computed(() => props.serverData.filter(s => s.status === 'normal').length)
const warningCount = computed(() => props.serverData.filter(s => s.status === 'warning').length)
const normalPercentage = computed(() => ((normalCount.value / props.serverData.length) * 100).toFixed(1))
const warningPercentage = computed(() => ((warningCount.value / props.serverData.length) * 100).toFixed(1))
const averageCpu = computed(() => Math.round(props.serverData.reduce((sum, s) => sum + s.cpu, 0) / props.serverData.length))

const currentServers = computed(() => {
  return serverFilter.value === 'transcoding' ? props.transcodingServers : props.mediaServers
})

const handleServerFilterChange = (filter: 'transcoding' | 'media') => {
  serverFilter.value = filter
}

const handleServerViewModeChange = (mode: 'grid' | 'chart') => {
  serverViewMode.value = mode
}

const getNetworkPercentage = (network: string): number => {
  // "140 MB/s" 형식에서 숫자 추출
  const match = network.match(/(\d+)/)
  if (match) {
    const value = parseInt(match[1])
    // 최대 1000 MB/s 기준으로 비율 계산 (최대 50%로 제한)
    return Math.min((value / 1000) * 50, 50)
  }
  return 20
}
</script>

<style scoped>
/* 필요한 Tailwind CSS 유틸리티 클래스들 */
.flex-1 {
  flex: 1 1 0%;
}

.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.gap-4 {
  gap: 1rem;
}

.min-h-0 {
  min-height: 0;
}

.grid {
  display: grid;
}

.grid-cols-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.grid-cols-6 {
  grid-template-columns: repeat(6, minmax(0, 1fr));
}

.shrink-0 {
  flex-shrink: 0;
}

.bg-white {
  background-color: #ffffff;
}

.rounded-xl {
  border-radius: 0.75rem;
}

.p-4 {
  padding: 1rem;
}

.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.border {
  border-width: 1px;
}

.border-slate-100 {
  border-color: #f1f5f9;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-slate-500 {
  color: #64748b;
}

.text-2xl {
  font-size: 1.5rem;
  line-height: 2rem;
}

.font-bold {
  font-weight: 700;
}

.text-slate-800 {
  color: #1e293b;
}

.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.text-slate-400 {
  color: #94a3b8;
}

.mt-1 {
  margin-top: 0.25rem;
}

.text-green-600 {
  color: #16a34a;
}

.text-orange-600 {
  color: #ea580c;
}

.text-indigo-600 {
  color: #4f46e5;
}

.border-slate-200 {
  border-color: #e2e8f0;
}

.overflow-hidden {
  overflow: hidden;
}

.p-4 {
  padding: 1rem;
}

.border-b {
  border-bottom-width: 1px;
}

.bg-slate-100 {
  background-color: #f1f5f9;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.p-1 {
  padding: 0.25rem;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.rounded-md {
  border-radius: 0.375rem;
}

.transition-all {
  transition-property: all;
}

.text-blue-600 {
  color: #2563eb;
}

.text-slate-500 {
  color: #64748b;
}

.hover\:text-slate-700:hover {
  color: #334155;
}

.gap-2 {
  gap: 0.5rem;
}

.p-2 {
  padding: 0.5rem;
}

.transition-colors {
  transition-property: color, background-color, border-color;
}

.text-slate-400 {
  color: #94a3b8;
}

.hover\:bg-slate-50:hover {
  background-color: #f8fafc;
}

.overflow-auto {
  overflow: auto;
}

.custom-scrollbar {
  scrollbar-width: thin;
}

.w-full {
  width: 100%;
}

.bg-slate-50 {
  background-color: #f8fafc;
}

.sticky {
  position: sticky;
}

.top-0 {
  top: 0;
}

.z-10 {
  z-index: 10;
}

.text-left {
  text-align: left;
}

.p-3 {
  padding: 0.75rem;
}

.font-semibold {
  font-weight: 600;
}

.text-slate-600 {
  color: #475569;
}

.border-slate-50 {
  border-color: #f8fafc;
}

.hover\:bg-slate-50:hover {
  background-color: #f8fafc;
}

.font-medium {
  font-weight: 500;
}

.text-slate-700 {
  color: #334155;
}

.inline-flex {
  display: inline-flex;
}

.gap-1 {
  gap: 0.25rem;
}

.px-2 {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.py-1 {
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}

.rounded-full {
  border-radius: 9999px;
}

.bg-green-50 {
  background-color: #f0fdf4;
}

.text-green-700 {
  color: #15803d;
}

.bg-orange-50 {
  background-color: #fff7ed;
}

.text-orange-700 {
  color: #c2410c;
}

.w-1\.5 {
  width: 0.375rem;
}

.h-1\.5 {
  height: 0.375rem;
}

.bg-green-500 {
  background-color: #22c55e;
}

.bg-orange-500 {
  background-color: #f97316;
}

.rounded-full {
  border-radius: 9999px;
}

.h-2 {
  height: 0.5rem;
}

.w-24 {
  width: 6rem;
}

.w-1\.5 {
  width: 0.375rem;
}

.h-1\.5 {
  height: 0.375rem;
}

.h-2 {
  height: 0.5rem;
}

.inline-flex {
  display: inline-flex;
}

.gap-1 {
  gap: 0.25rem;
}

.px-2 {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.py-1 {
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}

.bg-green-50 {
  background-color: #f0fdf4;
}

.text-green-700 {
  color: #15803d;
}

.bg-orange-50 {
  background-color: #fff7ed;
}

.text-orange-700 {
  color: #c2410c;
}

.bg-blue-500 {
  background-color: #3b82f6;
}

.bg-indigo-500 {
  background-color: #6366f1;
}

.w-8 {
  width: 2rem;
}

.text-right {
  text-align: right;
}

.p-6 {
  padding: 1.5rem;
}

.text-center {
  text-align: center;
}

/* 탭 버튼 스타일 */
.tab-container {
  display: flex;
  background-color: #f1f5f9;
  border-radius: 0.5rem;
  padding: 0.25rem;
  border: 1px solid #e2e8f0;
  gap: 0.25rem;
}

.tab-button {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 700;
  transition: all 0.15s;
  border: none;
  cursor: pointer;
  background: transparent;
}

.tab-button-active {
  background-color: #ffffff;
  color: #2563eb;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.tab-button-inactive {
  color: #64748b;
  background: transparent;
}

.tab-button-inactive:hover {
  color: #334155;
}

.font-bold {
  font-weight: 700;
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.text-blue-600 {
  color: #2563eb;
}

.hover\:text-slate-700:hover {
  color: #334155;
}

.transition-colors {
  transition-property: color, background-color, border-color;
}

.text-slate-400 {
  color: #94a3b8;
}

.hover\:bg-slate-50:hover {
  background-color: #f8fafc;
}

/* View Toggle Buttons */
.view-toggle-buttons {
  display: flex;
  gap: 0.5rem;
}

.view-toggle-btn {
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background-color: #f8fafc;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.view-toggle-btn:hover {
  background-color: #f1f5f9;
  border-color: #cbd5e1;
}

.view-toggle-btn-active {
  background-color: #ffffff;
  border-color: #cbd5e1;
  color: #2563eb;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

/* Server Card Styles */
.server-card {
  background-color: #ffffff;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  padding: 1.25rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.server-card-header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.server-icon-wrapper {
  width: 2.5rem;
  height: 2.5rem;
  background-color: #eff6ff;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.server-icon {
  color: #2563eb;
}

.server-title-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.server-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.server-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  background-color: #f0fdf4;
  color: #15803d;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  width: fit-content;
}

.server-location {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.75rem;
}

.location-icon {
  color: #94a3b8;
  flex-shrink: 0;
}

.server-ip {
  color: #475569;
  font-weight: 500;
  margin-left: 0.25rem;
}

.server-uptime {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 1.25rem;
}

.uptime-icon {
  color: #94a3b8;
  flex-shrink: 0;
}

.server-resources {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.resource-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.resource-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.resource-icon {
  flex-shrink: 0;
}

.cpu-icon {
  color: #3b82f6;
}

.memory-icon {
  color: #22c55e;
}

.disk-icon {
  color: #f97316;
}

.network-icon {
  color: #a855f7;
}

.resource-label {
  font-size: 0.875rem;
  color: #475569;
  flex: 1;
}

.resource-value {
  font-size: 0.875rem;
  font-weight: 600;
}

.cpu-value {
  color: #3b82f6;
}

.memory-value {
  color: #22c55e;
}

.disk-value {
  color: #f97316;
}

.network-value {
  color: #a855f7;
}

.progress-bar {
  width: 100%;
  height: 0.5rem;
  background-color: #f1f5f9;
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.3s ease;
}

.cpu-fill {
  background-color: #3b82f6;
}

.memory-fill {
  background-color: #22c55e;
}

.disk-fill {
  background-color: #f97316;
}

.network-fill {
  background-color: #a855f7;
}

/* Grid View Progress Bars */
.grid-progress-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.grid-progress-bar {
  flex: 1;
  width: 6rem;
  height: 0.5rem;
  background-color: #f1f5f9;
  border-radius: 9999px;
  overflow: hidden;
}

.grid-progress-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.3s ease;
}

.grid-progress-cpu {
  background-color: #3b82f6;
}

.grid-progress-memory {
  background-color: #22c55e;
}

.grid-progress-disk {
  background-color: #6366f1;
}

.grid-progress-warning {
  background-color: #f97316;
}

.grid-progress-value {
  font-size: 0.75rem;
  font-weight: 500;
  color: #475569;
  width: 2rem;
  text-align: right;
  flex-shrink: 0;
}
</style>
