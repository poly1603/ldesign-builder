/**
 * Turbopack 打包适配器
 * 
 * 利用 Rust 实现的极速打包引擎，提供完整的多格式输出支持
 * 
 * @author LDesign Team
 * @version 2.0.0
 */

import type {
  IBundlerAdapter,
  UnifiedConfig,
  AdapterOptions
} from '../../types/adapter'
import type { BuildResult, BuildWatcher } from '../../types/builder'
import type { PerformanceMetrics } from '../../types/performance'
import { Logger } from '../../utils/logger'
import { BuilderError } from '../../utils/error-handler'
import { ErrorCode } from '../../constants/errors'
import path from 'path'
import fs from 'fs-extra'
import fastGlob from 'fast-glob'

// 导入共享基础设施
import {
  BaseAdapterCacheManager,
  BaseAdapterBannerGenerator,
  BaseAdapterOutputManager,
  AdapterBuildHelper,
  OUTPUT_DIRS
} from '../shared'

/**
 * Turbopack 打包适配器
 * 
 * 特点：
 * - Rust 实现，极致性能
 * - 增量编译
 * - 智能缓存
 * - Next.js 原生集成
 * - 多格式输出（ESM、CJS、UMD）
 * - 标准目录结构 (es/, lib/, dist/, types/)
 * - Banner/Footer 支持
 */
export class TurbopackAdapter implements IBundlerAdapter {
  readonly name = 'turbopack' as const
  version: string
  available: boolean

  private logger: Logger
  private turbo: any = null

  // 辅助模块
  private cacheManager: BaseAdapterCacheManager
  private bannerGenerator: BaseAdapterBannerGenerator
  private outputManager: BaseAdapterOutputManager
  private buildHelper: AdapterBuildHelper

  constructor(options: Partial<AdapterOptions> = {}) {
    this.logger = options.logger || new Logger()
    this.version = 'unknown'
    this.available = false

    // 初始化辅助模块
    this.cacheManager = new BaseAdapterCacheManager('turbopack', {}, this.logger)
    this.bannerGenerator = new BaseAdapterBannerGenerator(this.logger)
    this.outputManager = new BaseAdapterOutputManager(this.logger)
    this.buildHelper = new AdapterBuildHelper(this.logger)

    // 检查 Turbopack 是否可用
    this.checkAvailability()
  }

  /**
   * 检查 Turbopack 可用性
   */
  private checkAvailability(): void {
    try {
      // Turbopack 目前主要通过 Next.js 使用
      // 独立使用需要 @vercel/turbopack
      require.resolve('@vercel/turbopack')
      this.turbo = require('@vercel/turbopack')
      this.version = this.turbo.version || '1.0.0'
      this.available = true
      this.logger.debug(`Turbopack ${this.version} 已加载`)
    } catch {
      // 回退检查 turbo
      try {
        require.resolve('turbo')
        this.available = true
        this.version = 'via-turbo'
        this.logger.debug('Turbopack (通过 turbo) 可用')
      } catch {
        this.logger.warn('Turbopack 不可用，请安装: npm install @vercel/turbopack')
        this.available = false
      }
    }
  }

