/**
 * Button Web Component
 */
const template = document.createElement('template')
template.innerHTML = `
  <style>
    :host {
      display: inline-block;
    }
    
    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
      outline: none;
    }
    
    button:focus-visible {
      box-shadow: 0 0 0 2px rgba(0, 102, 255, 0.3);
    }
    
    :host([variant="primary"]) button {
      background: #0066ff;
      color: white;
    }
    
    :host([variant="primary"]) button:hover {
      background: #0052cc;
    }
    
    :host([variant="secondary"]) button {
      background: #6c757d;
      color: white;
    }
    
    :host([variant="outline"]) button {
      background: transparent;
      color: #0066ff;
      border: 1px solid #0066ff;
    }
    
    :host([size="sm"]) button {
      padding: 6px 12px;
      font-size: 12px;
    }
    
    :host([size="lg"]) button {
      padding: 12px 24px;
      font-size: 16px;
    }
    
    :host([disabled]) button {
      opacity: 0.6;
      cursor: not-allowed;
      pointer-events: none;
    }
  </style>
  <button part="button">
    <slot></slot>
  </button>
`

export class LButton extends HTMLElement {
  static observedAttributes = ['variant', 'size', 'disabled', 'loading']

  private button: HTMLButtonElement

  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })
    shadow.appendChild(template.content.cloneNode(true))
    this.button = shadow.querySelector('button')!
  }

  connectedCallback() {
    this.button.addEventListener('click', this.handleClick.bind(this))
  }

  disconnectedCallback() {
    this.button.removeEventListener('click', this.handleClick.bind(this))
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'disabled') {
      this.button.disabled = newValue !== null
    }
  }

  private handleClick(e: Event) {
    if (this.hasAttribute('disabled')) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    this.dispatchEvent(new CustomEvent('l-click', { bubbles: true, composed: true }))
  }

  get variant() { return this.getAttribute('variant') || 'primary' }
  set variant(v: string) { this.setAttribute('variant', v) }

  get size() { return this.getAttribute('size') || 'md' }
  set size(v: string) { this.setAttribute('size', v) }

  get disabled() { return this.hasAttribute('disabled') }
  set disabled(v: boolean) { v ? this.setAttribute('disabled', '') : this.removeAttribute('disabled') }
}

export function defineLButton(tagName = 'l-button') {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, LButton)
  }
}
