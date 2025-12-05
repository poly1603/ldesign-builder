/**
 * Alpine.js Modal Plugin
 */
export interface ModalOptions {
  closeOnEscape?: boolean
  closeOnClickOutside?: boolean
  lockScroll?: boolean
}

const defaultOptions: ModalOptions = {
  closeOnEscape: true,
  closeOnClickOutside: true,
  lockScroll: true
}

export function modalPlugin(Alpine: any) {
  Alpine.data('modal', (userOptions: Partial<ModalOptions> = {}) => {
    const options = { ...defaultOptions, ...userOptions }

    return {
      open: false,

      init() {
        if (options.closeOnEscape) {
          this.$watch('open', (isOpen: boolean) => {
            if (isOpen) {
              document.addEventListener('keydown', this.handleEscape.bind(this))
            } else {
              document.removeEventListener('keydown', this.handleEscape.bind(this))
            }
          })
        }

        if (options.lockScroll) {
          this.$watch('open', (isOpen: boolean) => {
            document.body.style.overflow = isOpen ? 'hidden' : ''
          })
        }
      },

      show() {
        this.open = true
        this.$dispatch('modal-opened')
      },

      hide() {
        this.open = false
        this.$dispatch('modal-closed')
      },

      toggle() {
        this.open ? this.hide() : this.show()
      },

      handleEscape(e: KeyboardEvent) {
        if (e.key === 'Escape' && this.open) {
          this.hide()
        }
      },

      handleClickOutside(e: MouseEvent) {
        if (options.closeOnClickOutside) {
          const target = e.target as HTMLElement
          if (target.classList.contains('modal-overlay')) {
            this.hide()
          }
        }
      }
    }
  })

  // Modal trigger directive
  Alpine.directive('modal-trigger', (el: HTMLElement, { expression }: any, { evaluate }: any) => {
    const modalId = expression

    el.addEventListener('click', () => {
      const modal = document.getElementById(modalId)
      if (modal) {
        const component = (Alpine as any).$data(modal)
        if (component && typeof component.show === 'function') {
          component.show()
        }
      }
    })
  })
}
