<template>
  <div class="dashboard2-container">
    <!-- 상단 헤더 -->
    <div class="dashboard-header">
      <h1 class="header-title">대시보드</h1>
    </div>

    <!-- 2행 레이아웃 -->
    <div class="dashboard-grid">
      <!-- 1행: 연결선이 있는 시스템 아키텍처 -->
      <div class="row-1">
        <div class="architecture-section">
          <div class="architecture-flow">
            <!-- 왼쪽 영역: 교통센터 -->
            <div class="region-container region-left">
              <div class="region-title">교통센터</div>
              <!-- 상단: DB, WAS, Web 영역 -->
              <div class="server-area">
                <div class="server-area-header">ACTIVE</div>
                <div class="top-flow">
                  <div class="flow-node" ref="db1Ref" data-node="db1">
                    <div class="node-content">
                      <Database class="server-icon db-icon" />
                      <div class="node-label">
                        <span class="status-indicator" :class="db1Status ? 'status-normal' : 'status-error'"></span>
                        DB
                      </div>
                    </div>
                  </div>
                  <div class="flow-node" ref="was1Ref" data-node="was1">
                    <div class="node-content">
                      <Server class="server-icon was-icon" />
                      <div class="node-label">
                        <span class="status-indicator" :class="was1Status ? 'status-normal' : 'status-error'"></span>
                        WAS
                      </div>
                    </div>
                  </div>
                  <div class="flow-node" ref="web1Ref" data-node="web1">
                    <div class="node-content">
                      <Monitor class="server-icon web-icon" />
                      <div class="node-label">
                        <span class="status-indicator" :class="web1Status ? 'status-normal' : 'status-error'"></span>
                        Web
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- 하단: CCTV, 변환/분배, 미디어, CDN (CDN은 가장 오른쪽) -->
              <div class="bottom-flow">
                <!-- 왼쪽 CCTV 영역 (가장 바깥쪽) -->
                <div class="cctv-area">
                  <div class="cctv-area-header">CCTV</div>
                  <div class="cctv-group">
                    <div 
                      class="flow-node" 
                      ref="cctv1_1Ref"
                      data-node="cctv1_1"
                    >
                      <div class="node-content">
                        <CircularGauge
                          :normal="cctv1_1Normal"
                          :error="cctv1_1Error"
                          normal-color="#10B981"
                          error-color="#EF4444"
                          :show-ratio="true"
                        />
                        <div class="node-label">도로공사</div>
                      </div>
                    </div>
                    <div 
                      class="flow-node" 
                      ref="cctv1_2Ref"
                      data-node="cctv1_2"
                    >
                      <div class="node-content">
                        <CircularGauge
                          :normal="cctv1_2Normal"
                          :error="cctv1_2Error"
                          normal-color="#10B981"
                          error-color="#EF4444"
                          :show-ratio="true"
                        />
                        <div class="node-label">수탁</div>
                      </div>
                    </div>
                    <div 
                      class="flow-node" 
                      ref="cctv1_3Ref"
                      data-node="cctv1_3"
                    >
                      <div class="node-content">
                        <CircularGauge
                          :normal="cctv1_3Normal"
                          :error="cctv1_3Error"
                          normal-color="#10B981"
                          error-color="#EF4444"
                          :show-ratio="true"
                        />
                        <div class="node-label">비수탁</div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- 변환/분배 1 -->
                <div 
                  class="flow-node trans-node" 
                  ref="trans1Ref"
                  data-node="trans1"
                >
                  <div class="node-content">
                    <StrokedGauge
                      :normal="trans1Normal"
                      :error="trans1Error"
                      :waiting="trans1Waiting"
                      normal-color="#10B981"
                      error-color="#EF4444"
                      waiting-color="#9ca3af"
                      :show-ratio="true"
                      :height="180"
                    />
                    <div class="node-label">변환/분배</div>
                  </div>
                </div>
                <!-- 미디어 1 -->
                <div 
                  class="flow-node media-node" 
                  ref="media1Ref"
                  data-node="media1"
                >
                  <div class="node-content">
                    <StrokedGauge
                      :normal="media1Normal"
                      :error="media1Error"
                      :waiting="media1Waiting"
                      normal-color="#3B82F6"
                      error-color="#EF4444"
                      waiting-color="#9ca3af"
                      :show-ratio="true"
                      :height="180"
                    />
                    <div class="node-label">미디어</div>
                  </div>
                </div>
                <!-- CDN 1 (교통센터, 가장 오른쪽) -->
                <div 
                  class="flow-node cdn-node" 
                  ref="cdn1Ref"
                  data-node="cdn1"
                >
                  <div class="node-content">
                    <Globe class="cdn-icon" />
                    <div class="node-label">CDN</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 오른쪽 영역: 김천본사 -->
            <div class="region-container region-right">
              <div class="region-title">김천본사</div>
              <!-- 상단: Web, WAS, DB 영역 -->
              <div class="server-area">
                <div class="server-area-header server-area-header-standby">STANDBY</div>
                <div class="top-flow">
                  <div class="flow-node" ref="web2Ref" data-node="web2">
                    <div class="node-content">
                      <Monitor class="server-icon web-icon" />
                      <div class="node-label">
                        <span class="status-indicator" :class="web2Status ? 'status-normal' : 'status-error'"></span>
                        Web
                      </div>
                    </div>
                  </div>
                  <div class="flow-node" ref="was2Ref" data-node="was2">
                    <div class="node-content">
                      <Server class="server-icon was-icon" />
                      <div class="node-label">
                        <span class="status-indicator" :class="was2Status ? 'status-normal' : 'status-error'"></span>
                        WAS
                      </div>
                    </div>
                  </div>
                  <div class="flow-node" ref="db2Ref" data-node="db2">
                    <div class="node-content">
                      <Database class="server-icon db-icon" />
                      <div class="node-label">
                        <span class="status-indicator" :class="db2Status ? 'status-normal' : 'status-error'"></span>
                        DB
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- 하단: CDN, 미디어, 변환/분배 서버, CCTV 그룹 (대칭 배치, CDN은 가장 왼쪽) -->
              <div class="bottom-flow">
                <!-- CDN 2 (김천본사, 가장 왼쪽) -->
                <div 
                  class="flow-node cdn-node" 
                  ref="cdn2Ref"
                  data-node="cdn2"
                >
                  <div class="node-content">
                    <Globe class="cdn-icon" />
                    <div class="node-label">CDN</div>
                  </div>
                </div>
                <!-- 변환/분배 서버 2 -->
                <div 
                  class="flow-node trans-node" 
                  ref="trans2Ref"
                  data-node="trans2"
                >
                  <div class="node-content">
                    <StrokedGauge
                      :normal="trans2Normal"
                      :error="trans2Error"
                      :waiting="trans2Waiting"
                      normal-color="#10B981"
                      error-color="#EF4444"
                      waiting-color="#9ca3af"
                      :show-ratio="true"
                      :height="180"
                    />
                    <div class="node-label">변환/분배 서버</div>
                  </div>
                </div>
                <!-- 미디어 2 -->
                <div 
                  class="flow-node media-node" 
                  ref="media2Ref"
                  data-node="media2"
                >
                  <div class="node-content">
                    <StrokedGauge
                      :normal="media2Normal"
                      :error="media2Error"
                      :waiting="media2Waiting"
                      normal-color="#3B82F6"
                      error-color="#EF4444"
                      waiting-color="#9ca3af"
                      :show-ratio="true"
                      :height="180"
                    />
                    <div class="node-label">미디어</div>
                  </div>
                </div>
                <!-- 오른쪽 CCTV 영역 (가장 바깥쪽) -->
                <div class="cctv-area">
                  <div class="cctv-area-header">CCTV</div>
                  <div class="cctv-group">
                    <div 
                      class="flow-node" 
                      ref="cctv2_1Ref"
                      data-node="cctv2_1"
                    >
                      <div class="node-content">
                        <CircularGauge
                          :normal="cctv2_1Normal"
                          :error="cctv2_1Error"
                          normal-color="#ff0096"
                          error-color="#ff0066"
                          :show-ratio="true"
                        />
                        <div class="node-label">도로공사</div>
                      </div>
                    </div>
                    <div 
                      class="flow-node" 
                      ref="cctv2_2Ref"
                      data-node="cctv2_2"
                    >
                      <div class="node-content">
                        <CircularGauge
                          :normal="cctv2_2Normal"
                          :error="cctv2_2Error"
                          normal-color="#ff0096"
                          error-color="#ff0066"
                          :show-ratio="true"
                        />
                        <div class="node-label">수탁</div>
                      </div>
                    </div>
                    <div 
                      class="flow-node" 
                      ref="cctv2_3Ref"
                      data-node="cctv2_3"
                    >
                      <div class="node-content">
                        <CircularGauge
                          :normal="cctv2_3Normal"
                          :error="cctv2_3Error"
                          normal-color="#ff0096"
                          error-color="#ff0066"
                          :show-ratio="true"
                        />
                        <div class="node-label">비수탁</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2행: 향후 구현 예정 -->
      <div class="row-2">
        <div class="placeholder-section">
          <h2 class="section-title">2행 영역</h2>
          <p class="placeholder-text">향후 구현 예정</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import CircularGauge from '../common/CircularGauge.vue'
