<template>
  <div class="cyber-dashboard relative w-full h-screen overflow-hidden p-1 flex flex-col gap-1 bg-[#0b1121] text-white">
    <!-- Background grid and scanning effects -->
    <div class="grid-overlay"></div>
    <div class="hexagon-overlay"></div>

    <!-- Top Navigation / Header -->
    <div class="flex items-center justify-center relative h-[50px] shrink-0 border-b border-[#00f3ff]/20 bg-[#0f172a]/80 backdrop-blur-sm z-20">
      <div class="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
        <img src="/ci.svg" alt="CI" class="h-6 w-auto drop-shadow-[0_0_5px_rgba(0,243,255,0.8)]" />
        <span class="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] to-[#fff]">종합상황판</span>
      </div>
      <!-- Center Title Decoration -->
      <div class="h-1 w-1/3 bg-gradient-to-r from-transparent via-[#00f3ff] to-transparent absolute bottom-0"></div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col gap-1 min-h-0 z-10 w-full">
      
      <!-- Row 1: Flow Status (Height ~55%) -->
      <div class="flex-1 flex gap-1 min-h-0 w-full relative">
        <!-- Section 1: Video Collection -->
        <div class="cyber-panel flex-1 flex flex-col relative overflow-hidden bg-[#1e293b]/40 border border-[#00f3ff]/30 backdrop-blur-md">
          <div class="panel-header bg-gradient-to-r from-[#0f172a] to-[#1e293b] p-2 border-b border-[#00f3ff]/20 flex justify-between items-center">
            <span class="font-bold text-[#00f3ff] tracking-wider text-lg">영상 수집</span>
            <div class="flex flex-col items-end leading-none">
              <span class="text-xs text-gray-400">전체/정상/장애</span>
              <span class="font-bold text-white"><span class="text-[#00f3ff]">1800</span> / 2000 / <span class="text-red-500">180</span></span>
            </div>
          </div>
          <div class="flex-1 p-2 grid grid-cols-3 gap-2 overflow-y-auto">
            <div v-for="i in 9" :key="i" class="flex flex-col items-center justify-center bg-[#0f172a]/60 border border-white/5 rounded p-2 hover:border-[#00f3ff]/50 transition-colors">
              <div class="relative mb-1">
                <Video class="w-8 h-8 text-gray-400" />
                <div class="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_#22c55e]"></div>
              </div>
              <span class="text-xs text-gray-300 font-semibold">지사 {{ i }}</span>
              <span class="text-[10px] text-[#00f3ff]">20 / <span class="text-gray-500">100</span></span>
            </div>
          </div>
        </div>

        <!-- Arrow 1 -->
        <div class="w-8 flex items-center justify-center relative">
          <div class="absolute inset-0 flex items-center justify-center">
             <ChevronsRight class="w-8 h-8 text-[#00f3ff] animate-pulse opacity-80" />
          </div>
        </div>

        <!-- Section 2: Video Conversion -->
        <div class="cyber-panel flex-1 flex flex-col relative overflow-hidden bg-[#1e293b]/40 border border-[#00f3ff]/30 backdrop-blur-md">
          <div class="panel-header bg-gradient-to-r from-[#0f172a] to-[#1e293b] p-2 border-b border-[#00f3ff]/20 flex justify-between items-center">
            <span class="font-bold text-[#00f3ff] tracking-wider text-lg">영상 변환</span>
            <div class="flex flex-col items-end leading-none">
              <span class="text-xs text-gray-400">변환/전체/장애</span>
              <span class="font-bold text-white"><span class="text-[#00f3ff]">1750</span> / 1800 / <span class="text-red-500">50</span></span>
            </div>
          </div>
          <div class="flex-1 p-2 flex flex-col gap-2">
            <!-- Traffic Center -->
            <div class="flex-1 flex items-center bg-[#0f172a]/60 border border-white/5 rounded p-2 relative overflow-hidden group">
               <div class="absolute left-0 top-0 bottom-0 w-1 bg-[#00f3ff] group-hover:shadow-[0_0_10px_#00f3ff]"></div>
               <div class="w-20 text-center font-bold text-sm text-gray-300">교통관제<br>센터</div>
               <div class="flex-1 flex justify-center items-center gap-4">
                 <Server class="w-8 h-8 text-[#00f3ff]" />
                 <div class="flex flex-col text-center">
                   <span class="text-lg font-bold text-white">1050 / 1080</span>
                   <span class="text-xs text-red-400">장애(30)</span>
                 </div>
               </div>
            </div>
            <!-- HQ -->
            <div class="flex-1 flex items-center bg-[#0f172a]/60 border border-white/5 rounded p-2 relative overflow-hidden group">
               <div class="absolute left-0 top-0 bottom-0 w-1 bg-[#00f3ff] group-hover:shadow-[0_0_10px_#00f3ff]"></div>
               <div class="w-20 text-center font-bold text-sm text-gray-300">본사</div>
               <div class="flex-1 flex justify-center items-center gap-4">
                 <Server class="w-8 h-8 text-[#00f3ff]" />
                 <div class="flex flex-col text-center">
                   <span class="text-lg font-bold text-white">700 / 720</span>
                   <span class="text-xs text-red-400">장애(20)</span>
                 </div>
               </div>
            </div>
            <!-- Ratio Overlay (Mockup Style) -->
            <div class="flex justify-between text-xs font-bold px-4 text-[#00f3ff]">
              <span>60%</span>
              <span>40%</span>
            </div>
          </div>
        </div>

        <!-- Arrow 2 -->
        <div class="w-8 flex items-center justify-center relative">
          <div class="absolute inset-0 flex items-center justify-center">
             <ChevronsRight class="w-8 h-8 text-[#00f3ff] animate-pulse opacity-80" />
          </div>
        </div>

        <!-- Section 3: Video Provision -->
        <div class="cyber-panel flex-1 flex flex-col relative overflow-hidden bg-[#1e293b]/40 border border-[#00f3ff]/30 backdrop-blur-md">
           <div class="panel-header bg-gradient-to-r from-[#0f172a] to-[#1e293b] p-2 border-b border-[#00f3ff]/20 flex justify-between items-center">
            <span class="font-bold text-[#00f3ff] tracking-wider text-lg">영상 제공</span>
            <div class="flex flex-col items-end leading-none">
              <span class="text-xs text-gray-400">제공/전체/장애</span>
              <span class="font-bold text-white"><span class="text-[#00f3ff]">1740</span> / 1750 / <span class="text-red-500">10</span></span>
            </div>
          </div>
           <div class="flex-1 p-2 flex flex-col gap-2">
            <!-- Traffic Center -->
            <div class="flex-1 flex items-center bg-[#0f172a]/60 border border-white/5 rounded p-2 relative overflow-hidden group">
               <div class="absolute right-0 top-0 bottom-0 w-1 bg-green-500 group-hover:shadow-[0_0_10px_#22c55e]"></div>
               <div class="flex-1 flex justify-center items-center gap-4">
                 <div class="flex flex-col text-center">
                   <span class="text-lg font-bold text-white">1040 / 1050</span>
                   <span class="text-xs text-red-400">장애(10)</span>
                 </div>
                 <Monitor class="w-8 h-8 text-green-400" />
               </div>
               <div class="w-20 text-center font-bold text-sm text-gray-300">교통관제<br>센터</div>
            </div>
            <!-- HQ -->
            <div class="flex-1 flex items-center bg-[#0f172a]/60 border border-white/5 rounded p-2 relative overflow-hidden group">
               <div class="absolute right-0 top-0 bottom-0 w-1 bg-green-500 group-hover:shadow-[0_0_10px_#22c55e]"></div>
               <div class="flex-1 flex justify-center items-center gap-4">
                 <div class="flex flex-col text-center">
                   <span class="text-lg font-bold text-white">700 / 700</span>
                   <span class="text-xs text-green-400">장애(0)</span>
                 </div>
                 <Monitor class="w-8 h-8 text-green-400" />
               </div>
               <div class="w-20 text-center font-bold text-sm text-gray-300">본사</div>
            </div>
          </div>
        </div>

        <!-- Arrow 3 -->
        <div class="w-8 flex items-center justify-center relative">
          <div class="absolute inset-0 flex items-center justify-center">
             <ChevronsRight class="w-8 h-8 text-[#00f3ff] animate-pulse opacity-80" />
          </div>
        </div>

        <!-- Section 4: CDN -->
        <div class="cyber-panel flex-1 flex flex-col relative overflow-hidden bg-[#1e293b]/40 border border-[#00f3ff]/30 backdrop-blur-md">
          <div class="panel-header bg-gradient-to-r from-[#0f172a] to-[#1e293b] p-2 border-b border-[#00f3ff]/20 flex justify-between items-center">
            <span class="font-bold text-[#00f3ff] tracking-wider text-lg">CDN</span>
          </div>
          <div class="flex-1 p-2 flex flex-col gap-2">
             <!-- Traffic Center -->
            <div class="flex-1 flex flex-col items-center justify-center bg-[#0f172a]/60 border border-white/5 rounded p-2 relative overflow-hidden">
               <Globe class="w-10 h-10 text-white mb-2 animate-pulse" />
               <span class="text-sm font-bold text-gray-300 mb-1">교통관제센터</span>
               <span class="text-lg font-bold text-[#00f3ff]">300 / 1050</span>
            </div>
            <!-- HQ -->
            <div class="flex-1 flex flex-col items-center justify-center bg-[#0f172a]/60 border border-white/5 rounded p-2 relative overflow-hidden">
               <Globe class="w-10 h-10 text-white mb-2 animate-pulse" />
               <span class="text-sm font-bold text-gray-300 mb-1">본사</span>
               <span class="text-lg font-bold text-[#00f3ff]">100 / 700</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Row 2: Operation Status (Height ~45%) -->
      <div class="h-[43%] flex gap-1 min-h-0 w-full relative">
        <!-- Col 1: Alarm Status -->
        <div class="cyber-panel flex-1 flex flex-col relative overflow-hidden bg-[#1e293b]/40 border border-[#00f3ff]/30 backdrop-blur-md">
           <div class="panel-header bg-gradient-to-r from-[#0f172a] to-[#1e293b] p-2 border-b border-[#00f3ff]/20 flex justify-between items-center">
            <span class="font-bold text-[#00f3ff] tracking-wider text-lg">알림 현황</span>
            <div class="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded border border-red-500/50">CRITICAL: 2</div>
          </div>
          <div class="flex-1 p-2 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
             <div 
              v-for="(alarm, idx) in alarmHistory" 
              :key="idx"
              class="flex flex-col bg-white/5 p-2 rounded border-l-2" 
              :class="alarm.level === 'critical' ? 'border-red-500 bg-red-500/5' : alarm.level === 'warning' ? 'border-yellow-500 bg-yellow-500/5' : 'border-blue-500'"
            >
              <div class="flex justify-between text-[10px] text-gray-400 mb-0.5">
                <span>{{ alarm.time }}</span>
                <span class="font-bold" :class="alarm.level === 'critical' ? 'text-red-400' : alarm.level === 'warning' ? 'text-yellow-400' : 'text-blue-400'">{{ alarm.tag }}</span>
              </div>
              <span class="text-sm font-medium text-gray-200 truncate">{{ alarm.msg }}</span>
            </div>
          </div>
        </div>

        <div class="cyber-panel flex-[2.5] flex flex-col relative overflow-hidden bg-[#1e293b]/40 border border-[#00f3ff]/30 backdrop-blur-md">
           <div class="panel-header bg-gradient-to-r from-[#0f172a] to-[#1e293b] p-1.5 border-b border-[#00f3ff]/20 flex justify-center items-center h-[36px] shrink-0">
            <span class="font-bold text-[#00f3ff] tracking-wider text-xl drop-shadow-[0_0_8px_rgba(0,243,255,0.6)]">인프라 운영 현황</span>
          </div>
           <div class="flex-1 p-2 flex gap-3 min-h-0 bg-[#0b1121]/40">
              <!-- Left Column: Sites (Traffic Center & HQ) -->
              <div class="flex-[1.8] flex flex-col gap-3 relative">
                 
                 <!-- Traffic Center Section -->
                 <div class="flex-1 flex flex-col items-center bg-[#1e293b]/20 p-2 rounded border border-white/5 relative">
                    <span class="font-bold text-gray-300 text-base mb-1">교통관제센터 인프라 사용률</span>
                    <div class="flex justify-around w-full items-center flex-1">
                       <SimpleDonut label="CPU" :value="55" color="#3b82f6" />
                       <SimpleDonut label="Memory" :value="62" color="#a855f7" />
                       <SimpleDonut label="Disk" :value="48" color="#10b981" />
                    </div>
                    <div class="w-full h-8 bg-[#3b82f6] rounded flex items-center justify-center border border-[#60a5fa] shadow-[inset_0_0_10px_rgba(255,255,255,0.2)]">
                       <span class="text-[13px] font-bold text-white tracking-tight">물리서버 11식 장애(0) / VM 30 식(Active 16식, Standby 14식)</span>
                    </div>
                 </div>

                 <!-- HQ Section -->
                 <div class="flex-1 flex flex-col items-center bg-[#1e293b]/20 p-2 rounded border border-white/5 relative">
                    <span class="font-bold text-gray-300 text-base mb-1">본사 인프라 사용률</span>
                    <div class="flex justify-around w-full items-center flex-1">
                       <SimpleDonut label="CPU" :value="55" color="#3b82f6" />
                       <SimpleDonut label="Memory" :value="62" color="#a855f7" />
                       <SimpleDonut label="Disk" :value="48" color="#10b981" />
                    </div>
                    <div class="w-full h-8 bg-[#3b82f6] rounded flex items-center justify-center border border-[#60a5fa] shadow-[inset_0_0_10px_rgba(255,255,255,0.2)]">
                       <span class="text-[13px] font-bold text-white tracking-tight">물리서버 12식 장애(0) / VM 30 식(Active 14식, Standby 16식)</span>
                    </div>
                 </div>

                 <!-- VM Sync Arrow (Middle overlay) -->
                 <div class="absolute -right-4 top-0 bottom-0 w-8 flex flex-col items-center justify-center z-10 pointer-events-none">
                    <div class="h-3/4 w-0.5 bg-green-500 relative flex flex-col items-center justify-center lg:h-4/5">
                        <div class="absolute top-0 w-2 h-2 border-t-2 border-l-2 border-green-500 -rotate-45"></div>
                        <div class="absolute bottom-0 w-2 h-2 border-b-2 border-r-2 border-green-500 -rotate-45"></div>
                        <span class="vertical-text text-[11px] font-bold text-green-400 bg-[#0b1121] py-3 px-1 border border-green-500 rounded-full tracking-widest whitespace-nowrap">VM 동기화 정상</span>
                    </div>
                 </div>
              </div>

              <!-- Right Column: Database -->
              <div class="flex-1 bg-[#1e293b]/50 rounded border border-[#00f3ff]/20 p-2 flex flex-col items-center">
                 <span class="font-bold text-gray-200 text-lg mb-4 tracking-widest border-b border-[#00f3ff]/30 w-full text-center pb-1">데이터베이스</span>
                 
                 <div class="flex-1 w-full flex flex-col justify-around py-4 relative">
                    <!-- Top Pair -->
                    <div class="flex justify-between items-center w-full px-2 relative">
                        <DBUnit label="DB#1 Active" />
                        
                        <!-- Green Sync Arrow -->
                        <div class="flex-1 flex flex-col items-center relative mx-2">
                           <span class="text-[10px] text-green-400 font-bold mb-1">DB 동기화(정상)</span>
                           <div class="w-full h-0.5 bg-green-500 relative flex items-center justify-between">
                              <div class="w-2 h-2 border-t-2 border-l-2 border-green-500 -rotate-45 -ml-1"></div>
                              <div class="w-2 h-2 border-b-2 border-r-2 border-green-500 -rotate-45 -mr-1"></div>
                           </div>
                        </div>

                        <DBUnit label="DB#2 Standby" />
                    </div>

                    <!-- Red Failure Flow -->
                    <div class="w-full h-16 relative">
                       <svg class="absolute inset-0 w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
                          <path d="M40,0 L40,30 L160,30" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="4,2" />
                          <path d="M160,30 L155,25 M160,30 L155,35" fill="none" stroke="#ef4444" stroke-width="2" />
                       </svg>
                       <span class="absolute left-[45px] bottom-1 text-[11px] text-red-400 font-black">DB 동기화(장애)</span>
                    </div>

                    <!-- Bottom DB -->
                    <div class="flex justify-end w-full px-2">
                       <DBUnit label="DB#3 Standby" />
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <!-- Col 4: CDN Traffic Status -->
        <div class="cyber-panel flex-1 flex flex-col relative overflow-hidden bg-[#1e293b]/40 border border-[#00f3ff]/30 backdrop-blur-md">
          <div class="panel-header bg-gradient-to-r from-[#0f172a] to-[#1e293b] p-2 border-b border-[#00f3ff]/20 flex justify-between items-center">
            <span class="font-bold text-[#00f3ff] tracking-wider text-lg">CDN 트래픽 현황</span>
          </div>
          <div class="flex-1 p-2 flex flex-col">
             <div class="flex justify-between items-end mb-2"> 
                <span class="text-xs text-gray-400">Total Bandwidth</span>
                <span class="text-xl font-bold text-white">4.5 <span class="text-sm text-[#00f3ff]">Gbps</span></span>
             </div>
             <div class="flex-1 bg-black/20 rounded border border-white/5 overflow-hidden relative">
                <CyberChart :data="cdnTraffic" color="#8b5cf6" label="CDN 트래픽" />
             </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Server, Monitor, Globe, Video, ChevronsRight } from 'lucide-vue-next'
