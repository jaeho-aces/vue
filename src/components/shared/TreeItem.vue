<template>
  <div class="tree-item">
    <button
      @click="toggle"
      class="tree-item-button flex items-center gap-2 w-full text-left px-2 py-1.5 rounded hover:bg-slate-50 transition-colors"
    >
      <component v-if="icon" :is="icon" :size="16" class="text-slate-400" />
      <span class="text-sm text-slate-700 flex-1">{{ label }}</span>
      <span v-if="hasChildren" class="text-xs text-slate-400">
        {{ isOpen ? '▼' : '▶' }}
      </span>
    </button>
    <div v-if="hasChildren && isOpen" class="tree-item-children ml-4 mt-1">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, useSlots } from 'vue'

interface Props {
  label: string
  icon?: any
  defaultOpen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  defaultOpen: false
})

const slots = useSlots()
const isOpen = ref(props.defaultOpen)
const hasChildren = computed(() => !!slots.default)

const toggle = () => {
  if (hasChildren.value) {
    isOpen.value = !isOpen.value
  }
}
</script>

<style scoped>
.tree-item {
  margin-bottom: 0.25rem;
}

.tree-item-button {
  font-size: 0.875rem;
}

.tree-item-children {
  border-left: 1px solid #e2e8f0;
  padding-left: 0.5rem;
}
</style>












