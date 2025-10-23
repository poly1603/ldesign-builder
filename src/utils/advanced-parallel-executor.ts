/**
 * 高级并行构建执行器
 * 
 * 提供基于依赖关系图的智能调度、关键路径优化、资源感知调度
 * 
 * @author LDesign Team
 * @version 2.0.0
 */

import { EventEmitter } from 'events'
import * as os from 'os'
import { Logger } from './logger'
import type { IncrementalBuildManager } from './incremental-build-manager'

/**
 * 任务节点
 */
export interface TaskNode<T = any> {
  id: string
  fn: () => Promise<T>
  dependencies: string[]
  priority: number
  estimatedTime: number
  resourceRequirements: {
    cpu: number      // 0-1
    memory: number   // bytes
    io: number       // 0-1
  }
}

/**
 * 任务状态
 */
export enum TaskState {
  PENDING = 'pending',
  READY = 'ready',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

/**
 * 任务执行结果
 */
export interface TaskExecutionResult<T = any> {
  id: string
  state: TaskState
  result?: T
  error?: Error
  startTime: number
  endTime: number
  duration: number
  retries: number
}

/**
 * 调度策略
 */
export type SchedulingStrategy = 'fifo' | 'priority' | 'critical-path' | 'resource-aware'

/**
 * Worker 状态
 */
interface WorkerState {
  id: number
  busy: boolean
  currentTask?: string
  tasksCompleted: number
  totalTime: number
  cpuUsage: number
  memoryUsage: number
}

/**
 * 高级并行执行器配置
 */
export interface AdvancedParallelExecutorOptions {
  maxWorkers?: number
  strategy?: SchedulingStrategy
  resourceMonitoring?: boolean
  dynamicScaling?: boolean
  cpuThreshold?: number      // 0-1
  memoryThreshold?: number   // bytes
  logger?: Logger
  incrementalManager?: IncrementalBuildManager
}

/**
 * 高级并行构建执行器
 */
export class AdvancedParallelExecutor extends EventEmitter {
  private options: Required<Omit<AdvancedParallelExecutorOptions, 'logger' | 'incrementalManager'>> & {
    logger: Logger
    incrementalManager?: IncrementalBuildManager
  }

  private tasks: Map<string, TaskNode> = new Map()
  private taskStates: Map<string, TaskState> = new Map()
  private taskResults: Map<string, TaskExecutionResult> = new Map()
  private workers: WorkerState[] = []
  private runningTasks: Set<string> = new Set()
  private completedTasks: Set<string> = new Set()
  private failedTasks: Set<string> = new Set()

  private criticalPath: string[] = []
  private taskGraph: Map<string, Set<string>> = new Map() // task -> dependents

  constructor(options: AdvancedParallelExecutorOptions = {}) {
    super()

    const cpuCount = os.cpus().length

    this.options = {
      maxWorkers: options.maxWorkers || Math.max(1, cpuCount - 1),
      strategy: options.strategy || 'critical-path',
      resourceMonitoring: options.resourceMonitoring !== false,
      dynamicScaling: options.dynamicScaling !== false,
      cpuThreshold: options.cpuThreshold || 0.8,
      memoryThreshold: options.memoryThreshold || os.totalmem() * 0.8,
      logger: options.logger || new Logger({ prefix: 'AdvancedParallel' }),
      incrementalManager: options.incrementalManager
    }

    // 初始化 workers
    for (let i = 0; i < this.options.maxWorkers; i++) {
      this.workers.push({
        id: i,
        busy: false,
        tasksCompleted: 0,
        totalTime: 0,
        cpuUsage: 0,
        memoryUsage: 0
      })
    }

    this.options.logger.debug(`初始化高级并行执行器，策略: ${this.options.strategy}，workers: ${this.options.maxWorkers}`)
  }

  /**
   * 添加任务
   */
  addTask(task: TaskNode): void {
    this.tasks.set(task.id, task)
    this.taskStates.set(task.id, TaskState.PENDING)

    // 构建反向依赖图
    for (const dep of task.dependencies) {
      if (!this.taskGraph.has(dep)) {
        this.taskGraph.set(dep, new Set())
      }
      this.taskGraph.get(dep)!.add(task.id)
    }

    this.emit('task:added', task.id)
  }

  /**
   * 批量添加任务
   */
  addTasks(tasks: TaskNode[]): void {
    tasks.forEach(task => this.addTask(task))
  }

