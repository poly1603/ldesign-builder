/**
 * Lit Button Component
 */
import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

@customElement('lit-button')
export class LitButton extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
    }
    
    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
      font-family: inherit;
    }
    
    button:focus-visible {
      outline: 2px solid #0066ff;
      outline-offset: 2px;
    }
    
    /* Variants */
    .primary {
      background: #0066ff;
      color: white;
    }
    .primary:hover:not(:disabled) {
      background: #0052cc;
    }
    
    .secondary {
      background: #6c757d;
      color: white;
    }
    .secondary:hover:not(:disabled) {
      background: #5a6268;
    }
    
    .outline {
      background: transparent;
      color: #0066ff;
      border: 1px solid #0066ff;
    }
    .outline:hover:not(:disabled) {
      background: #0066ff;
      color: white;
    }
    
    .ghost {
      background: transparent;
      color: #0066ff;
    }
    .ghost:hover:not(:disabled) {
      background: rgba(0, 102, 255, 0.1);
    }
    
    /* Sizes */
    .sm { padding: 6px 12px; font-size: 12px; }
    .md { padding: 8px 16px; font-size: 14px; }
    .lg { padding: 12px 24px; font-size: 16px; }
    
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .loading {
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
  `

  @property({ type: String }) variant: ButtonVariant = 'primary'
  @property({ type: String }) size: ButtonSize = 'md'
  @property({ type: Boolean }) disabled = false
  @property({ type: Boolean }) loading = false

  private handleClick(e: Event) {
    if (this.disabled || this.loading) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    this.dispatchEvent(new CustomEvent('lit-click', { bubbles: true, composed: true }))
  }

  render() {
    return html`
      <button
        class="${this.variant} ${this.size} ${this.loading ? 'loading' : ''}"
        ?disabled=${this.disabled}
        @click=${this.handleClick}
      >
        ${this.loading ? html`<span class="spinner"></span>` : ''}
        <slot></slot>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lit-button': LitButton
  }
}