import CyberChart from '../common/CyberChart.vue'

const cdnTraffic = ref([
    { time: '00:00', value: 100 }, { time: '04:00', value: 50 },
    { time: '08:00', value: 200 }, { time: '12:00', value: 800 },
    { time: '16:00', value: 950 }, { time: '20:00', value: 600 },
    { time: '24:00', value: 300 }
])

const alarmHistory = ref([
  { time: '10:05:01 AM', level: 'critical', tag: 'CRITICAL', msg: '서버 과부하 발생' },
  { time: '10:15:22 AM', level: 'warning', tag: 'WARNING', msg: '데이터베이스 연결 지연' },
  { time: '10:20:45 AM', level: 'info', tag: 'INFO', msg: '네트워크 자동 최적화 완료' },
  { time: '10:35:10 AM', level: 'critical', tag: 'CRITICAL', msg: 'CDN 미디어 서버 응답 오류' },
  { time: '10:42:05 AM', level: 'warning', tag: 'WARNING', msg: '지사 CCTV 업링크 불안정' },
  { time: '10:50:18 AM', level: 'info', tag: 'INFO', msg: '신규 보안 패치 적용됨' },
  { time: '10:55:30 AM', level: 'warning', tag: 'WARNING', msg: '교통센터 백업 스토리지 경고' },
  { time: '11:02:14 AM', level: 'critical', tag: 'CRITICAL', msg: '주요 간선도로 센서 연결 끊김' }
])

