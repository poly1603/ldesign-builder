/**
 * Worker 线程池
 * 
 * 提供高效的 Worker 线程管理和任务调度
 * 
 * 特性:
 * - Worker 线程复用
 * - 任务队列管理
 * - 自动负载均衡
 * - 错误处理和重试
 * - 资源清理
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import { Worker } from 'worker_threads'
import { EventEmitter } from 'events'
import os from 'os'
import path from 'path'
import { Logger } from './logger'

/**
 * Worker 池配置
 */
export interface WorkerPoolOptions {
  /** Worker 脚本路径 */
  workerScript: string
  /** 最大 Worker 数量 */
  maxWorkers?: number
  /** 任务超时时间 (毫秒) */
  taskTimeout?: number
  /** 是否启用自动重启 */
  autoRestart?: boolean
  /** Logger 实例 */
  logger?: Logger
  /** 内存阈值 (MB)，超过后触发清理 */
  memoryThreshold?: number
  /** 内存检查间隔 (毫秒) */
  memoryCheckInterval?: number
}

/**
 * 队列中的任务
 */
interface QueuedTask<T = any, R = any> {
  id: string
  method: string
  data: T
  resolve: (value: R) => void
  reject: (error: Error) => void
  timeout?: NodeJS.Timeout
  retries: number
  maxRetries: number
}

/**
 * Worker 状态
 */
interface WorkerState {
  worker: Worker
  busy: boolean
  tasksCompleted: number
  lastTaskTime: number
}

/**
 * Worker 池统计信息
 */
export interface WorkerPoolStats {
  totalWorkers: number
  busyWorkers: number
  idleWorkers: number
  queuedTasks: number
  completedTasks: number
  failedTasks: number
  averageTaskTime: number
  memoryUsage: {
    heapUsed: number
    heapTotal: number
    external: number
    rss: number
  }
}

/**
 * Worker 线程池
 */
export class WorkerPool extends EventEmitter {
  private workerScript: string
  private maxWorkers: number
  private taskTimeout: number
  private autoRestart: boolean
  private logger: Logger
  private memoryThreshold: number
  private memoryCheckInterval: number

  private workers: WorkerState[] = []
  private taskQueue: QueuedTask[] = []
  private completedTasks: number = 0
  private failedTasks: number = 0
  private totalTaskTime: number = 0
  private taskIdCounter: number = 0
  private memoryCheckTimer?: NodeJS.Timeout

  private disposed: boolean = false

  constructor(options: WorkerPoolOptions) {
    super()

    this.workerScript = options.workerScript
    this.maxWorkers = options.maxWorkers || Math.max(1, os.cpus().length - 1)
    this.taskTimeout = options.taskTimeout || 300000 // 5 分钟
    this.autoRestart = options.autoRestart !== false
    this.logger = options.logger || new Logger({ prefix: 'WorkerPool' })
    this.memoryThreshold = (options.memoryThreshold || 512) * 1024 * 1024 // 默认 512MB
    this.memoryCheckInterval = options.memoryCheckInterval || 30000 // 默认 30秒

    this.logger.info(`初始化 Worker 池: ${this.maxWorkers} 个 Worker`)

    // 创建 Worker
    this.initializeWorkers()
    
    // 启动内存监控
    this.startMemoryMonitoring()
  }

  /**
   * 初始化 Workers
   */
  private initializeWorkers(): void {
    for (let i = 0; i < this.maxWorkers; i++) {
      this.createWorker()
    }
  }

  /**
   * 创建单个 Worker
   */
  private createWorker(): WorkerState {
    const worker = new Worker(this.workerScript)
    const state: WorkerState = {
      worker,
      busy: false,
      tasksCompleted: 0,
      lastTaskTime: 0
    }

    // 监听 Worker 错误
    worker.on('error', (error) => {
      this.logger.error('Worker 错误:', error)
      this.emit('worker:error', { worker, error })

      // 如果启用自动重启,重新创建 Worker
      if (this.autoRestart && !this.disposed) {
        this.logger.info('重启 Worker...')
        this.replaceWorker(state)
      }
    })

    // 监听 Worker 退出
    worker.on('exit', (code) => {
      if (code !== 0 && !this.disposed) {
        this.logger.warn(`Worker 异常退出,代码: ${code}`)
        
        if (this.autoRestart) {
          this.logger.info('重启 Worker...')
          this.replaceWorker(state)
        }
      }
    })

    this.workers.push(state)
    this.emit('worker:created', { worker })

    return state
  }

