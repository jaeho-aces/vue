<template>
  <div class="cyber-dashboard relative w-full h-screen overflow-hidden p-[15px] flex flex-col">
    <!-- Background grid and scanning effects -->
    <div class="grid-overlay"></div>
    <div class="hexagon-overlay"></div>

    <!-- Top Navigation / Header -->
    <div class="mb-[15px] z-10">
      <div class="cyber-dashboard-header-bar inline-flex items-center py-1.5 pr-[30px] pl-5 gap-[15px]">
        <img src="/ci.svg" alt="CI" class="dashboard-logo h-6 w-auto" />
        <span class="title-text text-[1.1rem] text-white">CCTV 영상 인터넷 제공 시스템 대시보드</span>
      </div>
    </div>

    <div class="flex-1 flex flex-col gap-[15px] z-[5]">
      <!-- Top Section -->
      <div class="h-[48%] flex items-center gap-2.5">
        <!-- Site 1 Panel -->
        <div class="cyber-panel flex-1 h-full rounded flex flex-col relative overflow-hidden shadow-[0_0_20px_rgba(0,243,255,0.1)]">
          <div class="panel-cap blue-bg-cap py-1.5 px-[15px] flex items-center justify-center">
            <span class="panel-name text-[0.9rem] font-bold">교통센터</span>
          </div>
          <div class="flex-1 flex py-2.5 px-5 gap-[150px] items-center justify-center relative">
            <!-- CCTV Column -->
            <div class="w-[140px] flex flex-col gap-5 items-center justify-center m-0 z-[2]">
              <span class="text-base font-bold text-[#888] border-b-2 border-[#333] w-full text-center pb-2 mb-2.5">CCTV</span>
              <div class="flex flex-col gap-[30px]">
                <div class="flex flex-col items-center gap-2.5">
                  <div class="mini-chart cyan relative w-[110px] h-[110px] flex flex-col items-center">
                    <div class="mini-inner z-[2] mt-[35px] font-bold text-[1.4rem]">
                      <span class="v1">45</span><span class="v-alt">/2</span>
                    </div>
                    <svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" class="bg"/><circle cx="20" cy="20" r="18" class="progress" style="stroke-dasharray: 80 113;"/></svg>
                  </div>
                  <span class="mini-label text-base text-[#eee] font-semibold text-center">도로공사</span>
                </div>
                <div class="flex flex-col items-center gap-2.5">
                  <div class="mini-chart cyan relative w-[110px] h-[110px] flex flex-col items-center">
                    <div class="mini-inner z-[2] mt-[35px] font-bold text-[1.4rem]">
                      <span class="v1">38</span><span class="v-alt">/1</span>
                    </div>
                    <svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" class="bg"/><circle cx="20" cy="20" r="18" class="progress" style="stroke-dasharray: 70 113;"/></svg>
                  </div>
                  <span class="mini-label text-base text-[#eee] font-semibold text-center">수탁</span>
                </div>
                <div class="flex flex-col items-center gap-2.5">
                  <div class="mini-chart cyan relative w-[110px] h-[110px] flex flex-col items-center">
                    <div class="mini-inner z-[2] mt-[35px] font-bold text-[1.4rem]">
                      <span class="v1">52</span><span class="v-alt">/3</span>
                    </div>
                    <svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" class="bg"/><circle cx="20" cy="20" r="18" class="progress" style="stroke-dasharray: 90 113;"/></svg>
                  </div>
                  <span class="mini-label text-base text-[#eee] font-semibold text-center">비수탁</span>
                </div>
              </div>
            </div>
 
            <!-- Flow Connector: CCTV to Conversion (Absolute Overlay Expanded) -->
            <div class="flow-connector to-right absolute w-[400px] h-[460px] z-[1] pointer-events-none">
              <svg viewBox="0 -50 250 460" class="connector-svg w-full h-full overflow-visible">
                <path d="M0,65 C200,65 200,230 400,230" class="flow-line-bg"/>
                <path d="M0,230 L400,230" class="flow-line-bg"/>
                <path d="M0,395 C200,395 200,230 400,230" class="flow-line-bg"/>
                
                <path d="M0,65 C200,65 200,230 400,230" class="flow-line-active"/>
                <path d="M0,230 L400,230" class="flow-line-active"/>
                <path d="M0,395 C200,395 200,230 400,230" class="flow-line-active"/>
              </svg>
            </div>

            <!-- Main Status Area -->
            <div class="flex-1 h-full flex flex-col justify-between pt-1.5 m-0 z-[2] site1-theme">
              <div class="service-row active-mode flex flex-col items-center justify-center gap-[15px] bg-black/40 py-3 px-[25px] rounded-xl border border-white/[0.08] mb-auto w-fit">
                <div class="mode-tag py-1 px-3.5 rounded-md font-extrabold text-[0.9rem] border-2 border-current">ACTIVE</div>
                <div class="service-icons flex gap-4">
                  <div class="s-icon active flex items-center gap-2 bg-white/[0.03] py-1.5 px-3 rounded-md border border-white/5 transition-all duration-300"><Monitor class="i-green"/><span class="t text-base font-bold text-white tracking-wider">WEB</span></div>
                  <div class="s-icon active flex items-center gap-2 bg-white/[0.03] py-1.5 px-3 rounded-md border border-white/5 transition-all duration-300"><Server class="i-green"/><span class="t text-base font-bold text-white tracking-wider">WAS</span></div>
                  <div class="s-icon active flex items-center gap-2 bg-white/[0.03] py-1.5 px-3 rounded-md border border-white/5 transition-all duration-300"><Database class="i-green"/><span class="t text-base font-bold text-white tracking-wider">DB</span></div>
                </div>
              </div>

              <div class="gauge-pair flex justify-center gap-[200px] flex-1 items-center relative">
                <div class="big-gauge flex flex-col items-center gap-2.5 z-[2] instrument-green">
                  <div class="g-wrap car-cluster relative w-[200px] h-[200px] rounded-full">
                    <div class="glass-reflection"></div>
                    <svg viewBox="0 0 100 100" class="gauge-svg instrument-svg rotate-0 w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="greenNeedle" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" style="stop-color:#00ffcc;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#00aa88;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <g class="notches group">
                        <line v-for="n in 21" :key="n" x1="50" y1="10" x2="50" y2="15" 
                              :transform="`rotate(${((n-1) * 13.5) - 135}, 50, 50)`" 
                              class="tick" :class="{ major: (n-1) % 5 === 0 }"/>
                      </g>
                      <circle cx="50" cy="50" r="40" class="dial-bg"/>
                      <circle cx="50" cy="50" r="40" class="dial-needle" stroke="url(#greenNeedle)" 
                              style="stroke-dasharray: 140 251; stroke-dashoffset: 0;"/>
                    </svg>
                    <div class="g-text absolute inset-0 flex flex-col items-center justify-center z-[5]">
                      <span class="v-main text-[2.5rem] font-bold text-white">8</span>
                      <div class="instrument-status-grid flex gap-[15px] mt-1.5 py-1 px-3 bg-black/40 border border-white/[0.08] rounded-[20px]">
                        <div class="stat-item standby flex flex-col items-center min-w-[20px]"><span class="s-val text-base font-bold">2</span></div>
                        <div class="stat-item error flex flex-col items-center min-w-[20px]"><span class="s-val text-base font-bold">0</span></div>
                      </div>
                    </div>
                  </div>
                  <span class="g-label text-base text-[#ddd] font-bold uppercase tracking-wider">변환/분배</span>
                </div>

                <!-- Mid-Flow: Conversion to Media -->
                <div class="flow-connector mid-connector to-right w-[200px] h-[100px] absolute left-1/2 z-[1] pointer-events-none">
                  <svg viewBox="0 -20 200 100" class="connector-svg">
                    <path d="M0,50 L200,50" class="flow-line-bg"/>
                    <path d="M0,50 L200,50" class="flow-line-active"/>
                  </svg>
                </div>

                <div class="big-gauge flex flex-col items-center gap-2.5 z-[2] instrument-green">
                  <div class="g-wrap car-cluster relative w-[200px] h-[200px] rounded-full">
                    <div class="glass-reflection"></div>
                    <svg viewBox="0 0 100 100" class="gauge-svg instrument-svg rotate-0 w-full h-full overflow-visible">
                      <g class="notches group">
                        <line v-for="n in 21" :key="n" x1="50" y1="10" x2="50" y2="15" 
                              :transform="`rotate(${((n-1) * 13.5) - 135}, 50, 50)`" 
                              class="tick" :class="{ major: (n-1) % 5 === 0 }"/>
                      </g>
                      <circle cx="50" cy="50" r="40" class="dial-bg"/>
                      <circle cx="50" cy="50" r="40" class="dial-needle" stroke="url(#greenNeedle)" 
                              style="stroke-dasharray: 180 251; stroke-dashoffset: 0;"/>
                    </svg>
                    <div class="g-text absolute inset-0 flex flex-col items-center justify-center z-[5]">
                      <span class="v-main text-[2.5rem] font-bold text-white">12</span>
                      <div class="instrument-status-grid flex gap-[15px] mt-1.5 py-1 px-3 bg-black/40 border border-white/[0.08] rounded-[20px]">
                        <div class="stat-item standby flex flex-col items-center min-w-[20px]"><span class="s-val text-base font-bold">5</span></div>
                        <div class="stat-item error flex flex-col items-center min-w-[20px]"><span class="s-val text-base font-bold">1</span></div>
                      </div>
                    </div>
                  </div>
                  <span class="g-label text-base text-[#ddd] font-bold uppercase tracking-wider">미디어</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- CDN Middle Box -->
        <div class="cdn-spacer flex flex-col items-center justify-center w-10 relative z-20">
          <!-- Flow: Site 1 Media to CDN -->
          <div class="cdn-flow-connector from-left absolute w-[200px] h-[100px] top-1/2 z-[1] pointer-events-none">
            <svg viewBox="0 -80 200 100" class="connector-svg">
              <path d="M0,50 L200,50" class="flow-line-bg"/>
              <path d="M0,50 L200,50" class="flow-line-active"/>
            </svg>
          </div>

          <!-- Flow: Site 2 Media to CDN -->
          <div class="cdn-flow-connector from-right absolute w-[200px] h-[100px] top-1/2 z-[1] pointer-events-none">
            <svg viewBox="0 -80 200 100" class="connector-svg">
              <path d="M200,50 L0,50" class="flow-line-bg"/>
              <path d="M200,50 L0,50" class="flow-line-active"/>
            </svg>
          </div>

          <div class="cdn-node-box w-[150px] h-[150px] rounded-xl flex flex-col items-center justify-center">
            <Globe class="cdn-icon w-[60px] h-[60px] mb-2.5" />
            <span class="cdn-name text-[1.4rem] font-extrabold text-white tracking-[2px]">CDN</span>
          </div>
        </div>

        <!-- Gangwon Panel -->
        <div class="cyber-panel flex-1 h-full rounded flex flex-col relative overflow-hidden shadow-[0_0_20px_rgba(255,0,255,0.1)]">
          <div class="panel-cap blue-bg-cap py-1.5 px-[15px] flex items-center justify-center">
            <span class="panel-name text-[0.9rem] font-bold">김천본사</span>
          </div>
          <div class="flex-1 flex py-2.5 px-5 gap-[150px] items-center justify-center relative">
            <!-- Main Status Area -->
            <div class="flex-1 h-full flex flex-col justify-between pt-1.5 m-0 z-[2] gangwon-theme">
              <div class="service-row standby-mode flex flex-col items-center justify-center gap-[15px] bg-black/40 py-3 px-[25px] rounded-xl border border-white/[0.08] mb-auto w-fit">
                <div class="mode-tag py-1 px-3.5 rounded-md font-extrabold text-[0.9rem] border-2 border-current">STANDBY</div>
                <div class="service-icons flex gap-4">
                  <div class="s-icon active flex items-center gap-2 bg-white/[0.03] py-1.5 px-3 rounded-md border border-white/5 transition-all duration-300"><Monitor class="i-yellow"/><span class="t text-base font-bold text-white tracking-wider">Web</span></div>
                  <div class="s-icon active flex items-center gap-2 bg-white/[0.03] py-1.5 px-3 rounded-md border border-white/5 transition-all duration-300"><Server class="i-yellow"/><span class="t text-base font-bold text-white tracking-wider">WAS</span></div>
                  <div class="s-icon active flex items-center gap-2 bg-white/[0.03] py-1.5 px-3 rounded-md border border-white/5 transition-all duration-300"><Database class="i-yellow"/><span class="t text-base font-bold text-white tracking-wider">DB</span></div>
                </div>
              </div>

              <div class="gauge-pair flex justify-center gap-[200px] flex-1 items-center relative">
                <div class="big-gauge flex flex-col items-center gap-2.5 z-[2] instrument-green">
                  <div class="g-wrap car-cluster relative w-[200px] h-[200px] rounded-full">
                    <div class="glass-reflection"></div>
                    <svg viewBox="0 0 100 100" class="gauge-svg instrument-svg rotate-0 w-full h-full overflow-visible">
                      <g class="notches group">
                        <line v-for="n in 21" :key="n" x1="50" y1="10" x2="50" y2="15" 
                              :transform="`rotate(${((n-1) * 13.5) - 135}, 50, 50)`" 
                              class="tick" :class="{ major: (n-1) % 5 === 0 }"/>
                      </g>
                      <circle cx="50" cy="50" r="40" class="dial-bg"/>
                      <circle cx="50" cy="50" r="40" class="dial-needle" stroke="url(#greenNeedle)" 
                              style="stroke-dasharray: 160 251; stroke-dashoffset: 0;"/>
                    </svg>
                    <div class="g-text absolute inset-0 flex flex-col items-center justify-center z-[5]">
                      <span class="v-main text-[2.5rem] font-bold text-white">10</span>
                      <div class="instrument-status-grid flex gap-[15px] mt-1.5 py-1 px-3 bg-black/40 border border-white/[0.08] rounded-[20px]">
                        <div class="stat-item standby flex flex-col items-center min-w-[20px]"><span class="s-val text-base font-bold">2</span></div>
                        <div class="stat-item error flex flex-col items-center min-w-[20px]"><span class="s-val text-base font-bold">1</span></div>
                      </div>
                    </div>
                  </div>
                  <span class="g-label text-base text-[#ddd] font-bold uppercase tracking-wider">미디어</span>
                </div>

                <!-- Mid-Flow: Conversion to Media -->
                <div class="flow-connector mid-connector to-left w-[200px] h-[100px] absolute left-1/2 z-[1] pointer-events-none">
                  <svg viewBox="0 -20 200 100" class="connector-svg">
                    <path d="M200,50 L0,50" class="flow-line-bg"/>
                    <path d="M200,50 L0,50" class="flow-line-active"/>
                  </svg>
                </div>

                <div class="big-gauge flex flex-col items-center gap-2.5 z-[2] instrument-green">
                  <div class="g-wrap car-cluster relative w-[200px] h-[200px] rounded-full">
                    <div class="glass-reflection"></div>
                    <svg viewBox="0 0 100 100" class="gauge-svg instrument-svg rotate-0 w-full h-full overflow-visible">
                      <g class="notches group">
                        <line v-for="n in 21" :key="n" x1="50" y1="10" x2="50" y2="15" 
                              :transform="`rotate(${((n-1) * 13.5) - 135}, 50, 50)`" 
                              class="tick" :class="{ major: (n-1) % 5 === 0 }"/>
                      </g>
                      <circle cx="50" cy="50" r="40" class="dial-bg"/>
                      <circle cx="50" cy="50" r="40" class="dial-needle" stroke="url(#greenNeedle)" 
                              style="stroke-dasharray: 130 251; stroke-dashoffset: 0;"/>
                    </svg>
                    <div class="g-text absolute inset-0 flex flex-col items-center justify-center z-[5]">
                      <span class="v-main text-[2.5rem] font-bold text-white">7</span>
                      <div class="instrument-status-grid flex gap-[15px] mt-1.5 py-1 px-3 bg-black/40 border border-white/[0.08] rounded-[20px]">
                        <div class="stat-item standby flex flex-col items-center min-w-[20px]"><span class="s-val text-base font-bold">1</span></div>
                        <div class="stat-item error flex flex-col items-center min-w-[20px]"><span class="s-val text-base font-bold">0</span></div>
                      </div>
                    </div>
                  </div>
                  <span class="g-label text-base text-[#ddd] font-bold uppercase tracking-wider">변환/분배</span>
                </div>
              </div>
            </div>

            <!-- Flow Connector: CCTV to Conversion (Absolute Overlay Expanded) -->
            <div class="flow-connector to-left absolute w-[400px] h-[460px] z-[1] pointer-events-none">
              <svg viewBox="150 -50 250 460" class="connector-svg">
                <path d="M400,65 C200,65 200,230 0,230" class="flow-line-bg"/>
                <path d="M400,230 L0,230" class="flow-line-bg"/>
                <path d="M400,395 C200,395 200,230 0,230" class="flow-line-bg"/>
                
                <path d="M400,65 C200,65 200,230 0,230" class="flow-line-active"/>
                <path d="M400,230 L0,230" class="flow-line-active"/>
                <path d="M400,395 C200,395 200,230 0,230" class="flow-line-active"/>
              </svg>
            </div>

            <!-- CCTV Column -->
            <div class="w-[140px] flex flex-col gap-5 items-center justify-center m-0 z-[2]">
              <span class="text-base font-bold text-[#888] border-b-2 border-[#333] w-full text-center pb-2 mb-2.5">CCTV</span>
              <div class="flex flex-col gap-[30px]">
                <div class="flex flex-col items-center gap-2.5">
                  <div class="mini-chart cyan relative w-[110px] h-[110px] flex flex-col items-center">
                    <div class="mini-inner z-[2] mt-[35px] font-bold text-[1.4rem]">
                      <span class="v1">48</span><span class="v-alt">/1</span>
                    </div>
                    <svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" class="bg"/><circle cx="20" cy="20" r="18" class="progress" style="stroke-dasharray: 85 113;"/></svg>
                  </div>
                  <span class="mini-label text-base text-[#eee] font-semibold text-center">도로공사</span>
                </div>
                <div class="flex flex-col items-center gap-2.5">
                  <div class="mini-chart cyan relative w-[110px] h-[110px] flex flex-col items-center">
                    <div class="mini-inner z-[2] mt-[35px] font-bold text-[1.4rem]">
                      <span class="v1">40</span><span class="v-alt">/2</span>
                    </div>
                    <svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" class="bg"/><circle cx="20" cy="20" r="18" class="progress" style="stroke-dasharray: 75 113;"/></svg>
                  </div>
                  <span class="mini-label text-base text-[#eee] font-semibold text-center">수탁</span>
                </div>
                <div class="flex flex-col items-center gap-2.5">
                  <div class="mini-chart cyan relative w-[110px] h-[110px] flex flex-col items-center">
                    <div class="mini-inner z-[2] mt-[35px] font-bold text-[1.4rem]">
                      <span class="v1">50</span><span class="v-alt">/2</span>
                    </div>
                    <svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" class="bg"/><circle cx="20" cy="20" r="18" class="progress" style="stroke-dasharray: 88 113;"/></svg>
                  </div>
                  <span class="mini-label text-base text-[#eee] font-semibold text-center">비수탁</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Section -->
      <div class="flex-1 flex gap-[15px]">
        <!-- CCTV HQ List -->
        <div class="cyber-panel flex-1 rounded flex flex-col relative overflow-hidden cctv-glow">
          <div class="panel-cap blue-bg-cap py-1.5 px-[15px] flex items-center justify-center">
            <span class="panel-name text-[0.9rem] font-bold">본부별 CCTV 현황</span>
          </div>
          <div class="py-1.5 px-[15px] flex items-center justify-center border-b-0 p-0">
            <div class="hq-tabs-container flex w-full bg-black/40 border-b border-white/10 overflow-x-auto scrollbar-none">
              <button 
                v-for="hq in hqs" 
                :key="hq.id"
                class="tab-btn flex-1 py-2.5 px-1.5 bg-transparent border-0 border-b-2 border-transparent text-[#666] text-[0.85rem] font-extrabold cursor-pointer whitespace-nowrap transition-all duration-300"
                :class="{ active: activeHQ === hq.id }"
                @click="activeHQ = hq.id"
              >
                {{ hq.name }}
              </button>
            </div>
          </div>
          <div class="list-container scrolling flex-1 p-2.5 flex flex-col gap-2 overflow-y-auto">
            <div 
              v-for="branch in currentBranches" 
              :key="branch.name"
              class="hq-item flex justify-between items-center bg-white/5 p-2.5 rounded border-b border-white/5"
            >
              <div class="hq-left flex items-center gap-2.5 font-bold text-base"><MapPin class="pin-icon w-[18px]"/> {{ branch.name }}</div>
              <div class="hq-right flex items-center gap-1.5 text-[1.1rem] font-bold">
                <span class="green">{{ branch.ok }}</span> / <span class="red">{{ branch.err }}</span> 
              </div>
            </div>
          </div>
        </div>

        <!-- Traffic Chart 1: Traffic Center -->
        <div class="cyber-panel flex-1 rounded flex flex-col relative overflow-hidden traffic-glow">
          <div class="panel-cap blue-bg-cap py-1.5 px-[15px] flex items-center justify-center"><span class="panel-name text-[0.9rem] font-bold">교통센터 네트워크 트래픽</span></div>
          <div class="traffic-content flex-1 p-2.5 flex flex-col gap-2.5">
            <div class="traffic-entry flex-1 flex flex-col">
              <div class="t-meta flex justify-between text-xs text-[#666] mb-0.5"><span>네트워크 트래픽 (Mbps)</span><span class="peak cyan font-extrabold text-base text-white">1,200 <small class="text-[0.65rem] font-normal uppercase">peak</small></span></div>
              <div class="chart-box flex-1 bg-black/40 border border-white/5 rounded overflow-hidden"><CyberChart :data="traffic1" color="#00f3ff" label="네트워크 트래픽"/></div>
            </div>
            <div class="traffic-entry flex-1 flex flex-col">
              <div class="t-meta flex justify-between text-xs text-[#666] mb-0.5"><span>실시간 접속자 (명)</span><span class="peak magenta font-extrabold text-base text-white">350 <small class="text-[0.65rem] font-normal uppercase">active</small></span></div>
              <div class="chart-box flex-1 bg-black/40 border border-white/5 rounded overflow-hidden"><CyberChart :data="users1" color="#ff00ff" label="실시간 접속자"/></div>
            </div>
          </div>
        </div>

        <!-- Traffic Chart 2: Kimcheon HQ -->
        <div class="cyber-panel flex-1 rounded flex flex-col relative overflow-hidden traffic-glow">
          <div class="panel-cap blue-bg-cap py-1.5 px-[15px] flex items-center justify-center"><span class="panel-name text-[0.9rem] font-bold">김천본사 네트워크 트래픽</span></div>
          <div class="traffic-content flex-1 p-2.5 flex flex-col gap-2.5">
            <div class="traffic-entry flex-1 flex flex-col">
              <div class="t-meta flex justify-between text-xs text-[#666] mb-0.5"><span>네트워크 트래픽 (Mbps)</span><span class="peak cyan font-extrabold text-base text-white">1,300 <small class="text-[0.65rem] font-normal uppercase">peak</small></span></div>
              <div class="chart-box flex-1 bg-black/40 border border-white/5 rounded overflow-hidden"><CyberChart :data="traffic2" color="#00f3ff" label="네트워크 트래픽"/></div>
            </div>
            <div class="traffic-entry flex-1 flex flex-col">
              <div class="t-meta flex justify-between text-xs text-[#666] mb-0.5"><span>실시간 접속자 (명)</span><span class="peak magenta font-extrabold text-base text-white">250 <small class="text-[0.65rem] font-normal uppercase">active</small></span></div>
              <div class="chart-box flex-1 bg-black/40 border border-white/5 rounded overflow-hidden"><CyberChart :data="users2" color="#ff00ff" label="실시간 접속자"/></div>
            </div>
          </div>
        </div>

        <!-- Alarms -->
        <div class="cyber-panel flex-1 rounded flex flex-col relative overflow-hidden alarm-glow">
          <div class="panel-cap blue-bg-cap py-1.5 px-[15px] flex items-center justify-center"><span class="panel-name text-[0.9rem] font-bold">알람이력</span></div>
          <div class="list-container scrolling flex-1 p-2.5 flex flex-col gap-2 overflow-y-auto">
            <div 
              v-for="(alarm, idx) in alarmHistory" 
              :key="idx"
              class="alarm-box bg-white/[0.03] p-2.5 rounded border-l-4 border-l-[#444]" 
              :class="alarm.level"
            >
              <div class="a-header text-xs text-[#aaa] flex justify-between mb-1">{{ alarm.time }} <span class="tag font-extrabold rounded-[10px] py-0 px-2 border border-current">{{ alarm.tag }}</span></div>
              <div class="a-content text-base font-bold text-white">{{ alarm.msg }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Database, Server, Monitor, Globe, MapPin } from 'lucide-vue-next'
