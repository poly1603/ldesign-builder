/**
 * 极简配置系统
 * 只需要 name 和 libs 配置，其他全部自动推断
 */

import * as path from 'path'
import { ProjectAnalyzer, ProjectAnalysis } from '../analyzers/project-analyzer'
import { Logger } from '../utils/logger'
import type { BuilderConfig } from '../types/config'

/**
 * 极简用户配置
 */
export interface MinimalConfig {
  /** UMD 全局名称 */
  name?: string

  /** 库输出配置（可选） */
  libs?: {
    /** ESM 配置 */
    esm?: {
      input?: string | string[]
      output?: string
    }
    /** CommonJS 配置 */
    cjs?: {
      input?: string | string[]
      output?: string
    }
    /** UMD 配置 */
    umd?: {
      input?: string
      output?: string
    }
  }

  /** 覆盖自动配置（高级用户） */
  override?: Partial<BuilderConfig>
}

/**
 * 智能配置生成器
 */
export class SmartConfigGenerator {
  private analyzer: ProjectAnalyzer
  private logger: Logger

  constructor(logger?: Logger) {
    this.logger = logger || new Logger()
    this.analyzer = new ProjectAnalyzer(this.logger)
  }

  /**
   * 从极简配置生成完整配置
   */
  async generate(userConfig: MinimalConfig = {}, root: string = process.cwd()): Promise<BuilderConfig> {
    this.logger.info('⚡ 生成智能配置...')

    // 分析项目
    const analysis = await this.analyzer.analyze(root)

    // 生成基础配置
    const baseConfig = this.generateBaseConfig(analysis, userConfig)

    // 添加框架特定配置
    const frameworkConfig = this.generateFrameworkConfig(analysis)

    // 添加优化配置
    const optimizationConfig = this.generateOptimizationConfig(analysis)

    // 合并所有配置
    const config: BuilderConfig = {
      ...baseConfig,
      ...frameworkConfig,
      ...optimizationConfig,
      ...userConfig.override // 允许用户覆盖
    }

    this.logger.success('✅ 配置生成完成')

    return config
  }

  /**
   * Infer UMD name from package.json
   * Converts @ldesign/package-name to LDesignPackageName
   */
  private inferUmdNameFromPackage(analysis: ProjectAnalysis): string | undefined {
    const pkgName = analysis.packageJson?.name
    if (!pkgName) return undefined

    // Handle scoped packages like @ldesign/package-name
    const parts = pkgName.split('/')
    const name = parts.length > 1 ? parts[1] : parts[0]

    // Convert kebab-case to PascalCase
    return name
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('')
      .replace(/^/, parts.length > 1 ? this.toPascalCase(parts[0].replace('@', '')) : '')
  }

