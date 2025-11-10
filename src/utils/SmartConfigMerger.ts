/**
 * 智能配置合并器
 * 
 * 根据字段类型和语义自动选择合并策略:
 * - external: 去重合并 (避免重复依赖)
 * - plugins: 顺序合并 (保持插件执行顺序)
 * - input: 替换 (用户配置优先)
 * - globals/alias/define: 对象合并 (合并键值对)
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import type { BuilderConfig } from '../types/config'
import type { ValidationResult } from '../types/common'

/**
 * 数组合并策略
 */
export type ArrayMergeStrategy = 'concat' | 'unique' | 'replace' | 'merge'

/**
 * 合并选项
 */
export interface SmartMergeOptions {
  /** 是否启用深度合并 */
  deep?: boolean
  /** 自定义字段合并策略 */
  customStrategies?: Map<string, ArrayMergeStrategy>
  /** 是否合并函数 */
  mergeFunctions?: boolean
}

/**
 * 智能配置合并器类
 */
export class SmartConfigMerger {
  /** 字段合并策略映射 */
  private mergeStrategies: Map<string, ArrayMergeStrategy>

  constructor(options: SmartMergeOptions = {}) {
    // 默认合并策略
    this.mergeStrategies = new Map([
      ['external', 'unique'],      // 外部依赖: 去重合并
      ['plugins', 'concat'],       // 插件: 顺序合并
      ['input', 'replace'],        // 入口: 替换
      ['exclude', 'unique'],       // 排除: 去重合并
    ])

    // 应用自定义策略
    if (options.customStrategies) {
      for (const [key, strategy] of options.customStrategies) {
        this.mergeStrategies.set(key, strategy)
      }
    }
  }

  /**
   * 智能合并配置
   * 
   * @param base - 基础配置
   * @param override - 覆盖配置
   * @param options - 合并选项
   * @returns 合并后的配置
   */
  merge(
    base: BuilderConfig,
    override: BuilderConfig,
    options: SmartMergeOptions = {}
  ): BuilderConfig {
    const { deep = true, mergeFunctions = false } = options

    if (!deep) {
      return { ...base, ...override }
    }

    const result = { ...base }

    for (const [key, value] of Object.entries(override)) {
      // undefined 表示用户未设置,跳过
      if (value === undefined) {
        continue
      }

      // null 表示用户显式清空,直接设置
      if (value === null) {
        (result as any)[key] = null
        continue
      }

      // 如果 base 中没有这个键,直接添加
      if (!(key in result)) {
        (result as any)[key] = value
        continue
      }

      const baseValue = (result as any)[key]

      // 数组合并
      if (Array.isArray(value) && Array.isArray(baseValue)) {
        const strategy = this.mergeStrategies.get(key) || 'replace';
        (result as any)[key] = this.mergeArray(baseValue, value, strategy)
      }
      // 函数合并
      else if (mergeFunctions && typeof value === 'function' && typeof baseValue === 'function') {
        (result as any)[key] = this.mergeFunction(baseValue, value, key)
      }
      // 特殊处理: external 可以是数组或函数
      else if (key === 'external' && typeof value === 'function') {
        (result as any)[key] = value
      }
      // 特殊处理: output 配置使用专门的合并器
      else if (key === 'output' && this.isPlainObject(value) && this.isPlainObject(baseValue)) {
        // output 配置由 OutputConfigMerger 处理
        (result as any)[key] = this.mergeObject(baseValue, value)
      }
      // 对象深度合并
      else if (
        this.isPlainObject(value) &&
        this.isPlainObject(baseValue)
      ) {
        (result as any)[key] = this.mergeObject(baseValue, value)
      }
      // 基本类型: 用户配置优先
      else {
        (result as any)[key] = value
      }
    }

    return result
  }

  /**
   * 合并数组
   * 
   * @param base - 基础数组
   * @param override - 覆盖数组
   * @param strategy - 合并策略
   * @returns 合并后的数组
   */
  private mergeArray(base: any[], override: any[], strategy: ArrayMergeStrategy): any[] {
    switch (strategy) {
      case 'concat':
        // 顺序合并 (保持顺序)
        return [...base, ...override]

      case 'unique':
        // 去重合并 (使用 Set 去重)
        // 对于字符串数组,直接去重
        if (base.every(item => typeof item === 'string') && override.every(item => typeof item === 'string')) {
          return Array.from(new Set([...base, ...override]))
        }
        // 对于对象数组,按 JSON 序列化去重
        const seen = new Set<string>()
        const result: any[] = []
        for (const item of [...base, ...override]) {
          const key = typeof item === 'object' ? JSON.stringify(item) : String(item)
          if (!seen.has(key)) {
            seen.add(key)
            result.push(item)
          }
        }
        return result

      case 'replace':
        // 替换 (用户配置完全覆盖)
        return override

      case 'merge':
        // 对象数组合并 (按 name 字段)
        return this.mergeObjectArray(base, override)

      default:
        return override
    }
  }

