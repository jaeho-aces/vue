<template>
  <input
    :id="id"
    type="text"
    inputmode="numeric"
    :value="displayValue"
    :placeholder="placeholder"
    :required="required"
    :readonly="readonly"
    :disabled="disabled"
    :maxlength="maxLength"
    :class="inputClass"
    @input="handleInput"
    @keydown="handleKeydown"
    @paste="handlePaste"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue?: string | number
  id?: string
  placeholder?: string
  required?: boolean
  readonly?: boolean
  disabled?: boolean
  /** Vue class binding: string, object, or array of string/object */
  inputClass?: unknown
  maxLength?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxLength: 4
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const displayValue = computed(() => {
  const v = props.modelValue
  if (v === undefined || v === null) return ''
  return String(v)
})

function filterDigits(raw: string, maxLen: number): string {
  const digitsOnly = String(raw ?? '').replace(/\D/g, '')
  return digitsOnly.slice(0, Math.max(0, maxLen))
}

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement
  const result = filterDigits(target.value, props.maxLength)
  emit('update:modelValue', result)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.ctrlKey || e.metaKey || e.altKey) return
  const key = e.key
  if (key.length === 1 && !/\d/.test(key)) {
    e.preventDefault()
  }
  if (key.length === 1 && /\d/.test(key)) {
    const target = e.target as HTMLInputElement
    const selectionLength = (target.selectionEnd ?? 0) - (target.selectionStart ?? 0)
    const currentLength = target.value.length
    if (selectionLength === 0 && currentLength >= props.maxLength) {
      e.preventDefault()
    }
  }
}

function handlePaste(e: ClipboardEvent) {
  e.preventDefault()
  const raw = e.clipboardData?.getData('text') ?? ''
  const result = filterDigits(raw, props.maxLength)
  emit('update:modelValue', result)
}
</script>
