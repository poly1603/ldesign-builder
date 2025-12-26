/**
 * ESBuild 适配器
 * 
 * 提供 ESBuild 打包器的完整适配实现，专注于极速构建
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import type {
  IBundlerAdapter,
  UnifiedConfig,
  AdapterOptions,
  BundlerSpecificConfig
} from '../../types/adapter'
import type { BuildResult, BuildWatcher } from '../../types/builder'
import type { PerformanceMetrics } from '../../types/performance'
import { Logger } from '../../utils/logger'
import { BuilderError } from '../../utils/error-handler'
import { ErrorCode } from '../../constants/errors'
import path from 'path'
import fs from 'fs-extra'

// 导入共享基础设施
import {
  BaseAdapterCacheManager,
  BaseAdapterBannerGenerator,
  BaseAdapterOutputManager,
  BaseAdapterStyleHandler,
  AdapterBuildHelper,
  OUTPUT_DIRS
} from '../shared'

/**
 * ESBuild 适配器类
 * 
 * 特点：
 * - 极速构建（10-100x 速度提升）
 * - 多格式输出支持（ESM、CJS、IIFE）
 * - 内置 TypeScript/JSX 支持
 * - 缓存机制与增量构建
 * - Banner/Footer 支持
 * - 限制：不支持装饰器、某些复杂转换
 */
export class EsbuildAdapter implements IBundlerAdapter {
  readonly name = 'esbuild' as const
  version: string
  available: boolean

  private logger: Logger
  private esbuild: any

  // 辅助模块
  private cacheManager: BaseAdapterCacheManager
  private bannerGenerator: BaseAdapterBannerGenerator
  private outputManager: BaseAdapterOutputManager
  private styleHandler: BaseAdapterStyleHandler
  private buildHelper: AdapterBuildHelper

  constructor(options: Partial<AdapterOptions> = {}) {
    this.logger = options.logger || new Logger()
    this.version = 'unknown'
    this.available = true // 假设可用，在实际使用时验证

    // 初始化辅助模块
    this.cacheManager = new BaseAdapterCacheManager('esbuild', {}, this.logger)
    this.bannerGenerator = new BaseAdapterBannerGenerator(this.logger)
    this.outputManager = new BaseAdapterOutputManager(this.logger)
    this.styleHandler = new BaseAdapterStyleHandler(this.logger)
    this.buildHelper = new AdapterBuildHelper(this.logger)

    // 尝试同步加载
    this.checkAvailability()
  }

  /**
   * 检查 esbuild 可用性（同步）
   */
  private checkAvailability(): void {
    try {
      // 尝试同步加载
      if (typeof require !== 'undefined') {
        this.esbuild = require('esbuild')
        this.version = this.esbuild.version || 'unknown'
        this.available = true
        this.logger.debug(`ESBuild ${this.version} 已加载`)
      }
    } catch (error) {
      // 同步加载失败，将在使用时尝试异步加载
      this.logger.debug('ESBuild 同步加载失败，将在使用时异步加载')
    }
  }

  /**
   * 确保 esbuild 已加载（支持异步）
   */
  private async ensureEsbuildLoaded(): Promise<any> {
    if (this.esbuild) {
      return this.esbuild
    }

    try {
      this.esbuild = await import('esbuild')
      this.version = this.esbuild.version || 'unknown'
      this.available = true
      this.logger.debug(`ESBuild 异步加载成功: ${this.version}`)
      return this.esbuild
    } catch (error) {
      this.available = false
      throw new BuilderError(
        ErrorCode.ADAPTER_NOT_AVAILABLE,
        'ESBuild 未安装或无法加载，请运行: npm install esbuild --save-dev',
        { cause: error as Error }
      )
    }
  }

