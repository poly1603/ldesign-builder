/**
 * Alpine.js Intersect Directive
 * 用法: x-intersect="handleIntersect" 或 x-intersect.once="handleOnce"
 */
interface IntersectModifiers {
  once?: boolean
  half?: boolean
  full?: boolean
  threshold?: number
}

export function intersectDirective(
  el: HTMLElement,
  { expression, modifiers }: { expression: string; modifiers: string[] },
  { evaluate, cleanup }: { evaluate: (exp: string) => any; cleanup: (fn: () => void) => void }
) {
  const parsedModifiers: IntersectModifiers = {
    once: modifiers.includes('once'),
    half: modifiers.includes('half'),
    full: modifiers.includes('full')
  }

  // 确定阈值
  let threshold = 0
  if (parsedModifiers.half) threshold = 0.5
  if (parsedModifiers.full) threshold = 1

  // 检查是否有自定义阈值修饰符 (如 .threshold.75)
  const thresholdModifier = modifiers.find(m => /^\d+$/.test(m))
  if (thresholdModifier) {
    threshold = parseInt(thresholdModifier) / 100
  }

  const callback = (entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const handler = evaluate(expression)
        if (typeof handler === 'function') {
          handler(entry)
        }

        // 触发自定义事件
        el.dispatchEvent(new CustomEvent('intersect', {
          detail: { entry, isIntersecting: true }
        }))

        // 如果是 once 模式，观察后立即断开
        if (parsedModifiers.once) {
          observer.disconnect()
        }
      } else {
        // 离开视口时触发事件
        el.dispatchEvent(new CustomEvent('intersect-leave', {
          detail: { entry: entry, isIntersecting: false }
        }))
      }
    })
  }

  const observer = new IntersectionObserver(callback, {
    threshold,
    rootMargin: '0px'
  })

  observer.observe(el)

  // Cleanup
  cleanup(() => {
    observer.disconnect()
  })
}
