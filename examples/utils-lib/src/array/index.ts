/**
 * 数组工具函数
 */

/** 数组去重 */
export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)]
}

/** 按属性去重 */
export function uniqueBy<T>(arr: T[], key: keyof T): T[] {
  const seen = new Set()
  return arr.filter(item => {
    const k = item[key]
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

/** 数组分组 */
export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = String(item[key])
      ; (acc[k] = acc[k] || []).push(item)
    return acc
  }, {} as Record<string, T[]>)
}

/** 数组分块 */
export function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}

/** 数组扁平化 */
export function flatten<T>(arr: (T | T[])[]): T[] {
  return arr.flat() as T[]
}

/** 深度扁平化 */
export function flattenDeep<T>(arr: any[]): T[] {
  return arr.flat(Infinity) as T[]
}

/** 数组差集 */
export function difference<T>(arr1: T[], arr2: T[]): T[] {
  const set = new Set(arr2)
  return arr1.filter(item => !set.has(item))
}

/** 数组交集 */
export function intersection<T>(arr1: T[], arr2: T[]): T[] {
  const set = new Set(arr2)
  return arr1.filter(item => set.has(item))
}

/** 数组并集 */
export function union<T>(...arrays: T[][]): T[] {
  return unique(arrays.flat())
}

/** 随机打乱数组 */
export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/** 获取随机元素 */
export function sample<T>(arr: T[]): T | undefined {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** 获取多个随机元素 */
export function sampleSize<T>(arr: T[], size: number): T[] {
  return shuffle(arr).slice(0, size)
}

/** 数组求和 */
export function sum(arr: number[]): number {
  return arr.reduce((acc, val) => acc + val, 0)
}

/** 数组平均值 */
export function average(arr: number[]): number {
  return arr.length ? sum(arr) / arr.length : 0
}

/** 获取最大值 */
export function max(arr: number[]): number {
  return Math.max(...arr)
}

/** 获取最小值 */
export function min(arr: number[]): number {
  return Math.min(...arr)
}

/** 范围数组 */
export function range(start: number, end: number, step = 1): number[] {
  const result: number[] = []
  for (let i = start; i < end; i += step) {
    result.push(i)
  }
  return result
}