  /**
   * 执行构建
   */
  async build(config: UnifiedConfig): Promise<BuildResult> {
    const startTime = Date.now()

    try {
      // 确保 esbuild 已加载
      const esbuild = await this.ensureEsbuildLoaded()

      // 检查缓存
      const cacheEnabled = this.cacheManager.isCacheEnabled(config)
      const cacheKey = this.cacheManager.generateCacheKey(config)

      if (cacheEnabled) {
        const cachedResult = await this.cacheManager.getCachedResult(cacheKey)
        if (cachedResult) {
          const outputExists = await this.cacheManager.validateOutputArtifacts(config)
          if (outputExists) {
            this.logger.info('使用缓存的构建结果')
            return cachedResult
          }
        }
      }

      // 解析输出配置
      const parsedOutput = this.outputManager.parseOutputConfig(config)
      const allOutputs: any[] = []
      const allWarnings: any[] = []

      // 获取 Banner 配置
      const banners = await this.bannerGenerator.resolveAll(config)

      // 为每种格式构建
      for (const formatConfig of parsedOutput.configs) {
        this.logger.info(`构建 ${formatConfig.format.toUpperCase()} 格式...`)

        const formatStartTime = Date.now()
        const esbuildConfig = await this.createEsbuildConfig(config, formatConfig, banners)

        // 执行构建
        const result = await esbuild.build(esbuildConfig)

        // 处理输出
        const outputs = await this.processOutputs(result, config, formatConfig)
        allOutputs.push(...outputs)

        // 收集警告
        if (result.warnings) {
          allWarnings.push(...result.warnings.map((w: any) => ({
            message: w.text,
            location: w.location
          })))
        }

        const formatDuration = Date.now() - formatStartTime
        this.logger.info(`${formatConfig.format.toUpperCase()} 构建完成 (${formatDuration}ms)`)
      }

      const duration = Date.now() - startTime

      // 创建构建结果
      const buildResult = this.buildHelper.createBuildResult({
        success: true,
        outputs: allOutputs,
        duration,
        bundler: this.name,
        mode: (config as any).mode || 'production',
        libraryType: (config as any).libraryType,
        warnings: allWarnings
      })

      // 缓存结果
      if (cacheEnabled) {
        await this.cacheManager.cacheResult(cacheKey, buildResult)
      }

      this.logger.success(`ESBuild 构建完成 (${duration}ms)`)
      return buildResult

    } catch (error) {
      throw new BuilderError(
        ErrorCode.BUILD_FAILED,
        `ESBuild 构建失败: ${error instanceof Error ? error.message : String(error)}`,
        { cause: error as Error }
      )
    }
  }

  /**
   * 创建 esbuild 配置
   */
  private async createEsbuildConfig(config: UnifiedConfig, formatConfig: any, banners: any): Promise<any> {
    const input = this.resolveInput(config.input)
    const format = this.mapFormat(formatConfig.format)

    const esbuildConfig: any = {
      entryPoints: Array.isArray(input) ? input : [input],
      bundle: true,
      outdir: formatConfig.dir,
      format,
      target: (config as any).typescript?.target || 'es2020',
      minify: config.minify === true,
      sourcemap: config.sourcemap === true || config.sourcemap === 'inline',
      splitting: format === 'esm', // 仅 ESM 支持代码分割
      platform: 'neutral',
      external: config.external as string[] || [],
      define: (config as any).define || {},
      loader: {
        '.ts': 'ts',
        '.tsx': 'tsx',
        '.js': 'js',
        '.jsx': 'jsx',
        '.json': 'json',
        '.css': 'css',
        '.less': 'css',
        '.scss': 'css'
      },
      logLevel: 'warning',
      metafile: true,
      outExtension: {
        '.js': formatConfig.extension
      }
    }

    // 添加 Banner
    if (banners.banner) {
      esbuildConfig.banner = {
        js: banners.banner,
        css: banners.banner
      }
    }

    // 添加 Footer
    if (banners.footer) {
      esbuildConfig.footer = {
        js: banners.footer
      }
    }

    return esbuildConfig
  }

  /**
   * 启动监听模式
   */
  async watch(config: UnifiedConfig): Promise<BuildWatcher> {
    if (!this.available) {
      throw new BuilderError(
        ErrorCode.ADAPTER_NOT_AVAILABLE,
        'ESBuild 适配器不可用'
      )
    }

    const esbuildConfig = await this.transformConfig(config)

    // ESBuild 的 watch 模式
    const ctx = await this.esbuild.context({
      ...esbuildConfig,
      watch: {
        onRebuild: (error: any, result: any) => {
          if (error) {
            this.logger.error('重新构建失败:', error)
          } else {
            this.logger.success('重新构建成功')
          }
        }
      }
    })

    await ctx.watch()

    const { EventEmitter } = require('events')
    const watcher = new EventEmitter() as any
    watcher.patterns = [config.input as string || 'src/**/*']
    watcher.watching = true
    watcher.close = async () => {
      await ctx.dispose()
    }

    return watcher
  }

  /**
   * 转换配置
   */
  async transformConfig(config: UnifiedConfig): Promise<any> {
    const input = this.resolveInput(config.input)
    const outdir = this.resolveOutDir(config)

    return {
      entryPoints: Array.isArray(input) ? input : [input],
      bundle: true,
      outdir,
      format: this.mapFormat(this.getOutputFormat(config)),
      target: config.typescript?.target || 'es2020',
      minify: config.minify === true,
      sourcemap: config.sourcemap === true || config.sourcemap === 'inline',
      splitting: this.getOutputFormat(config) === 'esm', // 仅 ESM 支持代码分割
      platform: 'neutral', // 或 'browser', 'node'
      external: config.external,
      define: config.define || {},
      loader: {
        '.ts': 'ts',
        '.tsx': 'tsx',
        '.js': 'js',
        '.jsx': 'jsx',
        '.json': 'json',
        '.css': 'css',
        '.less': 'css',
        '.scss': 'css'
      },
      logLevel: 'warning',
      metafile: true, // 用于分析
    }
  }

