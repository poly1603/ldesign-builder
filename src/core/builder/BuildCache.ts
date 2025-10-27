/**
 * 构建缓存管理模块
 * 
 * 【功能描述】
 * 负责管理构建过程中的缓存，包括构建结果缓存、依赖缓存、
 * 缓存验证和缓存持久化等功能
 * 
 * 【主要特性】
 * - 构建结果缓存：缓存完整的构建结果，避免重复构建
 * - 依赖文件跟踪：记录依赖文件的修改时间，用于缓存失效判断
 * - 配置哈希：通过配置哈希判断配置是否变更
 * - 缓存持久化：支持将缓存保存到磁盘，跨进程共享
 * - 智能失效：自动检测文件变更、配置变更等，智能失效缓存
 * - 内存+磁盘双层缓存：内存缓存用于快速访问，磁盘缓存用于持久化
 * 
 * 【使用示例】
 * ```typescript
 * import { BuildCacheManager } from './BuildCache'
 * 
 * const cacheManager = new BuildCacheManager()
 * 
 * // 获取缓存
 * const cached = cacheManager.get(cacheKey)
 * if (cached && await cacheManager.isValid(cached, config)) {
 *   return cached.buildResult
 * }
 * 
 * // 保存缓存
 * cacheManager.set(cacheKey, buildResult, dependencies)
 * 
 * // 持久化缓存
 * await cacheManager.save()
 * ```
 * 
 * @module core/builder/BuildCache
 * @author LDesign Team
 * @version 1.0.0
 * @since 2024-01-01
 */

import { createHash } from 'crypto'
import * as fs from 'fs-extra'
import * as path from 'path'
import type { BuildResult } from '../../types/builder'
import type { BuilderConfig } from '../../types/config'
import type { Logger } from '../../utils/logger'

/**
 * 构建缓存接口
 */
export interface BuildCache {
  /** 配置哈希值，用于判断配置是否变更 */
  configHash: string
  /** 构建结果 */
  buildResult: BuildResult
  /** 缓存时间戳 */
  timestamp: number
  /** 依赖文件列表 */
  dependencies: string[]
}

/**
 * 构建缓存管理器选项
 */
export interface BuildCacheManagerOptions {
  /** 日志记录器 */
  logger?: Logger
  /** 缓存文件路径，默认为项目根目录下的 .ldesign-builder-cache.json */
  cacheFilePath?: string
  /** 缓存最大有效期（毫秒），默认 24 小时 */
  maxAge?: number
  /** 是否启用磁盘缓存，默认 true */
  enableDiskCache?: boolean
}

/**
 * 构建缓存管理器类
 * 
 * 【功能说明】
 * 提供完整的构建缓存管理功能，包括缓存的存储、检索、
 * 验证和持久化
 * 
 * 【核心方法】
 * - get: 获取缓存
 * - set: 设置缓存
 * - isValid: 验证缓存是否有效
 * - clear: 清除缓存
 * - load: 加载持久化缓存
 * - save: 保存缓存到磁盘
 * 
 * 【设计模式】
 * 单例模式建议：可以在应用中共享一个实例
 * 
 * @example
 * ```typescript
 * const cacheManager = new BuildCacheManager({
 *   logger: myLogger,
 *   maxAge: 3600000 // 1小时
 * })
 * 
 * await cacheManager.load()
 * const cached = cacheManager.get('cache-key')
 * ```
 */
export class BuildCacheManager {
  /** 内存缓存存储 */
  private cache: Map<string, BuildCache> = new Map()
  /** 日志记录器 */
  private logger?: Logger
  /** 缓存文件路径 */
  private cacheFilePath: string
  /** 最大有效期 */
  private maxAge: number
  /** 是否启用磁盘缓存 */
  private enableDiskCache: boolean

  /**
   * 构造函数
   * 
   * @param options - 缓存管理器选项
   */
  constructor(options: BuildCacheManagerOptions = {}) {
    this.logger = options.logger
    this.cacheFilePath = options.cacheFilePath || path.join(process.cwd(), '.ldesign-builder-cache.json')
    this.maxAge = options.maxAge || 24 * 60 * 60 * 1000 // 24小时
    this.enableDiskCache = options.enableDiskCache ?? true
  }

  // ========== 缓存操作方法 ==========

