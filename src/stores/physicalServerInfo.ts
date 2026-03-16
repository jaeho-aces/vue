import { defineStore } from 'pinia'
import { ApiStoreHelper, BaseStoreState } from '../utils/apiStore'

export interface PhysicalServer {
  ps_id: string
  name: string
  ip: string
  location: string
  vm_count: number | null
  reg_date: string | null
}

interface PhysicalServerInfoState {
  items: PhysicalServer[]
  isLoading: boolean
  error: string | null
  lastFetched: number | null
}

export const usePhysicalServerInfoStore = defineStore('physicalServerInfo', {
  state: (): PhysicalServerInfoState => ({
    items: [],
    isLoading: false,
    error: null,
    lastFetched: null
  }),

  getters: {
    totalCount: (state) => state.items.length,
    getById: (state) => (id: string) => state.items.find(item => item.ps_id === id),
    search: (state) => (query: string) => {
      const lowerQuery = query.toLowerCase()
      return state.items.filter(
        item =>
          item.ps_id.toLowerCase().includes(lowerQuery) ||
          (item.name && item.name.toLowerCase().includes(lowerQuery)) ||
          (item.ip && item.ip.toLowerCase().includes(lowerQuery)) ||
          (item.location && item.location.toLowerCase().includes(lowerQuery))
      )
    }
  },

  actions: {
    transformFromAPI(data: any): PhysicalServer {
      return {
        ps_id: data.ps_id || '',
        name: data.name || '',
        ip: data.ip || '',
        location: data.location || '',
        vm_count: data.vm_count != null ? Number(data.vm_count) : null,
        reg_date: data.reg_date || null
      }
    },

    transformToAPI(data: any): any {
      const out: any = {
        ps_id: data.ps_id,
        name: data.name,
        ip: data.ip,
        location: data.location
      }
      if (data.vm_count != null && data.vm_count !== '') out.vm_count = Number(data.vm_count)
      if (data.reg_date != null && data.reg_date !== '') out.reg_date = data.reg_date
      return out
    },

    getHelper() {
      return new ApiStoreHelper<PhysicalServer, PhysicalServer>(
        '/physical-server-info',
        this.transformFromAPI.bind(this),
        this.transformToAPI.bind(this),
        this.$state as BaseStoreState<PhysicalServer>
      )
    },

    getPhpTableName() {
      return 'MGMT_PHYSICAL_SERVER'
    },

    getPhpTableKey() {
      return 'PS_ID'
    },

    async fetchPhysicalServers(forceRefresh = false) {
      await this.getHelper().fetchAll(
        forceRefresh,
        5 * 60 * 1000,
        '물리 서버 정보',
        this.getPhpTableName()
      )
    },

    async createPhysicalServer(data: PhysicalServer) {
      return await this.getHelper().create(
        data,
        this.getPhpTableName(),
        this.getPhpTableKey()
      )
    },

    async updatePhysicalServer(psId: string, data: Partial<PhysicalServer>) {
      return await this.getHelper().update(
        psId,
        data,
        this.getPhpTableName(),
        this.getPhpTableKey()
      )
    },

    async deletePhysicalServer(psId: string) {
      await this.getHelper().delete(psId, this.getPhpTableName(), this.getPhpTableKey())
    },

    async deletePhysicalServers(psIds: string[]) {
      await this.getHelper().deleteMany(
        psIds,
        this.getPhpTableName(),
        this.getPhpTableKey()
      )
    },

    clear() {
      this.items = []
      this.error = null
      this.lastFetched = null
    }
  }
})
