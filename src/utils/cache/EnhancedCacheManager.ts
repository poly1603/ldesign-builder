/**
 * 增强版缓存管理器
 * 
 * 提供高性能的构建缓存系统，支持:
 * - 多级缓存 (内存 + 磁盘)
 * - LRU 缓存淘汰
 * - 缓存预热
 * - 持久化和恢复
 * - 缓存统计和监控
 * 
 * @author LDesign Team
 * @version 2.0.0
 */

import fs from 'fs-extra'
import path from 'path'
import crypto from 'crypto'
import { EventEmitter } from 'events'

// ========== 类型定义 ==========

export interface CacheEntry<T = any> {
  key: string
  value: T
  hash: string
  size: number
  createdAt: number
  accessedAt: number
  accessCount: number
  ttl?: number
  tags?: string[]
  metadata?: Record<string, any>
}

export interface CacheOptions {
  /** 缓存目录 */
  cacheDir?: string
  /** 最大内存缓存大小 (MB) */
  maxMemorySize?: number
  /** 最大磁盘缓存大小 (MB) */
  maxDiskSize?: number
  /** 默认 TTL (毫秒) */
  defaultTTL?: number
  /** 是否启用内存缓存 */
  enableMemoryCache?: boolean
  /** 是否启用磁盘缓存 */
  enableDiskCache?: boolean
  /** 是否启用压缩 */
  enableCompression?: boolean
  /** 缓存版本号 */
  version?: string
  /** 是否启用预热 */
  enableWarmup?: boolean
}

export interface CacheStats {
  memoryHits: number
  memoryMisses: number
  diskHits: number
  diskMisses: number
  totalHits: number
  totalMisses: number
  hitRate: number
  memorySize: number
  diskSize: number
  entryCount: number
  oldestEntry?: number
  newestEntry?: number
  averageAccessCount: number
}

// ========== LRU 缓存实现 ==========

class LRUCache<T> {
  private capacity: number
  private cache: Map<string, CacheEntry<T>>
  private maxSize: number
  private currentSize: number

  constructor(capacity: number, maxSizeMB: number) {
    this.capacity = capacity
    this.maxSize = maxSizeMB * 1024 * 1024
    this.currentSize = 0
    this.cache = new Map()
  }

  get(key: string): CacheEntry<T> | undefined {
    const entry = this.cache.get(key)
    if (entry) {
      // 更新访问时间和次数
      entry.accessedAt = Date.now()
      entry.accessCount++

      // 移动到最近使用位置
      this.cache.delete(key)
      this.cache.set(key, entry)
    }
    return entry
  }

  set(key: string, entry: CacheEntry<T>): boolean {
    // 检查是否已存在
    if (this.cache.has(key)) {
      const oldEntry = this.cache.get(key)!
      this.currentSize -= oldEntry.size
      this.cache.delete(key)
    }

    // 检查容量和大小限制
    while (
      (this.cache.size >= this.capacity || this.currentSize + entry.size > this.maxSize) &&
      this.cache.size > 0
    ) {
      // 淘汰最旧的条目
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        const oldEntry = this.cache.get(oldestKey)!
        this.currentSize -= oldEntry.size
        this.cache.delete(oldestKey)
      }
    }

    // 如果单个条目超过最大大小，不缓存
    if (entry.size > this.maxSize) {
      return false
    }

    this.cache.set(key, entry)
    this.currentSize += entry.size
    return true
  }

  delete(key: string): boolean {
    const entry = this.cache.get(key)
    if (entry) {
      this.currentSize -= entry.size
      this.cache.delete(key)
      return true
    }
    return false
  }

  clear(): void {
    this.cache.clear()
    this.currentSize = 0
  }

  has(key: string): boolean {
    return this.cache.has(key)
  }

  size(): number {
    return this.cache.size
  }

  getSize(): number {
    return this.currentSize
  }

  entries(): IterableIterator<[string, CacheEntry<T>]> {
    return this.cache.entries()
  }

  values(): IterableIterator<CacheEntry<T>> {
    return this.cache.values()
  }
}

// ========== 主类 ==========

/**
 * 增强版缓存管理器
 */
