/**
 * 增强版并行处理器
 * 
 * 提供高性能的并行构建处理，支持:
 * - 智能任务调度
 * - 动态负载均衡
 * - 内存感知调度
 * - 任务依赖管理
 * - 错误恢复机制
 * 
 * @author LDesign Team
 * @version 2.0.0
 */

import { EventEmitter } from 'events'
import os from 'os'
import { performance } from 'perf_hooks'

// ========== 类型定义 ==========

export interface Task<T = any, R = any> {
  id: string
  data: T
  priority?: number
  dependencies?: string[]
  timeout?: number
  retries?: number
  group?: string
}

export interface TaskResult<R = any> {
  id: string
  success: boolean
  result?: R
  error?: Error
  duration: number
  retryCount: number
  workerId?: number
}

export interface ProcessorOptions {
  /** 最大并发数 */
  maxConcurrency?: number
  /** 内存使用阈值 (MB) */
  memoryThreshold?: number
  /** 启用内存感知调度 */
  memoryAware?: boolean
  /** 任务超时时间 (ms) */
  defaultTimeout?: number
  /** 默认重试次数 */
  defaultRetries?: number
  /** 启用任务优先级 */
  enablePriority?: boolean
  /** 批处理大小 */
  batchSize?: number
  /** 任务间隔 (ms) */
  taskDelay?: number
}

export interface ProcessorStats {
  totalTasks: number
  completedTasks: number
  failedTasks: number
  averageDuration: number
  totalDuration: number
  memoryPeak: number
  retryCount: number
  concurrencyPeak: number
}

type TaskExecutor<T, R> = (data: T, context: ExecutionContext) => Promise<R>

export interface ExecutionContext {
  taskId: string
  workerId: number
  attempt: number
  startTime: number
  signal: AbortSignal
}

// ========== 内部类型 ==========

interface InternalTask<T, R> extends Task<T, R> {
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  retryCount: number
  startTime?: number
  endTime?: number
  workerId?: number
  abortController?: AbortController
}

interface WorkerState {
  id: number
  busy: boolean
  currentTask?: string
  completedCount: number
  failedCount: number
}

// ========== 主类 ==========

/**
 * 增强版并行处理器
 */
export class EnhancedParallelProcessor<T = any, R = any> extends EventEmitter {
  private options: Required<ProcessorOptions>
  private tasks: Map<string, InternalTask<T, R>> = new Map()
  private taskQueue: string[] = []
  private workers: WorkerState[] = []
  private executor: TaskExecutor<T, R> | null = null
  private running: boolean = false
  private stats: ProcessorStats
  private memoryCheckInterval: NodeJS.Timeout | null = null
  private dependencyGraph: Map<string, Set<string>> = new Map()
  private reverseDependencyGraph: Map<string, Set<string>> = new Map()

  constructor(options: ProcessorOptions = {}) {
    super()

    // 默认并发数为 CPU 核心数的 75%
    const defaultConcurrency = Math.max(1, Math.floor(os.cpus().length * 0.75))

    this.options = {
      maxConcurrency: options.maxConcurrency ?? defaultConcurrency,
      memoryThreshold: options.memoryThreshold ?? 1024,
      memoryAware: options.memoryAware ?? true,
      defaultTimeout: options.defaultTimeout ?? 60000,
      defaultRetries: options.defaultRetries ?? 2,
      enablePriority: options.enablePriority ?? true,
      batchSize: options.batchSize ?? 10,
      taskDelay: options.taskDelay ?? 0
    }

    this.stats = this.createInitialStats()
    this.initializeWorkers()
  }

  // ========== 公共方法 ==========

  /**
   * 设置任务执行器
   */
  setExecutor(executor: TaskExecutor<T, R>): this {
    this.executor = executor
    return this
  }

