import { defineStore } from 'pinia'

export const useNavigationStore = defineStore('navigation', {
  state: () => ({
    currentPage: 'home' // 기본값을 'home'으로 설정
  }),

  actions: {
    setCurrentPage(page: string) {
      this.currentPage = page
    }
  }
})