export class EnhancedCacheManager extends EventEmitter {
  private options: Required<CacheOptions>
  private memoryCache: LRUCache<any>
  private stats: CacheStats
  private cacheDir: string
  private indexPath: string
  private diskIndex: Map<string, { path: string; hash: string; size: number; createdAt: number }>
  private initialized: boolean = false

  constructor(options: CacheOptions = {}) {
    super()

    this.options = {
      cacheDir: options.cacheDir || path.join(process.cwd(), 'node_modules/.cache/ldesign-builder'),
      maxMemorySize: options.maxMemorySize ?? 256,
      maxDiskSize: options.maxDiskSize ?? 1024,
      defaultTTL: options.defaultTTL ?? 24 * 60 * 60 * 1000, // 24小时
      enableMemoryCache: options.enableMemoryCache ?? true,
      enableDiskCache: options.enableDiskCache ?? true,
      enableCompression: options.enableCompression ?? false,
      version: options.version ?? '1.0.0',
      enableWarmup: options.enableWarmup ?? true
    }

    this.cacheDir = this.options.cacheDir
    this.indexPath = path.join(this.cacheDir, 'cache-index.json')

    // 初始化内存缓存
    this.memoryCache = new LRUCache(1000, this.options.maxMemorySize)
    this.diskIndex = new Map()

    // 初始化统计
    this.stats = this.createInitialStats()
  }

  /**
   * 初始化缓存管理器
   */
  async initialize(): Promise<void> {
    if (this.initialized) return

    // 创建缓存目录
    if (this.options.enableDiskCache) {
      await fs.ensureDir(this.cacheDir)
      await this.loadDiskIndex()
    }

    // 预热缓存
    if (this.options.enableWarmup) {
      await this.warmup()
    }

    this.initialized = true
    this.emit('initialized')
  }

  /**
   * 获取缓存
   */
  async get<T = any>(key: string): Promise<T | undefined> {
    const cacheKey = this.normalizeKey(key)

    // 先检查内存缓存
    if (this.options.enableMemoryCache) {
      const memEntry = this.memoryCache.get(cacheKey)
      if (memEntry) {
        // 检查 TTL
        if (this.isEntryValid(memEntry)) {
          this.stats.memoryHits++
          this.stats.totalHits++
          this.updateHitRate()
          this.emit('hit', { key: cacheKey, source: 'memory' })
          return memEntry.value as T
        } else {
          // 过期，删除
          this.memoryCache.delete(cacheKey)
        }
      }
      this.stats.memoryMisses++
    }

    // 检查磁盘缓存
    if (this.options.enableDiskCache) {
      const diskEntry = await this.getDiskEntry<T>(cacheKey)
      if (diskEntry) {
        // 检查 TTL
        if (this.isEntryValid(diskEntry)) {
          // 提升到内存缓存
          if (this.options.enableMemoryCache) {
            this.memoryCache.set(cacheKey, diskEntry)
          }

          this.stats.diskHits++
          this.stats.totalHits++
          this.updateHitRate()
          this.emit('hit', { key: cacheKey, source: 'disk' })
          return diskEntry.value as T
        } else {
          // 过期，删除
          await this.deleteDiskEntry(cacheKey)
        }
      }
      this.stats.diskMisses++
    }

    this.stats.totalMisses++
    this.updateHitRate()
    this.emit('miss', { key: cacheKey })
    return undefined
  }

  /**
   * 设置缓存
   */
  async set<T = any>(
    key: string,
    value: T,
    options: { ttl?: number; tags?: string[]; metadata?: Record<string, any> } = {}
  ): Promise<boolean> {
    const cacheKey = this.normalizeKey(key)
    const serialized = JSON.stringify(value)
    const hash = this.computeHash(serialized)
    const size = Buffer.byteLength(serialized, 'utf8')

    const entry: CacheEntry<T> = {
      key: cacheKey,
      value,
      hash,
      size,
      createdAt: Date.now(),
      accessedAt: Date.now(),
      accessCount: 1,
      ttl: options.ttl ?? this.options.defaultTTL,
      tags: options.tags,
      metadata: options.metadata
    }

    let success = true

    // 写入内存缓存
    if (this.options.enableMemoryCache) {
      success = this.memoryCache.set(cacheKey, entry) && success
    }

    // 写入磁盘缓存
    if (this.options.enableDiskCache) {
      success = await this.setDiskEntry(cacheKey, entry) && success
    }

    this.emit('set', { key: cacheKey, size })
    return success
  }

