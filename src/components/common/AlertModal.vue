<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="alertStore.visible"
        class="modal-overlay"
        @mousedown.self="mousedownOnOverlay = true"
        @mouseup.self="handleOverlayMouseUp"
      >
        <div class="modal-container" @mousedown.stop @click.stop>
          <div class="modal-header" :class="headerClass">
            <span class="modal-icon" :class="iconClass">{{ iconText }}</span>
            <h2 class="modal-title">{{ titleText }}</h2>
            <button class="modal-close-button" @click="handleClose" aria-label="닫기">×</button>
          </div>
          <div class="modal-body">
            <p class="modal-message">{{ alertStore.message }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="confirm-button" @click="handleClose">확인</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAlertStore } from '../../stores/alert'

const alertStore = useAlertStore()

const mousedownOnOverlay = ref(false)
const handleOverlayMouseUp = () => {
  if (mousedownOnOverlay.value) alertStore.close()
  mousedownOnOverlay.value = false
}

const handleClose = () => {
  alertStore.close()
}

const headerClass = computed(() => `header-${alertStore.type}`)
const iconClass = computed(() => `icon-${alertStore.type}`)

const iconText = computed(() => {
  switch (alertStore.type) {
    case 'success': return '✓'
    case 'error': return '!'
    case 'warning': return '⚠'
    default: return 'i'
  }
})

const titleText = computed(() => {
  switch (alertStore.type) {
    case 'success': return '알림'
    case 'error': return '오류'
    case 'warning': return '경고'
    default: return '알림'
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 20px;
}

.modal-container {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 420px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 20px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header.header-info {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
}

.modal-header.header-success {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
}

.modal-header.header-error {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
}

.modal-header.header-warning {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
}

.modal-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  flex-shrink: 0;
}

.modal-icon.icon-info {
  background: #0ea5e9;
  color: #fff;
}

.modal-icon.icon-success {
  background: #22c55e;
  color: #fff;
}

.modal-icon.icon-error {
  background: #ef4444;
  color: #fff;
}

.modal-icon.icon-warning {
  background: #f59e0b;
  color: #fff;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  flex: 1;
}

.modal-close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #64748b;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.modal-close-button:hover {
  background-color: rgba(0, 0, 0, 0.06);
  color: #1e293b;
}

.modal-body {
  padding: 24px 20px;
}

.modal-message {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: #334155;
  white-space: pre-wrap;
  word-break: break-word;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
  background-color: #f8fafc;
  display: flex;
  justify-content: flex-end;
}

.confirm-button {
  min-width: 88px;
  padding: 10px 20px;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #fff;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(37, 99, 235, 0.3);
}

.confirm-button:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.4);
}

.confirm-button:active {
  transform: scale(0.98);
}

/* 트랜지션 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.2s ease;
}
.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95);
}
</style>
