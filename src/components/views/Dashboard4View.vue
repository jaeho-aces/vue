<template>
  <div class="cyber-dashboard relative w-full h-screen overflow-hidden p-1 flex flex-col gap-1 bg-[#0b1121] text-white">
    <!-- Background grid and scanning effects -->
    <div class="grid-overlay"></div>
    <div class="hexagon-overlay"></div>

    <!-- Top Navigation / Header -->
    <div class="flex items-center justify-center relative h-[64px] shrink-0 border-b border-[#00f3ff]/20 bg-[#0f172a]/80 backdrop-blur-sm z-20">
      <div class="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
        <img src="/ci.svg" alt="CI" class="h-8 w-auto drop-shadow-[0_0_5px_rgba(0,243,255,0.8)]" />
        <span class="text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] to-[#fff]">종합상황판</span>
      </div>
      <!-- Center Title Decoration -->
      <div class="h-1 w-1/3 bg-gradient-to-r from-transparent via-[#00f3ff] to-transparent absolute bottom-0"></div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 flex gap-1 min-h-0 z-10 w-full relative">
      
      <!-- Left Column: Site Labels & Arrow -->
      <div class="w-16 flex flex-col items-center justify-between py-4 bg-[#1e293b]/40 border-r border-[#00f3ff]/20">
          <div class="flex-1 w-full flex items-center justify-center relative group">
             <div class="absolute inset-x-1 top-4 bottom-4 bg-gradient-to-b from-blue-500/10 to-transparent rounded border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors"></div>
             <span class="vertical-text text-lg font-bold text-blue-300 tracking-widest z-10 drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]">교통관제센터</span>
          </div>
         
         <div class="h-16 flex items-center justify-center relative z-20">
            <ArrowUpDown class="w-10 h-10 text-yellow-400 animate-pulse drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]" />
         </div>

          <div class="flex-1 w-full flex items-center justify-center relative group">
            <div class="absolute inset-x-1 top-4 bottom-4 bg-gradient-to-t from-blue-500/10 to-transparent rounded border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors"></div>
            <span class="vertical-text text-lg font-bold text-blue-300 tracking-widest z-10 drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]">본사</span>
         </div>
      </div>

      <!-- Center Columns: Conversion & Provision Grid -->
      <div class="flex-[3] grid grid-cols-[1fr_auto_1fr] grid-rows-2 gap-x-1 gap-y-4 p-2 relative">
          
          <!-- Shared Header Labels (Pseudo) -->



          <!-- 1. Top Left: Traffic Center Conversion -->
          <div class="flex flex-col h-full gap-2">
              <!-- Section Title -->
               <div class="w-full flex justify-center z-30 mb-1">
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
                    <SimpleGauge label="CPU" :value="65" color="#a855f7" size="xl" />
                    <SimpleGauge label="5G" :value="80" color="#f97316" ring size="xl" />
                    <SimpleGauge label="MEM" :value="45" color="#22c55e" size="xl" />
                    <SimpleGauge label="DISK" :value="30" color="#06b6d4" size="xl" />
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
             <div class="w-12 h-16 flex items-center justify-center relative">
               <div class="absolute inset-0 flex items-center justify-center">
                  <PentaChevronsRight class="w-16 h-16 text-[#00f3ff] animate-pulse opacity-80" />
               </div>
             </div>
          </div>

          <!-- 2. Top Right: Traffic Center Provision -->
          <div class="flex flex-col h-full gap-2">
              <!-- Section Title -->
               <div class="w-full flex justify-center z-30 mb-1">
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
                    <SimpleGauge label="CPU" :value="55" color="#a855f7" size="xl" />
                    <SimpleGauge label="7G" :value="40" color="#f97316" ring size="xl" />
                    <SimpleGauge label="MEM" :value="60" color="#22c55e" size="xl" />
                    <SimpleGauge label="DISK" :value="20" color="#06b6d4" size="xl" />
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
                    <SimpleGauge label="CPU" :value="45" color="#a855f7" size="xl" />
                    <SimpleGauge label="3G" :value="60" color="#f97316" ring size="xl" />
                    <SimpleGauge label="MEM" :value="50" color="#22c55e" size="xl" />
                    <SimpleGauge label="DISK" :value="35" color="#10b981" size="xl" />
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
          <div class="flex items-center justify-center -translate-y-12">
             <div class="w-12 h-16 flex items-center justify-center relative">
               <div class="absolute inset-0 flex items-center justify-center">
                  <PentaChevronsRight class="w-16 h-16 text-[#00f3ff] animate-pulse opacity-80" />
               </div>
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
                    <SimpleGauge label="CPU" :value="40" color="#a855f7" size="xl" />
                    <SimpleGauge label="5G" :value="30" color="#f97316" ring size="xl" />
                    <SimpleGauge label="MEM" :value="55" color="#22c55e" size="xl" />
                    <SimpleGauge label="DISK" :value="25" color="#06b6d4" size="xl" />
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
      <div class="flex flex-col gap-y-4 py-2 justify-around">
          <!-- Top Arrow -->
          <div class="flex items-center justify-center">
             <div class="w-12 h-16 flex items-center justify-center relative">
               <div class="absolute inset-0 flex items-center justify-center">
                  <PentaChevronsRight class="w-16 h-16 text-[#00f3ff] animate-pulse opacity-80" />
               </div>
             </div>
          </div>
          <!-- Bottom Arrow -->
          <div class="flex items-center justify-center -translate-y-12">
             <div class="w-12 h-16 flex items-center justify-center relative">
               <div class="absolute inset-0 flex items-center justify-center">
                  <PentaChevronsRight class="w-16 h-16 text-red-500 animate-pulse opacity-80" />
               </div>
             </div>
          </div>
      </div>

      <!-- Right Column: Integration & Connections -->
      <div class="w-[480px] flex flex-col gap-2 p-2 bg-[#1e293b]/20 border-l border-[#00f3ff]/20 relative">
          
          <!-- Section Title for Integration -->
          <div class="w-full flex justify-center z-30 mb-1">
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
             
             <div class="flex-1 grid grid-cols-2 gap-4 place-content-center w-full relative">
                <!-- Connect Dotted Lines (From left/provision to here) - Simulated with absolute positioned SVG on parent or simpler here -->
                
                <div class="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 border border-white/5 w-full h-32 transition-all duration-300 hover:bg-white/10 hover:scale-105 hover:border-blue-400/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] group">
                   <Video class="w-14 h-14 text-orange-400 mb-1 drop-shadow-[0_0_10px_rgba(251,146,60,0.8)]" />
                   <div class="text-base text-center text-gray-200 font-bold">국토부</div>
                   <div class="text-sm text-gray-400">6970 / 9000</div>
                </div>

                <div class="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 border border-white/5 w-full h-32 transition-all duration-300 hover:bg-white/10 hover:scale-105 hover:border-blue-400/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] group">
                   <Globe class="w-14 h-14 text-blue-400 mb-1 animate-pulse drop-shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
                   <div class="text-base text-center text-gray-200 font-bold">CDN</div>
                   <div class="text-sm text-gray-400">6970 / 9000</div>
                </div>

                <div class="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 border border-white/5 w-full h-32 transition-all duration-300 hover:bg-white/10 hover:scale-105 hover:border-blue-400/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] group">
                   <Smartphone class="w-14 h-14 text-green-400 mb-1 drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
                   <div class="text-base text-center text-gray-200 font-bold">교통정보 앱</div>
                </div>

                <div class="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 border border-white/5 w-40 h-32 transition-all duration-300 hover:bg-white/10 hover:scale-105 hover:border-blue-400/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] group">
                   <Image class="w-14 h-14 text-green-400 mb-1 drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
                   <div class="text-base text-center text-gray-200 font-bold">정지영상</div>
                </div>
             </div>
          </div>

          <!-- Bottom Chart (Overlay) -->
           <div class="cyber-fancy-panel h-80 border border-[#00f3ff]/30 rounded-lg p-1 relative overflow-hidden backdrop-blur-sm shadow-[inset_0_0_30px_rgba(0,243,255,0.05)]">
              <!-- Corner Accents -->
              <div class="corner-acc tl"></div>
              <div class="corner-acc tr"></div>
              <div class="corner-acc bl"></div>
              <div class="corner-acc br"></div>
              <div class="absolute inset-0 opacity-20 bg-gradient-to-t from-blue-500/20 to-transparent"></div>
              <MultiLineCyberChart :labels="trafficLabels" :datasets="trafficDatasets" />
           </div>
 


      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ArrowUpDown, Video, Globe, Smartphone, Image } from 'lucide-vue-next'