  /**
   * 检查缓存是否存在
   */
  async has(key: string): Promise<boolean> {
    const cacheKey = this.normalizeKey(key)

    if (this.options.enableMemoryCache && this.memoryCache.has(cacheKey)) {
      return true
    }

    if (this.options.enableDiskCache && this.diskIndex.has(cacheKey)) {
      return true
    }

    return false
  }

  /**
   * 删除缓存
   */
  async delete(key: string): Promise<boolean> {
    const cacheKey = this.normalizeKey(key)
    let deleted = false

    if (this.options.enableMemoryCache) {
      deleted = this.memoryCache.delete(cacheKey) || deleted
    }

    if (this.options.enableDiskCache) {
      deleted = await this.deleteDiskEntry(cacheKey) || deleted
    }

    if (deleted) {
      this.emit('delete', { key: cacheKey })
    }

    return deleted
  }

  /**
   * 按标签删除缓存
   */
  async deleteByTag(tag: string): Promise<number> {
    let deletedCount = 0

    // 内存缓存
    if (this.options.enableMemoryCache) {
      for (const [key, entry] of this.memoryCache.entries()) {
        if (entry.tags?.includes(tag)) {
          this.memoryCache.delete(key)
          deletedCount++
        }
      }
    }

    // 磁盘缓存需要读取元数据
    // 这里简化处理，实际可能需要维护标签索引

    return deletedCount
  }

  /**
   * 清空所有缓存
   */
  async clear(): Promise<void> {
    this.memoryCache.clear()

    if (this.options.enableDiskCache) {
      await fs.emptyDir(this.cacheDir)
      this.diskIndex.clear()
      await this.saveDiskIndex()
    }

    this.stats = this.createInitialStats()
    this.emit('cleared')
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): CacheStats {
    const memorySize = this.memoryCache.getSize()
    let diskSize = 0

    for (const entry of this.diskIndex.values()) {
      diskSize += entry.size
    }

    return {
      ...this.stats,
      memorySize,
      diskSize,
      entryCount: this.memoryCache.size() + this.diskIndex.size
    }
  }

  /**
   * 清理过期缓存
   */
  async cleanup(): Promise<number> {
    let cleanedCount = 0
    const now = Date.now()

    // 清理内存缓存
    if (this.options.enableMemoryCache) {
      for (const [key, entry] of this.memoryCache.entries()) {
        if (!this.isEntryValid(entry)) {
          this.memoryCache.delete(key)
          cleanedCount++
        }
      }
    }

    // 清理磁盘缓存
    if (this.options.enableDiskCache) {
      for (const [key, indexEntry] of this.diskIndex.entries()) {
        const entryPath = indexEntry.path
        if (await fs.pathExists(entryPath)) {
          try {
            const content = await fs.readJson(entryPath)
            const entry = content as CacheEntry
            if (!this.isEntryValid(entry)) {
              await fs.remove(entryPath)
              this.diskIndex.delete(key)
              cleanedCount++
            }
          } catch {
            // 读取失败，删除
            await fs.remove(entryPath)
            this.diskIndex.delete(key)
            cleanedCount++
          }
        } else {
          this.diskIndex.delete(key)
        }
      }

      await this.saveDiskIndex()
    }

    this.emit('cleanup', { cleanedCount })
    return cleanedCount
  }

  /**
   * 获取或设置（如果不存在则计算并缓存）
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options: { ttl?: number; tags?: string[] } = {}
  ): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== undefined) {
      return cached
    }

    const value = await factory()
    await this.set(key, value, options)
    return value
  }

  /**
   * 批量获取
   */
  async getMany<T>(keys: string[]): Promise<Map<string, T | undefined>> {
    const results = new Map<string, T | undefined>()

    await Promise.all(
      keys.map(async (key) => {
        const value = await this.get<T>(key)
        results.set(key, value)
      })
    )

    return results
  }

  /**
   * 批量设置
   */
  async setMany<T>(
    entries: Array<{ key: string; value: T; ttl?: number; tags?: string[] }>
  ): Promise<boolean[]> {
    return Promise.all(
      entries.map(({ key, value, ttl, tags }) =>
        this.set(key, value, { ttl, tags })
      )
    )
  }

  // ========== 私有方法 ==========

