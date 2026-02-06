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
  min?: number
  max?: number
  id?: string
  placeholder?: string
  required?: boolean
  readonly?: boolean
  disabled?: boolean
  /** Vue class binding: string, object, or array of string/object */
  inputClass?: unknown
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 65535
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const displayValue = computed(() => {
  const v = props.modelValue
  if (v === undefined || v === null) return ''
  return String(v)
})

function clampToRange(value: number): number {
  let n = value
  if (!Number.isFinite(n)) return props.min
  if (n < props.min) n = props.min
  if (n > props.max) n = props.max
  return n
}

function filterAndClamp(raw: string): string {
  const digitsOnly = String(raw ?? '').replace(/\D/g, '')
  if (digitsOnly === '') return ''
  const num = parseInt(digitsOnly, 10)
  if (Number.isNaN(num)) return ''
  const clamped = clampToRange(num)
  return String(clamped)
}

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement
  const result = filterAndClamp(target.value)
  emit('update:modelValue', result)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.ctrlKey || e.metaKey || e.altKey) return
  const key = e.key
  if (key.length === 1 && !/\d/.test(key)) {
    e.preventDefault()
  }
}

function handlePaste(e: ClipboardEvent) {
  e.preventDefault()
  const raw = e.clipboardData?.getData('text') ?? ''
  const result = filterAndClamp(raw)
  emit('update:modelValue', result)
}
</script>
