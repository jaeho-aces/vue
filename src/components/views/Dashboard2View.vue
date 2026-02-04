<template>
  <div class="cyber-dashboard">
    <!-- Background grid and scanning effects -->
    <div class="grid-overlay"></div>
    <div class="hexagon-overlay"></div>

    <!-- Top Navigation / Header -->
    <div class="dashboard-header">
      <div class="header-main-title flex items-center gap-4">
        <img src="/ci.svg" alt="CI" class="dashboard-logo" />
        <span class="title-text">CCTV 영상 인터넷 제공 시스템 대시보드</span>
      </div>
    </div>

    <div class="main-layout">
      <!-- Top Section -->
      <div class="top-row">
        <!-- Site 1 Panel -->
        <div class="cyber-panel main-panel site-left">
          <div class="panel-cap blue-bg-cap">
            <span class="panel-name">교통센터</span>
          </div>
          <div class="panel-content">
            <!-- CCTV Column -->
            <div class="side-column">
              <span class="col-title">CCTV</span>
              <div class="gauge-stack">
                <div class="cctv-item">
                  <div class="mini-chart cyan">
                    <div class="mini-inner">
                      <span class="v1">45</span><span class="v-alt">/2</span>
                    </div>
                    <svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" class="bg"/><circle cx="20" cy="20" r="18" class="progress" style="stroke-dasharray: 80 113;"/></svg>
                  </div>
                  <span class="mini-label">도로공사</span>
                </div>
                <div class="cctv-item">
                  <div class="mini-chart cyan">
                    <div class="mini-inner">
                      <span class="v1">38</span><span class="v-alt">/1</span>
                    </div>
                    <svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" class="bg"/><circle cx="20" cy="20" r="18" class="progress" style="stroke-dasharray: 70 113;"/></svg>
                  </div>
                  <span class="mini-label">수탁</span>
                </div>
                <div class="cctv-item">
                  <div class="mini-chart cyan">
                    <div class="mini-inner">
                      <span class="v1">52</span><span class="v-alt">/3</span>
                    </div>
                    <svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" class="bg"/><circle cx="20" cy="20" r="18" class="progress" style="stroke-dasharray: 90 113;"/></svg>
                  </div>
                  <span class="mini-label">비수탁</span>
                </div>
              </div>
            </div>
 
            <!-- Flow Connector: CCTV to Conversion (Absolute Overlay Expanded) -->
            <div class="flow-connector to-right">
              <svg viewBox="0 -50 250 460" class="connector-svg">
                <path d="M0,65 C200,65 200,230 400,230" class="flow-line-bg"/>
                <path d="M0,230 L400,230" class="flow-line-bg"/>
                <path d="M0,395 C200,395 200,230 400,230" class="flow-line-bg"/>
                
                <path d="M0,65 C200,65 200,230 400,230" class="flow-line-active"/>
                <path d="M0,230 L400,230" class="flow-line-active"/>
                <path d="M0,395 C200,395 200,230 400,230" class="flow-line-active"/>
              </svg>
            </div>

            <!-- Main Status Area -->
            <div class="center-area site1-theme">
              <div class="service-row active-mode">
                <div class="mode-tag">ACTIVE</div>
                <div class="service-icons">
                  <div class="s-icon active"><Monitor class="i-green"/><span class="t">WEB</span></div>
                  <div class="s-icon active"><Server class="i-green"/><span class="t">WAS</span></div>
                  <div class="s-icon active"><Database class="i-green"/><span class="t">DB</span></div>
                </div>
              </div>

              <div class="gauge-pair">
                <div class="big-gauge instrument-green">
                  <div class="g-wrap car-cluster">
                    <div class="glass-reflection"></div>
                    <svg viewBox="0 0 100 100" class="gauge-svg instrument-svg">
                      <defs>
                        <linearGradient id="greenNeedle" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" style="stop-color:#00ffcc;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#00aa88;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                      <g class="notches">
                        <line v-for="n in 21" :key="n" x1="50" y1="10" x2="50" y2="15" 
                              :transform="`rotate(${((n-1) * 13.5) - 135}, 50, 50)`" 
                              class="tick" :class="{ major: (n-1) % 5 === 0 }"/>
                      </g>
                      <circle cx="50" cy="50" r="40" class="dial-bg"/>
                      <circle cx="50" cy="50" r="40" class="dial-needle" stroke="url(#greenNeedle)" 
                              style="stroke-dasharray: 140 251; stroke-dashoffset: 0;"/>
                    </svg>
                    <div class="g-text">
                      <span class="v-main">8</span>
                      <div class="instrument-status-grid">
                        <div class="stat-item standby"><span class="s-val">2</span></div>
                        <div class="stat-item error"><span class="s-val">0</span></div>
                      </div>
                    </div>
                  </div>
                  <span class="g-label">변환/분배</span>
                </div>

                <!-- Mid-Flow: Conversion to Media -->
                <div class="flow-connector mid-connector to-right">
                  <svg viewBox="0 -20 200 100" class="connector-svg">
                    <path d="M0,50 L200,50" class="flow-line-bg"/>
                    <path d="M0,50 L200,50" class="flow-line-active"/>
                  </svg>
                </div>

                <div class="big-gauge instrument-green">
                  <div class="g-wrap car-cluster">
                    <div class="glass-reflection"></div>
                    <svg viewBox="0 0 100 100" class="gauge-svg instrument-svg">
                      <g class="notches">
                        <line v-for="n in 21" :key="n" x1="50" y1="10" x2="50" y2="15" 
                              :transform="`rotate(${((n-1) * 13.5) - 135}, 50, 50)`" 
                              class="tick" :class="{ major: (n-1) % 5 === 0 }"/>
                      </g>
                      <circle cx="50" cy="50" r="40" class="dial-bg"/>
                      <circle cx="50" cy="50" r="40" class="dial-needle" stroke="url(#greenNeedle)" 
                              style="stroke-dasharray: 180 251; stroke-dashoffset: 0;"/>
                    </svg>
                    <div class="g-text">
                      <span class="v-main">12</span>
                      <div class="instrument-status-grid">
                        <div class="stat-item standby"><span class="s-val">5</span></div>
                        <div class="stat-item error"><span class="s-val">1</span></div>
                      </div>
                    </div>
                  </div>
                  <span class="g-label">미디어</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- CDN Middle Box -->
        <div class="cdn-spacer">
          <!-- Flow: Site 1 Media to CDN -->
          <div class="cdn-flow-connector from-left">
            <svg viewBox="0 -80 200 100" class="connector-svg">
              <path d="M0,50 L200,50" class="flow-line-bg"/>
              <path d="M0,50 L200,50" class="flow-line-active"/>
            </svg>
          </div>

          <!-- Flow: Site 2 Media to CDN -->
          <div class="cdn-flow-connector from-right">
            <svg viewBox="0 -80 200 100" class="connector-svg">
              <path d="M200,50 L0,50" class="flow-line-bg"/>
              <path d="M200,50 L0,50" class="flow-line-active"/>
            </svg>
          </div>

          <div class="cdn-node-box">
            <Globe class="cdn-icon" />
            <span class="cdn-name">CDN</span>
          </div>
        </div>

        <!-- Gangwon Panel -->
        <div class="cyber-panel main-panel site-right">
          <div class="panel-cap blue-bg-cap">
            <span class="panel-name">김천본사</span>
          </div>
          <div class="panel-content">
            <!-- Main Status Area -->
            <div class="center-area gangwon-theme">
              <div class="service-row standby-mode">
                <div class="mode-tag">STANDBY</div>
                <div class="service-icons">
                  <div class="s-icon active"><Monitor class="i-yellow"/><span class="t">Web</span></div>
                  <div class="s-icon active"><Server class="i-yellow"/><span class="t">WAS</span></div>
                  <div class="s-icon active"><Database class="i-yellow"/><span class="t">DB</span></div>
                </div>
              </div>

              <div class="gauge-pair">
                <div class="big-gauge instrument-green">
                  <div class="g-wrap car-cluster">
                    <div class="glass-reflection"></div>
                    <svg viewBox="0 0 100 100" class="gauge-svg instrument-svg">
                      <g class="notches">
                        <line v-for="n in 21" :key="n" x1="50" y1="10" x2="50" y2="15" 
                              :transform="`rotate(${((n-1) * 13.5) - 135}, 50, 50)`" 
                              class="tick" :class="{ major: (n-1) % 5 === 0 }"/>
                      </g>
                      <circle cx="50" cy="50" r="40" class="dial-bg"/>
                      <circle cx="50" cy="50" r="40" class="dial-needle" stroke="url(#greenNeedle)" 
                              style="stroke-dasharray: 160 251; stroke-dashoffset: 0;"/>
                    </svg>
                    <div class="g-text">
                      <span class="v-main">10</span>
                      <div class="instrument-status-grid">
                        <div class="stat-item standby"><span class="s-val">2</span></div>
                        <div class="stat-item error"><span class="s-val">1</span></div>
                      </div>
                    </div>
                  </div>
                  <span class="g-label">미디어</span>
                </div>

                <!-- Mid-Flow: Conversion to Media -->
                <div class="flow-connector mid-connector to-left">
                  <svg viewBox="0 -20 200 100" class="connector-svg">
                    <path d="M200,50 L0,50" class="flow-line-bg"/>
                    <path d="M200,50 L0,50" class="flow-line-active"/>
                  </svg>
                </div>

                <div class="big-gauge instrument-green">
                  <div class="g-wrap car-cluster">
                    <div class="glass-reflection"></div>
                    <svg viewBox="0 0 100 100" class="gauge-svg instrument-svg">
                      <g class="notches">
                        <line v-for="n in 21" :key="n" x1="50" y1="10" x2="50" y2="15" 
                              :transform="`rotate(${((n-1) * 13.5) - 135}, 50, 50)`" 
                              class="tick" :class="{ major: (n-1) % 5 === 0 }"/>
                      </g>
                      <circle cx="50" cy="50" r="40" class="dial-bg"/>
                      <circle cx="50" cy="50" r="40" class="dial-needle" stroke="url(#greenNeedle)" 
                              style="stroke-dasharray: 130 251; stroke-dashoffset: 0;"/>
                    </svg>
                    <div class="g-text">
                      <span class="v-main">7</span>
                      <div class="instrument-status-grid">
                        <div class="stat-item standby"><span class="s-val">1</span></div>
                        <div class="stat-item error"><span class="s-val">0</span></div>
                      </div>
                    </div>
                  </div>
                  <span class="g-label">변환/분배</span>
                </div>
              </div>
            </div>

            <!-- Flow Connector: CCTV to Conversion (Absolute Overlay Expanded) -->
            <div class="flow-connector to-left">
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
            <div class="side-column">
              <span class="col-title">CCTV</span>
              <div class="gauge-stack">
                <div class="cctv-item">
                  <div class="mini-chart cyan">
                    <div class="mini-inner">
                      <span class="v1">48</span><span class="v-alt">/1</span>
                    </div>
                    <svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" class="bg"/><circle cx="20" cy="20" r="18" class="progress" style="stroke-dasharray: 85 113;"/></svg>
                  </div>
                  <span class="mini-label">도로공사</span>
                </div>
                <div class="cctv-item">
                  <div class="mini-chart cyan">
                    <div class="mini-inner">
                      <span class="v1">40</span><span class="v-alt">/2</span>
                    </div>
                    <svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" class="bg"/><circle cx="20" cy="20" r="18" class="progress" style="stroke-dasharray: 75 113;"/></svg>
                  </div>
                  <span class="mini-label">수탁</span>
                </div>
                <div class="cctv-item">
                  <div class="mini-chart cyan">
                    <div class="mini-inner">
                      <span class="v1">50</span><span class="v-alt">/2</span>
                    </div>
                    <svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" class="bg"/><circle cx="20" cy="20" r="18" class="progress" style="stroke-dasharray: 88 113;"/></svg>
                  </div>
                  <span class="mini-label">비수탁</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Section -->
      <div class="bottom-row">
        <!-- CCTV HQ List -->
        <div class="cyber-panel list-panel cctv-glow">
          <div class="panel-cap centered blue-bg-cap">
            <span class="panel-name">본부별 CCTV 현황</span>
          </div>
          <div class="panel-cap centered no-border">
            <div class="hq-tabs-container">
              <button 
                v-for="hq in hqs" 
                :key="hq.id"
                class="tab-btn"
                :class="{ active: activeHQ === hq.id }"
                @click="activeHQ = hq.id"
              >
                {{ hq.name }}
              </button>
            </div>
          </div>
          <div class="list-container scrolling">
            <div 
              v-for="branch in currentBranches" 
              :key="branch.name"
              class="hq-item"
            >
              <div class="hq-left"><MapPin class="pin-icon"/> {{ branch.name }}</div>
              <div class="hq-right">
                <span class="green">{{ branch.ok }}</span> / <span class="red">{{ branch.err }}</span> 
              </div>
            </div>
          </div>
        </div>

        <!-- Traffic Chart 1: Traffic Center -->
        <div class="cyber-panel list-panel traffic-glow">
          <div class="panel-cap centered blue-bg-cap"><span class="panel-name">교통센터 네트워크 트래픽</span></div>
          <div class="traffic-content">
            <div class="traffic-entry">
              <div class="t-meta"><span>네트워크 트래픽 (Mbps)</span><span class="peak cyan">1,200 <small>peak</small></span></div>
              <div class="chart-box"><CyberChart :data="traffic1" color="#00f3ff" label="네트워크 트래픽"/></div>
            </div>
            <div class="traffic-entry">
              <div class="t-meta"><span>실시간 접속자 (명)</span><span class="peak magenta">350 <small>active</small></span></div>
              <div class="chart-box"><CyberChart :data="users1" color="#ff00ff" label="실시간 접속자"/></div>
            </div>
          </div>
        </div>

        <!-- Traffic Chart 2: Kimcheon HQ -->
        <div class="cyber-panel list-panel traffic-glow">
          <div class="panel-cap centered blue-bg-cap"><span class="panel-name">김천본사 네트워크 트래픽</span></div>
          <div class="traffic-content">
            <div class="traffic-entry">
              <div class="t-meta"><span>네트워크 트래픽 (Mbps)</span><span class="peak cyan">1,300 <small>peak</small></span></div>
              <div class="chart-box"><CyberChart :data="traffic2" color="#00f3ff" label="네트워크 트래픽"/></div>
            </div>
            <div class="traffic-entry">
              <div class="t-meta"><span>실시간 접속자 (명)</span><span class="peak magenta">250 <small>active</small></span></div>
              <div class="chart-box"><CyberChart :data="users2" color="#ff00ff" label="실시간 접속자"/></div>
            </div>
          </div>
        </div>

        <!-- Alarms -->
        <div class="cyber-panel list-panel alarm-glow">
          <div class="panel-cap centered blue-bg-cap"><span class="panel-name">알람이력</span></div>
          <div class="list-container scrolling">
            <div 
              v-for="(alarm, idx) in alarmHistory" 
              :key="idx"
              class="alarm-box" 
              :class="alarm.level"
            >
              <div class="a-header">{{ alarm.time }} <span class="tag">{{ alarm.tag }}</span></div>
              <div class="a-content">{{ alarm.msg }}</div>
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

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Rajdhani:wght@400;600;700&display=swap');

