<template>
  <div
    class="webrtc-video-player flex flex-col h-full w-full bg-black rounded-lg overflow-hidden relative"
    @mouseenter="onMouseEnter"
  >
    <video
      v-show="rtspUrl && isAvailable"
      ref="videoRef"
      class="w-full h-full object-contain"
      muted
      playsinline
      autoplay
    />
    <div
      v-if="loading && rtspUrl && isAvailable"
      class="absolute inset-0 flex items-center justify-center bg-slate-900/80 text-slate-400 text-sm"
    >
      연결 중...
    </div>
    <div
      v-if="error"
      class="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-slate-400 text-sm p-2 text-center"
    >
      <span>{{ error }}</span>
    </div>
    <div
      v-if="!isAvailable"
      class="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-slate-500 text-sm p-4 text-center"
    >
      <template v-if="!hasAcesScript">
        <span>AMS7000 스크립트를 불러올 수 없습니다</span>
        <span class="text-xs mt-1">index.html에서 /aces/*.js 로드 여부를 확인하세요</span>
      </template>
      <template v-else>
        <span>AMS7000 서버를 설정해 주세요</span>
        <span class="text-xs mt-1">(VITE_AMS7000_SERVER=호스트:8880)</span>
      </template>
    </div>
    <div
      v-else-if="!rtspUrl"
      class="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-slate-500 text-sm p-2 text-center"
    >
      <span>{{ noUrlMessage || 'RTSP URL 없음' }}</span>
    </div>
    <div
      v-if="label && rtspUrl && isAvailable && !error"
      class="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-b text-xs text-white font-medium truncate pointer-events-none transition-opacity duration-300"
      :class="{ 'opacity-0': !showFooter }"
    >
      {{ label }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount, nextTick } from 'vue'
import { useAcesAms7000 } from '../../composables/useAcesAms7000'
import type { AcesVideoRequest } from '../../types/aces'

const props = withDefaults(
  defineProps<{
    rtspUrl: string | null
    label?: string
    /** rtspUrl이 없을 때 표시할 안내 문구 (예: 변환 RTSP 없음) */
    noUrlMessage?: string
  }>(),
  { label: '', noUrlMessage: '' }
)

const videoRef = ref<HTMLVideoElement | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const showFooter = ref(true)

const FOOTER_VISIBLE_MS = 3000
let footerFadeTimer: ReturnType<typeof setTimeout> | null = null

function scheduleFooterFadeOut() {
  if (footerFadeTimer) clearTimeout(footerFadeTimer)
  footerFadeTimer = setTimeout(() => {
    showFooter.value = false
    footerFadeTimer = null
  }, FOOTER_VISIBLE_MS)
}

function onMouseEnter() {
  if (!props.label || !props.rtspUrl || !isAvailable.value || error.value) return
  showFooter.value = true
  scheduleFooterFadeOut()
}

const { isAvailable, hasAcesScript, openVideo } = useAcesAms7000()

let videoRequest: AcesVideoRequest | null = null

function stop() {
  if (videoRequest) {
    try {
      videoRequest.shutdown()
    } catch (_) {}
    videoRequest = null
  }
  error.value = null
  loading.value = false
}

function play() {
  if (!props.rtspUrl || !isAvailable.value) return
  const el = videoRef.value
  if (!el) return
  stop()
  loading.value = true
  error.value = null
  videoRequest = openVideo(el, props.rtspUrl, props.label || 'Camera', (_evt) => {
    loading.value = false
    error.value = '연결 실패'
  })
  if (videoRequest) {
    loading.value = false
    showFooter.value = true
    scheduleFooterFadeOut()
  } else {
    loading.value = false
    error.value = '재생을 시작할 수 없습니다. 개발자 도구(F12) 콘솔에서 원인을 확인하세요.'
  }
}

watch(
  () => props.rtspUrl,
  async (url) => {
    if (url) {
      await nextTick()
      play()
    } else {
      stop()
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (footerFadeTimer) clearTimeout(footerFadeTimer)
  stop()
})
</script>

<style scoped>
.webrtc-video-player video {
  min-height: 120px;
}
</style>
