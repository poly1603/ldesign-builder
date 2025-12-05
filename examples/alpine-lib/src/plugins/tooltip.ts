/**
 * Alpine.js Tooltip Plugin
 */
export interface TooltipOptions {
  placement?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  offset?: number
}

const defaultOptions: TooltipOptions = {
  placement: 'top',
  delay: 0,
  offset: 8
}

export function tooltipPlugin(Alpine: any) {
  Alpine.directive('tooltip', (el: HTMLElement, { expression }: any, { evaluate }: any) => {
    const options = { ...defaultOptions, ...evaluate(expression) }
    let tooltipEl: HTMLDivElement | null = null
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const showTooltip = () => {
      if (timeoutId) clearTimeout(timeoutId)

      timeoutId = setTimeout(() => {
        tooltipEl = document.createElement('div')
        tooltipEl.className = 'alpine-tooltip'
        tooltipEl.textContent = el.getAttribute('data-tooltip') || ''
        tooltipEl.style.cssText = `
          position: absolute;
          background: #1f2937;
          color: white;
          padding: 6px 10px;
          border-radius: 4px;
          font-size: 12px;
          z-index: 9999;
          pointer-events: none;
        `

        document.body.appendChild(tooltipEl)
        positionTooltip(el, tooltipEl, options)
      }, options.delay)
    }

    const hideTooltip = () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      if (tooltipEl) {
        tooltipEl.remove()
        tooltipEl = null
      }
    }

    el.addEventListener('mouseenter', showTooltip)
    el.addEventListener('mouseleave', hideTooltip)
    el.addEventListener('focus', showTooltip)
    el.addEventListener('blur', hideTooltip)

    // Cleanup
    return () => {
      hideTooltip()
      el.removeEventListener('mouseenter', showTooltip)
      el.removeEventListener('mouseleave', hideTooltip)
      el.removeEventListener('focus', showTooltip)
      el.removeEventListener('blur', hideTooltip)
    }
  })
}

function positionTooltip(target: HTMLElement, tooltip: HTMLElement, options: TooltipOptions) {
  const rect = target.getBoundingClientRect()
  const tooltipRect = tooltip.getBoundingClientRect()
  const offset = options.offset || 8

  let top = 0
  let left = 0

  switch (options.placement) {
    case 'top':
      top = rect.top - tooltipRect.height - offset
      left = rect.left + (rect.width - tooltipRect.width) / 2
      break
    case 'bottom':
      top = rect.bottom + offset
      left = rect.left + (rect.width - tooltipRect.width) / 2
      break
    case 'left':
      top = rect.top + (rect.height - tooltipRect.height) / 2
      left = rect.left - tooltipRect.width - offset
      break
    case 'right':
      top = rect.top + (rect.height - tooltipRect.height) / 2
      left = rect.right + offset
      break
  }

  tooltip.style.top = `${top + window.scrollY}px`
  tooltip.style.left = `${left + window.scrollX}px`
}
