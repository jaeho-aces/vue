<template>
  <button
    :class="['action-btn', `btn-${variant}`, { disabled: isDisabled }]"
    :style="sizeStyle"
    :disabled="isDisabled"
    @click="handleClick"
  >
    <span v-if="isLoading" class="mr-2">...</span>
    <span v-if="!isLoading && leftIcon" class="icon-left">
      <component :is="leftIcon" />
    </span>
    <slot></slot>
    <span v-if="!isLoading && rightIcon" class="icon-right">
      <component :is="rightIcon" />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'info'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: any
  rightIcon?: any
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  isLoading: false,
  disabled: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const isDisabled = computed(() => props.disabled || props.isLoading)

const sizeStyle = computed(() => {
  switch (props.size) {
    case 'sm':
      return { padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }
    case 'lg':
      return { padding: '0.75rem 1.5rem', fontSize: '1.125rem' }
    default:
      return { padding: '0.5rem 1rem', fontSize: '0.875rem' }
  }
})

const handleClick = (event: MouseEvent) => {
  if (!isDisabled.value) {
    emit('click', event)
  }
}
</script>

<style scoped>
.action-btn {
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  min-width: 70px;
}

.action-btn.btn-primary {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.action-btn.btn-primary:hover:not(.disabled) {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3), 0 2px 4px -1px rgba(37, 99, 235, 0.2);
  transform: translateY(-1px);
}

.action-btn.btn-primary:active:not(.disabled) {
  transform: translateY(0);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.action-btn.btn-secondary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.action-btn.btn-secondary:hover:not(.disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3), 0 2px 4px -1px rgba(16, 185, 129, 0.2);
  transform: translateY(-1px);
}

.action-btn.btn-secondary:active:not(.disabled) {
  transform: translateY(0);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.action-btn.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.action-btn.btn-danger:hover:not(.disabled) {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.3), 0 2px 4px -1px rgba(239, 68, 68, 0.2);
  transform: translateY(-1px);
}

.action-btn.btn-danger:active:not(.disabled) {
  transform: translateY(0);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.action-btn.btn-ghost {
  background-color: transparent;
  color: var(--text-primary, #334155);
  border: 1px solid var(--border-color, #e2e8f0);
  box-shadow: none;
}

.action-btn.btn-ghost:hover:not(.disabled) {
  background-color: var(--bg-hover, #f8fafc);
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.action-btn.btn-info {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.action-btn.btn-info:hover:not(.disabled) {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  box-shadow: 0 4px 6px -1px rgba(139, 92, 246, 0.3), 0 2px 4px -1px rgba(139, 92, 246, 0.2);
  transform: translateY(-1px);
}

.action-btn.btn-info:active:not(.disabled) {
  transform: translateY(0);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.action-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.icon-left {
  margin-right: 8px;
  display: flex;
  align-items: center;
}

.icon-right {
  margin-left: 8px;
  display: flex;
  align-items: center;
}

.mr-2 {
  margin-right: 0.5rem;
}

/* 버튼 그룹 레이아웃 스타일 */
.button-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.button-group {
  display: flex;
  gap: 12px;
}
</style>

