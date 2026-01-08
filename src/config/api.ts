/**
 * API 설정 및 기본 URL 관리
 */

// 환경 변수에서 API 기본 URL 가져오기
const getApiBaseUrl = (): string => {
  // Vite는 import.meta.env를 사용하여 환경 변수에 접근
  const baseUrl = import.meta.env.VITE_API_BASE_URL
  
  if (!baseUrl) {
    // 기본값: 개발 환경
    if (import.meta.env.DEV) {
      return 'http://localhost:8000/api'
    }
    // 프로덕션 환경에서는 상대 경로 사용
    return '/api'
  }
  
  // baseUrl이 /api로 끝나지 않으면 추가
  if (!baseUrl.endsWith('/api')) {
    return baseUrl.endsWith('/') ? `${baseUrl}api` : `${baseUrl}/api`
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

// API 설정 로깅 (개발 환경)
if (import.meta.env.DEV) {
  console.log('[API Config]', {
    baseURL: baseURL,
    env: {
      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
      MODE: import.meta.env.MODE,
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD
    }
  })
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
  // endpoint가 이미 전체 URL인 경우 (외부 API 호출 시)
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    if (import.meta.env.DEV) {
      console.log('[getApiUrl] 전체 URL 사용:', endpoint)
    }
    return endpoint
  }
  
  // 상대 경로만 반환 (axios가 baseURL과 자동 결합)
  // endpoint가 /로 시작하는지 확인
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  
  // URL 구성 로깅 (개발 환경)
  if (import.meta.env.DEV) {
    console.log('[getApiUrl] URL 구성:', {
      endpoint: endpoint,
      baseURL: apiConfig.baseURL,
      path: path,
      finalUrl: `${apiConfig.baseURL}${path}` // 최종 URL은 baseURL + path
    })
  }
  
  return path
}

