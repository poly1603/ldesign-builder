/**
 * 构建验证器模块
 * 
 * 【功能描述】
 * 负责验证构建配置和构建结果，确保构建过程的正确性
 * 
 * 【主要特性】
 * - 配置验证：验证构建配置的完整性和正确性
 * - 入口文件验证：检查入口文件是否存在
 * - 输出配置验证：验证输出配置的合法性
 * - 格式验证：验证输出格式是否支持
 * - 打包器验证：验证打包器类型是否支持
 * - 库类型验证：验证库类型是否有效
 * - 详细错误提示：提供清晰的验证失败原因和建议
 * 
 * 【使用示例】
 * ```typescript
 * import { BuildValidator } from './BuildValidator'
 * 
 * const validator = new BuildValidator()
 * const result = await validator.validateConfig(config)
 * 
 * if (!result.valid) {
 *   console.error('配置验证失败:', result.errors)
 * }
 * ```
 * 
 * @module core/builder/BuildValidator
 * @author LDesign Team
 * @version 1.0.0
 * @since 2024-01-01
 */

import * as fs from 'fs-extra'
import * as path from 'path'
import type { BuilderConfig } from '../../types/config'
import type { ValidationResult } from '../../types/common'
import type { Logger } from '../../utils/logger'
import { LibraryType } from '../../types/library'

/**
 * 构建验证器选项接口
 */
export interface BuildValidatorOptions {
  /** 日志记录器 */
  logger?: Logger
  /** 是否执行严格验证，默认 false */
  strict?: boolean
  /** 是否检查文件存在性，默认 true */
  checkFileExists?: boolean
}

/**
 * 构建验证器类
 * 
 * 【功能说明】
 * 提供完整的构建配置和结果验证功能
 * 
 * 【核心方法】
 * - validateConfig: 验证构建配置
 * - validateInput: 验证入口文件
 * - validateOutput: 验证输出配置
 * - validateFormat: 验证输出格式
 * 
 * @example
 * ```typescript
 * const validator = new BuildValidator({
 *   strict: true,
 *   checkFileExists: true
 * })
 * 
 * const result = await validator.validateConfig(config)
 * ```
 */
export class BuildValidator {
  /** 日志记录器 */
  private logger?: Logger
  /** 是否严格验证 */
  private strict: boolean
  /** 是否检查文件存在 */
  private checkFileExists: boolean

  /**
   * 构造函数
   * 
   * @param options - 验证器选项
   */
  constructor(options: BuildValidatorOptions = {}) {
    this.logger = options.logger
    this.strict = options.strict ?? false
    this.checkFileExists = options.checkFileExists ?? true
  }

  // ========== 核心验证方法 ==========

  /**
   * 验证构建配置
   * 
   * 【详细说明】
   * 执行全面的配置验证，包括：
   * 1. 基础必填项检查
   * 2. 入口文件验证
   * 3. 输出配置验证
   * 4. 格式验证
   * 5. 打包器验证
   * 6. 库类型验证
   * 
   * 【算法复杂度】
   * 时间复杂度：O(n)，n为配置项数量
   * 空间复杂度：O(m)，m为错误和警告数量
   * 
   * @param config - 构建配置
   * @returns 验证结果
   * 
   * @example
   * ```typescript
   * const result = await validator.validateConfig(config)
   * if (!result.valid) {
   *   result.errors.forEach(err => console.error(err))
   * }
   * ```
   */
  async validateConfig(config: BuilderConfig): Promise<ValidationResult> {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: []
    }

    try {
      // ========== 基础验证 - 检查是否有入口配置 ==========
      const hasTopLevelInput = !!config.input

      // 检查各格式的 input 配置
      const esmHasInput = config.output?.esm && typeof config.output.esm === 'object' && 'input' in config.output.esm
      const cjsHasInput = config.output?.cjs && typeof config.output.cjs === 'object' && 'input' in config.output.cjs
      const umdHasInput = config.output?.umd && typeof config.output.umd === 'object' && 'input' in config.output.umd
      const hasOutputInput = esmHasInput || cjsHasInput || umdHasInput

      if (!hasTopLevelInput && !hasOutputInput) {
        // 如果没有显式的 input 配置，但有启用的输出格式，也可以使用默认值
        const hasEnabledFormat =
          (config.output?.esm === true || (config.output?.esm && typeof config.output.esm === 'object')) ||
          (config.output?.cjs === true || (config.output?.cjs && typeof config.output.cjs === 'object')) ||
          (config.output?.umd === true || (config.output?.umd && typeof config.output.umd === 'object'))

        if (!hasEnabledFormat) {
          result.errors.push('缺少入口文件配置（需要在顶层或 output 中指定 input）')
        }
      }

      // ========== 检查空的input ==========
      if (config.input === '') {
        result.errors.push('input 不能为空字符串')
      }

      // ========== 验证入口文件存在性 ==========
      if (this.checkFileExists && config.input && typeof config.input === 'string') {
        const inputPath = path.resolve(config.cwd || process.cwd(), config.input)
        if (!await fs.pathExists(inputPath)) {
          result.errors.push(`入口文件不存在: ${config.input}`)
        }
      }

      // ========== 验证 libraryType ==========
      if (config.libraryType) {
        const validLibraryTypes = Object.values(LibraryType)
        if (!validLibraryTypes.includes(config.libraryType as LibraryType)) {
          result.errors.push(`无效的 libraryType: ${config.libraryType}`)
        }
      }

      // ========== 输出配置验证 ==========
      if (config.output) {
        if (!config.output.dir && !config.output.file) {
          result.errors.push('输出配置必须指定 dir 或 file')
        }

        // ========== 格式验证 ==========
        if (config.output.format) {
          const formats = Array.isArray(config.output.format)
            ? config.output.format
            : [config.output.format]

          const validFormats = ['esm', 'cjs', 'umd', 'iife', 'css']
          for (const format of formats) {
            if (!validFormats.includes(format)) {
              result.errors.push(`不支持的输出格式: ${format}`)
            }
          }
        }
      }

      // ========== 打包器验证 ==========
      if (config.bundler && !['rollup', 'rolldown'].includes(config.bundler)) {
        result.errors.push(`不支持的打包器: ${config.bundler}`)
      }

      // ========== 严格模式额外检查 ==========
      if (this.strict) {
        // 检查是否指定了输出目录
        if (!config.output?.dir && !config.output?.file) {
          result.warnings.push('建议明确指定输出目录或文件')
        }

        // 检查是否指定了输出格式
        if (!config.output?.format) {
          result.warnings.push('建议明确指定输出格式')
        }

        // 检查是否启用了源映射
        if (!config.output?.sourcemap && config.mode === 'development') {
          result.warnings.push('开发模式建议启用 sourcemap')
        }
      }

      // ========== 设置验证结果 ==========
      result.valid = result.errors.length === 0

    } catch (error) {
      result.valid = false
      result.errors.push(`配置验证异常: ${(error as Error).message}`)
    }

