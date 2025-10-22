/**
 * Esbuild 适配器
 * 
 * 提供基于 esbuild 的极速打包能力
 * 
 * 优势：
 * - 构建速度最快（10-100倍）
 * - 适用于开发模式和简单项目
 * 
 * 限制：
 * - 不支持装饰器
 * - 部分高级 TS 特性支持有限
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import type {
  IBundlerAdapter,
  UnifiedConfig,
  AdapterOptions,
  BundlerSpecificConfig,
  BundlerSpecificPlugin
} from '../../types/adapter'
import type { BuildResult, BuildWatcher } from '../../types/builder'
import type { PerformanceMetrics } from '../../types/performance'
import { Logger } from '../../utils/logger'
import { BuilderError } from '../../utils/error-handler'
import { ErrorCode } from '../../constants/errors'
import * as path from 'path'
import * as fs from 'fs-extra'

/**
 * Esbuild 适配器类
 */
export class EsbuildAdapter implements IBundlerAdapter {
  readonly name = 'esbuild' as const
  version: string
  available: boolean

  private logger: Logger
  private esbuildInstance: any

  constructor(options: Partial<AdapterOptions> = {}) {
    this.logger = options.logger || new Logger()
    this.version = 'unknown'
    this.available = false

    // 尝试加载 esbuild
    this.initializeEsbuild()
  }

  /**
   * 初始化 esbuild
   */
  private initializeEsbuild(): void {
    try {
      // 动态导入 esbuild
      this.esbuildInstance = require('esbuild')
      this.version = this.esbuildInstance.version || 'unknown'
      this.available = true
      this.logger.debug(`Esbuild 适配器初始化成功 (v${this.version})`)
    } catch (error) {
      this.logger.warn('Esbuild 未安装，适配器不可用。请运行: npm install esbuild --save-dev')
      this.available = false
    }
  }

  /**
   * 执行构建
   */
  async build(config: UnifiedConfig): Promise<BuildResult> {
    if (!this.available || !this.esbuildInstance) {
      throw new BuilderError(
        ErrorCode.ADAPTER_NOT_AVAILABLE,
        'Esbuild 适配器不可用，请先安装 esbuild'
      )
    }

    try {
      this.logger.info('开始 Esbuild 构建...')
      const startTime = Date.now()

      // 转换配置
      const esbuildConfig = await this.transformConfig(config)

      // 执行构建
      const result = await this.esbuildInstance.build(esbuildConfig)

      const duration = Date.now() - startTime

      // 生成类型声明（如果需要）
      if (config.dts && config.typescript) {
        await this.generateTypeDeclarations(config)
      }

      this.logger.success(`Esbuild 构建完成 (${duration}ms)`)

      return {
        success: true,
        outputs: this.extractOutputs(result, config),
        duration,
        bundler: 'esbuild',
        warnings: result.warnings.map((w: any) => ({
          message: w.text,
          location: w.location
        })),
        errors: []
      }
    } catch (error: any) {
      this.logger.error('Esbuild 构建失败:', error)

      return {
        success: false,
        outputs: [],
        duration: 0,
        bundler: 'esbuild',
        warnings: [],
        errors: [{
          message: error.message || '构建失败',
          stack: error.stack
        }]
      }
    }
  }

  /**
   * 启动监听模式
   */
  async watch(config: UnifiedConfig): Promise<BuildWatcher> {
    if (!this.available || !this.esbuildInstance) {
      throw new BuilderError(
        ErrorCode.ADAPTER_NOT_AVAILABLE,
        'Esbuild 适配器不可用'
      )
    }

    try {
      const esbuildConfig = await this.transformConfig(config)

      // esbuild 的 watch 模式
      const ctx = await this.esbuildInstance.context({
        ...esbuildConfig,
        logLevel: 'info'
      })

      await ctx.watch()

      this.logger.info('Esbuild 监听模式已启动')

      return {
        close: async () => {
          await ctx.dispose()
          this.logger.info('Esbuild 监听模式已停止')
        },
        on: (event: string, handler: (...args: any[]) => void) => {
          // esbuild 的事件处理相对简单
          if (event === 'change') {
            // 可以通过插件实现
          }
        }
      }
    } catch (error) {
      throw new BuilderError(
        ErrorCode.BUILD_FAILED,
        `Esbuild 监听模式启动失败: ${(error as Error).message}`
      )
    }
  }

