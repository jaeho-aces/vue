<template>
  <div class="cyber-dashboard relative w-full h-screen overflow-hidden p-1 flex flex-col gap-1 bg-[#0b1121] text-white">
    <!-- Background grid and scanning effects -->
    <div class="grid-overlay"></div>
    <div class="hexagon-overlay"></div>
    <!-- Top Navigation / Header -->
    <div class="flex items-center justify-center relative h-[64px] shrink-0 border-b border-[#00f3ff]/20 bg-[#0f172a]/80 backdrop-blur-sm z-20">
      <!-- Left side: Logo & Organization -->
      <div class="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-4">
        <img src="/ci.svg" alt="CI" class="h-9 w-auto drop-shadow-[0_0_8px_rgba(0,243,255,0.6)]" />
        <span class="text-xl font-bold tracking-tight text-white/90">한국도로공사</span>
      </div>
      
      <!-- Center: Main Title -->
      <span class="text-3xl font-black tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] via-white to-[#00f3ff] drop-shadow-[0_0_15px_rgba(0,243,255,0.4)]">종합상황판</span>
      
      <!-- Center Title Decoration -->
      <div class="h-1 w-1/4 bg-gradient-to-r from-transparent via-[#00f3ff] to-transparent absolute bottom-0 shadow-[0_0_10px_#00f3ff]"></div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 flex gap-1 min-h-0 z-10 w-full relative">
      


      <!-- Center Columns: Conversion & Provision Grid -->
      <div class="flex-[3] grid grid-cols-[1fr_auto_1fr] grid-rows-2 gap-x-1 gap-y-4 pt-2 pb-2 pl-2 pr-0 relative">
          
          <!-- Shared Header Labels (Pseudo) -->



          <!-- 1. Top Left: Traffic Center Conversion -->
          <div class="flex flex-col h-full gap-2">
               <!-- Section Title -->
               <div class="w-full z-30 mb-1">
                  <div class="neon-title-wrapper">
                    <span class="neon-title-text">영상 변환</span>
                  </div>
               </div>

              <div class="cyber-fancy-panel flex-1 relative border border-[#00f3ff]/30 rounded-lg p-2 flex flex-col items-center shadow-[inset_0_0_20px_rgba(0,243,255,0.05)] overflow-hidden">

                 <!-- Corner Accents -->
                 <div class="corner-acc tl"></div>
                 <div class="corner-acc tr"></div>
                 <div class="corner-acc bl"></div>
                 <div class="corner-acc br"></div>

             <!-- Upper Ring Info -->
             <div class="w-full bg-[#334155]/60 rounded-full py-4 px-8 mb-6 border border-white/10 flex justify-between items-center relative overflow-hidden shadow-lg z-10">
                <div class="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-50"></div>
                <div class="text-xs text-gray-300 z-10 flex flex-col min-w-[120px]">
                   <span class="font-bold text-orange-300 text-lg">상부 링</span>
                   <span class="text-xl text-white font-bold">4070 / <span class="text-gray-400">5000</span></span>
                </div>
                <div class="flex gap-6 z-10">
                    <SimpleGauge label="CPU" :value="45" color="#22c55e" size="xl" index="1" />
                    <SimpleGauge label="5G" :value="30" color="#22c55e" ring size="xl" index="2" />
                    <SimpleGauge label="MEM" :value="45" color="#22c55e" size="xl" index="3" />
                    <SimpleGauge label="DISK" :value="30" color="#22c55e" size="xl" index="4" />
                </div>
                <div class="text-sm text-right text-gray-400 z-10 leading-tight min-w-[100px]">
                   <div class="text-red-300 font-bold">물리서버 11식</div>
                   <div>VM 19식</div>
                </div>
             </div>
             
             <!-- Tree Connections (SVG Overlay) -->
             <!-- ViewBox 0 0 400 300. Center top is 200,80 (approx bottom of ring). Bottom nodes at Y=250 scattered x=40..360 -->
             <!-- Tree Connections (SVG Overlay) -->
             <!-- ViewBox 0 0 400 300. Adjusted for 12 o'clock connection. Node top Y ~= 200 (if node is h=96 and total H=300).
                  Let's assume the regional nodes are centered horizontally at roughly spacing 80px apart: 40, 120, 200, 280, 360.
                  We connect to Y=230 (approx top of node which is near bottom).
             -->
             <!-- Tree Connections (SVG Overlay) - Curved Animated -->
             <svg class="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible" viewBox="0 0 400 300" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="lineGradientTop" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stop-color="#10b981" stop-opacity="0.2"/>
                    <stop offset="100%" stop-color="#34d399" stop-opacity="1"/>
                  </linearGradient>
                </defs>
                <!-- Paths from nodes (bottom) to ring (top center) -->
                <!-- Center to Ring -->
                <path d="M200,170 C200,150 200,120 200,100" stroke="url(#lineGradientTop)" stroke-width="2" fill="none" class="connector-line" />
                <path d="M200,170 C200,150 200,120 200,100" stroke="#34d399" stroke-width="2" fill="none" stroke-dasharray="5,5" class="flow-animation" />
                
                <!-- Left 1 to Ring -->
                <path d="M50,170 C50,125 150,145 200,100" stroke="url(#lineGradientTop)" stroke-width="2" fill="none" class="connector-line" />
                <path d="M50,170 C50,125 150,145 200,100" stroke="#34d399" stroke-width="2" fill="none" stroke-dasharray="5,5" class="flow-animation delay-1" />

                <!-- Left 2 to Ring -->
                <path d="M125,170 C125,125 175,145 200,100" stroke="url(#lineGradientTop)" stroke-width="2" fill="none" class="connector-line" />
                <path d="M125,170 C125,125 175,145 200,100" stroke="#34d399" stroke-width="2" fill="none" stroke-dasharray="5,5" class="flow-animation delay-2" />

                <!-- Right 1 to Ring -->
                <path d="M280,170 C280,125 225,145 200,100" stroke="url(#lineGradientTop)" stroke-width="2" fill="none" class="connector-line" />
                <path d="M280,170 C280,125 225,145 200,100" stroke="#34d399" stroke-width="2" fill="none" stroke-dasharray="5,5" class="flow-animation delay-1" />

                <!-- Right 2 to Ring -->
                <path d="M350,170 C350,125 250,145 200,100" stroke="url(#lineGradientTop)" stroke-width="2" fill="none" class="connector-line" />
                <path d="M350,170 C350,125 250,145 200,100" stroke="#34d399" stroke-width="2" fill="none" stroke-dasharray="5,5" class="flow-animation delay-2" />
             </svg>

             <!-- Regional Nodes -->
             <div class="flex justify-around w-full mt-auto z-10 px-1">
                 <RegionalNode name="수도권본부" val="870" total="1000" id="5" color="blue" />
                 <RegionalNode name="서울경기본부" val="800" total="1000" id="5" color="blue" />
                 <RegionalNode name="강원본부" val="800" total="1000" id="3" color="blue" />
                 <RegionalNode name="충북본부" val="800" total="1000" id="3" color="blue" />
                 <RegionalNode name="대전충남본부" val="800" total="1000" id="3" color="blue" />
             </div>
          </div>
       </div>

          <!-- Top Arrow -->
          <div class="flex items-center justify-center">
             <div class="w-14 h-32 flex items-center justify-center relative group">
                <!-- Background Glow -->
                <div class="absolute inset-x-[-8px] inset-y-8 bg-blue-500/10 blur-xl rounded-full animate-pulse"></div>
                <CyberPipeFlow color="#00f3ff" />
             </div>
          </div>

          <!-- 2. Top Right: Traffic Center Provision -->
          <div class="flex flex-col h-full gap-2">
              <!-- Section Title -->
               <div class="w-full z-30 mb-1">
                  <div class="neon-title-wrapper">
                    <span class="neon-title-text">영상 제공</span>
                  </div>
               </div>

              <div class="cyber-fancy-panel flex-1 relative border border-[#00f3ff]/30 rounded-lg p-2 flex flex-col items-center shadow-[inset_0_0_20px_rgba(0,243,255,0.05)] overflow-hidden">

                 <!-- Corner Accents -->
                 <div class="corner-acc tl"></div>
                 <div class="corner-acc tr"></div>
                 <div class="corner-acc bl"></div>
                 <div class="corner-acc br"></div>

              <!-- Upper Ring Info -->
             <div class="w-full bg-[#334155]/60 rounded-full py-4 px-8 mb-6 border border-white/10 flex justify-between items-center relative overflow-hidden shadow-lg z-10">
                <div class="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-50"></div>
                <div class="text-xs text-gray-300 z-10 flex flex-col min-w-[120px]">
                   <div class="font-bold text-green-300 text-lg">상부 링</div>
                   <div class="text-xl text-white font-bold">3970 / <span class="text-gray-400">5000</span></div>
                </div>
                <div class="flex gap-6 z-10">
                    <SimpleGauge label="CPU" :value="55" color="#22c55e" size="xl" index="1" />
                    <SimpleGauge label="5G" :value="55" color="#22c55e" ring size="xl" index="2" />
                    <SimpleGauge label="MEM" :value="40" color="#22c55e" size="xl" index="3" />
                    <SimpleGauge label="DISK" :value="20" color="#22c55e" size="xl" index="4" />
                </div>
                <div class="text-sm text-right text-gray-400 z-10 leading-tight min-w-[100px]">
                   <div class="text-red-300 font-bold">물리서버 11식</div>
                   <div>VM 10식</div>
                </div>
             </div>
             
             <!-- Tree Connections (SVG Overlay) -->
             <!-- Tree Connections (SVG Overlay) -->
             <!-- Tree Connections (SVG Overlay) - Curved Animated -->
             <svg class="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible" viewBox="0 0 400 300" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="lineGradientTop2" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stop-color="#10b981" stop-opacity="0.2"/>
                    <stop offset="100%" stop-color="#34d399" stop-opacity="1"/>
                  </linearGradient>
                </defs>
                <!-- Paths from nodes (bottom) to ring (top center) -->
                <!-- Center to Ring -->
                <path d="M200,170 C200,150 200,120 200,100" stroke="url(#lineGradientTop2)" stroke-width="2" fill="none" class="connector-line" />
                <path d="M200,170 C200,150 200,120 200,100" stroke="#34d399" stroke-width="2" fill="none" stroke-dasharray="5,5" class="flow-animation" />
                
                <!-- Left 1 to Ring -->
                <path d="M50,170 C50,125 150,145 200,100" stroke="url(#lineGradientTop2)" stroke-width="2" fill="none" class="connector-line" />
                <path d="M50,170 C50,125 150,145 200,100" stroke="#34d399" stroke-width="2" fill="none" stroke-dasharray="5,5" class="flow-animation delay-1" />

                <!-- Left 2 to Ring -->
                <path d="M125,170 C125,125 175,145 200,100" stroke="url(#lineGradientTop2)" stroke-width="2" fill="none" class="connector-line" />
                <path d="M125,170 C125,125 175,145 200,100" stroke="#34d399" stroke-width="2" fill="none" stroke-dasharray="5,5" class="flow-animation delay-2" />

                <!-- Right 1 to Ring (Error Pulse) -->
                <path d="M280,170 C280,125 225,145 200,100" stroke="#ef4444" stroke-width="2" fill="none" class="connector-line animate-pulse" />
                
                <!-- Right 2 to Ring -->
                <path d="M350,170 C350,125 250,145 200,100" stroke="url(#lineGradientTop2)" stroke-width="2" fill="none" class="connector-line" />
                <path d="M350,170 C350,125 250,145 200,100" stroke="#34d399" stroke-width="2" fill="none" stroke-dasharray="5,5" class="flow-animation delay-2" />
             </svg>
             
             <!-- Regional Nodes -->
             <div class="flex justify-around w-full mt-auto z-10 px-1">
                 <RegionalNode name="수도권본부" val="770" total="1000" id="3" color="blue" />
                 <RegionalNode name="서울경기본부" val="800" total="1000" id="3" color="blue" />
                 <RegionalNode name="강원본부" val="800" total="1000" id="2" color="blue" />
                 <RegionalNode name="충북본부" val="800" total="1000" id="2" color="blue" error />
                 <RegionalNode name="대전충남본부" val="800" total="1000" id="2" color="blue" />
             </div>
          </div>
       </div>

          <!-- 3. Bottom Left: HQ Conversion -->
          <div class="cyber-fancy-panel cluster-panel relative border border-[#00f3ff]/30 rounded-lg p-2 flex flex-col items-center shadow-[inset_0_0_20px_rgba(0,243,255,0.05)] overflow-hidden">
               <!-- Corner Accents -->
               <div class="corner-acc tl"></div>
               <div class="corner-acc tr"></div>
               <div class="corner-acc bl"></div>
               <div class="corner-acc br"></div>
              <!-- Lower Ring Info -->
              <!-- Lower Ring Info -->
              <!-- Lower Ring Info -->
              <div class="w-full bg-[#334155]/60 rounded-full py-4 px-8 mb-6 border border-white/10 flex justify-between items-center relative overflow-hidden shadow-lg z-10">
                <div class="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-50"></div>
                <div class="text-xs text-gray-300 z-10 flex flex-col min-w-[120px]">
                   <div class="font-bold text-blue-300 text-lg">하부 링</div>
                   <div class="text-xl text-white font-bold">3200 / <span class="text-gray-400">4000</span></div>
                </div>
                <div class="flex gap-6 z-10">
                    <SimpleGauge label="CPU" :value="45" color="#22c55e" size="xl" index="1" />
                    <SimpleGauge label="5G" :value="58" color="#22c55e" ring size="xl" index="2" />
                    <SimpleGauge label="MEM" :value="50" color="#22c55e" size="xl" index="3" />
                    <SimpleGauge label="DISK" :value="35" color="#22c55e" size="xl" index="4" />
                </div>
                <div class="text-sm text-right text-gray-400 z-10 leading-tight min-w-[100px]">
                   <div class="text-white font-bold">물리서버 12식</div>
                   <div>VM 14식</div>
                </div>
             </div>
             
             <!-- Tree Connections (SVG Overlay) -->
             <!-- Tree Connections (SVG Overlay) -->
             <!-- Tree Connections (SVG Overlay) - Curved Animated -->
             <svg class="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible" viewBox="0 0 400 300" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="lineGradientBot" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stop-color="#10b981" stop-opacity="0.2"/>
                    <stop offset="100%" stop-color="#34d399" stop-opacity="1"/>
                  </linearGradient>
                </defs>
                <!-- Paths from nodes (bottom) to ring (top center) -->
                <!-- Center to Ring -->
                <path d="M60,180 C60,140 200,130 200,85" stroke="url(#lineGradientBot)" stroke-width="2" fill="none" class="connector-line" />
                <path d="M60,180 C60,140 200,130 200,85" stroke="#34d399" stroke-width="2" fill="none" stroke-dasharray="5,5" class="flow-animation" />
                
                <path d="M155,180 C155,140 200,130 200,85" stroke="url(#lineGradientBot)" stroke-width="2" fill="none" class="connector-line" />
                <path d="M155,180 C155,140 200,130 200,85" stroke="#34d399" stroke-width="2" fill="none" stroke-dasharray="5,5" class="flow-animation delay-1" />

                <path d="M245,180 C245,140 200,130 200,85" stroke="url(#lineGradientBot)" stroke-width="2" fill="none" class="connector-line" />
                <path d="M245,180 C245,140 200,130 200,85" stroke="#34d399" stroke-width="2" fill="none" stroke-dasharray="5,5" class="flow-animation delay-1" />

                <path d="M340,180 C340,140 200,130 200,85" stroke="url(#lineGradientBot)" stroke-width="2" fill="none" class="connector-line" />
                <path d="M340,180 C340,140 200,130 200,85" stroke="#34d399" stroke-width="2" fill="none" stroke-dasharray="5,5" class="flow-animation delay-2" />
             </svg>
             
             <!-- Regional Nodes -->
             <div class="flex justify-around w-full mt-auto z-10 px-4">
                 <RegionalNode name="전북본부" val="800" total="1000" id="5" color="blue" />
                 <RegionalNode name="광주전남본부" val="800" total="1000" id="3" color="blue" warning />
                 <RegionalNode name="대구경북본부" val="800" total="1000" id="3" color="blue" />
                 <RegionalNode name="부산경남본부" val="800" total="1000" id="3" color="blue" />
             </div>
          </div>

          <!-- Bottom Arrow -->
          <div class="flex items-center justify-center -translate-y-4">
             <div class="w-14 h-32 flex items-center justify-center relative group">
                <!-- Background Glow -->
                <div class="absolute inset-x-[-8px] inset-y-8 bg-blue-500/10 blur-xl rounded-full animate-pulse"></div>
                <CyberPipeFlow color="#00f3ff" />
             </div>
          </div>

          <!-- 4. Bottom Right: HQ Provision -->
          <div class="cyber-fancy-panel cluster-panel relative border border-[#00f3ff]/30 rounded-lg p-2 flex flex-col items-center shadow-[inset_0_0_20px_rgba(0,243,255,0.05)] overflow-hidden">
                <!-- Corner Accents -->
                <div class="corner-acc tl"></div>
                <div class="corner-acc tr"></div>
                <div class="corner-acc bl"></div>
                <div class="corner-acc br"></div>
               <!-- Lower Ring Info -->
                <!-- Lower Ring Info -->
              <div class="w-full bg-[#334155]/60 rounded-full py-4 px-8 mb-6 border border-white/10 flex justify-between items-center relative overflow-hidden shadow-lg z-10">
                <div class="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-50"></div>
                <div class="text-xs text-gray-300 z-10 flex flex-col min-w-[120px]">
                   <div class="font-bold text-blue-300 text-lg">하부 링</div>
                   <div class="text-xl text-white font-bold">3000 / <span class="text-gray-400">4000</span></div>
                </div>
                <div class="flex gap-6 z-10">
                    <SimpleGauge label="CPU" :value="40" color="#22c55e" size="xl" index="1" />
                    <SimpleGauge label="5G" :value="30" color="#22c55e" ring size="xl" index="2" />
                    <SimpleGauge label="MEM" :value="55" color="#22c55e" size="xl" index="3" />
                    <SimpleGauge label="DISK" :value="25" color="#22c55e" size="xl" index="4" />
                </div>
                <div class="text-sm text-right text-gray-400 z-10 leading-tight min-w-[100px]">
                   <div class="text-red-300 font-bold">물리서버 12식</div>
                   <div>VM 9식</div>
                </div>
             </div>

             <!-- Tree Connections (SVG Overlay) -->
             <!-- Tree Connections (SVG Overlay) -->
             <!-- Tree Connections (SVG Overlay) - Curved Animated -->
             <svg class="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible" viewBox="0 0 400 300" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="lineGradientBot2" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stop-color="#10b981" stop-opacity="0.2"/>
                    <stop offset="100%" stop-color="#34d399" stop-opacity="1"/>
                  </linearGradient>
                </defs>
                <!-- Paths from nodes (bottom) to ring (top center) -->
                <!-- Center to Ring -->
                <path d="M60,180 C60,140 200,130 200,85" stroke="url(#lineGradientBot)" stroke-width="2" fill="none" class="connector-line" />
                <path d="M60,180 C60,140 200,130 200,85" stroke="#34d399" stroke-width="2" fill="none" stroke-dasharray="5,5" class="flow-animation" />
                
                <path d="M155,180 C155,140 200,130 200,85" stroke="url(#lineGradientBot)" stroke-width="2" fill="none" class="connector-line" />
                <path d="M155,180 C155,140 200,130 200,85" stroke="#34d399" stroke-width="2" fill="none" stroke-dasharray="5,5" class="flow-animation delay-1" />

                <path d="M245,180 C245,140 200,130 200,85" stroke="url(#lineGradientBot)" stroke-width="2" fill="none" class="connector-line" />
                <path d="M245,180 C245,140 200,130 200,85" stroke="#34d399" stroke-width="2" fill="none" stroke-dasharray="5,5" class="flow-animation delay-1" />

                <path d="M340,180 C340,140 200,130 200,85" stroke="url(#lineGradientBot)" stroke-width="2" fill="none" class="connector-line" />
                <path d="M340,180 C340,140 200,130 200,85" stroke="#34d399" stroke-width="2" fill="none" stroke-dasharray="5,5" class="flow-animation delay-2" />
             </svg>
             
             <!-- Regional Nodes -->
             <div class="flex justify-around w-full mt-auto z-10 px-4">
                 <RegionalNode name="전북본부" val="800" total="1000" id="3" color="blue" />
                 <RegionalNode name="광주전남본부" val="600" total="1000" id="2" color="blue" />
                 <RegionalNode name="대구경북본부" val="800" total="1000" id="2" color="blue" />
                 <RegionalNode name="부산경남본부" val="800" total="1000" id="2" color="blue" />
             </div>
          </div>

      </div>

      <!-- Arrow Between Provision and Integration -->
      <div class="flex flex-col justify-center -ml-1">
          <!-- Single Centered realistic Pipe -->
          <div class="flex items-center justify-center">
             <div class="w-14 h-32 flex items-center justify-center relative group">
                <!-- Outer Background Glow -->
                <div class="absolute inset-x-[-8px] inset-y-8 bg-blue-500/10 blur-xl rounded-full animate-pulse"></div>
                <CyberPipeFlow color="#00f3ff" />
             </div>
          </div>
      </div>

      <!-- Right Column: Integration & Connections -->
      <div class="w-[420px] flex flex-col gap-2 p-2 bg-[#1e293b]/20 border-l border-[#00f3ff]/20 relative">
          
          <!-- Section Title for Integration -->
          <div class="w-full z-30 mb-1">
             <div class="neon-title-wrapper">
               <span class="neon-title-text">연계</span>
             </div>
          </div>

          <!-- Integration Panel -->
          <div class="cyber-fancy-panel flex-1 border border-[#00f3ff]/30 rounded-lg p-2.5 flex flex-col items-center min-h-0 relative shadow-[inset_0_0_20px_rgba(0,243,255,0.1)] overflow-hidden">
             <!-- Corner Accents -->
             <div class="corner-acc tl"></div>
             <div class="corner-acc tr"></div>
             <div class="corner-acc bl"></div>
             <div class="corner-acc br"></div>
             
             <div class="flex-1 flex flex-col gap-2.5 w-full relative py-1.5 mb-1">
                <!-- 1. CDN -->
                <div class="flex flex-row items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 w-full flex-1 transition-all duration-300 hover:bg-white/10 hover:border-blue-400/50 group relative overflow-hidden">

                   <div class="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <Globe class="w-6 h-6 text-blue-400 animate-pulse" />
                   </div>
                   <div class="flex flex-col min-w-0">
                      <div class="text-lg text-gray-100 font-black tracking-tight">CDN</div>
                      <div class="text-[11px] text-blue-300/80 font-medium truncate">대국민 모바일 서비스</div>
                      <div class="flex items-center gap-2 mt-1">
                         <div class="h-1 w-20 bg-gray-700 rounded-full overflow-hidden">
                            <div class="h-full bg-blue-500 w-3/4 animate-pulse"></div>
                         </div>
                         <span class="text-[9px] text-gray-400">77%</span>
                      </div>
                   </div>
                   <div class="ml-auto flex flex-col items-end gap-1 shrink-0">
                      <div class="text-base text-white font-bold tracking-tighter">4230 / <span class="text-gray-500">5000</span></div>
                   </div>
                </div>

                <!-- 2. 정지영상 -->
                <div class="flex flex-row items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 w-full flex-1 transition-all duration-300 hover:bg-white/10 hover:border-emerald-400/50 group relative overflow-hidden">

                   <div class="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <Image class="w-6 h-6 text-emerald-400" />
                   </div>
                   <div class="flex flex-col min-w-0">
                      <div class="text-lg text-gray-100 font-black tracking-tight">정지영상</div>
                      <div class="text-[11px] text-emerald-300/80 font-medium truncate">실시간 스냅샷 연계</div>
                      <div class="flex items-center gap-2 mt-1">
                         <div class="h-1 w-20 bg-gray-700 rounded-full overflow-hidden">
                            <div class="h-full bg-emerald-500 w-[92%]"></div>
                         </div>
                         <span class="text-[9px] text-gray-400">92%</span>
                      </div>
                   </div>
                   <div class="ml-auto flex flex-col items-end gap-1 shrink-0">
                      <div class="text-base text-white font-bold tracking-tighter">1850 / <span class="text-gray-500">2000</span></div>
                   </div>
                </div>

                <!-- 3. 국토부 -->
                <div class="flex flex-row items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 w-full flex-1 transition-all duration-300 hover:bg-white/10 hover:border-orange-400/50 group relative overflow-hidden">

                   <div class="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                      <Video class="w-6 h-6 text-orange-400" />
                   </div>
                   <div class="flex flex-col min-w-0">
                      <div class="text-lg text-gray-100 font-black tracking-tight">국토부</div>
                      <div class="text-[11px] text-orange-300/80 font-medium truncate">국가교통정보센터 연계</div>
                      <div class="flex items-center gap-2 mt-1">
                         <div class="h-1 w-20 bg-gray-700 rounded-full overflow-hidden">
                            <div class="h-full bg-orange-500 w-[88%] animate-pulse-slow"></div>
                         </div>
                         <span class="text-[9px] text-gray-400">88%</span>
                      </div>
                   </div>
                   <div class="ml-auto flex flex-col items-end gap-1 shrink-0">
                      <div class="text-base text-white font-bold tracking-tighter">3100 / <span class="text-gray-500">3500</span></div>
                   </div>
                </div>

                <!-- 4. 교통정보 앱 -->
                <div class="flex flex-row items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 w-full flex-1 transition-all duration-300 hover:bg-white/10 hover:border-green-400/50 group relative overflow-hidden">

                   <div class="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                      <Smartphone class="w-6 h-6 text-green-400" />
                   </div>
                   <div class="flex flex-col min-w-0">
                      <div class="text-lg text-gray-100 font-black tracking-tight">교통정보 앱</div>
                      <div class="text-[11px] text-green-300/80 font-medium truncate">통합 모니터링 서비스</div>
                      <div class="flex items-center gap-2 mt-1">
                         <div class="h-1 w-20 bg-gray-700 rounded-full overflow-hidden">
                            <div class="h-full bg-green-500 w-[92%]"></div>
                         </div>
                         <span class="text-[9px] text-gray-400">92%</span>
                      </div>
                   </div>
                   <div class="ml-auto flex flex-col items-end gap-1 shrink-0">
                      <div class="text-base text-white font-bold tracking-tighter">4520 / <span class="text-gray-500">4800</span></div>
                   </div>
                </div>


             </div>
          </div>

          <!-- Bottom Chart (Overlay) -->
            <div class="cyber-fancy-panel h-80 border border-[#00f3ff]/30 rounded-lg pb-4 pt-12 px-2 relative overflow-hidden backdrop-blur-sm shadow-[inset_0_0_30px_rgba(0,243,255,0.05)] flex flex-col">
               <!-- Corner Accents -->
               <div class="corner-acc tl"></div>
               <div class="corner-acc tr"></div>
               <div class="corner-acc bl"></div>
               <div class="corner-acc br"></div>
               <div class="absolute inset-0 opacity-20 bg-gradient-to-t from-blue-500/20 to-transparent"></div>
               <!-- Chart Title -->
               <div class="absolute top-4 left-5 z-20 flex items-center gap-2">
                 <div class="p-1 rounded bg-blue-500/20 border border-blue-500/30">
                   <Activity class="w-3.5 h-3.5 text-[#00f3ff]" />
                 </div>
                 <span class="text-sm font-bold text-gray-200 tracking-tight drop-shadow-md">CDN 전용망 사용량</span>
               </div>
               <div class="flex-1 min-h-0">
                  <MultiLineCyberChart :labels="trafficLabels" :datasets="trafficDatasets" />
               </div>
            </div>
 


      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Video, Globe, Smartphone, Image, Activity } from 'lucide-vue-next'
