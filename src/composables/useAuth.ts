import { computed } from 'vue'
import { useAuthStore, type AuthUser } from '../stores/auth'

export function useAuth() {
  const authStore = useAuthStore()

  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const currentUser = computed(() => authStore.currentUser)

  const login = (user: AuthUser) => {
    authStore.login(user)
  }

  const logout = (api?: { post: (url: string) => Promise<unknown> }) => {
    return authStore.logout(api)
  }

  return {
    isAuthenticated,
    currentUser,
    login,
    logout
  }
}












