/**
 * 严格类型定义
 * 
 * 用于替换项目中的 any 类型使用，提供类型安全保障
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

/**
 * 通用 JSON 值类型
 */
export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue }

/**
 * 通用对象类型
 */
export type PlainObject<T = unknown> = Record<string, T>

/**
 * 深度部分类型
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? DeepPartial<T[P]>
    : T[P]
}

/**
 * 深度只读类型
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P]
}

/**
 * 非空类型
 */
export type NonNullish<T> = T extends null | undefined ? never : T

/**
 * 可能为空类型
 */
export type Nullable<T> = T | null | undefined

/**
 * 数组元素类型
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never

/**
 * Promise 解包类型
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T

/**
 * 函数类型
 */
export type AnyFunction = (...args: any[]) => any

/**
 * 异步函数类型
 */
export type AsyncFunction<T = any> = (...args: any[]) => Promise<T>

/**
 * 回调函数类型
 */
export type Callback<T = void> = (error?: Error, result?: T) => void

/**
 * 事件处理器类型
 */
export type EventHandler<T = any> = (event: T) => void | Promise<void>

/**
 * 构造函数类型
 */
export type Constructor<T = any> = new (...args: any[]) => T

/**
 * 抽象构造函数类型
 */
export type AbstractConstructor<T = any> = abstract new (...args: any[]) => T

/**
 * 类类型（构造函数或抽象构造函数）
 */
export type Class<T = any> = Constructor<T> | AbstractConstructor<T>

// ==================== 插件相关类型 ====================

/**
 * 插件配置选项
 */
export interface PluginOptions {
  [key: string]: JSONValue
}

/**
 * 插件上下文数据
 */
export interface PluginContextData {
  [key: string]: unknown
}

/**
 * 插件钩子参数
 */
export type PluginHookArgs = unknown[]

/**
 * 插件钩子返回值
 */
export type PluginHookResult<T = unknown> = T | Promise<T>

// ==================== 配置相关类型 ====================

/**
 * 配置值类型
 */
export type ConfigValue = 
  | string
  | number
  | boolean
  | null
  | undefined
  | ConfigValue[]
  | { [key: string]: ConfigValue }
  | AnyFunction

/**
 * 配置对象类型
 */
export interface ConfigObject {
  [key: string]: ConfigValue
}

/**
 * 序列化配置（不包含函数）
 */
export type SerializableConfig = {
  [key: string]: Exclude<ConfigValue, AnyFunction>
}

// ==================== 构建相关类型 ====================

/**
 * 源码映射
 */
export interface SourceMap {
  version: number
  sources: string[]
  sourcesContent?: (string | null)[]
  names: string[]
  mappings: string
  file?: string
  sourceRoot?: string
}

/**
 * 代码转换结果
 */
export interface TransformResult {
  code: string
  map?: SourceMap | null
  ast?: any
  meta?: PlainObject
}

/**
 * 模块信息
 */
export interface ModuleInfo {
  id: string
  code?: string
  ast?: any
  dependencies?: string[]
  dynamicDependencies?: string[]
  transformedCode?: string
  sourcemap?: SourceMap
  meta?: PlainObject
}

/**
 * 构建清单
 */
export interface BuildManifest {
  version: string
  timestamp: number
  entries: PlainObject<string>
  chunks: PlainObject<ChunkManifest>
  assets: PlainObject<AssetManifest>
}

/**
 * Chunk 清单
 */
export interface ChunkManifest {
  file: string
  size: number
  hash: string
  isEntry: boolean
  imports: string[]
  dynamicImports: string[]
  css?: string[]
}

/**
 * Asset 清单
 */
export interface AssetManifest {
  file: string
  size: number
  hash: string
  type: string
}

// ==================== 缓存相关类型 ====================

/**
 * 缓存键类型
 */
export type CacheKey = string

/**
 * 缓存值类型（可序列化）
 */
export type CacheValue = JSONValue

/**
 * 缓存元数据
 */
export interface CacheMetadata {
  key: CacheKey
  size: number
  createdAt: number
  lastAccess: number
  accessCount: number
  ttl?: number
  tags?: string[]
}

/**
 * 缓存条目
 */
export interface CacheEntry<T = CacheValue> {
  value: T
  metadata: CacheMetadata
}

// ==================== 错误相关类型 ====================

/**
 * 错误代码
 */
export type ErrorCode = string

/**
 * 错误详情
 */
export interface ErrorDetails {
  code?: ErrorCode
  message: string
  file?: string
  line?: number
  column?: number
  stack?: string
  meta?: PlainObject
}

