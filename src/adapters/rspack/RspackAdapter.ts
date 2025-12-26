/**
 * Rspack 适配器
 * 
 * 提供 Rspack 打包器的完整适配实现
 * Rspack 是基于 Rust 的高性能 Webpack 兼容打包器
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
 * Rspack 适配器类
 * 
 * 特点：
 * - Rust 实现，极高性能（10x-20x 速度提升）
 * - 完全兼容 Webpack 生态
 * - 支持 Module Federation
 * - 内置 SWC 转译
 * - 增量构建支持
 */
export class RspackAdapter implements IBundlerAdapter {
  readonly name = 'rspack' as const
  version: string
  available: boolean

  private logger: Logger
  private rspack: any = null

  // 辅助模块
  private cacheManager: BaseAdapterCacheManager
  private bannerGenerator: BaseAdapterBannerGenerator
  private outputManager: BaseAdapterOutputManager
  private styleHandler: BaseAdapterStyleHandler
  private buildHelper: AdapterBuildHelper

  constructor(options: Partial<AdapterOptions> = {}) {
    this.logger = options.logger || new Logger()
    this.version = 'unknown'
    this.available = false

    // 初始化辅助模块
    this.cacheManager = new BaseAdapterCacheManager('rspack', {}, this.logger)
    this.bannerGenerator = new BaseAdapterBannerGenerator(this.logger)
    this.outputManager = new BaseAdapterOutputManager(this.logger)
    this.styleHandler = new BaseAdapterStyleHandler(this.logger)
    this.buildHelper = new AdapterBuildHelper(this.logger)

    // 检查 Rspack 可用性
    this.checkAvailability()
  }

  /**
   * 检查 Rspack 可用性
   */
  private checkAvailability(): void {
    try {
      if (typeof require !== 'undefined') {
        this.rspack = require('@rspack/core')
        const rspackPkg = require('@rspack/core/package.json')
        this.version = rspackPkg.version || 'unknown'
        this.available = true
        this.logger.debug(`Rspack ${this.version} 已加载`)
      }
    } catch (error) {
      this.logger.debug('Rspack 同步加载失败，将在使用时异步加载')
    }
  }