// Local components for the infra 운영 현황 section
import { defineComponent, h, computed } from 'vue'

const SimpleDonut = defineComponent({
  props: { label: String, value: Number, color: String },
  setup(props) {
    const dasharray = computed(() => {
        const r = 35
        const c = 2 * Math.PI * r
        const val = props.value || 0
        const offset = c - (val / 100) * c
        return { c, offset }
    })
    return () => h('div', { class: 'flex flex-col items-center gap-1' }, [
      h('div', { class: 'relative w-16 h-16 flex items-center justify-center' }, [
         h('svg', { viewBox: '0 0 100 100', class: 'w-full h-full -rotate-90' }, [
            h('circle', { cx: 50, cy: 50, r: 35, fill: 'none', stroke: '#1e293b', 'stroke-width': 12 }),
            h('circle', { 
                cx: 50, cy: 50, r: 35, fill: 'none', stroke: props.color, 'stroke-width': 12,
                'stroke-dasharray': dasharray.value.c, 'stroke-dashoffset': dasharray.value.offset,
                class: 'transition-all duration-700'
            })
         ]),
         h('span', { class: 'absolute font-black text-xs text-white' }, `${props.value}%`)
      ]),
      h('span', { class: 'text-[11px] font-bold text-gray-400' }, props.label)
    ])
  }
})

