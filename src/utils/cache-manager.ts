/**
 * 多层智能缓存系统
 * 
 * L1: 内存缓存（热数据，最快）
 * L2: 磁盘缓存（持久化，中速）
 * L3: 分布式缓存（可选，团队协作）
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import { createHash } from 'crypto'
import path from 'path'
import fs from 'fs-extra'
import { Logger } from './logger'

/**
 * 缓存条目
 */
export interface CacheEntry<T = any> {
  key: string
  value: T
  timestamp: number
  ttl: number
  size: number
  hits: number
  hash: string
}

/**
 * 缓存统计
 */
export interface CacheStats {
  l1: {
    hits: number
    misses: number
    size: number
    entries: number
  }
  l2: {
    hits: number
    misses: number
    size: number
    entries: number
  }
  l3?: {
    hits: number
    misses: number
    size: number
    entries: number
  }
  overall: {
    hits: number
    misses: number
    hitRate: number
    timeSaved: number
  }
}

/**
 * 缓存配置
 */
export interface MultilayerCacheOptions {
  /** L1 内存缓存配置 */
  l1?: {
    enabled?: boolean
    maxSize?: number // 字节
    maxEntries?: number
    ttl?: number // 毫秒
  }

  /** L2 磁盘缓存配置 */
  l2?: {
    enabled?: boolean
    cacheDir?: string
    maxSize?: number // 字节
    ttl?: number // 毫秒
    compression?: boolean
  }

  /** L3 分布式缓存配置 */
  l3?: {
    enabled?: boolean
    type?: 'redis' | 'memcached' | 'custom'
    host?: string
    port?: number
    options?: any
  }

  /** 全局配置 */
  defaultTtl?: number
  cleanupInterval?: number
  logger?: Logger
}

/**
 * 多层缓存管理器
 */
export class MultilayerCache {
  private l1Cache: Map<string, CacheEntry> = new Map()
  private l2CacheDir: string
  private options: Required<Omit<MultilayerCacheOptions, 'l1' | 'l2' | 'l3' | 'logger'>> & MultilayerCacheOptions
  private logger: Logger
  private stats: CacheStats
  private cleanupTimer?: NodeJS.Timeout
  private l3Client?: any

  constructor(options: MultilayerCacheOptions = {}) {
    this.logger = options.logger || new Logger({ prefix: 'MultilayerCache' })

    this.options = {
      l1: {
        enabled: true,
        maxSize: 100 * 1024 * 1024, // 100MB
        maxEntries: 1000,
        ttl: 3600000, // 1小时
        ...options.l1
      },
      l2: {
        enabled: true,
        cacheDir: path.join(process.cwd(), 'node_modules', '.cache', '@ldesign', 'builder'),
        maxSize: 500 * 1024 * 1024, // 500MB
        ttl: 86400000, // 24小时
        compression: true,
        ...options.l2
      },
      l3: {
        enabled: false,
        type: 'redis',
        ...options.l3
      },
      defaultTtl: options.defaultTtl || 3600000,
      cleanupInterval: options.cleanupInterval || 300000, // 5分钟
      logger: options.logger
    }

    this.l2CacheDir = this.options.l2!.cacheDir!

    this.stats = {
      l1: { hits: 0, misses: 0, size: 0, entries: 0 },
      l2: { hits: 0, misses: 0, size: 0, entries: 0 },
      overall: { hits: 0, misses: 0, hitRate: 0, timeSaved: 0 }
    }

    // 初始化
    this.initialize()
  }

  /**
   * 初始化缓存系统
   */
  private async initialize(): Promise<void> {
    // 创建 L2 缓存目录
    if (this.options.l2?.enabled) {
      await fs.ensureDir(this.l2CacheDir)
    }

    // 连接 L3 缓存
    if (this.options.l3?.enabled) {
      await this.connectL3()
    }

    // 启动定期清理
    this.startCleanup()

    this.logger.debug('多层缓存系统已初始化')
  }

