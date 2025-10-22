/**
 * SWC 适配器
 * 
 * 提供基于 SWC 的快速打包能力，平衡速度和功能
 * 
 * 优势：
 * - 速度快（比 tsc 快 20 倍以上）
 * - 功能完整（支持装饰器、JSX、TSX 等）
 * - 适用于生产构建
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
import { glob } from 'glob'

/**
 * SWC 适配器类
 */
export class SwcAdapter implements IBundlerAdapter {
  readonly name = 'swc' as const
  version: string
  available: boolean

  private logger: Logger
  private swcInstance: any

  constructor(options: Partial<AdapterOptions> = {}) {
    this.logger = options.logger || new Logger()
    this.version = 'unknown'
    this.available = false

    // 尝试加载 SWC
    this.initializeSwc()
  }

  /**
   * 初始化 SWC
   */
  private initializeSwc(): void {
    try {
      // 动态导入 @swc/core
      this.swcInstance = require('@swc/core')
      this.version = this.swcInstance.version || 'unknown'
      this.available = true
      this.logger.debug(`SWC 适配器初始化成功 (v${this.version})`)
    } catch (error) {
      this.logger.warn('SWC 未安装，适配器不可用。请运行: npm install @swc/core --save-dev')
      this.available = false
    }
  }

  /**
   * 执行构建
   */
  async build(config: UnifiedConfig): Promise<BuildResult> {
    if (!this.available || !this.swcInstance) {
      throw new BuilderError(
        ErrorCode.ADAPTER_NOT_AVAILABLE,
        'SWC 适配器不可用，请先安装 @swc/core'
      )
    }

    try {
      this.logger.info('开始 SWC 构建...')
      const startTime = Date.now()

      // SWC 通常用于编译，我们需要配合 Rollup 进行打包
      // 这里我们实现一个简化版本：直接编译文件
      const outputs = await this.compileFiles(config)

      const duration = Date.now() - startTime

      this.logger.success(`SWC 构建完成 (${duration}ms)`)

      return {
        success: true,
        outputs,
        duration,
        bundler: 'swc',
        warnings: [],
        errors: []
      }
    } catch (error: any) {
      this.logger.error('SWC 构建失败:', error)

      return {
        success: false,
        outputs: [],
        duration: 0,
        bundler: 'swc',
        warnings: [],
        errors: [{
          message: error.message || '构建失败',
          stack: error.stack
        }]
      }
    }
  }

  /**
   * 编译文件
   */
  private async compileFiles(config: UnifiedConfig): Promise<Array<{ file: string; size: number; type: string }>> {
    const outputs: Array<{ file: string; size: number; type: string }> = []
    const outputConfig = config.output || {}
    const format = Array.isArray(outputConfig.format)
      ? outputConfig.format[0]
      : outputConfig.format || 'esm'

    // 查找源文件
    const input = config.input || 'src/**/*.{ts,tsx,js,jsx}'
    const files = typeof input === 'string' && input.includes('*')
      ? await glob(input, { ignore: ['node_modules/**', 'dist/**', '**/*.test.*', '**/*.spec.*'] })
      : Array.isArray(input)
        ? input
        : [input as string]

    // 转换 SWC 配置
    const swcConfig = await this.transformConfig(config)

    // 编译每个文件
    for (const file of files) {
      try {
        const sourceCode = await fs.readFile(file, 'utf-8')
        const result = await this.swcInstance.transform(sourceCode, {
          ...swcConfig,
          filename: file
        })

        // 确定输出路径
        const relativePath = path.relative(process.cwd(), file)
        const outputPath = this.resolveOutputPath(relativePath, config, format)

        // 写入输出文件
        await fs.ensureDir(path.dirname(outputPath))
        await fs.writeFile(outputPath, result.code, 'utf-8')

        // 写入 sourcemap
        if (result.map && config.sourcemap) {
          await fs.writeFile(outputPath + '.map', result.map, 'utf-8')
        }

        outputs.push({
          file: outputPath,
          size: Buffer.byteLength(result.code, 'utf-8'),
          type: 'js'
        })

        this.logger.debug(`编译成功: ${file} -> ${outputPath}`)
      } catch (error) {
        this.logger.error(`编译失败: ${file}`, error)
        throw error
      }
    }

    // 生成类型声明
    if (config.dts) {
      await this.generateTypeDeclarations(config)
    }

    return outputs
  }

