/**
 * 通用类型定义
 */

/**
 * 日志级别
 */
export type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug' | 'verbose'

/**
 * 构建模式
 */
export type BuildMode = 'development' | 'production'

/**
 * 文件路径类型
 */
export type FilePath = string

/**
 * 可选文件路径类型
 */
export type OptionalFilePath = string | undefined

/**
 * 验证结果
 */
export interface ValidationResult {
  /** 是否验证通过 */
  valid: boolean
  /** 错误信息列表 */
  errors: string[]
  /** 警告信息列表 */
  warnings: string[]
}

/**
 * 配置模式定义
 */
export interface ConfigSchema {
  type: string
  properties?: Record<string, any>
  required?: string[]
  [key: string]: any
}

/**
 * 事件监听器类型
 */
export type EventListener<T = any> = (data: T) => void | Promise<void>

/**
 * 错误信息
 */
export interface ErrorInfo {
  code: string
  message: string
  stack?: string
  suggestion?: string
}

/**
 * 警告信息
 */
export interface WarningInfo {
  code: string
  message: string
  suggestion?: string
}

/**
 * 文件信息
 */
export interface FileInfo {
  path: string
  size: number
  type: string
  content?: string
}

/**
 * 依赖信息
 */
export interface DependencyInfo {
  name: string
  version: string
  type: 'dependency' | 'devDependency' | 'peerDependency'
  optional?: boolean
}

/**
 * 项目信息
 */
export interface ProjectInfo {
  name: string
  version: string
  description?: string
  dependencies: DependencyInfo[]
  framework?: string
  typescript?: boolean
  packageManager?: 'npm' | 'yarn' | 'pnpm' | 'bun'
}

/**
 * 缓存选项
 */
export interface CacheOptions {
  enabled?: boolean
  dir?: string
  maxAge?: number
  maxSize?: number
}

/**
 * 监听选项
 */
export interface WatchOptions {
  include?: string | string[]
  exclude?: string | string[]
  ignored?: string | string[]
  persistent?: boolean
  ignoreInitial?: boolean
  followSymlinks?: boolean
  cwd?: string
  disableGlobbing?: boolean
  usePolling?: boolean
  interval?: number
  binaryInterval?: number
  alwaysStat?: boolean
  depth?: number
  awaitWriteFinish?: boolean | {
    stabilityThreshold?: number
    pollInterval?: number
  }
}

/**
 * 环境变量映射
 */
export type EnvironmentVariables = Record<string, string>

/**
 * 键值对映射
 */
export type KeyValueMap<T = any> = Record<string, T>

/**
 * 可选的键值对映射
 */
export type PartialKeyValueMap<T = any> = Partial<Record<string, T>>

/**
 * 深度部分类型
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * 深度必需类型
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P]
}

/**
 * 函数类型 - 使用更具体的类型参数
 */
export type AnyFunction<TArgs extends readonly unknown[] = readonly unknown[], TReturn = unknown> = (...args: TArgs) => TReturn

/**
 * 异步函数类型
 */
export type AsyncFunction<T = unknown, TArgs extends readonly unknown[] = readonly unknown[]> = (...args: TArgs) => Promise<T>

/**
 * 构造函数类型
 */
export type Constructor<T = {}, TArgs extends readonly unknown[] = readonly unknown[]> = new (...args: TArgs) => T

/**
 * 抽象构造函数类型
 */
export type AbstractConstructor<T = {}, TArgs extends readonly unknown[] = readonly unknown[]> = abstract new (...args: TArgs) => T

/**
 * 类型守卫函数
 */
export type TypeGuard<T> = (value: unknown) => value is T

/**
 * 谓词函数
 */
export type Predicate<T> = (value: T) => boolean

/**
 * 映射函数
 */
export type Mapper<T, U> = (value: T) => U

/**
 * 异步映射函数
 */
export type AsyncMapper<T, U> = (value: T) => Promise<U>

/**
 * 过滤函数
 */
export type Filter<T> = (value: T) => boolean

/**
 * 异步过滤函数
 */
export type AsyncFilter<T> = (value: T) => Promise<boolean>

/**
 * 归约函数
 */
export type Reducer<T, U> = (accumulator: U, current: T) => U

/**
 * 异步归约函数
 */
export type AsyncReducer<T, U> = (accumulator: U, current: T) => Promise<U>

