<template>
  <aside :class="['sidebar', className]" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
    <div class="sidebar-header">
      <div class="logo">
        <img v-if="!isHovered" src="/ci.svg" alt="CI" class="logo-image" />
        <img v-else src="/logo.svg" alt="Logo" class="logo-image" />
      </div>
    </div>
    <nav class="sidebar-nav">
      <button
        v-for="item in navItems"
        :key="item.id"
        :class="['nav-item', { active: activeItem === item.id }]"
        @click="handleNavigate(item.id)"
      >
        <component :is="item.icon" :size="24" class="nav-icon" />
        <span class="nav-label">{{ item.label }}</span>
      </button>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { LayoutDashboard, Server, Settings, Activity, Users, Video, Monitor, BarChart } from 'lucide-vue-next'

interface Props {
  className?: string
  activeItem: string
  onNavigate?: (item: string) => void
}

const props = withDefaults(defineProps<Props>(), {
  className: ''
})

const isHovered = ref(false)

const navItems = [
  { id: 'dashboard', label: '대시보드', icon: Monitor },
  { id: 'dashboard2', label: '대시보드2', icon: LayoutDashboard },
  { id: 'system-status', label: '시스템 현황', icon: LayoutDashboard },
  { id: 'server-status', label: '서버별 현황', icon: Activity },
  { id: 'cctv', label: '영상 보기', icon: Video },
  { id: 'device-manage', label: '장치 관리', icon: Server },
  { id: 'general-manage', label: '일반 관리', icon: Users },
  { id: 'prometheus-sample', label: '샘플 페이지', icon: BarChart },
  { id: 'settings', label: '설정', icon: Settings }
]

const handleNavigate = (itemId: string) => {
  if (itemId === 'dashboard') {
    const width = 2560
    const height = 1440
    const left = (window.screen.width - width) / 2
    const top = (window.screen.height - height) / 2
    window.open(
      `${window.location.origin}/dashboard-popup`,
      'DashboardPopup',
      `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
    )
    return
  }
  
  if (itemId === 'dashboard2') {
    const width = 1920
    const height = 1080
    const left = (window.screen.width - width) / 2
    const top = (window.screen.height - height) / 2
    window.open(
      `${window.location.origin}/dashboard2-popup`,
      'Dashboard2Popup',
      `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
    )
    return
  }
  
  if (props.onNavigate) {
    props.onNavigate(itemId)
  }
}
</script>

<style scoped>
.sidebar {
  width: 64px;
  height: 100vh;
  background-color: var(--bg-secondary, #f9fafb);
  border-right: 1px solid var(--border-color, #e5e7eb);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  overflow: hidden;
  position: relative;
}

.sidebar:hover {
  width: 240px;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70px;
}

.sidebar-header .logo {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 1;
  transition: width 0.3s ease;
}

.sidebar:hover .sidebar-header .logo {
  width: 80%;
}

.sidebar-header .logo-image {
  width: 100%;
  height: auto;
}

/* 접혀있을 때 ci.svg 크기 더 크게 */
.sidebar:not(:hover) .sidebar-header .logo-image {
  width: 120%;
  max-width: 48px;
  height: auto;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 8px;
  color: var(--text-secondary, #6b7280);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  text-align: left;
  position: relative;
  min-height: 44px;
}

.sidebar:hover .nav-item {
  justify-content: flex-start;
  padding: 12px 16px;
}

.nav-label {
  white-space: nowrap;
  opacity: 0;
  width: 0;
  overflow: hidden;
  transition: opacity 0.2s ease 0.1s, width 0s ease 0.3s;
  margin-left: 0;
}

.sidebar:hover .nav-label {
  opacity: 1;
  width: auto;
  transition: opacity 0.2s ease 0.1s, width 0s ease 0s;
}

.nav-item:hover {
  background-color: var(--bg-tertiary, #f3f4f6);
  color: var(--text-primary, #111827);
}

.nav-item.active {
  background-color: var(--bg-primary, #ffffff);
  color: var(--text-primary, #111827);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.nav-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.flex {
  display: flex;
}

.justify-center {
  justify-content: center;
}

.align-center {
  align-items: center;
}

.w-4\/5 {
  width: 80%;
}
</style>
