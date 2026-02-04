<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNavigationStore } from '../stores/navigation'
import { useCommonCodeStore } from '../stores/commonCode'
import Header from './Header.vue'
import Sidebar from './Sidebar.vue'
import '../assets/layout.css'

const route = useRoute()
const router = useRouter()
const navigationStore = useNavigationStore()
const commonCodeStore = useCommonCodeStore()

// URL 경로에 따라 navigationStore의 currentPage 동기화
watch(() => route.path, (newPath) => {
  const page = newPath.substring(1) || 'home'
  navigationStore.setCurrentPage(page)
}, { immediate: true })

// 페이지 최초 로드 시 CommonCode 스토어 로드 (캐싱)
onMounted(async () => {
  if (commonCodeStore.items.length === 0) {
    console.log('CommonCode 스토어 초기 로드 시작...')
    await commonCodeStore.fetchCommonCodes()
    console.log('CommonCode 스토어 초기 로드 완료:', commonCodeStore.items.length, '개')
  }
})

const handleNavigate = (page: string) => {
  if (page === 'home') {
    router.push('/')
  } else {
    router.push(`/${page}`)
  }
}
</script>

<template>
  <div class="app-layout flex">
    <Sidebar :active-item="navigationStore.currentPage" :on-navigate="handleNavigate" />
    <div class="main-content flex-col">
      <Header />
      <main class="page-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  width: 100%;
}

.main-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.page-content {
  flex: 1;
  overflow: hidden;
  padding: 24px;
  background-color: var(--bg-primary, #ffffff);
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.flex {
  display: flex;
}

.flex-col {
  display: flex;
  flex-direction: column;
}
</style>