/**
 * 比较函数
 */
export type Comparator<T> = (a: T, b: T) => number

/**
 * 相等比较函数
 */
export type EqualityComparator<T> = (a: T, b: T) => boolean

// ==================== 高级工具类型 ====================

/**
 * 可为 null 的类型
 * @template T - 源类型
 */
export type Nullable<T> = T | null

/**
 * 可为 undefined 的类型
 * @template T - 源类型
 */
export type Optional<T> = T | undefined

/**
 * 可为 null 或 undefined 的类型
 * @template T - 源类型
 */
export type Maybe<T> = T | null | undefined

/**
 * Promise 或同步值
 * @template T - 值类型
 */
export type MaybePromise<T> = T | Promise<T>

/**
 * 数组或单个元素
 * @template T - 元素类型
 */
export type MaybeArray<T> = T | T[]

/**
 * 提取 Promise 的内部类型
 * @template T - Promise 类型
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T

/**
 * 提取数组元素类型
 * @template T - 数组类型
 */
export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never

/**
 * 获取对象的所有键
 * @template T - 对象类型
 */
export type Keys<T> = keyof T

/**
 * 获取对象的所有值类型
 * @template T - 对象类型
 */
export type Values<T> = T[keyof T]

/**
 * 排除类型中的 null 和 undefined
 * @template T - 源类型
 */
export type NonNullable<T> = T extends null | undefined ? never : T

/**
 * 将对象的所有属性变为只读
 * @template T - 源类型
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

/**
 * 选择对象中的部分属性
 * @template T - 对象类型
 * @template K - 要选择的键
 */
export type PickPartial<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * 将指定属性变为必选
 * @template T - 对象类型
 * @template K - 要变为必选的键
 */
export type PickRequired<T, K extends keyof T> = T & Required<Pick<T, K>>

/**
 * 条件类型 - 如果 C 为 true 则返回 T，否则返回 F
 * @template C - 条件
 * @template T - 真值类型
 * @template F - 假值类型
 */
export type If<C extends boolean, T, F> = C extends true ? T : F

/**
 * 严格相等类型检查
 * @template T - 类型 A
 * @template U - 类型 B
 */
export type Equals<T, U> = (<G>() => G extends T ? 1 : 2) extends (<G>() => G extends U ? 1 : 2) ? true : false

/**
 * 字符串字面量类型
 */
export type StringLiteral<T> = T extends string ? (string extends T ? never : T) : never

/**
 * 联合类型转交叉类型
 * @template T - 联合类型
 */
export type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (x: infer R) => any ? R : never

// ==================== 类型守卫函数 ====================

/**
 * 检查值是否为字符串
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

/**
 * 检查值是否为数字
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value)
}

/**
 * 检查值是否为布尔值
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

/**
 * 检查值是否为函数
 */
export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function'
}

/**
 * 检查值是否为对象（非 null）
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * 检查值是否为数组
 */
export function isArray<T = unknown>(value: unknown): value is T[] {
  return Array.isArray(value)
}

/**
 * 检查值是否为 null 或 undefined
 */
export function isNullish(value: unknown): value is null | undefined {
  return value === null || value === undefined
}

/**
 * 检查值是否为 Promise
 */
export function isPromise<T = unknown>(value: unknown): value is Promise<T> {
  return value instanceof Promise || (
    isObject(value) && isFunction((value as any).then) && isFunction((value as any).catch)
  )
}

/**
 * 检查值是否为空对象
 */
export function isEmptyObject(value: unknown): value is Record<string, never> {
  return isObject(value) && Object.keys(value).length === 0
}

/**
 * 检查值是否为空数组
 */
export function isEmptyArray(value: unknown): value is [] {
  return Array.isArray(value) && value.length === 0
}

/**
 * 检查值是否为有效的文件路径（简单检查）
 */
export function isValidPath(value: unknown): value is string {
  return isString(value) && value.length > 0 && !value.includes('\0')
}

/**
 * 断言工具函数 - 在开发模式下抛出错误
 */
export function assert(condition: unknown, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message || 'Assertion failed')
  }
}

/**
 * 类型断言 - 永不返回
 */
export function assertNever(value: never, message?: string): never {
  throw new Error(message || `Unexpected value: ${JSON.stringify(value)}`)
}
