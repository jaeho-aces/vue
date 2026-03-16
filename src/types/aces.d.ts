/**
 * ACES AMS7000/HDS7000 (public/aces/*.js) 전역 타입
 */
export interface AcesVideoTarget {
  SessionNameLong: string
  SessionName: string
  InputURL: string
  ConnectionType?: number
  UserName?: string
  Password?: string
  SourceServer?: string
  SourceServerPort?: number
  ServiceSessionName?: string
  CloseWaitTime?: number
  OutputResolution?: string
  Bitrate?: number
}

export interface AcesVideoRequest {
  shutdown(): void
}

export interface AcesServerAMS7000Instance {
  openVideo(
    videoTag: HTMLVideoElement,
    target: AcesVideoTarget,
    callback?: (server: unknown, evt: unknown) => void,
    callbackOK?: (evt: unknown) => void,
    callbackError?: (evt: unknown) => void,
    callbackClose?: () => void
  ): AcesVideoRequest | null
}

declare global {
  interface Window {
    AcesServerAMS7000: new (
      serverIp: string,
      serverPort?: number,
      honorSourceServer?: boolean,
      showLog?: boolean
    ) => AcesServerAMS7000Instance
  }
}
