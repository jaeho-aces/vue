import { defineStore } from 'pinia'
import { ApiStoreHelper, BaseStoreState } from '../utils/apiStore'

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
    // 백엔드 API 응답을 프론트엔드 형식으로 변환
    transformFromAPI(data: any): Version {
      return {
        id: data.id,
        version_id: data.key || data.version_id, // key를 version_id로 매핑
        product_name: data.product || data.product_name, // product를 product_name으로 매핑
        version: data.version || data.version,
        storage_path: data.path || data.storage_path, // path를 storage_path로 매핑
        release_date: data.release_date || data.release_date,
        created_at: data.created_at,
        updated_at: data.updated_at
      }
    },

    // 프론트엔드 데이터를 백엔드 API 형식으로 변환
    transformToAPI(data: any): any {
      return {
        key: data.key || data.version_id, // version_id를 key로 매핑
        product: data.product || data.product_name, // product_name을 product로 매핑
        version: data.version,
        path: data.path || data.storage_path, // storage_path를 path로 매핑
        release_date: data.release_date
      }
    },

    // 헬퍼 인스턴스 생성
    getHelper() {
      return new ApiStoreHelper<Version, Version>(
        '/version-mgt',
        this.transformFromAPI.bind(this),
        this.transformToAPI.bind(this),
        this.$state as BaseStoreState<Version>
      )
    },

    // PHP 테이블 정보
    getPhpTableName() {
      return 'MGMT_VERSION'
    },

    getPhpTableKey() {
      return 'KEY'
    },

    // 데이터 목록 가져오기 - PHP 백엔드 사용
    async fetchVersions(forceRefresh = false) {
      await this.getHelper().fetchAll(
        forceRefresh,
        5 * 60 * 1000,
        '버전 관리 데이터',
        this.getPhpTableName()
      )
    },

    // 데이터 생성 - PHP 백엔드 사용
    async createVersion(data: Version) {
      return await this.getHelper().create(
        data,
        this.getPhpTableName(),
        this.getPhpTableKey()
      )
    },

    // 데이터 수정 - PHP 백엔드 사용
    async updateVersion(versionId: string, data: Partial<Version>) {
      return await this.getHelper().update(
        versionId,
        data,
        this.getPhpTableName(),
        this.getPhpTableKey()
      )
    },

    // 데이터 삭제 - PHP 백엔드 사용
    async deleteVersion(versionId: string) {
      await this.getHelper().delete(
        versionId,
        this.getPhpTableName(),
        this.getPhpTableKey()
      )
    },

    // 여러 개 삭제 - PHP 백엔드 사용
    async deleteVersions(versionIds: string[]) {
      await this.getHelper().deleteMany(
        versionIds,
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

