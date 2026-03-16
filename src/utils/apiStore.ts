/**
 * 공통 API 스토어 유틸리티
 * Pinia 스토어에서 공통으로 사용하는 API 호출 로직을 제공
 */

import { api } from '../services/api'
import type { AxiosResponse } from 'axios'

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

  // 데이터 목록 가져오기 (공통) - FastAPI 백엔드용
  async fetchAll(
    forceRefresh = false,
    cacheDuration = 5 * 60 * 1000,
    _logPrefix = '데이터',
    tableName?: string // FastAPI 테이블 이름
  ) {
    // 캐싱 체크
    if (!forceRefresh && this.state.lastFetched &&
        Date.now() - this.state.lastFetched < cacheDuration) {
      return
    }

    try {
      this.state.isLoading = true
      this.state.error = null
      
      // FastAPI /get-db-array를 사용하여 데이터 조회
      // tableName이 제공되면 FastAPI API 사용, 아니면 기존 방식 사용
      let allItems: TApiResponse[]
      
      if (tableName) {
        // FastAPI 백엔드 사용
        const response = await api.fastapi.getDbArray<TApiResponse>(tableName, {
          layout: [{ field: '*' }],
          query: [],
          where: '',
          order: ''
        })
        allItems = Array.isArray(response.data) ? response.data : []
        
        // FastAPI에서 받은 데이터는 이미 소문자로 변환되어 있음
      } else {
        // 기존 FastAPI 방식 (하위 호환성)
        const firstResponse = await api.get<PaginatedResponse<TApiResponse>>(
          this.endpoint,
          { params: { page: 1, page_size: 100 } }
        )
        
        const total = firstResponse.data.total
        allItems = []
        const pageSize = 1000
        const totalPages = Math.ceil(total / pageSize)
        
        for (let page = 1; page <= totalPages; page++) {
          const response = await api.get<PaginatedResponse<TApiResponse>>(
            this.endpoint,
            { params: { page, page_size: pageSize } }
          )
          allItems.push(...response.data.items)
        }
      }
      
      // 변환 후 저장 (변환 함수가 없으면 그대로 사용)
      this.state.items = this.transformFromAPI 
        ? allItems.map(this.transformFromAPI) 
        : (allItems as any)
      this.state.lastFetched = Date.now()
    } catch (error: any) {
      this.state.error = this.parseBackendError(error)
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        this.state.error = '백엔드 서버에 연결할 수 없습니다.'
      }
    } finally {
      this.state.isLoading = false
    }
  }

  // 데이터 생성 (공통) - FastAPI 백엔드용
  async create(data: TFrontend, tableName?: string, _tableKey?: string) {
    if (this.state.isLoading) return

    try {
      this.state.isLoading = true
      this.state.error = null
      const apiData = this.transformToAPI ? this.transformToAPI(data) : data

      let response: AxiosResponse<TApiResponse>
      if (tableName) {
        // FastAPI REST API 사용
        response = await api.fastapi.restAccess<TApiResponse>(tableName, 'POST', apiData)
      } else {
        // 기존 FastAPI 방식
        response = await api.post<TApiResponse>(this.endpoint, apiData)
      }
      
      const newItem = this.transformFromAPI 
        ? this.transformFromAPI(response.data) 
        : (response.data as any)
      this.state.items.push(newItem)
      this.state.lastFetched = Date.now()
      return response.data
    } catch (error: any) {
      this.state.error = this.parseBackendError(error)
      throw error
    } finally {
      this.state.isLoading = false
    }
  }

  // 데이터 수정 (공통 - ID 기반) - FastAPI 백엔드용
  async update(id: string, data: Partial<TFrontend>, tableName?: string, tableKey?: string) {
    if (this.state.isLoading) return

    try {
      this.state.isLoading = true
      this.state.error = null
      const updateKeyField = tableKey || 'id'
      const apiData = this.transformToAPI
        ? this.transformToAPI({ ...data, [updateKeyField]: id } as TFrontend)
        : { ...data, [updateKeyField]: id }

      let response: AxiosResponse<TApiResponse>
      if (tableName) {
        // FastAPI REST API 사용
        response = await api.fastapi.restAccess<TApiResponse>(tableName, 'PUT', apiData)
      } else {
        // 기존 FastAPI 방식
        response = await api.put<TApiResponse>(
          `${this.endpoint}/${id}`,
          apiData
        )
      }
      
      const findKeyField = tableKey || 'id'
      const index = this.state.items.findIndex(item => (item as any)[findKeyField] === id)
      if (index !== -1) {
        this.state.items[index] = this.transformFromAPI 
          ? this.transformFromAPI(response.data)
          : (response.data as any)
      }
      this.state.lastFetched = Date.now()
      return response.data
    } catch (error: any) {
      this.state.error = this.parseBackendError(error)
      throw error
    } finally {
      this.state.isLoading = false
    }
  }

  // 데이터 삭제 (공통 - ID 기반) - FastAPI 백엔드용
  // id: 단일 키 문자열 또는 복합 키 객체(예: { GRP_GBN: 'C', GRP_CODE: 'test', CODE: 'test' })
  async delete(id: string | Record<string, string>, tableName?: string, tableKey?: string) {
    if (this.state.isLoading) return

    try {
      this.state.isLoading = true
      this.state.error = null
      
      if (tableName) {
        // FastAPI REST API 사용 (복합 키는 객체로 전달 시 쿼리 파라미터로 각 키 전송)
        await api.fastapi.restAccess(tableName, 'DELETE', undefined, id)
      } else {
        // 기존 FastAPI 방식
        await api.delete(`${this.endpoint}/${typeof id === 'string' ? id : (id as any).id}`)
      }
      
      const deleteKeyField = tableKey || 'id'
      if (typeof id === 'string') {
        this.state.items = this.state.items.filter(item => (item as any)[deleteKeyField] !== id)
      }
      this.state.lastFetched = Date.now()
    } catch (error: any) {
      this.state.error = this.parseBackendError(error)
      throw error
    } finally {
      this.state.isLoading = false
    }
  }

  // 여러 개 삭제 (공통) - FastAPI 백엔드용
  async deleteMany(ids: string[], tableName?: string, tableKey?: string) {
    if (this.state.isLoading) return

    try {
      this.state.isLoading = true
      this.state.error = null
      
      const deletePromises = ids.map(id => {
        if (tableName) {
          return api.fastapi.restAccess(tableName, 'DELETE', undefined, id)
        } else {
          return api.delete(`${this.endpoint}/${id}`)
        }
      })
      
      await Promise.all(deletePromises)
      
      const keyField = tableKey || 'id'
      const keyLower = keyField.toLowerCase()
      this.state.items = this.state.items.filter(item => {
        const idVal = (item as any)[keyField] ?? (item as any)[keyLower]
        return !ids.includes(idVal)
      })
      this.state.lastFetched = Date.now()
    } catch (error: any) {
      this.state.error = this.parseBackendError(error)
      throw error
    } finally {
      this.state.isLoading = false
    }
  }
}

