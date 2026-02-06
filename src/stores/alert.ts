import { defineStore } from 'pinia'

export type AlertType = 'info' | 'success' | 'error' | 'warning'

interface Toast {
  id: number
  message: string
  type: AlertType
  duration: number
}

interface AlertState {
  toasts: Toast[]
  nextId: number
}

export const useAlertStore = defineStore('alert', {
  state: (): AlertState => ({
    toasts: [],
    nextId: 1
  }),

  actions: {
    /** 메시지를 토스트로 표시. type 기본값: info */
    show(message: string, type: AlertType = 'info', duration: number = 3000) {
      const id = this.nextId++
      this.toasts.push({ id, message, type, duration })
      setTimeout(() => {
        this.remove(id)
      }, duration)
    },

    remove(id: number) {
      const index = this.toasts.findIndex((toast) => toast.id === id)
      if (index !== -1) {
        this.toasts.splice(index, 1)
      }
    },

    // 하위 호환성 유지용 (모달 close 대신 no-op)
    close() {}
  }
})
