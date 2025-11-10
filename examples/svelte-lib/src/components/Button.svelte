<script lang="ts">
  export let type: 'primary' | 'default' | 'danger' = 'default'
  export let size: 'small' | 'medium' | 'large' = 'medium'
  export let disabled = false

  $: buttonClasses = [
    'ldesign-button',
    `ldesign-button--${type}`,
    `ldesign-button--${size}`,
    disabled && 'ldesign-button--disabled'
  ].filter(Boolean).join(' ')

  function handleClick(event: MouseEvent) {
    if (!disabled) {
      // Dispatch custom event
    }
  }
</script>

<button class={buttonClasses} {disabled} on:click={handleClick}>
  <slot />
</button>

<style lang="less">
  @primary-color: #1890ff;
  .ldesign-button {
    padding: 8px 16px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;
    
    &--primary {
      background: @primary-color;
      color: #fff;
      border-color: @primary-color;
    }
    
    &--disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
</style>

