/**
 * 基础适配器输出管理器
 * 
 * 提供统一的输出目录结构管理
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import path from 'path'
import fs from 'fs-extra'
import type { UnifiedConfig, UnifiedOutputConfig, OutputFormat } from '../../types/adapter'
import { Logger } from '../../utils/logger'

/**
 * 标准输出目录
 */
export const OUTPUT_DIRS = {
  ESM: 'es',
  CJS: 'lib',
  UMD: 'dist',
  IIFE: 'dist',
  TYPES: 'types'
} as const

/**
 * 标准输出扩展名
 */
export const OUTPUT_EXTENSIONS = {
  ESM: '.mjs',
  CJS: '.cjs',
  UMD: '.umd.js',
  IIFE: '.iife.js',
  DTS: '.d.ts'
} as const

/**
 * 格式配置
 */
export interface FormatConfig {
  format: OutputFormat
  dir: string
  extension: string
  entryFileName: string
  chunkFileName: string
  preserveModules: boolean
  exports?: 'auto' | 'named' | 'default' | 'none'
}

/**
 * 输出配置解析结果
 */
export interface ParsedOutputConfig {
  configs: FormatConfig[]
  hasESM: boolean
  hasCJS: boolean
  hasUMD: boolean
  hasIIFE: boolean
}

/**
 * 基础适配器输出管理器
 */
export class BaseAdapterOutputManager {
  private logger: Logger

  constructor(logger?: Logger) {
    this.logger = logger || new Logger()
  }

  /**
   * 解析输出配置
   */
  parseOutputConfig(config: UnifiedConfig): ParsedOutputConfig {
    const result: ParsedOutputConfig = {
      configs: [],
      hasESM: false,
      hasCJS: false,
      hasUMD: false,
      hasIIFE: false
    }

    const outputConfig = config.output

    // 处理数组格式
    if (Array.isArray(outputConfig)) {
      for (const output of outputConfig) {
        const formatConfigs = this.parseFormatConfig(output)
        result.configs.push(...formatConfigs)
      }
    }
    // 处理对象格式（TDesign 风格）
    else if (outputConfig && typeof outputConfig === 'object') {
      const obj = outputConfig as any

      // 检查是否为 TDesign 风格配置
      if (obj.es || obj.esm || obj.cjs || obj.lib || obj.umd || obj.dist) {
        if (obj.es && obj.es !== false) {
          result.configs.push(this.createFormatConfig('esm', obj.es, OUTPUT_DIRS.ESM, '.mjs'))
          result.hasESM = true
        }
        if (obj.esm && obj.esm !== false) {
          result.configs.push(this.createFormatConfig('esm', obj.esm, 'esm', '.js'))
          result.hasESM = true
        }
        if ((obj.cjs || obj.lib) && (obj.cjs !== false && obj.lib !== false)) {
          const cjsConfig = obj.cjs || obj.lib
          result.configs.push(this.createFormatConfig('cjs', cjsConfig, OUTPUT_DIRS.CJS, '.js'))
          result.hasCJS = true
        }
        if ((obj.umd || obj.dist) && (obj.umd !== false && obj.dist !== false)) {
          const umdConfig = obj.umd || obj.dist
          result.configs.push(this.createFormatConfig('umd', umdConfig, OUTPUT_DIRS.UMD, '.umd.js'))
          result.hasUMD = true
        }
      }
      // 标准格式配置
      else {
        const formatConfigs = this.parseFormatConfig(outputConfig)
        result.configs.push(...formatConfigs)
      }
    }

    // 更新标志
    for (const cfg of result.configs) {
      if (cfg.format === 'esm') result.hasESM = true
      if (cfg.format === 'cjs') result.hasCJS = true
      if (cfg.format === 'umd') result.hasUMD = true
      if (cfg.format === 'iife') result.hasIIFE = true
    }

    // 如果没有配置，使用默认值
    if (result.configs.length === 0) {
      result.configs.push(this.getDefaultFormatConfig('esm'))
      result.configs.push(this.getDefaultFormatConfig('cjs'))
      result.hasESM = true
      result.hasCJS = true
    }

    return result
  }

  /**
   * 解析单个输出配置
   */
  private parseFormatConfig(output: UnifiedOutputConfig): FormatConfig[] {
    const configs: FormatConfig[] = []
    const formats = Array.isArray(output.format) ? output.format : [output.format || 'esm']

    for (const format of formats) {
      configs.push(this.createFormatConfig(format, output))
    }

    return configs
  }

