import { defineStore } from 'pinia'
import { ApiStoreHelper, BaseStoreState } from '../utils/apiStore'
import { api } from '../services/api'

// 백엔드 스키마와 동일한 타입 (변환 없이 사용)
export interface Camera {
  id?: number
  cctv_id: string
  camera_no: string
  hq_code: string
  branch_code: string
  route_code: string
  location: string
  camera_area: string
  enc_url: string
  trans_wms_port: string
  link_id_s: string
  link_id_e: string
  vlink_id_s?: string
  vlink_id_e?: string
  road_id: string
  road_name: string
  milepost: string
  bound: string
  lat: string
  lng: string
  fileurl_wmv: string
  fileurl_mp4: string
  fileurl_img: string
  stat: string
  alive: string
  alive_yn: string
  update_date: string | null
  last_cctv_time: string | null
  hls_url: string
  hls_alive: string
  hls_duration: string
  hls_emergency: string
  ftp_sent_date: string | null
  reg_date: string | null
  created_at?: string
  updated_at?: string
}

interface CameraInfoState {
  items: Camera[]
  isLoading: boolean
  error: string | null
  lastFetched: number | null // 마지막 로드 시간 (캐싱용)
}

export const useCameraInfoStore = defineStore('cameraInfo', {
  state: (): CameraInfoState => ({
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
      return state.items.find(item => item.cctv_id === id)
    },
    
    // 검색
    search: (state) => (query: string) => {
      const lowerQuery = query.toLowerCase()
      return state.items.filter(item =>
        item.cctv_id.toLowerCase().includes(lowerQuery) ||
        item.camera_no.toLowerCase().includes(lowerQuery) ||
        item.hq_code.toLowerCase().includes(lowerQuery) ||
        item.branch_code.toLowerCase().includes(lowerQuery) ||
        item.route_code.toLowerCase().includes(lowerQuery) ||
        item.location.toLowerCase().includes(lowerQuery) ||
        item.road_name.toLowerCase().includes(lowerQuery)
      )
    }
  },

  actions: {
    // 헬퍼 인스턴스 생성 (변환 함수 없음)
    getHelper() {
      return new ApiStoreHelper<Camera, Camera>(
        '/camera-info',
        null, // 변환 함수 없음
        null, // 변환 함수 없음
        this.$state as BaseStoreState<Camera>
      )
    },

    // 데이터 목록 가져오기
    async fetchCameras(forceRefresh = false) {
      await this.getHelper().fetchAll(forceRefresh, 5 * 60 * 1000, '카메라 정보 데이터')
    },

    // 데이터 생성
    async createCamera(data: Camera) {
      return await this.getHelper().create(data)
    },

    // 데이터 수정
    async updateCamera(cameraId: string, data: Partial<Camera>) {
      if (this.isLoading) {
        console.warn('이미 처리 중인 요청이 있습니다.')
        return
      }

      try {
        this.isLoading = true
        this.error = null
        const apiData = { ...data, cctv_id: cameraId }
        
        console.log('수정 요청 데이터:', apiData)
        
        const response = await api.put<Camera>(
          `/camera-info/${cameraId}`,
          apiData
        )
        
        const index = this.items.findIndex(item => item.cctv_id === cameraId)
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
    async deleteCamera(cameraId: string) {
      if (this.isLoading) {
        console.warn('이미 처리 중인 요청이 있습니다.')
        return
      }

      try {
        this.isLoading = true
        this.error = null
        await api.delete(`/camera-info/${cameraId}`)
        
        this.items = this.items.filter(item => item.cctv_id !== cameraId)
        this.lastFetched = Date.now()
        
        console.log('데이터 삭제 완료:', cameraId)
      } catch (error: any) {
        console.error('데이터 삭제 실패:', error)
        this.error = this.getHelper().parseBackendError(error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 여러 개 삭제
    async deleteCameras(cameraIds: string[]) {
      if (this.isLoading) {
        console.warn('이미 처리 중인 요청이 있습니다.')
        return
      }

      try {
        this.isLoading = true
        this.error = null
        const deletePromises = cameraIds.map(id => api.delete(`/camera-info/${id}`))
        
        await Promise.all(deletePromises)
        
        this.items = this.items.filter(item => !cameraIds.includes(item.cctv_id))
        this.lastFetched = Date.now()
        
        console.log('데이터 삭제 완료:', cameraIds.length, '개')
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

