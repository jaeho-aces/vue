import { defineStore } from 'pinia'
import { ApiStoreHelper, BaseStoreState } from '../utils/apiStore'
import { api } from '../services/api'

// 백엔드 스키마와 동일한 타입 (변환 없이 사용)
// 실제 백엔드 필드명은 API 응답을 확인 후 수정 필요
export interface VideoConversion {
  id?: number
  ch_id: string
  hq_code?: string
  branch_code?: string
  route_code?: string
  area?: string
  server_id?: string
  trans_name?: string // 영상변환서버 이름 (조인된 데이터)
  media_server_id?: string
  live_yn?: string
  status?: string
  jpg_yn?: string
  wmv_yn?: string
  send_yn?: string
  save_yn?: string
  format?: string
  size?: string
  fps?: string
  kbps?: string
  wmv_conv_yn?: string
  wmv_size?: string
  wmv_fps?: string
  wmv_kbps?: string
  jpg_res?: string
  max_save?: string
  jpg_kbps?: string
  date_display_yn?: string
  sms_yn?: string
  sms_server?: string
  last_check?: string | null
  reg_date?: string | null
  created_at?: string
  updated_at?: string
}

interface VideoConversionInfoState {
  items: VideoConversion[]
  isLoading: boolean
  error: string | null
  lastFetched: number | null // 마지막 로드 시간 (캐싱용)
}

export const useVideoConversionInfoStore = defineStore('videoConversionInfo', {
  state: (): VideoConversionInfoState => ({
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
      return state.items.find(item => item.ch_id === id)
    },
    
    // 검색
    search: (state) => (query: string) => {
      const lowerQuery = query.toLowerCase()
      return state.items.filter(item =>
        item.ch_id.toLowerCase().includes(lowerQuery) ||
        item.hq_code?.toLowerCase().includes(lowerQuery) ||
        item.branch_code?.toLowerCase().includes(lowerQuery) ||
        item.route_code?.toLowerCase().includes(lowerQuery) ||
        item.area?.toLowerCase().includes(lowerQuery)
      )
    }
  },

  actions: {
    // 헬퍼 인스턴스 생성 (변환 함수 없음)
    getHelper() {
      return new ApiStoreHelper<VideoConversion, VideoConversion>(
        '/video-conversion-info', // 백엔드 API 엔드포인트 (필요시 수정)
        null, // 변환 함수 없음
        null, // 변환 함수 없음
        this.$state as BaseStoreState<VideoConversion>
      )
    },

    // 데이터 목록 가져오기
    async fetchVideoConversions(forceRefresh = false) {
      await this.getHelper().fetchAll(forceRefresh, 5 * 60 * 1000, '영상변환 채널정보 데이터')
    },

    // 데이터 생성
    async createVideoConversion(data: VideoConversion) {
      return await this.getHelper().create(data)
    },

    // 데이터 수정
    async updateVideoConversion(chId: string, data: Partial<VideoConversion>) {
      if (this.isLoading) {
        console.warn('이미 처리 중인 요청이 있습니다.')
        return
      }

      try {
        this.isLoading = true
        this.error = null
        const apiData = { ...data, ch_id: chId }
        
        console.log('수정 요청 데이터:', apiData)
        
        const response = await api.put<VideoConversion>(
          `/video-conversion-info/${chId}`,
          apiData
        )
        
        const index = this.items.findIndex(item => item.ch_id === chId)
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
    async deleteVideoConversion(chId: string) {
      if (this.isLoading) {
        console.warn('이미 처리 중인 요청이 있습니다.')
        return
      }

      try {
        this.isLoading = true
        this.error = null
        await api.delete(`/video-conversion-info/${chId}`)
        
        this.items = this.items.filter(item => item.ch_id !== chId)
        this.lastFetched = Date.now()
        
        console.log('데이터 삭제 완료:', chId)
      } catch (error: any) {
        console.error('데이터 삭제 실패:', error)
        this.error = this.getHelper().parseBackendError(error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 여러 개 삭제
    async deleteVideoConversions(chIds: string[]) {
      if (this.isLoading) {
        console.warn('이미 처리 중인 요청이 있습니다.')
        return
      }

      try {
        this.isLoading = true
        this.error = null
        const deletePromises = chIds.map(id => api.delete(`/video-conversion-info/${id}`))
        
        await Promise.all(deletePromises)
        
        this.items = this.items.filter(item => !chIds.includes(item.ch_id))
        this.lastFetched = Date.now()
        
        console.log('데이터 삭제 완료:', chIds.length, '개')
      } catch (error: any) {
        console.error('데이터 삭제 실패:', error)
        this.error = this.getHelper().parseBackendError(error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 일괄 변경
    async batchUpdateVideoConversions(chIds: string[], data: Partial<VideoConversion>) {
      if (this.isLoading) {
        console.warn('이미 처리 중인 요청이 있습니다.')
        return
      }

      try {
        this.isLoading = true
        this.error = null
        
        const updatePromises = chIds.map(id => 
          api.put<VideoConversion>(`/video-conversion-info/${id}`, { ...data, ch_id: id })
        )
        
        const responses = await Promise.all(updatePromises)
        
        // 목록 업데이트
        responses.forEach(response => {
          const index = this.items.findIndex(item => item.ch_id === response.data.ch_id)
          if (index !== -1) {
            this.items[index] = response.data
          }
        })
        
        this.lastFetched = Date.now()
        
        console.log('일괄 변경 완료:', chIds.length, '개')
        return responses.map(r => r.data)
      } catch (error: any) {
        console.error('일괄 변경 실패:', error)
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

