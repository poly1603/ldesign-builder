/**
 * 并行构建管理器
 * 
 * 使用 Worker 池并行执行构建任务
 * 
 * 特性:
 * - Worker 线程池管理
 * - 并行构建多个输出格式
 * - 智能任务调度
 * - 性能监控
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import os from 'os'
import path from 'path'
import { WorkerPool, type WorkerPoolOptions } from './WorkerPool'
import { Logger } from './logger'
import type { BuilderConfig } from '../types/config'
import type { BuildResult } from '../types/builder'

/**
 * 并行构建配置
 */
export interface ParallelBuildOptions {
  /** 最大 Worker 数量 */
  maxWorkers?: number
  /** 任务超时时间 (毫秒) */
  taskTimeout?: number
  /** 是否启用 Worker 池 */
  enableWorkerPool?: boolean
  /** Logger 实例 */
  logger?: Logger
}

/**
 * 构建任务
 */
export interface BuildTask {
  id: string
  format: string
  config: BuilderConfig
  priority: number
}

/**
 * 并行构建结果
 */
export interface ParallelBuildResult {
  format: string
  result: BuildResult
  duration: number
  worker?: number
}

/**
 * 并行构建管理器
 */
export class ParallelBuildManager {
  private workerPool?: WorkerPool
  private logger: Logger
  private maxWorkers: number
  private taskTimeout: number
  private enableWorkerPool: boolean

  private completedTasks: number = 0
  private failedTasks: number = 0
  private totalBuildTime: number = 0

  constructor(options: ParallelBuildOptions = {}) {
    this.logger = options.logger || new Logger({ prefix: 'ParallelBuild' })
    this.maxWorkers = options.maxWorkers || Math.max(1, os.cpus().length - 1)
    this.taskTimeout = options.taskTimeout || 300000 // 5 分钟
    this.enableWorkerPool = options.enableWorkerPool !== false

    // 初始化 Worker 池
    if (this.enableWorkerPool) {
      this.initializeWorkerPool()
    }
  }

  /**
   * 初始化 Worker 池
   */
  private initializeWorkerPool(): void {
    const workerScript = path.join(__dirname, '../workers/build-worker.js')
    
    const poolOptions: WorkerPoolOptions = {
      workerScript,
      maxWorkers: this.maxWorkers,
      taskTimeout: this.taskTimeout,
      autoRestart: true,
      logger: this.logger
    }

    this.workerPool = new WorkerPool(poolOptions)

    // 监听 Worker 池事件
    this.workerPool.on('task:complete', (event) => {
      this.logger.debug(`任务完成: ${event.taskId} (${event.duration}ms)`)
    })

    this.workerPool.on('task:error', (event) => {
      this.logger.error(`任务失败: ${event.taskId} - ${event.error}`)
    })

    this.workerPool.on('worker:error', (event) => {
      this.logger.error('Worker 错误:', event.error)
    })

    this.logger.info(`Worker 池已初始化: ${this.maxWorkers} 个 Worker`)
  }

  /**
   * 并行构建多个格式
   */
  async buildParallel(
    tasks: BuildTask[],
    builderFn: (config: BuilderConfig) => Promise<BuildResult>
  ): Promise<ParallelBuildResult[]> {
    if (tasks.length === 0) {
      return []
    }

    this.logger.info(`开始并行构建 ${tasks.length} 个格式...`)
    const startTime = Date.now()

    // 按优先级排序
    const sortedTasks = [...tasks].sort((a, b) => b.priority - a.priority)

    let results: ParallelBuildResult[]

    if (this.enableWorkerPool && this.workerPool && tasks.length > 1) {
      // 使用 Worker 池并行构建
      results = await this.buildWithWorkerPool(sortedTasks, builderFn)
    } else {
      // 使用 Promise.all 并行构建 (不使用 Worker)
      results = await this.buildWithPromiseAll(sortedTasks, builderFn)
    }

    const duration = Date.now() - startTime
    this.totalBuildTime += duration

    this.logger.success(`并行构建完成: ${tasks.length} 个格式,耗时 ${duration}ms`)

    return results
  }

  /**
   * 使用 Worker 池构建
   */
  private async buildWithWorkerPool(
    tasks: BuildTask[],
    builderFn: (config: BuilderConfig) => Promise<BuildResult>
  ): Promise<ParallelBuildResult[]> {
    if (!this.workerPool) {
      throw new Error('Worker 池未初始化')
    }

    this.logger.info('使用 Worker 池并行构建...')

    // 分批执行,避免过多并发
    const batchSize = this.maxWorkers
    const results: ParallelBuildResult[] = []

    for (let i = 0; i < tasks.length; i += batchSize) {
      const batch = tasks.slice(i, i + batchSize)
      this.logger.debug(`执行批次 ${Math.floor(i / batchSize) + 1}/${Math.ceil(tasks.length / batchSize)} (${batch.length} 个任务)`)

      // 并行执行当前批次
      const batchResults = await Promise.all(
        batch.map(task => this.executeTaskWithWorker(task, builderFn))
      )

      results.push(...batchResults)
    }

    return results
  }

