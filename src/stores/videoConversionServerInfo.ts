import { defineStore } from 'pinia'
import { ApiStoreHelper, BaseStoreState } from '../utils/apiStore'
import { api } from '../services/api'

// 백엔드 스키마와 동일한 타입 (변환 없이 사용)
export interface VideoConversionServer {
  id?: number
  trans_id: string
  trans_name: string
  trans_ip: string
  trans_port: number
  alive: string | boolean
  alive_time: string | null
  json_job: string | null
  json_yn: string | boolean
  json_date: string | null
  version: string
  build_date: string | null
  start_date: string | null
  reg_date: string | null
  created_at?: string
  updated_at?: string
}

interface VideoConversionServerInfoState {
  items: VideoConversionServer[]
  isLoading: boolean
  error: string | null
  lastFetched: number | null // 마지막 로드 시간 (캐싱용)
}

export const useVideoConversionServerInfoStore = defineStore('videoConversionServerInfo', {
  state: (): VideoConversionServerInfoState => ({
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
      return state.items.find(item => item.trans_id === id)
    },
    
    // 검색
    search: (state) => (query: string) => {
      const lowerQuery = query.toLowerCase()
      return state.items.filter(item =>
        item.trans_id.toLowerCase().includes(lowerQuery) ||
        item.trans_name.toLowerCase().includes(lowerQuery) ||
        item.trans_ip.toLowerCase().includes(lowerQuery)
      )
    }
  },

  actions: {
    // 헬퍼 인스턴스 생성 (변환 함수 없음)
    getHelper() {
      return new ApiStoreHelper<VideoConversionServer, VideoConversionServer>(
        '/video-conversion-server-info', // 백엔드 API 엔드포인트
        null, // 변환 함수 없음
        null, // 변환 함수 없음
        this.$state as BaseStoreState<VideoConversionServer>
      )
    },

    // 데이터 목록 가져오기
    async fetchVideoConversionServers(forceRefresh = false) {
      await this.getHelper().fetchAll(forceRefresh, 5 * 60 * 1000, '영상변환서버 정보 데이터')
    },

    // 데이터 생성
    async createVideoConversionServer(data: VideoConversionServer) {
      return await this.getHelper().create(data)
    },

    // 데이터 수정
    async updateVideoConversionServer(serverId: string, data: Partial<VideoConversionServer>) {
      if (this.isLoading) {
        console.warn('이미 처리 중인 요청이 있습니다.')
        return
      }

      try {
        this.isLoading = true
        this.error = null
        const apiData = { ...data, trans_id: serverId }
        
        console.log('수정 요청 데이터:', apiData)
        
        const response = await api.put<VideoConversionServer>(
          `/video-conversion-server-info/${serverId}`,
          apiData
        )
        
        const index = this.items.findIndex(item => item.trans_id === serverId)
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
    async deleteVideoConversionServer(serverId: string) {
      if (this.isLoading) {
        console.warn('이미 처리 중인 요청이 있습니다.')
        return
      }

      try {
        this.isLoading = true
        this.error = null
        await api.delete(`/video-conversion-server-info/${serverId}`)
        
        this.items = this.items.filter(item => item.trans_id !== serverId)
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
    async deleteVideoConversionServers(serverIds: string[]) {
      if (this.isLoading) {
        console.warn('이미 처리 중인 요청이 있습니다.')
        return
      }

      try {
        this.isLoading = true
        this.error = null
        const deletePromises = serverIds.map(id => api.delete(`/video-conversion-server-info/${id}`))
        
        await Promise.all(deletePromises)
        
        this.items = this.items.filter(item => !serverIds.includes(item.trans_id))
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

