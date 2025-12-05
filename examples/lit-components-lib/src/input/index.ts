/**
 * Lit Input Component
 */
import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'

export type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url'

@customElement('lit-input')
export class LitInput extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
    
    .input-wrapper {
      position: relative;
    }
    
    input {
      width: 100%;
      padding: 8px 12px;
      font-size: 14px;
      line-height: 1.5;
      color: #1f2937;
      background: white;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
      box-sizing: border-box;
    }
    
    input:focus {
      border-color: #0066ff;
      box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
    }
    
    input:disabled {
      background: #f3f4f6;
      cursor: not-allowed;
    }
    
    input.error {
      border-color: #ef4444;
    }
    
    input.error:focus {
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
    
    .label {
      display: block;
      margin-bottom: 6px;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
    }
    
    .helper {
      margin-top: 4px;
      font-size: 12px;
      color: #6b7280;
    }
    
    .error-text {
      margin-top: 4px;
      font-size: 12px;
      color: #ef4444;
    }
    
    .prefix, .suffix {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      color: #6b7280;
    }
    
    .prefix { left: 12px; }
    .suffix { right: 12px; }
    
    input.has-prefix { padding-left: 36px; }
    input.has-suffix { padding-right: 36px; }
  `

  @property({ type: String }) type: InputType = 'text'
  @property({ type: String }) value = ''
  @property({ type: String }) placeholder = ''
  @property({ type: String }) label = ''
  @property({ type: String }) helper = ''
  @property({ type: String }) error = ''
  @property({ type: Boolean }) disabled = false
  @property({ type: Boolean }) required = false

  @state() private focused = false

  private handleInput(e: Event) {
    const input = e.target as HTMLInputElement
    this.value = input.value
    this.dispatchEvent(new CustomEvent('lit-input', {
      detail: { value: this.value },
      bubbles: true,
      composed: true
    }))
  }

  private handleChange(e: Event) {
    this.dispatchEvent(new CustomEvent('lit-change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true
    }))
  }

  render() {
    const inputClasses = [
      this.error ? 'error' : ''
    ].filter(Boolean).join(' ')

    return html`
      ${this.label ? html`
        <label class="label">
          ${this.label}
          ${this.required ? html`<span style="color: #ef4444;">*</span>` : ''}
        </label>
      ` : ''}
      
      <div class="input-wrapper">
        <slot name="prefix" class="prefix"></slot>
        <input
          type=${this.type}
          class=${inputClasses}
          .value=${this.value}
          placeholder=${this.placeholder}
          ?disabled=${this.disabled}
          ?required=${this.required}
          @input=${this.handleInput}
          @change=${this.handleChange}
          @focus=${() => this.focused = true}
          @blur=${() => this.focused = false}
        />
        <slot name="suffix" class="suffix"></slot>
      </div>
      
      ${this.error ? html`<div class="error-text">${this.error}</div>` : ''}
      ${this.helper && !this.error ? html`<div class="helper">${this.helper}</div>` : ''}
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lit-input': LitInput
  }
}
