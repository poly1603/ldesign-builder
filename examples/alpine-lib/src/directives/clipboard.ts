/**
 * Alpine.js Clipboard Directive
 * 用法: x-clipboard="textToCopy" 或 x-clipboard="$el.textContent"
 */
export function clipboardDirective(
  el: HTMLElement,
  { expression }: { expression: string },
  { evaluate, effect }: { evaluate: (exp: string) => any; effect: (fn: () => void) => void }
) {
  let textToCopy = ''

  // 响应式更新要复制的文本
  effect(() => {
    textToCopy = evaluate(expression)
  })

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy)

      // 触发成功事件
      el.dispatchEvent(new CustomEvent('copied', {
        detail: { text: textToCopy, success: true }
      }))

      // 添加成功状态类
      el.classList.add('copied')
      setTimeout(() => el.classList.remove('copied'), 2000)
    } catch (error) {
      // 触发失败事件
      el.dispatchEvent(new CustomEvent('copied', {
        detail: { text: textToCopy, success: false, error }
      }))

      console.error('Failed to copy to clipboard:', error)
    }
  }

  el.addEventListener('click', copyToClipboard)
  el.style.cursor = 'pointer'

  // Cleanup
  return () => {
    el.removeEventListener('click', copyToClipboard)
  }
}
