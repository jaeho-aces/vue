<template>
  <div class="app-layout flex">
    <Sidebar :active-item="navigationStore.currentPage" :on-navigate="handleNavigate" />
    <div class="main-content flex-col">
      <Header />
      <main class="page-content">
        <component :is="currentComponent" />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNavigationStore } from '../stores/navigation'
import Header from './Header.vue'
import Sidebar from './Sidebar.vue'
import SystemStatusView from '../components/views/SystemStatusView.vue'
import ServerStatusView from '../components/views/ServerStatusView.vue'
import VideoView from '../components/views/VideoView.vue'
import ManagementView from '../components/views/ManagementView.vue'
import DeviceManagementView from '../components/views/DeviceManagementView.vue'
import '../assets/layout.css'

const navigationStore = useNavigationStore()

const components = {
  'system-status': SystemStatusView,
  'server-status': ServerStatusView,
  'cctv': VideoView,
  'management': ManagementView,
  'device-manage': DeviceManagementView,
  'general-manage': ManagementView
}

const currentComponent = computed(() => {
  return components[navigationStore.currentPage as keyof typeof components] || SystemStatusView
})

const handleNavigate = (item: string) => {
  navigationStore.setCurrentPage(item)
}
</script>

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