  /**
   * 获取缓存
   * 
   * 【详细说明】
   * 从内存缓存中获取指定键的缓存数据
   * 
   * 【算法复杂度】
   * 时间复杂度：O(1)
   * 空间复杂度：O(1)
   * 
   * @param key - 缓存键
   * @returns 缓存数据或 undefined
   * 
   * @example
   * ```typescript
   * const cached = cacheManager.get('build-abc123')
   * if (cached) {
   *   console.log('找到缓存')
   * }
   * ```
   */
  get(key: string): BuildCache | undefined {
    return this.cache.get(key)
  }

  /**
   * 设置缓存
   * 
   * 【详细说明】
   * 将构建结果缓存到内存中，并记录依赖文件列表
   * 
   * 【算法复杂度】
   * 时间复杂度：O(1)
   * 空间复杂度：O(n)，n为依赖文件数量
   * 
   * @param key - 缓存键
   * @param buildResult - 构建结果
   * @param dependencies - 依赖文件列表
   * 
   * @example
   * ```typescript
   * cacheManager.set(
   *   'build-abc123',
   *   buildResult,
   *   ['src/index.ts', 'src/utils.ts']
   * )
   * ```
   */
  set(key: string, buildResult: BuildResult, dependencies: string[]): void {
    this.cache.set(key, {
      configHash: key,
      buildResult,
      timestamp: Date.now(),
      dependencies
    })

    this.logger?.debug(`缓存已保存: ${key}`)
  }

  /**
   * 验证缓存是否有效
   * 
   * 【详细说明】
   * 检查缓存是否仍然有效，判断标准：
   * 1. 配置哈希是否匹配
   * 2. 依赖文件是否被修改
   * 3. 缓存是否过期
   * 
   * 【算法复杂度】
   * 时间复杂度：O(n)，n为依赖文件数量
   * 空间复杂度：O(1)
   * 
   * @param cache - 缓存数据
   * @param config - 当前配置
   * @returns 是否有效
   * 
   * @example
   * ```typescript
   * const cached = cacheManager.get(key)
   * if (cached && await cacheManager.isValid(cached, config)) {
   *   return cached.buildResult
   * }
   * ```
   */
  async isValid(cache: BuildCache, config: BuilderConfig): Promise<boolean> {
    // ========== 检查配置哈希 ==========
    const currentHash = this.generateConfigHash(config)
    if (cache.configHash !== currentHash) {
      this.logger?.debug('缓存失效：配置已变更')
      return false
    }

    // ========== 检查依赖文件是否被修改 ==========
    for (const dep of cache.dependencies) {
      try {
        const stat = await fs.stat(dep)
        if (stat.mtimeMs > cache.timestamp) {
          this.logger?.debug(`缓存失效：文件已修改 ${dep}`)
          return false
        }
      } catch {
        // 文件不存在或无法访问，认为缓存失效
        this.logger?.debug(`缓存失效：文件不存在或无法访问 ${dep}`)
        return false
      }
    }

    // ========== 检查缓存是否过期 ==========
    const age = Date.now() - cache.timestamp
    if (age > this.maxAge) {
      this.logger?.debug(`缓存失效：已过期（${Math.round(age / 1000 / 60)}分钟）`)
      return false
    }

    return true
  }

  /**
   * 清除指定缓存
   * 
   * @param key - 缓存键
   * @returns 是否成功删除
   */
  delete(key: string): boolean {
    const result = this.cache.delete(key)
    if (result) {
      this.logger?.debug(`缓存已删除: ${key}`)
    }
    return result
  }

  /**
   * 清除所有缓存
   * 
   * 【详细说明】
   * 清空内存中的所有缓存数据
   * 
   * @example
   * ```typescript
   * cacheManager.clear()
   * console.log('所有缓存已清除')
   * ```
   */
  clear(): void {
    this.cache.clear()
    this.logger?.debug('所有缓存已清除')
  }

  /**
   * 清除特定文件相关的缓存
   * 
   * 【详细说明】
   * 当某个文件发生变化时，清除所有依赖该文件的缓存
   * 
   * 【算法复杂度】
   * 时间复杂度：O(n*m)，n为缓存数量，m为每个缓存的依赖数量
   * 空间复杂度：O(1)
   * 
   * @param file - 文件路径
   * @returns 清除的缓存数量
   * 
   * @example
   * ```typescript
   * const count = cacheManager.clearByFile('src/index.ts')
   * console.log(`清除了 ${count} 个相关缓存`)
   * ```
   */
  clearByFile(file: string): number {
    let count = 0
    for (const [key, cache] of this.cache) {
      if (cache.dependencies.includes(file)) {
        this.cache.delete(key)
        count++
      }
    }

    if (count > 0) {
      this.logger?.debug(`已清除 ${count} 个与文件 ${file} 相关的缓存`)
    }

    return count
  }

