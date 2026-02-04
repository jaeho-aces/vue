import { defineStore } from 'pinia'

/** 인증은 httpOnly 쿠키로 관리. 토큰은 스토어에 두지 않음. */
export interface AuthUser {
  id: string
  name: string
  email: string
}

interface AuthState {
  user: AuthUser | null
  authReady: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    authReady: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    isLoggedIn: (state) => !!state.user,
    currentUser: (state) => state.user
  },

  actions: {
    setUser(user: AuthUser | null) {
      this.user = user
    },

    login(user: AuthUser) {
      this.user = user
      this.authReady = true
    },

    clearAuth() {
      this.user = null
    },

    /** 서버 쿠키 삭제 후 스토어 초기화. api 미전달 시 스토어만 초기화. */
    async logout(api?: { post: (url: string) => Promise<unknown> }) {
      try {
        if (api) await api.post('/api/auth/logout')
      } finally {
        this.user = null
      }
    },

    /** 쿠키로 현재 사용자 조회. authReady 플래그 설정. */
    async fetchUser(api: { get: (url: string) => Promise<{ data: { user: AuthUser } }> }) {
      if (this.authReady) return
      try {
        const res = await api.get('/api/auth/me')
        const user = res.data?.user
        if (user?.id) {
          this.user = { id: user.id, name: user.name, email: user.email ?? '' }
        } else {
          this.user = null
        }
      } catch {
        this.user = null
      } finally {
        this.authReady = true
      }
    }
  }
})












