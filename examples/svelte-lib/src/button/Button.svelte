<script>
  import { classNames } from '../utils'
  
  /** @type {'primary' | 'secondary' | 'outline'} */
  export let variant = 'primary'
  /** @type {'sm' | 'md' | 'lg'} */
  export let size = 'md'
  /** @type {boolean} */
  export let disabled = false
  /** @type {boolean} */
  export let loading = false
</script>

<button
  class={classNames(
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    loading && 'btn-loading'
  )}
  {disabled}
  on:click
>
  {#if loading}
    <span class="spinner"></span>
  {/if}
  <slot />
</button>

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .btn-primary {
    background: #0066ff;
    color: white;
    border: none;
  }
  
  .btn-secondary {
    background: #6c757d;
    color: white;
    border: none;
  }
  
  .btn-outline {
    background: transparent;
    color: #0066ff;
    border: 1px solid #0066ff;
  }
  
  .btn-sm { padding: 6px 12px; font-size: 12px; }
  .btn-md { padding: 8px 16px; font-size: 14px; }
  .btn-lg { padding: 12px 24px; font-size: 16px; }
  
  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .btn-loading {
    pointer-events: none;
  }
  
  .spinner {
    width: 14px;
    height: 14px;
    border: 2px solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
    margin-right: 8px;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
