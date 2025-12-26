/**
 * Vite 打包适配器
 * 
 * 利用 Vite 的极速构建能力进行库打包
 * 完整实现包含多格式输出、缓存、Banner 支持
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

// 导入共享基础设施
import {
  BaseAdapterCacheManager,
  BaseAdapterBannerGenerator,
  BaseAdapterOutputManager,
  AdapterBuildHelper,
  OUTPUT_DIRS
} from '../shared'

/**
 * Vite 打包适配器
 * 
 * 特点：
 * - 极速冷启动
 * - 基于 ESM 的开发服务
 * - 多格式并行构建（ESM、CJS、UMD）
 * - 内置对 Vue、React 等框架支持
 * - 缓存机制与 Banner 支持
 */
export class ViteAdapter implements IBundlerAdapter {
  readonly name = 'vite' as const
  version: string
  available: boolean

  private logger: Logger
  private vite: any = null

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
    this.cacheManager = new BaseAdapterCacheManager('vite', {}, this.logger)
    this.bannerGenerator = new BaseAdapterBannerGenerator(this.logger)
    this.outputManager = new BaseAdapterOutputManager(this.logger)
    this.buildHelper = new AdapterBuildHelper(this.logger)

    // 检查 Vite 是否可用
    this.checkAvailability()
  }

  /**
   * 检查 Vite 可用性
   */
  private checkAvailability(): void {
    try {
      this.vite = require('vite')
      const vitePkg = require('vite/package.json')
      this.version = vitePkg.version || 'unknown'
      this.available = true
      this.logger.debug(`Vite ${this.version} 已加载`)
    } catch (error) {
      this.logger.warn('Vite 不可用，请安装: npm install vite')
      this.available = false
    }
  }

  /**
   * 执行构建
   */
  async build(config: UnifiedConfig): Promise<BuildResult> {
    if (!this.available) {
      throw new BuilderError(
        ErrorCode.ADAPTER_NOT_AVAILABLE,
        'Vite 适配器不可用，请安装 vite'
      )
    }

    const startTime = Date.now()

    try {
      // 动态加载 Vite
      if (!this.vite) {
        this.vite = await import('vite')
      }

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

      // 获取 Banner 配置
      const banners = await this.bannerGenerator.resolveAll(config)

      // 为每种格式构建
      for (const formatConfig of parsedOutput.configs) {
        this.logger.info(`构建 ${formatConfig.format.toUpperCase()} 格式...`)

        const formatStartTime = Date.now()
        const viteConfig = await this.createViteConfig(config, formatConfig, banners)

        // 执行构建
        const result = await this.vite.build(viteConfig)

        // 处理输出
        const outputs = this.processOutputs(result, config, formatConfig)
        allOutputs.push(...outputs)

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

      this.logger.success(`Vite 构建完成 (${duration}ms)`)
      return buildResult

    } catch (error) {
      throw new BuilderError(
        ErrorCode.BUILD_FAILED,
        `Vite 构建失败: ${error instanceof Error ? error.message : String(error)}`,
        { cause: error as Error }
      )
    }
  }

  /**
   * 创建 Vite 配置
   */
  private async createViteConfig(config: UnifiedConfig, formatConfig: any, banners: any): Promise<any> {
    const input = this.resolveInput(config.input)
    const outputConfig = Array.isArray(config.output) ? config.output[0] : config.output
    const format = this.mapViteFormat(formatConfig.format)

    const viteConfig: any = {
      root: process.cwd(),
      mode: 'production',
      logLevel: 'warn',

      build: {
        lib: {
          entry: input,
          name: outputConfig?.name || 'Library',
          formats: [format],
          fileName: (fmt: string) => {
            const baseName = path.basename(String(input), path.extname(String(input)))
            return `${baseName}${formatConfig.extension}`
          }
        },
        outDir: formatConfig.dir,
        emptyDir: false,
        sourcemap: config.sourcemap ?? true,
        minify: config.minify ?? false,

        rollupOptions: {
          external: config.external || [],
          output: {
            globals: (config as any).globals || {},
            banner: banners.banner,
            footer: banners.footer,
            intro: banners.intro,
            outro: banners.outro
          }
        }
      },

      plugins: await this.transformPlugins(config.plugins || [])
    }

    return viteConfig
  }

  /**
   * 映射 Vite 格式
   */
  private mapViteFormat(format: string): string {
    const formatMap: Record<string, string> = {
      'esm': 'es',
      'cjs': 'cjs',
      'umd': 'umd',
      'iife': 'iife'
    }
    return formatMap[format] || 'es'
  }

  /**
   * 启动监听模式
   */
  async watch(config: UnifiedConfig): Promise<BuildWatcher> {
    if (!this.available) {
      throw new BuilderError(
        ErrorCode.ADAPTER_NOT_AVAILABLE,
        'Vite 适配器不可用'
      )
    }

    // 动态加载 Vite
    if (!this.vite) {
      this.vite = await import('vite')
    }

    const viteConfig = await this.transformConfig(config)

    // 启动 Vite 开发服务器
    const server = await this.vite.createServer({
      ...viteConfig,
      server: {
        watch: {}
      }
    })

    await server.listen()

    this.logger.info(`Vite 开发服务器启动: ${server.resolvedUrls?.local?.[0] || 'http://localhost:5173'}`)

    const { EventEmitter } = require('events')
    const watcher = new EventEmitter() as any
    watcher.patterns = [this.resolveInput(config.input) || 'src/**/*']
    watcher.watching = true
    watcher.close = async () => {
      await server.close()
      this.logger.info('Vite 开发服务器已关闭')
    }

    return watcher
  }

  /**
   * 转换配置
   */
  async transformConfig(config: UnifiedConfig): Promise<any> {
    const input = this.resolveInput(config.input)
    const outDir = this.resolveOutDir(config)
    const outputConfig = Array.isArray(config.output) ? config.output[0] : config.output

    return {
      root: process.cwd(),
      mode: 'production',

      build: {
        lib: {
          entry: input,
          name: outputConfig?.name || 'Library',
          formats: this.getFormats(outputConfig),
          fileName: (format: string) => {
            const baseName = path.basename(String(input), path.extname(String(input)))
            return `${baseName}.${format === 'es' ? 'mjs' : format === 'cjs' ? 'cjs' : 'js'}`
          }
        },
        outDir,
        emptyDir: false,
        sourcemap: config.sourcemap ?? true,
        minify: config.minify ?? 'terser',

        rollupOptions: {
          external: config.external || [],
          output: {
            globals: config.globals || {}
          }
        }
      },

      plugins: await this.transformPlugins(config.plugins || [])
    }
  }

  /**
   * 转换插件
   */
  async transformPlugins(plugins: any[]): Promise<any[]> {
    // Vite 兼容大部分 Rollup 插件
    return plugins.filter(p => p && typeof p === 'object' && p.name)
  }

  /**
   * 是否支持特性
   */
  supportsFeature(feature: string): boolean {
    const supportedFeatures = [
      'typescript',
      'jsx',
      'vue',
      'react',
      'svelte',
      'minify',
      'sourcemap',
      'code-splitting',
      'tree-shaking',
      'hmr',
      'css-modules',
      'postcss'
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
    this.vite = null
    this.logger.debug('Vite 适配器已销毁')
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

    // Record 格式取第一个值
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

  /**
   * 获取输出格式
   */
  private getFormats(output: any): string[] {
    if (!output?.format) return ['es', 'cjs']

    const format = output.format
    if (format === 'esm' || format === 'es') return ['es']
    if (format === 'cjs' || format === 'commonjs') return ['cjs']
    if (format === 'umd') return ['umd']
    if (format === 'iife') return ['iife']

    return ['es', 'cjs']
  }

  /**
   * 处理输出文件
   */
  private processOutputs(result: any, config: UnifiedConfig, formatConfig?: any): any[] {
    const outputs: any[] = []
    const format = formatConfig?.format || 'esm'

    // Vite build 返回 RollupOutput 或 RollupOutput[]
    const rollupOutputs = Array.isArray(result) ? result : [result]

    for (const rollupOutput of rollupOutputs) {
      if (rollupOutput?.output) {
        for (const chunk of rollupOutput.output) {
          outputs.push({
            fileName: path.join(formatConfig?.dir || 'dist', chunk.fileName),
            type: chunk.type === 'chunk' ? 'chunk' : 'asset',
            format,
            size: chunk.type === 'chunk'
              ? Buffer.byteLength(chunk.code, 'utf8')
              : Buffer.byteLength(String(chunk.source), 'utf8'),
            isEntry: chunk.type === 'chunk' && chunk.isEntry,
            code: chunk.type === 'chunk' ? chunk.code : undefined
          })
        }
      }
    }

    return outputs
  }

  /**
   * 检测文件格式
   */
  private detectFormat(fileName: string): string {
    if (fileName.endsWith('.mjs') || fileName.endsWith('.es.js')) return 'esm'
    if (fileName.endsWith('.cjs') || fileName.endsWith('.cjs.js')) return 'cjs'
    if (fileName.endsWith('.umd.js')) return 'umd'
    if (fileName.endsWith('.iife.js')) return 'iife'
    if (fileName.endsWith('.d.ts')) return 'dts'
    return 'unknown'
  }
}

export default ViteAdapter
