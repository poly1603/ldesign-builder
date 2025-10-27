/**
 * 性能监控和分析工具
 * 
 * 提供构建性能监控、分析和报告功能
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import { performance as perfHooks } from 'perf_hooks'
import { Logger } from './logger'

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  /** 开始时间 */
  startTime: number
  /** 结束时间 */
  endTime?: number
  /** 持续时间（毫秒） */
  duration?: number
  /** 内存使用（字节） */
  memoryUsage?: {
    rss: number
    heapTotal: number
    heapUsed: number
    external: number
  }
  /** CPU 使用率 */
  cpuUsage?: {
    user: number
    system: number
  }
}

/**
 * 性能监控器
 */
export class PerformanceMonitor {
  private logger: Logger
  private marks: Map<string, number>
  private measures: Map<string, PerformanceMetrics>

  constructor() {
    this.logger = new Logger({ prefix: 'PerformanceMonitor' })
    this.marks = new Map()
    this.measures = new Map()
  }

  /**
   * 标记开始时间
   */
  mark(name: string): void {
    const time = perfHooks.now()
    this.marks.set(name, time)
    this.logger.debug(`Performance mark: ${name}`)
  }

  /**
   * 测量时间间隔
   */
  measure(name: string, startMark: string, endMark?: string): PerformanceMetrics {
    const startTime = this.marks.get(startMark)
    if (!startTime) {
      throw new Error(`Start mark "${startMark}" not found`)
    }

    const endTime = endMark ? this.marks.get(endMark) : perfHooks.now()
    if (endMark && !endTime) {
      throw new Error(`End mark "${endMark}" not found`)
    }

    const duration = (endTime || perfHooks.now()) - startTime
    const metrics: PerformanceMetrics = {
      startTime,
      endTime: endTime || perfHooks.now(),
      duration,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    }

    this.measures.set(name, metrics)
    this.logger.debug(`Performance measure: ${name} = ${duration.toFixed(2)}ms`)

    return metrics
  }

  /**
   * 获取指标
   */
  getMetrics(name: string): PerformanceMetrics | undefined {
    return this.measures.get(name)
  }

  /**
   * 获取所有指标
   */
  getAllMetrics(): Map<string, PerformanceMetrics> {
    return new Map(this.measures)
  }

  /**
   * 清除标记和测量
   */
  clear(): void {
    this.marks.clear()
    this.measures.clear()
  }

  /**
   * 生成性能报告
   */
  generateReport(): string {
    const lines: string[] = ['Performance Report', '='.repeat(50)]

    for (const [name, metrics] of this.measures) {
      lines.push(`\n${name}:`)
      lines.push(`  Duration: ${metrics.duration?.toFixed(2)}ms`)

      if (metrics.memoryUsage) {
        lines.push(`  Memory:`)
        lines.push(`    RSS: ${(metrics.memoryUsage.rss / 1024 / 1024).toFixed(2)}MB`)
        lines.push(`    Heap Used: ${(metrics.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`)
      }
    }

    return lines.join('\n')
  }
}

/**
 * 全局性能监控器实例
 */
export const globalPerformanceMonitor = new PerformanceMonitor()

/**
 * 性能装饰器
 */
export function measurePerformance(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value

  descriptor.value = async function (...args: any[]) {
    const monitor = new PerformanceMonitor()
    monitor.mark('start')

    try {
      const result = await originalMethod.apply(this, args)
      monitor.measure(`${target.constructor.name}.${propertyKey}`, 'start')
      return result
    } catch (error) {
      monitor.measure(`${target.constructor.name}.${propertyKey}`, 'start')
      throw error
    }
  }

  return descriptor
}

/**
 * 性能工具函数
 */
export const performanceUtils = {
  /**
   * 格式化持续时间
   */
  formatDuration(ms: number): string {
    if (ms < 1000) {
      return `${ms.toFixed(0)}ms`
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(2)}s`
    } else {
      return `${(ms / 60000).toFixed(2)}m`
    }
  },

  /**
   * 格式化内存大小
   */
  formatMemory(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`
  },

  /**
   * 计算平均值
   */
  calculateAverage(values: number[]): number {
    if (values.length === 0) return 0
    return values.reduce((sum, val) => sum + val, 0) / values.length
  },

  /**
   * 计算中位数
   */
  calculateMedian(values: number[]): number {
    if (values.length === 0) return 0
    const sorted = [...values].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)

    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2
    } else {
      return sorted[mid]
    }
  }
}

// 导出默认实例
export default globalPerformanceMonitor
