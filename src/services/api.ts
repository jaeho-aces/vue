/**
 * API 클라이언트 설정
 * Axios를 사용한 HTTP 클라이언트
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { apiConfig, getApiUrl } from '../config/api'
import { useAuthStore } from '../stores/auth'

// FastAPI 전용 Axios 인스턴스 생성 (baseURL 없음 - 프록시가 /api 경로를 처리)
const fastApiClient: AxiosInstance = axios.create({
  baseURL: '',
  timeout: apiConfig.timeout,
  headers: apiConfig.headers,
  withCredentials: true  // httpOnly 쿠키 전송/수신
})

// 공용 Axios 인스턴스 (일반 API 호출용, 로그인/인증 API 포함)
const apiClient: AxiosInstance = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  headers: apiConfig.headers,
  withCredentials: true  // httpOnly 쿠키 전송/수신
})

// FastAPI 클라이언트 요청 인터셉터 (인증은 httpOnly 쿠키로 자동 전송)
fastApiClient.interceptors.request.use(
  (config) => config,
  (error: AxiosError) => Promise.reject(error)
)

// FastAPI 클라이언트 응답 인터셉터
fastApiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
    }
    return Promise.reject(error)
  }
)

// 공용 클라이언트 요청 인터셉터 (인증은 httpOnly 쿠키로 자동 전송)
apiClient.interceptors.request.use(
  (config) => config,
  (error: AxiosError) => Promise.reject(error)
)

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const requestUrl = error.config?.url ?? ''
    const isAuthMe = /\/api\/auth\/me\/?$/.test(requestUrl)
    const status = error.response?.status
    if (!(isAuthMe && status === 401) && status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
    }
    return Promise.reject(error)
  }
)

// FastAPI 백엔드용 API 헬퍼 함수들
const fastApiApi = {
  // FastAPI /get-db-array를 사용한 데이터 조회
  getDbArray: <T = any>(tableName: string, params: any): Promise<AxiosResponse<T[]>> => {
    const requestData = {
      target: `/${tableName}/`,
      layout: params.layout || [{ field: '*' }],
      query: params.query || [],
      where: params.where || '',
      order: params.order || ''
    }
    // 프록시를 통해 /api 경로를 FastAPI 서버로 전달
    return fastApiClient.post<T[]>('/api/get-db-array', requestData)
  },

  // FastAPI /rest-access-page를 사용한 REST API 호출
  // DELETE 시 key: 단일 키 문자열 또는 복합 키 객체(예: { GRP_GBN: 'C', GRP_CODE: 'test', CODE: 'test' })
  restAccess: <T = any>(tableName: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', data?: any, key?: string | Record<string, string>): Promise<AxiosResponse<T>> => {
    const url = `/api/rest-access-page/${tableName}`
    
    if (method === 'GET') {
      return fastApiClient.get<T>(url, { params: data })
    } else if (method === 'DELETE') {
      const params = (key != null && typeof key === 'object' && !Array.isArray(key))
        ? key
        : { key: key || data }
      return fastApiClient.delete<T>(url, { params })
    } else {
      return fastApiClient[method.toLowerCase() as 'post' | 'put']<T>(url, data)
    }
  }
}

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
  },

  // FastAPI 백엔드 전용 API
  fastapi: fastApiApi,

  /** 썸네일 전송 이력 (채널별·날짜별). hourly: 24개, minutes(선택): 1440개(분 단위 성공 0/1). 백엔드 준비 전 mock 반환 */
  getTransferHistory: async (chId: string, date: string): Promise<{ hourly: number[]; minutes?: number[] }> => {
    try {
      const res = await fastApiClient.get<{ hourly: number[]; minutes?: number[] }>('/api/transfer-history', {
        params: { ch_id: chId, date }
      })
      const data = res.data
      if (data?.hourly?.length === 24) return data
      return mockTransferHistory()
    } catch {
      return mockTransferHistory()
    }
  },

  /** 채널 접속 이력 (채널별·날짜별). hourly: 24시간별 접속 건수, minutes(선택): 1440 분 단위 접속 0/1. 백엔드 준비 전 mock 반환 */
  getConnectionHistory: async (chId: string, date: string): Promise<{ hourly: number[]; minutes?: number[] }> => {
    try {
      const res = await fastApiClient.get<{ hourly: number[]; minutes?: number[] }>('/api/connection-history', {
        params: { ch_id: chId, date }
      })
      const data = res.data
      if (data?.hourly?.length === 24) return data
      return mockConnectionHistory()
    } catch {
      return mockConnectionHistory()
    }
  }
}

function mockTransferHistory(): { hourly: number[]; minutes: number[] } {
  const hourly = Array.from({ length: 24 }, () => Math.floor(Math.random() * 61))
  const minutes: number[] = []
  for (let h = 0; h < 24; h++) {
    const count = hourly[h]
    const slot: number[] = Array.from({ length: 60 }, (_, i) => (i < count ? 1 : 0))
    for (let i = 59; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const t = slot[i]
      slot[i] = slot[j]
      slot[j] = t
    }
    minutes.push(...slot)
  }
  return { hourly, minutes }
}

function mockConnectionHistory(): { hourly: number[]; minutes: number[] } {
  const hourly = Array.from({ length: 24 }, () => Math.floor(Math.random() * 201))
  const minutes: number[] = []
  for (let h = 0; h < 24; h++) {
    const count = hourly[h]
    const slot: number[] = Array(60).fill(0)
    for (let i = 0; i < count; i++) {
      slot[Math.floor(Math.random() * 60)] += 1
    }
    minutes.push(...slot)
  }
  return { hourly, minutes }
}

// 기본 export
export default apiClient

