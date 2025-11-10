<template>
  <input
    :class="inputClasses"
    :type="type"
    :value="value"
    :placeholder="placeholder"
    :disabled="disabled"
    @input="handleInput"
  />
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'LInput',
  props: {
    type: { type: String, default: 'text' },
    size: { type: String, default: 'medium' },
    value: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    disabled: { type: Boolean, default: false }
  },
  computed: {
    inputClasses(): string {
      return [
        'ldesign-input',
        `ldesign-input--${this.size}`,
        this.disabled && 'ldesign-input--disabled'
      ].filter(Boolean).join(' ')
    }
  },
  methods: {
    handleInput(event: Event) {
      const target = event.target as HTMLInputElement
      this.$emit('input', target.value)
    }
  }
})
</script>

<style lang="less" scoped>
.ldesign-input {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  &:focus { border-color: #1890ff; outline: none; }
  &--disabled { background: #f5f5f5; cursor: not-allowed; }
}
</style>