import MultiLineCyberChart from '../common/MultiLineCyberChart.vue'

// Inline SimpleGauge for this view only (or could be extracted)
import { defineComponent, h, computed } from 'vue'

const SimpleGauge = defineComponent({
  props: { label: String, value: Number, color: String, ring: Boolean, size: String, index: String },
  setup(props) {
    const dash = computed(() => {
        // circumference: 2*pi*r
        // lg (r=22) -> c~138
        // xl (r=28) -> c~175
        let r = 18
        if (props.size === 'lg') r = 22
        if (props.size === 'xl') r = 28
        
        const c = 2 * Math.PI * r
        const val = props.value || 0
        const offset = c - (val / 100) * c
        return { array: c, offset, r }
    })

    const gaugeColor = computed(() => {
        const val = props.value || 0
        if (val > 80) return '#ef4444' // Red
        if (val >= 60) return '#f97316' // Orange
        return props.color || '#22c55e' // Default Green
    })
    
    // Size classes
    const containerClass = computed(() => {
        if (props.size === 'xl') return 'w-20 h-20'
        if (props.size === 'lg') return 'w-14 h-14'
        return 'w-10 h-10'
    })
    const viewBox = computed(() => {
        if (props.size === 'xl') return '0 0 70 70'
        if (props.size === 'lg') return '0 0 50 50'
        return '0 0 40 40'
    })
    const center = computed(() => {
        if (props.size === 'xl') return 35
        if (props.size === 'lg') return 25
        return 20
    })
    const strokeWidth = computed(() => {
        if (props.size === 'xl') return 7
        if (props.size === 'lg') return 5
        return 4
    })
    const fontSize = computed(() => {
        if (props.size === 'xl') return 'text-sm'
        if (props.size === 'lg') return 'text-xs'
        return 'text-[10px]'
    })

    return () => h('div', { class: `flex flex-col items-center gap-0 w-auto` }, [
      h('span', { class: 'text-xs font-black text-white/90 mb-0.5' }, props.index),
      h('div', { class: `relative ${containerClass.value} flex items-center justify-center` }, [
         h('svg', { viewBox: viewBox.value, class: 'w-full h-full transform -rotate-90' }, [
            h('circle', { cx: center.value, cy: center.value, r: dash.value.r, fill: 'none', stroke: '#334155', 'stroke-width': strokeWidth.value }),
            h('circle', { 
                cx: center.value, cy: center.value, r: dash.value.r, fill: 'none', stroke: gaugeColor.value, 'stroke-width': strokeWidth.value,
                'stroke-dasharray': dash.value.array, 'stroke-dashoffset': dash.value.offset,
                class: 'transition-all duration-500'
            })
         ]),
         h('span', { class: `absolute ${fontSize.value} font-bold text-white` }, props.label)
      ])
    ])
  }
})

