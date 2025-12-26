/**
 * 基础适配器缓存管理器
 * 
 * 提供通用的构建缓存功能，所有适配器都可以使用
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import path from 'path'
import fs from 'fs-extra'
import crypto from 'crypto'
import type { UnifiedConfig } from '../../types/adapter'
import type { BuildResult } from '../../types/builder'
import { Logger } from '../../utils/logger'

/**
 * 缓存配置选项
 */
export interface CacheOptions {
  /** 缓存目录 */
  cacheDir?: string
  /** 缓存过期时间(ms) */
  ttl?: number
  /** 最大缓存大小(bytes) */
  maxSize?: number
  /** 是否启用缓存 */
  enabled?: boolean
}

/**
 * 缓存条目
 */
interface CacheEntry {
  /** 缓存键的哈希 */
  hash: string
  /** 创建时间 */
  timestamp: number
  /** 构建结果 */
  result: BuildResult
  /** 源文件哈希映射 */
  sourceHashes: Record<string, string>
}

/**
 * 默认缓存配置
 */
const DEFAULT_CACHE_OPTIONS: Required<CacheOptions> = {
  cacheDir: '.builder-cache',
  ttl: 7 * 24 * 60 * 60 * 1000, // 7天
  maxSize: 500 * 1024 * 1024, // 500MB
  enabled: true
}

/**
 * 基础适配器缓存管理器
 */
export class BaseAdapterCacheManager {
  private logger: Logger
  private options: Required<CacheOptions>
  private cacheIndex: Map<string, CacheEntry> = new Map()
  private adapterName: string

  constructor(adapterName: string, options: CacheOptions = {}, logger?: Logger) {
    this.adapterName = adapterName
    this.logger = logger || new Logger()
    this.options = { ...DEFAULT_CACHE_OPTIONS, ...options }
  }

  /**
   * 检查缓存是否启用
   */
  isCacheEnabled(config: UnifiedConfig): boolean {
    // 显式禁用缓存
    if ((config as any).cache === false) {
      return false
    }

    // 清理模式禁用缓存
    if ((config as any).clean === true) {
      return false
    }

    return this.options.enabled
  }

  /**
   * 获取缓存选项
   */
  getCacheOptions(config: UnifiedConfig): Required<CacheOptions> {
    const configCache = (config as any).cache
    if (typeof configCache === 'object') {
      return {
        ...this.options,
        cacheDir: configCache.dir || this.options.cacheDir,
        ttl: configCache.ttl || this.options.ttl,
        maxSize: configCache.maxSize || this.options.maxSize,
        enabled: configCache.enabled ?? this.options.enabled
      }
    }
    return this.options
  }

  /**
   * 生成缓存键
   */
  generateCacheKey(config: UnifiedConfig): string {
    const keyData = {
      adapter: this.adapterName,
      input: config.input,
      output: config.output,
      external: config.external,
      plugins: (config.plugins || []).map(p => (p as any).name || 'unknown'),
      treeshake: config.treeshake,
      minify: config.minify
    }

    const hash = crypto
      .createHash('md5')
      .update(JSON.stringify(keyData))
      .digest('hex')

    return `${this.adapterName}-${hash}`
  }

  /**
   * 获取缓存的构建结果
   */
  async getCachedResult(cacheKey: string): Promise<BuildResult | null> {
    if (!this.options.enabled) {
      return null
    }

    const cachePath = this.getCachePath(cacheKey)
    
    try {
      if (await fs.pathExists(cachePath)) {
        const entry: CacheEntry = await fs.readJSON(cachePath)
        
        // 检查是否过期
        if (Date.now() - entry.timestamp > this.options.ttl) {
          this.logger.debug(`缓存已过期: ${cacheKey}`)
          await fs.remove(cachePath)
          return null
        }

        this.logger.debug(`缓存命中: ${cacheKey}`)
        return entry.result
      }
    } catch (error) {
      this.logger.debug(`读取缓存失败: ${(error as Error).message}`)
    }

    return null
  }

  /**
   * 缓存构建结果
   */
  async cacheResult(cacheKey: string, result: BuildResult, sourceHashes: Record<string, string> = {}): Promise<void> {
    if (!this.options.enabled) {
      return
    }

    const cachePath = this.getCachePath(cacheKey)
    const entry: CacheEntry = {
      hash: cacheKey,
      timestamp: Date.now(),
      result,
      sourceHashes
    }

    try {
      await fs.ensureDir(path.dirname(cachePath))
      await fs.writeJSON(cachePath, entry)
      this.logger.debug(`已缓存构建结果: ${cacheKey}`)
    } catch (error) {
      this.logger.warn(`缓存写入失败: ${(error as Error).message}`)
    }
  }