  /**
   * 确保 Rspack 已加载
   */
  private async ensureRspackLoaded(): Promise<any> {
    if (this.rspack) {
      return this.rspack
    }

    try {
      // @ts-ignore - Dynamic import for optional dependency
      this.rspack = await import('@rspack/core')
      // @ts-ignore - Dynamic import for optional dependency
      const rspackPkg = await import('@rspack/core/package.json')
      this.version = (rspackPkg as any).version || 'unknown'
      this.available = true
      this.logger.debug(`Rspack 异步加载成功: ${this.version}`)
      return this.rspack
    } catch (error) {
      this.available = false
      throw new BuilderError(
        ErrorCode.ADAPTER_NOT_AVAILABLE,
        'Rspack 未安装或无法加载，请运行: npm install @rspack/core @rspack/cli --save-dev',
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
      // 确保 Rspack 已加载
      const rspack = await this.ensureRspackLoaded()

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
      let totalDuration = 0

      // 为每种格式构建
      for (const formatConfig of parsedOutput.configs) {
        this.logger.info(`构建 ${formatConfig.format.toUpperCase()} 格式...`)

        const formatStartTime = Date.now()
        const rspackConfig = await this.createRspackConfig(config, formatConfig)

        // 执行 Rspack 构建
        const compiler = rspack.rspack(rspackConfig)
        
        const result = await new Promise<any>((resolve, reject) => {
          compiler.run((err: any, stats: any) => {
            if (err) {
              reject(err)
              return
            }

            if (stats.hasErrors()) {
              const info = stats.toJson()
              reject(new Error(info.errors?.map((e: any) => e.message).join('\n')))
              return
            }

            compiler.close((closeErr: any) => {
              if (closeErr) {
                this.logger.warn(`关闭编译器时出错: ${closeErr.message}`)
              }
              resolve(stats)
            })
          })
        })

        const formatDuration = Date.now() - formatStartTime
        totalDuration += formatDuration

        // 处理输出
        const statsJson = result.toJson({
          assets: true,
          chunks: true,
          modules: true
        })

        for (const asset of statsJson.assets || []) {
          allOutputs.push({
            fileName: path.join(formatConfig.dir, asset.name),
            size: asset.size || 0,
            type: asset.name.includes('.map') ? 'asset' : 'chunk',
            format: formatConfig.format,
            isEntry: asset.isOverSizeLimit !== undefined
          })
        }

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

      this.logger.success(`Rspack 构建完成 (${duration}ms)`)
      return buildResult

    } catch (error) {
      throw new BuilderError(
        ErrorCode.BUILD_FAILED,
        `Rspack 构建失败: ${(error as Error).message}`,
        { cause: error as Error }
      )
    }
  }

  /**
   * 创建 Rspack 配置
   */
  private async createRspackConfig(config: UnifiedConfig, formatConfig: any): Promise<any> {
    const entry = this.buildHelper.getEntryPoint(config.input)
    const banners = await this.bannerGenerator.resolveAll(config)
    const isESM = formatConfig.format === 'esm'
    const isCJS = formatConfig.format === 'cjs'
    const isUMD = formatConfig.format === 'umd'

    // 解析外部依赖
    const external = await this.buildHelper.getExternalDependencies(config)

    const rspackConfig: any = {
      mode: (config as any).mode || 'production',
      entry: {
        index: entry
      },
      output: {
        path: path.resolve(process.cwd(), formatConfig.dir),
        filename: `[name]${formatConfig.extension}`,
        chunkFilename: `[name]${formatConfig.extension}`,
        library: isUMD ? {
          name: (config as any).output?.name || 'Library',
          type: 'umd',
          umdNamedDefine: true
        } : {
          type: isESM ? 'module' : 'commonjs2'
        },
        clean: false,
        globalObject: 'this'
      },
      resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        alias: (config as any).alias || {}
      },
      externals: this.formatExternals(external, formatConfig.format),
      module: {
        rules: [
          // TypeScript/JavaScript 使用内置 SWC
          {
            test: /\.(ts|tsx|js|jsx)$/,
            exclude: /node_modules/,
            loader: 'builtin:swc-loader',
            options: {
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
                  }
                },
                target: this.buildHelper.mapTarget((config as any).typescript?.target)
              },
              module: {
                type: isESM ? 'es6' : 'commonjs'
              }
            }
          },
          // CSS 处理
          {
            test: /\.css$/,
            type: 'css'
          },
          // Less 处理
          {
            test: /\.less$/,
            use: ['less-loader'],
            type: 'css'
          },
          // SCSS 处理
          {
            test: /\.s[ac]ss$/,
            use: ['sass-loader'],
            type: 'css'
          },
          // 资源处理
          {
            test: /\.(png|jpe?g|gif|svg|webp)$/,
            type: 'asset'
          },
          {
            test: /\.(woff2?|eot|ttf|otf)$/,
            type: 'asset'
          }
        ]
      },
      plugins: [],
      optimization: {
        minimize: config.minify === true,
        splitChunks: false,
        runtimeChunk: false
      },
      devtool: config.sourcemap ? 'source-map' : false,
      experiments: {
        outputModule: isESM
      }
    }

    // 添加 Banner 插件
    if (banners.banner) {
      const { BannerPlugin } = await this.ensureRspackLoaded()
      rspackConfig.plugins.push(new BannerPlugin({
        banner: banners.banner,
        raw: true
      }))
    }

    // 添加用户插件
    if (config.plugins && config.plugins.length > 0) {
      const userPlugins = await this.transformPlugins(config.plugins)
      rspackConfig.plugins.push(...userPlugins)
    }

    return rspackConfig
  }

  /**
   * 格式化外部依赖
   */
  private formatExternals(external: string[], format: string): any {
    if (format === 'umd') {
      // UMD 格式需要特殊处理
      const externalsObj: Record<string, any> = {}
      for (const dep of external) {
        externalsObj[dep] = {
          commonjs: dep,
          commonjs2: dep,
          amd: dep,
          root: this.getGlobalName(dep)
        }
      }
      return externalsObj
    }

    return external
  }

  /**
   * 获取全局变量名
   */
  private getGlobalName(dep: string): string {
    // 将包名转换为全局变量名
    // 例如: lodash -> _, react -> React, vue -> Vue
    const globalNames: Record<string, string> = {
      'lodash': '_',
      'react': 'React',
      'react-dom': 'ReactDOM',
      'vue': 'Vue',
      'jquery': '$'
    }

    return globalNames[dep] || dep.replace(/-/g, '').replace(/\./g, '')
  }

  /**
   * 启动监听模式
   */
  async watch(config: UnifiedConfig): Promise<BuildWatcher> {
    const rspack = await this.ensureRspackLoaded()
    const parsedOutput = this.outputManager.parseOutputConfig(config)
    const formatConfig = parsedOutput.configs[0] // 监听模式只使用第一个格式

    const rspackConfig = await this.createRspackConfig(config, formatConfig)
    rspackConfig.watch = true
    rspackConfig.watchOptions = {
      ignored: /node_modules/,
      aggregateTimeout: 300
    }

    const compiler = rspack.rspack(rspackConfig)
    const { EventEmitter } = require('events')
    const watcher = new EventEmitter() as any

    watcher.patterns = [this.buildHelper.getEntryPoint(config.input) || 'src/**/*']
    watcher.watching = true

    const watching = compiler.watch({}, (err: any, stats: any) => {
      if (err) {
        this.logger.error('重新构建失败:', err)
        watcher.emit('error', err)
      } else if (stats.hasErrors()) {
        const info = stats.toJson()
        this.logger.error('构建错误:', info.errors)
        watcher.emit('error', new Error(info.errors?.map((e: any) => e.message).join('\n')))
      } else {
        this.logger.success('重新构建成功')
        watcher.emit('change', stats)
      }
    })

    watcher.close = async () => {
      return new Promise<void>((resolve) => {
        watching.close(() => {
          this.logger.info('Rspack 监听模式已停止')
          resolve()
        })
      })
    }

    this.logger.info('Rspack 监听模式已启动')
    return watcher
  }

  /**
   * 转换配置
   */
  async transformConfig(config: UnifiedConfig): Promise<BundlerSpecificConfig> {
    const parsedOutput = this.outputManager.parseOutputConfig(config)
    const formatConfig = parsedOutput.configs[0]
    return await this.createRspackConfig(config, formatConfig)
  }

  /**
   * 转换插件
   */
  async transformPlugins(plugins: any[]): Promise<BundlerSpecificPlugin[]> {
    const transformed: BundlerSpecificPlugin[] = []

    for (const plugin of plugins) {
      try {
        // Rspack 插件
        if (plugin.rspack) {
          transformed.push(plugin.rspack)
        }
        // Webpack 插件（Rspack 兼容）
        else if (plugin.webpack) {
          transformed.push(plugin.webpack)
        }
        // 直接的插件对象
        else if (plugin.apply && typeof plugin.apply === 'function') {
          transformed.push(plugin)
        }
      } catch (error) {
        this.logger.warn(`插件 ${plugin.name || 'unknown'} 转换失败`)
      }
    }

    return transformed
  }

  /**
   * 检查功能支持
   */
  supportsFeature(feature: string): boolean {
    const supportedFeatures = [
      'typescript',
      'jsx',
      'tsx',
      'minify',
      'sourcemap',
      'code-splitting',
      'tree-shaking',
      'hmr',
      'module-federation',
      'css-modules',
      'postcss',
      'less',
      'scss',
      'sass'
    ]

    return supportedFeatures.includes(feature)
  }

  /**
   * 获取功能支持映射
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
      'module-federation': true,
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
    return this.buildHelper.getDefaultPerformanceMetrics()
  }

  /**
   * 销毁资源
   */
  async dispose(): Promise<void> {
    this.rspack = null
    this.logger.debug('Rspack 适配器已销毁')
  }
}

export default RspackAdapter