  /**
   * 转换统一配置为 esbuild 特定配置
   */
  async transformConfig(config: UnifiedConfig): Promise<any> {
    const outputConfig = config.output || {}
    const format = Array.isArray(outputConfig.format)
      ? outputConfig.format[0]
      : outputConfig.format || 'esm'

    // esbuild 格式映射
    const formatMap: Record<string, string> = {
      'esm': 'esm',
      'cjs': 'cjs',
      'umd': 'iife', // esbuild 用 iife 模拟 UMD
      'iife': 'iife'
    }

    const esbuildConfig: any = {
      entryPoints: this.resolveEntryPoints(config.input),
      outdir: outputConfig.dir || 'dist',
      format: formatMap[format] || 'esm',
      bundle: true,
      splitting: format === 'esm', // 只在 ESM 模式启用代码分割
      platform: config.mode === 'node' ? 'node' : 'browser',
      target: config.typescript?.target || 'es2020',
      sourcemap: config.sourcemap || false,
      minify: config.minify || false,
      treeShaking: true,
      metafile: true, // 用于分析
      external: Array.isArray(config.external) ? config.external : [],
      loader: {
        '.ts': 'ts',
        '.tsx': 'tsx',
        '.js': 'js',
        '.jsx': 'jsx',
        '.css': 'css',
        '.json': 'json'
      },
      // 全局变量（用于 UMD/IIFE）
      globalName: outputConfig.name || config.name,

      // 定义环境变量
      define: this.resolveDefine(config.define),

      // 输出文件名模式
      entryNames: outputConfig.fileName?.replace('[format]', format) || '[name]',
      chunkNames: outputConfig.chunkFileNames || '[name]-[hash]',
      assetNames: outputConfig.assetFileNames || '[name]-[hash]',

      // 日志级别
      logLevel: config.logLevel === 'silent' ? 'silent' : 'warning'
    }

    // 处理 JSX
    if (config.jsx) {
      esbuildConfig.jsx = config.jsx.factory === 'React.createElement' ? 'transform' : 'automatic'
      if (config.jsx.jsxImportSource) {
        esbuildConfig.jsxImportSource = config.jsx.jsxImportSource
      }
    }

    return esbuildConfig
  }

  /**
   * 解析入口点
   */
  private resolveEntryPoints(input: string | string[] | Record<string, string> | undefined): string[] | Record<string, string> {
    if (!input) {
      return ['src/index.ts']
    }

    if (typeof input === 'string') {
      return [input]
    }

    if (Array.isArray(input)) {
      return input
    }

    // Record 格式
    return input
  }

  /**
   * 解析 define 配置
   */
  private resolveDefine(define: Record<string, any> = {}): Record<string, string> {
    const result: Record<string, string> = {}

    for (const [key, value] of Object.entries(define)) {
      result[key] = JSON.stringify(value)
    }

    return result
  }

  /**
   * 提取输出信息
   */
  private extractOutputs(result: any, config: UnifiedConfig): Array<{ file: string; size: number; type: string }> {
    const outputs: Array<{ file: string; size: number; type: string }> = []

    if (result.metafile && result.metafile.outputs) {
      for (const [file, info] of Object.entries(result.metafile.outputs as Record<string, any>)) {
        outputs.push({
          file,
          size: info.bytes,
          type: file.endsWith('.js') ? 'js' : file.endsWith('.css') ? 'css' : 'asset'
        })
      }
    }

    return outputs
  }

  /**
   * 生成类型声明文件（使用 tsc）
   */
  private async generateTypeDeclarations(config: UnifiedConfig): Promise<void> {
    try {
      this.logger.info('生成类型声明文件...')

      // 使用 TypeScript API 生成类型声明
      const { exec } = require('child_process')
      const { promisify } = require('util')
      const execAsync = promisify(exec)

      const outputDir = config.output?.dir || 'dist'

      await execAsync(`npx tsc --declaration --emitDeclarationOnly --outDir ${outputDir}`)

      this.logger.success('类型声明文件生成成功')
    } catch (error) {
      this.logger.warn('类型声明文件生成失败:', error)
    }
  }

  /**
   * 转换配置为打包器特定配置
   */
  transformConfigToBundlerSpecific(config: UnifiedConfig): BundlerSpecificConfig {
    return {
      bundler: 'esbuild',
      config: this.transformConfig(config)
    }
  }

  /**
   * 转换插件为打包器特定插件
   */
  transformPluginToBundlerSpecific(plugin: any): BundlerSpecificPlugin {
    return {
      bundler: 'esbuild',
      plugin: plugin
    }
  }

  /**
   * 获取性能指标
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return {
      buildTime: 0,
      bundleSize: 0,
      memoryUsage: process.memoryUsage().heapUsed,
      timestamp: Date.now()
    }
  }

  /**
   * 验证配置
   */
  validateConfig(config: UnifiedConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // esbuild 不支持装饰器
    if (config.typescript?.experimentalDecorators) {
      errors.push('Esbuild 不支持 TypeScript 装饰器，请使用 Rollup 或 SWC 适配器')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * 清理资源
   */
  async dispose(): Promise<void> {
    this.logger.debug('Esbuild 适配器资源清理完成')
  }
}



