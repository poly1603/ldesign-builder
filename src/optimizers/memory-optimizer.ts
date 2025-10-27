/**
 * 内存优化器
 * 使用流式处理和内存管理策略优化构建内存占用
 */

import * as fs from 'fs'
import * as stream from 'stream'
import { promisify } from 'util'
import { Logger } from '../utils/logger'

const pipeline = promisify(stream.pipeline)

export interface MemoryOptimizerOptions {
  /** 最大内存使用量（MB） */
  maxMemory?: number
  /** 并发处理数限制 */
  concurrencyLimit?: number
  /** 启用垃圾回收 */
  enableGC?: boolean
  /** 缓存大小限制（MB） */
  cacheSize?: number
  /** 日志 */
  logger?: Logger
}

export class MemoryOptimizer {
  private options: Required<MemoryOptimizerOptions>
  private logger: Logger
  private cache = new Map<string, WeakRef<any>>()
  private memoryUsage = {
    peak: 0,
    current: 0
  }

  constructor(options: MemoryOptimizerOptions = {}) {
    this.options = {
      maxMemory: 512,
      concurrencyLimit: 4,
      enableGC: true,
      cacheSize: 100,
      ...options
    }
    this.logger = options.logger || new Logger()

    // 监控内存使用
    this.startMemoryMonitoring()
  }

  /**
   * 流式处理大文件
   */
  async processLargeFile(
    inputPath: string,
    outputPath: string,
    transform: stream.Transform
  ): Promise<void> {
    const readStream = fs.createReadStream(inputPath, {
      highWaterMark: 64 * 1024 // 64KB chunks
    })

    const writeStream = fs.createWriteStream(outputPath, {
      highWaterMark: 64 * 1024
    })

    await pipeline(readStream, transform, writeStream)

    // 主动释放内存
    this.tryGC()
  }

  /**
   * 批量处理文件（限制并发）
   */
  async processConcurrent<T>(
    items: T[],
    processor: (item: T) => Promise<void>,
    limit?: number
  ): Promise<void> {
    const concurrency = limit || this.options.concurrencyLimit
    const results: Promise<void>[] = []
    const executing: Promise<void>[] = []

    for (const item of items) {
      const promise = processor(item).then(() => {
        // 处理完成后尝试释放内存
        if (this.shouldGC()) {
          this.tryGC()
        }
      })

      results.push(promise)

      if (items.length >= concurrency) {
        executing.push(promise)

        if (executing.length >= concurrency) {
          await Promise.race(executing)
          executing.splice(executing.findIndex(p => p === promise), 1)
        }
      }
    }

    await Promise.all(results)
  }

  /**
   * 创建转换流
   */
  createTransformStream(
    transformFn: (chunk: string) => string
  ): stream.Transform {
    return new stream.Transform({
      transform(chunk, encoding, callback) {
        try {
          const input = chunk.toString()
          const output = transformFn(input)
          callback(null, output)
        } catch (error) {
          callback(error as Error)
        }
      }
    })
  }

  /**
   * 智能缓存管理
   */
  getOrCache<T>(key: string, factory: () => T): T {
    const cached = this.cache.get(key)
    if (cached) {
      const value = cached.deref()
      if (value !== undefined) {
        return value
      }
    }

    const value = factory()

    // 检查缓存大小
    if (this.getCacheSize() > this.options.cacheSize * 1024 * 1024) {
      this.cleanCache()
    }

    this.cache.set(key, new WeakRef(value))
    return value
  }

  /**
   * 清理缓存
   */
  private cleanCache(): void {
    const entries = Array.from(this.cache.entries())
    let cleaned = 0

    for (const [key, ref] of entries) {
      if (ref.deref() === undefined) {
        this.cache.delete(key)
        cleaned++
      }
    }

    if (cleaned > 0) {
      this.logger.debug(`清理了 ${cleaned} 个无效缓存项`)
    }

    // 如果还是太大，清理一半
    if (this.cache.size > 1000) {
      const toDelete = Math.floor(this.cache.size / 2)
      const keys = Array.from(this.cache.keys())
      for (let i = 0; i < toDelete; i++) {
        this.cache.delete(keys[i])
      }
    }
  }

  /**
   * 获取缓存大小（估算）
   */
  private getCacheSize(): number {
    // 简单估算，每个缓存项按 1KB 计算
    return this.cache.size * 1024
  }

  /**
   * 监控内存使用
   */
  private startMemoryMonitoring(): void {
    setInterval(() => {
      const usage = process.memoryUsage()
      this.memoryUsage.current = usage.heapUsed / 1024 / 1024

      if (this.memoryUsage.current > this.memoryUsage.peak) {
        this.memoryUsage.peak = this.memoryUsage.current
      }

      // 内存过高警告
      if (this.memoryUsage.current > this.options.maxMemory) {
        this.logger.warn(`内存使用过高: ${this.memoryUsage.current.toFixed(2)}MB / ${this.options.maxMemory}MB`)
        this.tryGC()
      }
    }, 5000) // 每 5 秒检查一次
  }

  /**
   * 判断是否需要 GC
   */
  private shouldGC(): boolean {
    return this.memoryUsage.current > this.options.maxMemory * 0.8
  }

  /**
   * 尝试触发垃圾回收
   */
  private tryGC(): void {
    if (this.options.enableGC && global.gc) {
      global.gc()
      this.logger.debug('触发垃圾回收')
    }
  }

  /**
   * 获取内存统计
   */
  getMemoryStats() {
    const usage = process.memoryUsage()
    return {
      current: Math.round(usage.heapUsed / 1024 / 1024),
      peak: Math.round(this.memoryUsage.peak),
      total: Math.round(usage.heapTotal / 1024 / 1024),
      external: Math.round(usage.external / 1024 / 1024),
      cacheSize: this.cache.size
    }
  }

  /**
   * 清理所有资源
   */
  dispose(): void {
    this.cache.clear()
    this.tryGC()
  }
}

/**
 * Promise 池
 */
export class PromisePool<T> {
  private concurrency: number
  private running = 0
  private queue: Array<() => Promise<T>> = []

  constructor(concurrency: number) {
    this.concurrency = concurrency
  }

  async process(
    items: T[],
    processor: (item: T) => Promise<any>
  ): Promise<void> {
    const promises = items.map(item => this.add(() => processor(item)))
    await Promise.all(promises)
  }

  private async add(task: () => Promise<T>): Promise<T> {
    if (this.running >= this.concurrency) {
      await new Promise(resolve => this.queue.push(resolve as any))
    }

    this.running++

    try {
      return await task()
    } finally {
      this.running--

      if (this.queue.length > 0) {
        const next = this.queue.shift()
        next?.()
      }
    }
  }
}

// 导出工厂函数
export function createMemoryOptimizer(options?: MemoryOptimizerOptions): MemoryOptimizer {
  return new MemoryOptimizer(options)
}
