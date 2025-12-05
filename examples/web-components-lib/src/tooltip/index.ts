/**
 * Tooltip Web Component
 */
const template = document.createElement('template')
template.innerHTML = `
  <style>
    :host {
      position: relative;
      display: inline-block;
    }
    
    .tooltip {
      position: absolute;
      background: #1f2937;
      color: white;
      padding: 6px 10px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.2s, visibility 0.2s;
      pointer-events: none;
    }
    
    :host(:hover) .tooltip,
    :host(:focus-within) .tooltip {
      opacity: 1;
      visibility: visible;
    }
    
    :host([placement="top"]) .tooltip {
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-bottom: 8px;
    }
    
    :host([placement="bottom"]) .tooltip {
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-top: 8px;
    }
    
    :host([placement="left"]) .tooltip {
      right: 100%;
      top: 50%;
      transform: translateY(-50%);
      margin-right: 8px;
    }
    
    :host([placement="right"]) .tooltip {
      left: 100%;
      top: 50%;
      transform: translateY(-50%);
      margin-left: 8px;
    }
    
    /* Arrow */
    .tooltip::after {
      content: '';
      position: absolute;
      border: 5px solid transparent;
    }
    
    :host([placement="top"]) .tooltip::after {
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border-top-color: #1f2937;
    }
    
    :host([placement="bottom"]) .tooltip::after {
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      border-bottom-color: #1f2937;
    }
  </style>
  <slot></slot>
  <div class="tooltip" part="tooltip">
    <slot name="content"></slot>
  </div>
`

export class LTooltip extends HTMLElement {
  static observedAttributes = ['placement', 'content']

  private tooltipEl: HTMLDivElement

  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })
    shadow.appendChild(template.content.cloneNode(true))
    this.tooltipEl = shadow.querySelector('.tooltip')!

    // 默认 placement
    if (!this.hasAttribute('placement')) {
      this.setAttribute('placement', 'top')
    }
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'content' && newValue) {
      this.tooltipEl.textContent = newValue
    }
  }

  get placement() { return this.getAttribute('placement') || 'top' }
  set placement(v: string) { this.setAttribute('placement', v) }

  get content() { return this.getAttribute('content') || '' }
  set content(v: string) { this.setAttribute('content', v) }
}

export function defineLTooltip(tagName = 'l-tooltip') {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, LTooltip)
  }
}