  /**
   * 获取缓存
   */
  async get<T = any>(key: string): Promise<T | null> {
    const startTime = Date.now()

    // L1: 内存缓存
    if (this.options.l1?.enabled) {
      const l1Result = this.getFromL1<T>(key)
      if (l1Result !== null) {
        this.stats.l1.hits++
        this.stats.overall.hits++
        this.updateHitRate()
        this.stats.overall.timeSaved += Date.now() - startTime
        return l1Result
      }
      this.stats.l1.misses++
    }

    // L2: 磁盘缓存
    if (this.options.l2?.enabled) {
      const l2Result = await this.getFromL2<T>(key)
      if (l2Result !== null) {
        this.stats.l2.hits++
        this.stats.overall.hits++
        this.updateHitRate()

        // 提升到 L1
        if (this.options.l1?.enabled) {
          this.setToL1(key, l2Result, this.options.defaultTtl)
        }

        this.stats.overall.timeSaved += Date.now() - startTime
        return l2Result
      }
      this.stats.l2.misses++
    }

    // L3: 分布式缓存
    if (this.options.l3?.enabled && this.l3Client) {
      const l3Result = await this.getFromL3<T>(key)
      if (l3Result !== null) {
        this.stats.l3 = this.stats.l3 || { hits: 0, misses: 0, size: 0, entries: 0 }
        this.stats.l3.hits++
        this.stats.overall.hits++
        this.updateHitRate()

        // 提升到 L2 和 L1
        if (this.options.l2?.enabled) {
          await this.setToL2(key, l3Result, this.options.defaultTtl)
        }
        if (this.options.l1?.enabled) {
          this.setToL1(key, l3Result, this.options.defaultTtl)
        }

        this.stats.overall.timeSaved += Date.now() - startTime
        return l3Result
      }
      this.stats.l3 = this.stats.l3 || { hits: 0, misses: 0, size: 0, entries: 0 }
      this.stats.l3.misses++
    }

    this.stats.overall.misses++
    this.updateHitRate()
    return null
  }

  /**
   * 设置缓存
   */
  async set<T = any>(key: string, value: T, ttl?: number): Promise<void> {
    const actualTtl = ttl || this.options.defaultTtl

    // 同时写入所有层级
    const promises: Promise<void>[] = []

    if (this.options.l1?.enabled) {
      this.setToL1(key, value, actualTtl)
    }

    if (this.options.l2?.enabled) {
      promises.push(this.setToL2(key, value, actualTtl))
    }

    if (this.options.l3?.enabled && this.l3Client) {
      promises.push(this.setToL3(key, value, actualTtl))
    }

    await Promise.all(promises)
  }

  /**
   * 删除缓存
   */
  async delete(key: string): Promise<void> {
    const promises: Promise<void>[] = []

    if (this.options.l1?.enabled) {
      this.l1Cache.delete(key)
    }

    if (this.options.l2?.enabled) {
      promises.push(this.deleteFromL2(key))
    }

    if (this.options.l3?.enabled && this.l3Client) {
      promises.push(this.deleteFromL3(key))
    }

    await Promise.all(promises)
  }

  /**
   * 清空所有缓存
   */
  async clear(): Promise<void> {
    this.l1Cache.clear()

    if (this.options.l2?.enabled) {
      await fs.emptyDir(this.l2CacheDir)
    }

    if (this.options.l3?.enabled && this.l3Client) {
      await this.clearL3()
    }

    this.resetStats()
    this.logger.info('所有缓存已清空')
  }

  /**
   * 获取缓存统计
   */
  getStats(): CacheStats {
    return { ...this.stats }
  }

  /**
   * 销毁缓存系统
   */
  async dispose(): Promise<void> {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }

    if (this.l3Client) {
      await this.disconnectL3()
    }