const RegionalNode = defineComponent({
  props: { name: String, val: String, total: String, id: String, color: String, error: Boolean, warning: Boolean },
  setup(props) {
      // Mock random values for the 4 layers based on ID or random to make them look different
      const getDash = (r: number, val: number) => {
          const c = 2 * Math.PI * r
          const offset = c - (val / 100) * c
          return { array: c, offset }
      }
      
      // Vary values for the 4 layers to make them look different per instance
      const baseSeed = (props.name?.length || 0) * 7 + (parseInt(props.id || '0') * 13)
      let v1 = 35 + (baseSeed % 25)
      let v2 = 20 + (baseSeed % 35)
      let v3 = 25 + (baseSeed % 30)
      let v4 = 10 + (baseSeed % 20)

      // Specific request: 충북본부
      if (props.name === '충북본부') {
          v2 = 75 // CPU (60~80% Orange)
          if (props.error) {
              v1 = 92 // Outermost ring for '영상 제공' section (80%+ Red)
          }
      }

      const getStatusColor = (val: number, defaultColor: string) => {
          if (val > 80) return '#ef4444'
          if (val >= 60) return '#f97316'
          return defaultColor
      }

      return () => h('div', { class: 'flex flex-col items-center gap-2 w-28 group cursor-pointer' }, [
         h('div', { class: 'relative w-28 h-28 flex items-center justify-center' }, [
             // Outer decoration
             h('div', { class: `absolute inset-0 rounded-full border border-dashed ${props.error ? 'border-red-500/50 animate-spin-slow' : 'border-blue-500/10'}` }),
             
             // 4-Layer Charts
             h('svg', { viewBox: '0 0 100 100', class: 'w-full h-full transform -rotate-90' }, [
                // Background tracks
                h('circle', { cx: 50, cy: 50, r: 46, fill: 'none', stroke: '#1e293b', 'stroke-width': 6 }),
                h('circle', { cx: 50, cy: 50, r: 36, fill: 'none', stroke: '#1e293b', 'stroke-width': 6 }),
                h('circle', { cx: 50, cy: 50, r: 26, fill: 'none', stroke: '#1e293b', 'stroke-width': 6 }),
                h('circle', { cx: 50, cy: 50, r: 16, fill: 'none', stroke: '#1e293b', 'stroke-width': 6 }),

                // 1. Network (Outside)
                h('circle', { 
                    cx: 50, cy: 50, r: 46, fill: 'none', stroke: getStatusColor(v1, '#22c55e'), 'stroke-width': 6,
                    'stroke-dasharray': getDash(46, v1).array, 'stroke-dashoffset': getDash(46, v1).offset,
                    class: 'layer-net opacity-90'
                }),
                // 2. CPU
                h('circle', { 
                    cx: 50, cy: 50, r: 36, fill: 'none', stroke: getStatusColor(v2, '#4ade80'), 'stroke-width': 6,
                    'stroke-dasharray': getDash(36, v2).array, 'stroke-dashoffset': getDash(36, v2).offset,
                    class: 'layer-cpu opacity-90'
                }),
                // 3. MEM
                 h('circle', { 
                    cx: 50, cy: 50, r: 26, fill: 'none', stroke: getStatusColor(v3, '#86efac'), 'stroke-width': 6,
                    'stroke-dasharray': getDash(26, v3).array, 'stroke-dashoffset': getDash(26, v3).offset,
                    class: 'layer-mem opacity-90'
                }),
                // 4. DISK (Inside)
                h('circle', { 
                    cx: 50, cy: 50, r: 16, fill: 'none', stroke: getStatusColor(v4, '#bbf7d0'), 'stroke-width': 6,
                    'stroke-dasharray': getDash(16, v4).array, 'stroke-dashoffset': getDash(16, v4).offset,
                    class: 'layer-disk opacity-90'
                }),

                // Labels 1, 2, 3, 4 (From outside to inside)
                // Since SVG is rotated -90, to place labels at the visual top, we use original right (x=center+r, y=50)
                // But it's easier to place them at original top (x=50, y=50-r) and rotate them back 90 deg.
                h('text', { x: 50, y: 7, fill: '#fff', 'font-size': '9', 'font-weight': 'bold', 'text-anchor': 'middle', class: 'transform rotate-90 origin-center' }, '1'),
                h('text', { x: 50, y: 17, fill: '#fff', 'font-size': '9', 'font-weight': 'bold', 'text-anchor': 'middle', class: 'transform rotate-90 origin-center' }, '2'),
                h('text', { x: 50, y: 27, fill: '#fff', 'font-size': '9', 'font-weight': 'bold', 'text-anchor': 'middle', class: 'transform rotate-90 origin-center' }, '3'),
                h('text', { x: 50, y: 37, fill: '#fff', 'font-size': '9', 'font-weight': 'bold', 'text-anchor': 'middle', class: 'transform rotate-90 origin-center' }, '4'),
             ]),

             h('span', { class: 'absolute text-lg font-bold text-white z-10 drop-shadow-md' }, props.id)
         ]),
         h('div', { class: 'text-xs text-center leading-tight' }, [
            h('div', { class: `font-bold text-sm ${props.error ? 'text-red-400' : 'text-gray-300'}` }, props.name),
            h('div', { class: 'text-gray-400 text-sm mt-0.5 font-medium' }, `${props.val} / ${props.total}`)
         ])
      ])
  }
})




