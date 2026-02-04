import { defineStore } from 'pinia'

export type AlertType = 'info' | 'success' | 'error' | 'warning'

interface AlertState {
  visible: boolean
  message: string
  type: AlertType
}

export const useAlertStore = defineStore('alert', {
  state: (): AlertState => ({
    visible: false,
    message: '',
    type: 'info'
  }),

  actions: {
    /** 메시지를 모달로 표시. type 기본값: info */
    show(message: string, type: AlertType = 'info') {
      this.message = message
      this.type = type
      this.visible = true
    },

    close() {
      this.visible = false
    }
  }
})
