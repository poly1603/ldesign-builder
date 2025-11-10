import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'

@customElement('l-button')
export class LButton extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
    }
    
    button {
      padding: 8px 16px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;
      background: #fff;
      color: rgba(0, 0, 0, 0.85);
    }
    
    button.primary {
      background: #1890ff;
      color: #fff;
      border-color: #1890ff;
    }
    
    button.danger {
      background: #ff4d4f;
      color: #fff;
      border-color: #ff4d4f;
    }
    
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `

  @property({ type: String }) type: 'primary' | 'default' | 'danger' = 'default'
  @property({ type: String }) size: 'small' | 'medium' | 'large' = 'medium'
  @property({ type: Boolean }) disabled = false

  render() {
    const classes = {
      primary: this.type === 'primary',
      danger: this.type === 'danger',
      [this.size]: true
    }

    return html`
      <button
        class=${classMap(classes)}
        ?disabled=${this.disabled}
        @click=${this._handleClick}
      >
        <slot></slot>
      </button>
    `
  }

  private _handleClick(e: Event) {
    if (!this.disabled) {
      this.dispatchEvent(new CustomEvent('l-click', { detail: e, bubbles: true, composed: true }))
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'l-button': LButton
  }
}

