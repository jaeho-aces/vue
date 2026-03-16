/**
 * ACES AMS7000 사용 (web2/common/AcesServerAMS7000.js 참고)
 * RTSP URL → WebRTC 재생을 위해 AMS7000 서버에 연결 후 openVideo 호출
 */
import { ref } from 'vue'
import type { AcesVideoRequest, AcesVideoTarget, AcesServerAMS7000Instance } from '../types/aces'

const DEFAULT_PORT = 8880

function parseServerEnv(): { host: string; port: number } | null {
  const raw = import.meta.env.VITE_AMS7000_SERVER
  if (!raw || typeof raw !== 'string') return null
  const s = raw.trim()
  if (!s) return null
  const idx = s.indexOf(':')
  if (idx >= 0) {
    const host = s.slice(0, idx).trim()
    const port = parseInt(s.slice(idx + 1).trim(), 10)
    return { host, port: Number.isFinite(port) ? port : DEFAULT_PORT }
  }
  return { host: s, port: DEFAULT_PORT }
}

let sharedInstance: AcesServerAMS7000Instance | null = null

export function useAcesAms7000() {
  const serverConfig = parseServerEnv()
  const hasAcesScript = ref(
    typeof window !== 'undefined' && typeof (window as unknown as { AcesServerAMS7000?: unknown }).AcesServerAMS7000 === 'function'
  )
  const isAvailable = ref(!!serverConfig && hasAcesScript.value)

  function getInstance(): AcesServerAMS7000Instance | null {
    if (!serverConfig) return null
    if (sharedInstance) return sharedInstance
    const Ctor = typeof window !== 'undefined' ? window.AcesServerAMS7000 : null
    if (!Ctor) return null
    try {
      sharedInstance = new Ctor(
        serverConfig.host,
        serverConfig.port,
        true,  // honorSourceServer
        false  // showLog
      )
      return sharedInstance
    } catch {
      return null
    }
  }

  /**
   * RTSP URL로 WebRTC 재생 시작
   * @param videoEl - 재생할 <video> 요소
   * @param rtspUrl - RTSP 스트림 URL
   * @param label - 표시 이름 (SessionNameLong)
   * @param onError - 연결 실패(예: 5회 재시도 후 포기) 시 호출되는 콜백
   * @returns shutdown() 호출로 종료 가능한 객체, 또는 null
   */
  function openVideo(
    videoEl: HTMLVideoElement | null,
    rtspUrl: string,
    label: string,
    onError?: (evt: unknown) => void
  ): AcesVideoRequest | null {
    if (!videoEl || !rtspUrl) return null
    const server = getInstance()
    if (!server) return null
    const sessionName = 'video@' + (label || 'stream').replace(/\s/g, '_') + '_' + Date.now()
    const target: AcesVideoTarget = {
      SessionNameLong: label || 'Camera',
      SessionName: sessionName,
      InputURL: rtspUrl
    }
    return server.openVideo(videoEl, target, undefined, undefined, onError, undefined)
  }

  return { isAvailable, hasAcesScript, openVideo, getConfig: () => serverConfig }
}