  /**
   * 使用 Promise.all 构建
   */
  private async buildWithPromiseAll(
    tasks: BuildTask[],
    builderFn: (config: BuilderConfig) => Promise<BuildResult>
  ): Promise<ParallelBuildResult[]> {
    this.logger.info('使用 Promise.all 并行构建...')

    const results = await Promise.all(
      tasks.map(task => this.executeTaskInMainThread(task, builderFn))
    )

    return results
  }

  /**
   * 在 Worker 中执行任务
   */
  private async executeTaskWithWorker(
    task: BuildTask,
    builderFn: (config: BuilderConfig) => Promise<BuildResult>
  ): Promise<ParallelBuildResult> {
    const startTime = Date.now()

    try {
      // 注意: 目前 Worker 实现还不完整,先使用主线程
      // TODO: 实现完整的 Worker 序列化和反序列化
      const result = await this.executeTaskInMainThread(task, builderFn)
      
      this.completedTasks++
      return result
    } catch (error) {
      this.failedTasks++
      this.logger.error(`任务 ${task.id} 失败:`, error)
      throw error
    }
  }

  /**
   * 在主线程执行任务
   */
  private async executeTaskInMainThread(
    task: BuildTask,
    builderFn: (config: BuilderConfig) => Promise<BuildResult>
  ): Promise<ParallelBuildResult> {
    const startTime = Date.now()

    try {
      this.logger.debug(`开始构建 ${task.format.toUpperCase()} 格式`)
      
      const result = await builderFn(task.config)
      
      const duration = Date.now() - startTime
      this.logger.success(`${task.format.toUpperCase()} 构建完成 (${duration}ms)`)

      this.completedTasks++

      return {
        format: task.format,
        result,
        duration
      }
    } catch (error) {
      this.failedTasks++
      this.logger.error(`${task.format.toUpperCase()} 构建失败:`, error)
      throw error
    }
  }

  /**
   * 并行处理文件
   */
  async processFilesParallel<T>(
    files: string[],
    processor: (file: string) => Promise<T>
  ): Promise<Map<string, T>> {
    const results = new Map<string, T>()

    if (files.length === 0) {
      return results
    }

    this.logger.info(`并行处理 ${files.length} 个文件...`)

    // 分批处理,避免过多并发
    const batchSize = this.maxWorkers * 2

    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize)

      const batchResults = await Promise.all(
        batch.map(async file => {
          try {
            const result = await processor(file)
            return { file, result, error: null }
          } catch (error) {
            this.logger.error(`处理文件失败: ${file}`, error)
            return { file, result: null, error }
          }
        })
      )

      for (const { file, result, error } of batchResults) {
        if (result !== null) {
          results.set(file, result)
        }
      }
    }

    this.logger.success(`文件处理完成: ${results.size}/${files.length} 成功`)

    return results
  }

  /**
   * 获取统计信息
   */
  getStats() {
    const workerPoolStats = this.workerPool?.getStats()

    return {
      completedTasks: this.completedTasks,
      failedTasks: this.failedTasks,
      totalBuildTime: this.totalBuildTime,
      averageBuildTime: this.completedTasks > 0 ? this.totalBuildTime / this.completedTasks : 0,
      workerPool: workerPoolStats
    }
  }

  /**
   * 清理资源
   */
  async dispose(): Promise<void> {
    if (this.workerPool) {
      await this.workerPool.terminate()
      this.workerPool = undefined
    }

    this.logger.info('并行构建管理器已清理')
  }
}

/**
 * 创建并行构建管理器
 */
export function createParallelBuildManager(options?: ParallelBuildOptions): ParallelBuildManager {
  return new ParallelBuildManager(options)
}

/**
 * 生成构建任务
 */
export function generateBuildTasks(config: BuilderConfig): BuildTask[] {
  const tasks: BuildTask[] = []
  const formats = config.output?.format || ['esm', 'cjs']
  const formatArray = Array.isArray(formats) ? formats : [formats]

  formatArray.forEach((format, index) => {
    tasks.push({
      id: `build-${format}-${Date.now()}-${index}`,
      format,
      config: {
        ...config,
        output: {
          ...config.output,
          format
        }
      },
      priority: format === 'esm' ? 10 : format === 'cjs' ? 9 : 8
    })
  })

  return tasks
}

