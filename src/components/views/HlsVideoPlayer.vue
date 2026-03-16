<template>
  <div
    class="hls-video-player flex flex-col h-full w-full bg-black rounded-lg overflow-hidden relative"
    @mouseenter="onMouseEnter"
  >
    <video
      v-show="!error && streamUrl"
      ref="videoRef"
      class="w-full h-full object-contain"
      muted
      playsinline
      autoplay
    />
    <div
      v-if="loading && streamUrl"
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
      v-if="!streamUrl"
      class="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-slate-500 text-sm p-2 text-center"
    >
      <span>HLS URL 없음</span>
    </div>
    <div
      v-if="label && (streamUrl && !error)"
      class="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-b text-xs text-white font-medium truncate pointer-events-none transition-opacity duration-300"
      :class="{ 'opacity-0': !showFooter }"
    >
      {{ label }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount, nextTick } from 'vue'
import Hls from 'hls.js'

const props = withDefaults(
  defineProps<{
    streamUrl: string | null
    label?: string
  }>(),
  { label: '' }
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
  if (!props.label || !props.streamUrl || error.value) return
  showFooter.value = true
  scheduleFooterFadeOut()
}

let hls: Hls | null = null
const MAX_RECOVERY_ATTEMPTS = 4
const MAX_FULL_RECONNECT_ATTEMPTS = 2
let recoveryAttempts = 0
let fullReconnectCount = 0
let currentHlsUrl: string | null = null

function isHlsUrl(url: string): boolean {
  return /\.m3u8(\?|$)/i.test(url) || url.includes('m3u8')
}

function logHlsDiagnostic(message: string, payload?: Record<string, unknown>) {
  if (import.meta.env.DEV) {
    console.log('[HLS]', message, payload ?? '')
  }
}

function setupVideoStallHandlers(video: HTMLVideoElement, url: string) {
  const onWaiting = () => {
    logHlsDiagnostic('video waiting', { url })
    if (hls && currentHlsUrl === url) {
      try {
        hls.startLoad(-1)
      } catch (e) {
        logHlsDiagnostic('startLoad after waiting failed', { error: e })
      }
    }
  }
  const onStalled = () => {
    logHlsDiagnostic('video stalled', { url })
    if (hls && currentHlsUrl === url) {
      try {
        hls.startLoad(-1)
      } catch (e) {
        logHlsDiagnostic('startLoad after stalled failed', { error: e })
      }
    }
  }
  video.addEventListener('waiting', onWaiting)
  video.addEventListener('stalled', onStalled)
  return () => {
    video.removeEventListener('waiting', onWaiting)
    video.removeEventListener('stalled', onStalled)
  }
}

let removeStallHandlers: (() => void) | null = null

function attachSource(url: string, isFullReconnect = false) {
  if (!videoRef.value) return

  if (isFullReconnect) {
    tearDownHlsOnly()
  } else {
    destroyHls()
  }
  currentHlsUrl = url
  recoveryAttempts = 0
  if (!isFullReconnect) {
    fullReconnectCount = 0
  }
  logHlsDiagnostic(isFullReconnect ? 'HLS full reconnect' : 'HLS URL', { url })

  if (Hls.isSupported()) {
    loading.value = true
    error.value = null
    hls = new Hls({
      enableWorker: true,
      lowLatencyMode: false,
      maxBufferLength: 30,
      maxMaxBufferLength: 60
    })
    hls.loadSource(url)
    hls.attachMedia(videoRef.value)
    removeStallHandlers = setupVideoStallHandlers(videoRef.value, url)
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      loading.value = false
      if (props.label && url && !error.value) {
        showFooter.value = true
        scheduleFooterFadeOut()
      }
    })
    hls.on(Hls.Events.ERROR, (_event, data) => {
      logHlsDiagnostic('HLS error', {
        type: data.type,
        details: data.details,
        fatal: data.fatal,
        url
      })
      if (!data.fatal) return
      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        recoveryAttempts += 1
        if (recoveryAttempts <= MAX_RECOVERY_ATTEMPTS) {
          try {
            hls?.startLoad()
          } catch (e) {
            logHlsDiagnostic('startLoad recovery failed', { error: e })
          }
          return
        }
      }
      if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        if (data.details === 'bufferAppendError') {
          fullReconnectCount += 1
          if (fullReconnectCount <= MAX_FULL_RECONNECT_ATTEMPTS) {
            logHlsDiagnostic('bufferAppendError → 전체 재연결', {
              attempt: fullReconnectCount,
              url
            })
            loading.value = true
            error.value = null
            nextTick(() => attachSource(url, true))
            return
          }
        } else {
          recoveryAttempts += 1
          if (recoveryAttempts <= MAX_RECOVERY_ATTEMPTS) {
            try {
              hls?.recoverMediaError()
            } catch (e) {
              logHlsDiagnostic('recoverMediaError failed', { error: e })
            }
            return
          }
        }
      }
      loading.value = false
      error.value =
        data.type === Hls.ErrorTypes.NETWORK_ERROR ? '네트워크 오류' : '재생할 수 없습니다.'
    })
  } else if (videoRef.value.canPlayType('application/vnd.apple.mpegurl')) {
    loading.value = true
    error.value = null
    videoRef.value.src = url
    videoRef.value.addEventListener('loadeddata', () => {
      loading.value = false
      if (props.label && url && !error.value) {
        showFooter.value = true
        scheduleFooterFadeOut()
      }
    }, { once: true })
    videoRef.value.addEventListener('error', () => {
      loading.value = false
      error.value = '재생할 수 없습니다.'
    }, { once: true })
  } else {
    loading.value = false
    error.value = 'HLS를 지원하지 않는 브라우저입니다.'
  }
}

/** HLS 인스턴스와 버퍼만 제거. fullReconnectCount 등은 유지 (전체 재연결 시 사용) */
function tearDownHlsOnly() {
  removeStallHandlers?.()
  removeStallHandlers = null
  if (hls) {
    hls.destroy()
    hls = null
  }
  if (videoRef.value) {
    videoRef.value.src = ''
  }
}

function destroyHls() {
  tearDownHlsOnly()
  currentHlsUrl = null
  recoveryAttempts = 0
  fullReconnectCount = 0
}

function tryAttachSource() {
  const url = props.streamUrl
  if (url && isHlsUrl(url) && videoRef.value) {
    attachSource(url)
  }
}

watch(
  () => props.streamUrl,
  (url) => {
    if (url && isHlsUrl(url)) {
      nextTick(() => tryAttachSource())
    } else {
      destroyHls()
      loading.value = false
      error.value = url ? 'HLS URL이 아닙니다.' : null
    }
  },
  { immediate: true }
)

// v-if로 마운트될 때 videoRef가 한 틱 늦게 채워질 수 있음
watch(
  videoRef,
  (el) => {
    if (el && props.streamUrl && isHlsUrl(props.streamUrl) && !hls) {
      attachSource(props.streamUrl)
    }
  },
  { flush: 'post' }
)

onBeforeUnmount(() => {
  if (footerFadeTimer) clearTimeout(footerFadeTimer)
  destroyHls()
})
</script>

<style scoped>
.hls-video-player video {
  min-height: 0;
}
</style>
