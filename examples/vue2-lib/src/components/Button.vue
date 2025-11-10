<template>
  <button :class="buttonClasses" :disabled="disabled" @click="handleClick">
    <slot />
  </button>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'LButton',
  props: {
    type: { type: String, default: 'default' },
    size: { type: String, default: 'medium' },
    disabled: { type: Boolean, default: false }
  },
  computed: {
    buttonClasses(): string {
      return [
        'ldesign-button',
        `ldesign-button--${this.type}`,
        `ldesign-button--${this.size}`,
        this.disabled && 'ldesign-button--disabled'
      ].filter(Boolean).join(' ')
    }
  },
  methods: {
    handleClick(event: MouseEvent) {
      if (!this.disabled) {
        this.$emit('click', event)
      }
    }
  }
})
</script>

<style lang="less" scoped>
@primary-color: #1890ff;
.ldesign-button {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  &--primary { background: @primary-color; color: #fff; }
  &--disabled { opacity: 0.6; cursor: not-allowed; }
}
</style>

