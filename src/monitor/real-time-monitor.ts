/**
 * 实时构建监控器
 * 
 * 提供 WebSocket 实时推送、多阶段进度条、预估剩余时间
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import { EventEmitter } from 'events'
import { Logger } from '../utils/logger'
import type { PerformanceMetrics } from '../types/performance'

/**
 * 构建阶段
 */
export enum BuildPhase {
  INITIALIZING = 'initializing',
  ANALYZING = 'analyzing',
  TRANSFORMING = 'transforming',
  BUNDLING = 'bundling',
  OPTIMIZING = 'optimizing',
  WRITING = 'writing',
  COMPLETE = 'complete',
  ERROR = 'error'
}

/**
 * 进度信息
 */
export interface ProgressInfo {
  phase: BuildPhase
  current: number
  total: number
  percentage: number
  message: string
  estimatedTimeRemaining?: number
}

/**
 * 监控数据
 */
export interface MonitorData {
  buildId: string
  startTime: number
  currentPhase: BuildPhase
  progress: ProgressInfo
  performance: Partial<PerformanceMetrics>
  errors: Array<{ message: string; timestamp: number }>
  warnings: Array<{ message: string; timestamp: number }>
}

/**
 * 实时监控器选项
 */
export interface RealTimeMonitorOptions {
  /** 是否启用 */
  enabled?: boolean

  /** WebSocket 端口 */
  port?: number

  /** 更新间隔（毫秒） */
  updateInterval?: number

  /** 是否启用 Web 仪表板 */
  enableDashboard?: boolean

  logger?: Logger
}

/**
 * 实时构建监控器
 */
export class RealTimeMonitor extends EventEmitter {
  private options: Required<Omit<RealTimeMonitorOptions, 'logger'>> & { logger: Logger }
  private currentBuildId?: string
  private monitorData?: MonitorData
  private server?: any
  private clients: Set<any> = new Set()
  private updateTimer?: NodeJS.Timeout
  private phaseStartTimes: Map<BuildPhase, number> = new Map()
  private phaseHistory: Array<{ phase: BuildPhase; duration: number }> = []

  constructor(options: RealTimeMonitorOptions = {}) {
    super()

    this.options = {
      enabled: options.enabled !== false,
      port: options.port || 3031,
      updateInterval: options.updateInterval || 100,
      enableDashboard: options.enableDashboard !== false,
      logger: options.logger || new Logger({ prefix: 'Monitor' })
    }
  }

  /**
   * 启动监控
   */
  async start(buildId: string): Promise<void> {
    if (!this.options.enabled) {
      return
    }

    this.currentBuildId = buildId
    this.monitorData = {
      buildId,
      startTime: Date.now(),
      currentPhase: BuildPhase.INITIALIZING,
      progress: {
        phase: BuildPhase.INITIALIZING,
        current: 0,
        total: 100,
        percentage: 0,
        message: '正在初始化...'
      },
      performance: {},
      errors: [],
      warnings: []
    }

    // 启动 WebSocket 服务器
    if (this.options.enableDashboard) {
      await this.startWebSocketServer()
    }

    // 启动定期更新
    this.startPeriodicUpdates()

    this.options.logger.debug(`实时监控已启动: ${buildId}`)
    this.emit('started', buildId)
  }

