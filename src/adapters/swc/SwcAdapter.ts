/**
 * SWC 适配器
 * 
 * 提供 SWC 打包器的完整适配实现，专注于快速生产构建
 * 支持多格式输出、缓存机制、Banner 支持
 * 
 * @author LDesign Team
 * @version 1.0.0
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
 * SWC 适配器类
 * 
 * 特点：
 * - 20x 速度提升（相比 Babel）
 * - 多格式输出支持（ESM、CJS、UMD）
 * - 完整的 TypeScript/JSX 支持
 * - 装饰器支持
 * - 缓存机制与 Banner 支持
 */
export class SwcAdapter implements IBundlerAdapter {
  readonly name = 'swc' as const
  version: string
  available: boolean

  private logger: Logger
  private swc: any

  // 辅助模块
  private cacheManager: BaseAdapterCacheManager
  private bannerGenerator: BaseAdapterBannerGenerator
  private outputManager: BaseAdapterOutputManager
  private buildHelper: AdapterBuildHelper

  constructor(options: Partial<AdapterOptions> = {}) {
    this.logger = options.logger || new Logger()
    this.version = 'unknown'
    this.available = true // 假设可用，在实际使用时验证

    // 初始化辅助模块
    this.cacheManager = new BaseAdapterCacheManager('swc', {}, this.logger)
    this.bannerGenerator = new BaseAdapterBannerGenerator(this.logger)
    this.outputManager = new BaseAdapterOutputManager(this.logger)
    this.buildHelper = new AdapterBuildHelper(this.logger)

    // 尝试同步加载
    this.checkAvailability()
  }

  /**
   * 检查 SWC 可用性（同步）
   */
  private checkAvailability(): void {
    try {
      if (typeof require !== 'undefined') {
        this.swc = require('@swc/core')
        this.version = this.swc.version || 'unknown'
        this.available = true
        this.logger.debug(`SWC ${this.version} 已加载`)
      }
    } catch (error) {
      // 同步加载失败，将在使用时尝试异步加载
      this.logger.debug('SWC 同步加载失败，将在使用时异步加载')
    }
  }