.cyber-dashboard {
  position: relative;
  width: 100%;
  height: 100vh;
  background: radial-gradient(circle at 50% 50%, #0d0d1a 0%, #04040a 100%);
  color: #e0faff;
  font-family: 'Rajdhani', sans-serif;
  overflow: hidden;
  padding: 15px;
  display: flex;
  flex-direction: column;
}


.grid-overlay {
  position: absolute; inset: 0;
  background-image: 
    linear-gradient(rgba(0, 243, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 243, 255, 0.05) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
}

.hexagon-overlay {
  position: absolute; inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cpath fill='%2300f3ff' fill-opacity='0.03' d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5z'/%3E%3C/svg%3E");
  background-size: 56px 98px;
  opacity: 0.5;
  pointer-events: none;
}

/* Header */
.dashboard-header {
  margin-bottom: 15px;
  z-index: 10;
}
.header-main-title {
  display: inline-flex;
  align-items: center;
  padding: 5px 30px 5px 20px;
  background: rgba(0, 30, 80, 0.6);
  border-left: 4px solid #00f3ff;
  border-bottom: 1px solid rgba(0, 150, 255, 0.4);
  clip-path: polygon(0 0, 95% 0, 100% 100%, 0% 100%);
  gap: 15px;
}

.dashboard-logo {
  height: 24px;
  width: auto;
  filter: drop-shadow(0 0 5px rgba(0, 243, 255, 0.5));
}
.title-text {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.1rem;
  letter-spacing: 2px;
  color: #fff;
  text-shadow: 0 0 10px #00f3ff;
}

/* Base Layout */
.main-layout {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
  z-index: 5;
}

.top-row {
  height: 48%;
  display: flex;
  align-items: center;
  gap: 10px;
}

.bottom-row {
  flex: 1;
  display: flex;
  gap: 15px;
}

/* Panel Design */
.cyber-panel {
  background: rgba(16, 20, 32, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 243, 255, 0.2);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}
.cyber-panel::before {
  content: ''; position: absolute; top:0; left:0; right:0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 243, 255, 0.8), transparent);
}

