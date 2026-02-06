<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="modal-overlay"
        @mousedown.self="mousedownOnOverlay = true"
        @mouseup.self="handleOverlayMouseUp"
      >
        <div class="modal-container" :class="{ 'modal-container--large': size === 'large' }" @mousedown.stop>
          <div class="modal-header">
            <h2 class="modal-title">{{ isEditMode ? '수정' : '신규' }} {{ title }}</h2>
            <button class="modal-close-button" @click="handleClose">×</button>
          </div>
          
          <div class="modal-body" :class="{ 'modal-body--large': size === 'large' }">
            <!-- 모달이 열릴 때마다 formKey로 폼을 새로 그려서 v-model 바인딩이 깨지는 현상 방지 -->
            <form :key="formKey" @submit.prevent="handleSubmit" class="form-container" :class="{ 'form-container--large': size === 'large' }">
              <template v-for="field in fields" :key="field.id">
                <!-- 숨김 필드: 레이블 없이 input만 -->
                <input
                  v-if="field.type === 'hidden'"
                  type="hidden"
                  :id="field.id"
                  v-model="formData[field.id]"
                />
                <div
                  v-else
                  class="form-field"
                  :class="{
                    'form-field--wide':
                      size === 'large' && ['enc_url', 'hls_url', 'public_url'].includes(field.id)
                  }"
                >
                <label :for="field.id" class="form-label">
                  {{ field.label ?? '' }}
                  <span v-if="field.required" class="form-label-required">*</span>
                </label>
                <p v-if="field.hint" class="form-hint">{{ field.hint }}</p>
                
                <!-- 숫자(2자리 등 자릿수 제한): text + inputmode numeric + maxlength -->
                <input
                  v-if="field.type === 'number' && field.maxLength"
                  :id="field.id"
                  type="text"
                  inputmode="numeric"
                  v-model="formData[field.id]"
                  :placeholder="field.placeholder || ''"
                  :required="field.required"
                  :readonly="field.readonlyInEdit && isEditMode"
                  :disabled="isFieldDisabled(field)"
                  :maxlength="field.maxLength"
                  :class="['form-input', { 'form-input--required': field.required, 'form-input--error': isRequiredEmpty(field) }]"
                />
                <!-- IP 전용 입력 (255.255.255.255 형식) -->
                <IpInput
                  v-else-if="field.type === 'ip'"
                  :id="field.id"
                  v-model="formData[field.id]"
                  :placeholder="field.placeholder || ''"
                  :required="field.required"
                  :readonly="!!(field.readonlyInEdit && isEditMode)"
                  :disabled="isFieldDisabled(field)"
                  :input-class="inputClassFor(field)"
                />
                <!-- ID 전용 입력 (숫자 4자리 등) -->
                <IdInput
                  v-else-if="field.type === 'id'"
                  :id="field.id"
                  v-model="formData[field.id]"
                  :placeholder="field.placeholder || ''"
                  :required="field.required"
                  :readonly="!!(field.readonlyInEdit && isEditMode)"
                  :disabled="isFieldDisabled(field)"
                  :input-class="inputClassFor(field)"
                  :max-length="field.maxLength ?? 4"
                />
                <!-- 숫자 범위 입력 (포트 등 min/max 제한) -->
                <PortInput
                  v-else-if="field.type === 'number' && (field.min != null || field.max != null)"
                  :id="field.id"
                  v-model="formData[field.id]"
                  :min="field.min ?? 0"
                  :max="field.max ?? 65535"
                  :placeholder="field.placeholder || ''"
                  :required="field.required"
                  :readonly="!!(field.readonlyInEdit && isEditMode)"
                  :disabled="isFieldDisabled(field)"
                  :input-class="inputClassFor(field)"
                />
                <!-- 텍스트/숫자/암호 입력 (number일 때 min/max 없음) -->
                <input
                  v-else-if="field.type === 'text' || field.type === 'number' || field.type === 'password'"
                  :id="field.id"
                  :type="field.type === 'password' ? 'password' : field.type"
                  v-model="formData[field.id]"
                  :placeholder="field.placeholder || ''"
                  :required="field.required"
                  :readonly="field.readonlyInEdit && isEditMode"
                  :disabled="isFieldDisabled(field)"
                  :min="field.type === 'number' && field.min != null ? field.min : undefined"
                  :max="field.type === 'number' && field.max != null ? field.max : undefined"
                  :maxlength="field.type !== 'number' && field.maxLength ? field.maxLength : undefined"
                  :pattern="field.pattern"
                  :class="['form-input', { 'form-input--required': field.required, 'form-input--error': isRequiredEmpty(field) }]"
                />
                
                <!-- 셀렉트 (options는 배열 또는 formData 기반 함수) -->
                <select
                  v-else-if="field.type === 'select'"
                  :id="field.id"
                  v-model="formData[field.id]"
                  :required="field.required"
                  :disabled="(field.readonlyInEdit && isEditMode) || isFieldDisabled(field)"
                  :class="['form-select', { 'form-select--required': field.required, 'form-select--error': isRequiredEmpty(field) }]"
                >
                  <option value="">{{ field.placeholder || '선택하세요' }}</option>
                  <option
                    v-for="option in getSelectOptions(field)"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
                
                <!-- 토글 버튼 (options 중 하나 선택, admin/user 등) -->
                <div v-else-if="field.type === 'toggle' && field.options?.length" class="form-toggle-group">
                  <button
                    v-for="opt in field.options"
                    :key="opt.value"
                    type="button"
                    :class="['form-toggle-button', { active: formData[field.id] === opt.value }]"
                    :disabled="isFieldDisabled(field)"
                    @click="formData[field.id] = opt.value"
                  >
                    {{ opt.label }}
                  </button>
                </div>
                <!-- 라디오 버튼 (Yes/No) -->
                <div v-else-if="field.type === 'yesno'" class="form-radio-group">
                  <label class="radio-label">
                    <input
                      type="radio"
                      :name="field.id"
                      :value="'Y'"
                      v-model="formData[field.id]"
                      :required="field.required"
                      :disabled="(field.readonlyInEdit && isEditMode) || isFieldDisabled(field)"
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
                      :disabled="(field.readonlyInEdit && isEditMode) || isFieldDisabled(field)"
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
                  :readonly="field.readonlyInEdit && isEditMode"
                  :disabled="isFieldDisabled(field)"
                  :maxlength="field.maxLength"
                  :class="['form-textarea', { 'form-textarea--required': field.required, 'form-textarea--error': isRequiredEmpty(field) }]"
                />
              </div>
              </template>
            </form>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="modal-button cancel-button" @click="handleClose">
              취소
            </button>
            <button
              type="button"
              class="modal-button submit-button"
              @click="handleSubmit"
            >
              {{ isEditMode ? '수정' : '등록' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch, computed, ref } from 'vue'
import { useAlertStore } from '../../stores/alert'
import IdInput from './IdInput.vue'
import IpInput from './IpInput.vue'
import PortInput from './PortInput.vue'

// 타입 정의 (export하여 다른 컴포넌트에서도 사용 가능)
export type FormField = {
  id: string
  /** hidden 타입은 레이블 미사용으로 생략 가능 */
  label?: string
  type: 'text' | 'number' | 'select' | 'yesno' | 'textarea' | 'password' | 'hidden' | 'ip' | 'id' | 'toggle'
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[] | ((formData: Record<string, any>) => { value: string; label: string }[])
  rows?: number
  /** 수정 모달에서만 읽기 전용(복합 키 등 변경 불가 필드용) */
  readonlyInEdit?: boolean
  /** 숫자 최소값 (검증 실패 시 알림) */
  min?: number
  /** 숫자 최대값 (검증 실패 시 알림) */
  max?: number
  /** 문자열 최소 길이 */
  minLength?: number
  /** 문자열 최대 길이 */
  maxLength?: number
  /** 정규식 패턴(문자열). 검증 및 input pattern 속성에 사용 */
  pattern?: string
  /** pattern 검증 실패 시 알림 메시지 */
  patternMessage?: string
  /** 입력란 아래 안내 문구 (도움말) */
  hint?: string
  /** 비활성화 여부. 함수면 formData 기준으로 계산 */
  disabled?: boolean | ((formData: Record<string, any>) => boolean)
}

const alertStore = useAlertStore()

interface Props {
  isOpen: boolean
  title: string
  fields: FormField[]
  initialData?: Record<string, any>
  size?: 'default' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  title: '',
  fields: () => [],
  initialData: () => ({}),
  size: 'default'
})

