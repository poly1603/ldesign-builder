/**
 * 多层缓存系统
 * 
 * L1 (内存缓存) -> L2 (磁盘缓存) -> L3 (远程缓存,可选)
 * 
 * 特性:
 * - 三层缓存架构
 * - LRU 驱逐策略
 * - 内存感知
 * - 自动提升/降级
 * - 统计信息
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import { createHash } from 'crypto'
import path from 'path'
import fs from 'fs-extra'

/**
 * 缓存层级
 */
export enum CacheLevel {
  L1 = 'L1', // 内存缓存
  L2 = 'L2', // 磁盘缓存
  L3 = 'L3'  // 远程缓存
}

/**
 * 缓存条目
 */
interface CacheEntry<T> {
  key: string
  value: T
  size: number
  createdAt: number
  lastAccess: number
  accessCount: number
  level: CacheLevel
}

/**
 * 缓存统计
 */
export interface CacheStats {
  l1: {
    size: number
    memory: number
    maxSize: number
    maxMemory: number
    hits: number
    misses: number
    hitRate: number
  }
  l2: {
    size: number
    diskUsage: number
    maxSize: number
    hits: number
    misses: number
    hitRate: number
  }
  l3?: {
    hits: number
    misses: number
    hitRate: number
  }
  total: {
    hits: number
    misses: number
    hitRate: number
  }
}

/**
 * 多层缓存配置
 */
export interface MultiLevelCacheOptions {
  /** L1 缓存最大条目数 */
  l1MaxSize?: number
  /** L1 缓存最大内存 (字节) */
  l1MaxMemory?: number
  /** L2 缓存目录 */
  l2CacheDir?: string
  /** L2 缓存最大磁盘空间 (字节) */
  l2MaxSize?: number
  /** L3 远程缓存配置 (可选) */
  l3Config?: {
    enabled: boolean
    endpoint?: string
    apiKey?: string
  }
  /** 缓存 TTL (毫秒) */
  ttl?: number
  /** 是否启用自动提升 */
  autoPromote?: boolean
}

/**
 * L1 内存缓存 (LRU)
 */
class L1MemoryCache<T = any> {
  private cache: Map<string, CacheEntry<T>> = new Map()
  private maxSize: number
  private maxMemory: number
  private currentMemory: number = 0
  private hits: number = 0
  private misses: number = 0

  constructor(maxSize: number, maxMemory: number) {
    this.maxSize = maxSize
    this.maxMemory = maxMemory
  }

  get(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) {
      this.misses++
      return null
    }

    // 更新访问信息
    entry.lastAccess = Date.now()
    entry.accessCount++
    this.hits++

    return entry.value
  }

  set(key: string, value: T): void {
    const size = this.calculateSize(value)

    // LRU 驱逐
    while (
      (this.cache.size >= this.maxSize ||
       this.currentMemory + size > this.maxMemory) &&
      this.cache.size > 0
    ) {
      this.evictLRU()
    }

    const entry: CacheEntry<T> = {
      key,
      value,
      size,
      createdAt: Date.now(),
      lastAccess: Date.now(),
      accessCount: 0,
      level: CacheLevel.L1
    }

    this.cache.set(key, entry)
    this.currentMemory += size
  }

  has(key: string): boolean {
    return this.cache.has(key)
  }

  delete(key: string): boolean {
    const entry = this.cache.get(key)
    if (entry) {
      this.currentMemory -= entry.size
      return this.cache.delete(key)
    }
    return false
  }

  clear(): void {
    this.cache.clear()
    this.currentMemory = 0
  }

  getStats() {
    return {
      size: this.cache.size,
      memory: this.currentMemory,
      maxSize: this.maxSize,
      maxMemory: this.maxMemory,
      hits: this.hits,
      misses: this.misses,
      hitRate: this.hits + this.misses > 0 ? this.hits / (this.hits + this.misses) : 0
    }
  }

  private evictLRU(): void {
    let lruKey: string | undefined
    let lruScore = -Infinity // 修复：应该找最大分数（最不常用）

    for (const [key, entry] of this.cache) {
      // LRU 分数 = 距离上次访问的时间 / (访问次数 + 1)
      // 分数越高，表示越应该被驱逐
      const timeSinceAccess = Date.now() - entry.lastAccess
      const score = timeSinceAccess / (entry.accessCount + 1)

      if (score > lruScore) { // 修复：找最大分数
        lruScore = score
        lruKey = key
      }
    }

    if (lruKey) {
      this.delete(lruKey)
    }
  }

  private calculateSize(value: T): number {
    try {
      return JSON.stringify(value).length
    } catch {
      return 1024 // 默认 1KB
    }
  }
}

