/**
 * 性能分析器
 * 
 * 提供火焰图、时间轴视图、内存快照等性能分析功能
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import { EventEmitter } from 'events'
import { Logger } from '../utils/logger'

/**
 * 性能事件
 */
export interface PerformanceEvent {
  id: string
  name: string
  type: 'start' | 'end'
  timestamp: number
  duration?: number
  metadata?: Record<string, any>
}

/**
 * 火焰图节点
 */
export interface FlameGraphNode {
  name: string
  value: number // 持续时间
  children: FlameGraphNode[]
  startTime: number
  endTime: number
}

/**
 * 时间轴事件
 */
export interface TimelineEvent {
  name: string
  startTime: number
  endTime: number
  duration: number
  category: 'build' | 'plugin' | 'io' | 'transform' | 'other'
  color?: string
}

/**
 * 性能快照
 */
export interface PerformanceSnapshot {
  timestamp: number
  cpu: number
  memory: {
    heapUsed: number
    heapTotal: number
    external: number
  }
  activeHandles: number
}

/**
 * 性能分析器选项
 */
export interface PerformanceProfilerOptions {
  /** 是否启用 */
  enabled?: boolean
  /** 是否生成火焰图 */
  generateFlameGraph?: boolean
  /** 是否生成时间轴 */
  generateTimeline?: boolean
  /** 采样间隔（毫秒） */
  sampleInterval?: number
  logger?: Logger
}

/**
 * 性能分析器
 */
export class PerformanceProfiler extends EventEmitter {
  private events: PerformanceEvent[] = []
  private snapshots: PerformanceSnapshot[] = []
  private activeEvents: Map<string, PerformanceEvent> = new Map()
  private options: Required<Omit<PerformanceProfilerOptions, 'logger'>> & { logger: Logger }
  private samplingTimer?: NodeJS.Timeout

  constructor(options: PerformanceProfilerOptions = {}) {
    super()

    this.options = {
      enabled: options.enabled !== false,
      generateFlameGraph: options.generateFlameGraph !== false,
      generateTimeline: options.generateTimeline !== false,
      sampleInterval: options.sampleInterval || 100,
      logger: options.logger || new Logger({ prefix: 'Profiler' })
    }
  }

  /**
   * 开始分析
   */
  start(): void {
    if (!this.options.enabled) {
      return
    }

    this.events = []
    this.snapshots = []
    this.activeEvents.clear()

    // 开始采样
    this.startSampling()

    this.options.logger.debug('性能分析器已启动')
    this.emit('started')
  }

  /**
   * 结束分析
   */
  stop(): void {
    this.stopSampling()
    this.options.logger.debug('性能分析器已停止')
    this.emit('stopped')
  }

