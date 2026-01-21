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
    // 백엔드 API 응답을 프론트엔드 형식으로 변환
    transformFromAPI(data: any): MediaServer {
      return {
        id: data.id,
        fms_id: data.fms_id || '',
        fms_name: data.fms_name || '',
        fms_ip: data.fms_ip || '',
        fms_ext_ip: data.fms_ext_ip,
        fms_con_id: data.fms_con_id || '',
        fms_passwd: data.fms_passwd || '',
        fms_port: data.fms_port || 0,
        svr_type: data.svr_type || '',
        alive: data.alive || '',
        alive_time: data.alive_time,
        created_at: data.created_at,
        updated_at: data.updated_at
      }
    },

    // 프론트엔드 데이터를 백엔드 API 형식으로 변환
    transformToAPI(data: any): any {
      return {
        fms_id: data.fms_id,
        fms_name: data.fms_name,
        fms_ip: data.fms_ip,
        fms_ext_ip: data.fms_ext_ip,
        fms_con_id: data.fms_con_id,
        fms_passwd: data.fms_passwd,
        fms_port: data.fms_port,
        svr_type: data.svr_type,
        alive: data.alive,
        alive_time: data.alive_time
      }
    },

    // 헬퍼 인스턴스 생성
    getHelper() {
      return new ApiStoreHelper<MediaServer, MediaServer>(
        '/media-server-info',
        this.transformFromAPI.bind(this),
        this.transformToAPI.bind(this),
        this.$state as BaseStoreState<MediaServer>
      )
    },

    // PHP 테이블 정보
    getPhpTableName() {
      return 'MGMT_FMS'
    },

    getPhpTableKey() {
      return 'FMS_ID'
    },

    // 데이터 목록 가져오기 - PHP 백엔드 사용
    async fetchMediaServers(forceRefresh = false) {
      await this.getHelper().fetchAll(
        forceRefresh, 
        5 * 60 * 1000, 
        '미디어 서버 정보 데이터',
        this.getPhpTableName()
      )
    },

    // 데이터 생성 - PHP 백엔드 사용
    async createMediaServer(data: MediaServer) {
      return await this.getHelper().create(
        data,
        this.getPhpTableName(),
        this.getPhpTableKey()
      )
    },

    // 데이터 수정 - PHP 백엔드 사용
    async updateMediaServer(serverId: string, data: Partial<MediaServer>) {
      return await this.getHelper().update(
        serverId,
        data,
        this.getPhpTableName(),
        this.getPhpTableKey()
      )
    },

    // 데이터 삭제 - PHP 백엔드 사용
    async deleteMediaServer(serverId: string) {
      await this.getHelper().delete(
        serverId,
        this.getPhpTableName(),
        this.getPhpTableKey()
      )
    },

    // 여러 개 삭제 - PHP 백엔드 사용
    async deleteMediaServers(serverIds: string[]) {
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