  /**
   * 替换 Worker
   */
  private replaceWorker(oldState: WorkerState): void {
    const index = this.workers.indexOf(oldState)
    if (index !== -1) {
      // 终止旧 Worker
      oldState.worker.terminate().catch(() => {})
      
      // 创建新 Worker
      const newState = this.createWorker()
      this.workers[index] = newState

      // 如果有排队的任务,分配给新 Worker
      this.processQueue()
    }
  }

  /**
   * 执行任务
   */
  async exec<T = any, R = any>(method: string, data: T, options: { maxRetries?: number } = {}): Promise<R> {
    if (this.disposed) {
      throw new Error('Worker 池已被释放')
    }

    return new Promise((resolve, reject) => {
      const taskId = `task-${++this.taskIdCounter}`
      const task: QueuedTask<T, R> = {
        id: taskId,
        method,
        data,
        resolve,
        reject,
        retries: 0,
        maxRetries: options.maxRetries || 0
      }

      // 尝试立即执行
      const availableWorker = this.getAvailableWorker()
      if (availableWorker) {
        this.runTask(availableWorker, task)
      } else {
        // 加入队列
        this.taskQueue.push(task)
        this.emit('task:queued', { taskId, queueLength: this.taskQueue.length })
      }
    })
  }

  /**
   * 获取可用的 Worker
   */
  private getAvailableWorker(): WorkerState | null {
    return this.workers.find(w => !w.busy) || null
  }

  /**
   * 运行任务
   */
  private runTask<T, R>(workerState: WorkerState, task: QueuedTask<T, R>): void {
    workerState.busy = true
    const startTime = Date.now()

    this.emit('task:start', { taskId: task.id, method: task.method })

    // 设置超时
    task.timeout = setTimeout(() => {
      this.handleTaskTimeout(workerState, task)
    }, this.taskTimeout)

    // 消息处理器
    const messageHandler = (result: any) => {
      this.handleTaskComplete(workerState, task, result, startTime)
    }

    // 错误处理器
    const errorHandler = (error: Error) => {
      this.handleTaskError(workerState, task, error, startTime)
    }

    // 监听消息和错误
    workerState.worker.once('message', messageHandler)
    workerState.worker.once('error', errorHandler)

    // 发送任务到 Worker
    workerState.worker.postMessage({
      id: task.id,
      method: task.method,
      data: task.data
    })
  }

  /**
   * 处理任务完成
   */
  private handleTaskComplete<T, R>(
    workerState: WorkerState,
    task: QueuedTask<T, R>,
    result: any,
    startTime: number
  ): void {
    // 清理超时
    if (task.timeout) {
      clearTimeout(task.timeout)
    }

    const duration = Date.now() - startTime
    workerState.busy = false
    workerState.tasksCompleted++
    workerState.lastTaskTime = duration

    this.completedTasks++
    this.totalTaskTime += duration

    this.emit('task:complete', {
      taskId: task.id,
      method: task.method,
      duration
    })

    // 解析结果
    if (result.error) {
      task.reject(new Error(result.error))
    } else {
      task.resolve(result.data)
    }

    // 处理下一个任务
    this.processQueue()
  }

