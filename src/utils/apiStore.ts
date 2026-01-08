/**
 * 공통 API 스토어 유틸리티
 * Pinia 스토어에서 공통으로 사용하는 API 호출 로직을 제공
 */

import { api } from '../services/api'

// 공통 API 응답 타입
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}

// 공통 스토어 상태 인터페이스
export interface BaseStoreState<T> {
  items: T[]
  isLoading: boolean
  error: string | null
  lastFetched: number | null
}

// 공통 API 함수들을 제공하는 헬퍼 클래스
export class ApiStoreHelper<TApiResponse, TFrontend> {
  constructor(
    private endpoint: string,
    private transformFromAPI: ((data: TApiResponse) => TFrontend) | null,
    private transformToAPI: ((data: any) => any) | null,
    private state: BaseStoreState<TFrontend>
  ) {}

  // 백엔드 에러 파싱 (공통)
  parseBackendError(error: any): string {
    if (error.response?.data?.detail) {
      if (Array.isArray(error.response.data.detail)) {
        return error.response.data.detail.map((err: any) => {
          if (typeof err === 'string') return err
          return `${err.loc?.join('.')}: ${err.msg}`
        }).join(', ')
      } else if (typeof error.response.data.detail === 'string') {
        return error.response.data.detail
      } else {
        return JSON.stringify(error.response.data.detail)
      }
    }
    return error.message || '알 수 없는 오류가 발생했습니다.'
  }

  // 데이터 목록 가져오기 (공통)
  async fetchAll(
    forceRefresh = false,
    cacheDuration = 5 * 60 * 1000,
    logPrefix = '데이터'
  ) {
    // 캐싱 체크
    if (!forceRefresh && this.state.lastFetched && 
        Date.now() - this.state.lastFetched < cacheDuration) {
      console.log(`캐시된 ${logPrefix} 사용`)
      return
    }

    try {
      this.state.isLoading = true
      this.state.error = null
      
      // 전체 개수 확인
      const firstResponse = await api.get<PaginatedResponse<TApiResponse>>(
        this.endpoint,
        { params: { page: 1, page_size: 100 } }
      )
      
      const total = firstResponse.data.total
      console.log(`전체 ${logPrefix}: ${total}개`)
      
      // 페이지네이션으로 모든 데이터 가져오기
      const allItems: TApiResponse[] = []
      const pageSize = 1000
      const totalPages = Math.ceil(total / pageSize)
      
      for (let page = 1; page <= totalPages; page++) {
        const response = await api.get<PaginatedResponse<TApiResponse>>(
          this.endpoint,
          { params: { page, page_size: pageSize } }
        )
        allItems.push(...response.data.items)
        console.log(`페이지 ${page}/${totalPages} 로드 완료: ${response.data.items.length}개`)
      }
      
      // 변환 후 저장 (변환 함수가 없으면 그대로 사용)
      this.state.items = this.transformFromAPI 
        ? allItems.map(this.transformFromAPI) 
        : (allItems as any)
      this.state.lastFetched = Date.now()
      
      console.log(`${logPrefix} 로드 완료:`, this.state.items.length, '개')
      // 첫 번째 아이템의 필드명 확인 (디버깅용)
      if (this.state.items.length > 0) {
        console.log(`${logPrefix} 첫 번째 아이템 필드:`, Object.keys(this.state.items[0]))
        console.log(`${logPrefix} 첫 번째 아이템 데이터:`, this.state.items[0])
      }
    } catch (error: any) {
      console.error(`${logPrefix} 로드 실패:`, error)
      this.state.error = this.parseBackendError(error)
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        this.state.error = '백엔드 서버에 연결할 수 없습니다.'
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
        console.error(`서버 URL: ${apiBaseUrl}`)
        console.error('확인 사항:')
        console.error('1. 백엔드 서버가 실행 중인지 확인하세요')
        console.error('2. .env.development 파일의 VITE_API_BASE_URL이 올바른지 확인하세요')
        console.error('3. CORS 설정이 올바른지 확인하세요')
      }
    } finally {
      this.state.isLoading = false
    }
  }

  // 데이터 생성 (공통)
  async create(data: TFrontend) {
    if (this.state.isLoading) {
      console.warn('이미 처리 중인 요청이 있습니다.')
      return
    }

    try {
      this.state.isLoading = true
      this.state.error = null
      const apiData = this.transformToAPI ? this.transformToAPI(data) : data
      
      console.log('생성 요청 데이터:', apiData)
      
      const response = await api.post<TApiResponse>(this.endpoint, apiData)
      
      const newItem = this.transformFromAPI 
        ? this.transformFromAPI(response.data) 
        : (response.data as any)
      this.state.items.push(newItem)
      this.state.lastFetched = Date.now()
      
      console.log('데이터 생성 완료:', response.data)
      return response.data
    } catch (error: any) {
      console.error('데이터 생성 실패:', error)
      this.state.error = this.parseBackendError(error)
      throw error
    } finally {
      this.state.isLoading = false
    }
  }

  // 데이터 수정 (공통 - ID 기반)
  async update(id: string, data: Partial<TFrontend>) {
    if (this.state.isLoading) {
      console.warn('이미 처리 중인 요청이 있습니다.')
      return
    }

    try {
      this.state.isLoading = true
      this.state.error = null
      const apiData = this.transformToAPI 
        ? this.transformToAPI({ ...data, id } as TFrontend)
        : { ...data, id }
      
      console.log('수정 요청 데이터:', apiData)
      
      const response = await api.put<TApiResponse>(
        `${this.endpoint}/${id}`,
        apiData
      )
      
      const index = this.state.items.findIndex(item => (item as any).id === id)
      if (index !== -1) {
        this.state.items[index] = this.transformFromAPI 
          ? this.transformFromAPI(response.data)
          : (response.data as any)
      }
      this.state.lastFetched = Date.now()
      
      console.log('데이터 수정 완료:', response.data)
      return response.data
    } catch (error: any) {
      console.error('데이터 수정 실패:', error)
      this.state.error = this.parseBackendError(error)
      throw error
    } finally {
      this.state.isLoading = false
    }
  }

  // 데이터 삭제 (공통 - ID 기반)
  async delete(id: string) {
    if (this.state.isLoading) {
      console.warn('이미 처리 중인 요청이 있습니다.')
      return
    }

    try {
      this.state.isLoading = true
      this.state.error = null
      await api.delete(`${this.endpoint}/${id}`)
      
      this.state.items = this.state.items.filter(item => (item as any).id !== id)
      this.state.lastFetched = Date.now()
      
      console.log('데이터 삭제 완료:', id)
    } catch (error: any) {
      console.error('데이터 삭제 실패:', error)
      this.state.error = this.parseBackendError(error)
      throw error
    } finally {
      this.state.isLoading = false
    }
  }

  // 여러 개 삭제 (공통)
  async deleteMany(ids: string[]) {
    if (this.state.isLoading) {
      console.warn('이미 처리 중인 요청이 있습니다.')
      return
    }

    try {
      this.state.isLoading = true
      this.state.error = null
      const deletePromises = ids.map(id => api.delete(`${this.endpoint}/${id}`))
      
      await Promise.all(deletePromises)
      
      this.state.items = this.state.items.filter(
        item => !ids.includes((item as any).id)
      )
      this.state.lastFetched = Date.now()
      
      console.log('데이터 삭제 완료:', ids.length, '개')
    } catch (error: any) {
      console.error('데이터 삭제 실패:', error)
      this.state.error = this.parseBackendError(error)
      throw error
    } finally {
      this.state.isLoading = false
    }
  }
}