  /**
   * 停止监控
   */
  stop(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer)
      this.updateTimer = undefined
    }

    if (this.server) {
      this.server.close()
      this.server = undefined
    }

    this.clients.clear()
    this.options.logger.debug('实时监控已停止')
    this.emit('stopped')
  }

  /**
   * 更新阶段
   */
  updatePhase(phase: BuildPhase, message?: string): void {
    if (!this.monitorData) {
      return
    }

    // 记录上一个阶段的耗时
    if (this.monitorData.currentPhase !== phase) {
      const prevPhase = this.monitorData.currentPhase
      const prevStartTime = this.phaseStartTimes.get(prevPhase)

      if (prevStartTime) {
        const duration = Date.now() - prevStartTime
        this.phaseHistory.push({ phase: prevPhase, duration })
      }

      this.phaseStartTimes.set(phase, Date.now())
    }

    this.monitorData.currentPhase = phase
    this.monitorData.progress.phase = phase
    this.monitorData.progress.message = message || this.getPhaseMessage(phase)

    this.broadcast()
    this.emit('phase:change', { phase, message })
  }

  /**
   * 更新进度
   */
  updateProgress(current: number, total: number, message?: string): void {
    if (!this.monitorData) {
      return
    }

    this.monitorData.progress.current = current
    this.monitorData.progress.total = total
    this.monitorData.progress.percentage = total > 0 ? (current / total) * 100 : 0

    if (message) {
      this.monitorData.progress.message = message
    }

    // 预估剩余时间
    this.monitorData.progress.estimatedTimeRemaining = this.estimateTimeRemaining()

    this.broadcast()
    this.emit('progress:update', this.monitorData.progress)
  }

  /**
   * 添加错误
   */
  addError(message: string): void {
    if (!this.monitorData) {
      return
    }

    this.monitorData.errors.push({
      message,
      timestamp: Date.now()
    })

    this.broadcast()
    this.emit('error', message)
  }

  /**
   * 添加警告
   */
  addWarning(message: string): void {
    if (!this.monitorData) {
      return
    }

    this.monitorData.warnings.push({
      message,
      timestamp: Date.now()
    })

    this.broadcast()
    this.emit('warning', message)
  }

  /**
   * 更新性能指标
   */
  updatePerformance(metrics: Partial<PerformanceMetrics>): void {
    if (!this.monitorData) {
      return
    }

    this.monitorData.performance = {
      ...this.monitorData.performance,
      ...metrics
    }

    this.broadcast()
  }

  /**
   * 启动 WebSocket 服务器
   */
  private async startWebSocketServer(): Promise<void> {
    try {
      const { WebSocketServer } = require('ws')

      this.server = new WebSocketServer({ port: this.options.port })

      this.server.on('connection', (ws: any) => {
        this.clients.add(ws)

        // 发送当前状态
        if (this.monitorData) {
          ws.send(JSON.stringify({
            type: 'init',
            data: this.monitorData
          }))
        }

        ws.on('close', () => {
          this.clients.delete(ws)
        })
      })

      this.options.logger.info(`实时监控服务器启动在 ws://localhost:${this.options.port}`)
      this.options.logger.info(`仪表板地址: http://localhost:${this.options.port}`)
    } catch (error) {
      this.options.logger.warn('WebSocket 服务器启动失败:', error)
    }
  }

  /**
   * 广播更新
   */
  private broadcast(): void {
    if (!this.monitorData || this.clients.size === 0) {
      return
    }

    const message = JSON.stringify({
      type: 'update',
      data: this.monitorData
    })

    for (const client of this.clients) {
      try {
        client.send(message)
      } catch (error) {
        this.clients.delete(client)
      }
    }
  }

  /**
   * 启动定期更新
   */
  private startPeriodicUpdates(): void {
    this.updateTimer = setInterval(() => {
      if (this.monitorData) {
        const mem = process.memoryUsage()
        this.updatePerformance({
          memoryUsage: {
            heapUsed: mem.heapUsed,
            heapTotal: mem.heapTotal,
            external: mem.external,
            rss: mem.rss,
            peak: mem.heapUsed,
            trend: []
          }
        } as any)
      }
    }, this.options.updateInterval)
  }

  /**
   * 预估剩余时间
   */
  private estimateTimeRemaining(): number {
    if (!this.monitorData || this.phaseHistory.length === 0) {
      return 0
    }

    // 基于历史阶段耗时估算
    const avgPhaseTime = this.phaseHistory.reduce((sum, p) => sum + p.duration, 0) / this.phaseHistory.length
    const remainingPhases = this.getRemainingPhases(this.monitorData.currentPhase)

    return remainingPhases * avgPhaseTime
  }

  /**
   * 获取剩余阶段数
   */
  private getRemainingPhases(currentPhase: BuildPhase): number {
    const phases = [
      BuildPhase.INITIALIZING,
      BuildPhase.ANALYZING,
      BuildPhase.TRANSFORMING,
      BuildPhase.BUNDLING,
      BuildPhase.OPTIMIZING,
      BuildPhase.WRITING,
      BuildPhase.COMPLETE
    ]

    const currentIndex = phases.indexOf(currentPhase)
    return currentIndex >= 0 ? phases.length - currentIndex - 1 : 0
  }

  /**
   * 获取阶段消息
   */
  private getPhaseMessage(phase: BuildPhase): string {
    const messages: Record<BuildPhase, string> = {
      [BuildPhase.INITIALIZING]: '正在初始化构建环境...',
      [BuildPhase.ANALYZING]: '正在分析项目结构...',
      [BuildPhase.TRANSFORMING]: '正在转换源代码...',
      [BuildPhase.BUNDLING]: '正在打包模块...',
      [BuildPhase.OPTIMIZING]: '正在优化输出...',
      [BuildPhase.WRITING]: '正在写入文件...',
      [BuildPhase.COMPLETE]: '构建完成！',
      [BuildPhase.ERROR]: '构建失败'
    }

    return messages[phase] || '处理中...'
  }

  /**
   * 获取当前数据
   */
  getData(): MonitorData | undefined {
    return this.monitorData
  }
}

/**
 * 创建实时监控器
 */
export function createRealTimeMonitor(options?: RealTimeMonitorOptions): RealTimeMonitor {
  return new RealTimeMonitor(options)
}


