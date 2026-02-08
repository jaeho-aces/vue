<template>
  <div class="font-sans antialiased text-[#2c3e50] min-h-screen">
    <!-- 인증 확인 전, 또는 비로그인인데 아직 /login으로 리다이렉트 안 된 한 프레임에는 로딩만 표시 -->
    <div v-if="!shouldShowContent" class="flex flex-col items-center justify-center min-h-screen gap-4">
      <span class="w-10 h-10 border-[3px] border-slate-200 border-t-blue-500 rounded-full animate-spin" aria-hidden="true"></span>
      <span class="text-sm text-slate-500">로딩 중...</span>
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

// ============================================================
// 🚧 임시 코드: 로그인 없이 모든 페이지 확인용 (개발 모드)
// ============================================================
/** 임시: 모든 페이지를 로그인 없이 확인 가능하도록 설정 */
const shouldShowContent = computed(() => {
  return true // 임시로 항상 true 반환
})

// ============================================================
// 원본 코드 (주석 처리됨 - 나중에 복구 시 아래 주석 제거)
// ============================================================
// /** 인증 확인이 끝났고, 로그인 페이지이거나 로그인된 상태일 때만 본문 표시 (한 프레임 메인 노출 방지) */
// const shouldShowContent = computed(() => {
//   if (!authStore.authReady) return false
//   if (route.path === '/login') return true
//   return authStore.isAuthenticated
// })
// ============================================================

const isPopup = computed(() => {
  return route.path === '/DashboardPopupView' || route.path === '/Dashboard2View'
})
</script>