const emit = defineEmits<{
  close: []
  submit: [data: Record<string, any>]
}>()

const isEditMode = computed(() => !!props.initialData && Object.keys(props.initialData).length > 0)

// 폼 데이터: ref로 두고, 모달이 열릴 때마다 현재 fields 기준으로 새 객체로 교체해 v-model이 항상 유효한 키에만 바인딩되도록 함
const formData = ref<Record<string, any>>({})
// 모달이 열릴 때마다 증가시켜 폼 DOM을 새로 그리기 (이전 탭/모드의 DOM 잔여 영향 제거)
const formKey = ref(0)

// 셀렉트 옵션: 배열이면 그대로, 함수면 formData 기준으로 계산. 본부 변경 시 지사 등 dependent 필드 초기화에 사용
function getSelectOptions(field: FormField): { value: string; label: string }[] {
  if (!field.options) return []
  if (Array.isArray(field.options)) return field.options
  return field.options(formData.value)
}

// 필드 비활성화 여부 (disabled prop: boolean 또는 (formData) => boolean)
function isFieldDisabled(field: FormField): boolean {
  if (field.disabled === undefined) return false
  if (typeof field.disabled === 'boolean') return field.disabled
  return field.disabled(formData.value)
}

// IP가 4칸 모두 입력되었는지 확인
function isIpComplete(value: unknown): boolean {
  if (value === '' || value === undefined || value === null) return false
  const parts = String(value).split('.')
  if (parts.length !== 4) return false
  return parts.every((part) => part.trim() !== '')
}

