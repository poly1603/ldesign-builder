/**
 * 基础策略类
 * 
 * 提供所有策略的公共功能,包括:
 * - 入口文件解析
 * - 输出配置构建
 * - 外部依赖处理
 * - 警告处理
 * - 插件构建辅助方法
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import type { ILibraryStrategy } from '../../types/strategy'
import type { BuilderConfig } from '../../types/config'
import type { UnifiedConfig, UnifiedPlugin } from '../../types/adapter'
import type { LibraryType } from '../../types/library'
import type { BuilderPlugin, BuilderPlugins, LazyPlugin } from '../../types/plugin'
import { findFiles } from '../../utils/file-system'
import { shouldMinify } from '../../utils/minify-processor'
import path from 'path'
import { existsSync } from 'fs'

/**
 * 基础策略抽象类
 */
export abstract class BaseStrategy implements ILibraryStrategy {
  abstract readonly name: string
  abstract readonly supportedTypes: LibraryType[]
  abstract readonly priority: number

  /**
   * 应用策略 - 子类必须实现
   */
  abstract applyStrategy(config: BuilderConfig): Promise<UnifiedConfig>

  /**
   * 检查策略是否适用
   */
  isApplicable(config: BuilderConfig): boolean {
    return this.supportedTypes.includes(config.libraryType!)
  }

  /**
   * 获取默认配置 - 子类必须实现
   */
  abstract getDefaultConfig(): Partial<BuilderConfig>

  /**
   * 获取推荐插件 - 子类可选实现
   */
  getRecommendedPlugins(_config: BuilderConfig): UnifiedPlugin[] {
    return []
  }

  /**
   * 验证配置 - 提供默认实现
   */
  validateConfig(_config: BuilderConfig): any {
    return {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: []
    }
  }

  // ==================== 公共辅助方法 ====================

  /**
   * 解析入口配置
   * 支持:
   * - 单个文件路径
   * - 多个文件路径数组
   * - Glob 模式
   * - 自动检测 src 目录
   */
  protected async resolveInputEntries(config: BuilderConfig): Promise<string | string[] | Record<string, string>> {
    const { input, projectPath = process.cwd() } = config

    // 如果用户明确指定了 input
    if (input) {
      if (typeof input === 'string') {
        return input
      }
      if (Array.isArray(input)) {
        return input
      }
      if (typeof input === 'object') {
        return input
      }
    }

    // 自动检测入口文件
    return await this.autoDetectEntry(projectPath, config)
  }

  /**
   * 自动检测入口文件
   */
  protected async autoDetectEntry(projectPath: string, config: BuilderConfig): Promise<string | string[]> {
    // 优先级列表
    const entryPriority = [
      'src/index.ts',
      'src/index.tsx',
      'src/index.js',
      'src/index.jsx',
      'src/main.ts',
      'src/main.tsx',
      'index.ts',
      'index.tsx',
      'index.js',
      'index.jsx'
    ]

    // 检查优先级列表中的文件
    for (const entry of entryPriority) {
      const fullPath = path.join(projectPath, entry)
      if (existsSync(fullPath)) {
        return entry
      }
    }

    // 如果没有找到,扫描 src 目录下的所有源文件
    const extensions = this.getSupportedExtensions(config)
    const patterns = extensions.map(ext => `src/**/*${ext}`)

    const files = await findFiles(patterns, {
      cwd: projectPath,
      ignore: [
        'node_modules/**',
        'dist/**',
        'build/**',
        '**/*.test.*',
        '**/*.spec.*',
        '**/*.d.ts'
      ]
    })

    if (files.length === 0) {
      throw new Error('无法找到入口文件,请在配置中指定 input')
    }

    // 如果只有一个文件,返回单个入口
    if (files.length === 1) {
      return files[0]
    }

    // 多个文件,返回数组
    return files
  }

  /**
   * 获取支持的文件扩展名
   */
  protected getSupportedExtensions(_config: BuilderConfig): string[] {
    // 默认支持的扩展名,子类可以覆盖
    return ['.ts', '.tsx', '.js', '.jsx']
  }

  /**
   * 构建输出配置
   */
  protected buildOutputConfig(config: BuilderConfig): any {
    const output = config.output || {}

    // 如果使用旧格式（format数组），转换为旧格式输出
    if (Array.isArray(output.format)) {
      const formats = output.format
      return {
        dir: output.dir || 'dist',
        format: formats,
        sourcemap: output.sourcemap !== false,
        exports: output.exports || 'auto',
        preserveModules: output.preserveModules,
        preserveModulesRoot: output.preserveModulesRoot || 'src',
        // 保留其他字段（如umd配置）
        ...output
      }
    }

    // 新格式：直接返回完整的output配置
    return output
  }