import CyberChart from '../common/CyberChart.vue'

const traffic1 = ref([
    { time: '10:00', value: 400 }, { time: '10:15', value: 1200 },
    { time: '10:30', value: 600 }, { time: '10:45', value: 700 }
])
const traffic2 = ref([
    { time: '10:00', value: 200 }, { time: '10:15', value: 350 },
    { time: '10:20', value: 1300 }, { time: '10:45', value: 900 }
])
const users1 = ref([
    { time: '10:00', value: 150 }, { time: '10:15', value: 280 },
    { time: '10:30', value: 210 }, { time: '10:45', value: 350 }
])
const users2 = ref([
    { time: '10:00', value: 100 }, { time: '10:15', value: 180 },
    { time: '10:20', value: 250 }, { time: '10:45', value: 200 }
])

const hqs = ref([
  { id: 'gyeonggi', name: '경기', branches: [
    { name: '수원지사', ok: 45, err: 1 }, { name: '성남지사', ok: 38, err: 0 }, { name: '의정부지사', ok: 42, err: 2 },
    { name: '안양지사', ok: 33, err: 0 }, { name: '부천지사', ok: 29, err: 1 }, { name: '광명지사', ok: 31, err: 0 },
    { name: '평택지사', ok: 40, err: 1 }, { name: '안산지사', ok: 35, err: 0 }, { name: '고양지사', ok: 44, err: 3 },
    { name: '과천지사', ok: 22, err: 0 }
  ]},
  { id: 'gangwon', name: '강원', branches: [
    { name: '춘천지사', ok: 30, err: 0 }, { name: '강릉지사', ok: 25, err: 1 }, { name: '원주지사', ok: 28, err: 0 },
    { name: '속초지사', ok: 18, err: 2 }, { name: '삼척지사', ok: 21, err: 0 }, { name: '동해지사', ok: 19, err: 1 },
    { name: '태백지사', ok: 15, err: 0 }, { name: '홍천지사', ok: 24, err: 0 }, { name: '횡성지사', ok: 20, err: 1 },
    { name: '평창지사', ok: 22, err: 0 }
  ]},
  { id: 'chungcheong', name: '충청', branches: [
    { name: '대전지사', ok: 50, err: 1 }, { name: '천안지사', ok: 35, err: 0 }, { name: '청주지사', ok: 32, err: 1 },
    { name: '충주지사', ok: 28, err: 0 }, { name: '제천지사', ok: 25, err: 2 }, { name: '아산지사', ok: 31, err: 0 },
    { name: '서산지사', ok: 24, err: 1 }, { name: '논산지사', ok: 27, err: 0 }, { name: '공주지사', ok: 26, err: 1 },
    { name: '보령지사', ok: 22, err: 0 }
  ]},
  { id: 'jeonnam', name: '전남', branches: [
    { name: '광주지사', ok: 40, err: 0 }, { name: '목포지사', ok: 22, err: 2 }, { name: '순천지사', ok: 28, err: 0 },
    { name: '여수지사', ok: 31, err: 1 }, { name: '나주지사', ok: 25, err: 0 }, { name: '광양지사', ok: 27, err: 1 },
    { name: '담양지사', ok: 18, err: 0 }, { name: '곡성지사', ok: 15, err: 0 }, { name: '구례지사', ok: 14, err: 0 },
    { name: '고흥지사', ok: 19, err: 1 }
  ]},
  { id: 'gyeongbuk', name: '경북', branches: [
    { name: '대구지사', ok: 55, err: 3 }, { name: '포항지사', ok: 30, err: 0 }, { name: '안동지사', ok: 24, err: 1 },
    { name: '구미지사', ok: 32, err: 0 }, { name: '경주지사', ok: 29, err: 2 }, { name: '영주지사', ok: 21, err: 0 },
    { name: '상주지사', ok: 23, err: 1 }, { name: '문경지사', ok: 18, err: 0 }, { name: '경산지사', ok: 27, err: 0 },
    { name: '영천지사', ok: 22, err: 1 }
  ]},
  { id: 'gyeongnam', name: '경남', branches: [
    { name: '부산지사', ok: 60, err: 1 }, { name: '창원지사', ok: 42, err: 0 }, { name: '진주지사', ok: 29, err: 1 },
    { name: '김해지사', ok: 35, err: 0 }, { name: '양산지사', ok: 28, err: 2 }, { name: '거제지사', ok: 24, err: 0 },
    { name: '통영지사', ok: 21, err: 1 }, { name: '사천지사', ok: 23, err: 0 }, { name: '밀양지사', ok: 20, err: 0 },
    { name: '거창지사', ok: 18, err: 1 }
  ]}
])

const activeHQ = ref('gyeonggi')
const currentBranches = computed(() => {
  const hq = hqs.value.find(h => h.id === activeHQ.value)
  return hq ? hq.branches : []
})

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
</script>