const DBUnit = defineComponent({
  props: { label: String },
  setup(props) {
      return () => h('div', { class: 'flex flex-col items-center group' }, [
         h('div', { class: 'w-16 h-10 bg-green-600 rounded-lg flex items-center justify-center relative shadow-lg border-2 border-green-400' }, [
            h('div', { class: 'flex gap-1.5' }, [
               h('div', { class: 'w-1.5 h-1.5 rounded-full bg-white opacity-40' }),
               h('div', { class: 'w-1.5 h-1.5 rounded-full bg-white opacity-40' })
            ]),
            h('div', { class: 'absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border border-white/20 animate-pulse' })
         ]),
         h('span', { class: 'text-[11px] font-bold text-gray-300 mt-1 whitespace-nowrap' }, props.label)
      ])
  }
})
</script>

<style scoped>
.vertical-text {
  writing-mode: vertical-lr;
  text-orientation: upright;
}
.grid-overlay {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(0, 243, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 243, 255, 0.03) 1px, transparent 1px);
  background-size: 30px 30px;
  pointer-events: none;
  z-index: 0;
}

.hexagon-overlay {
  position: absolute;
  top: 0;
  right: 0;
  width: 50%;
  height: 50%;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill-opacity='0.02' fill='%2300f3ff' fill-rule='evenodd'/%3E%3C/svg%3E");
  mask-image: radial-gradient(circle at top right, black, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 243, 255, 0.3);
  border-radius: 2px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 243, 255, 0.5);
}

.cyber-panel {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.15);
}
</style>
