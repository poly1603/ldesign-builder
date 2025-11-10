<script lang="ts">
  export let type: 'text' | 'password' | 'email' = 'text'
  export let size: 'small' | 'medium' | 'large' = 'medium'
  export let value = ''
  export let placeholder = ''
  export let disabled = false

  $: inputClasses = [
    'ldesign-input',
    `ldesign-input--${size}`,
    disabled && 'ldesign-input--disabled'
  ].filter(Boolean).join(' ')

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement
    value = target.value
  }
</script>

<input
  class={inputClasses}
  {type}
  {value}
  {placeholder}
  {disabled}
  on:input={handleInput}
  on:focus
  on:blur
/>

<style lang="less">
  .ldesign-input {
    padding: 8px 12px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    transition: all 0.3s;
    
    &:focus {
      border-color: #1890ff;
      outline: none;
    }
    
    &--disabled {
      background: #f5f5f5;
      cursor: not-allowed;
    }
  }
</style>

