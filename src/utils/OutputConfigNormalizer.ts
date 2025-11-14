/**
 * 输出配置标准化器
 * 
 * 将简化的配置转换为完整的配置:
 * - 支持 `esm: true` 自动使用默认配置
 * - 支持 `cjs: true` 自动使用默认配置
 * - 支持 `umd: true` 自动使用默认配置
 * - 自动推断库名称
 * - 自动读取 package.json
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import type { OutputConfig, FormatOutputConfig } from '../types/output'
import * as path from 'path'
import * as fs from 'fs'

/**
 * 输出配置标准化器类
 */
export class OutputConfigNormalizer {
  private cwd: string
  private packageJson: any

  constructor(cwd: string = process.cwd()) {
    this.cwd = cwd
    this.packageJson = this.loadPackageJson()
  }

  /**
   * 加载 package.json
   */
  private loadPackageJson(): any {
    try {
      const pkgPath = path.join(this.cwd, 'package.json')
      if (fs.existsSync(pkgPath)) {
        return JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
      }
    } catch (error) {
      // 忽略错误
    }
    return {}
  }

  /**
   * 获取库名称
   */
  private getLibraryName(): string {
    if (this.packageJson.name) {
      // 将 @scope/package-name 转换为 ScopePackageName
      return this.packageJson.name
        .replace(/^@/, '')
        .replace(/\//g, '-')
        .split('-')
        .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('')
    }
    return 'MyLibrary'
  }

  /**
   * 标准化输出配置
   * 
   * @param config - 原始输出配置
   * @returns 标准化后的输出配置
   */
  normalize(config: OutputConfig): OutputConfig {
    const result = { ...config }

    // 处理 ES 格式 (TDesign 风格: .mjs + 编译后的 CSS)
    if (result.es === true) {
      result.es = this.getDefaultEsConfig()
    } else if (typeof result.es === 'object') {
      result.es = this.mergeWithDefault(this.getDefaultEsConfig(), result.es)
    }

    // 处理 ESM 格式
    if (result.esm === true) {
      result.esm = this.getDefaultEsmConfig()
    } else if (typeof result.esm === 'object') {
      result.esm = this.mergeWithDefault(this.getDefaultEsmConfig(), result.esm)
    }

    // 处理 CJS 格式
    if (result.cjs === true) {
      result.cjs = this.getDefaultCjsConfig()
    } else if (typeof result.cjs === 'object') {
      result.cjs = this.mergeWithDefault(this.getDefaultCjsConfig(), result.cjs)
    }

    // 处理 UMD 格式
    if (result.umd === true) {
      result.umd = this.getDefaultUmdConfig()
    } else if (typeof result.umd === 'object') {
      result.umd = this.mergeWithDefault(this.getDefaultUmdConfig(), result.umd)
    }

    // 处理 IIFE 格式
    if (result.iife === true) {
      result.iife = this.getDefaultIifeConfig()
    } else if (typeof result.iife === 'object') {
      result.iife = this.mergeWithDefault(this.getDefaultIifeConfig(), result.iife)
    }

    return result
  }

  /**
   * 获取 ES 默认配置 (TDesign 风格: .mjs + 编译后的 CSS)
   */
  private getDefaultEsConfig(): FormatOutputConfig {
    return {
      dir: 'es',
      format: 'esm',
      preserveStructure: true,
      dts: true,
      sourcemap: true,
    }
  }

  /**
   * 获取 ESM 默认配置 (TDesign 风格: .js + 保留 less 源文件)
   */
  private getDefaultEsmConfig(): FormatOutputConfig {
    return {
      dir: 'esm',
      format: 'esm',
      preserveStructure: true,
      dts: true,
      sourcemap: true,
    }
  }

  /**
   * 获取 CJS 默认配置
   */
  private getDefaultCjsConfig(): FormatOutputConfig {
    return {
      dir: 'cjs',
      format: 'cjs',
      preserveStructure: true,
      dts: true,
      sourcemap: true,
    }
  }

  /**
   * 获取 UMD 默认配置
   */
  private getDefaultUmdConfig(): FormatOutputConfig & { name: string } {
    return {
      dir: 'dist',
      format: 'umd',
      name: this.getLibraryName(),
      minify: true,
      sourcemap: true,
    }
  }

  /**
   * 获取 IIFE 默认配置
   */
  private getDefaultIifeConfig(): FormatOutputConfig & { name: string } {
    return {
      dir: 'dist',
      format: 'iife',
      name: this.getLibraryName(),
      minify: true,
      sourcemap: true,
    }
  }

  /**
   * 合并默认配置和用户配置
   * 
   * @param defaultConfig - 默认配置
   * @param userConfig - 用户配置
   * @returns 合并后的配置
   */
  private mergeWithDefault(
    defaultConfig: FormatOutputConfig,
    userConfig: FormatOutputConfig
  ): FormatOutputConfig {
    const result = { ...defaultConfig }

    for (const [key, value] of Object.entries(userConfig)) {
      if (value === undefined) continue

      // 特殊处理 globals
      if (key === 'globals' && typeof value === 'object' && typeof result.globals === 'object') {
        result.globals = {
          ...result.globals,
          ...value
        }
      }
      // 其他字段直接覆盖
      else {
        (result as any)[key] = value
      }
    }

    return result
  }

  /**
   * 从 package.json 推断外部依赖
   */
  getExternalDependencies(): string[] {
    const external: string[] = []

    // 添加 peerDependencies
    if (this.packageJson.peerDependencies) {
      external.push(...Object.keys(this.packageJson.peerDependencies))
    }

    // 添加 dependencies (可选)
    if (this.packageJson.dependencies) {
      external.push(...Object.keys(this.packageJson.dependencies))
    }

    return external
  }

  /**
   * 从 package.json 推断全局变量映射
   */
  getGlobalsMapping(): Record<string, string> {
    const globals: Record<string, string> = {}
    const external = this.getExternalDependencies()

    // 常见库的全局变量映射
    const knownGlobals: Record<string, string> = {
      'vue': 'Vue',
      'react': 'React',
      'react-dom': 'ReactDOM',
      '@angular/core': 'ng.core',
      'svelte': 'Svelte',
      'solid-js': 'Solid',
      'lit': 'Lit',
      'preact': 'preact',
      'jquery': 'jQuery',
      'lodash': '_',
      'moment': 'moment',
      'axios': 'axios',
    }

    for (const dep of external) {
      if (knownGlobals[dep]) {
        globals[dep] = knownGlobals[dep]
      } else {
        // 自动生成全局变量名: @scope/package-name -> ScopePackageName
        globals[dep] = dep
          .replace(/^@/, '')
          .replace(/\//g, '-')
          .split('-')
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join('')
      }
    }

    return globals
  }
}

/**
 * 创建输出配置标准化器
 * 
 * @param cwd - 工作目录
 * @returns 输出配置标准化器实例
 */
export function createOutputConfigNormalizer(cwd?: string): OutputConfigNormalizer {
  return new OutputConfigNormalizer(cwd)
}

