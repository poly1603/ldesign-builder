/**
 * Rollup 配置构建器
 * 负责将统一配置转换为 Rollup 特定配置
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import type { UnifiedConfig, BundlerSpecificConfig } from '../../types/adapter'
import type { Logger } from '../../utils/logger'
import { normalizeInput } from '../../utils/glob'
import path from 'path'
import fs from 'fs'

/**
 * Rollup 配置构建器
 */
export class RollupConfigBuilder {
  private logger: Logger

  constructor(logger: Logger) {
    this.logger = logger
  }

  /**
   * 构建 Rollup 配置
   */
  async build(config: UnifiedConfig): Promise<{ configs: any[], mainConfig: BundlerSpecificConfig }> {
    const basePlugins = await this.getBasePlugins(config)
    const filteredInput = await normalizeInput(config.input, process.cwd(), config.exclude)

    const rollupConfig: any = {
      input: filteredInput,
      external: config.external,
      onwarn: this.createWarningHandler(config)
    }

    // 注入 Acorn 插件以支持在转换前解析 TSX/JSX/TS 语法
    const acornPlugins = await this.getAcornPlugins()
    if (acornPlugins.length > 0) {
      rollupConfig.acorn = { ...(rollupConfig.acorn || {}), injectPlugins: acornPlugins }
    }

    const configs: any[] = []
    const outputConfig = config.output as any

    // 处理输出配置
    if (outputConfig?.esm || outputConfig?.cjs || outputConfig?.umd) {
      const formatConfigs = await this.buildFormatConfigs(config, filteredInput, basePlugins)
      configs.push(...formatConfigs)
    } else if (Array.isArray(outputConfig?.format)) {
      const multiFormatConfigs = await this.buildMultiFormatConfigs(config, filteredInput, basePlugins)
      configs.push(...multiFormatConfigs)
    } else {
      const singleFormatConfig = await this.buildSingleFormatConfig(config, filteredInput, basePlugins, rollupConfig)
      return { configs: [singleFormatConfig], mainConfig: singleFormatConfig }
    }

    return {
      configs,
      mainConfig: configs.length > 1
        ? { ...rollupConfig, output: configs.map(c => c.output).filter(Boolean) }
        : configs[0]
    }
  }

  /**
   * 构建格式特定配置（esm/cjs/umd）
   */
  private async buildFormatConfigs(config: UnifiedConfig, filteredInput: any, basePlugins: any[]): Promise<any[]> {
    const configs: any[] = []
    const outputConfig = config.output as any

    // ESM 配置
    if (outputConfig.esm && outputConfig.esm !== false) {
      const esmConfig = await this.buildESMConfig(config, filteredInput, basePlugins)
      configs.push(esmConfig)
    }

    // CJS 配置
    if (outputConfig.cjs && outputConfig.cjs !== false) {
      const cjsConfig = await this.buildCJSConfig(config, filteredInput, basePlugins)
      configs.push(cjsConfig)
    }

    // UMD 配置
    if (outputConfig.umd && outputConfig.umd !== false) {
      const umdConfigs = await this.buildUMDConfig(config, filteredInput, basePlugins)
      configs.push(...umdConfigs)
    }

    return configs
  }

  /**
   * 构建 ESM 配置
   */
  private async buildESMConfig(config: UnifiedConfig, filteredInput: any, basePlugins: any[]): Promise<any> {
    const outputConfig = config.output as any
    const esmConfig = typeof outputConfig.esm === 'object' ? outputConfig.esm : {}
    const esmDir = esmConfig.dir || 'es'

    return {
      input: esmConfig.input ? await normalizeInput(esmConfig.input, process.cwd(), config.exclude) : filteredInput,
      external: config.external,
      plugins: [...basePlugins, ...await this.getFormatPlugins(config, esmDir, true)],
      output: {
        dir: esmDir,
        format: 'es',
        sourcemap: esmConfig.sourcemap ?? outputConfig.sourcemap,
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
        exports: esmConfig.exports ?? 'auto',
        preserveModules: esmConfig.preserveStructure ?? true,
        preserveModulesRoot: 'src',
        globals: outputConfig.globals,
        name: outputConfig.name
      },
      treeshake: config.treeshake,
      onwarn: this.createWarningHandler(config)
    }
  }