  /**
   * 解析输出路径
   */
  private resolveOutputPath(relativePath: string, config: UnifiedConfig, format: string): string {
    const outputConfig = config.output || {}
    const baseDir = outputConfig.dir || 'dist'

    // 移除 src/ 前缀
    let cleanPath = relativePath.replace(/^src\//, '')

    // 替换扩展名
    cleanPath = cleanPath.replace(/\.(ts|tsx|js|jsx)$/, `.${format === 'cjs' ? 'cjs' : 'js'}`)

    return path.join(baseDir, cleanPath)
  }

  /**
   * 启动监听模式
   */
  async watch(config: UnifiedConfig): Promise<BuildWatcher> {
    if (!this.available || !this.swcInstance) {
      throw new BuilderError(
        ErrorCode.ADAPTER_NOT_AVAILABLE,
        'SWC 适配器不可用'
      )
    }

    this.logger.info('SWC 监听模式（使用文件监听）')

    const chokidar = require('chokidar')
    const watcher = chokidar.watch(config.input || 'src/**/*.{ts,tsx,js,jsx}', {
      ignored: ['node_modules/**', 'dist/**'],
      persistent: true
    })

    watcher.on('change', async (filepath: string) => {
      this.logger.info(`文件变更: ${filepath}`)
      await this.build(config)
    })

    return {
      close: async () => {
        await watcher.close()
        this.logger.info('SWC 监听模式已停止')
      },
      on: (event: string, handler: (...args: any[]) => void) => {
        watcher.on(event, handler)
      }
    }
  }

  /**
   * 转换统一配置为 SWC 特定配置
   */
  async transformConfig(config: UnifiedConfig): Promise<any> {
    const outputConfig = config.output || {}
    const format = Array.isArray(outputConfig.format)
      ? outputConfig.format[0]
      : outputConfig.format || 'esm'

    // SWC 模块格式映射
    const moduleMap: Record<string, string> = {
      'esm': 'es6',
      'cjs': 'commonjs',
      'umd': 'umd',
      'iife': 'umd'
    }

    const swcConfig: any = {
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
            importSource: config.jsx?.jsxImportSource || 'react'
          },
          legacyDecorator: true,
          decoratorMetadata: true
        },
        target: this.mapTarget(config.typescript?.target || 'es2020'),
        loose: false,
        externalHelpers: false,
        keepClassNames: true
      },
      module: {
        type: moduleMap[format] || 'es6',
        strict: false,
        strictMode: true,
        lazy: false,
        noInterop: false
      },
      minify: config.minify || false,
      sourceMaps: config.sourcemap ? true : false,
      inlineSourcesContent: false
    }

    // 如果是 Solid.js，调整 JSX 配置
    if (config.libraryType === 'solid') {
      swcConfig.jsc.transform.react = {
        pragma: 'h',
        pragmaFrag: 'Fragment',
        throwIfNamespace: false,
        development: false,
        useBuiltins: false
      }
    }

    return swcConfig
  }

  /**
   * 映射 TypeScript target 到 SWC target
   */
  private mapTarget(tsTarget: string): string {
    const targetMap: Record<string, string> = {
      'es3': 'es3',
      'es5': 'es5',
      'es6': 'es2015',
      'es2015': 'es2015',
      'es2016': 'es2016',
      'es2017': 'es2017',
      'es2018': 'es2018',
      'es2019': 'es2019',
      'es2020': 'es2020',
      'es2021': 'es2021',
      'es2022': 'es2022',
      'esnext': 'es2022'
    }

    return targetMap[tsTarget.toLowerCase()] || 'es2020'
  }

  /**
   * 生成类型声明文件
   */
  private async generateTypeDeclarations(config: UnifiedConfig): Promise<void> {
    try {
      this.logger.info('生成类型声明文件...')

      const { exec } = require('child_process')
      const { promisify } = require('util')
      const execAsync = promisify(exec)

      const outputDir = config.output?.dir || 'dist'

      await execAsync(`npx tsc --declaration --emitDeclarationOnly --outDir ${outputDir}`, {
        cwd: process.cwd()
      })

      this.logger.success('类型声明文件生成成功')
    } catch (error) {
      this.logger.warn('类型声明文件生成失败（这是可选的）:', error)
    }
  }

  /**
   * 转换配置为打包器特定配置
   */
  transformConfigToBundlerSpecific(config: UnifiedConfig): BundlerSpecificConfig {
    return {
      bundler: 'swc',
      config: this.transformConfig(config)
    }
  }

  /**
   * 转换插件为打包器特定插件
   */
  transformPluginToBundlerSpecific(plugin: any): BundlerSpecificPlugin {
    return {
      bundler: 'swc',
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

    // SWC 支持大部分 TypeScript 特性
    // 基本没有限制

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * 清理资源
   */
  async dispose(): Promise<void> {
    this.logger.debug('SWC 适配器资源清理完成')
  }
}



