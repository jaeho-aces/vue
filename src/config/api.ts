/**
 * API 설정 및 기본 URL 관리
 */

// 환경 변수에서 API 기본 URL 가져오기
const getApiBaseUrl = (): string => {
  // Vite는 import.meta.env를 사용하여 환경 변수에 접근
  const baseUrl = import.meta.env.VITE_API_BASE_URL

  // 만약 baseUrl이 없으면 (프로덕션 빌드 후 file:// 실행 시 등)
  // 기본적으로 localhost:8000을 바라보도록 설정
  if (!baseUrl) {
    // 개발 모드에서는 프록시가 작동하므로 빈 문자열 반환 (상대 경로)
    if (import.meta.env.DEV) {
      return ''
    }
    // 프로덕션 모드(빌드 후)에서는 절대 경로 필요
    return 'http://localhost:8000'
  }

  return baseUrl
}

// API 설정
const baseURL = getApiBaseUrl()
export const apiConfig = {
  baseURL: baseURL,
  timeout: 30000, // 30초
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
}

// 현재 환경 정보
export const appEnv = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE,
  appEnv: import.meta.env.VITE_APP_ENV || 'development'
}

// API 엔드포인트 헬퍼 함수
// axios는 baseURL과 url을 자동으로 결합하므로, 상대 경로만 반환해야 함
export const getApiUrl = (endpoint: string): string => {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint
  }
  return endpoint.startsWith('/') ? endpoint : `/${endpoint}`
}

