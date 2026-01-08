import { defineStore } from 'pinia'

interface AuthState {
  isAuthenticated: boolean
  token: string | null
  user: {
    id: string
    name: string
    email: string
  } | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    isAuthenticated: false,
    token: null,
    user: null
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated,
    currentUser: (state) => state.user
  },

  actions: {
    login(token: string, user: { id: string; name: string; email: string }) {
      this.token = token
      this.user = user
      this.isAuthenticated = true
    },

    logout() {
      this.token = null
      this.user = null
      this.isAuthenticated = false
    }
  }
})












