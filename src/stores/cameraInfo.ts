import { defineStore } from 'pinia'
import { ApiStoreHelper, BaseStoreState } from '../utils/apiStore'

// 백엔드 스키마와 동일한 타입 (변환 없이 사용)
export interface Camera {
  cctv_id: string
  camera_no: string
  hq_code: string
  branch_code: string
  route_code: string
  location: string
  camera_area: string
  enc_url: string
  trans_wms_port: string
  road_name: string
  milepost: string
  lat: string
  lng: string
  fileurl_mp4: string
  stat: string
  alive: string
  hls_url: string
  hls_alive: string
  reg_date: string | null
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
    // 백엔드 API 응답을 프론트엔드 형식으로 변환
    transformFromAPI(data: any): Camera {
      return {
        cctv_id: data.cctv_id || '',
        camera_no: data.camera_no?.toString() || '',
        hq_code: data.hq_code || '',
        branch_code: data.branch_code || '',
        route_code: data.route_code || '',
        location: data.location || '',
        camera_area: data.camera_area || '',
        enc_url: data.enc_url || '',
        trans_wms_port: data.trans_wms_port?.toString() || '',
        road_name: data.road_name || '',
        milepost: data.milepost?.toString() || '',
        lat: data.lat?.toString() || '',
        lng: data.lng?.toString() || '',
        fileurl_mp4: data.fileurl_mp4 || '',
        stat: data.stat || 'N',
        alive: data.alive || 'N',
        hls_url: data.hls_url || '',
        hls_alive: data.hls_alive || 'N',
        reg_date: data.reg_date || null
      }
    },

    // 프론트엔드 데이터를 백엔드 API 형식으로 변환
    transformToAPI(data: any): any {
      return {
        cctv_id: data.cctv_id,
        camera_no: data.camera_no,
        hq_code: data.hq_code,
        branch_code: data.branch_code,
        route_code: data.route_code,
        location: data.location,
        camera_area: data.camera_area,
        enc_url: data.enc_url,
        trans_wms_port: data.trans_wms_port,
        road_name: data.road_name,
        milepost: data.milepost,
        lat: data.lat,
        lng: data.lng,
        fileurl_mp4: data.fileurl_mp4,
        stat: data.stat,
        alive: data.alive,
        hls_url: data.hls_url,
        hls_alive: data.hls_alive,
        reg_date: data.reg_date
      }
    },

    // 헬퍼 인스턴스 생성
    getHelper() {
      return new ApiStoreHelper<Camera, Camera>(
        '/camera-info',
        this.transformFromAPI.bind(this),
        this.transformToAPI.bind(this),
        this.$state as BaseStoreState<Camera>
      )
    },

    // PHP 테이블 정보
    getPhpTableName() {
      return 'MGMT_CCTV'
    },

    getPhpTableKey() {
      return 'CCTV_ID'
    },

    // 데이터 목록 가져오기 - PHP 백엔드 사용
    async fetchCameras(forceRefresh = false) {
      await this.getHelper().fetchAll(
        forceRefresh,
        5 * 60 * 1000,
        '카메라 정보 데이터',
        this.getPhpTableName()
      )
    },

    // 데이터 생성 - PHP 백엔드 사용
    async createCamera(data: Camera) {
      return await this.getHelper().create(
        data,
        this.getPhpTableName(),
        this.getPhpTableKey()
      )
    },

    // 데이터 수정 - PHP 백엔드 사용
    async updateCamera(cameraId: string, data: Partial<Camera>) {
      return await this.getHelper().update(
        cameraId,
        data,
        this.getPhpTableName(),
        this.getPhpTableKey()
      )
    },

    // 데이터 삭제 - PHP 백엔드 사용
    async deleteCamera(cameraId: string) {
      await this.getHelper().delete(
        cameraId,
        this.getPhpTableName(),
        this.getPhpTableKey()
      )
    },

    // 여러 개 삭제 - PHP 백엔드 사용
    async deleteCameras(cameraIds: string[]) {
      await this.getHelper().deleteMany(
        cameraIds,
        this.getPhpTableName(),
        this.getPhpTableKey()
      )
    },

    // 스토어 초기화
    clear() {
      this.items = []
      this.error = null
      this.lastFetched = null
    }
  }
})