const CyberPipeFlow = defineComponent({
  props: { color: { type: String, default: '#00f3ff' } },
  setup(props) {
    const pipeId = Math.random().toString(36).substr(2, 9)
    return () => h('div', { class: 'relative w-full h-full flex items-center justify-center scale-110' }, [
      h('svg', { 
        viewBox: '0 0 100 85', 
        class: 'w-full h-auto overflow-visible drop-shadow-[0_0_15px_rgba(0,100,255,0.4)]',
        preserveAspectRatio: 'xMidYMid meet'
      }, [
        h('defs', [
          // Semi-Transparent Brushed Metal Gradient
          h('linearGradient', { id: `brushed-metal-${pipeId}`, x1: '0%', y1: '0%', x2: '0%', y2: '100%' }, [
            h('stop', { offset: '0%', 'stop-color': '#0f172a', 'stop-opacity': '0.8' }),
            h('stop', { offset: '30%', 'stop-color': '#475569', 'stop-opacity': '0.7' }),
            h('stop', { offset: '48%', 'stop-color': '#94a3b8', 'stop-opacity': '0.6' }),
            h('stop', { offset: '50%', 'stop-color': '#cbd5e1', 'stop-opacity': '0.5' }),
            h('stop', { offset: '52%', 'stop-color': '#94a3b8', 'stop-opacity': '0.6' }),
            h('stop', { offset: '70%', 'stop-color': '#475569', 'stop-opacity': '0.7' }),
            h('stop', { offset: '100%', 'stop-color': '#020617', 'stop-opacity': '0.8' })
          ]),
          // Neon Blue Frame Glow
          h('filter', { id: `neon-frame-glow-${pipeId}` }, [
            h('feGaussianBlur', { stdDeviation: '3', result: 'blur' }),
            h('feMerge', {}, [
              h('feMergeNode', { in: 'blur' }),
              h('feMergeNode', { in: 'SourceGraphic' })
            ])
          ]),
          // Cyan Chevron Glow
          h('filter', { id: `chevron-glow-${pipeId}` }, [
            h('feGaussianBlur', { stdDeviation: '2', result: 'blur' }),
            h('feMerge', {}, [
              h('feMergeNode', { in: 'blur' }),
              h('feMergeNode', { in: 'SourceGraphic' })
            ])
          ])
        ]),

        // 1. Outer Neon Blue Frames (Top/Bottom) - Responsive for Narrower Pipe
        [
          { d: 'M 5,5 Q 50,10 95,5' },
          { d: 'M 5,75 Q 50,70 95,75' }
        ].map((frame, idx) => h('path', {
          key: idx,
          d: frame.d,
          fill: 'none',
          stroke: '#2563eb',
          'stroke-width': '3.5',
          'stroke-linecap': 'round',
          filter: `url(#neon-frame-glow-${pipeId})`,
          opacity: 0.9
        })),

        // 2. Heavy Industrial Double Flanges - Adjusted for narrower pipe
        [
          { x: 5, label: 'L' },
          { x: 75, label: 'R' }
        ].map(flangeSet => h('g', { key: flangeSet.label }, [
          h('rect', { x: flangeSet.x, y: 10, width: 9, height: 60, rx: 1.5, fill: `url(#brushed-metal-${pipeId})`, stroke: 'rgba(255,255,255,0.1)', 'stroke-width': '0.5', opacity: 0.85 }),
          h('rect', { x: flangeSet.x + 11, y: 10, width: 9, height: 60, rx: 1.5, fill: `url(#brushed-metal-${pipeId})`, stroke: 'rgba(255,255,255,0.1)', 'stroke-width': '0.5', opacity: 0.85 }),
          // Bolts
          [18, 28, 40, 52, 62].map(by => [
             h('circle', { cx: flangeSet.x + 4.5, cy: by, r: 1.8, fill: '#64748b', opacity: 0.3 }),
             h('circle', { cx: flangeSet.x + 15.5, cy: by, r: 1.8, fill: '#64748b', opacity: 0.3 })
          ])
        ])),

        // 3. Main Pipe Body (Narrower and Semi-Transparent)
        h('rect', { 
          x: 23, y: 18, width: 54, height: 44, 
          fill: `url(#brushed-metal-${pipeId})`, 
          opacity: 0.7,
          stroke: 'rgba(255,255,255,0.1)',
          'stroke-width': '0.5'
        }),

        // 4. Center Neon Triangle Flow (>>>) - Narrower Spacing
        [0, 1, 2].map(i => h('path', {
          key: i,
          d: 'M 0,0 L 9,11 L 0,22 Z',
          fill: props.color,
          stroke: props.color,
          'stroke-width': '1',
          'stroke-linejoin': 'round',
          'stroke-linecap': 'round',
          filter: `url(#chevron-glow-${pipeId})`,
          class: 'animate-liquid-pulse',
          style: { 
            animationDelay: `${i * 0.4}s`,
            transform: `translate(${32 + i * 11}px, 29px)`
          }
        })),

        // 5. Crystalline Surface Highlights
        h('rect', { x: 23, y: 20, width: 94, height: 2, fill: '#fff', opacity: 0.15 }),
        h('rect', { x: 23, y: 58, width: 94, height: 1.5, fill: '#fff', opacity: 0.1 })
      ])
    ])
  }
})

