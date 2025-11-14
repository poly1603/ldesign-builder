/**
 * 输出配置合并器
 * 
 * 专门处理 output 配置的合并逻辑:
 * - 支持 ESM/CJS/UMD/IIFE 格式配置
 * - 支持格式启用/禁用 (boolean)
 * - 支持格式详细配置 (object)
 * - 智能合并嵌套配置
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import type { OutputConfig } from '../types/output'
import type { ValidationResult } from '../types/common'

/**
 * 格式配置类型
 */
export type FormatConfig = boolean | {
  enabled?: boolean
  input?: string | string[] | Record<string, string>
  dir?: string
  file?: string
  fileName?: string
  name?: string
  globals?: Record<string, string>
  external?: string[]
  sourcemap?: boolean | 'inline' | 'hidden'
  minify?: boolean
  preserveStructure?: boolean
  rollupOptions?: any
  [key: string]: any
}

/**
 * 输出配置合并器类
 */
export class OutputConfigMerger {
  /**
   * 合并输出配置
   * 
   * @param base - 基础输出配置
   * @param override - 覆盖输出配置
   * @returns 合并后的输出配置
   */
  merge(base: OutputConfig, override: OutputConfig): OutputConfig {
    let result: OutputConfig = { ...base }

    // 合并顶层配置
    for (const [key, value] of Object.entries(override)) {
      if (value === undefined) continue

      // format 特殊处理: 可以是数组或字符串
      if (key === 'format') {
        result.format = value
        continue
      }

      // es/esm/cjs/umd/iife 子配置需要深度合并
      if (['es', 'esm', 'cjs', 'umd', 'iife'].includes(key)) {
        result[key as 'es' | 'esm' | 'cjs' | 'umd' | 'iife'] = this.mergeFormatConfig(
          (base as any)[key],
          value
        )
        continue
      }

      // 其他字段直接覆盖
      (result as any)[key] = value
    }

    // 根据 format 清理未使用的格式配置
    if (result.format) {
      result = this.cleanUnusedFormats(result, override)
    }

    return result
  }

  /**
   * 合并格式配置
   * 
   * @param base - 基础格式配置
   * @param override - 覆盖格式配置
   * @returns 合并后的格式配置
   */
  private mergeFormatConfig(
    base?: FormatConfig,
    override?: FormatConfig
  ): FormatConfig | undefined {
    // 如果 override 明确设置为 false,禁用该格式
    if (override === false) {
      return false
    }

    // 如果 override 设置为 true,启用该格式
    if (override === true) {
      // 如果 base 是对象,保留 base 配置
      if (typeof base === 'object' && base !== null) {
        return { ...base, enabled: true }
      }
      // 否则返回 true
      return true
    }

    // 如果 base 不存在,使用 override
    if (!base || base === false) {
      return override
    }

    // 如果 base 是 true,override 是对象,使用 override
    if (base === true && typeof override === 'object') {
      return override
    }

    // 如果 override 不存在或为 true,使用 base
    if (!override || override === true) {
      return base
    }

    // 两者都是对象,深度合并
    if (typeof base === 'object' && typeof override === 'object') {
      return this.mergeFormatConfigObject(base, override)
    }

    // 其他情况,使用 override
    return override
  }

  /**
   * 合并格式配置对象
   * 
   * @param base - 基础格式配置对象
   * @param override - 覆盖格式配置对象
   * @returns 合并后的格式配置对象
   */
  private mergeFormatConfigObject(
    base: Exclude<FormatConfig, boolean>,
    override: Exclude<FormatConfig, boolean>
  ): Exclude<FormatConfig, boolean> {
    const result = { ...base }

    for (const [key, value] of Object.entries(override)) {
      if (value === undefined) continue

      const baseValue = result[key]

      // 特殊处理嵌套对象
      if (key === 'rollupOptions' && typeof value === 'object' && typeof baseValue === 'object') {
        result.rollupOptions = {
          ...baseValue,
          ...value
        }
      }
      // 特殊处理 globals
      else if (key === 'globals' && typeof value === 'object' && typeof baseValue === 'object') {
        result.globals = {
          ...baseValue,
          ...value
        }
      }
      // 特殊处理 external (数组去重合并)
      else if (key === 'external' && Array.isArray(value) && Array.isArray(baseValue)) {
        result.external = Array.from(new Set([...baseValue, ...value]))
      }
      // 其他字段直接覆盖
      else {
        result[key] = value
      }
    }

    return result
  }