  /**
   * 添加单个任务
   */
  addTask(task: Task<T, R>): this {
    const internalTask: InternalTask<T, R> = {
      ...task,
      status: 'pending',
      retryCount: 0,
      priority: task.priority ?? 0,
      timeout: task.timeout ?? this.options.defaultTimeout,
      retries: task.retries ?? this.options.defaultRetries
    }

    this.tasks.set(task.id, internalTask)

    // 构建依赖图
    if (task.dependencies && task.dependencies.length > 0) {
      this.dependencyGraph.set(task.id, new Set(task.dependencies))

      for (const dep of task.dependencies) {
        if (!this.reverseDependencyGraph.has(dep)) {
          this.reverseDependencyGraph.set(dep, new Set())
        }
        this.reverseDependencyGraph.get(dep)!.add(task.id)
      }
    }

    this.stats.totalTasks++
    return this
  }

  /**
   * 批量添加任务
   */
  addTasks(tasks: Task<T, R>[]): this {
    for (const task of tasks) {
      this.addTask(task)
    }
    return this
  }

  /**
   * 执行所有任务
   */
  async execute(): Promise<TaskResult<R>[]> {
    if (!this.executor) {
      throw new Error('任务执行器未设置，请先调用 setExecutor()')
    }

    if (this.tasks.size === 0) {
      return []
    }

    this.running = true
    const startTime = performance.now()

    // 启动内存监控
    if (this.options.memoryAware) {
      this.startMemoryMonitoring()
    }

    try {
      this.emit('start', { totalTasks: this.tasks.size })

      // 初始化队列
      this.initializeQueue()

      // 处理任务
      const results = await this.processQueue()

      // 计算统计信息
      this.stats.totalDuration = performance.now() - startTime
      this.stats.averageDuration = this.stats.totalDuration / this.stats.completedTasks || 0

      this.emit('complete', { stats: this.stats, results })

      return results

    } finally {
      this.running = false
      this.stopMemoryMonitoring()
    }
  }

  /**
   * 取消所有任务
   */
  cancel(): void {
    this.running = false

    for (const [, task] of this.tasks) {
      if (task.status === 'running' && task.abortController) {
        task.abortController.abort()
        task.status = 'cancelled'
      } else if (task.status === 'pending') {
        task.status = 'cancelled'
      }
    }

    this.emit('cancelled')
  }

  /**
   * 获取统计信息
   */
  getStats(): ProcessorStats {
    return { ...this.stats }
  }

  /**
   * 获取当前状态
   */
  getStatus(): {
    running: boolean
    pending: number
    running_tasks: number
    completed: number
    failed: number
  } {
    let pending = 0
    let running_tasks = 0
    let completed = 0
    let failed = 0

    for (const [, task] of this.tasks) {
      switch (task.status) {
        case 'pending': pending++; break
        case 'running': running_tasks++; break
        case 'completed': completed++; break
        case 'failed': failed++; break
      }
    }

    return { running: this.running, pending, running_tasks, completed, failed }
  }

  /**
   * 动态调整并发数
   */
  setConcurrency(concurrency: number): void {
    this.options.maxConcurrency = Math.max(1, concurrency)

    // 如果正在运行，可能需要启动更多 worker
    if (this.running) {
      this.fillWorkerSlots()
    }
  }

  // ========== 私有方法 ==========

  /**
   * 初始化 worker 状态
   */
  private initializeWorkers(): void {
    this.workers = []
    for (let i = 0; i < this.options.maxConcurrency; i++) {
      this.workers.push({
        id: i,
        busy: false,
        completedCount: 0,
        failedCount: 0
      })
    }
  }

  /**
   * 创建初始统计信息
   */
  private createInitialStats(): ProcessorStats {
    return {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      averageDuration: 0,
      totalDuration: 0,
      memoryPeak: 0,
      retryCount: 0,
      concurrencyPeak: 0
    }
  }

  /**
   * 初始化任务队列
   */
  private initializeQueue(): void {
    this.taskQueue = []

    // 找出所有没有依赖或依赖已满足的任务
    for (const [id, task] of this.tasks) {
      if (task.status === 'pending' && this.areDependenciesSatisfied(id)) {
        this.taskQueue.push(id)
      }
    }

    // 按优先级排序
    if (this.options.enablePriority) {
      this.sortQueueByPriority()
    }
  }

