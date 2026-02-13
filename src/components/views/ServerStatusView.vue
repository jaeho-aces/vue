<template>
  <div class="flex-1 flex flex-col gap-4 min-h-0">
    <!-- Server Overview Cards -->
    <div class="grid grid-cols-4 gap-4 shrink-0">
      <div class="server-status-overview-card">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-slate-500">?? ??</span>
          <Activity :size="16" class="text-blue-500" />
        </div>
        <div class="text-2xl font-bold text-slate-800">{{ serverData.length }}</div>
        <div class="text-xs text-slate-400 mt-1">?</div>
      </div>
      <div class="server-status-overview-card">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-slate-500">??</span>
          <CheckCircle :size="16" class="text-green-500" />
        </div>
        <div class="text-2xl font-bold text-green-600">{{ normalCount }}</div>
        <div class="text-xs text-slate-400 mt-1">{{ normalPercentage }}%</div>
      </div>
      <div class="server-status-overview-card">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-slate-500">??</span>
          <AlertTriangle :size="16" class="text-orange-500" />
        </div>
        <div class="text-2xl font-bold text-orange-600">{{ warningCount }}</div>
        <div class="text-xs text-slate-400 mt-1">{{ warningPercentage }}%</div>
      </div>
      <div class="server-status-overview-card">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-slate-500">?? CPU</span>
          <Activity :size="16" class="text-indigo-500" />
        </div>
        <div class="text-2xl font-bold text-indigo-600">{{ averageCpu }}%</div>
        <div class="text-xs text-slate-400 mt-1">?? ??</div>
      </div>
    </div>

    <!-- View Toggle and Content -->
    <div class="flex-1 flex flex-col min-h-0 bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div class="p-4 border-b border-slate-200 flex items-center justify-between shrink-0">
        <div class="server-status-tab-container">
          <button
            @click="handleServerFilterChange('transcoding')"
            :class="[
              'server-status-tab-button',
              serverFilter === 'transcoding' ? 'server-status-tab-button-active' : 'server-status-tab-button-inactive'
            ]"
          >
            ??/?? ??
          </button>
          <button
            @click="handleServerFilterChange('media')"
            :class="[
              'server-status-tab-button',
              serverFilter === 'media' ? 'server-status-tab-button-active' : 'server-status-tab-button-inactive'
            ]"
          >
            ??? ??
          </button>
        </div>

        <div class="server-status-view-toggle-buttons">
          <button
            @click="handleServerViewModeChange('grid')"
            :class="['server-status-view-toggle-btn', { 'server-status-view-toggle-btn-active': serverViewMode === 'grid' }]"
          >
            <Grid3x3 :size="20" />
          </button>
          <button
            @click="handleServerViewModeChange('chart')"
            :class="['server-status-view-toggle-btn', { 'server-status-view-toggle-btn-active': serverViewMode === 'chart' }]"
          >
            <Activity :size="20" />
          </button>
        </div>
      </div>

      <!-- Server List Content -->
      <div class="flex-1 overflow-hidden flex flex-col">
        <div v-if="currentServers.length === 0" class="flex-1 flex items-center justify-center text-slate-400">
          ???? ????.
        </div>
        <div v-else-if="serverViewMode === 'grid'" class="flex-1 overflow-auto custom-scrollbar">
          <table class="w-full">
            <thead class="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th class="text-left p-3 text-sm font-semibold text-slate-600 border-b border-slate-200">???</th>
                <th class="text-left p-3 text-sm font-semibold text-slate-600 border-b border-slate-200">??</th>
                <th class="text-left p-3 text-sm font-semibold text-slate-600 border-b border-slate-200">??</th>
                <th class="text-left p-3 text-sm font-semibold text-slate-600 border-b border-slate-200">CPU</th>
                <th class="text-left p-3 text-sm font-semibold text-slate-600 border-b border-slate-200">???</th>
                <th class="text-left p-3 text-sm font-semibold text-slate-600 border-b border-slate-200">???</th>
                <th class="text-left p-3 text-sm font-semibold text-slate-600 border-b border-slate-200">????</th>
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
                    {{ server.status === 'normal' ? '??' : '??' }}
                  </span>
                </td>
                <td class="p-3">
                  <div class="server-status-grid-progress-container">
                    <div class="server-status-grid-progress-bar">
                      <div
                        class="server-status-grid-progress-fill"
                        :class="server.cpu > 70 ? 'bg-orange-500' : 'bg-blue-500'"
                        :style="{ width: `${server.cpu}%` }"
                      ></div>
                    </div>
                    <span class="server-status-grid-progress-value">{{ server.cpu }}%</span>
                  </div>
                </td>
                <td class="p-3">
                  <div class="server-status-grid-progress-container">
                    <div class="server-status-grid-progress-bar">
                      <div
                        class="server-status-grid-progress-fill"
                        :class="server.memory > 70 ? 'bg-orange-500' : 'bg-green-500'"
                        :style="{ width: `${server.memory}%` }"
                      ></div>
                    </div>
                    <span class="server-status-grid-progress-value">{{ server.memory }}%</span>
                  </div>
                </td>
                <td class="p-3">
                  <div class="server-status-grid-progress-container">
                    <div class="server-status-grid-progress-bar">
                      <div
                        class="server-status-grid-progress-fill"
                        :class="server.disk > 70 ? 'bg-orange-500' : 'bg-indigo-500'"
                        :style="{ width: `${server.disk}%` }"
                      ></div>
                    </div>
                    <span class="server-status-grid-progress-value">{{ server.disk }}%</span>
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
              class="server-status-server-card"
            >
              <!-- Header -->
              <div class="server-status-server-card-header">
                <div class="server-status-server-icon-wrapper">
                  <Server :size="24" class="text-blue-500" />
                </div>
                <div class="flex flex-1 flex-col gap-2">
                  <h3 class="server-status-server-title">{{ server.name }}</h3>
                  <div class="server-status-server-status-badge">
                    <CheckCircle :size="14" />
                    <span>??</span>
                  </div>
                </div>
              </div>

              <!-- Location and IP -->
              <div class="server-status-server-location">
                <MapPin :size="14" class="text-slate-400 shrink-0" />
                <span>{{ server.location }}</span>
                <span class="server-status-server-ip">{{ server.ip || '192.168.1.10' + (idx + 1) }}</span>
              </div>

              <!-- Uptime -->
              <div class="server-status-server-uptime">
                <Clock :size="14" class="text-slate-400 shrink-0" />
                <span>{{ server.uptime || `${90 + idx * 5}? ${10 + idx * 2}??` }}</span>
              </div>

              <!-- Resource Usage -->
              <div class="server-status-server-resources">
                <!-- CPU -->
                <div class="server-status-resource-item">
                  <div class="server-status-resource-header">
                    <Activity :size="16" class="shrink-0 text-blue-500" />
                    <span class="text-sm text-slate-600 flex-1">CPU</span>
                    <span class="text-sm font-semibold text-blue-600">{{ server.cpu }}%</span>
                  </div>
                  <div class="server-status-progress-bar">
                    <div
                      class="server-status-progress-fill bg-blue-500"
                      :style="{ width: `${server.cpu}%` }"
                    ></div>
                  </div>
                </div>

                <!-- Memory -->
                <div class="server-status-resource-item">
                  <div class="server-status-resource-header">
                    <Database :size="16" class="shrink-0 text-green-500" />
                    <span class="text-sm text-slate-600 flex-1">???</span>
                    <span class="text-sm font-semibold text-green-600">{{ server.memory }}%</span>
                  </div>
                  <div class="server-status-progress-bar">
                    <div
                      class="server-status-progress-fill bg-green-500"
                      :style="{ width: `${server.memory}%` }"
                    ></div>
                  </div>
                </div>

                <!-- Disk -->
                <div class="server-status-resource-item">
                  <div class="server-status-resource-header">
                    <HardDrive :size="16" class="shrink-0 text-orange-500" />
                    <span class="text-sm text-slate-600 flex-1">???</span>
                    <span class="text-sm font-semibold text-orange-600">{{ server.disk }}%</span>
                  </div>
                  <div class="server-status-progress-bar">
                    <div
                      class="server-status-progress-fill bg-orange-500"
                      :style="{ width: `${server.disk}%` }"
                    ></div>
                  </div>
                </div>

                <!-- Network -->
                <div class="server-status-resource-item">
                  <div class="server-status-resource-header">
                    <Wifi :size="16" class="shrink-0 text-purple-500" />
                    <span class="text-sm text-slate-600 flex-1">????</span>
                    <span class="text-sm font-semibold text-purple-600">{{ server.network }}</span>
                  </div>
                  <div class="server-status-progress-bar">
                    <div
                      class="server-status-progress-fill bg-purple-500"
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
// ??? ??? ?? ?? (?? ????? ??)
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
  const locations = ['?? ??', '?? ??', '?? ??', '?? ??', '?? ??', '?? ??', '?? ??', '?? ??']
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
    const uptime = `${uptimeDays}? ${uptimeHours}??`
    
    servers.push({
      name: `??-${String(i).padStart(2, '0')}`,
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
  const locations = ['?? ??', '?? ??', '?? ??', '?? ??', '?? ??']
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
    const uptime = `${uptimeDays}? ${uptimeHours}??`
    
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
  const locations = ['?? ??', '?? ??', '?? ??', '?? ??', '?? ??', '?? ??']
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
    const uptime = `${uptimeDays}? ${uptimeHours}??`
    
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

// ???? ?? ????? ?? (?? ??? <script setup>?? ?? ??)
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
  // "140 MB/s" ???? ?? ??
  const match = network.match(/(\d+)/)
  if (match) {
    const value = parseInt(match[1])
    // ?? 1000 MB/s ???? ?? ?? (?? 50%? ??)
    return Math.min((value / 1000) * 50, 50)
  }
  return 20
}
</script>
