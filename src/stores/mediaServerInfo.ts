import { defineStore } from 'pinia'
import { ApiStoreHelper, BaseStoreState } from '../utils/apiStore'
import { api } from '../services/api'

// 백엔드 스키마와 동일한 타입 (변환 없이 사용)
export interface MediaServer {
  id?: number
  fms_id: string
  fms_name: string
  fms_ip: string
  fms_ext_ip: string | null
  fms_con_id: string
  fms_passwd: string
  fms_port: number
  svr_type: string
  alive: string
  alive_time: string | null
  created_at?: string
  updated_at?: string
}

interface MediaServerInfoState {
  items: MediaServer[]
  isLoading: boolean
  error: string | null
  lastFetched: number | null // 마지막 로드 시간 (캐싱용)
}

export const useMediaServerInfoStore = defineStore('mediaServerInfo', {
  state: (): MediaServerInfoState => ({
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
      return state.items.find(item => item.fms_id === id)
    },
    
    // 검색
    search: (state) => (query: string) => {
      const lowerQuery = query.toLowerCase()
      return state.items.filter(item =>
        item.fms_id.toLowerCase().includes(lowerQuery) ||
        item.fms_name.toLowerCase().includes(lowerQuery) ||
        item.fms_ip.toLowerCase().includes(lowerQuery) ||
        item.svr_type.toLowerCase().includes(lowerQuery)
      )
    }
  },

  actions: {
    // 헬퍼 인스턴스 생성 (변환 함수 없음)
    getHelper() {
      return new ApiStoreHelper<MediaServer, MediaServer>(
        '/media-server-info', // 백엔드 API 엔드포인트 (필요시 수정)
        null, // 변환 함수 없음
        null, // 변환 함수 없음
        this.$state as BaseStoreState<MediaServer>
      )
    },

    // 데이터 목록 가져오기
    async fetchMediaServers(forceRefresh = false) {
      await this.getHelper().fetchAll(forceRefresh, 5 * 60 * 1000, '미디어 서버 정보 데이터')
    },

    // 데이터 생성
    async createMediaServer(data: MediaServer) {
      return await this.getHelper().create(data)
    },

    // 데이터 수정
    async updateMediaServer(serverId: string, data: Partial<MediaServer>) {
      if (this.isLoading) {
        console.warn('이미 처리 중인 요청이 있습니다.')
        return
      }

      try {
        this.isLoading = true
        this.error = null
        const apiData = { ...data, fms_id: serverId }
        
        console.log('수정 요청 데이터:', apiData)
        
        const response = await api.put<MediaServer>(
          `/media-server-info/${serverId}`,
          apiData
        )
        
        const index = this.items.findIndex(item => item.fms_id === serverId)
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
    async deleteMediaServer(serverId: string) {
      if (this.isLoading) {
        console.warn('이미 처리 중인 요청이 있습니다.')
        return
      }

      try {
        this.isLoading = true
        this.error = null
        await api.delete(`/media-server-info/${serverId}`)
        
        this.items = this.items.filter(item => item.fms_id !== serverId)
        this.lastFetched = Date.now()
        
        console.log('데이터 삭제 완료:', serverId)
      } catch (error: any) {
        console.error('데이터 삭제 실패:', error)
        this.error = this.getHelper().parseBackendError(error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 여러 개 삭제
    async deleteMediaServers(serverIds: string[]) {
      if (this.isLoading) {
        console.warn('이미 처리 중인 요청이 있습니다.')
        return
      }

      try {
        this.isLoading = true
        this.error = null
        const deletePromises = serverIds.map(id => api.delete(`/media-server-info/${id}`))
        
        await Promise.all(deletePromises)
        
        this.items = this.items.filter(item => !serverIds.includes(item.fms_id))
        this.lastFetched = Date.now()
        
        console.log('데이터 삭제 완료:', serverIds.length, '개')
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

