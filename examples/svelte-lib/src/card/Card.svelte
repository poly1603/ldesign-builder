<script>
  /** @type {string} */
  export let title = ''
  /** @type {boolean} */
  export let bordered = true
  /** @type {boolean} */
  export let shadow = false
</script>

<div
  class="card"
  class:bordered
  class:shadow
>
  {#if title}
    <div class="card-header">
      <h3 class="card-title">{title}</h3>
      <slot name="extra" />
    </div>
  {/if}
  <div class="card-body">
    <slot />
  </div>
  {#if $$slots.footer}
    <div class="card-footer">
      <slot name="footer" />
    </div>
  {/if}
</div>

<style>
  .card {
    background: white;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .bordered {
    border: 1px solid #e5e7eb;
  }
  
  .shadow {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .card-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }
  
  .card-body {
    padding: 16px;
  }
  
  .card-footer {
    padding: 12px 16px;
    border-top: 1px solid #e5e7eb;
    background: #f9fafb;
  }
</style>