  /**
   * 处理任务错误
   */
  private handleTaskError<T, R>(
    workerState: WorkerState,
    task: QueuedTask<T, R>,
    error: Error,
    startTime: number
  ): void {
    // 清理超时
    if (task.timeout) {
      clearTimeout(task.timeout)
    }

    const duration = Date.now() - startTime
    workerState.busy = false

    this.emit('task:error', {
      taskId: task.id,
      method: task.method,
      error: error.message,
      duration
    })

    // 重试逻辑
    if (task.retries < task.maxRetries) {
      task.retries++
      this.logger.warn(`任务 ${task.id} 失败,重试 ${task.retries}/${task.maxRetries}`)
      this.taskQueue.unshift(task) // 重新加入队列头部
      this.processQueue()
    } else {
      this.failedTasks++
      task.reject(error)
      this.processQueue()
    }
  }

  /**
   * 处理任务超时
   */
  private handleTaskTimeout<T, R>(workerState: WorkerState, task: QueuedTask<T, R>): void {
    this.logger.error(`任务 ${task.id} 超时 (${this.taskTimeout}ms)`)
    
    workerState.busy = false
    this.failedTasks++

    this.emit('task:timeout', {
      taskId: task.id,
      method: task.method,
      timeout: this.taskTimeout
    })

    task.reject(new Error(`任务超时: ${task.method}`))

    // 如果启用自动重启,重启 Worker
    if (this.autoRestart) {
      this.replaceWorker(workerState)
    }

    // 处理下一个任务
    this.processQueue()
  }

  /**
   * 处理队列
   */
  private processQueue(): void {
    while (this.taskQueue.length > 0) {
      const availableWorker = this.getAvailableWorker()
      if (!availableWorker) {
        break
      }

      const task = this.taskQueue.shift()
      if (task) {
        this.runTask(availableWorker, task)
      }
    }
  }

  /**
   * 启动内存监控
   */
  private startMemoryMonitoring(): void {
    this.memoryCheckTimer = setInterval(() => {
      if (this.disposed) {
        return
      }

      const memUsage = process.memoryUsage()
      const heapUsedMB = memUsage.heapUsed / 1024 / 1024

      if (memUsage.heapUsed > this.memoryThreshold) {
        this.logger.warn(
          `内存使用超过阈值: ${heapUsedMB.toFixed(2)}MB / ${(this.memoryThreshold / 1024 / 1024).toFixed(2)}MB`
        )
        this.emit('memory:warning', { memoryUsage: memUsage })
        
        // 触发垂圾回收
        if (global.gc) {
          this.logger.info('触发手动 GC...')
          global.gc()
        }
      }
    }, this.memoryCheckInterval)
  }

  /**
   * 获取统计信息
   */
  getStats(): WorkerPoolStats {
    const busyWorkers = this.workers.filter(w => w.busy).length
    const idleWorkers = this.workers.length - busyWorkers
    const memUsage = process.memoryUsage()

    return {
      totalWorkers: this.workers.length,
      busyWorkers,
      idleWorkers,
      queuedTasks: this.taskQueue.length,
      completedTasks: this.completedTasks,
      failedTasks: this.failedTasks,
      averageTaskTime: this.completedTasks > 0 ? this.totalTaskTime / this.completedTasks : 0,
      memoryUsage: {
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external,
        rss: memUsage.rss
      }
    }
  }

  /**
   * 终止所有 Workers
   */
  async terminate(): Promise<void> {
    if (this.disposed) {
      return
    }

    this.disposed = true
    this.logger.info('终止 Worker 池...')

    // 停止内存监控
    if (this.memoryCheckTimer) {
      clearInterval(this.memoryCheckTimer)
      this.memoryCheckTimer = undefined
    }

    // 清空队列
    for (const task of this.taskQueue) {
      if (task.timeout) {
        clearTimeout(task.timeout)
      }
      task.reject(new Error('Worker 池已终止'))
    }
    this.taskQueue = []

    // 终止所有 Workers
    await Promise.all(
      this.workers.map(async (state) => {
        try {
          await state.worker.terminate()
        } catch (error) {
          this.logger.error('终止 Worker 失败:', error)
        }
      })
    )

    this.workers = []
    this.emit('pool:terminated')
    this.logger.info('Worker 池已终止')
  }
}

/**
 * 创建 Worker 池
 */
export function createWorkerPool(options: WorkerPoolOptions): WorkerPool {
  return new WorkerPool(options)
}