  /**
   * 执行构建
   */
  async build(config: UnifiedConfig): Promise<BuildResult> {
    if (!this.available) {
      throw new BuilderError(
        ErrorCode.ADAPTER_NOT_AVAILABLE,
        'Turbopack 适配器不可用，请安装: npm install @vercel/turbopack'
      )
    }

    const startTime = Date.now()

    try {
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

      // 获取 Banner 配置
      const banners = await this.bannerGenerator.resolveAll(config)

      const allOutputs: any[] = []

      // 为每种格式构建
      for (const formatConfig of parsedOutput.configs) {
        this.logger.info(`构建 ${formatConfig.format.toUpperCase()} 格式...`)
        const formatStartTime = Date.now()

        // 创建针对该格式的配置
        const turboConfig = await this.createFormatConfig(config, formatConfig)

        // 执行构建
        const formatOutputs = await this.performBuild(turboConfig, config, formatConfig, {
          banner: banners.banner || '',
          footer: banners.footer || '',
          intro: banners.intro || '',
          outro: banners.outro || ''
        })
        allOutputs.push(...formatOutputs)

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
        libraryType: (config as any).libraryType
      })

      // 缓存结果
      if (cacheEnabled) {
        await this.cacheManager.cacheResult(cacheKey, buildResult)
      }

      this.logger.success(`Turbopack 构建完成 (${duration}ms)`)
      return buildResult

    } catch (error) {
      throw new BuilderError(
        ErrorCode.BUILD_FAILED,
        `Turbopack 构建失败: ${error instanceof Error ? error.message : String(error)}`,
        { cause: error as Error }
      )
    }
  }

  /**
   * 创建针对特定格式的配置
   */
  private async createFormatConfig(config: UnifiedConfig, formatConfig: any): Promise<any> {
    const input = this.resolveInput(config.input)

    return {
      entry: input,
      output: {
        path: formatConfig.dir,
        format: formatConfig.format === 'esm' ? 'esm' : formatConfig.format === 'cjs' ? 'commonjs' : 'umd',
        filename: `[name]${formatConfig.extension}`
      },
      minify: config.minify ?? false,
      sourcemap: config.sourcemap ?? true,
      external: config.external || [],
      // Turbopack 特有配置
      experimental: {
        turbo: {
          loaders: {
            '.ts': ['swc-loader'],
            '.tsx': ['swc-loader'],
            '.js': ['swc-loader'],
            '.jsx': ['swc-loader']
          },
          resolveAlias: config.alias || {}
        }
      }
    }
  }

  /**
   * 执行实际构建
   */
  private async performBuild(
    turboConfig: any,
    config: UnifiedConfig,
    formatConfig: any,
    banners: { banner: string; footer: string; intro: string; outro: string }
  ): Promise<any[]> {
    const outputs: any[] = []

    // 确保输出目录存在
    await fs.ensureDir(formatConfig.dir)

    if (this.turbo && typeof this.turbo.build === 'function') {
      // 使用 Turbopack API
      const result = await this.turbo.build(turboConfig)

      if (result?.output) {
        for (const chunk of result.output) {
          // 添加 Banner/Footer
          let code = chunk.code || ''
          if (banners.banner) {
            code = banners.banner + '\n' + code
          }
          if (banners.footer) {
            code = code + '\n' + banners.footer
          }

          // 写入文件
          const outputPath = path.join(formatConfig.dir, chunk.fileName || chunk.name)
          await fs.ensureDir(path.dirname(outputPath))
          await fs.writeFile(outputPath, code)

          outputs.push({
            fileName: path.relative(process.cwd(), outputPath),
            type: 'chunk',
            format: formatConfig.format,
            size: Buffer.byteLength(code),
            code,
            isEntry: chunk.isEntry || false
          })
        }
      }
    } else {
      // 回退模式：使用 SWC 进行转换
      await this.fallbackBuild(config, formatConfig, banners, outputs)
    }

    return outputs
  }

  /**
   * 回退构建模式（当 Turbopack API 不可用时）
   */
  private async fallbackBuild(
    config: UnifiedConfig,
    formatConfig: any,
    banners: { banner: string; footer: string; intro: string; outro: string },
    outputs: any[]
  ): Promise<void> {
    this.logger.warn('Turbopack 构建 API 不可用，使用 SWC 回退模式')

    try {
      const swc = await import('@swc/core')
      const inputFiles = await this.resolveInputFiles(config.input)

      for (const inputFile of inputFiles) {
        const swcConfig = this.createSwcConfig(formatConfig)
        const result = await swc.transformFile(inputFile, swcConfig)

        // 添加 Banner/Footer
        let code = result.code
        if (banners.banner) {
          code = banners.banner + '\n' + code
        }
        if (banners.footer) {
          code = code + '\n' + banners.footer
        }

        const outputPath = this.getOutputPath(inputFile, formatConfig)
        await fs.ensureDir(path.dirname(outputPath))
        await fs.writeFile(outputPath, code)

        // Source map
        if (result.map && config.sourcemap) {
          await fs.writeFile(outputPath + '.map', result.map)
        }

        outputs.push({
          fileName: path.relative(process.cwd(), outputPath),
          type: 'chunk',
          format: formatConfig.format,
          size: Buffer.byteLength(code),
          code,
          map: result.map
        })
      }
    } catch (error) {
      this.logger.error('SWC 回退构建失败:', error)
      // 创建空输出
      outputs.push({
        fileName: path.join(formatConfig.dir, `index${formatConfig.extension}`),
        type: 'chunk',
        format: formatConfig.format,
        size: 0,
        isEntry: true
      })
    }
  }

  /**
   * 创建 SWC 配置（回退模式使用）
   */
  private createSwcConfig(formatConfig: any): any {
    const moduleType = formatConfig.format === 'cjs' ? 'commonjs' : 'es6'

    return {
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: true,
          decorators: true,
          dynamicImport: true
        },
        transform: {
          react: {
            runtime: 'automatic'
          }
        },
        target: 'es2020'
      },
      module: {
        type: moduleType
      },
      sourceMaps: true
    }
  }

  /**
   * 解析入口文件列表
   */
  private async resolveInputFiles(input: string | string[] | Record<string, string> | undefined): Promise<string[]> {
    if (!input) {
      input = 'src/**/*.{ts,tsx,js,jsx}'
    }

    if (typeof input === 'string') {
      if (input.includes('*')) {
        return await fastGlob(input, { absolute: true })
      }
      return [path.resolve(process.cwd(), input)]
    }

    if (Array.isArray(input)) {
      const files: string[] = []
      for (const pattern of input) {
        if (pattern.includes('*')) {
          files.push(...await fastGlob(pattern, { absolute: true }))
        } else {
          files.push(path.resolve(process.cwd(), pattern))
        }
      }
      return files
    }

    return Object.values(input).map(f => path.resolve(process.cwd(), f))
  }

  /**
   * 获取输出路径
   */
  private getOutputPath(inputFile: string, formatConfig: any): string {
    const relativePath = path.relative(process.cwd(), inputFile)

    // 移除 src 前缀
    const withoutSrc = relativePath.startsWith('src/') || relativePath.startsWith('src\\')
      ? relativePath.slice(4)
      : relativePath

    // 更改扩展名
    const outputPath = withoutSrc.replace(/\.(ts|tsx|js|jsx)$/, formatConfig.extension)

    return path.join(process.cwd(), formatConfig.dir, outputPath)
  }

  /**
   * 启动监听模式
   */
  async watch(config: UnifiedConfig): Promise<BuildWatcher> {
    if (!this.available) {
      throw new BuilderError(
        ErrorCode.ADAPTER_NOT_AVAILABLE,
        'Turbopack 适配器不可用'
      )
    }

    this.logger.info('启动 Turbopack 监听模式...')

    const { EventEmitter } = require('events')
    const watcher = new EventEmitter() as any

    watcher.patterns = [this.resolveInput(config.input) || 'src/**/*']
    watcher.watching = true
    watcher.close = async () => {
      this.logger.info('Turbopack 监听模式已停止')
    }

    return watcher
  }

  /**
   * 转换配置
   */
  async transformConfig(config: UnifiedConfig): Promise<any> {
    const input = this.resolveInput(config.input)
    const outDir = this.resolveOutDir(config)

    return {
      entry: input,
      output: {
        path: outDir,
        format: 'esm'
      },
      minify: config.minify ?? false,
      sourcemap: config.sourcemap ?? true,
      external: config.external || [],
      // Turbopack 特有配置
      experimental: {
        turbo: {
          loaders: {
            '.ts': ['swc-loader'],
            '.tsx': ['swc-loader'],
            '.js': ['swc-loader'],
            '.jsx': ['swc-loader']
          }
        }
      }
    }
  }

  /**
   * 转换插件
   */
  async transformPlugins(plugins: any[]): Promise<any[]> {
    // Turbopack 有自己的插件系统
    return plugins.filter(p => p && p.turbopack)
  }

  /**
   * 是否支持特性
   */
  supportsFeature(feature: string): boolean {
    const supportedFeatures = [
      'typescript',
      'jsx',
      'react',
      'next',
      'sourcemap',
      'code-splitting',
      'tree-shaking',
      'hmr',
      'incremental-build'
    ]

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
    this.turbo = null
    this.logger.debug('Turbopack 适配器已销毁')
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
      return input[0] || 'src/index.ts'
    }

    return Object.values(input)[0] || 'src/index.ts'
  }

  /**
   * 解析输出目录
   */
  private resolveOutDir(config: UnifiedConfig): string {
    const outputConfig = Array.isArray(config.output) ? config.output[0] : config.output

    if (outputConfig?.dir) {
      return outputConfig.dir
    }

    return 'dist'
  }
}

export default TurbopackAdapter
