/**
 * Lit Card Component
 */
import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

export interface CardProps {
  title?: string
  bordered?: boolean
  shadow?: boolean
}

@customElement('lit-card')
export class LitCard extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
    
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
    
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
    }
    
    .body {
      padding: 16px;
    }
    
    .footer {
      padding: 12px 16px;
      border-top: 1px solid #e5e7eb;
      background: #f9fafb;
    }
  `

  @property({ type: String }) cardTitle = ''
  @property({ type: Boolean }) bordered = true
  @property({ type: Boolean }) shadow = false

  render() {
    const classes = [
      'card',
      this.bordered ? 'bordered' : '',
      this.shadow ? 'shadow' : ''
    ].filter(Boolean).join(' ')

    return html`
      <div class=${classes}>
        ${this.cardTitle ? html`
          <div class="header">
            <h3 class="title">${this.cardTitle}</h3>
            <slot name="extra"></slot>
          </div>
        ` : ''}
        <div class="body">
          <slot></slot>
        </div>
        <slot name="footer">
          <div class="footer" style="display: none;"></div>
        </slot>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lit-card': LitCard
  }
}
