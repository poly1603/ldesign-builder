<template>
  <input
    :class="inputClasses"
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    @input="handleInput"
    @focus="handleFocus"
    @blur="handleBlur"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { InputProps } from './types'

const props = withDefaults(defineProps<InputProps>(), {
  type: 'text',
  size: 'medium',
  disabled: false,
  readonly: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const inputClasses = computed(() => [
  'ldesign-input',
  `ldesign-input--${props.size}`,
  props.disabled && 'ldesign-input--disabled',
  props.readonly && 'ldesign-input--readonly'
].filter(Boolean).join(' '))

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}
</script>

<style lang="less" scoped>
@border-color: #d9d9d9;
@focus-color: #1890ff;

.ldesign-input {
  display: inline-block;
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  line-height: 1.5;
  color: rgba(0, 0, 0, 0.85);
  background-color: #fff;
  border: 1px solid @border-color;
  border-radius: 4px;
  transition: all 0.3s;
  
  &:hover {
    border-color: @focus-color;
  }
  
  &:focus {
    border-color: @focus-color;
    outline: none;
    box-shadow: 0 0 0 2px fade(@focus-color, 20%);
  }
  
  &::placeholder {
    color: rgba(0, 0, 0, 0.25);
  }
  
  // 尺寸样式
  &--small {
    padding: 4px 8px;
    font-size: 12px;
  }
  
  &--medium {
    padding: 8px 12px;
    font-size: 14px;
  }
  
  &--large {
    padding: 12px 16px;
    font-size: 16px;
  }
  
  // 禁用状态
  &--disabled {
    cursor: not-allowed;
    background-color: #f5f5f5;
    color: rgba(0, 0, 0, 0.25);
    
    &:hover {
      border-color: @border-color;
    }
  }
  
  // 只读状态
  &--readonly {
    cursor: default;
    background-color: #fafafa;
  }
}
</style>