/**
 * 构建错误
 */
export interface BuildError extends Error {
  code?: ErrorCode
  file?: string
  line?: number
  column?: number
  details?: ErrorDetails
  suggestions?: string[]
}

// ==================== 工具类型 ====================

/**
 * 提取 Promise 类型
 */
export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T

/**
 * 提取数组类型
 */
export type UnwrapArray<T> = T extends Array<infer U> ? U : T

/**
 * 必需属性
 */
export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K
}[keyof T]

/**
 * 可选属性
 */
export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never
}[keyof T]

/**
 * 提取必需属性
 */
export type Required<T> = Pick<T, RequiredKeys<T>>

/**
 * 提取可选属性
 */
export type Optional<T> = Pick<T, OptionalKeys<T>>

/**
 * 合并类型
 */
export type Merge<T, U> = Omit<T, keyof U> & U

/**
 * 覆盖类型
 */
export type Override<T, U> = Omit<T, keyof U> & U

/**
 * 可选化类型
 */
export type Optionalize<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * 必需化类型
 */
export type Requireize<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

// ==================== Rollup 特定类型 ====================

/**
 * Rollup 警告
 */
export interface RollupWarning {
  code?: string
  message: string
  frame?: string
  loc?: {
    file?: string
    line: number
    column: number
  }
  plugin?: string
  pluginCode?: string
  url?: string
  [key: string]: unknown
}

/**
 * Rollup 警告处理器
 */
export type RollupWarningHandler = (
  warning: RollupWarning,
  defaultHandler: (warning: RollupWarning) => void
) => void

/**
 * Rollup 输出选项
 */
export interface RollupOutputOptions {
  format?: 'esm' | 'cjs' | 'umd' | 'iife' | 'system'
  dir?: string
  file?: string
  name?: string
  sourcemap?: boolean | 'inline' | 'hidden'
  globals?: Record<string, string>
  [key: string]: unknown
}

/**
 * Rollup 输出 Bundle
 */
export interface RollupOutputBundle {
  [fileName: string]: RollupOutputChunk | RollupOutputAsset
}

/**
 * Rollup 输出 Chunk
 */
export interface RollupOutputChunk {
  type: 'chunk'
  code: string
  fileName: string
  isEntry: boolean
  isDynamicEntry: boolean
  name: string
  imports: string[]
  dynamicImports: string[]
  exports: string[]
  map?: SourceMap | null
  modules: Record<string, ModuleInfo>
  [key: string]: unknown
}

/**
 * Rollup 输出 Asset
 */
export interface RollupOutputAsset {
  type: 'asset'
  fileName: string
  source: string | Uint8Array
  [key: string]: unknown
}

// ==================== 类型守卫 ====================

/**
 * 检查是否为 Promise
 */
export function isPromise<T = any>(value: unknown): value is Promise<T> {
  return value instanceof Promise || (
    typeof value === 'object' &&
    value !== null &&
    'then' in value &&
    typeof (value as any).then === 'function'
  )
}

/**
 * 检查是否为函数
 */
export function isFunction(value: unknown): value is AnyFunction {
  return typeof value === 'function'
}

/**
 * 检查是否为对象
 */
export function isObject(value: unknown): value is PlainObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * 检查是否为数组
 */
export function isArray<T = any>(value: unknown): value is T[] {
  return Array.isArray(value)
}

/**
 * 检查是否为字符串
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

/**
 * 检查是否为数字
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value)
}

/**
 * 检查是否为布尔值
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

/**
 * 检查是否为 null
 */
export function isNull(value: unknown): value is null {
  return value === null
}

/**
 * 检查是否为 undefined
 */
export function isUndefined(value: unknown): value is undefined {
  return value === undefined
}

/**
 * 检查是否为 nullish (null 或 undefined)
 */
export function isNullish(value: unknown): value is null | undefined {
  return value === null || value === undefined
}

/**
 * 检查是否为空对象
 */
export function isEmptyObject(value: unknown): boolean {
  return isObject(value) && Object.keys(value).length === 0
}

/**
 * 检查是否为空数组
 */
export function isEmptyArray(value: unknown): boolean {
  return isArray(value) && value.length === 0
}

// ==================== 导出所有类型 ====================

export type {
  JSONValue,
  PlainObject,
  DeepPartial,
  DeepReadonly,
  NonNullish,
  Nullable,
  ArrayElement,
  AnyFunction,
  AsyncFunction,
  Callback,
  EventHandler,
  Constructor,
  AbstractConstructor,
  Class,
}
