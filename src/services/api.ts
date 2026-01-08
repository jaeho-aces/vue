/**
 * API 클라이언트 설정
 * Axios를 사용한 HTTP 클라이언트
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { apiConfig, getApiUrl } from '../config/api'
import { useAuthStore } from '../stores/auth'

// Axios 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  headers: apiConfig.headers
})

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    // 인증 토큰 추가
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    
    // 상세 요청 로깅 (개발 환경)
    if (import.meta.env.DEV) {
      const fullURL = `${config.baseURL || ''}${config.url || ''}`
      console.group(`[API Request] ${config.method?.toUpperCase()} ${fullURL}`)
      console.log('Base URL:', config.baseURL)
      console.log('URL:', config.url)
      console.log('Full URL:', fullURL)
      console.log('Params:', config.params)
      console.log('Headers:', config.headers)
      console.log('Data:', config.data)
      console.log('Timeout:', config.timeout)
      console.groupEnd()
    }
    
    return config
  },
  (error: AxiosError) => {
    console.error('[API Request Error]', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      config: error.config
    })
    return Promise.reject(error)
  }
)

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // 상세 응답 로깅 (개발 환경)
    if (import.meta.env.DEV) {
      const fullURL = `${response.config.baseURL || ''}${response.config.url || ''}`
      console.group(`[API Response] ${response.config.method?.toUpperCase()} ${fullURL}`)
      console.log('Status:', response.status, response.statusText)
      console.log('Headers:', response.headers)
      console.log('Data:', response.data)
      console.log('Config:', {
        baseURL: response.config.baseURL,
        url: response.config.url,
        method: response.config.method,
        params: response.config.params
      })
      console.groupEnd()
    }
    
    return response
  },
  (error: AxiosError) => {
    // 상세 에러 로깅
    const fullURL = error.config ? `${error.config.baseURL || ''}${error.config.url || ''}` : 'Unknown URL'
    
    console.group(`[API Error] ${error.config?.method?.toUpperCase() || 'UNKNOWN'} ${fullURL}`)
    
    if (error.response) {
      // 서버 응답이 있는 경우
      const status = error.response.status
      const data = error.response.data as any
      
      console.error('Status:', status, error.response.statusText)
      console.error('Response Headers:', error.response.headers)
      console.error('Response Data:', data)
      console.error('Request Config:', {
        baseURL: error.config?.baseURL,
        url: error.config?.url,
        method: error.config?.method,
        params: error.config?.params,
        data: error.config?.data
      })
      
      // 401 Unauthorized - 인증 실패
      if (status === 401) {
        console.error('❌ 인증 실패: 로그인이 필요합니다.')
        const authStore = useAuthStore()
        authStore.logout()
      }
      
      // 403 Forbidden - 권한 없음
      if (status === 403) {
        console.error('❌ 접근 권한이 없습니다.')
      }
      
      // 404 Not Found
      if (status === 404) {
        console.error('❌ 요청한 리소스를 찾을 수 없습니다.')
        console.error('확인 사항:')
        console.error('1. 백엔드 서버가 실행 중인지 확인')
        console.error('2. API 엔드포인트 경로가 올바른지 확인')
        console.error('3. 라우터가 올바르게 등록되었는지 확인')
      }
      
      // 500 Internal Server Error
      if (status >= 500) {
        console.error('❌ 서버 오류가 발생했습니다.')
      }
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못한 경우
      console.error('❌ 네트워크 오류 또는 서버 응답 없음')
      console.error('Request:', error.request)
      console.error('Request URL:', fullURL)
      console.error('확인 사항:')
      console.error('1. 백엔드 서버가 실행 중인지 확인 (python main.py)')
      console.error('2. 서버 URL이 올바른지 확인:', error.config?.baseURL)
      console.error('3. CORS 설정이 올바른지 확인')
      console.error('4. 방화벽이나 네트워크 설정 확인')
      console.error('5. 브라우저 개발자 도구 > Network 탭에서 요청 상태 확인')
    } else {
      // 요청 설정 중 오류 발생
      console.error('❌ 요청 설정 오류')
      console.error('Message:', error.message)
      console.error('Code:', error.code)
      console.error('Config:', error.config)
    }
    
    console.groupEnd()
    
    return Promise.reject(error)
  }
)

// API 메서드 래퍼 함수들
export const api = {
  // GET 요청
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.get<T>(getApiUrl(url), config)
  },
  
  // POST 요청
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.post<T>(getApiUrl(url), data, config)
  },
  
  // PUT 요청
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.put<T>(getApiUrl(url), data, config)
  },
  
  // PATCH 요청
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.patch<T>(getApiUrl(url), data, config)
  },
  
  // DELETE 요청
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return apiClient.delete<T>(getApiUrl(url), config)
  }
}

// 기본 export
export default apiClient

