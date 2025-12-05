/**
 * 对象工具函数
 */

/** 深拷贝 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(deepClone) as unknown as T
  const result = {} as T
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = deepClone(obj[key])
    }
  }
  return result
}

/** 深度合并 */
export function deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target
  const source = sources.shift()
  if (source) {
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const sourceVal = source[key]
        const targetVal = target[key]
        if (isPlainObject(sourceVal) && isPlainObject(targetVal)) {
          target[key as keyof T] = deepMerge(targetVal, sourceVal as any)
        } else {
          target[key as keyof T] = sourceVal as T[keyof T]
        }
      }
    }
  }
  return deepMerge(target, ...sources)
}

/** 是否为纯对象 */
export function isPlainObject(val: unknown): val is Record<string, any> {
  return Object.prototype.toString.call(val) === '[object Object]'
}

/** 选取对象属性 */
export function pick<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>
  keys.forEach(key => {
    if (key in obj) result[key] = obj[key]
  })
  return result
}

/** 排除对象属性 */
export function omit<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj }
  keys.forEach(key => delete result[key])
  return result
}

/** 获取嵌套属性 */
export function get<T = any>(obj: Record<string, any>, path: string, defaultValue?: T): T {
  const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.')
  let result: any = obj
  for (const key of keys) {
    if (result == null) return defaultValue as T
    result = result[key]
  }
  return (result ?? defaultValue) as T
}

/** 设置嵌套属性 */
export function set(obj: Record<string, any>, path: string, value: any): void {
  const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.')
  let current = obj
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!(key in current)) {
      current[key] = /^\d+$/.test(keys[i + 1]) ? [] : {}
    }
    current = current[key]
  }
  current[keys[keys.length - 1]] = value
}

/** 对象转查询字符串 */
export function toQueryString(obj: Record<string, any>): string {
  return Object.entries(obj)
    .filter(([, v]) => v != null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')
}

/** 查询字符串转对象 */
export function parseQueryString(str: string): Record<string, string> {
  return str
    .replace(/^\?/, '')
    .split('&')
    .reduce((acc, pair) => {
      const [key, value] = pair.split('=').map(decodeURIComponent)
      if (key) acc[key] = value
      return acc
    }, {} as Record<string, string>)
}

/** 检查对象是否为空 */
export function isEmpty(obj: Record<string, any>): boolean {
  return Object.keys(obj).length === 0
}
