import { defineStore } from 'pinia'
import { ApiStoreHelper, BaseStoreState } from '../utils/apiStore'

// 백엔드 스키마(MGMT_CCTV)와 동일한 타입
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
  link_id_s: string
  link_id_e: string
  vlink_id_s: string
  vlink_id_e: string
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
  hls_emergency: string | null
  ftp_sent_date: string | null
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
        link_id_s: data.link_id_s || '',
        link_id_e: data.link_id_e || '',
        vlink_id_s: data.vlink_id_s || '',
        vlink_id_e: data.vlink_id_e || '',
        road_id: data.road_id || '',
        road_name: data.road_name || '',
        milepost: data.milepost?.toString() || '',
        bound: data.bound || '',
        lat: data.lat?.toString() || '',
        lng: data.lng?.toString() || '',
        fileurl_wmv: data.fileurl_wmv || '',
        fileurl_mp4: data.fileurl_mp4 || '',
        fileurl_img: data.fileurl_img || '',
        stat: data.stat || 'N',
        alive: data.alive || 'N',
        alive_yn: data.alive_yn || 'N',
        update_date: data.update_date || null,
        last_cctv_time: data.last_cctv_time || null,
        hls_url: data.hls_url || '',
        hls_alive: data.hls_alive || 'N',
        hls_duration: data.hls_duration?.toString() || '0',
        hls_emergency: data.hls_emergency ?? null,
        ftp_sent_date: data.ftp_sent_date || null,
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
        link_id_s: data.link_id_s,
        link_id_e: data.link_id_e,
        vlink_id_s: data.vlink_id_s,
        vlink_id_e: data.vlink_id_e,
        road_id: data.road_id,
        road_name: data.road_name,
        milepost: data.milepost,
        bound: data.bound,
        lat: data.lat,
        lng: data.lng,
        fileurl_wmv: data.fileurl_wmv,
        fileurl_mp4: data.fileurl_mp4,
        fileurl_img: data.fileurl_img,
        stat: data.stat,
        alive: data.alive,
        alive_yn: data.alive_yn,
        update_date: data.update_date,
        last_cctv_time: data.last_cctv_time,
        hls_url: data.hls_url,
        hls_alive: data.hls_alive,
        hls_duration: data.hls_duration,
        hls_emergency: data.hls_emergency,
        ftp_sent_date: data.ftp_sent_date,
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