  /**
   * 转换插件
   */
  async transformPlugins(plugins: any[]): Promise<any[]> {
    // ESBuild 插件系统与 Rollup 不同，需要适配
    return plugins.filter(p => p && p.esbuild).map(p => p.esbuild)
  }

  /**
   * 是否支持特性
   */
  supportsFeature(feature: string): boolean {
    const supportedFeatures = [
      'typescript',
      'jsx',
      'minify',
      'sourcemap',
      'code-splitting',
      'tree-shaking',
      'fast-refresh'
    ]

    // 不支持的特性
    const unsupportedFeatures = [
      'decorators', // 实验性支持
      'vue-sfc',
      'angular',
      'complex-transforms'
    ]

    if (unsupportedFeatures.includes(feature)) {
      return false
    }

    return supportedFeatures.includes(feature)
  }

  /**
   * 获取特性支持情况
   */
  getFeatureSupport(): any {
    return {
      treeshaking: true,
      'code-splitting': true,
      'dynamic-import': true,
      'worker-support': true,
      'css-bundling': true,
      'asset-processing': true,
      'sourcemap': true,
      'minification': true,
      'hot-reload': true,
      'module-federation': false,
      'incremental-build': true,
      'parallel-build': true,
      'cache-support': true,
      'plugin-system': true,
      'config-file': true
    }
  }

  /**
   * 获取性能指标
   */
  getPerformanceMetrics(): PerformanceMetrics {
    const memUsage = process.memoryUsage()

    return {
      buildTime: 0,
      memoryUsage: {
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external,
        rss: memUsage.rss,
        peak: memUsage.heapUsed,
        trend: []
      },
      cacheStats: {
        hits: 0,
        misses: 0,
        hitRate: 0,
        size: 0,
        entries: 0,
        timeSaved: 0
      },
      fileStats: {
        totalFiles: 0,
        filesByType: {},
        averageProcessingTime: 0,
        slowestFiles: [],
        processingRate: 0
      },
      pluginPerformance: [],
      systemResources: {
        cpuUsage: 0,
        availableMemory: 0,
        diskUsage: {
          total: 0,
          used: 0,
          available: 0,
          usagePercent: 0
        }
      }
    }
  }

  /**
   * 销毁资源
   */
  async dispose(): Promise<void> {
    this.logger.debug('ESBuild 适配器已销毁')
  }

  /**
   * 解析入口文件
   */
  private resolveInput(input: string | string[] | Record<string, string> | undefined): string | string[] {
    if (!input) {
      return 'src/index.ts'
    }

    if (typeof input === 'string') {
      return input
    }

    if (Array.isArray(input)) {
      return input
    }

    // Record 格式转为数组
    return Object.values(input)
  }

  /**
   * 解析输出目录
   */
  private resolveOutDir(config: UnifiedConfig): string {
    const outputConfig = Array.isArray(config.output) ? config.output[0] : config.output

    if (outputConfig?.dir) {
      return outputConfig.dir
    }

    // 根据格式选择默认目录
    const format = this.getOutputFormat(config)
    if (format === 'esm' || format === 'es') {
      return 'es'
    } else if (format === 'cjs' || format === 'commonjs') {
      return 'lib'
    }

    return 'dist'
  }

  /**
   * 获取输出格式
   */
  private getOutputFormat(config: UnifiedConfig): string {
    const outputConfig = Array.isArray(config.output) ? config.output[0] : config.output
    return (outputConfig?.format as string) || 'esm'
  }

  /**
   * 映射输出格式
   */
  private mapFormat(format: string | undefined): 'iife' | 'cjs' | 'esm' {
    if (!format) return 'esm'

    if (format === 'cjs' || format === 'commonjs') {
      return 'cjs'
    } else if (format === 'iife' || format === 'umd') {
      return 'iife'
    }

    return 'esm'
  }

  /**
   * 处理输出文件
   */
  private async processOutputs(result: any, config: UnifiedConfig, formatConfig?: any): Promise<any[]> {
    const outputs: any[] = []
    const format = formatConfig?.format || 'esm'

    if (result.metafile && result.metafile.outputs) {
      for (const [fileName, output] of Object.entries(result.metafile.outputs as Record<string, any>)) {
        const relativePath = path.relative(process.cwd(), fileName)

        outputs.push({
          fileName: relativePath,
          type: fileName.endsWith('.map') ? 'asset' : 'chunk',
          format,
          size: output.bytes || 0,
          code: undefined, // ESBuild 直接写入文件
          map: undefined
        })
      }
    }

    return outputs
  }
}

export default EsbuildAdapter