  /**
   * 执行所有任务
   */
  async execute(): Promise<Map<string, TaskExecutionResult>> {
    this.emit('execution:start', { totalTasks: this.tasks.size })

    // 计算关键路径
    if (this.options.strategy === 'critical-path') {
      this.criticalPath = this.calculateCriticalPath()
      this.options.logger.info(`关键路径包含 ${this.criticalPath.length} 个任务`)
    }

    // 开始调度
    await this.schedule()

    this.emit('execution:complete', {
      totalTasks: this.tasks.size,
      completed: this.completedTasks.size,
      failed: this.failedTasks.size
    })

    return this.taskResults
  }

  /**
   * 智能调度
   */
  private async schedule(): Promise<void> {
    while (this.completedTasks.size + this.failedTasks.size < this.tasks.size) {
      // 检查资源是否可用
      if (this.options.resourceMonitoring && !this.hasAvailableResources()) {
        await this.wait(100)
        continue
      }

      // 获取可执行的任务
      const readyTasks = this.getReadyTasks()

      if (readyTasks.length === 0 && this.runningTasks.size === 0) {
        // 没有可执行的任务且没有运行中的任务 -> 可能有循环依赖
        this.options.logger.warn('检测到可能的循环依赖或死锁')
        break
      }

      // 按策略排序
      const sortedTasks = this.sortTasksByStrategy(readyTasks)

      // 分配任务到空闲 worker
      for (const taskId of sortedTasks) {
        const worker = this.getAvailableWorker()
        if (!worker) {
          break
        }

        this.executeTask(taskId, worker)
      }

      // 等待一些任务完成
      if (this.runningTasks.size >= this.options.maxWorkers) {
        await this.wait(50)
      }
    }

    // 等待所有任务完成
    while (this.runningTasks.size > 0) {
      await this.wait(50)
    }
  }

  /**
   * 获取就绪的任务
   */
  private getReadyTasks(): string[] {
    const ready: string[] = []

    for (const [taskId, task] of this.tasks) {
      const state = this.taskStates.get(taskId)

      if (state !== TaskState.PENDING) {
        continue
      }

      // 检查所有依赖是否完成
      const allDepsCompleted = task.dependencies.every(dep =>
        this.completedTasks.has(dep)
      )

      if (allDepsCompleted) {
        ready.push(taskId)
        this.taskStates.set(taskId, TaskState.READY)
      }
    }

    return ready
  }

  /**
   * 按策略排序任务
   */
  private sortTasksByStrategy(taskIds: string[]): string[] {
    const tasks = taskIds.map(id => this.tasks.get(id)!)

    switch (this.options.strategy) {
      case 'fifo':
        return taskIds // 保持原顺序

      case 'priority':
        return tasks
          .sort((a, b) => b.priority - a.priority)
          .map(t => t.id)

      case 'critical-path':
        return tasks
          .sort((a, b) => {
            const aOnPath = this.criticalPath.includes(a.id) ? 1 : 0
            const bOnPath = this.criticalPath.includes(b.id) ? 1 : 0

            if (aOnPath !== bOnPath) {
              return bOnPath - aOnPath
            }

            return b.estimatedTime - a.estimatedTime
          })
          .map(t => t.id)

      case 'resource-aware':
        return this.sortByResourceEfficiency(tasks).map(t => t.id)

      default:
        return taskIds
    }
  }

  /**
   * 按资源效率排序
   */
  private sortByResourceEfficiency(tasks: TaskNode[]): TaskNode[] {
    const currentCpu = this.getCurrentCPUUsage()
    const currentMem = this.getCurrentMemoryUsage()

    return tasks.sort((a, b) => {
      const aScore = this.calculateResourceScore(a, currentCpu, currentMem)
      const bScore = this.calculateResourceScore(b, currentCpu, currentMem)
      return bScore - aScore
    })
  }

  /**
   * 计算资源评分
   */
  private calculateResourceScore(task: TaskNode, currentCpu: number, currentMem: number): number {
    const cpuFit = 1 - Math.abs(task.resourceRequirements.cpu - (1 - currentCpu))
    const memFit = 1 - Math.abs(task.resourceRequirements.memory / this.options.memoryThreshold)
    const timeFactor = 1 / (task.estimatedTime + 1)

    return cpuFit * 0.4 + memFit * 0.4 + timeFactor * 0.2
  }