/**
 * L2 磁盘缓存
 */
class L2DiskCache<T = any> {
  private cacheDir: string
  private maxSize: number
  private currentSize: number = 0
  private hits: number = 0
  private misses: number = 0
  private initialized: boolean = false

  constructor(cacheDir: string, maxSize: number) {
    this.cacheDir = cacheDir
    this.maxSize = maxSize
  }

  private async ensureCacheDir(): Promise<void> {
    if (!this.initialized) {
      await fs.ensureDir(this.cacheDir)
      await this.calculateCurrentSize()
      this.initialized = true
    }
  }

  private getCachePath(key: string): string {
    const hash = createHash('sha256').update(key).digest('hex')
    return path.join(this.cacheDir, `${hash}.json`)
  }

  async get(key: string): Promise<T | null> {
    await this.ensureCacheDir()

    const cachePath = this.getCachePath(key)
    
    try {
      if (await fs.pathExists(cachePath)) {
        const data = await fs.readFile(cachePath, 'utf-8')
        const entry: CacheEntry<T> = JSON.parse(data)
        
        // 优化：仅更新访问时间（异步，不阻塞读取）
        entry.lastAccess = Date.now()
        entry.accessCount++
        // 异步更新，不等待完成
        fs.utimes(cachePath, new Date(), new Date()).catch(() => {})
        
        this.hits++
        return entry.value
      }
    } catch (error) {
      console.error(`[L2Cache] 读取缓存失败: ${key}`, error)
    }

    this.misses++
    return null
  }

  async set(key: string, value: T): Promise<void> {
    await this.ensureCacheDir()

    const cachePath = this.getCachePath(key)
    const entry: CacheEntry<T> = {
      key,
      value,
      size: 0,
      createdAt: Date.now(),
      lastAccess: Date.now(),
      accessCount: 0,
      level: CacheLevel.L2
    }

    const data = JSON.stringify(entry)
    entry.size = Buffer.byteLength(data, 'utf-8')

    // 检查是否需要驱逐
    while (this.currentSize + entry.size > this.maxSize && this.currentSize > 0) {
      await this.evictLRU()
    }

    await fs.writeFile(cachePath, data)
    this.currentSize += entry.size
  }

  async has(key: string): Promise<boolean> {
    await this.ensureCacheDir()
    const cachePath = this.getCachePath(key)
    return await fs.pathExists(cachePath)
  }

  async delete(key: string): Promise<boolean> {
    await this.ensureCacheDir()
    const cachePath = this.getCachePath(key)
    
    try {
      if (await fs.pathExists(cachePath)) {
        const stats = await fs.stat(cachePath)
        await fs.remove(cachePath)
        this.currentSize -= stats.size
        return true
      }
    } catch (error) {
      console.error(`[L2Cache] 删除缓存失败: ${key}`, error)
    }
    
    return false
  }

  async clear(): Promise<void> {
    await this.ensureCacheDir()
    await fs.emptyDir(this.cacheDir)
    this.currentSize = 0
  }

  getStats() {
    return {
      size: 0, // 需要遍历文件系统才能获取准确数量
      diskUsage: this.currentSize,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: this.hits + this.misses > 0 ? this.hits / (this.hits + this.misses) : 0
    }
  }

  private async calculateCurrentSize(): Promise<void> {
    try {
      const files = await fs.readdir(this.cacheDir)
      let totalSize = 0
      
      for (const file of files) {
        const filePath = path.join(this.cacheDir, file)
        const stats = await fs.stat(filePath)
        totalSize += stats.size
      }
      
      this.currentSize = totalSize
    } catch (error) {
      this.currentSize = 0
    }
  }

