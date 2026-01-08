<template>
  <div class="select-wrapper relative inline-block w-full">
    <select
      :class="['select', className]"
      :value="modelValue"
      @change="handleChange"
      v-bind="$attrs"
    >
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
    <div class="select-icon absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-400">
      <ChevronDown :size="14" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'

interface Option {
  value: string
  label: string
}

interface Props {
  modelValue?: string
  options: Option[]
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  className: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [event: Event]
}>()

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
  emit('change', event)
}
</script>

<style scoped>
.select-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
}

.select {
  width: 100%;
  appearance: none;
  background-color: #0f172a;
  border: 1px solid #334155;
  color: #e2e8f0;
  font-size: 0.875rem;
  border-radius: 0.25rem;
  padding: 0.5rem 2rem 0.5rem 0.75rem;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s;
}

.select:focus {
  border-color: #6366f1;
}

.select:hover {
  border-color: #475569;
}

.select-icon {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  padding: 0 0.5rem;
  pointer-events: none;
  color: #94a3b8;
}

.relative {
  position: relative;
}

.inline-block {
  display: inline-block;
}

.w-full {
  width: 100%;
}

.absolute {
  position: absolute;
}

.inset-y-0 {
  top: 0;
  bottom: 0;
}

.right-0 {
  right: 0;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.px-2 {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.pointer-events-none {
  pointer-events: none;
}

.text-slate-400 {
  color: #94a3b8;
}
</style>