  /**
   * 构建 CJS 配置
   */
  private async buildCJSConfig(config: UnifiedConfig, filteredInput: any, basePlugins: any[]): Promise<any> {
    const outputConfig = config.output as any
    const cjsConfig = typeof outputConfig.cjs === 'object' ? outputConfig.cjs : {}
    const cjsDir = cjsConfig.dir || 'lib'

    return {
      input: cjsConfig.input ? await normalizeInput(cjsConfig.input, process.cwd(), config.exclude) : filteredInput,
      external: config.external,
      plugins: [...basePlugins, ...await this.getFormatPlugins(config, cjsDir, true)],
      output: {
        dir: cjsDir,
        format: 'cjs',
        sourcemap: cjsConfig.sourcemap ?? outputConfig.sourcemap,
        entryFileNames: '[name].cjs',
        chunkFileNames: '[name].cjs',
        assetFileNames: '[name].[ext]',
        exports: cjsConfig.exports ?? 'named',
        preserveModules: cjsConfig.preserveStructure ?? true,
        preserveModulesRoot: 'src',
        globals: outputConfig.globals,
        name: outputConfig.name
      },
      treeshake: config.treeshake,
      onwarn: this.createWarningHandler(config)
    }
  }

  /**
   * 构建 UMD 配置（返回数组：常规版和压缩版）
   */
  private async buildUMDConfig(config: UnifiedConfig, filteredInput: any, basePlugins: any[]): Promise<any[]> {
    const outputConfig = config.output as any
    const umdConfig = typeof outputConfig.umd === 'object' ? outputConfig.umd : {}

    // 检查是否禁用
    if (umdConfig.enabled === false) {
      return []
    }

    const umdDir = umdConfig.dir || 'dist'
    const umdName = umdConfig.name || outputConfig.name || 'MyLibrary'
    const fileName = umdConfig.fileName || 'index.js'

    // 确定入口文件
    let umdEntry = umdConfig.input || umdConfig.entry
    if (!umdEntry) {
      // 自动查找入口
      umdEntry = await this.findUMDEntry()
    }

    // UMD 全局变量映射
    const defaultGlobals: Record<string, string> = {
      react: 'React',
      'react-dom': 'ReactDOM',
      vue: 'Vue',
      '@angular/core': 'ngCore'
    }

    const mergedGlobals = {
      ...defaultGlobals,
      ...(outputConfig.globals || {}),
      ...(umdConfig.globals || {})
    }

    const baseConfig = {
      input: umdEntry,
      external: config.external,
      treeshake: config.treeshake,
      onwarn: this.createWarningHandler(config)
    }

    // 常规版本
    const regularConfig = {
      ...baseConfig,
      plugins: [...basePlugins, ...await this.getFormatPlugins(config, umdDir, false)],
      output: {
        format: 'umd',
        name: umdName,
        file: `${umdDir}/${fileName}`,
        inlineDynamicImports: true,
        sourcemap: umdConfig.sourcemap ?? outputConfig.sourcemap,
        globals: mergedGlobals,
        exports: 'named',
        assetFileNames: '[name].[ext]'
      }
    }

    // 压缩版本
    const terserPlugin = await this.getTerserPlugin()
    const minifiedConfig = {
      ...baseConfig,
      plugins: terserPlugin
        ? [...basePlugins, ...await this.getFormatPlugins(config, umdDir, false), terserPlugin]
        : [...basePlugins, ...await this.getFormatPlugins(config, umdDir, false)],
      output: {
        format: 'umd',
        name: umdName,
        file: `${umdDir}/${fileName.replace(/\.js$/, '.min.js')}`,
        inlineDynamicImports: true,
        sourcemap: umdConfig.sourcemap ?? outputConfig.sourcemap,
        globals: mergedGlobals,
        exports: 'named',
        assetFileNames: '[name].[ext]'
      }
    }

    return [regularConfig, minifiedConfig]
  }

