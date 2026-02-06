<template>
  <div class="ip-input-container">
    <input
      ref="inputRefs[0]"
      :id="id"
      type="text"
      inputmode="numeric"
      maxlength="3"
      :value="octets[0]"
      :placeholder="placeholder"
      :required="required"
      :readonly="readonly"
      :disabled="disabled"
      :class="['ip-input-segment', { 'ip-input-segment--required': required }, inputClass]"
      @input="handleInput(0, $event)"
      @keydown="handleKeydown(0, $event)"
      @paste="handlePaste"
    />
    <span class="ip-separator">.</span>
    <input
      ref="inputRefs[1]"
      type="text"
      inputmode="numeric"
      maxlength="3"
      :value="octets[1]"
      :required="required"
      :readonly="readonly"
      :disabled="disabled"
      :class="['ip-input-segment', { 'ip-input-segment--required': required }, inputClass]"
      @input="handleInput(1, $event)"
      @keydown="handleKeydown(1, $event)"
      @paste="handlePaste"
    />
    <span class="ip-separator">.</span>
    <input
      ref="inputRefs[2]"
      type="text"
      inputmode="numeric"
      maxlength="3"
      :value="octets[2]"
      :required="required"
      :readonly="readonly"
      :disabled="disabled"
      :class="['ip-input-segment', { 'ip-input-segment--required': required }, inputClass]"
      @input="handleInput(2, $event)"
      @keydown="handleKeydown(2, $event)"
      @paste="handlePaste"
    />
    <span class="ip-separator">.</span>
    <input
      ref="inputRefs[3]"
      type="text"
      inputmode="numeric"
      maxlength="3"
      :value="octets[3]"
      :required="required"
      :readonly="readonly"
      :disabled="disabled"
      :class="['ip-input-segment', { 'ip-input-segment--required': required }, inputClass]"
      @input="handleInput(3, $event)"
      @keydown="handleKeydown(3, $event)"
      @paste="handlePaste"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue?: string
  id?: string
  placeholder?: string
  required?: boolean
  readonly?: boolean
  disabled?: boolean
  /** Vue class binding: string, object, or array of string/object */
  inputClass?: unknown
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const octets = ref<string[]>(['', '', '', ''])
const inputRefs = [
  ref<HTMLInputElement | null>(null),
  ref<HTMLInputElement | null>(null),
  ref<HTMLInputElement | null>(null),
  ref<HTMLInputElement | null>(null)
]

function sanitizeOctet(raw: string): string {
  let val = String(raw ?? '').replace(/\D/g, '')
  if (val.length > 3) val = val.slice(0, 3)
  if (val === '') return ''
  const num = parseInt(val, 10)
  if (!Number.isNaN(num) && num > 255) return '255'
  return val
}

function splitIp(value: string | undefined): string[] {
  const parts = String(value ?? '').split('.')
  return [0, 1, 2, 3].map((i) => sanitizeOctet(parts[i] ?? ''))
}

function emitValue() {
  // 항상 현재 상태 emit (부분 입력도 유지, 필수 검증은 DataFormModal에서 처리)
  emit('update:modelValue', octets.value.join('.'))
}

function focusNext(index: number) {
  inputRefs[index + 1]?.value?.focus()
}

function focusPrev(index: number) {
  const prev = inputRefs[index - 1]?.value
  if (prev) {
    prev.focus()
    const len = prev.value.length
    prev.setSelectionRange(len, len)
  }
}

function handleInput(index: number, e: Event) {
  const target = e.target as HTMLInputElement
  const val = sanitizeOctet(target.value)
  octets.value[index] = val
  emitValue()
  if (val.length === 3 && index < 3) {
    focusNext(index)
  }
}

function handleKeydown(index: number, e: KeyboardEvent) {
  if (e.ctrlKey || e.metaKey || e.altKey) return
  if (e.key.length === 1 && !/\d|\./.test(e.key)) {
    e.preventDefault()
    return
  }
  if (e.key === '.') {
    e.preventDefault()
    if (index < 3) focusNext(index)
    return
  }
  if (e.key === 'Backspace') {
    const target = e.target as HTMLInputElement
    if (target.value === '' && index > 0) {
      e.preventDefault()
      focusPrev(index)
    }
  }
}

function handlePaste(e: ClipboardEvent) {
  e.preventDefault()
  const text = e.clipboardData?.getData('text') ?? ''
  const parts = String(text).split('.').map(sanitizeOctet)
  octets.value = [
    parts[0] || '',
    parts[1] || '',
    parts[2] || '',
    parts[3] || ''
  ]
  emitValue()
}

watch(
  () => props.modelValue,
  (newValue) => {
    octets.value = splitIp(newValue)
  },
  { immediate: true }
)
</script>

<style scoped>
.ip-input-container {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.ip-input-segment {
  width: 3.5rem;
  text-align: center;
  padding: 10px 12px;
  border: 1px solid #94a3b8;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #0f172a;
  transition: all 0.2s;
  font-family: inherit;
}

.ip-input-segment--required {
  border-color: #2563eb;
}

.ip-input-segment::placeholder {
  color: #94a3b8;
}

.ip-input-segment:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.ip-input-segment[readonly],
.ip-input-segment:disabled {
  background-color: #f1f5f9;
  color: #64748b;
  cursor: not-allowed;
}

.ip-separator {
  color: #64748b;
  font-weight: 500;
  user-select: none;
}
</style>