  /**
   * 规范化缓存键
   */
  private normalizeKey(key: string): string {
    return `v${this.options.version}:${key}`
  }

  /**
   * 计算哈希
   */
  private computeHash(content: string): string {
    return crypto.createHash('md5').update(content).digest('hex')
  }

  /**
   * 检查条目是否有效
   */
  private isEntryValid(entry: CacheEntry): boolean {
    if (!entry.ttl) return true
    return Date.now() - entry.createdAt < entry.ttl
  }

  /**
   * 更新命中率
   */
  private updateHitRate(): void {
    const total = this.stats.totalHits + this.stats.totalMisses
    this.stats.hitRate = total > 0 ? this.stats.totalHits / total : 0
  }

  /**
   * 创建初始统计信息
   */
  private createInitialStats(): CacheStats {
    return {
      memoryHits: 0,
      memoryMisses: 0,
      diskHits: 0,
      diskMisses: 0,
      totalHits: 0,
      totalMisses: 0,
      hitRate: 0,
      memorySize: 0,
      diskSize: 0,
      entryCount: 0,
      averageAccessCount: 0
    }
  }

  /**
   * 加载磁盘索引
   */
  private async loadDiskIndex(): Promise<void> {
    try {
      if (await fs.pathExists(this.indexPath)) {
        const index = await fs.readJson(this.indexPath)
        this.diskIndex = new Map(Object.entries(index))
      }
    } catch {
      // 索引损坏，重建
      this.diskIndex = new Map()
    }
  }

  /**
   * 保存磁盘索引
   */
  private async saveDiskIndex(): Promise<void> {
    const index = Object.fromEntries(this.diskIndex)
    await fs.writeJson(this.indexPath, index, { spaces: 2 })
  }

  /**
   * 获取磁盘条目
   */
  private async getDiskEntry<T>(key: string): Promise<CacheEntry<T> | undefined> {
    const indexEntry = this.diskIndex.get(key)
    if (!indexEntry) return undefined

    try {
      const entryPath = indexEntry.path
      if (await fs.pathExists(entryPath)) {
        return await fs.readJson(entryPath)
      }
    } catch {
      // 读取失败
    }

    return undefined
  }

  /**
   * 设置磁盘条目
   */
  private async setDiskEntry<T>(key: string, entry: CacheEntry<T>): Promise<boolean> {
    try {
      const fileName = this.computeHash(key) + '.json'
      const entryPath = path.join(this.cacheDir, fileName)

      await fs.writeJson(entryPath, entry, { spaces: 0 })

      this.diskIndex.set(key, {
        path: entryPath,
        hash: entry.hash,
        size: entry.size,
        createdAt: entry.createdAt
      })

      // 定期保存索引
      if (this.diskIndex.size % 10 === 0) {
        await this.saveDiskIndex()
      }

      return true
    } catch {
      return false
    }
  }

  /**
   * 删除磁盘条目
   */
  private async deleteDiskEntry(key: string): Promise<boolean> {
    const indexEntry = this.diskIndex.get(key)
    if (!indexEntry) return false

    try {
      await fs.remove(indexEntry.path)
      this.diskIndex.delete(key)
      return true
    } catch {
      return false
    }
  }

  /**
   * 预热缓存
   */
  private async warmup(): Promise<void> {
    // 从磁盘加载最近使用的条目到内存
    if (!this.options.enableMemoryCache) return

    const entries: Array<{ key: string; entry: CacheEntry }> = []

    for (const [key, indexEntry] of this.diskIndex.entries()) {
      const entry = await this.getDiskEntry(key)
      if (entry && this.isEntryValid(entry)) {
        entries.push({ key, entry })
      }
    }

    // 按访问时间排序，最近访问的优先加载
    entries.sort((a, b) => b.entry.accessedAt - a.entry.accessedAt)

    // 只加载一部分到内存
    const warmupCount = Math.min(entries.length, 100)
    for (let i = 0; i < warmupCount; i++) {
      const { key, entry } = entries[i]
      this.memoryCache.set(key, entry)
    }

    this.emit('warmed', { count: warmupCount })
  }
}

/**
 * 创建缓存管理器实例
 */
export function createEnhancedCacheManager(options?: CacheOptions): EnhancedCacheManager {
  return new EnhancedCacheManager(options)
}

export default EnhancedCacheManager