import MultiLineCyberChart from '../common/MultiLineCyberChart.vue'

// Inline SimpleGauge for this view only (or could be extracted)
import { defineComponent, h, computed } from 'vue'

const SimpleGauge = defineComponent({
  props: { label: String, value: Number, color: String, ring: Boolean, size: String },
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

    return () => h('div', { class: `flex flex-col items-center gap-1 w-auto` }, [
      h('div', { class: `relative ${containerClass.value} flex items-center justify-center` }, [
         h('svg', { viewBox: viewBox.value, class: 'w-full h-full transform -rotate-90' }, [
            h('circle', { cx: center.value, cy: center.value, r: dash.value.r, fill: 'none', stroke: '#334155', 'stroke-width': strokeWidth.value }),
            h('circle', { 
                cx: center.value, cy: center.value, r: dash.value.r, fill: 'none', stroke: props.color, 'stroke-width': strokeWidth.value,
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

                // 1. Network (Outside) - Orange (5G)
                h('circle', { 
                    cx: 50, cy: 50, r: 46, fill: 'none', stroke: '#f97316', 'stroke-width': 6,
                    'stroke-dasharray': getDash(46, 75).array, 'stroke-dashoffset': getDash(46, 75).offset,
                    class: 'layer-net opacity-80'
                }),
                // 2. CPU - Purple
                h('circle', { 
                    cx: 50, cy: 50, r: 36, fill: 'none', stroke: '#a855f7', 'stroke-width': 6,
                    'stroke-dasharray': getDash(36, 60).array, 'stroke-dashoffset': getDash(36, 60).offset,
                    class: 'layer-cpu opacity-80'
                }),
                // 3. MEM - Green
                 h('circle', { 
                    cx: 50, cy: 50, r: 26, fill: 'none', stroke: '#22c55e', 'stroke-width': 6,
                    'stroke-dasharray': getDash(26, 45).array, 'stroke-dashoffset': getDash(26, 45).offset,
                    class: 'layer-mem opacity-80'
                }),
                // 4. DISK (Inside) - Cyan (as requested previously) or Orange? Let's use Orange/Yellow to contrast or keep Cyan if user liked it. 
                // User said "DISK chart color to Cyan" previously. I will use #06b6d4.
                h('circle', { 
                    cx: 50, cy: 50, r: 16, fill: 'none', stroke: '#06b6d4', 'stroke-width': 6,
                    'stroke-dasharray': getDash(16, 30).array, 'stroke-dashoffset': getDash(16, 30).offset,
                    class: 'layer-disk opacity-80'
                }),
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


const PentaChevronsRight = defineComponent({
  props: { class: String },
  setup(props) {
    return () => h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '32',
      height: '24',
      viewBox: '0 0 32 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      class: props.class
    }, [
      h('path', { d: 'm2 17 5-5-5-5' }),
      h('path', { d: 'm8 17 5-5-5-5' }),
      h('path', { d: 'm14 17 5-5-5-5' }),
      h('path', { d: 'm20 17 5-5-5-5' }),
      h('path', { d: 'm26 17 5-5-5-5' })
    ])
  }
})

const trafficLabels = ref(['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00'])
const trafficDatasets = ref([
    { label: 'Inbound', data: [300, 450, 200, 700, 600, 850, 500, 900, 750, 400], color: '#22d3ee' },
    { label: 'Outbound', data: [200, 350, 150, 500, 400, 650, 300, 700, 550, 300], color: '#a855f7' }
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

.clip-arrow {
  clip-path: polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%);
}

/* .integration-item removed in favor of inline classes */

.animate-spin-slow {
  animation: spin 8s linear infinite;
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
  padding: 6px 40px;
  border-radius: 9999px;
  border: 1px solid rgba(0, 243, 255, 0.5);
  box-shadow: 0 0 15px rgba(0, 243, 255, 0.4), inset 0 0 10px rgba(0, 243, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
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

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