  // ========== 持久化方法 ==========

  /**
   * 加载磁盘缓存
   * 
   * 【详细说明】
   * 从磁盘文件中加载之前保存的缓存数据到内存
   * 
   * 【算法复杂度】
   * 时间复杂度：O(n)，n为缓存数量
   * 空间复杂度：O(n)
   * 
   * @returns 加载的缓存数量
   * 
   * @example
   * ```typescript
   * const count = await cacheManager.load()
   * console.log(`加载了 ${count} 个缓存`)
   * ```
   */
  async load(): Promise<number> {
    if (!this.enableDiskCache) {
      return 0
    }

    try {
      if (await fs.pathExists(this.cacheFilePath)) {
        const cacheData = await fs.readJson(this.cacheFilePath)
        let count = 0

        for (const [key, value] of Object.entries(cacheData)) {
          this.cache.set(key, value as BuildCache)
          count++
        }

        this.logger?.debug(`已从磁盘加载 ${count} 个缓存`)
        return count
      }
    } catch (error) {
      this.logger?.warn('加载缓存失败:', error)
    }

    return 0
  }

  /**
   * 保存缓存到磁盘
   * 
   * 【详细说明】
   * 将内存中的缓存数据持久化到磁盘文件
   * 
   * 【算法复杂度】
   * 时间复杂度：O(n)，n为缓存数量
   * 空间复杂度：O(n)
   * 
   * @returns 保存的缓存数量
   * 
   * @example
   * ```typescript
   * const count = await cacheManager.save()
   * console.log(`保存了 ${count} 个缓存到磁盘`)
   * ```
   */
  async save(): Promise<number> {
    if (!this.enableDiskCache) {
      return 0
    }

    try {
      const cacheData: Record<string, BuildCache> = {}
      for (const [key, value] of this.cache) {
        cacheData[key] = value
      }

      await fs.writeJson(this.cacheFilePath, cacheData, { spaces: 2 })
      this.logger?.debug(`已保存 ${this.cache.size} 个缓存到磁盘`)
      return this.cache.size
    } catch (error) {
      this.logger?.warn('保存缓存失败:', error)
      return 0
    }
  }

  // ========== 工具方法 ==========

  /**
   * 生成配置哈希
   * 
   * 【详细说明】
   * 通过 MD5 算法对配置对象生成哈希值，用于判断配置是否变更
   * 
   * 【算法复杂度】
   * 时间复杂度：O(n)，n为配置对象的大小
   * 空间复杂度：O(1)
   * 
   * @param config - 构建配置
   * @returns MD5 哈希值
   * 
   * @example
   * ```typescript
   * const hash = cacheManager.generateConfigHash(config)
   * console.log('配置哈希:', hash)
   * ```
   */
  generateConfigHash(config: BuilderConfig): string {
    const hash = createHash('md5')
    hash.update(JSON.stringify(config))
    return hash.digest('hex')
  }

  /**
   * 获取缓存统计信息
   * 
   * @returns 统计信息
   */
  getStats() {
    return {
      size: this.cache.size,
      maxAge: this.maxAge,
      cacheFilePath: this.cacheFilePath,
      enableDiskCache: this.enableDiskCache
    }
  }

  /**
   * 释放资源
   * 
   * 【详细说明】
   * 在应用关闭前调用，保存缓存并释放资源
   */
  async dispose(): Promise<void> {
    if (this.enableDiskCache) {
      await this.save()
    }
    this.clear()
  }
}

/**
 * 创建构建缓存管理器实例
 * 
 * @param options - 选项
 * @returns 缓存管理器实例
 * 
 * @example
 * ```typescript
 * const cacheManager = createBuildCacheManager({
 *   logger: myLogger
 * })
 * ```
 */
export function createBuildCacheManager(options?: BuildCacheManagerOptions): BuildCacheManager {
  return new BuildCacheManager(options)
}

