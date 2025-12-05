/**
 * Modal Web Component
 */
const template = document.createElement('template')
template.innerHTML = `
  <style>
    :host {
      display: none;
    }
    
    :host([open]) {
      display: block;
    }
    
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.2s ease;
    }
    
    .modal {
      background: white;
      border-radius: 12px;
      min-width: 400px;
      max-width: 90vw;
      max-height: 90vh;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      animation: slideIn 0.2s ease;
    }
    
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
    
    .close-btn {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #6b7280;
      padding: 4px;
      line-height: 1;
    }
    
    .close-btn:hover {
      color: #374151;
    }
    
    .body {
      padding: 20px;
      overflow-y: auto;
    }
    
    .footer {
      padding: 12px 20px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideIn {
      from { transform: translateY(-20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  </style>
  <div class="overlay" part="overlay">
    <div class="modal" part="modal">
      <div class="header" part="header">
        <h3 class="title"><slot name="title">Modal Title</slot></h3>
        <button class="close-btn" part="close-btn">&times;</button>
      </div>
      <div class="body" part="body">
        <slot></slot>
      </div>
      <div class="footer" part="footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
`

export class LModal extends HTMLElement {
  static observedAttributes = ['open', 'title']

  private overlay: HTMLDivElement
  private closeBtn: HTMLButtonElement

  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })
    shadow.appendChild(template.content.cloneNode(true))
    this.overlay = shadow.querySelector('.overlay')!
    this.closeBtn = shadow.querySelector('.close-btn')!
  }

  connectedCallback() {
    this.closeBtn.addEventListener('click', () => this.close())
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close()
    })
    document.addEventListener('keydown', this.handleKeydown)
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this.handleKeydown)
  }

  private handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.open) {
      this.close()
    }
  }

  open() {
    this.setAttribute('open', '')
    this.dispatchEvent(new CustomEvent('l-open', { bubbles: true }))
  }

  close() {
    this.removeAttribute('open')
    this.dispatchEvent(new CustomEvent('l-close', { bubbles: true }))
  }

  get isOpen() { return this.hasAttribute('open') }
}

export function defineLModal(tagName = 'l-modal') {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, LModal)
  }
}
