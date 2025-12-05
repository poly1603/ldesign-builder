/**
 * 验证工具函数
 */

/** 邮箱验证 */
export function isEmail(str: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)
}

/** 手机号验证（中国） */
export function isPhone(str: string): boolean {
  return /^1[3-9]\d{9}$/.test(str)
}

/** URL 验证 */
export function isUrl(str: string): boolean {
  try {
    new URL(str)
    return true
  } catch {
    return false
  }
}

/** 身份证验证（中国） */
export function isIdCard(str: string): boolean {
  return /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(str)
}

/** 纯数字 */
export function isNumeric(str: string): boolean {
  return /^\d+$/.test(str)
}

/** 字母数字 */
export function isAlphanumeric(str: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(str)
}

/** 中文 */
export function isChinese(str: string): boolean {
  return /^[\u4e00-\u9fa5]+$/.test(str)
}

/** IP 地址 */
export function isIP(str: string): boolean {
  return /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/.test(str)
}

/** 密码强度 */
export function passwordStrength(password: string): 'weak' | 'medium' | 'strong' {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++

  if (score <= 2) return 'weak'
  if (score <= 4) return 'medium'
  return 'strong'
}

/** 必填验证 */
export function required(value: any): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return true
}

/** 长度验证 */
export function length(value: string, min: number, max?: number): boolean {
  const len = value.length
  if (max === undefined) return len >= min
  return len >= min && len <= max
}