import StrokedGauge from '../common/StrokedGauge.vue'
import { Globe, Database, Server, Monitor } from 'lucide-vue-next'

// CCTV 데이터
const cctv1_1Normal = ref(45)
const cctv1_1Error = ref(2)
const cctv1_2Normal = ref(38)
const cctv1_2Error = ref(1)
const cctv1_3Normal = ref(52)
const cctv1_3Error = ref(3)
const cctv2_1Normal = ref(48)
const cctv2_1Error = ref(1)
const cctv2_2Normal = ref(40)
const cctv2_2Error = ref(2)
const cctv2_3Normal = ref(50)
const cctv2_3Error = ref(2)

// 상단 플로우 서버 데이터 (DB, WAS, Web)
const db1Normal = ref(3)
const db1Error = ref(0)
const was1Normal = ref(5)
const was1Error = ref(0)
const web1Normal = ref(4)
const web1Error = ref(0)
const web2Normal = ref(4)
const web2Error = ref(0)
const was2Normal = ref(5)
const was2Error = ref(0)
const db2Normal = ref(3)
const db2Error = ref(0)

// 서버 상태 (true: 정상, false: 비정상)
const db1Status = ref(true)
const was1Status = ref(true)
const web1Status = ref(true)
const db2Status = ref(true)
const was2Status = ref(true)
const web2Status = ref(true)

