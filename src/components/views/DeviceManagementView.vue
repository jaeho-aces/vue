<template>
  <div class="device-management-container">
    <div class="tabs-container">
      <div class="tabs-header">
        <button
          v-for="tab in tabs"
          :key="tab"
          @click="setTab(tab)"
          :class="['tab-button', { active: currentTab === tab }]"
        >
          {{ tab }}
        </button>
      </div>
      <div class="tabs-content">
        <component :is="tabContent[currentTab]" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import VideoConversionInfo from './device/VideoConversionInfo.vue'
import VideoConversionServerInfo from './device/VideoConversionServerInfo.vue'
import MediaServerInfo from './device/MediaServerInfo.vue'
import VideoFileTransferServer from './device/VideoFileTransferServer.vue'
import CameraInfo from './device/CameraInfo.vue'
import MediaInfo from './device/MediaInfo.vue'
import VersionManagement from './device/VersionManagement.vue'

// 가상서버 정보 컴포넌트 (임시 - 나중에 구현)
const VirtualServerInfo = {
  template: `
    <div class="virtual-server-info-placeholder">
      <div class="placeholder-content">
        <p class="placeholder-text">가상서버 정보</p>
        <p class="placeholder-subtext">구현 예정</p>
      </div>
    </div>
  `
}

// Tab 배열
const tabs = [
  '영상변환 채널정보',
  '영상변환서버 정보',
  '가상서버 정보',
  '영상 파일 전송 서버',
  '미디어 서버 정보',
  '카메라 정보',
  '미디어 정보',
  '버전 관리'
] as const

// TabContent Record
const tabContent: Record<string, any> = {
  '영상변환 채널정보': VideoConversionInfo,
  '영상변환서버 정보': VideoConversionServerInfo,
  '가상서버 정보': VirtualServerInfo,
  '영상 파일 전송 서버': VideoFileTransferServer,
  '미디어 서버 정보': MediaServerInfo,
  '카메라 정보': CameraInfo,
  '미디어 정보': MediaInfo,
  '버전 관리': VersionManagement
}

// useState(tabs[0]) → ref(tabs[0])
const currentTab = ref<string>(tabs[0])

// setTab 함수
const setTab = (tab: string) => {
  currentTab.value = tab
}
</script>

<style scoped>
.device-management-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tabs-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.tabs-header {
  display: flex;
  gap: 0;
  border-bottom: 2px solid #e2e8f0;
  background-color: #f1f5f9;
  overflow-x: visible;
  flex-shrink: 0;
  padding: 0 8px;
  padding-top: 8px;
  flex-wrap: wrap;
}

.tab-button {
  padding: 12px 24px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  white-space: nowrap;
  transition: all 0.2s ease;
  position: relative;
  background-color: #e2e8f0;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  margin-right: 4px;
  border: 1px solid #cbd5e1;
  border-bottom: none;
  z-index: 1;
}

.tab-button::before {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #e2e8f0;
  z-index: 2;
}

.tab-button:hover {
  color: #334155;
  background-color: #f8fafc;
  z-index: 2;
}

.tab-button.active {
  color: #2563eb;
  background-color: #ffffff;
  font-weight: 600;
  z-index: 10;
  border-color: #cbd5e1;
  border-bottom-color: #ffffff;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

.tab-button.active::before {
  background-color: #ffffff;
  height: 2px;
}

.tabs-content {
  flex: 1;
  overflow: hidden;
  background-color: #f8fafc;
  padding: 16px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 0; /* flexbox에서 높이 제한을 위한 필수 설정 */
}

/* 가상서버 정보 플레이스홀더 스타일 */
.virtual-server-info-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 400px;
  background-color: #ffffff;
}

.placeholder-content {
  text-align: center;
}

.placeholder-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.5rem;
}

.placeholder-subtext {
  font-size: 0.875rem;
  color: #94a3b8;
}

/* 스크롤바 스타일 */
.tabs-content::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.tabs-content::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 4px;
}

.tabs-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.tabs-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>


