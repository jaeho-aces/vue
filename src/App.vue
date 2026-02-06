<template>
  <div id="app">
    <!-- 인증 확인 전, 또는 비로그인인데 아직 /login으로 리다이렉트 안 된 한 프레임에는 로딩만 표시 -->
    <div v-if="!shouldShowContent" class="app-loading">
      <span class="app-loading-spinner" aria-hidden="true"></span>
      <span class="app-loading-text">로딩 중...</span>
    </div>
    <template v-else>
      <div v-if="isPopup">
        <router-view />
      </div>
      <div v-else-if="route.path === '/login'">
        <router-view />
      </div>
      <HomeView v-else-if="route.path === '/'" />
      <Layout v-else>
        <router-view />
      </Layout>
    </template>
    <AlertModal />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import HomeView from './components/views/HomeView.vue'
import Layout from './layout/Layout.vue'
import AlertModal from './components/common/AlertModal.vue'

const route = useRoute()
const authStore = useAuthStore()

/** 인증 확인이 끝났고, 로그인 페이지이거나 로그인된 상태일 때만 본문 표시 (한 프레임 메인 노출 방지) */
const shouldShowContent = computed(() => {
  if (!authStore.authReady) return false
  if (route.path === '/login') return true
  return authStore.isAuthenticated
})

const isPopup = computed(() => {
  return route.path === '/DashboardPopupView' || route.path === '/Dashboard2View'
})
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 1rem;
}

.app-loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: app-loading-spin 0.8s linear infinite;
}

.app-loading-text {
  font-size: 0.875rem;
  color: #64748b;
}

@keyframes app-loading-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