// 중간 플로우 서버 데이터
const trans1Normal = ref(8)
const trans1Error = ref(0)
const trans1Waiting = ref(2)
const media1Normal = ref(12)
const media1Error = ref(1)
const media1Waiting = ref(3)
const cdn1Normal = ref(15)
const cdn1Error = ref(0)
const cdn2Normal = ref(15)
const cdn2Error = ref(0)
const media2Normal = ref(10)
const media2Error = ref(1)
const media2Waiting = ref(2)
const trans2Normal = ref(7)
const trans2Error = ref(0)
const trans2Waiting = ref(1)

// 노드 ref (나중에 연결선 그리기용으로 유지)
const db1Ref = ref<HTMLElement | null>(null)
const was1Ref = ref<HTMLElement | null>(null)
const web1Ref = ref<HTMLElement | null>(null)
const web2Ref = ref<HTMLElement | null>(null)
const was2Ref = ref<HTMLElement | null>(null)
const db2Ref = ref<HTMLElement | null>(null)
const cctv1_1Ref = ref<HTMLElement | null>(null)
const cctv1_2Ref = ref<HTMLElement | null>(null)
const cctv1_3Ref = ref<HTMLElement | null>(null)
const trans1Ref = ref<HTMLElement | null>(null)
const media1Ref = ref<HTMLElement | null>(null)
const cdn1Ref = ref<HTMLElement | null>(null)
const cdn2Ref = ref<HTMLElement | null>(null)
const media2Ref = ref<HTMLElement | null>(null)
const trans2Ref = ref<HTMLElement | null>(null)
const cctv2_1Ref = ref<HTMLElement | null>(null)
const cctv2_2Ref = ref<HTMLElement | null>(null)
const cctv2_3Ref = ref<HTMLElement | null>(null)
</script>

<style scoped>
.dashboard2-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 24px;
  background: #1a1a1a;
  position: relative;
}

.dashboard-header {
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
}

.header-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #e5e7eb;
  margin: 0;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.2);
}

.dashboard-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
  overflow: hidden;
}