const trafficLabels = ref(['14:00', '14:10', '14:20', '14:30', '14:40', '14:50', '15:00'])
const trafficDatasets = ref([
    { label: '교통센터', data: [3.2, 4.5, 2.8, 7.1, 6.2, 8.5, 5.4], color: '#22d3ee' },
    { label: '본사', data: [2.1, 3.8, 1.9, 5.0, 4.3, 6.7, 3.2], color: '#a855f7' }
])
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



/* .integration-item removed in favor of inline classes */

.animate-spin-slow {
  animation: spin 8s linear infinite;
}

@keyframes liquid-pulse {
  0% { transform: translateX(-15px); opacity: 0; }
  15% { opacity: 1; }
  85% { opacity: 1; }
  100% { transform: translateX(40px); opacity: 0; }
}

.animate-liquid-pulse {
  animation: liquid-pulse 2.1s linear infinite;
}

@keyframes pulse-slow {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 0.4; }
}

.animate-pulse-slow {
  animation: pulse-slow 3s ease-in-out infinite;
}

.cyber-fancy-panel {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: panel-glow-pulse 6s ease-in-out infinite alternate;
  /* Multi-layered gradient for 3D depth */
  background: 
    linear-gradient(180deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0) 100%),
    radial-gradient(circle at 50% -20%, rgba(0, 243, 255, 0.15) 0%, transparent 70%),
    rgba(13, 20, 36, 0.95);
  backdrop-filter: blur(12px);
  position: relative;
  z-index: 1;
}