.main-panel { flex: 1; height: 100%; }
.site-left { box-shadow: 0 0 20px rgba(0, 243, 255, 0.1); }
.site-right { box-shadow: 0 0 20px rgba(255, 0, 255, 0.1); }

.list-panel { flex: 1; }
.wide-list-panel { flex: 1; }

.panel-cap {
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 6px 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.panel-cap.centered { justify-content: center; }
.panel-cap.no-border { border-bottom: none; padding: 0; }
.panel-name { font-family: 'Orbitron', sans-serif; font-size: 0.9rem; font-weight: 700; letter-spacing: 1px; }

.blue-bg-cap {
  background: linear-gradient(90deg, rgba(0, 30, 80, 0.9) 0%, rgba(0, 60, 120, 0.7) 100%) !important;
  border-bottom: 1px solid rgba(0, 150, 255, 0.5) !important;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.5);
}

/* HQ Tabs */
.hq-tabs-container {
  display: flex;
  width: 100%;
  background: rgba(0, 0, 0, 0.4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  overflow-x: auto;
  scrollbar-width: none;
}
.hq-tabs-container::-webkit-scrollbar { display: none; }

.tab-btn {
  flex: 1;
  padding: 10px 5px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: #666;
  font-size: 0.85rem;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s;
}
.tab-btn:hover { color: #aaa; background: rgba(255, 255, 255, 0.05); }
.tab-btn.active {
  color: #00ffcc;
  border-bottom-color: #00ffcc;
  background: rgba(0, 255, 204, 0.05);
  text-shadow: 0 0 10px rgba(0, 255, 204, 0.3);
}

.panel-content { 
  flex: 1; 
  display: flex; 
  padding: 10px 20px; 
  gap: 150px; 
  align-items: center; 
  justify-content: center;
  position: relative;
}
.side-column { margin: 0; z-index: 2; }
.center-area { margin: 0; z-index: 2; }

/* Flow Connector (Absolute Overlap) */
.flow-connector { 
  position: absolute; 
  width: 400px; 
  height: 460px; 
  top: calc(50% - 15px); /* Nudge up to align with dial center, ignoring labels */
  transform: translateY(-50%);
  z-index: 1;
  pointer-events: none;
}
.to-right { left: 80px; }
.to-left { right: 80px; }
.connector-svg { width: 100%; height: 100%; overflow: visible; }
.flow-line-bg { fill: none; stroke: rgba(0, 255, 204, 0.1); stroke-width: 1.5; }
.flow-line-active {
  fill: none; stroke: #00ffcc; stroke-width: 2;
  stroke-dasharray: 8, 30;
  filter: drop-shadow(0 0 5px #00ffcc);
  animation: flow-dash 2s linear infinite;
}

@keyframes flow-dash {
  from { stroke-dashoffset: 64; }
  to { stroke-dashoffset: 0; }
}

/* CDN Flow Connectors */
.cdn-flow-connector {
  position: absolute;
  width: 200px;
  height: 100px;
  top: 50%;
  z-index: 1;
  pointer-events: none;
}
.cdn-flow-connector.from-left { right: 100%; transform: translateY(-70%); }
.cdn-flow-connector.from-right { left: 100%; transform: translateY(-70%); }

/* Side Column (CCTV) */
.side-column { width: 140px; display: flex; flex-direction: column; gap: 20px; align-items: center; justify-content: center; }
.col-title { font-size: 1rem; font-weight: 700; color: #888; border-bottom: 2px solid #333; width: 100%; text-align: center; padding-bottom: 8px; margin-bottom: 10px; }
.gauge-stack { display: flex; flex-direction: column; gap: 30px; }

.cctv-item { display: flex; flex-direction: column; align-items: center; gap: 10px; }
.mini-chart { position: relative; width: 110px; height: 110px; display: flex; flex-direction: column; align-items: center; }
.mini-chart svg { position: absolute; inset:0; transform: rotate(-90deg); }
.mini-chart .bg { fill: none; stroke: rgba(255,255,255,0.05); stroke-width: 3; }
.mini-chart .progress { fill: none; stroke-width: 3; stroke-linecap: round; }
.mini-chart.cyan .progress { stroke: #00f3ff; filter: drop-shadow(0 0 3px #00f3ff); }

.mini-inner { z-index: 2; margin-top: 35px; font-weight: 700; font-size: 1.4rem; }
.mini-inner .v1 { color: #00f3ff; text-shadow: 0 0 10px rgba(0, 243, 255, 0.5); }
.mini-inner .v-alt { color: #ff4d4d; font-size: 1.1rem; }
.mini-label { font-size: 1rem; color: #eee; font-weight: 600; text-align: center; }

/* Center Area */
.center-area { flex: 1; height: 100%; display: flex; flex-direction: column; justify-content: space-between; padding-top: 5px; }
.service-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  background: rgba(0, 0, 0, 0.4);
  padding: 12px 25px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.08);
  margin-bottom: auto;
  width: fit-content;
}
.site1-theme .service-row { align-self: flex-end; margin-right: 20px; }
.gangwon-theme .service-row { align-self: flex-start; margin-left: 20px; }

.mode-tag {
  padding: 4px 14px; border-radius: 6px; font-weight: 800; font-size: 0.9rem; border: 2px solid currentColor;
}
.active-mode .mode-tag { color: #00ffcc; background: rgba(0, 255, 204, 0.1); box-shadow: 0 0 15px rgba(0, 255, 204, 0.3); }
.service-row.active-mode { border-color: rgba(0, 255, 204, 0.4); box-shadow: 0 0 20px rgba(0, 255, 204, 0.1); }

.standby-mode .mode-tag { color: #ffcc00; background: rgba(255, 204, 0, 0.1); }
.service-row.standby-mode { border-color: rgba(255, 204, 0, 0.4) !important; box-shadow: 0 0 20px rgba(255, 204, 0, 0.1); }

.service-icons { display: flex; gap: 16px; }
.s-icon { 
  display: flex; align-items: center; gap: 8px; 
  background: rgba(255,255,255,0.03); 
  padding: 6px 12px; border-radius: 6px; 
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.active-mode .s-icon.active { 
  border-color: rgba(0, 255, 204, 0.6); 
  background: rgba(0, 255, 204, 0.15); 
  box-shadow: 0 0 12px rgba(0, 255, 204, 0.2); 
}

.standby-mode .s-icon.active { 
  border-color: rgba(255, 204, 0, 0.6) !important; 
  background: rgba(255, 204, 0, 0.15) !important; 
  box-shadow: 0 0 12px rgba(255, 204, 0, 0.2) !important; 
}

.s-icon .t { font-size: 1rem; font-weight: 700; color: #fff; letter-spacing: 1px; }
.s-icon span[class^="d-"] { width: 8px; height: 8px; border-radius: 50%; }
.d-cyan { background: #00f3ff; box-shadow: 0 0 8px #00f3ff; }
.d-green { background: #00ffcc; box-shadow: 0 0 8px #00ffcc; }
.d-yellow { background: #ffcc00; box-shadow: 0 0 8px #ffcc00; }
.d-red { background: #ff4d4d; box-shadow: 0 0 8px #ff4d4d; }
.i-white { color: #fff; width: 20px; }
.i-blue { color: #00f3ff; width: 20px; }
.i-green { color: #00ffcc; width: 20px; }
.i-yellow { color: #ffcc00; width: 20px; }

/* Big Gauges (Car Instrument Style) */
.gauge-pair { display: flex; justify-content: center; gap: 200px; flex: 1; align-items: center; position: relative; }
.big-gauge { display: flex; flex-direction: column; align-items: center; gap: 10px; z-index: 2; }
.mid-connector {
  width: 200px;
  height: 100px;
  position: absolute;
  left: 50%;
  top: calc(50% - 35px); /* Adjusted upward to hit the exact center of the dials */
  transform: translate(-50%, -50%);
  z-index: 1;
}
.g-wrap.car-cluster { 
  position: relative; 
  width: 200px; height: 200px; 
  background: radial-gradient(circle at 50% 50%, #1a1b25 0%, #050508 100%);
  border-radius: 50%;
  border: 4px solid #222;
  box-shadow: 
    0 0 30px rgba(0, 0, 0, 0.8),
    inset 0 0 15px rgba(255, 255, 255, 0.05);
}

.glass-reflection {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%, rgba(255,255,255,0.02) 100%);
  border-radius: 50%;
  z-index: 10;
  pointer-events: none;
}

.instrument-svg { transform: rotate(0deg); width: 100%; height: 100%; overflow: visible; }

/* Tick Marks */
.tick { stroke: rgba(255, 255, 255, 0.3); stroke-width: 1; }
.tick.major { stroke: rgba(255, 255, 255, 0.6); stroke-width: 2; }

.dial-bg { fill: none; stroke: rgba(255, 255, 255, 0.03); stroke-width: 6; stroke-dasharray: 188 251; transform: rotate(135deg); transform-origin: center; }
.dial-needle { 
  fill: none; stroke-width: 6; stroke-linecap: butt; 
  transform: rotate(135deg); transform-origin: center;
  transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.instrument-green .dial-needle { filter: drop-shadow(0 0 10px rgba(0, 255, 204, 0.5)); }

.g-text { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 5; }
.v-main { font-family: 'Orbitron', sans-serif; font-size: 2.5rem; font-weight: 700; color: #fff; text-shadow: 0 0 15px rgba(255, 255, 255, 0.4); margin-bottom: -5px; }

.instrument-status-grid { 
  display: flex; gap: 15px; margin-top: 5px;
  padding: 4px 12px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
}
.stat-item { display: flex; flex-direction: column; align-items: center; min-width: 20px; }
.s-val { font-size: 1rem; font-weight: 700; font-family: 'Orbitron'; }

.stat-item.ok .s-val { color: #00ffcc; }
.stat-item.standby .s-val { color: #ffcc00; }
.stat-item.error .s-val { color: #ff3333; }

.instrument-green .v-main { color: #ffffff; }

.g-label { font-size: 1rem; color: #ddd; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }

/* CDN Middle */
.cdn-spacer { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 40px; position: relative; z-index: 20; }
.cdn-node-box {
  width: 150px; height: 150px; 
  background: radial-gradient(circle at 50% 50%, #1a1b25 0%, #050508 100%);
  border: 2px solid #333; border-radius: 12px;
  display: flex; flex-direction: column; align-items: center; justify-content: center; 
  box-shadow: 
    0 0 30px rgba(0, 0, 0, 0.8),
    inset 0 0 20px rgba(255, 255, 255, 0.02);
  z-index: 21;
  transform: translateY(20px);
}
.cdn-icon { width: 60px; height: 60px; color: #00d2ff; margin-bottom: 10px; filter: drop-shadow(0 0 10px rgba(0, 210, 255, 0.3)); }
.cdn-name { font-size: 1.4rem; font-weight: 800; color: #fff; letter-spacing: 2px; }

/* List Panels */
.list-container { flex: 1; padding: 10px; display: flex; flex-direction: column; gap: 8px; }
.list-container.scrolling { overflow-y: auto; }

.alarm-box { background: rgba(255,255,255,0.03); padding: 10px; border-radius: 4px; border-left: 4px solid #444; }
.alarm-box.critical { border-left-color: #9e4a4a; box-shadow: inset 5px 0 10px rgba(158, 74, 74, 0.1); }
.alarm-box.warning { border-left-color: #9e8b4a; box-shadow: inset 5px 0 10px rgba(158, 139, 74, 0.1); }
.alarm-box.info { border-left-color: #4a799e; box-shadow: inset 5px 0 10px rgba(74, 121, 158, 0.1); }

.a-header { font-size: 0.75rem; color: #aaa; display: flex; justify-content: space-between; margin-bottom: 4px; }
.a-header .tag { font-weight: 800; border-radius: 10px; padding: 0 8px; border: 1px solid currentColor; }
.a-content { font-size: 1rem; font-weight: 700; color: #fff; }

.hq-item { display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.05); padding: 10px; border-radius: 4px; border-bottom: 1px solid rgba(255,255,255,0.05); }
.hq-left { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 1rem; }
.pin-icon { color: #00f3ff; width: 18px; }
.hq-right { display: flex; align-items: center; gap: 5px; font-size: 1.1rem; font-weight: 700; }
.hq-right .green { color: #ffffff; text-shadow: 0 0 5px rgba(255, 255, 255, 0.3); }
.hq-right .red { color: #ff4d4d; }
.cam-icon { width: 16px; color: #666; }

/* Traffic Section */
.traffic-content { flex: 1; padding: 10px; display: flex; flex-direction: column; gap: 10px; }
.traffic-entry { flex: 1; display: flex; flex-direction: column; }
.t-meta { display: flex; justify-content: space-between; font-size: 0.75rem; color: #666; margin-bottom: 2px; }
.t-meta .peak { font-weight: 800; font-size: 1rem; font-family: 'Orbitron'; }
.t-meta .peak small { font-size: 0.65rem; font-weight: 400; opacity: 0.6; margin-left: 2px; text-transform: uppercase; }
.t-meta .peak.cyan { color: #ffffff; }
.t-meta .peak.green { color: #ffffff; }
.t-meta .peak.magenta { color: #ffffff; }
.t-meta .peak.amber { color: #ffffff; }
.chart-box { flex: 1; background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 4px; overflow: hidden; }



/* Scrollbar */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-inner { background: #333; border-radius: 2px; }

@keyframes rotate-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