    // ========== 记录验证结果 ==========
    if (!result.valid) {
      this.logger?.error('配置验证失败:')
      result.errors.forEach(err => this.logger?.error(`  - ${err}`))
    }

    if (result.warnings.length > 0) {
      this.logger?.warn('配置验证警告:')
      result.warnings.forEach(warn => this.logger?.warn(`  - ${warn}`))
    }

    return result
  }

  /**
   * 验证入口文件
   * 
   * 【详细说明】
   * 检查入口文件的有效性
   * 
   * @param input - 入口文件路径或配置
   * @param cwd - 工作目录
   * @returns 验证结果
   * 
   * @example
   * ```typescript
   * const result = await validator.validateInput('src/index.ts', process.cwd())
   * ```
   */
  async validateInput(
    input: string | string[] | Record<string, string>,
    cwd: string = process.cwd()
  ): Promise<ValidationResult> {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: []
    }

    try {
      // ========== 处理字符串入口 ==========
      if (typeof input === 'string') {
        if (!input) {
          result.errors.push('入口文件路径不能为空')
        } else if (this.checkFileExists) {
          const inputPath = path.resolve(cwd, input)
          if (!await fs.pathExists(inputPath)) {
            result.errors.push(`入口文件不存在: ${input}`)
          }
        }
      }
      // ========== 处理数组入口 ==========
      else if (Array.isArray(input)) {
        if (input.length === 0) {
          result.errors.push('入口文件数组不能为空')
        } else if (this.checkFileExists) {
          for (const file of input) {
            const filePath = path.resolve(cwd, file)
            if (!await fs.pathExists(filePath)) {
              result.errors.push(`入口文件不存在: ${file}`)
            }
          }
        }
      }
      // ========== 处理对象入口 ==========
      else if (typeof input === 'object') {
        const entries = Object.entries(input)
        if (entries.length === 0) {
          result.errors.push('入口文件对象不能为空')
        } else if (this.checkFileExists) {
          for (const [name, file] of entries) {
            const filePath = path.resolve(cwd, file)
            if (!await fs.pathExists(filePath)) {
              result.errors.push(`入口文件不存在: ${name} -> ${file}`)
            }
          }
        }
      }

      result.valid = result.errors.length === 0

    } catch (error) {
      result.valid = false
      result.errors.push(`入口验证异常: ${(error as Error).message}`)
    }

    return result
  }

  /**
   * 验证输出配置
   * 
   * 【详细说明】
   * 检查输出配置的有效性
   * 
   * @param output - 输出配置
   * @returns 验证结果
   */
  validateOutput(output: any): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: []
    }

    try {
      // ========== 检查必填项 ==========
      if (!output) {
        result.errors.push('缺少输出配置')
        result.valid = false
        return result
      }

      if (!output.dir && !output.file) {
        result.errors.push('输出配置必须指定 dir 或 file')
      }

      // ========== 检查格式配置 ==========
      if (output.format) {
        const formats = Array.isArray(output.format) ? output.format : [output.format]
        const validFormats = ['esm', 'cjs', 'umd', 'iife', 'css']

        for (const format of formats) {
          if (!validFormats.includes(format)) {
            result.errors.push(`不支持的输出格式: ${format}`)
          }
        }
      }

      // ========== 严格模式检查 ==========
      if (this.strict) {
        if (!output.format) {
          result.warnings.push('建议明确指定输出格式')
        }
      }

      result.valid = result.errors.length === 0

    } catch (error) {
      result.valid = false
      result.errors.push(`输出配置验证异常: ${(error as Error).message}`)
    }

    return result
  }

  /**
   * 验证输出格式
   * 
   * @param format - 输出格式或格式数组
   * @returns 验证结果
   */
  validateFormat(format: string | string[]): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: []
    }

    const formats = Array.isArray(format) ? format : [format]
    const validFormats = ['esm', 'cjs', 'umd', 'iife', 'css']

    for (const fmt of formats) {
      if (!validFormats.includes(fmt)) {
        result.errors.push(`不支持的输出格式: ${fmt}`)
      }
    }

    result.valid = result.errors.length === 0
    return result
  }
}

/**
 * 创建构建验证器实例
 * 
 * @param options - 选项
 * @returns 构建验证器实例
 * 
 * @example
 * ```typescript
 * const validator = createBuildValidator({
 *   strict: true
 * })
 * ```
 */
export function createBuildValidator(
  options?: BuildValidatorOptions
): BuildValidator {
  return new BuildValidator(options)
}