  /**
   * 创建格式配置
   */
  private createFormatConfig(
    format: OutputFormat,
    output: any,
    defaultDir?: string,
    defaultExt?: string
  ): FormatConfig {
    const isESM = format === 'esm'
    const isCJS = format === 'cjs'
    const isUMD = format === 'umd'
    const isIIFE = format === 'iife'

    const dir = output?.dir || defaultDir || this.getDefaultDir(format)
    const extension = defaultExt || this.getDefaultExtension(format)

    return {
      format,
      dir,
      extension,
      entryFileName: `[name]${extension}`,
      chunkFileName: `[name]${extension}`,
      preserveModules: output?.preserveModules ?? output?.preserveStructure ?? (isESM || isCJS),
      exports: output?.exports || (isESM ? 'auto' : 'named')
    }
  }

  /**
   * 获取默认格式配置
   */
  private getDefaultFormatConfig(format: OutputFormat): FormatConfig {
    return this.createFormatConfig(format, {})
  }

  /**
   * 获取默认目录
   */
  private getDefaultDir(format: OutputFormat): string {
    switch (format) {
      case 'esm':
        return OUTPUT_DIRS.ESM
      case 'cjs':
        return OUTPUT_DIRS.CJS
      case 'umd':
      case 'iife':
        return OUTPUT_DIRS.UMD
      default:
        return 'dist'
    }
  }

  /**
   * 获取默认扩展名
   */
  private getDefaultExtension(format: OutputFormat): string {
    switch (format) {
      case 'esm':
        return '.mjs'
      case 'cjs':
        return '.cjs'
      case 'umd':
        return '.umd.js'
      case 'iife':
        return '.iife.js'
      default:
        return '.js'
    }
  }

  /**
   * 确保输出目录存在
   */
  async ensureOutputDirs(configs: FormatConfig[]): Promise<void> {
    const dirs = new Set(configs.map(c => c.dir))
    
    for (const dir of dirs) {
      const fullPath = path.resolve(process.cwd(), dir)
      await fs.ensureDir(fullPath)
      this.logger.debug(`已创建输出目录: ${dir}`)
    }
  }

  /**
   * 清理输出目录
   */
  async cleanOutputDirs(configs: FormatConfig[]): Promise<void> {
    const dirs = new Set(configs.map(c => c.dir))
    
    for (const dir of dirs) {
      const fullPath = path.resolve(process.cwd(), dir)
      if (await fs.pathExists(fullPath)) {
        await fs.emptyDir(fullPath)
        this.logger.debug(`已清理输出目录: ${dir}`)
      }
    }
  }

  /**
   * 获取输出文件路径
   */
  getOutputFilePath(
    inputFile: string,
    formatConfig: FormatConfig,
    preserveModulesRoot: string = 'src'
  ): string {
    let relativePath = path.relative(preserveModulesRoot, inputFile)
    
    // 移除 src 前缀
    if (relativePath.startsWith('src/') || relativePath.startsWith('src\\')) {
      relativePath = relativePath.slice(4)
    }

    // 更改扩展名
    const parsed = path.parse(relativePath)
    const newFileName = `${parsed.name}${formatConfig.extension}`

    return path.join(formatConfig.dir, parsed.dir, newFileName)
  }

  /**
   * 复制类型声明文件
   */
  async copyTypesTo(
    sourceDir: string,
    targetDirs: string[]
  ): Promise<void> {
    const typesDir = path.resolve(process.cwd(), sourceDir)

    if (!await fs.pathExists(typesDir)) {
      this.logger.debug(`类型声明目录不存在: ${sourceDir}`)
      return
    }

    for (const targetDir of targetDirs) {
      const targetPath = path.resolve(process.cwd(), targetDir)
      
      try {
        await fs.copy(typesDir, targetPath, {
          filter: (src) => {
            // 只复制 .d.ts 文件
            const stat = fs.statSync(src)
            return stat.isDirectory() || src.endsWith('.d.ts')
          }
        })
        this.logger.debug(`已复制类型声明到: ${targetDir}`)
      } catch (error) {
        this.logger.warn(`复制类型声明失败: ${(error as Error).message}`)
      }
    }
  }

  /**
   * 映射格式字符串
   */
  mapFormat(format: string | undefined): OutputFormat {
    if (!format) return 'esm'

    const formatMap: Record<string, OutputFormat> = {
      'es': 'esm',
      'esm': 'esm',
      'module': 'esm',
      'cjs': 'cjs',
      'commonjs': 'cjs',
      'umd': 'umd',
      'iife': 'iife'
    }

    return formatMap[format.toLowerCase()] || 'esm'
  }

  /**
   * 获取所有输出目录
   */
  getAllOutputDirs(configs: FormatConfig[]): string[] {
    return [...new Set(configs.map(c => c.dir))]
  }
}