  /**
   * 合并外部依赖
   */
  protected mergeExternal(userExternal?: string[] | ((id: string) => boolean)): (string | RegExp)[] | ((id: string) => boolean) {
    const defaultExternal = this.getDefaultExternal()

    if (typeof userExternal === 'function') {
      return userExternal
    }

    if (Array.isArray(userExternal)) {
      return [...defaultExternal, ...userExternal]
    }

    return defaultExternal
  }

  /**
   * 获取默认外部依赖 - 子类可以覆盖
   */
  protected getDefaultExternal(): (string | RegExp)[] {
    return []
  }

  /**
   * 创建警告处理器
   */
  protected createWarningHandler() {
    return (warning: any) => {
      // 忽略常见的无害警告
      const ignoredCodes = [
        'THIS_IS_UNDEFINED',
        'CIRCULAR_DEPENDENCY',
        'EMPTY_BUNDLE'
      ]

      if (ignoredCodes.includes(warning.code)) {
        return
      }

      console.warn(`Warning: ${warning.message}`)
    }
  }

  /**
   * 构建通用插件
   * 提供常用插件的构建方法
   */
  protected async buildCommonPlugins(config: BuilderConfig): Promise<BuilderPlugins> {
    const plugins: BuilderPlugins = []

    // Node resolve
    plugins.push(await this.buildNodeResolvePlugin(config))

    // CommonJS
    plugins.push(await this.buildCommonJSPlugin(config))

    return plugins
  }

  /**
   * 构建 Node Resolve 插件
   */
  protected async buildNodeResolvePlugin(config: BuilderConfig): Promise<BuilderPlugin> {
    const nodeResolve = await import('@rollup/plugin-node-resolve')
    return nodeResolve.default({
      browser: config.platform !== 'node',
      extensions: this.getSupportedExtensions(config),
      preferBuiltins: config.platform === 'node'
    })
  }

  /**
   * 构建 CommonJS 插件
   */
  protected async buildCommonJSPlugin(_config: BuilderConfig): Promise<BuilderPlugin> {
    const commonjs = await import('@rollup/plugin-commonjs')
    return commonjs.default()
  }

  /**
   * 构建 TypeScript 插件
   * 返回延迟加载插件
   */
  protected async buildTypeScriptPlugin(config: BuilderConfig): Promise<LazyPlugin> {
    const ts = await import('@rollup/plugin-typescript')
    return {
      name: 'typescript',
      plugin: async () => ts.default({
        tsconfig: config.typescript?.tsconfig || 'tsconfig.json',
        declaration: config.typescript?.declaration !== false,
        emitDeclarationOnly: true,
        declarationDir: config.typescript?.declarationDir
      } as any)
    }
  }

  /**
   * 构建样式插件（使用 rollup-plugin-styles 替代 postcss）
   */
  protected async buildPostCSSPlugin(config: BuilderConfig): Promise<BuilderPlugin | null> {
    if (config.style?.extract === false) {
      return null
    }

    const styles = await import('rollup-plugin-styles')

    return styles.default({
      mode: config.style?.extract !== false ? 'extract' : 'inject',
      minimize: config.style?.minimize !== false,
      sourceMap: config.output?.sourcemap !== false,
      modules: config.style?.modules || false
    })
  }

  /**
   * 获取样式预处理器
   */
  protected getStylePreprocessors(config: BuilderConfig): string[] {
    const preprocessors: string[] = []

    if (config.style?.preprocessor) {
      preprocessors.push(config.style.preprocessor)
    }

    return preprocessors
  }

  /**
   * 构建 esbuild 插件
   */
  protected async buildEsbuildPlugin(config: BuilderConfig, options: any = {}): Promise<BuilderPlugin> {
    const esbuild = await import('rollup-plugin-esbuild')
    return esbuild.default({
      include: /\.(tsx?|jsx?)$/,
      exclude: [/node_modules/],
      target: config.typescript?.target || 'es2022', // 默认 es2022（支持 top-level await）
      tsconfig: config.typescript?.tsconfig || 'tsconfig.json',
      sourceMap: config.output?.sourcemap !== false,
      minify: shouldMinify(config),
      ...options
    })
  }

  /**
   * 判断是否应该压缩
   */
  protected shouldMinify(config: BuilderConfig): boolean {
    return shouldMinify(config)
  }
}

