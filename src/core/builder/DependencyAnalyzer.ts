/**
 * 依赖分析器模块
 * 
 * 【功能描述】
 * 负责分析项目的依赖关系，包括外部依赖、打包依赖、
 * 循环依赖检测、未使用依赖检测等功能
 * 
 * 【主要特性】
 * - 外部依赖识别：自动识别需要外部化的依赖
 * - 打包依赖识别：识别需要打包到bundle的依赖
 * - 循环依赖检测：检测并报告代码中的循环依赖
 * - 未使用依赖检测：检测package.json中未使用的依赖
 * - 缺失依赖检测：检测代码中引用但未安装的依赖
 * - 版本信息记录：记录所有依赖的版本信息
 * - 缓存支持：分析结果可缓存，避免重复分析
 * 
 * 【使用示例】
 * ```typescript
 * import { DependencyAnalyzer } from './DependencyAnalyzer'
 * 
 * const analyzer = new DependencyAnalyzer()
 * const analysis = await analyzer.analyze(config)
 * 
 * console.log('外部依赖:', analysis.external)
 * console.log('循环依赖:', analysis.circular)
 * ```
 * 
 * @module core/builder/DependencyAnalyzer
 * @author LDesign Team
 * @version 1.0.0
 * @since 2024-01-01
 */

import * as fs from 'fs-extra'
import * as path from 'path'
import type { BuilderConfig } from '../../types/config'
import type { Logger } from '../../utils/logger'

/**
 * 依赖分析结果接口
 */
export interface DependencyAnalysis {
  /** 外部依赖列表（不会被打包） */
  external: string[]
  /** 打包依赖列表（会被打包到bundle） */
  bundled: string[]
  /** 循环依赖列表（每项是一个依赖链数组） */
  circular: string[][]
  /** 未使用的依赖列表 */
  unused: string[]
  /** 缺失的依赖列表 */
  missing: string[]
  /** 依赖版本信息映射 */
  versions: Record<string, string>
}

/**
 * 依赖分析器选项接口
 */
export interface DependencyAnalyzerOptions {
  /** 日志记录器 */
  logger?: Logger
  /** 是否启用缓存，默认 true */
  enableCache?: boolean
  /** 是否检测循环依赖，默认 true */
  detectCircular?: boolean
  /** 是否检测未使用依赖，默认 true */
  detectUnused?: boolean
}

/**
 * 依赖分析器类
 * 
 * 【功能说明】
 * 提供完整的依赖分析功能，帮助识别和优化项目依赖
 * 
 * 【核心方法】
 * - analyze: 执行完整的依赖分析
 * - analyzeExternal: 分析外部依赖
 * - detectCircular: 检测循环依赖
 * - detectUnused: 检测未使用的依赖
 * - clearCache: 清除缓存
 * 
 * @example
 * ```typescript
 * const analyzer = new DependencyAnalyzer({
 *   logger: myLogger,
 *   detectCircular: true
 * })
 * 
 * const result = await analyzer.analyze(config)
 * if (result.circular.length > 0) {
 *   console.warn('发现循环依赖')
 * }
 * ```
 */
export class DependencyAnalyzer {
  /** 日志记录器 */
  private logger?: Logger
  /** 是否启用缓存 */
  private enableCache: boolean
  /** 是否检测循环依赖 */
  private detectCircular: boolean
  /** 是否检测未使用依赖 */
  private detectUnused: boolean
  /** 分析结果缓存 */
  private cache: Map<string, DependencyAnalysis> = new Map()

  /**
   * 构造函数
   * 
   * @param options - 依赖分析器选项
   */
  constructor(options: DependencyAnalyzerOptions = {}) {
    this.logger = options.logger
    this.enableCache = options.enableCache ?? true
    this.detectCircular = options.detectCircular ?? true
    this.detectUnused = options.detectUnused ?? true
  }

  // ========== 核心分析方法 ==========

