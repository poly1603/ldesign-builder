/**
 * DOM 工具函数
 */

/** 获取元素 */
export function $(selector: string, parent: Element | Document = document): Element | null {
  return parent.querySelector(selector)
}

/** 获取多个元素 */
export function $$(selector: string, parent: Element | Document = document): Element[] {
  return Array.from(parent.querySelectorAll(selector))
}

/** 添加事件监听 */
export function on<K extends keyof HTMLElementEventMap>(
  el: HTMLElement,
  event: K,
  handler: (e: HTMLElementEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions
): () => void {
  el.addEventListener(event, handler as EventListener, options)
  return () => el.removeEventListener(event, handler as EventListener, options)
}

/** 添加类名 */
export function addClass(el: HTMLElement, ...classes: string[]): void {
  el.classList.add(...classes)
}

/** 移除类名 */
export function removeClass(el: HTMLElement, ...classes: string[]): void {
  el.classList.remove(...classes)
}

/** 切换类名 */
export function toggleClass(el: HTMLElement, className: string, force?: boolean): boolean {
  return el.classList.toggle(className, force)
}

/** 是否有类名 */
export function hasClass(el: HTMLElement, className: string): boolean {
  return el.classList.contains(className)
}

/** 获取/设置样式 */
export function css(el: HTMLElement, prop: string): string
export function css(el: HTMLElement, prop: string, value: string): void
export function css(el: HTMLElement, styles: Record<string, string>): void
export function css(el: HTMLElement, propOrStyles: string | Record<string, string>, value?: string): string | void {
  if (typeof propOrStyles === 'string') {
    if (value === undefined) {
      return getComputedStyle(el).getPropertyValue(propOrStyles)
    }
    el.style.setProperty(propOrStyles, value)
  } else {
    Object.entries(propOrStyles).forEach(([k, v]) => el.style.setProperty(k, v))
  }
}

/** 获取元素位置 */
export function getRect(el: HTMLElement): DOMRect {
  return el.getBoundingClientRect()
}

/** 滚动到元素 */
export function scrollTo(el: HTMLElement, options?: ScrollIntoViewOptions): void {
  el.scrollIntoView({ behavior: 'smooth', ...options })
}

/** 复制到剪贴板 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const result = document.execCommand('copy')
    document.body.removeChild(textarea)
    return result
  }
}