  /**
   * 检查任务依赖是否已满足
   */
  private areDependenciesSatisfied(taskId: string): boolean {
    const deps = this.dependencyGraph.get(taskId)
    if (!deps || deps.size === 0) return true

    for (const depId of deps) {
      const depTask = this.tasks.get(depId)
      if (!depTask || depTask.status !== 'completed') {
        return false
      }
    }

    return true
  }

  /**
   * 按优先级排序队列
   */
  private sortQueueByPriority(): void {
    this.taskQueue.sort((a, b) => {
      const taskA = this.tasks.get(a)!
      const taskB = this.tasks.get(b)!
      return (taskB.priority || 0) - (taskA.priority || 0)
    })
  }

  /**
   * 处理任务队列
   */
  private async processQueue(): Promise<TaskResult<R>[]> {
    const results: TaskResult<R>[] = []
    const runningPromises: Map<string, Promise<void>> = new Map()

    return new Promise((resolve) => {
      const checkCompletion = () => {
        // 检查是否所有任务都已完成
        const allDone = Array.from(this.tasks.values()).every(
          t => t.status === 'completed' || t.status === 'failed' || t.status === 'cancelled'
        )

        if (allDone || !this.running) {
          resolve(results)
          return true
        }

        return false
      }

      const scheduleNext = async () => {
        if (!this.running || checkCompletion()) return

        // 填充 worker 槽位
        while (this.taskQueue.length > 0 && this.getAvailableWorkerCount() > 0) {
          // 内存检查
          if (this.options.memoryAware && this.isMemoryPressure()) {
            this.emit('memoryPressure', {
              current: process.memoryUsage().heapUsed / 1024 / 1024,
              threshold: this.options.memoryThreshold
            })
            break
          }

          const taskId = this.taskQueue.shift()!
          const task = this.tasks.get(taskId)!
          const worker = this.getAvailableWorker()!

          // 启动任务
          const promise = this.executeTask(task, worker)
            .then(result => {
              results.push(result)
              runningPromises.delete(taskId)

              // 解锁依赖此任务的其他任务
              if (result.success) {
                this.unlockDependentTasks(taskId)
              }

              // 调度下一个
              scheduleNext()
            })

          runningPromises.set(taskId, promise)

          // 任务间隔
          if (this.options.taskDelay > 0) {
            await this.delay(this.options.taskDelay)
          }
        }

        // 更新并发峰值
        const currentConcurrency = runningPromises.size
        if (currentConcurrency > this.stats.concurrencyPeak) {
          this.stats.concurrencyPeak = currentConcurrency
        }
      }

      // 开始调度
      scheduleNext()
    })
  }

  /**
   * 执行单个任务
   */
  private async executeTask(task: InternalTask<T, R>, worker: WorkerState): Promise<TaskResult<R>> {
    const startTime = performance.now()

    task.status = 'running'
    task.startTime = startTime
    task.workerId = worker.id
    task.abortController = new AbortController()

    worker.busy = true
    worker.currentTask = task.id

    this.emit('taskStart', { taskId: task.id, workerId: worker.id })

    const context: ExecutionContext = {
      taskId: task.id,
      workerId: worker.id,
      attempt: task.retryCount + 1,
      startTime,
      signal: task.abortController.signal
    }

    try {
      // 创建超时 Promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`任务超时 (${task.timeout}ms)`)), task.timeout)
      })

      // 执行任务
      const result = await Promise.race([
        this.executor!(task.data, context),
        timeoutPromise
      ])

      // 成功
      const duration = performance.now() - startTime
      task.status = 'completed'
      task.endTime = performance.now()

      worker.busy = false
      worker.currentTask = undefined
      worker.completedCount++

      this.stats.completedTasks++

      this.emit('taskComplete', { taskId: task.id, duration, result })

