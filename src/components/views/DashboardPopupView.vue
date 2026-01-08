<template>
  <div ref="containerRef" class="dashboard-popup-container h-screen bg-slate-50 flex flex-col overflow-hidden relative font-sans" style="padding: 1.5rem; gap: 1.5rem;">
    <!-- Header -->
    <header class="flex items-center justify-between px-6 pb-5 shrink-0 z-30 border-b border-slate-200 bg-white/50 backdrop-blur-sm pt-5 mb-1">
      <div class="flex items-center gap-8 flex-1">
        <img src="/ci.svg" alt="Logo" class="h-8" />
        
        <!-- Detailed Server Status -->
        <div class="flex items-center gap-6 flex-1">
          <!-- Overall -->
          <div class="flex items-center gap-3 pr-6 border-r border-slate-200">
            <div class="flex flex-col">
              <span class="text-xs text-slate-500 font-semibold tracking-wider">전체 현황</span>
              <div class="flex items-baseline gap-1">
                <span class="text-2xl font-bold text-slate-800">44</span>
                <span class="text-sm text-slate-500">대</span>
              </div>
            </div>
            <div class="flex gap-2">
              <div class="px-3 py-1 bg-green-100 text-green-700 rounded-md flex flex-col items-center min-w-[60px]">
                <span class="text-xs font-bold">정상</span>
                <span class="text-lg font-bold leading-none">44</span>
              </div>
              <div class="px-3 py-1 bg-red-50 text-red-300 rounded-md flex flex-col items-center min-w-[60px]">
                <span class="text-xs font-bold">장애</span>
                <span class="text-lg font-bold leading-none">0</span>
              </div>
            </div>
          </div>

          <!-- Breakdown -->
          <div class="flex items-center gap-4 flex-1 justify-around">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-blue-50 rounded-lg text-blue-600"><Server class="w-5 h-5" /></div>
              <div>
                <div class="text-xs text-slate-500 font-medium">영상 서버</div>
                <div class="text-sm font-bold text-slate-800">
                  <span class="text-green-600">정상: {{ videoServerStats.active }}</span>
                  <span class="text-slate-400 mx-1">/</span>
                  <span class="text-orange-500">대기: {{ videoServerStats.standby }}</span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="p-2 bg-purple-50 rounded-lg text-purple-600"><HardDrive class="w-5 h-5" /></div>
              <div>
                <div class="text-xs text-slate-500 font-medium">미디어 서버</div>
                <div class="text-sm font-bold text-slate-800">
                  <span class="text-green-600">정상: {{ mediaServerStats.active }}</span>
                  <span class="text-slate-400 mx-1">/</span>
                  <span class="text-orange-500">대기: {{ mediaServerStats.standby }}</span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="p-2 bg-amber-50 rounded-lg text-amber-600"><Activity class="w-5 h-5" /></div>
              <div>
                <div class="text-xs text-slate-500 font-medium">전체 서버</div>
                <div class="text-sm font-bold text-slate-800">
                  <span class="text-green-600">정상: {{ totalServerStats.active }}</span>
                  <span class="text-slate-400 mx-1">/</span>
                  <span class="text-orange-500">대기: {{ totalServerStats.standby }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Clock -->
      <div class="flex items-center gap-3 text-slate-500 pl-6 border-l border-slate-200">
        <Clock class="w-5 h-5" />
        <span class="font-mono text-xl font-bold text-slate-700">{{ currentTime }}</span>
      </div>
    </header>

    <!-- Row 1: Status Cards -->
    <div ref="statusCardsContainerRef" class="grid h-[12%] z-10 relative status-cards-container" style="grid-template-columns: 1.2fr 1.2fr 0.5fr 1.2fr 1.2fr; gap: 1.5rem; justify-items: center; width: 67%; max-width: 67%; margin: 0 auto;">
      <div v-for="(card, idx) in statusCards" :key="`${card.title}-${idx}`" 
           :ref="el => setStatusCardRef(el as HTMLElement | null, idx)"
           :style="{ gridColumn: idx === 0 ? '1' : idx === 1 ? '2' : idx === 2 ? '4' : '5', maxWidth: '100%', width: '100%', minWidth: '0', position: 'relative', zIndex: 2 }"
           class="bg-white rounded-xl p-2.5 border border-slate-200 flex flex-col justify-between relative overflow-visible group shadow-sm hover:shadow-md transition-all">
        <div class="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div class="z-10 flex flex-col items-center justify-center gap-2 h-full">
          <component :is="card.icon" :class="[card.statusColor, 'w-8 h-8']" />
          <div class="text-slate-800 font-medium text-base">{{ card.title }}</div>
          <div :class="[card.statusColor, 'text-sm font-medium flex items-center gap-1.5']">
            <span class="w-2 h-2 rounded-full" :class="card.statusBg"></span>
            {{ card.statusText }}
          </div>
        </div>
      </div>
    </div>

    <!-- Row 2: Video Servers (Split) -->
    <div class="grid h-[28%] z-10 items-stretch" style="grid-template-columns: 1fr 1fr; gap: 1.5rem; justify-items: center; max-width: 100%;">
      <!-- Traffic Center Video Servers -->
      <div class="bg-white rounded-xl border border-slate-200 flex flex-col shadow-sm" style="padding: 0.75rem; width: 100%; max-width: 85%; justify-self: center;">
        <div class="flex items-center justify-between" style="margin-bottom: 0.5rem;">
          <h3 class="text-base font-bold text-slate-800 flex items-center gap-2">
            <Server class="text-blue-600 w-4 h-4" />
            교통 센터 영상 서버
          </h3>
          <span class="text-slate-500 text-xs">서버: 12</span>
        </div>
        <div class="flex justify-center items-center flex-1 min-h-0" style="width: 100%; overflow: hidden;">
          <div class="grid" style="grid-template-columns: repeat(16, minmax(0, 1fr)); width: 100%; max-width: 100%; gap: 0.5rem; justify-items: center; align-items: center;">
          <!-- 앞쪽 빈 공간 2개 (중앙 정렬을 위해) -->
          <div v-for="i in 2" :key="`empty-front-traffic-${i}`" style="grid-column: span 1;"></div>
          <!-- 실제 서버 12개 -->
          <div v-for="server in trafficCenterVideoServers" :key="`vs-traffic-${server.id}`" 
               :ref="el => registerServerRef(el as HTMLElement)"
               @mouseenter="handleServerHover"
               @mouseleave="handleServerLeave"
               class="bg-white rounded-lg border border-slate-300 flex flex-col group hover:border-blue-500 transition-all overflow-hidden shadow-md server-card" style="padding: 0.375rem; min-width: 140px; max-width: 100%; width: 100%; grid-column: span 1; box-sizing: border-box; position: relative; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
            <div class="flex justify-between items-center mb-0.5 pb-0.5 border-b border-slate-200">
              <span class="text-slate-600 font-mono text-[10px] font-bold">VS-T{{ String(server.id).padStart(2, '0') }}</span>
              <div :class="['w-1.5 h-1.5 rounded-full', server.active ? 'bg-green-500' : 'bg-orange-400']"></div>
            </div>
            <!-- VMs List -->
            <div class="flex flex-col gap-0.5 mt-0.5 overflow-hidden flex-1 justify-between">
              <div v-for="(vm, vmIdx) in server.vms" :key="vmIdx" class="flex items-center gap-1 px-1 py-0.5 bg-slate-50 rounded border border-slate-200 hover:bg-slate-100 transition-colors">
                <div :class="['w-1.5 h-1.5 rounded-full shrink-0', vm ? 'bg-green-500' : 'bg-orange-400']"></div>
                <span class="text-[10px] leading-none text-slate-600 font-mono font-medium">{{ String(vmIdx + 1).padStart(2, '0') }}</span>
              </div>
            </div>
            <!-- Footer -->
            <div class="flex items-center justify-around pt-1 mt-0.5 border-t border-slate-200 text-xs">
              <div class="flex items-center gap-1">
                <div class="w-2 h-2 rounded-full bg-green-500"></div>
                <span class="text-slate-600 font-medium">정상: {{ server.activeCount }}</span>
              </div>
              <div class="flex items-center gap-1">
                <div class="w-2 h-2 rounded-full bg-orange-400"></div>
                <span class="text-slate-600 font-medium">대기: {{ server.standbyCount }}</span>
              </div>
            </div>
          </div>
          <!-- 뒤쪽 빈 공간 2개 (중앙 정렬을 위해) -->
          <div v-for="i in 2" :key="`empty-back-traffic-${i}`" style="grid-column: span 1; width: 100%;"></div>
          </div>
        </div>
      </div>

      <!-- Kimcheon HQ Video Servers -->
      <div class="bg-white rounded-xl border border-slate-200 flex flex-col shadow-sm" style="padding: 0.75rem; width: 100%; max-width: 85%; justify-self: center;">
        <div class="flex items-center justify-between" style="margin-bottom: 0.5rem;">
          <h3 class="text-base font-bold text-slate-800 flex items-center gap-2">
            <Server class="text-indigo-600 w-4 h-4" />
            김천 본사 영상 서버
          </h3>
          <span class="text-slate-500 text-xs">서버: 12</span>
        </div>
        <div class="flex justify-center items-center flex-1 min-h-0" style="width: 100%; overflow: hidden;">
          <div class="grid" style="grid-template-columns: repeat(16, minmax(0, 1fr)); width: 100%; max-width: 100%; gap: 0.5rem; justify-items: center; align-items: center;">
          <!-- 앞쪽 빈 공간 2개 (중앙 정렬을 위해) -->
          <div v-for="i in 2" :key="`empty-front-hq-vs-${i}`" style="grid-column: span 1;"></div>
          <!-- 실제 서버 12개 -->
          <div v-for="server in kimcheonHqVideoServers" :key="`vs-hq-${server.id}`" 
               :ref="el => registerServerRef(el as HTMLElement)"
               @mouseenter="handleServerHover"
               @mouseleave="handleServerLeave"
               class="bg-white rounded-lg border border-slate-300 flex flex-col group hover:border-indigo-500 transition-all overflow-hidden shadow-md server-card" style="padding: 0.375rem; min-width: 140px; max-width: 100%; width: 100%; grid-column: span 1; box-sizing: border-box; position: relative; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
            <div class="flex justify-between items-center mb-0.5 pb-0.5 border-b border-slate-200">
              <span class="text-slate-600 font-mono text-[10px] font-bold">VS-K{{ String(server.id).padStart(2, '0') }}</span>
              <div :class="['w-1.5 h-1.5 rounded-full', server.active ? 'bg-green-500' : 'bg-orange-400']"></div>
            </div>
             <!-- VMs List -->
             <div class="flex flex-col gap-0.5 mt-0.5 overflow-hidden flex-1 justify-between">
              <div v-for="(vm, vmIdx) in server.vms" :key="vmIdx" class="flex items-center gap-1 px-1 py-0.5 bg-slate-50 rounded border border-slate-200 hover:bg-slate-100 transition-colors">
                <div :class="['w-1.5 h-1.5 rounded-full shrink-0', vm ? 'bg-green-500' : 'bg-orange-400']"></div>
                <span class="text-[10px] leading-none text-slate-600 font-mono font-medium">{{ String(vmIdx + 1).padStart(2, '0') }}</span>
              </div>
            </div>
            <!-- Footer -->
            <div class="flex items-center justify-around pt-1 mt-0.5 border-t border-slate-200 text-xs">
              <div class="flex items-center gap-1">
                <div class="w-2 h-2 rounded-full bg-green-500"></div>
                <span class="text-slate-600 font-medium">정상: {{ server.activeCount }}</span>
              </div>
              <div class="flex items-center gap-1">
                <div class="w-2 h-2 rounded-full bg-orange-400"></div>
                <span class="text-slate-600 font-medium">대기: {{ server.standbyCount }}</span>
              </div>
            </div>
          </div>
          <!-- 뒤쪽 빈 공간 2개 (중앙 정렬을 위해) -->
          <div v-for="i in 2" :key="`empty-back-hq-vs-${i}`" style="grid-column: span 1; width: 100%;"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Row 3: Media Servers (Split) -->
    <div class="grid h-[28%] z-10 items-stretch" style="grid-template-columns: 1fr 1fr; gap: 1.5rem; justify-items: center; max-width: 100%;">
      <!-- Traffic Center Media Servers -->
      <div class="bg-white rounded-xl border border-slate-200 flex flex-col shadow-sm" style="padding: 0.75rem; width: 100%; max-width: 85%; justify-self: center;">
        <div class="flex items-center justify-between" style="margin-bottom: 0.5rem;">
          <h3 class="text-base font-bold text-slate-800 flex items-center gap-2">
            <HardDrive class="text-purple-600 w-4 h-4" />
            교통 센터 미디어 서버
          </h3>
          <span class="text-slate-500 text-xs">서버: 8</span>
        </div>
        <div class="flex justify-center items-center flex-1 min-h-0" style="width: 100%; overflow: hidden;">
          <div class="grid" style="grid-template-columns: repeat(12, minmax(0, 1fr)); width: 100%; max-width: 100%; gap: 0.75rem; justify-items: center; align-items: center;">
          <!-- 앞쪽 빈 공간 2개 (중앙 정렬을 위해) -->
          <div v-for="i in 2" :key="`empty-front-traffic-ms-${i}`" style="grid-column: span 1; width: 100%;"></div>
          <!-- 실제 서버 8개 -->
          <div v-for="server in trafficCenterMediaServers" :key="`ms-traffic-${server.id}`" 
               :ref="el => registerServerRef(el as HTMLElement)"
               @mouseenter="handleServerHover"
               @mouseleave="handleServerLeave"
               class="bg-white rounded-lg border border-slate-300 flex flex-col group hover:border-purple-500 transition-all overflow-hidden shadow-md server-card" style="padding: 0.375rem; min-width: 140px; max-width: 100%; width: 100%; grid-column: span 1; position: relative; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
            <div class="flex justify-between items-center mb-0.5 pb-0.5 border-b border-slate-200">
              <span class="text-slate-600 font-mono text-[10px] font-bold">MS-T{{ String(server.id).padStart(2, '0') }}</span>
              <div :class="['w-1.5 h-1.5 rounded-full', server.active ? 'bg-green-500' : 'bg-orange-400']"></div>
            </div>
            <!-- VMs List -->
            <div class="flex flex-col gap-0.5 mt-0.5 overflow-hidden flex-1 justify-between">
              <div v-for="(vm, vmIdx) in server.vms" :key="vmIdx" class="flex items-center gap-1 px-1 py-0.5 bg-slate-50 rounded border border-slate-200 hover:bg-slate-100 transition-colors">
                <div :class="['w-1.5 h-1.5 rounded-full shrink-0', vm ? 'bg-green-500' : 'bg-orange-400']"></div>
                <span class="text-[10px] leading-none text-slate-600 font-mono font-medium">{{ String(vmIdx + 1).padStart(2, '0') }}</span>
              </div>
            </div>
            <!-- Footer -->
            <div class="flex items-center justify-around pt-1 mt-0.5 border-t border-slate-200 text-xs">
              <div class="flex items-center gap-1">
                <div class="w-2 h-2 rounded-full bg-green-500"></div>
                <span class="text-slate-600 font-medium">정상: {{ server.activeCount }}</span>
              </div>
              <div class="flex items-center gap-1">
                <div class="w-2 h-2 rounded-full bg-orange-400"></div>
                <span class="text-slate-600 font-medium">대기: {{ server.standbyCount }}</span>
              </div>
            </div>
          </div>
          <!-- 뒤쪽 빈 공간 2개 (중앙 정렬을 위해) -->
          <div v-for="i in 2" :key="`empty-back-traffic-ms-${i}`" style="grid-column: span 1; width: 100%;"></div>
          </div>
        </div>
      </div>

      <!-- Kimcheon HQ Media Servers -->
      <div class="bg-white rounded-xl border border-slate-200 flex flex-col shadow-sm" style="padding: 0.75rem; width: 100%; max-width: 85%; justify-self: center;">
        <div class="flex items-center justify-between" style="margin-bottom: 0.5rem;">
          <h3 class="text-base font-bold text-slate-800 flex items-center gap-2">
            <HardDrive class="text-pink-600 w-4 h-4" />
            김천 본사 미디어 서버
          </h3>
          <span class="text-slate-500 text-xs">서버: 8</span>
        </div>
        <div class="flex justify-center items-center flex-1 min-h-0" style="width: 100%; overflow: hidden;">
          <div class="grid" style="grid-template-columns: repeat(12, minmax(0, 1fr)); width: 100%; max-width: 100%; gap: 0.75rem; justify-items: center; align-items: center;">
          <!-- 앞쪽 빈 공간 2개 (중앙 정렬을 위해) -->
          <div v-for="i in 2" :key="`empty-front-hq-ms-${i}`" style="grid-column: span 1; width: 100%;"></div>
          <!-- 실제 서버 8개 -->
          <div v-for="server in kimcheonHqMediaServers" :key="`ms-hq-${server.id}`" 
               :ref="el => registerServerRef(el as HTMLElement)"
               @mouseenter="handleServerHover"
               @mouseleave="handleServerLeave"
               class="bg-white rounded-lg border border-slate-300 flex flex-col group hover:border-pink-500 transition-all overflow-hidden shadow-md server-card" style="padding: 0.375rem; min-width: 140px; max-width: 100%; width: 100%; grid-column: span 1; position: relative; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
            <div class="flex justify-between items-center mb-0.5 pb-0.5 border-b border-slate-200">
              <span class="text-slate-600 font-mono text-[10px] font-bold">MS-K{{ String(server.id).padStart(2, '0') }}</span>
              <div :class="['w-1.5 h-1.5 rounded-full', server.active ? 'bg-green-500' : 'bg-orange-400']"></div>
            </div>
            <!-- VMs List -->
            <div class="flex flex-col gap-0.5 mt-0.5 overflow-hidden flex-1 justify-between">
              <div v-for="(vm, vmIdx) in server.vms" :key="vmIdx" class="flex items-center gap-1 px-1 py-0.5 bg-slate-50 rounded border border-slate-200 hover:bg-slate-100 transition-colors">
                <div :class="['w-1.5 h-1.5 rounded-full shrink-0', vm ? 'bg-green-500' : 'bg-orange-400']"></div>
                <span class="text-[10px] leading-none text-slate-600 font-mono font-medium">{{ String(vmIdx + 1).padStart(2, '0') }}</span>
              </div>
            </div>
            <!-- Footer -->
            <div class="flex items-center justify-around pt-1 mt-0.5 border-t border-slate-200 text-xs">
              <div class="flex items-center gap-1">
                <div class="w-2 h-2 rounded-full bg-green-500"></div>
                <span class="text-slate-600 font-medium">정상: {{ server.activeCount }}</span>
              </div>
              <div class="flex items-center gap-1">
                <div class="w-2 h-2 rounded-full bg-orange-400"></div>
                <span class="text-slate-600 font-medium">대기: {{ server.standbyCount }}</span>
              </div>
            </div>
          </div>
          <!-- 뒤쪽 빈 공간 2개 (중앙 정렬을 위해) -->
          <div v-for="i in 2" :key="`empty-back-hq-ms-${i}`" style="grid-column: span 1; width: 100%;"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Row 4: Traffic & CDN -->
    <div class="grid grid-cols-3 h-[15%] z-10 traffic-cdn-container" style="gap: 1.5rem; width: 95%; max-width: 95%;">
      <!-- Traffic Center Traffic Graph -->
      <div class="bg-white rounded-xl border border-slate-200 flex flex-col relative overflow-hidden shadow-sm" style="padding: 1.25rem;">
        <h3 class="text-sm font-bold text-slate-800 z-10 flex items-center justify-between" style="margin-bottom: 0.75rem;">
          <span>교통 센터 트래픽</span>
          <span class="text-xs font-normal text-slate-500">최근 24시간</span>
        </h3>
        <div class="flex-1 relative">
          <svg class="w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none" style="overflow: visible;">
            <!-- Grid lines -->
            <line v-for="i in 5" :key="`grid-${i}`" 
                  :x1="0" :y1="i * 20" :x2="300" :y2="i * 20" 
                  stroke="#e2e8f0" stroke-width="0.5" />
            <!-- Area fill with animation -->
            <path 
              :d="createAreaPath(trafficCenterData, 300, 80)"
              fill="url(#gradient-blue)" 
              opacity="0.3"
              style="transition: d 0.5s ease-out;" />
            <!-- Line chart with animation -->
            <path 
              :d="createSmoothPath(trafficCenterData, 300, 80)"
              fill="none" 
              stroke="#3b82f6" 
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="transition: d 0.5s ease-out; filter: drop-shadow(0 0 2px rgba(59, 130, 246, 0.5));" />
            <!-- 실시간 포인트 (마지막 데이터) -->
            <circle 
              :cx="0" 
              :cy="80 - trafficCenterData[0]"
              r="3"
              fill="#3b82f6"
              style="animation: pulse 2s infinite; filter: drop-shadow(0 0 4px rgba(59, 130, 246, 0.8));" />
            <defs>
              <linearGradient id="gradient-blue" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:0.8" />
                <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div class="flex justify-between text-xs text-slate-500 mt-1">
          <span>00:00</span>
          <span>현재</span>
        </div>
      </div>

      <!-- CDN Status -->
      <div ref="cdnRef" class="bg-white rounded-xl p-6 border border-slate-200 flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
        <!-- Background Decoration -->
        <div class="absolute inset-0 bg-slate-50/50"></div>
        
        <h3 class="text-lg font-bold text-slate-800 mb-6 z-10">CDN Link Status</h3>
        <div class="relative z-10">
          <div class="w-32 h-32 rounded-full border-4 border-slate-200 flex items-center justify-center relative bg-white">
            <div class="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin"></div>
            <div class="text-center">
              <div class="text-2xl font-bold text-indigo-600">Stable</div>
              <div class="text-xs text-slate-500">Connected</div>
            </div>
          </div>
        </div>
        <div class="mt-6 flex gap-8 z-10">
          <div class="text-center">
            <div class="text-slate-500 text-xs">Latency</div>
            <div class="text-slate-800 font-mono font-bold">12ms</div>
          </div>
          <div class="text-center">
            <div class="text-slate-500 text-xs">Bandwidth</div>
            <div class="text-slate-800 font-mono font-bold">1.2Gbps</div>
          </div>
        </div>
      </div>

      <!-- Kimcheon HQ Traffic Graph -->
      <div class="bg-white rounded-xl border border-slate-200 flex flex-col relative overflow-hidden shadow-sm" style="padding: 1.25rem;">
        <h3 class="text-sm font-bold text-slate-800 z-10 flex items-center justify-between" style="margin-bottom: 0.75rem;">
          <span>김천 본사 트래픽</span>
          <span class="text-xs font-normal text-slate-500">최근 24시간</span>
        </h3>
        <div class="flex-1 relative">
          <svg class="w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none" style="overflow: visible;">
            <!-- Grid lines -->
            <line v-for="i in 5" :key="`grid-${i}`" 
                  :x1="0" :y1="i * 20" :x2="300" :y2="i * 20" 
                  stroke="#e2e8f0" stroke-width="0.5" />
            <!-- Area fill with animation -->
            <path 
              :d="createAreaPath(kimcheonTrafficData, 300, 80)"
              fill="url(#gradient-green)" 
              opacity="0.3"
              style="transition: d 0.5s ease-out;" />
            <!-- Line chart with animation -->
            <path 
              :d="createSmoothPath(kimcheonTrafficData, 300, 80)"
              fill="none" 
              stroke="#10b981" 
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="transition: d 0.5s ease-out; filter: drop-shadow(0 0 2px rgba(16, 185, 129, 0.5));" />
            <!-- 실시간 포인트 (마지막 데이터) -->
            <circle 
              :cx="0" 
              :cy="80 - kimcheonTrafficData[0]"
              r="3"
              fill="#10b981"
              style="animation: pulse 2s infinite; filter: drop-shadow(0 0 4px rgba(16, 185, 129, 0.8));" />
            <defs>
              <linearGradient id="gradient-green" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#10b981;stop-opacity:0.8" />
                <stop offset="100%" style="stop-color:#10b981;stop-opacity:0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div class="flex justify-between text-xs text-slate-500 mt-1">
          <span>00:00</span>
          <span>현재</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { Database, Server, HardDrive, Clock, Activity } from 'lucide-vue-next'

const currentTime = ref(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))