  /**
   * 构建多格式配置
   */
  private async buildMultiFormatConfigs(config: UnifiedConfig, filteredInput: any, basePlugins: any[]): Promise<any[]> {
    const configs: any[] = []
    const outputConfig = config.output as any
    const formats = outputConfig.format

    for (const format of formats) {
      if (format === 'umd' || format === 'iife') {
        const umdConfigs = await this.buildUMDConfig(config, filteredInput, basePlugins)
        configs.push(...umdConfigs)
      } else {
        const formatConfig = await this.buildFormatConfig(config, filteredInput, basePlugins, format)
        configs.push(formatConfig)
      }
    }

    return configs
  }

  /**
   * 构建单一格式配置
   */
  private async buildFormatConfig(config: UnifiedConfig, filteredInput: any, basePlugins: any[], format: string): Promise<any> {
    const outputConfig = config.output as any
    const mapped = this.mapFormat(format)
    const isESM = format === 'esm'
    const isCJS = format === 'cjs'
    const dir = isESM ? 'es' : isCJS ? 'lib' : 'dist'
    const entryFileNames = isESM ? '[name].js' : isCJS ? '[name].cjs' : '[name].js'

    return {
      input: filteredInput,
      external: config.external,
      plugins: [...basePlugins, ...await this.getFormatPlugins(config, dir, true)],
      output: {
        dir,
        format: mapped,
        name: outputConfig.name,
        sourcemap: outputConfig.sourcemap,
        globals: outputConfig.globals,
        entryFileNames,
        chunkFileNames: entryFileNames,
        assetFileNames: '[name].[ext]',
        exports: isESM ? 'auto' : 'named',
        preserveModules: isESM || isCJS,
        preserveModulesRoot: (isESM || isCJS) ? 'src' : undefined
      },
      treeshake: config.treeshake,
      onwarn: this.createWarningHandler(config)
    }
  }

  /**
   * 构建单一输出配置
   */
  private async buildSingleFormatConfig(config: UnifiedConfig, filteredInput: any, basePlugins: any[], rollupConfig: any): Promise<any> {
    const outputConfig = config.output as any
    const format = outputConfig?.format || 'esm'
    const mapped = this.mapFormat(format)
    const isESM = format === 'esm'
    const isCJS = format === 'cjs'
    const dir = outputConfig.dir || (isESM ? 'es' : isCJS ? 'lib' : 'dist')
    const entryFileNames = isESM ? '[name].js' : isCJS ? '[name].cjs' : '[name].js'

    rollupConfig.plugins = [...basePlugins, ...await this.getFormatPlugins(config, dir, true)]
    rollupConfig.output = {
      dir,
      format: mapped,
      name: outputConfig.name,
      sourcemap: outputConfig.sourcemap,
      globals: outputConfig.globals,
      entryFileNames,
      chunkFileNames: entryFileNames,
      assetFileNames: '[name].[ext]',
      exports: isESM ? 'auto' : 'named',
      preserveModules: isESM || isCJS,
      preserveModulesRoot: (isESM || isCJS) ? 'src' : undefined
    }

    if (config.treeshake !== undefined) {
      rollupConfig.treeshake = config.treeshake
    }

    return rollupConfig
  }

  /**
   * 获取基础插件
   */
  private async getBasePlugins(config: UnifiedConfig): Promise<any[]> {
    try {
      const { nodeResolve } = await import('@rollup/plugin-node-resolve')
      const commonjs = (await import('@rollup/plugin-commonjs')).default
      const json = (await import('@rollup/plugin-json')).default

      const plugins = [
        nodeResolve({
          browser: true,
          preferBuiltins: false,
          extensions: ['.mjs', '.js', '.json', '.ts', '.tsx']
        }),
        commonjs({
          include: /node_modules/,
          ignoreDynamicRequires: false
        }),
        json({
          compact: false,
          namedExports: true,
          preferConst: true,
          include: ['**/*.json'],
          exclude: ['node_modules/**']
        })
      ]

      return plugins
    } catch (error) {
      this.logger.warn('基础插件加载失败，将尝试继续构建', (error as Error).message)
      return []
    }
  }