  /**
   * 标记事件开始
   */
  markStart(name: string, metadata?: Record<string, any>): string {
    if (!this.options.enabled) {
      return ''
    }

    const id = `${name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const event: PerformanceEvent = {
      id,
      name,
      type: 'start',
      timestamp: Date.now(),
      metadata
    }

    this.events.push(event)
    this.activeEvents.set(id, event)

    return id
  }

  /**
   * 标记事件结束
   */
  markEnd(id: string, metadata?: Record<string, any>): void {
    if (!this.options.enabled) {
      return
    }

    const startEvent = this.activeEvents.get(id)
    if (!startEvent) {
      return
    }

    const endEvent: PerformanceEvent = {
      id,
      name: startEvent.name,
      type: 'end',
      timestamp: Date.now(),
      duration: Date.now() - startEvent.timestamp,
      metadata: { ...startEvent.metadata, ...metadata }
    }

    this.events.push(endEvent)
    this.activeEvents.delete(id)
  }

  /**
   * 开始采样
   */
  private startSampling(): void {
    this.samplingTimer = setInterval(() => {
      this.takeSnapshot()
    }, this.options.sampleInterval)
  }

  /**
   * 停止采样
   */
  private stopSampling(): void {
    if (this.samplingTimer) {
      clearInterval(this.samplingTimer)
      this.samplingTimer = undefined
    }
  }

  /**
   * 获取快照
   */
  private takeSnapshot(): void {
    const mem = process.memoryUsage()

    // 简化的 CPU 计算
    const cpuUsage = process.cpuUsage()
    const cpu = (cpuUsage.user + cpuUsage.system) / 1000000 // 转换为秒

    const snapshot: PerformanceSnapshot = {
      timestamp: Date.now(),
      cpu,
      memory: {
        heapUsed: mem.heapUsed,
        heapTotal: mem.heapTotal,
        external: mem.external
      },
      activeHandles: (process as any)._getActiveHandles?.().length || 0
    }

    this.snapshots.push(snapshot)

    // 限制快照数量
    if (this.snapshots.length > 1000) {
      this.snapshots.shift()
    }
  }

  /**
   * 生成火焰图
   */
  generateFlameGraph(): FlameGraphNode {
    const root: FlameGraphNode = {
      name: 'root',
      value: 0,
      children: [],
      startTime: 0,
      endTime: 0
    }

    // 构建事件树
    const eventMap = new Map<string, { start: PerformanceEvent; end?: PerformanceEvent }>()

    for (const event of this.events) {
      if (event.type === 'start') {
        eventMap.set(event.id, { start: event })
      } else {
        const existing = eventMap.get(event.id)
        if (existing) {
          existing.end = event
        }
      }
    }

    // 转换为火焰图格式
    for (const [id, { start, end }] of eventMap) {
      if (end) {
        root.children.push({
          name: start.name,
          value: end.duration || 0,
          children: [],
          startTime: start.timestamp,
          endTime: end.timestamp
        })
      }
    }

    // 计算总时间
    if (root.children.length > 0) {
      root.startTime = Math.min(...root.children.map(c => c.startTime))
      root.endTime = Math.max(...root.children.map(c => c.endTime))
      root.value = root.endTime - root.startTime
    }

    return root
  }

  /**
   * 生成时间轴
   */
  generateTimeline(): TimelineEvent[] {
    const timeline: TimelineEvent[] = []
    const eventMap = new Map<string, { start: PerformanceEvent; end?: PerformanceEvent }>()

    for (const event of this.events) {
      if (event.type === 'start') {
        eventMap.set(event.id, { start: event })
      } else {
        const existing = eventMap.get(event.id)
        if (existing) {
          existing.end = event
        }
      }
    }

    for (const [id, { start, end }] of eventMap) {
      if (end) {
        timeline.push({
          name: start.name,
          startTime: start.timestamp,
          endTime: end.timestamp,
          duration: end.duration || 0,
          category: this.categorizeEvent(start.name),
          color: this.getColorForCategory(this.categorizeEvent(start.name))
        })
      }
    }

    // 按开始时间排序
    timeline.sort((a, b) => a.startTime - b.startTime)

    return timeline
  }

  /**
   * 事件分类
   */
  private categorizeEvent(name: string): TimelineEvent['category'] {
    if (name.includes('plugin')) return 'plugin'
    if (name.includes('read') || name.includes('write') || name.includes('io')) return 'io'
    if (name.includes('transform') || name.includes('compile')) return 'transform'
    if (name.includes('build')) return 'build'
    return 'other'
  }

  /**
   * 获取类别颜色
   */
  private getColorForCategory(category: TimelineEvent['category']): string {
    const colors: Record<TimelineEvent['category'], string> = {
      build: '#667eea',
      plugin: '#10b981',
      io: '#f59e0b',
      transform: '#3b82f6',
      other: '#6b7280'
    }
    return colors[category]
  }

  /**
   * 生成性能报告
   */
  generateReport(): {
    flameGraph?: FlameGraphNode
    timeline?: TimelineEvent[]
    snapshots: PerformanceSnapshot[]
    summary: {
      totalEvents: number
      totalDuration: number
      avgCPU: number
      avgMemory: number
      peakMemory: number
    }
  } {
    const flameGraph = this.options.generateFlameGraph ? this.generateFlameGraph() : undefined
    const timeline = this.options.generateTimeline ? this.generateTimeline() : undefined

    // 计算摘要
    let totalDuration = 0
    let totalCPU = 0
    let totalMemory = 0
    let peakMemory = 0

    for (const snapshot of this.snapshots) {
      totalCPU += snapshot.cpu
      totalMemory += snapshot.memory.heapUsed
      peakMemory = Math.max(peakMemory, snapshot.memory.heapUsed)
    }

    const avgCPU = this.snapshots.length > 0 ? totalCPU / this.snapshots.length : 0
    const avgMemory = this.snapshots.length > 0 ? totalMemory / this.snapshots.length : 0

    for (const event of this.events) {
      if (event.duration) {
        totalDuration += event.duration
      }
    }

    return {
      flameGraph,
      timeline,
      snapshots: this.snapshots,
      summary: {
        totalEvents: this.events.length / 2, // start + end
        totalDuration,
        avgCPU,
        avgMemory,
        peakMemory
      }
    }
  }

  /**
   * 导出为 Chrome DevTools 格式
   */
  exportToChromeTrace(): any {
    const traceEvents = []

    for (const event of this.events) {
      traceEvents.push({
        name: event.name,
        cat: 'build',
        ph: event.type === 'start' ? 'B' : 'E',
        ts: event.timestamp * 1000, // 微秒
        pid: process.pid,
        tid: 0,
        args: event.metadata || {}
      })
    }

    return {
      traceEvents,
      displayTimeUnit: 'ms',
      otherData: {
        version: '1.0.0'
      }
    }
  }

  /**
   * 清理
   */
  dispose(): void {
    this.stop()
    this.events = []
    this.snapshots = []
    this.activeEvents.clear()
    this.removeAllListeners()
  }
}

/**
 * 创建性能分析器
 */
export function createPerformanceProfiler(options?: PerformanceProfilerOptions): PerformanceProfiler {
  return new PerformanceProfiler(options)
}


