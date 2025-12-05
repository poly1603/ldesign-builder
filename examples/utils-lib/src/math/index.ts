/**
 * 数学工具函数
 */

/** 限制数值范围 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** 四舍五入到指定小数位 */
export function round(value: number, decimals = 0): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

/** 随机整数 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/** 随机浮点数 */
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

/** 线性插值 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t
}

/** 角度转弧度 */
export function degToRad(deg: number): number {
  return deg * (Math.PI / 180)
}

/** 弧度转角度 */
export function radToDeg(rad: number): number {
  return rad * (180 / Math.PI)
}

/** 百分比 */
export function percentage(value: number, total: number): number {
  return total === 0 ? 0 : (value / total) * 100
}

/** 精确除法 */
export function divide(a: number, b: number, defaultValue = 0): number {
  return b === 0 ? defaultValue : a / b
}