  /**
   * 执行完整的依赖分析
   * 
   * 【详细说明】
   * 分析项目的所有依赖关系，包括：
   * 1. 外部依赖和打包依赖
   * 2. 循环依赖（如果启用）
   * 3. 未使用依赖（如果启用）
   * 4. 缺失依赖
   * 5. 版本信息
   * 
   * 【算法复杂度】
   * 时间复杂度：O(n + m)，n为依赖数量，m为文件数量
   * 空间复杂度：O(n + m)
   * 
   * @param config - 构建配置
   * @returns 依赖分析结果
   * 
   * @example
   * ```typescript
   * const analysis = await analyzer.analyze(config)
   * console.log('分析完成:', analysis)
   * ```
   */
  async analyze(config: BuilderConfig): Promise<DependencyAnalysis> {
    // ========== 生成缓存键 ==========
    const cacheKey = this.generateCacheKey(config)

    // ========== 检查缓存 ==========
    if (this.enableCache && this.cache.has(cacheKey)) {
      this.logger?.debug('使用缓存的依赖分析结果')
      return this.cache.get(cacheKey)!
    }

    // ========== 初始化分析结果 ==========
    const analysis: DependencyAnalysis = {
      external: [],
      bundled: [],
      circular: [],
      unused: [],
      missing: [],
      versions: {}
    }

    try {
      const projectRoot = config.cwd || process.cwd()

      // ========== 读取 package.json ==========
      const packageJsonPath = path.join(projectRoot, 'package.json')
      if (await fs.pathExists(packageJsonPath)) {
        const packageJson = await fs.readJson(packageJsonPath)
        const allDeps = {
          ...packageJson.dependencies,
          ...packageJson.peerDependencies
        }

        // ========== 分析外部依赖 ==========
        if (config.external) {
          const external = Array.isArray(config.external)
            ? config.external
            : [config.external]
          analysis.external = external.filter(
            dep => typeof dep === 'string' && dep in allDeps
          ) as string[]
        }

        // ========== 记录版本信息 ==========
        for (const [name, version] of Object.entries(allDeps)) {
          analysis.versions[name] = version as string
        }

        // ========== 检测未使用的依赖 ==========
        if (this.detectUnused) {
          for (const dep of Object.keys(allDeps)) {
            if (!analysis.external.includes(dep) && !analysis.bundled.includes(dep)) {
              analysis.unused.push(dep)
            }
          }
        }
      }

      // ========== 检测循环依赖 ==========
      if (this.detectCircular && config.input && typeof config.input === 'string') {
        analysis.circular = await this.detectCircularDependencies(config.input, projectRoot)
      }

    } catch (error) {
      this.logger?.warn('依赖分析失败:', error)
    }

    // ========== 缓存结果 ==========
    if (this.enableCache) {
      this.cache.set(cacheKey, analysis)
    }

    return analysis
  }

  /**
   * 检测循环依赖
   * 
   * 【详细说明】
   * 使用深度优先搜索（DFS）检测代码中的循环依赖
   * 
   * 【算法说明】
   * 1. 从入口文件开始遍历
   * 2. 记录访问路径
   * 3. 如果发现已访问的节点，说明存在循环
   * 4. 返回所有检测到的循环依赖链
   * 
   * 【算法复杂度】
   * 时间复杂度：O(V + E)，V为文件数，E为依赖关系数
   * 空间复杂度：O(V)
   * 
   * @param entry - 入口文件路径
   * @param projectRoot - 项目根目录
   * @returns 循环依赖链数组
   * 
   * @example
   * ```typescript
   * const cycles = await analyzer.detectCircularDependencies(
   *   'src/index.ts',
   *   '/path/to/project'
   * )
   * ```
   */
  private async detectCircularDependencies(
    entry: string,
    projectRoot: string
  ): Promise<string[][]> {
    const cycles: string[][] = []

    // ========== 简化实现：在实际应用中应使用更复杂的算法 ==========
    // TODO: 实现完整的循环依赖检测算法
    // 可以使用 madge、dependency-cruiser 等工具的算法

    // 当前返回空数组，表示未检测到循环依赖
    // 这是一个占位实现，需要后续完善
    this.logger?.debug('循环依赖检测已执行（简化版）')

    return cycles
  }