setInterval(() => {
  currentTime.value = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}, 1000)

// Traffic data (24 data points for 24 hours) - 실시간 업데이트
const trafficCenterData = ref(Array.from({ length: 24 }, () => Math.random() * 60 + 10))
const kimcheonTrafficData = ref(Array.from({ length: 24 }, () => Math.random() * 60 + 10))

// 실시간 트래픽 업데이트 (3초마다)
let trafficUpdateInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  trafficUpdateInterval = setInterval(() => {
    // 새 데이터를 앞에 추가하고 마지막 데이터 제거 (슬라이딩 윈도우)
    trafficCenterData.value = [
      Math.random() * 60 + 10,
      ...trafficCenterData.value.slice(0, -1)
    ]
    kimcheonTrafficData.value = [
      Math.random() * 60 + 10,
      ...kimcheonTrafficData.value.slice(0, -1)
    ]
  }, 3000) // 3초마다 업데이트
})

onUnmounted(() => {
  if (trafficUpdateInterval) {
    clearInterval(trafficUpdateInterval)
  }
})

// 부드러운 곡선을 위한 path 생성 함수
const createSmoothPath = (data: number[], width: number, height: number) => {
  if (data.length < 2) return ''
  
  const stepX = width / (data.length - 1)
  let path = `M 0,${height - data[0]}`
  
  for (let i = 1; i < data.length; i++) {
    const x = i * stepX
    const y = height - data[i]
    const prevX = (i - 1) * stepX
    const prevY = height - data[i - 1]
    
    // 부드러운 곡선을 위한 제어점
    const cp1x = prevX + (x - prevX) / 3
    const cp1y = prevY
    const cp2x = x - (x - prevX) / 3
    const cp2y = y
    
    path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${x},${y}`
  }
  
  return path
}

// Area path 생성 함수
const createAreaPath = (data: number[], width: number, height: number) => {
  const linePath = createSmoothPath(data, width, height)
  return `${linePath} L ${width},${height} L 0,${height} Z`
}

const statusCards = [
  { 
    title: 'DB', 
    value: 'Database', 
    icon: Database,
    statusColor: 'text-green-600',
    statusBg: 'bg-green-500',
    statusText: 'Active'
  },
  { 
    title: '관리 서버', 
    value: '관리 서버', 
    icon: Server,
    statusColor: 'text-green-600',
    statusBg: 'bg-green-500',
    statusText: 'Active'
  },
  { 
    title: '관리 서버', 
    value: '관리 서버', 
    icon: Server,
    statusColor: 'text-orange-500',
    statusBg: 'bg-orange-400',
    statusText: 'Standby'
  },
  { 
    title: 'DB', 
    value: 'Database', 
    icon: Database,
    statusColor: 'text-orange-500',
    statusBg: 'bg-orange-400',
    statusText: 'Standby'
  }
]

// 서버 데이터 생성 함수
const generateServerData = (count: number) => {
  return Array.from({ length: count }, (_, i) => {
    // 서버 상태: 80% 확률로 정상, 20% 확률로 대기
    const serverActive = Math.random() > 0.2
    
    // 각 서버당 10개의 VM 생성
    const vms = Array.from({ length: 10 }, () => {
      // VM 상태: 85% 확률로 정상, 15% 확률로 대기
      return Math.random() > 0.15
    })
    
    const activeCount = vms.filter(vm => vm).length
    const standbyCount = vms.length - activeCount
    
    return {
      id: i + 1,
      active: serverActive,
      vms: vms,
      activeCount: activeCount,
      standbyCount: standbyCount
    }
  })
}

// 각 영역별 서버 데이터
const trafficCenterVideoServers = ref(generateServerData(12))
const kimcheonHqVideoServers = ref(generateServerData(12))
const trafficCenterMediaServers = ref(generateServerData(8))
const kimcheonHqMediaServers = ref(generateServerData(8))

// 영상 서버 통계 계산
const videoServerStats = computed(() => {
  const allVideoServers = [...trafficCenterVideoServers.value, ...kimcheonHqVideoServers.value]
  
  let activeCount = 0
  let standbyCount = 0
  
  allVideoServers.forEach(server => {
    // 서버 자체 상태
    if (server.active) {
      activeCount += 1
    } else {
      standbyCount += 1
    }
    
    // VM 상태
    server.vms.forEach(vm => {
      if (vm) {
        activeCount += 1
      } else {
        standbyCount += 1
      }
    })
  })
  
  return {
    active: activeCount,
    standby: standbyCount
  }
})

// 미디어 서버 통계 계산
const mediaServerStats = computed(() => {
  const allMediaServers = [...trafficCenterMediaServers.value, ...kimcheonHqMediaServers.value]
  
  let activeCount = 0
  let standbyCount = 0
  
  allMediaServers.forEach(server => {
    // 서버 자체 상태
    if (server.active) {
      activeCount += 1
    } else {
      standbyCount += 1
    }
    
    // VM 상태
    server.vms.forEach(vm => {
      if (vm) {
        activeCount += 1
      } else {
        standbyCount += 1
      }
    })
  })
  
  return {
    active: activeCount,
    standby: standbyCount
  }
})

// 전체 서버 통계 계산 (영상 + 미디어 합계)
const totalServerStats = computed(() => {
  return {
    active: videoServerStats.value.active + mediaServerStats.value.active,
    standby: videoServerStats.value.standby + mediaServerStats.value.standby
  }
})

// Line Drawing Logic
const containerRef = ref<HTMLElement | null>(null)
const statusCardsContainerRef = ref<HTMLElement | null>(null)
const cdnRef = ref<HTMLElement | null>(null)
const activeDbRef = ref<HTMLElement | null>(null)
const activeWasRef = ref<HTMLElement | null>(null)
const standbyWasRef = ref<HTMLElement | null>(null)
const standbyDbRef = ref<HTMLElement | null>(null)

// Status Card ref 설정 함수
const setStatusCardRef = (el: HTMLElement | null, idx: number) => {
  if (!el) return
  
  // idx를 사용하여 직접 할당
  // idx 0: DB Active, idx 1: 관리 서버 Active, idx 2: 관리 서버 Standby, idx 3: DB Standby
  if(idx === 0) {
    activeDbRef.value = el
  } else if(idx === 1) {
    activeWasRef.value = el
  } else if(idx === 2) {
    standbyWasRef.value = el
  } else if(idx === 3) {
    standbyDbRef.value = el
  }
}
const serverRefs = ref<HTMLElement[]>([])
const connectionLines = ref<{ d: string }[]>([])
const clusterLines = ref<{ x1: number, y1: number, x2: number, y2: number }[]>([])
const pairingLines = ref<{ x1: number, y: number, x2: number }[]>([])
const connectionPoint = ref<{ x: number, y: number } | null>(null)

// ResizeObserver들을 저장하기 위한 ref
const resizeObserver = ref<ResizeObserver | null>(null)

const registerServerRef = (el: HTMLElement | null) => {
  if (el && !serverRefs.value.includes(el)) serverRefs.value.push(el)
}

// 서버 카드 hover 효과
const handleServerHover = (event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement
  if (target) {
    target.style.transform = 'scale(1.15) translateY(-8px)'
    target.style.zIndex = '50'
    target.style.borderWidth = '2px'
    target.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.15)'
  }
}

const handleServerLeave = (event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement
  if (target) {
    target.style.transform = ''
    target.style.zIndex = ''
    target.style.borderWidth = ''
    target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
  }
}

const updateConnections = () => {
  if (!containerRef.value || !activeWasRef.value || !standbyWasRef.value || serverRefs.value.length === 0) return

  const containerRect = containerRef.value.getBoundingClientRect()
  const activeRect = activeWasRef.value.getBoundingClientRect()
  const standbyRect = standbyWasRef.value.getBoundingClientRect()
  
  // 1. Calculate midpoint between Active and Standby WAS (Vertical Start Point)
  const midX = (activeRect.right + standbyRect.left) / 2
  const bracketY = activeRect.bottom - containerRect.top + 20
  
  const startX = midX - containerRect.left
  const startY = bracketY

  connectionPoint.value = { x: startX, y: startY }

  // Cluster Bracket Lines
  const bracketLines = []
  if (activeWasRef.value && standbyWasRef.value) {
    const activeCenter = activeRect.left + activeRect.width / 2 - containerRect.left
    const standbyCenter = standbyRect.left + standbyRect.width / 2 - containerRect.left
    const topY = activeRect.bottom - containerRect.top
    
    // Vertical from Active
    bracketLines.push({ x1: activeCenter, y1: topY, x2: activeCenter, y2: bracketY })
    // Vertical from Standby
    bracketLines.push({ x1: standbyCenter, y1: topY, x2: standbyCenter, y2: bracketY })
    // Horizontal connecting them
    bracketLines.push({ x1: activeCenter, y1: bracketY, x2: standbyCenter, y2: bracketY })
  }
  clusterLines.value = bracketLines

  // 3. Pairing Lines (Active DB <-> Active WAS, Standby WAS <-> Standby DB)
  const pairs = []
  
  // Pair 1: Active DB -> Active WAS
  if (activeDbRef.value && activeWasRef.value) {
    const dbRect = activeDbRef.value.getBoundingClientRect()
    const wasRect = activeWasRef.value.getBoundingClientRect()
    
    // Line from DB Right to WAS Left
    // Vertical center aligned
    const centerY = dbRect.top + dbRect.height / 2 - containerRect.top
    
    pairs.push({
      x1: dbRect.right - containerRect.left,
      y: centerY,
      x2: wasRect.left - containerRect.left
    })
  }

  // Pair 2: Standby WAS -> Standby DB
  if (standbyWasRef.value && standbyDbRef.value) {
    const wasRect = standbyWasRef.value.getBoundingClientRect()
    const dbRect = standbyDbRef.value.getBoundingClientRect()
    
    // Line from WAS Right to DB Left
    const centerY = wasRect.top + wasRect.height / 2 - containerRect.top
    
    pairs.push({
      x1: wasRect.right - containerRect.left,
      y: centerY,
      x2: dbRect.left - containerRect.left
    })
  }
  
  pairingLines.value = pairs

  // 4. Server Connections (Rectilinear Tree)
  const lines: { d: string }[] = []

  serverRefs.value.forEach(serverEl => {
    const serverRect = serverEl.getBoundingClientRect()
    // Server connection point (top center)
    const endX = serverRect.left + serverRect.width / 2 - containerRect.left
    const endY = serverRect.top - containerRect.top

    // Rectilinear Routing to avoid overlap
    const branchY = endY - 15

    lines.push({
      d: `M ${startX} ${startY} L ${startX} ${branchY} L ${endX} ${branchY} L ${endX} ${endY}`
    })
  })

  connectionLines.value = lines
}


onMounted(async () => {
  await nextTick()
  
  // Initial draw
  setTimeout(updateConnections, 500)
  
  // Watch for resizes
  if (containerRef.value) {
    resizeObserver.value = new ResizeObserver(() => {
      updateConnections()
    })
    resizeObserver.value.observe(containerRef.value)
  }
  
  window.addEventListener('resize', updateConnections)
})

onUnmounted(() => {
  if (resizeObserver.value) resizeObserver.value.disconnect()
  window.removeEventListener('resize', updateConnections)
})
</script>


<style scoped>
/* Ensure the popup takes full viewport and allows no scroll if possible, or manages it cleanly */
:global(body) {
  background-color: #f8fafc; /* bg-slate-50 Light Mode Base */
  margin: 0;
  overflow: hidden;
}

/* Fallback styles in case Tailwind is not fully loading or applying efficiently in the popup context */
.dashboard-popup-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 1.5rem !important;
  gap: 1.5rem !important;
}

.gap-5 { gap: 1.25rem; }
.gap-6 { gap: 1.5rem; }

.grid {
  display: grid;
}

.grid-cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.grid-cols-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.grid-cols-6 {
  grid-template-columns: repeat(6, minmax(0, 1fr));
}

.grid-cols-8 {
  grid-template-columns: repeat(8, minmax(0, 1fr));
}

.grid-cols-12 {
  grid-template-columns: repeat(12, minmax(0, 1fr));
}

.grid-cols-16 {
  grid-template-columns: repeat(16, minmax(0, 1fr));
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

.h-\[15\%\] {
  height: 15%;
}

.h-\[25\%\] {
  height: 25%;
}

.h-\[10\%\] {
  height: 10%;
}

.h-\[28\%\] {
  height: 28%;
}

.gap-3 { gap: 0.75rem !important; }
.gap-4 { gap: 1rem !important; }
.gap-5 { gap: 1.25rem !important; }
.gap-6 { gap: 1.5rem !important; }

/* 서버 섹션 중앙 정렬 강제 */
.bg-white.rounded-xl.border {
  display: flex !important;
  flex-direction: column !important;
}

/* 그리드 중앙 정렬 */
.grid[style*="grid-template-columns"] {
  display: grid !important;
}

/* 서버 카드 그리드 중앙 정렬 */
.grid.grid-cols-16,
.grid.grid-cols-12 {
  margin-left: auto !important;
  margin-right: auto !important;
}

/* Flex 중앙 정렬 */
.flex.justify-center {
  justify-content: center !important;
  align-items: center !important;
}

/* 교통 센터 영상 서버 그리드 중앙 정렬 강제 */
.grid[style*="grid-template-columns: repeat(16"] {
  display: grid !important;
  justify-content: center !important;
  justify-items: center !important;
  margin-left: auto !important;
  margin-right: auto !important;
}

/* 미디어 서버 그리드 중앙 정렬 강제 (12 컬럼) */
.grid[style*="grid-template-columns: repeat(12"] {
  display: grid !important;
  justify-content: center !important;
  justify-items: center !important;
  margin-left: auto !important;
  margin-right: auto !important;
}

/* 서버 카드 중앙 정렬 */
.grid > div[style*="grid-column"] {
  display: flex !important;
  flex-direction: column !important;
}

/* 빈 공간 div 숨김 처리 */
.grid > div[style*="grid-column: span 1"][style*="width: 100%"]:empty,
.grid > div[style*="grid-column: span 1"][style*="width: 100%"]:not([class*="bg-white"]) {
  min-height: 0 !important;
  height: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
  border: none !important;
}

/* 실시간 트래픽 차트 애니메이션 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.2);
  }
}

/* 관리서버 연결선 */

/* 영상 서버 카드 겹침 방지 */
.grid[style*="grid-template-columns: repeat(16"] > div[class*="bg-white"][style*="grid-column: span 1"] {
  max-width: 100% !important;
  width: 100% !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
}

/* 서버 카드 hover 효과 - 카드 뽑기처럼 */
:deep(.server-card) {
  position: relative !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  cursor: pointer !important;
  will-change: transform, z-index !important;
}

/* 모든 서버 카드 hover 효과 - 강제 적용 */
:deep(.server-card:hover) {
  transform: scale(1.15) translateY(-8px) !important;
  z-index: 50 !important;
  position: relative !important;
  border-width: 2px !important;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
}

.traffic-cdn-container {
  margin: 0 auto !important;
  justify-self: center !important;
  align-self: center !important;
  width: 95% !important;
  max-width: 95% !important;
}

.status-cards-container {
  width: 40% !important;
  max-width: 67% !important;
  margin: 0 auto !important;
}
</style>
