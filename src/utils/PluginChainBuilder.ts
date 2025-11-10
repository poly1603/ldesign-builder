/**
 * 插件链构建器
 * 
 * 使用构建器模式消除策略类中的代码重复
 * 提供流畅的 API 来构建插件链
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import type { BuilderConfig } from '../types/config'
import type { BuilderPlugin, BuilderPlugins, LazyPlugin } from '../types/plugin'
import { shouldMinify } from './minify-processor'

/**
 * esbuild 插件选项
 */
export interface EsbuildOptions {
  /** 目标环境 */
  target?: string
  /** JSX 转换模式 */
  jsx?: 'transform' | 'preserve' | 'automatic'
  /** JSX 导入源 */
  jsxImportSource?: string
  /** 是否为开发模式 */
  jsxDev?: boolean
  /** 是否压缩 */
  minify?: boolean
  /** 是否生成 source map */
  sourceMap?: boolean
  /** 包含的文件模式 */
  include?: RegExp
  /** 排除的文件模式 */
  exclude?: RegExp[]
  /** tsconfig 路径 */
  tsconfig?: string
}

/**
 * TypeScript 插件选项
 */
export interface TypeScriptOptions {
  /** tsconfig 路径 */
  tsconfig?: string
  /** 是否生成声明文件 */
  declaration?: boolean
  /** 是否只生成声明文件 */
  emitDeclarationOnly?: boolean
  /** 声明文件输出目录 */
  declarationDir?: string
}

/**
 * PostCSS 插件选项
 */
export interface PostCSSOptions {
  /** 是否提取 CSS */
  extract?: boolean
  /** 是否压缩 */
  minimize?: boolean
  /** 是否生成 source map */
  sourceMap?: boolean
  /** 是否启用 CSS Modules */
  modules?: boolean
}

/**
 * 插件链构建器
 * 
 * 使用构建器模式构建插件链,消除代码重复
 */
export class PluginChainBuilder {
  private plugins: BuilderPlugins = []
  private config: BuilderConfig

  constructor(config: BuilderConfig) {
    this.config = config
  }

  /**
   * 添加通用插件
   * 包括 node-resolve 和 commonjs
   */
  async withCommonPlugins(): Promise<this> {
    // Node resolve
    const nodeResolve = await import('@rollup/plugin-node-resolve')
    this.plugins.push(nodeResolve.default({
      browser: this.config.platform !== 'node',
      extensions: this.getSupportedExtensions(),
      preferBuiltins: this.config.platform === 'node'
    }))

    // CommonJS
    const commonjs = await import('@rollup/plugin-commonjs')
    this.plugins.push(commonjs.default())

    return this
  }

  /**
   * 添加 TypeScript 插件
   * 返回延迟加载插件
   */
  async withTypeScript(options?: TypeScriptOptions): Promise<this> {
    const ts = await import('@rollup/plugin-typescript')
    const tsOptions: TypeScriptOptions = {
      tsconfig: options?.tsconfig || this.config.typescript?.tsconfig || 'tsconfig.json',
      declaration: options?.declaration ?? this.config.typescript?.declaration ?? true,
      emitDeclarationOnly: options?.emitDeclarationOnly ?? true,
      declarationDir: options?.declarationDir || this.config.typescript?.declarationDir
    }

    const lazyPlugin: LazyPlugin = {
      name: 'typescript',
      plugin: async () => ts.default(tsOptions as any)
    }

    this.plugins.push(lazyPlugin as any)
    return this
  }

  /**
   * 添加 PostCSS 插件(可选)
   * 使用 rollup-plugin-styles
   */
  async withPostCSS(options?: PostCSSOptions): Promise<this> {
    const extract = options?.extract ?? this.config.style?.extract ?? true
    
    if (extract === false) {
      return this
    }

    const styles = await import('rollup-plugin-styles')
    this.plugins.push(styles.default({
      mode: extract ? 'extract' : 'inject',
      minimize: options?.minimize ?? this.config.style?.minimize ?? shouldMinify(this.config),
      sourceMap: options?.sourceMap ?? this.config.output?.sourcemap ?? false,
      modules: options?.modules ?? this.config.style?.modules ?? false
    }) as BuilderPlugin)

    return this
  }

  /**
   * 添加 esbuild 插件
   */
  async withEsbuild(options: EsbuildOptions = {}): Promise<this> {
    const esbuild = await import('rollup-plugin-esbuild')
    this.plugins.push(esbuild.default({
      include: options.include || /\.(tsx?|jsx?)$/,
      exclude: options.exclude || [/node_modules/],
      target: options.target || this.config.typescript?.target || 'es2022', // 默认 es2022（支持 top-level await）
      tsconfig: options.tsconfig || this.config.typescript?.tsconfig || 'tsconfig.json',
      sourceMap: options.sourceMap ?? this.config.output?.sourcemap ?? false,
      minify: options.minify ?? shouldMinify(this.config),
      jsx: options.jsx,
      jsxImportSource: options.jsxImportSource,
      jsxDev: options.jsxDev
    }))

    return this
  }

  /**
   * 添加 JSON 插件
   */
  async withJSON(): Promise<this> {
    const json = await import('@rollup/plugin-json')
    this.plugins.push(json.default())
    return this
  }

  /**
   * 添加自定义插件
   */
  withCustom(plugin: BuilderPlugin | LazyPlugin | null): this {
    if (plugin) {
      this.plugins.push(plugin as any)
    }
    return this
  }

  /**
   * 批量添加自定义插件
   */
  withCustomPlugins(plugins: (BuilderPlugin | LazyPlugin | null)[]): this {
    plugins.forEach(plugin => {
      if (plugin) {
        this.plugins.push(plugin as any)
      }
    })
    return this
  }

  /**
   * 条件添加插件
   */
  withConditional(
    condition: boolean,
    pluginFn: () => BuilderPlugin | LazyPlugin | Promise<BuilderPlugin | LazyPlugin>
  ): this {
    if (condition) {
      const plugin = pluginFn()
      if (plugin instanceof Promise) {
        // 如果是 Promise,需要等待
        plugin.then(p => this.plugins.push(p as any))
      } else {
        this.plugins.push(plugin as any)
      }
    }
    return this
  }

  /**
   * 构建插件数组
   */
  build(): BuilderPlugins {
    return this.plugins
  }

  /**
   * 获取支持的文件扩展名
   */
  private getSupportedExtensions(): string[] {
    const extensions = ['.mjs', '.js', '.json', '.ts']
    
    // 根据库类型添加扩展名
    if (this.config.libraryType) {
      const type = this.config.libraryType.toLowerCase()
      if (type.includes('react') || type.includes('preact')) {
        extensions.push('.jsx', '.tsx')
      }
      if (type.includes('vue')) {
        extensions.push('.vue')
      }
      if (type.includes('svelte')) {
        extensions.push('.svelte')
      }
    }

    return extensions
  }
}

/**
 * 创建插件链构建器
 */
export function createPluginBuilder(config: BuilderConfig): PluginChainBuilder {
  return new PluginChainBuilder(config)
}