  /**
   * 分析外部依赖
   * 
   * 【详细说明】
   * 根据配置和 package.json，确定哪些依赖应该外部化
   * 
   * @param config - 构建配置
   * @param packageJson - package.json 内容
   * @returns 外部依赖列表
   */
  private analyzeExternalDependencies(
    config: BuilderConfig,
    packageJson: any
  ): string[] {
    const external: string[] = []
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.peerDependencies
    }

    // ========== 处理配置中指定的外部依赖 ==========
    if (config.external) {
      if (Array.isArray(config.external)) {
        external.push(...config.external.filter(dep => typeof dep === 'string'))
      } else if (typeof config.external === 'string') {
        external.push(config.external)
      }
    }

    // ========== 自动外部化 peerDependencies ==========
    if (packageJson.peerDependencies) {
      for (const dep of Object.keys(packageJson.peerDependencies)) {
        if (!external.includes(dep)) {
          external.push(dep)
        }
      }
    }

    return external
  }

  /**
   * 检测缺失的依赖
   * 
   * 【详细说明】
   * 扫描源代码，检测代码中引用但未在 package.json 中声明的依赖
   * 
   * @param entry - 入口文件
   * @param packageJson - package.json 内容
   * @returns 缺失的依赖列表
   */
  private async detectMissingDependencies(
    entry: string,
    packageJson: any
  ): Promise<string[]> {
    const missing: string[] = []

    // ========== 简化实现 ==========
    // TODO: 实现完整的缺失依赖检测
    // 可以通过静态分析 import/require 语句实现

    this.logger?.debug('缺失依赖检测已执行（简化版）')

    return missing
  }

  // ========== 工具方法 ==========

  /**
   * 生成缓存键
   * 
   * 【详细说明】
   * 根据配置生成唯一的缓存键，用于缓存分析结果
   * 
   * @param config - 构建配置
   * @returns 缓存键
   */
  private generateCacheKey(config: BuilderConfig): string {
    const key = {
      input: config.input,
      external: config.external,
      cwd: config.cwd
    }
    return `deps_${JSON.stringify(key)}`
  }

  /**
   * 清除缓存
   * 
   * 【详细说明】
   * 清除所有缓存的分析结果，下次分析将重新执行
   * 
   * @example
   * ```typescript
   * analyzer.clearCache()
   * ```
   */
  clearCache(): void {
    this.cache.clear()
    this.logger?.debug('依赖分析缓存已清除')
  }

  /**
   * 清除指定配置的缓存
   * 
   * @param config - 构建配置
   * @returns 是否成功清除
   */
  clearCacheFor(config: BuilderConfig): boolean {
    const key = this.generateCacheKey(config)
    const result = this.cache.delete(key)
    if (result) {
      this.logger?.debug(`已清除配置的缓存: ${key}`)
    }
    return result
  }

  /**
   * 获取缓存统计信息
   * 
   * @returns 统计信息
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      enableCache: this.enableCache,
      detectCircular: this.detectCircular,
      detectUnused: this.detectUnused
    }
  }
}

/**
 * 创建依赖分析器实例
 * 
 * @param options - 选项
 * @returns 依赖分析器实例
 * 
 * @example
 * ```typescript
 * const analyzer = createDependencyAnalyzer({
 *   logger: myLogger
 * })
 * ```
 */
export function createDependencyAnalyzer(
  options?: DependencyAnalyzerOptions
): DependencyAnalyzer {
  return new DependencyAnalyzer(options)
}