  /**
   * Convert string to PascalCase
   */
  private toPascalCase(str: string): string {
    return str
      .split(/[-_]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('')
  }

  /**
   * Infer external dependencies from package.json
   */
  private inferExternalDeps(analysis: ProjectAnalysis): (string | RegExp)[] {
    const external: (string | RegExp)[] = []
    const pkg = analysis.packageJson

    if (!pkg) return external

    // Add peer dependencies
    if (pkg.peerDependencies) {
      Object.keys(pkg.peerDependencies).forEach(dep => {
        external.push(dep)
      })
    }

    // Add common patterns for @ldesign packages
    if (pkg.name?.startsWith('@ldesign/')) {
      external.push(/^@ldesign\//)
    }

    // Add common patterns
    external.push(/^lodash/)

    return external
  }

  /**
   * 生成基础配置
   */
  private generateBaseConfig(analysis: ProjectAnalysis, userConfig: MinimalConfig): Partial<BuilderConfig> {
    const config: Partial<BuilderConfig> = {
      // 项目名称
      name: userConfig.name || this.inferUmdNameFromPackage(analysis) || this.inferProjectName(analysis),

      // 库类型
      libraryType: this.inferLibraryType(analysis),

      // 输入配置
      input: this.generateInputConfig(analysis, userConfig),

      // 输出配置
      output: this.generateOutputConfig(analysis, userConfig),

      // 外部依赖（从 package.json 推断）
      external: [...this.inferExternalDeps(analysis), ...(analysis.dependencies?.external || [])],

      // 别名
      alias: this.generateAliasConfig(analysis),

      // TypeScript
      typescript: analysis.requirements.typescript,

      // 源码映射
      sourcemap: true,

      // 清理输出目录
      clean: true
    }

    return config
  }

  /**
   * 生成输入配置
   */
  private generateInputConfig(analysis: ProjectAnalysis, userConfig: MinimalConfig): string | string[] | Record<string, string> {
    // ESM/CJS 使用相同的输入
    const defaultInput = userConfig.libs?.esm?.input || userConfig.libs?.cjs?.input || 'src/**/*'

    // 如果是单入口项目
    if (analysis.type === 'application' || analysis.type === 'cli') {
      return analysis.entries.main || 'src/index.ts'
    }

    // 多入口项目
    if (Array.isArray(defaultInput)) {
      return defaultInput
    }

    // 通配符输入
    if (defaultInput.includes('*')) {
      return defaultInput
    }

    // 默认入口
    return analysis.entries.main || 'src/index.ts'
  }

  /**
   * 生成输出配置
   */
  private generateOutputConfig(analysis: ProjectAnalysis, userConfig: MinimalConfig): any {
    const formats = analysis.output.formats
    const outputs: any[] = []

    // ESM 输出
    if (formats.includes('esm')) {
      outputs.push({
        dir: userConfig.libs?.esm?.output || 'es',
        format: 'es',
        preserveModules: analysis.output.preserveModules,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js'
      })
    }

    // CJS 输出
    if (formats.includes('cjs')) {
      outputs.push({
        dir: userConfig.libs?.cjs?.output || 'lib',
        format: 'cjs',
        preserveModules: analysis.output.preserveModules,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].cjs',
        exports: 'auto'
      })
    }

    // UMD 输出
    if (formats.includes('umd')) {
      const umdInput = userConfig.libs?.umd?.input || analysis.entries.lib || analysis.entries.main || 'src/index.ts'
      outputs.push({
        file: path.join(userConfig.libs?.umd?.output || 'dist', 'index.min.js'),
        format: 'umd',
        name: userConfig.name || analysis.name,
        globals: this.generateGlobals(analysis)
      })
    }

    // 如果只有一个输出，返回对象而不是数组
    return outputs.length === 1 ? outputs[0] : outputs
  }

  /**
   * 生成框架特定配置
   */
  private generateFrameworkConfig(analysis: ProjectAnalysis): Partial<BuilderConfig> {
    const config: Partial<BuilderConfig> = {}

    // Vue 配置
    if (analysis.frameworks.vue) {
      config.vue = {
        version: analysis.frameworks.vue.version,
        sfc: analysis.frameworks.vue.sfc
      }
    }

    // React 配置
    if (analysis.frameworks.react) {
      config.react = {
        jsx: analysis.frameworks.react.jsx,
        typescript: analysis.frameworks.react.typescript
      }
    }

    // 混合框架配置
    if (Object.keys(analysis.frameworks).length > 1) {
      config.mixedFramework = {
        mode: 'separated',
        frameworks: analysis.frameworks as any,
        jsx: {
          autoDetect: true
        }
      }
    }

    return config
  }

  /**
   * 生成优化配置
   */
  private generateOptimizationConfig(analysis: ProjectAnalysis): Partial<BuilderConfig> {
    const config: Partial<BuilderConfig> = {
      // 压缩
      minify: analysis.output.minify,

      // Tree shaking
      treeShaking: true,

      // 性能优化
      performance: {
        chunkSizeWarningLimit: 500,
        maxEntrypointSize: 1000,
        maxAssetSize: 1000
      }
    }

    // 大型项目启用更多优化
    if (analysis.type === 'application' || analysis.type === 'mixed') {
      config.optimization = {
        splitChunks: true,
        concatenateModules: true,
        sideEffects: false
      }
    }

    return config
  }

  /**
   * 推断项目名称
   */
  private inferProjectName(analysis: ProjectAnalysis): string {
    // 从包名推断
    if (analysis.name) {
      // 移除 @scope/ 前缀
      const name = analysis.name.replace(/^@[^/]+\//, '')
      // 转换为 PascalCase
      return name
        .split(/[-_]/)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('')
    }

    // 从目录名推断
    return path.basename(analysis.root)
  }

  /**
   * 推断库类型
   */
  private inferLibraryType(analysis: ProjectAnalysis): string {
    // 混合框架
    if (Object.keys(analysis.frameworks).length > 1) {
      return 'enhanced-mixed'
    }

    // 单框架
    if (analysis.frameworks.vue) return 'vue'
    if (analysis.frameworks.react) return 'react'
    if (analysis.frameworks.lit) return 'lit'
    if (analysis.frameworks.svelte) return 'svelte'
    if (analysis.frameworks.angular) return 'angular'
    if (analysis.frameworks.solid) return 'solid'

    // TypeScript 库
    if (analysis.requirements.typescript) return 'typescript'

    // 默认
    return 'javascript'
  }

  /**
   * 生成别名配置
   */
  private generateAliasConfig(analysis: ProjectAnalysis): Record<string, string> {
    const alias: Record<string, string> = {}

    // 添加 @ 别名
    alias['@'] = path.join(analysis.root, 'src')

    // 添加常见别名
    const dirs = ['components', 'utils', 'hooks', 'composables', 'services', 'stores']
    for (const dir of dirs) {
      const dirPath = path.join(analysis.root, 'src', dir)
      if (require('fs').existsSync(dirPath)) {
        alias[`@${dir}`] = dirPath
      }
    }

    return alias
  }

  /**
   * 生成 UMD globals
   */
  private generateGlobals(analysis: ProjectAnalysis): Record<string, string> {
    const globals: Record<string, string> = {}

    // 框架全局变量
    if (analysis.frameworks.vue) {
      globals.vue = 'Vue'
    }
    if (analysis.frameworks.react) {
      globals.react = 'React'
      globals['react-dom'] = 'ReactDOM'
    }
    if (analysis.frameworks.lit) {
      globals.lit = 'Lit'
    }

    // 常见库全局变量
    for (const dep of analysis.dependencies.external) {
      if (!globals[dep]) {
        // 转换为 PascalCase
        globals[dep] = dep
          .replace(/^@/, '')
          .replace(/[/-]/g, '_')
          .split('_')
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join('')
      }
    }

    return globals
  }
}

/**
 * defineConfig 函数 - 极简配置入口
 */
export function defineConfig(config: MinimalConfig = {}): MinimalConfig {
  return config
}

/**
 * 自动配置函数 - 零配置入口
 */
export async function autoConfig(root?: string): Promise<BuilderConfig> {
  const generator = new SmartConfigGenerator()
  return generator.generate({}, root)
}