.row-1,
.row-2 {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.architecture-section {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #252525;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(255, 255, 255, 0.05);
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #e5e7eb;
  margin: 0 0 24px 0;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
}

.architecture-flow {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: space-evenly;
  padding: 8px;
  gap: 12px;
  overflow: hidden;
}

.region-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  flex: 1;
  min-width: 0;
  padding: 8px;
  border-radius: 8px;
  background: rgba(30, 30, 30, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.3),
    inset 0 0 20px rgba(255, 255, 255, 0.02);
  overflow: hidden;
}

.region-left {
  flex: 1;
  min-width: 0;
  border-left: 3px solid rgba(0, 240, 255, 0.3);
}

.region-right {
  flex: 1;
  min-width: 0;
  border-right: 3px solid rgba(255, 0, 150, 0.3);
}

.region-center {
  flex: 0 0 auto;
  max-width: 150px;
  background: rgba(35, 35, 35, 0.6);
  border: 2px solid rgba(255, 255, 255, 0.15);
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.3),
    0 0 30px rgba(255, 255, 255, 0.05),
    inset 0 0 20px rgba(255, 255, 255, 0.03);
  justify-content: center;
}

.region-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #e5e7eb;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.2);
  margin-bottom: 4px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: 100%;
  text-align: center;
  flex-shrink: 0;
}

.region-left .region-title {
  border-left: 3px solid rgba(0, 240, 255, 0.5);
}

.region-right .region-title {
  border-right: 3px solid rgba(255, 0, 150, 0.5);
}

.bottom-flow {
  display: flex;
  align-items: center;
  width: 100%;
  flex-wrap: nowrap;
  flex: 1;
  min-height: 0;
  padding: 0 16px;
}

.region-left .bottom-flow {
  justify-content: space-between;
}

.region-left .bottom-flow .cctv-group {
  flex-shrink: 0;
}

.region-left .bottom-flow .flow-node:not(.cctv-group .flow-node) {
  flex-shrink: 0;
}

.region-right .bottom-flow {
  justify-content: space-between;
}

.region-right .bottom-flow .cdn-node {
  flex-shrink: 0;
}

.region-right .bottom-flow .flow-node:not(.cctv-group .flow-node):not(.cdn-node) {
  flex-shrink: 0;
}

.region-right .bottom-flow .cctv-group {
  flex-shrink: 0;
}

.cctv-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  padding: 4px 8px;
  background: rgba(40, 40, 40, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  margin-bottom: 16px;
  margin-top: -135px;
  align-self: flex-start;
}

.cctv-area-header {
  font-size: 1rem;
  font-weight: 600;
  color: #e5e7eb;
  text-align: center;
  padding: 2px 4px;
  margin-bottom: 2px;
  text-shadow: 0 0 6px rgba(255, 255, 255, 0.2);
}

.bottom-flow .cctv-group {
  flex-shrink: 0;
  gap: 8px;
}

.bottom-flow .flow-node:not(.cctv-group .flow-node) {
  flex: 0 1 auto;
  min-width: 90px;
  max-width: 130px;
}


.server-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: fit-content;
  flex-shrink: 0;
  padding: 4px 8px;
  background: rgba(40, 40, 40, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.server-area-header {
  font-size: 1rem;
  font-weight: 600;
  color: #10B981;
  text-align: center;
  padding: 2px 4px;
  margin-bottom: 2px;
  text-shadow: 0 0 6px rgba(16, 185, 129, 0.4);
}

.server-area-header-standby {
  color: #9ca3af;
  text-shadow: 0 0 6px rgba(156, 163, 175, 0.3);
}

.top-flow {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: nowrap;
}

.top-flow .flow-node {
  flex: 0 1 auto;
  min-width: 80px;
  max-width: 120px;
}



.cctv-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  align-self: center;
}


.flow-node {
  background: #2a2a2a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
  z-index: 3;
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.2),
    0 0 15px rgba(255, 255, 255, 0.05);
}

.cctv-group .flow-node {
  min-width: 95px;
  max-width: 115px;
  width: 100%;
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.2),
    0 0 15px rgba(255, 0, 150, 0.08);
}


.flow-node:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    0 0 25px rgba(255, 255, 255, 0.1);
}

.cctv-group .flow-node:hover {
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    0 0 25px rgba(255, 0, 150, 0.15);
}

.cdn-node {
  background: #2d2d2d;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #e5e7eb;
  min-width: 120px;
  max-width: 150px;
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.2),
    0 0 20px rgba(0, 240, 255, 0.1),
    0 0 30px rgba(255, 0, 150, 0.05);
}

