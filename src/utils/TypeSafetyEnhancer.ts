/**
 * 类型安全增强器 (P1-1)
 * 
 * 提供类型安全工具和泛型约束,消除剩余的 any 类型
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

/**
 * 严格类型检查工具
 */
export class TypeGuards {
  /**
   * 检查是否为字符串
   */
  static isString(value: unknown): value is string {
    return typeof value === 'string'
  }

  /**
   * 检查是否为数字
   */
  static isNumber(value: unknown): value is number {
    return typeof value === 'number' && !isNaN(value)
  }

  /**
   * 检查是否为布尔值
   */
  static isBoolean(value: unknown): value is boolean {
    return typeof value === 'boolean'
  }

  /**
   * 检查是否为对象
   */
  static isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
  }

  /**
   * 检查是否为数组
   */
  static isArray<T = unknown>(value: unknown): value is T[] {
    return Array.isArray(value)
  }

  /**
   * 检查是否为函数
   */
  static isFunction(value: unknown): value is (...args: any[]) => any {
    return typeof value === 'function'
  }

  /**
   * 检查是否为 Promise
   */
  static isPromise<T = unknown>(value: unknown): value is Promise<T> {
    return value instanceof Promise || (
      TypeGuards.isObject(value) &&
      TypeGuards.isFunction((value as any).then)
    )
  }

  /**
   * 检查是否为 null 或 undefined
   */
  static isNullish(value: unknown): value is null | undefined {
    return value === null || value === undefined
  }

  /**
   * 检查是否有指定属性
   */
  static hasProperty<K extends string>(
    obj: unknown,
    key: K
  ): obj is Record<K, unknown> {
    return TypeGuards.isObject(obj) && key in obj
  }
}

/**
 * 类型安全的配置访问器
 */
export class SafeConfigAccessor<T extends Record<string, unknown>> {
  constructor(private config: T) {}

  /**
   * 安全获取字符串值
   */
  getString<K extends keyof T>(key: K, defaultValue: string = ''): string {
    const value = this.config[key]
    return TypeGuards.isString(value) ? value : defaultValue
  }

  /**
   * 安全获取数字值
   */
  getNumber<K extends keyof T>(key: K, defaultValue: number = 0): number {
    const value = this.config[key]
    return TypeGuards.isNumber(value) ? value : defaultValue
  }

  /**
   * 安全获取布尔值
   */
  getBoolean<K extends keyof T>(key: K, defaultValue: boolean = false): boolean {
    const value = this.config[key]
    return TypeGuards.isBoolean(value) ? value : defaultValue
  }

  /**
   * 安全获取对象值
   */
  getObject<K extends keyof T, R extends Record<string, unknown> = Record<string, unknown>>(
    key: K,
    defaultValue: R = {} as R
  ): R {
    const value = this.config[key]
    return TypeGuards.isObject(value) ? value as R : defaultValue
  }

  /**
   * 安全获取数组值
   */
  getArray<K extends keyof T, R = unknown>(
    key: K,
    defaultValue: R[] = []
  ): R[] {
    const value = this.config[key]
    return TypeGuards.isArray<R>(value) ? value : defaultValue
  }

  /**
   * 检查键是否存在
   */
  has<K extends keyof T>(key: K): boolean {
    return key in this.config
  }

  /**
   * 获取原始配置
   */
  getRaw(): T {
    return this.config
  }
}

/**
 * 类型安全的 JSON 解析
 */
export class SafeJSON {
  /**
   * 安全解析 JSON
   */
  static parse<T = unknown>(
    text: string,
    reviver?: (key: string, value: any) => any
  ): T | null {
    try {
      return JSON.parse(text, reviver) as T
    } catch {
      return null
    }
  }

  /**
   * 安全序列化 JSON
   */
  static stringify(
    value: unknown,
    replacer?: (key: string, value: any) => any,
    space?: string | number
  ): string | null {
    try {
      return JSON.stringify(value, replacer, space)
    } catch {
      return null
    }
  }
}

/**
 * 类型安全的异步操作
 */
export class SafeAsync {
  /**
   * 安全执行异步函数
   */
  static async execute<T>(
    fn: () => Promise<T>,
    defaultValue: T
  ): Promise<T> {
    try {
      return await fn()
    } catch {
      return defaultValue
    }
  }

  /**
   * 安全执行异步函数 (返回 Result)
   */
  static async executeWithResult<T, E = Error>(
    fn: () => Promise<T>
  ): Promise<Result<T, E>> {
    try {
      const value = await fn()
      return { success: true, value }
    } catch (error) {
      return { success: false, error: error as E }
    }
  }
}

/**
 * Result 类型
 */
export type Result<T, E = Error> =
  | { success: true; value: T }
  | { success: false; error: E }

/**
 * 类型安全的数组操作
 */
export class SafeArray {
  /**
   * 安全获取数组元素
   */
  static get<T>(array: T[], index: number): T | undefined {
    return array[index]
  }

  /**
   * 安全获取第一个元素
   */
  static first<T>(array: T[]): T | undefined {
    return array[0]
  }

  /**
   * 安全获取最后一个元素
   */
  static last<T>(array: T[]): T | undefined {
    return array[array.length - 1]
  }

  /**
   * 安全过滤 null/undefined
   */
  static compact<T>(array: (T | null | undefined)[]): T[] {
    return array.filter((item): item is T => !TypeGuards.isNullish(item))
  }

  /**
   * 安全去重
   */
  static unique<T>(array: T[]): T[] {
    return Array.from(new Set(array))
  }

  /**
   * 安全分组
   */
  static groupBy<T, K extends string | number>(
    array: T[],
    keyFn: (item: T) => K
  ): Record<K, T[]> {
    return array.reduce((acc, item) => {
      const key = keyFn(item)
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(item)
      return acc
    }, {} as Record<K, T[]>)
  }
}

/**
 * 类型安全的对象操作
 */
export class SafeObject {
  /**
   * 安全获取对象属性
   */
  static get<T extends Record<string, unknown>, K extends keyof T>(
    obj: T,
    key: K
  ): T[K] | undefined {
    return obj[key]
  }

  /**
   * 安全设置对象属性
   */
  static set<T extends Record<string, unknown>, K extends keyof T>(
    obj: T,
    key: K,
    value: T[K]
  ): T {
    return { ...obj, [key]: value }
  }

  /**
   * 安全删除对象属性
   */
  static omit<T extends Record<string, unknown>, K extends keyof T>(
    obj: T,
    ...keys: K[]
  ): Omit<T, K> {
    const result = { ...obj }
    for (const key of keys) {
      delete result[key]
    }
    return result
  }

  /**
   * 安全选择对象属性
   */
  static pick<T extends Record<string, unknown>, K extends keyof T>(
    obj: T,
    ...keys: K[]
  ): Pick<T, K> {
    const result = {} as Pick<T, K>
    for (const key of keys) {
      if (key in obj) {
        result[key] = obj[key]
      }
    }
    return result
  }
}

/**
 * 创建类型安全的配置访问器
 */
export function createSafeAccessor<T extends Record<string, unknown>>(
  config: T
): SafeConfigAccessor<T> {
  return new SafeConfigAccessor(config)
}

