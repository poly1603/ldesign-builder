/**
 * 字符串工具函数
 */

/** 首字母大写 */
export function capitalize(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/** 驼峰转短横线 */
export function kebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

/** 短横线转驼峰 */
export function camelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
}

/** 短横线转帕斯卡 */
export function pascalCase(str: string): string {
  return capitalize(camelCase(str))
}

/** 截断字符串 */
export function truncate(str: string, length: number, suffix = '...'): string {
  if (str.length <= length) return str
  return str.slice(0, length - suffix.length) + suffix
}

/** 移除 HTML 标签 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

/** 转义 HTML */
export function escapeHtml(str: string): string {
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }
  return str.replace(/[&<>"']/g, char => escapeMap[char])
}

/** 生成随机字符串 */
export function randomString(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

/** 模板字符串替换 */
export function template(str: string, data: Record<string, any>): string {
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] ?? '')
}

/** 字符串填充 */
export function padStart(str: string, length: number, char = ' '): string {
  return str.padStart(length, char)
}

export function padEnd(str: string, length: number, char = ' '): string {
  return str.padEnd(length, char)
}
