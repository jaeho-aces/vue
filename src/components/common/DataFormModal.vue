<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click.self="handleClose">
        <div class="modal-container">
          <div class="modal-header">
            <h2 class="modal-title">{{ isEditMode ? '수정' : '신규' }} {{ title }}</h2>
            <button class="modal-close-button" @click="handleClose">×</button>
          </div>
          
          <div class="modal-body">
            <form @submit.prevent="handleSubmit" class="form-container">
              <div 
                v-for="field in fields" 
                :key="field.id"
                class="form-field"
              >
                <label :for="field.id" class="form-label">
                  {{ field.label }}
                  <span v-if="field.required" class="required-mark">*</span>
                </label>
                
                <!-- 텍스트 입력 -->
                <input
                  v-if="field.type === 'text' || field.type === 'number'"
                  :id="field.id"
                  :type="field.type"
                  v-model="formData[field.id]"
                  :placeholder="field.placeholder || ''"
                  :required="field.required"
                  class="form-input"
                />
                
                <!-- 셀렉트 -->
                <select
                  v-else-if="field.type === 'select'"
                  :id="field.id"
                  v-model="formData[field.id]"
                  :required="field.required"
                  class="form-select"
                >
                  <option value="">{{ field.placeholder || '선택하세요' }}</option>
                  <option
                    v-for="option in field.options"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
                
                <!-- 라디오 버튼 (Yes/No) -->
                <div v-else-if="field.type === 'yesno'" class="form-radio-group">
                  <label class="radio-label">
                    <input
                      type="radio"
                      :name="field.id"
                      :value="'Y'"
                      v-model="formData[field.id]"
                      :required="field.required"
                      class="radio-input"
                    />
                    <span>예</span>
                  </label>
                  <label class="radio-label">
                    <input
                      type="radio"
                      :name="field.id"
                      :value="'N'"
                      v-model="formData[field.id]"
                      :required="field.required"
                      class="radio-input"
                    />
                    <span>아니오</span>
                  </label>
                </div>
                
                <!-- 텍스트 영역 -->
                <textarea
                  v-else-if="field.type === 'textarea'"
                  :id="field.id"
                  v-model="formData[field.id]"
                  :placeholder="field.placeholder || ''"
                  :required="field.required"
                  :rows="field.rows || 3"
                  class="form-textarea"
                />
              </div>
            </form>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="modal-button cancel-button" @click="handleClose">
              취소
            </button>
            <button type="button" class="modal-button submit-button" @click="handleSubmit">
              {{ isEditMode ? '수정' : '등록' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch, reactive, computed } from 'vue'

// 타입 정의 (export하여 다른 컴포넌트에서도 사용 가능)
export type FormField = {
  id: string
  label: string
  type: 'text' | 'number' | 'select' | 'yesno' | 'textarea'
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  rows?: number
}

interface Props {
  isOpen: boolean
  title: string
  fields: FormField[]
  initialData?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  title: '',
  fields: () => [],
  initialData: () => ({})
})

const emit = defineEmits<{
  close: []
  submit: [data: Record<string, any>]
}>()

const isEditMode = computed(() => !!props.initialData && Object.keys(props.initialData).length > 0)

// 폼 데이터 초기화
const formData = reactive<Record<string, any>>({})

// 필드 초기화
const initializeFormData = () => {
  // 모든 필드를 초기값으로 설정
  props.fields.forEach(field => {
    if (props.initialData && props.initialData[field.id] !== undefined) {
      formData[field.id] = props.initialData[field.id]
    } else {
      // 기본값 설정
      if (field.type === 'yesno') {
        formData[field.id] = 'N'
      } else if (field.type === 'number') {
        formData[field.id] = ''
      } else {
        formData[field.id] = ''
      }
    }
  })
}

// isOpen이 true가 될 때 폼 데이터 초기화
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    initializeFormData()
  }
}, { immediate: true })

const handleClose = () => {
  emit('close')
}

const handleSubmit = () => {
  // 필수 필드 검증
  const missingFields = props.fields
    .filter(field => field.required && !formData[field.id])
    .map(field => field.label)
  
  if (missingFields.length > 0) {
    console.log(`다음 필수 필드를 입력해주세요: ${missingFields.join(', ')}`)
    return
  }
  
  emit('submit', { ...formData })
}
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
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  background-color: #f8fafc;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
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
  border-radius: 4px;
  transition: all 0.2s;
}

.modal-close-button:hover {
  background-color: #e2e8f0;
  color: #1e293b;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #475569;
}

.required-mark {
  color: #ef4444;
  margin-left: 4px;
}

.form-input,
.form-select,
.form-textarea {
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #1e293b;
  transition: all 0.2s;
  font-family: inherit;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-select {
  cursor: pointer;
  background-color: #ffffff;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-radio-group {
  display: flex;
  gap: 24px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  color: #475569;
}

.radio-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #2563eb;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e2e8f0;
  background-color: #f8fafc;
}

.modal-button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-button {
  background-color: #ffffff;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.cancel-button:hover {
  background-color: #f1f5f9;
}

.submit-button {
  background-color: #2563eb;
  color: #ffffff;
}

.submit-button:hover {
  background-color: #1d4ed8;
}

/* 모달 애니메이션 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95);
  opacity: 0;
}

/* 스크롤바 스타일 */
.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>