// 필수값 미입력 시 에러 스타일(빨간 테두리) 표시 여부
function isRequiredEmpty(field: FormField): boolean {
  if (!field.required || isFieldDisabled(field)) return false
  const value = formData.value[field.id]
  if (field.type === 'ip') {
    return !isIpComplete(value)
  }
  return value === '' || value === undefined || value === null
}

// IpInput/PortInput에 전달할 class 바인딩
function inputClassFor(field: FormField) {
  return ['form-input', { 'form-input--required': field.required, 'form-input--error': isRequiredEmpty(field) }]
}

// 필드별 초기값 계산 (initialData는 부모가 열기 전에 이미 설정된 상태로 전달됨)
function getInitialValue(field: FormField): any {
  if (field.type === 'password') return ''
  if (field.type === 'hidden' && props.initialData && props.initialData[field.id] !== undefined) return props.initialData[field.id]
  if (props.initialData && props.initialData[field.id] !== undefined) return props.initialData[field.id]
  if (field.type === 'yesno') return 'N'
  if (field.type === 'toggle') {
    const opts = field.options
    const optionsArray = Array.isArray(opts) ? opts : opts?.(formData.value)
    if (optionsArray?.length) {
      const v = props.initialData && props.initialData[field.id]
      if (v !== undefined && v !== null && v !== '') return v
      return optionsArray[0].value
    }
  }
  if (field.type === 'number') return ''
  if (field.type === 'hidden') return ''
  return ''
}

// 모달이 열릴 때만 한 번 실행: 현재 fields 기준으로 formData를 새 객체로 교체. 다른 watch로 덮어쓰지 않아 입력 중 값이 초기화되는 현상 방지
watch(() => props.isOpen, (newValue) => {
  if (newValue && Array.isArray(props.fields) && props.fields.length > 0) {
    formKey.value += 1
    const next: Record<string, any> = {}
    for (const field of props.fields) {
      next[field.id] = getInitialValue(field)
    }
    formData.value = next
  }
}, { immediate: true, flush: 'sync' })

// 본부 변경 등으로 옵션이 바뀐 셀렉트: 현재 선택값이 옵션에 없으면 초기화
watch(formData, () => {
  for (const field of props.fields) {
    if (field.type !== 'select' || !field.options || Array.isArray(field.options)) continue
    const opts = field.options(formData.value)
    const current = formData.value[field.id]
    if (current !== '' && current != null && !opts.some(o => o.value === current)) {
      formData.value[field.id] = ''
    }
  }
}, { deep: true })

// 오버레이에서 드래그 후 밖에서 뗐을 때는 닫지 않도록, 다운·업 모두 오버레이일 때만 닫기
const mousedownOnOverlay = ref(false)
const handleOverlayMouseUp = () => {
  if (mousedownOnOverlay.value) {
    handleClose()
  }
  mousedownOnOverlay.value = false
}

