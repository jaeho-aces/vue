<template>
  <header class="top-header" :style="{ height: '70px' }">
    <div class="header-left flex items-center gap-8">
        CCTV 영상 인터넷 제공 시스템
    </div>

    <div class="header-actions">
      <button class="icon-btn" :style="{ color: 'var(--text-secondary)' }">
        <Search :size="20" />
      </button>
      <button class="icon-btn" :style="{ color: 'var(--text-secondary)' }">
        <Bell :size="20" />
      </button>
      <div class="user-menu-wrapper" ref="userMenuRef">
        <button
          type="button"
          class="user-profile-btn"
          aria-haspopup="true"
          :aria-expanded="showUserMenu"
          @click.stop="showUserMenu = !showUserMenu"
        >
          <User :size="18" />
        </button>
        <Transition name="dropdown">
          <div
            v-show="showUserMenu"
            class="user-menu-dropdown"
            role="menu"
          >
            <div class="user-menu-name">
              {{ authStore.currentUser?.name || authStore.currentUser?.id || '사용자' }}
            </div>
            <div class="user-menu-email" v-if="authStore.currentUser?.email">
              {{ authStore.currentUser.email }}
            </div>
            <button
              type="button"
              class="user-menu-item user-menu-logout"
              role="menuitem"
              @click="handleLogout"
            >
              <LogOut :size="16" class="shrink-0" />
              로그아웃
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Bell, User, LogOut } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'
import { api } from '../services/api'

interface Props {
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'CCTV 영상 인터넷 제공 시스템'
})

const router = useRouter()
const authStore = useAuthStore()
const showUserMenu = ref(false)
const userMenuRef = ref<HTMLElement | null>(null)

function handleLogout() {
  showUserMenu.value = false
  authStore.logout(api).then(() => {
    router.replace('/login')
  })
}

function onClickOutside(e: MouseEvent) {
  if (userMenuRef.value && !userMenuRef.value.contains(e.target as Node)) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>

<style scoped>
.top-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background-color: var(--bg-primary, #ffffff);
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 32px;
}

.logo img {
  height: 32px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.icon-btn:hover {
  background-color: var(--bg-secondary, #f3f4f6);
}

.user-menu-wrapper {
  position: relative;
}

.user-profile-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--bg-tertiary, #f3f4f6);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary, #111827);
  cursor: pointer;
  transition: background-color 0.2s;
}

.user-profile-btn:hover {
  background-color: var(--border-color, #e5e7eb);
}

.user-menu-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 200px;
  padding: 12px 0;
  background: var(--bg-primary, #fff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  z-index: 50;
}

.user-menu-name {
  padding: 0 16px 4px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #111827);
}

.user-menu-email {
  padding: 0 16px 12px;
  font-size: 12px;
  color: var(--text-secondary, #6b7280);
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  margin-bottom: 4px;
}

.user-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: none;
  font-size: 14px;
  color: var(--text-primary, #111827);
  cursor: pointer;
  text-align: left;
  transition: background-color 0.2s;
}

.user-menu-item:hover {
  background-color: var(--bg-secondary, #f9fafb);
}

.user-menu-logout {
  color: var(--text-secondary, #6b7280);
}

.user-menu-logout:hover {
  color: #dc2626;
  background-color: #fef2f2;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.gap-2 {
  gap: 8px;
}

.gap-8 {
  gap: 32px;
}

.rounded-lg {
  border-radius: 8px;
}

.text-sm {
  font-size: 14px;
}

.font-medium {
  font-weight: 500;
}

.transition-colors {
  transition: color 0.2s, background-color 0.2s;
}

.bg-blue-600 {
  background-color: #2563eb;
}

.text-white {
  color: #ffffff;
}

.shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.text-gray-500 {
  color: #6b7280;
}

.hover\:bg-gray-100:hover {
  background-color: #f3f4f6;
}

.hover\:text-gray-900:hover {
  color: #111827;
}
</style>
