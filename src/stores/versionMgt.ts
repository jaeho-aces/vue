import { defineStore } from 'pinia'
import { ApiStoreHelper, BaseStoreState } from '../utils/apiStore'
import { api } from '../services/api'

// 백엔드 스키마와 동일한 타입 (변환 없이 사용)
export interface Version {
  id?: number
  version_id: string
  product_name: string
  version: string
  storage_path: string | null
  release_date: string | null
  created_at?: string
  updated_at?: string
}

interface VersionMgtState {
  items: Version[]
  isLoading: boolean
  error: string | null
  lastFetched: number | null // 마지막 로드 시간 (캐싱용)
}

export const useVersionMgtStore = defineStore('versionMgt', {
  state: (): VersionMgtState => ({
    items: [],
    isLoading: false,
    error: null,
    lastFetched: null
  }),

  getters: {
    // 전체 개수
    totalCount: (state) => state.items.length,
    
    // ID로 찾기
    getById: (state) => (id: string) => {
      return state.items.find(item => item.version_id === id)
    },
    
    // 제품명으로 필터링
    getByProduct: (state) => (productName: string) => {
      return state.items.filter(item => 
        item.product_name.toLowerCase().includes(productName.toLowerCase())
      )
    },
    
    // 검색
    search: (state) => (query: string) => {
      const lowerQuery = query.toLowerCase()
      return state.items.filter(item =>
        item.version_id.toLowerCase().includes(lowerQuery) ||
        item.product_name.toLowerCase().includes(lowerQuery) ||
        item.version.toLowerCase().includes(lowerQuery)
      )
    }
  },

  actions: {
    // 헬퍼 인스턴스 생성 (변환 함수 없음)
    getHelper() {
      return new ApiStoreHelper<Version, Version>(
        '/version-mgt',
        null, // 변환 함수 없음
        null, // 변환 함수 없음
        this.$state as BaseStoreState<Version>
      )
    },

    // 데이터 목록 가져오기
    async fetchVersions(forceRefresh = false) {
      await this.getHelper().fetchAll(forceRefresh, 5 * 60 * 1000, '버전 관리 데이터')
    },

    // 데이터 생성
    async createVersion(data: Version) {
      return await this.getHelper().create(data)
    },

    // 데이터 수정
    async updateVersion(versionId: string, data: Partial<Version>) {
      if (this.isLoading) {
        console.warn('이미 처리 중인 요청이 있습니다.')
        return
      }

      try {
        this.isLoading = true
        this.error = null
        const apiData = { ...data, version_id: versionId }
        
        console.log('수정 요청 데이터:', apiData)
        
        const response = await api.put<Version>(
          `/version-mgt/${versionId}`,
          apiData
        )
        
        const index = this.items.findIndex(item => item.version_id === versionId)
        if (index !== -1) {
          this.items[index] = response.data
        }
        this.lastFetched = Date.now()
        
        console.log('데이터 수정 완료:', response.data)
        return response.data
      } catch (error: any) {
        console.error('데이터 수정 실패:', error)
        this.error = this.getHelper().parseBackendError(error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 데이터 삭제
    async deleteVersion(versionId: string) {
      if (this.isLoading) {
        console.warn('이미 처리 중인 요청이 있습니다.')
        return
      }

      try {
        this.isLoading = true
        this.error = null
        await api.delete(`/version-mgt/${versionId}`)
        
        this.items = this.items.filter(item => item.version_id !== versionId)
        this.lastFetched = Date.now()
        
        console.log('데이터 삭제 완료:', versionId)
      } catch (error: any) {
        console.error('데이터 삭제 실패:', error)
        this.error = this.getHelper().parseBackendError(error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 여러 개 삭제
    async deleteVersions(versionIds: string[]) {
      if (this.isLoading) {
        console.warn('이미 처리 중인 요청이 있습니다.')
        return
      }

      try {
        this.isLoading = true
        this.error = null
        const deletePromises = versionIds.map(id => api.delete(`/version-mgt/${id}`))
        
        await Promise.all(deletePromises)
        
        this.items = this.items.filter(item => !versionIds.includes(item.version_id))
        this.lastFetched = Date.now()
        
        console.log('데이터 삭제 완료:', versionIds.length, '개')
      } catch (error: any) {
        console.error('데이터 삭제 실패:', error)
        this.error = this.getHelper().parseBackendError(error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 스토어 초기화
    clear() {
      this.items = []
      this.error = null
      this.lastFetched = null
    }
  }
})