const handleClose = () => {
  emit('close')
}

const handleSubmit = () => {
  const data = formData.value

  // 필수 필드 검증 (비활성화된 필드는 제외)
  const missingFields = props.fields
    .filter(field => isRequiredEmpty(field))
    .map(field => field.label ?? field.id)

  if (missingFields.length > 0) {
    const fieldList = missingFields.map((f) => `"${f}"`).join(', ')
    alertStore.show(
      `필수 입력 항목을 확인해주세요.\n입력되지 않은 항목: ${fieldList}`,
      'warning'
    )
    return
  }

  // 항목별 밸리데이션 (min, max, minLength, maxLength)
  for (const field of props.fields) {
    if (field.type === 'hidden') continue
    const value = data[field.id]
    const label = field.label ?? field.id

    if (field.type === 'number') {
      const num = value === '' || value === undefined || value === null ? NaN : Number(value)
      if (value !== '' && value !== undefined && value !== null && Number.isNaN(num)) {
        alertStore.show(`${label}에는 숫자만 입력할 수 있습니다.`, 'warning')
        return
      }
      if (field.min !== undefined && !Number.isNaN(num) && num < field.min) {
        alertStore.show(`${label}은(는) ${field.min} 이상이어야 합니다.`, 'warning')
        return
      }
      if (field.max !== undefined && !Number.isNaN(num) && num > field.max) {
        alertStore.show(`${label}은(는) ${field.max} 이하이어야 합니다.`, 'warning')
        return
      }
    }

    if ((field.type === 'text' || field.type === 'ip' || field.type === 'textarea' || field.type === 'password' || field.type === 'id') && value != null && value !== '') {
      const str = String(value)
      if (field.minLength !== undefined && str.length < field.minLength) {
        alertStore.show(`${label}은(는) ${field.minLength}자 이상이어야 합니다.`, 'warning')
        return
      }
      if (field.maxLength !== undefined && str.length > field.maxLength) {
        alertStore.show(`${label}은(는) ${field.maxLength}자 이하여야 합니다.`, 'warning')
        return
      }
      if ((field.type === 'text' || field.type === 'ip' || field.type === 'id') && field.pattern) {
        try {
          const re = new RegExp(field.pattern)
          if (!re.test(str)) {
            alertStore.show(field.patternMessage || `${label} 형식이 올바르지 않습니다.`, 'warning')
            return
          }
        } catch (_) {
          /* invalid regex ignore */
        }
      }
    }
  }

  emit('submit', { ...data })
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

.modal-container--large {
  max-width: 1200px;
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

.modal-body--large {
  padding: 16px;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-container--large {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px 16px;
}

.form-container--large > input[type="hidden"] {
  grid-column: 1 / -1;
  grid-row: 1;
  height: 0;
  overflow: hidden;
  margin: 0;
  padding: 0;
  border: 0;
}

.form-container--large .form-field {
  gap: 4px;
}

.form-container--large .form-hint {
  font-size: 0.75rem;
}

.form-container--large .form-field--wide {
  grid-column: 1 / -1;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #0f172a;
  letter-spacing: -0.01em;
}

.form-label-required {
  color: #2563eb;
  margin-left: 2px;
}

.form-input,
.form-select,
.form-textarea {
  padding: 10px 12px;
  border: 1px solid #94a3b8;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #0f172a;
  transition: all 0.2s;
  font-family: inherit;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #94a3b8;
}

/* 필수 필드: 항상 파란 테두리 */
.form-input--required,
.form-select--required,
.form-textarea--required {
  border-color: #2563eb;
}

/* 필수인데 비어 있을 때도 파란 테두리(강조) */
.form-input--error,
.form-select--error,
.form-textarea--error {
  border-color: #2563eb;
}

.form-input--error:focus,
.form-select--error:focus,
.form-textarea--error:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.form-hint {
  color: #64748b;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-input[readonly],
.form-select:disabled,
.form-textarea[readonly] {
  background-color: #f1f5f9;
  color: #64748b;
  cursor: not-allowed;
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

.form-toggle-group {
  display: flex;
  gap: 8px;
}

.form-toggle-button {
  padding: 8px 20px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #f8fafc;
  font-size: 0.875rem;
  color: #475569;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.form-toggle-button:hover {
  background: #e2e8f0;
  border-color: #94a3b8;
}

.form-toggle-button.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: #fff;
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

