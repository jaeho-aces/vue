<template>
  <div class="w-full h-full flex flex-col overflow-hidden">
    <div class="flex flex-col h-full w-full">
      <div class="flex gap-0 border-b-2 border-slate-200 bg-slate-100 overflow-x-visible shrink-0 px-2 pt-2 flex-wrap">
        <button
          v-for="tab in tabs"
          :key="tab"
          @click="setTab(tab)"
          :class="['device-management-tab-button', { active: currentTab === tab }]"
        >
          {{ tab }}
        </button>
      </div>
      <div class="flex-1 overflow-hidden bg-slate-50 p-4 flex flex-col min-h-0 h-0">
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
    <div class="flex items-center justify-center h-full min-h-[400px] bg-white">
      <div class="text-center">
        <p class="text-xl font-semibold text-slate-700 mb-2">가상서버 정보</p>
        <p class="text-sm text-slate-400">구현 예정</p>
      </div>
    </div>
  `
}

// Tab 배열
const tabs = [
  '영상변환서버 정보',
  '가상서버 정보',
  '영상 파일 전송 서버',
  '미디어 서버 정보',
  '카메라 정보',
  '미디어 정보',
  '영상변환 채널정보',
  '버전 관리'
] as const

// TabContent Record
const tabContent: Record<string, any> = {
  '영상변환서버 정보': VideoConversionServerInfo,
  '가상서버 정보': VirtualServerInfo,
  '영상 파일 전송 서버': VideoFileTransferServer,
  '미디어 서버 정보': MediaServerInfo,
  '카메라 정보': CameraInfo,
  '미디어 정보': MediaInfo,
  '영상변환 채널정보': VideoConversionInfo,
  '버전 관리': VersionManagement
}

// useState(tabs[0]) → ref(tabs[0])
const currentTab = ref<string>(tabs[0])

// setTab 함수
const setTab = (tab: string) => {
  currentTab.value = tab
}
</script>

