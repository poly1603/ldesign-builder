import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('l-input')
export class LInput extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      width: 100%;
    }
    
    input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      transition: all 0.3s;
      box-sizing: border-box;
    }
    
    input:focus {
      border-color: #1890ff;
      outline: none;
    }
    
    input:disabled {
      background: #f5f5f5;
      cursor: not-allowed;
    }
  `

  @property({ type: String }) type: 'text' | 'password' | 'email' = 'text'
  @property({ type: String }) value = ''
  @property({ type: String }) placeholder = ''
  @property({ type: Boolean }) disabled = false

  render() {
    return html`
      <input
        type=${this.type}
        .value=${this.value}
        placeholder=${this.placeholder}
        ?disabled=${this.disabled}
        @input=${this._handleInput}
      />
    `
  }

  private _handleInput(e: Event) {
    const target = e.target as HTMLInputElement
    this.value = target.value
    this.dispatchEvent(new CustomEvent('l-input', { detail: this.value, bubbles: true, composed: true }))
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'l-input': LInput
  }
}

