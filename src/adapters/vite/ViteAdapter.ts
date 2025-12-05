/**
 * Vite 打包适配器
 * 
 * 利用 Vite 的极速构建能力进行库打包
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

/**
 * Vite 打包适配器
 * 
 * 特点：
 * - 极速冷启动
 * - 基于 ESM 的开发服务
 * - 优化的生产构建
 * - 内置对 Vue、React 等框架支持
 */
export class ViteAdapter implements IBundlerAdapter {
  readonly name = 'vite' as const
  version: string
  available: boolean

  private logger: Logger
  private vite: any = null

  constructor(options: Partial<AdapterOptions> = {}) {
    this.logger = options.logger || new Logger()
    this.version = 'unknown'
    this.available = false

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

      // 转换配置
      const viteConfig = await this.transformConfig(config)

      // 执行构建
      const result = await this.vite.build(viteConfig)

      // 处理输出
      const outputs = this.processOutputs(result, config)
      const duration = Date.now() - startTime
      const totalRawSize = outputs.reduce((sum: number, o: any) => sum + (o.size || 0), 0)

      return {
        success: true,
        outputs,
        duration,
        stats: {
          buildTime: duration,
          fileCount: outputs.length,
          totalSize: {
            raw: totalRawSize,
            gzip: 0,
            brotli: 0,
            byType: {},
            byFormat: {} as any,
            largest: {
              file: outputs[0]?.fileName || '',
              size: outputs[0]?.size || 0
            },
            fileCount: outputs.length
          },
          byFormat: {} as any,
          modules: {
            total: 0,
            external: 0,
            internal: 0,
            largest: {
              id: '',
              size: 0,
              renderedLength: 0,
              originalLength: 0,
              isEntry: false,
              isExternal: false,
              importedIds: [],
              dynamicallyImportedIds: [],
              importers: [],
              dynamicImporters: []
            }
          },
          dependencies: {
            total: 0,
            external: [],
            bundled: [],
            circular: []
          }
        },
        performance: this.getPerformanceMetrics(),
        warnings: [],
        errors: [],
        buildId: `vite-${Date.now()}`,
        timestamp: Date.now(),
        bundler: this.name,
        mode: (config as any).mode || 'production',
        libraryType: (config as any).libraryType
      }
    } catch (error) {
      throw new BuilderError(
        ErrorCode.BUILD_FAILED,
        `Vite 构建失败: ${error instanceof Error ? error.message : String(error)}`,
        { cause: error as Error }
      )
    }
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
  private processOutputs(result: any, config: UnifiedConfig): any[] {
    const outputs: any[] = []
    const outputDir = this.resolveOutDir(config)

    // Vite build 返回 RollupOutput 或 RollupOutput[]
    const rollupOutputs = Array.isArray(result) ? result : [result]

    for (const rollupOutput of rollupOutputs) {
      if (rollupOutput?.output) {
        for (const chunk of rollupOutput.output) {
          outputs.push({
            fileName: chunk.fileName,
            type: chunk.type === 'chunk' ? 'chunk' : 'asset',
            format: this.detectFormat(chunk.fileName),
            size: chunk.type === 'chunk'
              ? Buffer.byteLength(chunk.code, 'utf8')
              : Buffer.byteLength(String(chunk.source), 'utf8'),
            isEntry: chunk.type === 'chunk' && chunk.isEntry
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
