import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'

export function useAuth() {
  const authStore = useAuthStore()

  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const currentUser = computed(() => authStore.currentUser)

  const login = (token: string, user: { id: string; name: string; email: string }) => {
    authStore.login(token, user)
  }

  const logout = () => {
    authStore.logout()
  }

  return {
    isAuthenticated,
    currentUser,
    login,
    logout
  }
}