      return {
        id: task.id,
        success: true,
        result,
        duration,
        retryCount: task.retryCount,
        workerId: worker.id
      }

    } catch (error) {
      const duration = performance.now() - startTime

      // 检查是否可以重试
      if (task.retryCount < (task.retries || 0)) {
        task.retryCount++
        task.status = 'pending'
        this.stats.retryCount++

        worker.busy = false
        worker.currentTask = undefined

        // 重新加入队列
        this.taskQueue.unshift(task.id)

        this.emit('taskRetry', { taskId: task.id, attempt: task.retryCount, error })

        // 返回一个"假"结果，实际会重试
        return this.executeTask(task, this.getAvailableWorker() || worker)
      }

      // 最终失败
      task.status = 'failed'
      task.endTime = performance.now()

      worker.busy = false
      worker.currentTask = undefined
      worker.failedCount++

      this.stats.failedTasks++

      this.emit('taskFailed', { taskId: task.id, error, retryCount: task.retryCount })

      return {
        id: task.id,
        success: false,
        error: error as Error,
        duration,
        retryCount: task.retryCount,
        workerId: worker.id
      }
    }
  }

  /**
   * 解锁依赖任务
   */
  private unlockDependentTasks(completedTaskId: string): void {
    const dependents = this.reverseDependencyGraph.get(completedTaskId)
    if (!dependents) return

    for (const dependentId of dependents) {
      const task = this.tasks.get(dependentId)
      if (task && task.status === 'pending' && this.areDependenciesSatisfied(dependentId)) {
        this.taskQueue.push(dependentId)
      }
    }

    // 重新排序
    if (this.options.enablePriority) {
      this.sortQueueByPriority()
    }
  }

  /**
   * 获取可用 worker 数量
   */
  private getAvailableWorkerCount(): number {
    return this.workers.filter(w => !w.busy).length
  }

  /**
   * 获取可用 worker
   */
  private getAvailableWorker(): WorkerState | undefined {
    return this.workers.find(w => !w.busy)
  }

  /**
   * 填充 worker 槽位
   */
  private fillWorkerSlots(): void {
    // 如果当前 worker 数量少于最大并发数，添加新 worker
    while (this.workers.length < this.options.maxConcurrency) {
      this.workers.push({
        id: this.workers.length,
        busy: false,
        completedCount: 0,
        failedCount: 0
      })
    }
  }

  /**
   * 检查内存压力
   */
  private isMemoryPressure(): boolean {
    const used = process.memoryUsage().heapUsed / 1024 / 1024
    return used > this.options.memoryThreshold
  }

  /**
   * 启动内存监控
   */
  private startMemoryMonitoring(): void {
    this.memoryCheckInterval = setInterval(() => {
      const used = process.memoryUsage().heapUsed / 1024 / 1024
      if (used > this.stats.memoryPeak) {
        this.stats.memoryPeak = used
      }

      // 如果内存压力过大，尝试触发 GC
      if (used > this.options.memoryThreshold * 0.9 && global.gc) {
        global.gc()
      }
    }, 1000)
  }

  /**
   * 停止内存监控
   */
  private stopMemoryMonitoring(): void {
    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval)
      this.memoryCheckInterval = null
    }
  }

  /**
   * 延迟
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

/**
 * 创建并行处理器实例
 */
export function createEnhancedParallelProcessor<T = any, R = any>(
  options?: ProcessorOptions
): EnhancedParallelProcessor<T, R> {
  return new EnhancedParallelProcessor<T, R>(options)
}

/**
 * 便捷的并行执行函数
 */
export async function parallelExecute<T, R>(
  tasks: Array<{ id: string; data: T }>,
  executor: (data: T, context: ExecutionContext) => Promise<R>,
  options?: ProcessorOptions
): Promise<TaskResult<R>[]> {
  const processor = new EnhancedParallelProcessor<T, R>(options)
  processor.setExecutor(executor)
  processor.addTasks(tasks)
  return processor.execute()
}

export default EnhancedParallelProcessor