  /**
   * 获取格式特定插件
   */
  private async getFormatPlugins(config: UnifiedConfig, outputDir: string, emitDts: boolean): Promise<any[]> {
    const plugins: any[] = []

    // 添加用户插件（已转换）
    if (config.plugins) {
      for (const plugin of config.plugins) {
        if (plugin && typeof plugin === 'object') {
          plugins.push(plugin)
        }
      }
    }

    return plugins
  }

  /**
   * 获取 Acorn 插件
   */
  private async getAcornPlugins(): Promise<any[]> {
    const plugins: any[] = []

    try {
      const jsx = (await import('acorn-jsx')).default
      plugins.push(jsx())
    } catch {
      // 忽略
    }

    try {
      const ts = (await import('acorn-typescript')).default
      plugins.push(ts())
    } catch {
      // 忽略
    }

    return plugins
  }

  /**
   * 获取 Terser 压缩插件
   */
  private async getTerserPlugin(): Promise<any> {
    try {
      const { default: terser } = await import('@rollup/plugin-terser')
      return terser({
        compress: {
          drop_console: false,
          pure_funcs: ['console.log']
        },
        mangle: {
          reserved: ['exports', 'require', 'module', '__dirname', '__filename']
        },
        format: {
          comments: /^!/
        }
      })
    } catch (error) {
      this.logger.warn('Terser 插件不可用，跳过压缩')
      return null
    }
  }

  /**
   * 查找 UMD 入口文件
   */
  private async findUMDEntry(): Promise<string> {
    const candidates = [
      'src/index-lib.ts',
      'src/index-lib.js',
      'src/index-umd.ts',
      'src/index-umd.js',
      'src/index.ts',
      'src/index.js',
      'src/main.ts',
      'src/main.js',
      'index.ts',
      'index.js'
    ]

    for (const entry of candidates) {
      if (fs.existsSync(path.resolve(process.cwd(), entry))) {
        this.logger.info(`UMD 入口文件自动检测: ${entry}`)
        return entry
      }
    }

    return 'src/index.ts'
  }

  /**
   * 映射输出格式
   */
  private mapFormat(format: any): string {
    const formatMap: Record<string, string> = {
      esm: 'es',
      cjs: 'cjs',
      umd: 'umd',
      iife: 'iife'
    }
    return typeof format === 'string' ? (formatMap[format] || format) : 'es'
  }

  /**
   * 创建警告处理器
   */
  private createWarningHandler(config?: any) {
    if (config?.logLevel === 'silent') {
      return () => { }
    }

    const ignoredCodes = new Set([
      'NAMESPACE_CONFLICT',
      'MIXED_EXPORTS',
      'EMPTY_BUNDLE',
      'FILE_NAME_CONFLICT',
      'MISSING_GLOBAL_NAME',
      'UNRESOLVED_IMPORT'
    ])

    return (warning: any, defaultHandler: (w: any) => void) => {
      if (ignoredCodes.has(warning.code)) return
      if (warning.code === 'FILE_NAME_CONFLICT' && warning.message?.includes('.css.map')) return
      if (warning.code === 'UNRESOLVED_IMPORT' && warning.source?.endsWith('.vue')) return
      if (warning.code === 'UNRESOLVED_IMPORT' && warning.source?.startsWith('node:')) return
      if (warning.code === 'PLUGIN_WARNING' && warning.plugin === 'typescript') {
        const msg = String(warning.message || '')
        if (msg.includes('TS5096')) return
      }
      defaultHandler(warning)
    }
  }
}

