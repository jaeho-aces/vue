import { defineStore } from 'pinia'

interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  role?: string
}

export const useUserStore = defineStore('user', {
  state: () => ({
    profile: null as UserProfile | null,
    preferences: {
      theme: 'light',
      language: 'ko'
    }
  }),

  getters: {
    userName: (state) => state.profile?.name ?? 'Guest',
    userEmail: (state) => state.profile?.email ?? '',
    userRole: (state) => state.profile?.role ?? 'user'
  },

  actions: {
    setProfile(profile: UserProfile) {
      this.profile = profile
    },

    updatePreferences(preferences: Partial<typeof this.preferences>) {
      this.preferences = { ...this.preferences, ...preferences }
    },

    clearProfile() {
      this.profile = null
    }
  }
})