    this.logger.debug('多层缓存系统已销毁')
  }

  // ==================== L1 内存缓存 ====================

  /**
   * 从 L1 获取
   */
  private getFromL1<T>(key: string): T | null {
    const entry = this.l1Cache.get(key)

    if (!entry) {
      return null
    }

    // 检查过期
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.l1Cache.delete(key)
      return null
    }

    entry.hits++
    return entry.value as T
  }

  /**
   * 设置到 L1
   */
  private setToL1<T>(key: string, value: T, ttl: number): void {
    const size = this.estimateSize(value)

    // 检查容量限制
    this.evictIfNeeded(size)

    const entry: CacheEntry<T> = {
      key,
      value,
      timestamp: Date.now(),
      ttl,
      size,
      hits: 0,
      hash: this.hashValue(value)
    }

    this.l1Cache.set(key, entry)
    this.stats.l1.entries = this.l1Cache.size
    this.stats.l1.size += size
  }

  /**
   * 驱逐 L1 缓存（LRU）
   */
  private evictIfNeeded(newSize: number): void {
    const maxSize = this.options.l1!.maxSize!
    const maxEntries = this.options.l1!.maxEntries!

    // 超过大小限制或条目数限制
    while (
      (this.stats.l1.size + newSize > maxSize || this.l1Cache.size >= maxEntries) &&
      this.l1Cache.size > 0
    ) {
      // 找到最少使用的条目
      let lruKey: string | null = null
      let minHits = Infinity
      let oldestTime = Infinity

      for (const [key, entry] of this.l1Cache) {
        if (entry.hits < minHits || (entry.hits === minHits && entry.timestamp < oldestTime)) {
          lruKey = key
          minHits = entry.hits
          oldestTime = entry.timestamp
        }
      }

      if (lruKey) {
        const entry = this.l1Cache.get(lruKey)!
        this.stats.l1.size -= entry.size
        this.l1Cache.delete(lruKey)
      }
    }
  }

  // ==================== L2 磁盘缓存 ====================

  /**
   * 从 L2 获取
   */
  private async getFromL2<T>(key: string): Promise<T | null> {
    const filePath = this.getL2FilePath(key)

    try {
      if (!(await fs.pathExists(filePath))) {
        return null
      }

      const data = await fs.readFile(filePath, 'utf-8')
      const entry: CacheEntry<T> = JSON.parse(data)

      // 检查过期
      if (Date.now() - entry.timestamp > entry.ttl) {
        await fs.unlink(filePath)
        return null
      }

      return entry.value
    } catch (error) {
      this.logger.debug(`L2 缓存读取失败: ${key}`, error)
      return null
    }
  }

  /**
   * 设置到 L2
   */
  private async setToL2<T>(key: string, value: T, ttl: number): Promise<void> {
    const filePath = this.getL2FilePath(key)

    const entry: CacheEntry<T> = {
      key,
      value,
      timestamp: Date.now(),
      ttl,
      size: this.estimateSize(value),
      hits: 0,
      hash: this.hashValue(value)
    }

    try {
      await fs.ensureDir(path.dirname(filePath))
      await fs.writeFile(filePath, JSON.stringify(entry))
    } catch (error) {
      this.logger.debug(`L2 缓存写入失败: ${key}`, error)
    }
  }

  /**
   * 从 L2 删除
   */
  private async deleteFromL2(key: string): Promise<void> {
    const filePath = this.getL2FilePath(key)
    try {
      await fs.unlink(filePath)
    } catch {
      // 忽略错误
    }
  }

  /**
   * 获取 L2 文件路径
   */
  private getL2FilePath(key: string): string {
    const hash = createHash('md5').update(key).digest('hex')
    return path.join(this.l2CacheDir, `${hash}.json`)
  }

  // ==================== L3 分布式缓存 ====================

  /**
   * 连接 L3 缓存
   */
  private async connectL3(): Promise<void> {
    // 这里可以根据配置连接 Redis、Memcached 等
    // 简化实现，实际需要引入相应的客户端库
    this.logger.debug('L3 分布式缓存连接（未实现）')
  }

  /**
   * 从 L3 获取
   */
  private async getFromL3<T>(key: string): Promise<T | null> {
    // 简化实现
    return null
  }

  /**
   * 设置到 L3
   */
  private async setToL3<T>(key: string, value: T, ttl: number): Promise<void> {
    // 简化实现
  }

  /**
   * 从 L3 删除
   */
  private async deleteFromL3(key: string): Promise<void> {
    // 简化实现
  }

  /**
   * 清空 L3
   */
  private async clearL3(): Promise<void> {
    // 简化实现
  }

  /**
   * 断开 L3 连接
   */
  private async disconnectL3(): Promise<void> {
    // 简化实现
  }

  // ==================== 工具方法 ====================

  /**
   * 估算对象大小
   */
  private estimateSize(value: any): number {
    const str = JSON.stringify(value)
    return Buffer.byteLength(str, 'utf-8')
  }

  /**
   * 计算值的哈希
   */
  private hashValue(value: any): string {
    const str = JSON.stringify(value)
    return createHash('md5').update(str).digest('hex')
  }

  /**
   * 更新命中率
   */
  private updateHitRate(): void {
    const total = this.stats.overall.hits + this.stats.overall.misses
    this.stats.overall.hitRate = total > 0 ? this.stats.overall.hits / total : 0
  }

  /**
   * 重置统计
   */
  private resetStats(): void {
    this.stats = {
      l1: { hits: 0, misses: 0, size: 0, entries: 0 },
      l2: { hits: 0, misses: 0, size: 0, entries: 0 },
      overall: { hits: 0, misses: 0, hitRate: 0, timeSaved: 0 }
    }
  }

  /**
   * 启动定期清理
   */
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.options.cleanupInterval)
  }

  /**
   * 清理过期缓存
   */
  private async cleanup(): Promise<void> {
    const now = Date.now()
    let cleaned = 0

    // 清理 L1
    for (const [key, entry] of this.l1Cache) {
      if (now - entry.timestamp > entry.ttl) {
        this.stats.l1.size -= entry.size
        this.l1Cache.delete(key)
        cleaned++
      }
    }

    this.stats.l1.entries = this.l1Cache.size

    // 清理 L2
    if (this.options.l2?.enabled) {
      try {
        const files = await fs.readdir(this.l2CacheDir)
        for (const file of files) {
          const filePath = path.join(this.l2CacheDir, file)
          try {
            const data = await fs.readFile(filePath, 'utf-8')
            const entry = JSON.parse(data)

            if (now - entry.timestamp > entry.ttl) {
              await fs.unlink(filePath)
              cleaned++
            }
          } catch {
            // 忽略损坏的文件
          }
        }
      } catch {
        // 忽略读取目录错误
      }
    }

    if (cleaned > 0) {
      this.logger.debug(`清理了 ${cleaned} 个过期缓存条目`)
    }
  }
}

/**
 * 创建多层缓存实例
 */
export function createMultilayerCache(options?: MultilayerCacheOptions): MultilayerCache {
  return new MultilayerCache(options)
}