.cdn-node:hover {
  border-color: rgba(255, 255, 255, 0.25);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    0 0 30px rgba(0, 240, 255, 0.2),
    0 0 40px rgba(255, 0, 150, 0.1);
}

.cdn-node .node-label {
  color: #e5e7eb;
  font-weight: 700;
}

.cdn-icon {
  width: 48px;
  height: 48px;
  color: #10B981;
  filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.4));
  stroke-width: 2;
}

.server-icon {
  width: 40px;
  height: 40px;
  stroke-width: 2;
}

.db-icon {
  color: #3B82F6;
  filter: drop-shadow(0 0 6px rgba(59, 130, 246, 0.4));
}

.was-icon {
  color: #8B5CF6;
  filter: drop-shadow(0 0 6px rgba(139, 92, 246, 0.4));
}

.web-icon {
  color: #10B981;
  filter: drop-shadow(0 0 6px rgba(16, 185, 129, 0.4));
}

.status-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  vertical-align: middle;
}

.status-normal {
  background-color: #10B981;
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.6);
}

.status-error {
  background-color: #EF4444;
  box-shadow: 0 0 6px rgba(239, 68, 68, 0.6);
}

.node-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.node-content :deep(.circular-gauge-container) {
  width: 60px;
  height: 60px;
}

.bottom-flow .flow-node:not(.cctv-group .flow-node):not(.cdn-node):not(.media-node):not(.trans-node) .node-content :deep(.circular-gauge-container) {
  width: 100px;
  height: 100px;
}

.bottom-flow .flow-node:not(.cctv-group .flow-node):not(.cdn-node):not(.media-node):not(.trans-node) .node-content :deep(.circular-gauge-container.large) {
  width: 110px;
  height: 110px;
}

.trans-node {
  min-width: 200px;
  max-width: 220px;
  padding: 12px;
}

.trans-node .node-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.trans-node .node-content :deep(.stroked-gauge-wrapper) {
  width: 100%;
  display: flex;
  justify-content: center;
}

.media-node {
  min-width: 220px;
  max-width: 250px;
  padding: 12px;
}

.media-node .node-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.media-node .node-content :deep(.stroked-gauge-wrapper) {
  width: 100%;
  max-width: 200px;
}

.media-node .node-content :deep(.chart-container) {
  width: 100%;
  min-height: 180px;
}

.cctv-group .node-content :deep(.circular-gauge-container) {
  width: 95px;
  height: 95px;
}

.cctv-group .node-content :deep(.circular-gauge-container.large) {
  width: 105px;
  height: 105px;
}

.node-content :deep(.gauge-value) {
  font-size: 1rem;
  font-weight: 700;
  color: #e5e7eb;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
}

.cctv-group .node-content :deep(.gauge-value) {
  color: #e5e7eb;
  text-shadow: 0 0 8px rgba(255, 0, 150, 0.4);
}


.node-content :deep(.gauge-unit) {
  font-size: 0.625rem;
  color: #9ca3af;
}

.cctv-group .node-content :deep(.gauge-unit) {
  color: #9ca3af;
}

.node-content :deep(.gauge-svg circle[stroke="#e5e7eb"]) {
  stroke: rgba(255, 255, 255, 0.1);
  filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.1));
}

.cctv-group .node-content :deep(.gauge-svg circle[stroke="#e5e7eb"]) {
  stroke: rgba(255, 255, 255, 0.1);
  filter: drop-shadow(0 0 3px rgba(255, 0, 150, 0.2));
}

.node-content :deep(.gauge-svg .gauge-progress) {
  filter: drop-shadow(0 0 4px currentColor);
}


.node-subtitle {
  font-size: 0.625rem;
  font-weight: 500;
  color: #9ca3af;
  text-align: center;
  margin-top: 2px;
}

.cctv-group .flow-node .node-subtitle {
  color: #9ca3af;
}

.node-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #e5e7eb;
  text-align: center;
  word-break: keep-all;
  margin-top: 4px;
}

.cctv-group .flow-node .node-label {
  color: #e5e7eb;
}

.placeholder-section {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #252525;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(255, 255, 255, 0.05);
  position: relative;
  z-index: 1;
}

.placeholder-text {
  font-size: 1rem;
  color: #9ca3af;
  margin-top: 16px;
}

</style>