  private async evictLRU(): Promise<void> {
    try {
      const files = await fs.readdir(this.cacheDir)
      
      const fileStats = await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(this.cacheDir, file)
          const stats = await fs.stat(filePath)
          return { file, atime: stats.atime, size: stats.size }
        })
      )

      // 按访问时间排序
      fileStats.sort((a, b) => a.atime.getTime() - b.atime.getTime())

      // 删除最旧的文件
      if (fileStats.length > 0) {
        const oldest = fileStats[0]
        const filePath = path.join(this.cacheDir, oldest.file)
        await fs.remove(filePath)
        this.currentSize -= oldest.size
      }
    } catch (error) {
      console.error('[L2Cache] LRU 驱逐失败:', error)
    }
  }
}

/**
 * 多层缓存系统
 */
export class MultiLevelCache<T = any> {
  private l1Cache: L1MemoryCache<T>
  private l2Cache: L2DiskCache<T>
  private options: Required<Omit<MultiLevelCacheOptions, 'l3Config'>>
  private ttl: number

  constructor(options: MultiLevelCacheOptions = {}) {
    const defaultCacheDir = path.join(process.cwd(), 'node_modules', '.cache', '@ldesign', 'builder', 'multilevel')
    
    this.options = {
      l1MaxSize: options.l1MaxSize || 100,
      l1MaxMemory: options.l1MaxMemory || 100 * 1024 * 1024, // 100MB
      l2CacheDir: options.l2CacheDir || defaultCacheDir,
      l2MaxSize: options.l2MaxSize || 1024 * 1024 * 1024, // 1GB
      ttl: options.ttl || 24 * 60 * 60 * 1000, // 24小时
      autoPromote: options.autoPromote !== false
    }

    this.ttl = this.options.ttl
    this.l1Cache = new L1MemoryCache<T>(this.options.l1MaxSize, this.options.l1MaxMemory)
    this.l2Cache = new L2DiskCache<T>(this.options.l2CacheDir, this.options.l2MaxSize)
  }

  /**
   * 获取缓存 - 从 L1 -> L2 依次查找
   */
  async get(key: string): Promise<T | null> {
    // 1. 尝试 L1 缓存
    const l1Value = this.l1Cache.get(key)
    if (l1Value !== null) {
      return l1Value
    }

    // 2. 尝试 L2 缓存
    const l2Value = await this.l2Cache.get(key)
    if (l2Value !== null) {
      // 自动提升到 L1 (不触发 L1 的 miss 计数)
      if (this.options.autoPromote) {
        // 直接设置,不增加 miss 计数
        this.l1Cache.set(key, l2Value)
      }
      return l2Value
    }

    return null
  }

  /**
   * 设置缓存 - 同时写入 L1 和 L2
   */
  async set(key: string, value: T): Promise<void> {
    // 写入 L1
    this.l1Cache.set(key, value)
    
    // 异步写入 L2 (不阻塞)
    this.l2Cache.set(key, value).catch(error => {
      console.error('[MultiLevelCache] L2 写入失败:', error)
    })
  }

  /**
   * 检查缓存是否存在
   */
  async has(key: string): Promise<boolean> {
    return this.l1Cache.has(key) || await this.l2Cache.has(key)
  }

  /**
   * 删除缓存
   */
  async delete(key: string): Promise<boolean> {
    const l1Deleted = this.l1Cache.delete(key)
    const l2Deleted = await this.l2Cache.delete(key)
    return l1Deleted || l2Deleted
  }

  /**
   * 清空所有缓存
   */
  async clear(): Promise<void> {
    this.l1Cache.clear()
    await this.l2Cache.clear()
  }

  /**
   * 获取统计信息
   */
  getStats(): CacheStats {
    const l1Stats = this.l1Cache.getStats()
    const l2Stats = this.l2Cache.getStats()

    // 从用户角度看:
    // - 总命中 = L1 命中 + L2 命中
    // - 总未命中 = L1 未命中 - L2 命中 (因为 L2 命中也算是成功)
    const totalHits = l1Stats.hits + l2Stats.hits
    const totalMisses = l1Stats.misses - l2Stats.hits

    return {
      l1: l1Stats,
      l2: l2Stats,
      total: {
        hits: totalHits,
        misses: totalMisses,
        hitRate: totalHits + totalMisses > 0 ? totalHits / (totalHits + totalMisses) : 0
      }
    }
  }
}

/**
 * 创建多层缓存实例
 */
export function createMultiLevelCache<T = any>(options?: MultiLevelCacheOptions): MultiLevelCache<T> {
  return new MultiLevelCache<T>(options)
}