  /**
   * 计算文件哈希
   */
  async calculateFileHash(filePath: string): Promise<string> {
    try {
      const content = await fs.readFile(filePath)
      return crypto.createHash('md5').update(content as any).digest('hex')
    } catch {
      return ''
    }
  }

  /**
   * 计算多个源文件的哈希
   */
  async calculateSourceHashes(files: string[]): Promise<Record<string, string>> {
    const hashes: Record<string, string> = {}
    
    for (const file of files) {
      hashes[file] = await this.calculateFileHash(file)
    }

    return hashes
  }

  /**
   * 检查源文件是否修改
   */
  async checkSourceFilesModified(
    config: UnifiedConfig, 
    cachedResult: BuildResult
  ): Promise<boolean> {
    const cacheKey = this.generateCacheKey(config)
    const cachePath = this.getCachePath(cacheKey)

    try {
      if (await fs.pathExists(cachePath)) {
        const entry: CacheEntry = await fs.readJSON(cachePath)
        
        for (const [file, hash] of Object.entries(entry.sourceHashes)) {
          const currentHash = await this.calculateFileHash(file)
          if (currentHash !== hash) {
            return true
          }
        }
      }
    } catch {
      return true
    }

    return false
  }

  /**
   * 验证输出产物是否存在
   */
  async validateOutputArtifacts(config: UnifiedConfig): Promise<boolean> {
    const outputConfig = Array.isArray(config.output) ? config.output[0] : config.output
    const outDir = outputConfig?.dir || 'dist'

    try {
      if (await fs.pathExists(outDir)) {
        const files = await fs.readdir(outDir)
        return files.length > 0
      }
    } catch {
      return false
    }

    return false
  }

  /**
   * 清理缓存
   */
  async clearCache(): Promise<void> {
    const cacheDir = path.join(process.cwd(), this.options.cacheDir, this.adapterName)
    
    try {
      if (await fs.pathExists(cacheDir)) {
        await fs.remove(cacheDir)
        this.logger.info(`已清理 ${this.adapterName} 适配器缓存`)
      }
    } catch (error) {
      this.logger.warn(`清理缓存失败: ${(error as Error).message}`)
    }
  }

  /**
   * 清理过期缓存
   */
  async cleanExpiredCache(): Promise<number> {
    const cacheDir = path.join(process.cwd(), this.options.cacheDir, this.adapterName)
    let cleanedCount = 0

    try {
      if (await fs.pathExists(cacheDir)) {
        const files = await fs.readdir(cacheDir)
        
        for (const file of files) {
          const filePath = path.join(cacheDir, file)
          
          try {
            const entry: CacheEntry = await fs.readJSON(filePath)
            
            if (Date.now() - entry.timestamp > this.options.ttl) {
              await fs.remove(filePath)
              cleanedCount++
            }
          } catch {
            // 无效的缓存文件，删除
            await fs.remove(filePath)
            cleanedCount++
          }
        }
      }
    } catch (error) {
      this.logger.warn(`清理过期缓存失败: ${(error as Error).message}`)
    }

    if (cleanedCount > 0) {
      this.logger.info(`已清理 ${cleanedCount} 个过期缓存`)
    }

    return cleanedCount
  }

  /**
   * 获取缓存文件路径
   */
  private getCachePath(cacheKey: string): string {
    return path.join(
      process.cwd(),
      this.options.cacheDir,
      this.adapterName,
      `${cacheKey}.json`
    )
  }

  /**
   * 获取缓存目录
   */
  getCacheDir(): string {
    return path.join(process.cwd(), this.options.cacheDir, this.adapterName)
  }

  /**
   * 获取缓存统计
   */
  async getCacheStats(): Promise<{
    size: number
    entries: number
    oldestEntry: number | null
    newestEntry: number | null
  }> {
    const cacheDir = this.getCacheDir()
    let size = 0
    let entries = 0
    let oldestEntry: number | null = null
    let newestEntry: number | null = null

    try {
      if (await fs.pathExists(cacheDir)) {
        const files = await fs.readdir(cacheDir)
        
        for (const file of files) {
          const filePath = path.join(cacheDir, file)
          const stat = await fs.stat(filePath)
          size += stat.size
          entries++

          try {
            const entry: CacheEntry = await fs.readJSON(filePath)
            if (!oldestEntry || entry.timestamp < oldestEntry) {
              oldestEntry = entry.timestamp
            }
            if (!newestEntry || entry.timestamp > newestEntry) {
              newestEntry = entry.timestamp
            }
          } catch {
            // 忽略无效文件
          }
        }
      }
    } catch (error) {
      this.logger.debug(`获取缓存统计失败: ${(error as Error).message}`)
    }

    return { size, entries, oldestEntry, newestEntry }
  }
}