  /**
   * 合并对象数组
   * 
   * 按 name 字段识别相同对象并合并
   * 
   * @param base - 基础对象数组
   * @param override - 覆盖对象数组
   * @returns 合并后的对象数组
   */
  private mergeObjectArray(base: any[], override: any[]): any[] {
    const map = new Map<string, any>()

    // 添加基础对象
    for (const item of base) {
      const key = this.getObjectKey(item)
      map.set(key, item)
    }

    // 合并或替换
    for (const item of override) {
      const key = this.getObjectKey(item)
      const existing = map.get(key)

      if (existing && this.isPlainObject(existing) && this.isPlainObject(item)) {
        // 合并对象
        map.set(key, { ...existing, ...item })
      } else {
        // 添加新对象或替换
        map.set(key, item)
      }
    }

    return Array.from(map.values())
  }

  /**
   * 获取对象的唯一键
   * 
   * @param item - 对象
   * @returns 唯一键
   */
  private getObjectKey(item: any): string {
    if (typeof item !== 'object' || item === null) {
      return String(item)
    }

    // 优先使用 name 字段
    if ('name' in item && typeof item.name === 'string') {
      return item.name
    }

    // 其次使用 id 字段
    if ('id' in item && (typeof item.id === 'string' || typeof item.id === 'number')) {
      return String(item.id)
    }

    // 最后使用 JSON 序列化
    return JSON.stringify(item)
  }

  /**
   * 合并对象
   * 
   * @param base - 基础对象
   * @param override - 覆盖对象
   * @returns 合并后的对象
   */
  private mergeObject(base: any, override: any): any {
    const result = { ...base }

    for (const [key, value] of Object.entries(override)) {
      if (value === undefined) continue

      const baseValue = result[key]

      // 递归合并对象
      if (this.isPlainObject(value) && this.isPlainObject(baseValue)) {
        result[key] = this.mergeObject(baseValue, value)
      }
      // 数组合并
      else if (Array.isArray(value) && Array.isArray(baseValue)) {
        const strategy = this.mergeStrategies.get(key) || 'replace'
        result[key] = this.mergeArray(baseValue, value, strategy)
      }
      // 其他: 替换
      else {
        result[key] = value
      }
    }

    return result
  }

  /**
   * 合并函数
   * 
   * 创建一个新函数,依次执行基础函数和覆盖函数
   * 
   * @param base - 基础函数
   * @param override - 覆盖函数
   * @param key - 字段名 (用于特殊处理)
   * @returns 合并后的函数
   */
  private mergeFunction(base: Function, override: Function, key: string): Function {
    // external 函数特殊处理: 使用 OR 逻辑
    if (key === 'external') {
      return (id: string) => {
        const baseResult = base(id)
        const overrideResult = override(id)
        return baseResult || overrideResult
      }
    }

    // 默认: 先执行基础函数,再执行覆盖函数
    return (...args: any[]) => {
      const baseResult = base(...args)
      const overrideResult = override(...args)

      // 如果都返回布尔值,使用 AND 逻辑
      if (typeof baseResult === 'boolean' && typeof overrideResult === 'boolean') {
        return baseResult && overrideResult
      }

      // 否则返回覆盖结果
      return overrideResult
    }
  }

  /**
   * 检查是否为普通对象
   * 
   * @param value - 值
   * @returns 是否为普通对象
   */
  private isPlainObject(value: any): boolean {
    if (value === null || typeof value !== 'object') {
      return false
    }

    // 检查是否为数组
    if (Array.isArray(value)) {
      return false
    }

    // 检查原型链
    const proto = Object.getPrototypeOf(value)
    return proto === null || proto === Object.prototype
  }

  /**
   * 验证合并结果
   * 
   * @param config - 配置
   * @returns 验证结果
   */
  validate(config: BuilderConfig): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // 检查必需字段
    if (!config.input && !config.output?.esm?.input && !config.output?.cjs?.input && !config.output?.umd?.input) {
      warnings.push('No input specified, will use default')
    }

    // 检查 external 配置
    if (config.external) {
      if (Array.isArray(config.external) && config.external.length === 0) {
        warnings.push('external is an empty array')
      }
    }

    // 检查 plugins 配置
    if (config.plugins) {
      if (Array.isArray(config.plugins) && config.plugins.length === 0) {
        warnings.push('plugins is an empty array')
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }
}

/**
 * 创建智能配置合并器
 * 
 * @param options - 合并选项
 * @returns 智能配置合并器实例
 */
export function createSmartConfigMerger(options?: SmartMergeOptions): SmartConfigMerger {
  return new SmartConfigMerger(options)
}