  /**
   * 清理未使用的格式配置
   * 
   * 根据 format 字段,删除未启用的格式配置
   * 
   * @param config - 输出配置
   * @param override - 用户覆盖配置 (用于判断是否显式配置)
   * @returns 清理后的输出配置
   */
  private cleanUnusedFormats(config: OutputConfig, override: OutputConfig): OutputConfig {
    const result = { ...config }
    const formats = Array.isArray(result.format) ? result.format : [result.format]
    const formatSet = new Set(formats)

    // 如果 format 中没有某个格式,且用户没有显式配置该格式,则删除配置
    if (!formatSet.has('es') && !override.es && result.es !== true) {
      delete result.es
    }
    if (!formatSet.has('esm') && !override.esm && result.esm !== true) {
      delete result.esm
    }
    if (!formatSet.has('cjs') && !override.cjs && result.cjs !== true) {
      delete result.cjs
    }
    if (!formatSet.has('umd') && !override.umd && result.umd !== true) {
      delete result.umd
    }
    if (!formatSet.has('iife') && !override.iife && result.iife !== true) {
      delete result.iife
    }

    return result
  }

  /**
   * 验证输出配置
   * 
   * @param config - 输出配置
   * @returns 验证结果
   */
  validate(config: OutputConfig): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // 检查是否至少启用一种格式
    const hasEnabledFormat = this.hasEnabledFormat(config)
    if (!hasEnabledFormat) {
      errors.push('At least one output format must be enabled')
    }

    // 检查 UMD 格式配置
    if (this.isFormatEnabled(config.umd)) {
      const umdConfig = config.umd
      if (typeof umdConfig === 'object') {
        // UMD 格式必须有 name
        if (!umdConfig.name && !config.name) {
          errors.push('UMD format requires a library name (output.umd.name or output.name)')
        }

        // UMD 格式建议配置 globals
        if (umdConfig.external && umdConfig.external.length > 0 && !umdConfig.globals && !config.globals) {
          warnings.push('UMD format with external dependencies should configure globals')
        }
      }
    }

    // 检查 IIFE 格式配置
    if (this.isFormatEnabled(config.iife)) {
      const iifeConfig = config.iife
      if (typeof iifeConfig === 'object') {
        // IIFE 格式必须有 name
        if (!iifeConfig.name && !config.name) {
          errors.push('IIFE format requires a library name (output.iife.name or output.name)')
        }
      }
    }

    // 检查输出目录配置
    if (!config.dir && !config.file) {
      const hasFormatDir = (config.esm && typeof config.esm === 'object' && config.esm.dir) ||
        (config.cjs && typeof config.cjs === 'object' && config.cjs.dir) ||
        (config.umd && typeof config.umd === 'object' && config.umd.dir) ||
        (config.iife && typeof config.iife === 'object' && config.iife.dir)

      if (!hasFormatDir) {
        warnings.push('No output directory specified, will use default')
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * 检查是否至少启用一种格式
   * 
   * @param config - 输出配置
   * @returns 是否至少启用一种格式
   */
  private hasEnabledFormat(config: OutputConfig): boolean {
    return this.isFormatEnabled(config.esm) ||
      this.isFormatEnabled(config.cjs) ||
      this.isFormatEnabled(config.umd) ||
      this.isFormatEnabled(config.iife)
  }

  /**
   * 检查格式是否启用
   * 
   * @param formatConfig - 格式配置
   * @returns 是否启用
   */
  private isFormatEnabled(formatConfig?: FormatConfig): boolean {
    if (!formatConfig) return false
    if (formatConfig === false) return false
    if (formatConfig === true) return true
    if (typeof formatConfig === 'object') {
      return formatConfig.enabled !== false
    }
    return false
  }

  /**
   * 标准化输出配置
   * 
   * 将简化的配置转换为标准格式
   * 
   * @param config - 输出配置
   * @returns 标准化后的输出配置
   */
  normalize(config: OutputConfig): OutputConfig {
    const result = { ...config }

    // 标准化 format 字段
    if (result.format) {
      const formats = Array.isArray(result.format) ? result.format : [result.format]

      // 根据 format 自动启用对应的格式配置
      for (const format of formats) {
        if (format === 'esm' && !result.esm) {
          result.esm = true
        }
        if (format === 'cjs' && !result.cjs) {
          result.cjs = true
        }
        if (format === 'umd' && !result.umd) {
          result.umd = true
        }
        if (format === 'iife' && !result.iife) {
          result.iife = true
        }
      }
    }

    return result
  }
}

/**
 * 创建输出配置合并器
 * 
 * @returns 输出配置合并器实例
 */
export function createOutputConfigMerger(): OutputConfigMerger {
  return new OutputConfigMerger()
}