  /**
   * 执行单个任务
   */
  private async executeTask(taskId: string, worker: WorkerState): Promise<void> {
    const task = this.tasks.get(taskId)!

    worker.busy = true
    worker.currentTask = taskId
    this.runningTasks.add(taskId)
    this.taskStates.set(taskId, TaskState.RUNNING)

    const startTime = Date.now()
    this.emit('task:start', { taskId, workerId: worker.id })

    try {
      const result = await task.fn()
      const endTime = Date.now()
      const duration = endTime - startTime

      const execResult: TaskExecutionResult = {
        id: taskId,
        state: TaskState.COMPLETED,
        result,
        startTime,
        endTime,
        duration,
        retries: 0
      }

      this.taskResults.set(taskId, execResult)
      this.completedTasks.add(taskId)
      this.taskStates.set(taskId, TaskState.COMPLETED)

      worker.tasksCompleted++
      worker.totalTime += duration

      this.emit('task:complete', execResult)

      // 触发依赖任务
      this.triggerDependentTasks(taskId)

    } catch (error) {
      const endTime = Date.now()
      const duration = endTime - startTime

      const execResult: TaskExecutionResult = {
        id: taskId,
        state: TaskState.FAILED,
        error: error as Error,
        startTime,
        endTime,
        duration,
        retries: 0
      }

      this.taskResults.set(taskId, execResult)
      this.failedTasks.add(taskId)
      this.taskStates.set(taskId, TaskState.FAILED)

      this.emit('task:failed', execResult)

    } finally {
      worker.busy = false
      worker.currentTask = undefined
      this.runningTasks.delete(taskId)
    }
  }

  /**
   * 触发依赖任务
   */
  private triggerDependentTasks(taskId: string): void {
    const dependents = this.taskGraph.get(taskId)
    if (dependents) {
      for (const dependent of dependents) {
        this.emit('task:ready-check', dependent)
      }
    }
  }

  /**
   * 计算关键路径
   */
  private calculateCriticalPath(): string[] {
    const longestPath: string[] = []
    let maxTime = 0

    const calculatePath = (taskId: string, path: string[], time: number) => {
      const task = this.tasks.get(taskId)
      if (!task) {
        return
      }

      const newTime = time + task.estimatedTime
      const newPath = [...path, taskId]

      if (newTime > maxTime) {
        maxTime = newTime
        longestPath.length = 0
        longestPath.push(...newPath)
      }

      const dependents = this.taskGraph.get(taskId)
      if (dependents) {
        for (const dependent of dependents) {
          if (!newPath.includes(dependent)) {
            calculatePath(dependent, newPath, newTime)
          }
        }
      }
    }

    // 从根任务开始
    for (const [taskId, task] of this.tasks) {
      if (task.dependencies.length === 0) {
        calculatePath(taskId, [], 0)
      }
    }

    return longestPath
  }

  /**
   * 获取可用的 worker
   */
  private getAvailableWorker(): WorkerState | null {
    return this.workers.find(w => !w.busy) || null
  }

  /**
   * 检查资源是否可用
   */
  private hasAvailableResources(): boolean {
    const currentCpu = this.getCurrentCPUUsage()
    const currentMem = this.getCurrentMemoryUsage()

    return (
      currentCpu < this.options.cpuThreshold &&
      currentMem < this.options.memoryThreshold
    )
  }

  /**
   * 获取当前 CPU 使用率
   */
  private getCurrentCPUUsage(): number {
    const cpus = os.cpus()
    let totalIdle = 0
    let totalTick = 0

    for (const cpu of cpus) {
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times]
      }
      totalIdle += cpu.times.idle
    }

    const idle = totalIdle / cpus.length
    const total = totalTick / cpus.length

    return 1 - (idle / total)
  }

  /**
   * 获取当前内存使用
   */
  private getCurrentMemoryUsage(): number {
    const mem = process.memoryUsage()
    return mem.heapUsed
  }

  /**
   * 等待
   */
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 获取执行统计
   */
  getStats(): {
    totalTasks: number
    completed: number
    failed: number
    running: number
    pending: number
    avgDuration: number
    workerStats: WorkerState[]
    criticalPathLength: number
  } {
    let totalDuration = 0
    for (const result of this.taskResults.values()) {
      if (result.state === TaskState.COMPLETED) {
        totalDuration += result.duration
      }
    }

    const completedCount = this.completedTasks.size
    const avgDuration = completedCount > 0 ? totalDuration / completedCount : 0

    return {
      totalTasks: this.tasks.size,
      completed: this.completedTasks.size,
      failed: this.failedTasks.size,
      running: this.runningTasks.size,
      pending: this.tasks.size - this.completedTasks.size - this.failedTasks.size - this.runningTasks.size,
      avgDuration,
      workerStats: [...this.workers],
      criticalPathLength: this.criticalPath.length
    }
  }

  /**
   * 清理
   */
  dispose(): void {
    this.tasks.clear()
    this.taskStates.clear()
    this.taskResults.clear()
    this.runningTasks.clear()
    this.completedTasks.clear()
    this.failedTasks.clear()
    this.taskGraph.clear()
    this.removeAllListeners()
  }
}

/**
 * 创建高级并行执行器
 */
export function createAdvancedParallelExecutor(
  options?: AdvancedParallelExecutorOptions
): AdvancedParallelExecutor {
  return new AdvancedParallelExecutor(options)
}


