import { defineStore } from 'pinia'

export type ServerFilterType = 'transcoding' | 'media'
export type ServerViewModeType = 'grid' | 'chart'

interface ServerStatusUiState {
  serverFilter: ServerFilterType
  serverViewMode: ServerViewModeType
}

export const useServerStatusUiStore = defineStore('serverStatusUi', {
  state: (): ServerStatusUiState => ({
    serverFilter: 'transcoding',
    serverViewMode: 'grid'
  }),

  actions: {
    setFilter(filter: ServerFilterType) {
      this.serverFilter = filter
    },
    setViewMode(mode: ServerViewModeType) {
      this.serverViewMode = mode
    }
  }
})

