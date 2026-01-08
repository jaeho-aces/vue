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
      <div
        class="user-profile"
        :style="{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: 'var(--bg-tertiary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-primary)'
        }"
      >
        <User :size="18" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Search, Bell, User } from 'lucide-vue-next'

interface Props {
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'CCTV 영상 인터넷 제공 시스템'
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