  /**
   * 确保 SWC 已加载（支持异步）
   */
  private async ensureSwcLoaded(): Promise<any> {
    if (this.swc) {
      return this.swc
    }

    try {
      this.swc = await import('@swc/core')
      this.version = this.swc.version || 'unknown'
      this.available = true
      this.logger.debug(`SWC 异步加载成功: ${this.version}`)
      return this.swc
    } catch (error) {
      this.available = false
      throw new BuilderError(
        ErrorCode.ADAPTER_NOT_AVAILABLE,
        'SWC 未安装或无法加载，请运行: npm install @swc/core --save-dev',
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
      // 确保 SWC 已加载
      const swc = await this.ensureSwcLoaded()

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

      // 解析入口文件
      const inputFiles = await this.resolveInputFiles(config.input)
      const allOutputs: any[] = []

      // 为每种格式构建
      for (const formatConfig of parsedOutput.configs) {
        this.logger.info(`构建 ${formatConfig.format.toUpperCase()} 格式...`)

        const formatStartTime = Date.now()

      // 转换配置
        const swcConfig = await this.createSwcConfig(config, formatConfig)

        // 处理每个文件
        for (const inputFile of inputFiles) {
          const result = await swc.transformFile(inputFile, swcConfig)

          // 添加 Banner
          let code = result.code
          if (banners.banner) {
            code = banners.banner + '\n' + code
          }
          if (banners.footer) {
            code = code + '\n' + banners.footer
          }

          const outputFile = this.getOutputPathForFormat(inputFile, formatConfig)
          await fs.ensureDir(path.dirname(outputFile))
          await fs.writeFile(outputFile, code)

          // 如果有 source map
          if (result.map && config.sourcemap) {
            await fs.writeFile(outputFile + '.map', result.map)
          }

          allOutputs.push({
            fileName: path.relative(process.cwd(), outputFile),
            type: 'chunk',
            format: formatConfig.format,
            size: Buffer.byteLength(code),
            code,
            map: result.map
          })
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
        libraryType: (config as any).libraryType
      })

      // 缓存结果
      if (cacheEnabled) {
        await this.cacheManager.cacheResult(cacheKey, buildResult)
      }

      this.logger.success(`SWC 构建完成 (${duration}ms)`)
      return buildResult

    } catch (error) {
      throw new BuilderError(
        ErrorCode.BUILD_FAILED,
        `SWC 构建失败: ${error instanceof Error ? error.message : String(error)}`,
        { cause: error as Error }
      )
    }
  }

  /**
   * 创建 SWC 配置
   */
  private async createSwcConfig(config: UnifiedConfig, formatConfig: any): Promise<any> {
    const moduleType = this.mapModuleType(formatConfig.format)

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
            runtime: 'automatic',
            development: (config as any).mode === 'development'
          },
          decoratorMetadata: true,
          legacyDecorator: true
        },
        target: this.mapTarget((config as any).typescript?.target),
        loose: false,
        externalHelpers: true,
        keepClassNames: true
      },
      module: {
        type: moduleType,
        strict: false,
        strictMode: true,
        lazy: false,
        noInterop: false
      },
      minify: config.minify === true,
      sourceMaps: config.sourcemap === true || config.sourcemap === 'inline',
      inlineSourcesContent: true
    }
  }

  /**
   * 根据格式获取输出路径
   */
  private getOutputPathForFormat(inputFile: string, formatConfig: any): string {
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
        'SWC 适配器不可用'
      )
    }

    // SWC 没有内置 watch 模式，需要使用 chokidar
    const chokidar = require('chokidar')
    const inputFiles = await this.resolveInputFiles(config.input)

    const watcher = chokidar.watch(inputFiles, {
      persistent: true,
      ignoreInitial: false
    })

    watcher.on('change', async (filePath: string) => {
      this.logger.info(`文件变化: ${filePath}`)
      try {
        await this.build(config)
        this.logger.success('重新构建成功')
      } catch (error) {
        this.logger.error('重新构建失败:', error)
      }
    })

    // 扩展 watcher 对象
    const buildWatcher = watcher as any
    buildWatcher.patterns = inputFiles
    buildWatcher.watching = true
    const originalClose = watcher.close.bind(watcher)
    buildWatcher.close = async () => {
      await originalClose()
    }

    return buildWatcher
  }

  /**
   * 转换配置
   */
  async transformConfig(config: UnifiedConfig): Promise<any> {
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
            runtime: 'automatic',
            development: config.mode === 'development'
          },
          decoratorMetadata: true,
          legacyDecorator: true
        },
        target: this.mapTarget(config.typescript?.target),
        loose: false,
        externalHelpers: true,
        keepClassNames: true
      },
      module: {
        type: this.mapModuleType(this.getOutputFormat(config)),
        strict: false,
        strictMode: true,
        lazy: false,
        noInterop: false
      },
      minify: config.minify === true,
      sourceMaps: config.sourcemap === true || config.sourcemap === 'inline',
      inlineSourcesContent: true
    }
  }

  /**
   * 转换插件
   */
  async transformPlugins(plugins: any[]): Promise<any[]> {
    // SWC 插件系统基于 Rust，需要特殊处理
    return plugins.filter(p => p && p.swc).map(p => p.swc)
  }

  /**
   * 是否支持特性
   */
  supportsFeature(feature: string): boolean {
    const supportedFeatures = [
      'typescript',
      'jsx',
      'tsx',
      'decorators',
      'minify',
      'sourcemap',
      'react',
      'vue', // 通过插件
      'emotion',
      'styled-components'
    ]

    return supportedFeatures.includes(feature)
  }

  /**
   * 获取特性支持情况
   */
  getFeatureSupport(): any {
    return {
      treeshaking: false,
      'code-splitting': false,
      'dynamic-import': true,
      'worker-support': false,
      'css-bundling': false,
      'asset-processing': false,
      'sourcemap': true,
      'minification': true,
      'hot-reload': false,
      'module-federation': false,
      'incremental-build': false,
      'parallel-build': false,
      'cache-support': false,
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
    this.logger.debug('SWC 适配器已销毁')
  }

  /**
   * 解析入口文件
   */
  private async resolveInputFiles(input: string | string[] | Record<string, string> | undefined): Promise<string[]> {
    if (!input) {
      input = 'src/**/*.{ts,tsx,js,jsx}'
    }

    if (typeof input === 'string') {
      // 如果是 glob 模式
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

    // Record 格式
    return Object.values(input).map(f => path.resolve(process.cwd(), f))
  }

  /**
   * 获取输出格式
   */
  private getOutputFormat(config: UnifiedConfig): string {
    const outputConfig = Array.isArray(config.output) ? config.output[0] : config.output
    return (outputConfig?.format as string) || 'esm'
  }

  /**
   * 获取输出目录
   */
  private getOutputDir(config: UnifiedConfig): string {
    const outputConfig = Array.isArray(config.output) ? config.output[0] : config.output
    return outputConfig?.dir || 'dist'
  }

  /**
   * 获取输出路径
   */
  private getOutputPath(inputFile: string, config: UnifiedConfig): string {
    const outDir = this.getOutputDir(config)
    const relativePath = path.relative(process.cwd(), inputFile)

    // 移除 src 前缀
    const withoutSrc = relativePath.startsWith('src/')
      ? relativePath.slice(4)
      : relativePath

    // 更改扩展名
    const format = this.getOutputFormat(config)
    let ext = '.js'
    if (format === 'cjs' || format === 'commonjs') {
      ext = '.cjs'
    } else if (format === 'esm' || format === 'es') {
      ext = '.js'
    }

    const outputPath = withoutSrc.replace(/\.(ts|tsx|js|jsx)$/, ext)

    return path.join(process.cwd(), outDir, outputPath)
  }

  /**
   * 映射目标版本
   */
  private mapTarget(target: string | undefined): string {
    if (!target) return 'es2020'

    const targetMap: Record<string, string> = {
      'ES3': 'es3',
      'ES5': 'es5',
      'ES2015': 'es2015',
      'ES2016': 'es2016',
      'ES2017': 'es2017',
      'ES2018': 'es2018',
      'ES2019': 'es2019',
      'ES2020': 'es2020',
      'ES2021': 'es2021',
      'ES2022': 'es2022',
      'ESNext': 'es2022'
    }

    return targetMap[target] || 'es2020'
  }

  /**
   * 映射模块类型
   */
  private mapModuleType(format: string | undefined): 'commonjs' | 'es6' | 'amd' | 'umd' {
    if (!format) return 'es6'

    if (format === 'cjs' || format === 'commonjs') {
      return 'commonjs'
    } else if (format === 'esm' || format === 'es') {
      return 'es6'
    } else if (format === 'amd') {
      return 'amd'
    } else if (format === 'umd') {
      return 'umd'
    }

    return 'es6'
  }
}