/* Inner border glow for 3D feel */
.cyber-fancy-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg, rgba(0, 243, 255, 0.4), transparent 40%, transparent 60%, rgba(0, 243, 255, 0.2));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

@keyframes panel-glow-pulse {
  0% { border-color: rgba(0, 243, 255, 0.2); box-shadow: inset 0 0 15px rgba(0, 243, 255, 0.05); }
  100% { border-color: rgba(0, 243, 255, 0.4); box-shadow: inset 0 0 25px rgba(0, 243, 255, 0.1); }
}

.cyber-fancy-panel:hover {
  border-color: rgba(0, 243, 255, 0.8);
  box-shadow: 
    inset 0 0 50px rgba(0, 243, 255, 0.15),
    0 0 30px rgba(0, 243, 255, 0.2);
  background: 
    linear-gradient(180deg, rgba(40, 55, 80, 0.6) 0%, rgba(15, 23, 42, 0) 100%),
    radial-gradient(circle at 50% -20%, rgba(0, 243, 255, 0.25) 0%, transparent 70%),
    rgba(13, 20, 36, 0.95);
  transform: translateY(-2px);
}

.neon-title-wrapper {
  background: linear-gradient(90deg, rgba(37, 99, 235, 0) 0%, rgba(37, 99, 235, 0.8) 20%, rgba(0, 243, 255, 0.8) 50%, rgba(37, 99, 235, 0.8) 80%, rgba(37, 99, 235, 0) 100%);
  padding: 8px 40px;
  border-radius: 8px;
  border: 1px solid rgba(0, 243, 255, 0.5);
  box-shadow: 0 0 15px rgba(0, 243, 255, 0.4), inset 0 0 10px rgba(0, 243, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.neon-title-text {
  color: #fff;
  font-weight: 900;
  font-size: 1.25rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-shadow: 0 0 10px rgba(0, 243, 255, 0.8), 0 0 20px rgba(0, 243, 255, 0.5);
}

.corner-acc {
  position: absolute;
  width: 15px;
  height: 15px;
  border-color: #00f3ff;
  border-style: solid;
  pointer-events: none;
  opacity: 0.8;
  filter: drop-shadow(0 0 5px #00f3ff);
}

.tl { top: -2px; left: -2px; border-width: 4px 0 0 4px; border-top-left-radius: 4px; }
.tr { top: -2px; right: -2px; border-width: 4px 4px 0 0; border-top-right-radius: 4px; }
.bl { bottom: -2px; left: -2px; border-width: 0 0 4px 4px; border-bottom-left-radius: 4px; }
.br { bottom: -2px; right: -2px; border-width: 0 4px 4px 0; border-bottom-right-radius: 4px; }

@keyframes heavy-flicker {
  0%, 100% { opacity: 1; filter: brightness(1); }
  33% { opacity: 0.8; filter: brightness(0.8); }
  35% { opacity: 0.9; filter: brightness(1.2); }
  66% { opacity: 1; filter: brightness(1); }
  68% { opacity: 0.7; filter: brightness(0.7); }
  70% { opacity: 1; filter: brightness(1.5); }
}

.animate-flicker-heavy {
  animation: heavy-flicker 4s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
