<template>
  <button
    :class="buttonClass"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ButtonProps } from '../shared/types'

const props = withDefaults(defineProps<ButtonProps>(), {
  type: 'default',
  size: 'medium',
  disabled: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClass = computed(() => [
  'btn',
  `btn--${props.type}`,
  `btn--${props.size}`,
  {
    'btn--disabled': props.disabled
  }
])

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<style scoped>
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn--default {
  background: #f0f0f0;
  color: #333;
}

.btn--primary {
  background: #1890ff;
  color: white;
}

.btn--medium {
  font-size: 14px;
}

.btn--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

