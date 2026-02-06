import { defineStore } from 'pinia'
import { ApiStoreHelper, BaseStoreState } from '../utils/apiStore'

// 백엔드 스키마와 동일한 타입 (변환 없이 사용)
export interface VideoConversionServer {
  trans_id: string
  trans_name: string
  trans_ip: string
  trans_port: number
  alive: string | null
  alive_time: string | null
  json_job: string
  json_yn: string
  json_date: string | null
  version: string
  build_date: string | null
  start_date: string | null
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
    // 백엔드 API 응답을 프론트엔드 형식으로 변환
    transformFromAPI(data: any): VideoConversionServer {
      return {
        trans_id: data.trans_id || '',
        trans_name: data.trans_name || '',
        trans_ip: data.trans_ip || '',
        trans_port: data.trans_port !== undefined ? Number(data.trans_port) : 0,
        alive: data.alive || 'N',
        alive_time: data.alive_time || null,
        json_job: data.json_job || '',
        json_yn: data.json_yn || 'N',
        json_date: data.json_date || null,
        version: data.version || '',
        build_date: data.build_date || null,
        start_date: data.start_date || null
      }
    },

    // 프론트엔드 데이터를 백엔드 API 형식으로 변환
    transformToAPI(data: any): any {
      return {
        trans_id: data.trans_id,
        trans_name: data.trans_name,
        trans_ip: data.trans_ip,
        trans_port: data.trans_port,
        alive: data.alive,
        alive_time: data.alive_time,
        json_job: data.json_job,
        json_yn: data.json_yn,
        json_date: data.json_date,
        version: data.version,
        build_date: data.build_date,
        start_date: data.start_date
      }
    },

    // 헬퍼 인스턴스 생성
    getHelper() {
      return new ApiStoreHelper<VideoConversionServer, VideoConversionServer>(
        '/video-conversion-server-info',
        this.transformFromAPI.bind(this),
        this.transformToAPI.bind(this),
        this.$state as BaseStoreState<VideoConversionServer>
      )
    },

    // PHP 테이블 정보
    getPhpTableName() {
      return 'MGMT_TRANS'
    },

    getPhpTableKey() {
      return 'TRANS_ID'
    },

    // 데이터 목록 가져오기 - PHP 백엔드 사용
    async fetchVideoConversionServers(forceRefresh = false) {
      await this.getHelper().fetchAll(
        forceRefresh,
        5 * 60 * 1000,
        '영상변환서버 정보 데이터',
        this.getPhpTableName()
      )
    },

    // 데이터 생성 - PHP 백엔드 사용
    async createVideoConversionServer(data: VideoConversionServer) {
      return await this.getHelper().create(
        data,
        this.getPhpTableName(),
        this.getPhpTableKey()
      )
    },

    // 데이터 수정 - PHP 백엔드 사용
    async updateVideoConversionServer(serverId: string, data: Partial<VideoConversionServer>) {
      return await this.getHelper().update(
        serverId,
        data,
        this.getPhpTableName(),
        this.getPhpTableKey()
      )
    },

    // 데이터 삭제 - PHP 백엔드 사용
    async deleteVideoConversionServer(serverId: string) {
      await this.getHelper().delete(
        serverId,
        this.getPhpTableName(),
        this.getPhpTableKey()
      )
    },

    // 여러 개 삭제 - PHP 백엔드 사용
    async deleteVideoConversionServers(serverIds: string[]) {
      await this.getHelper().deleteMany(
        serverIds,
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

