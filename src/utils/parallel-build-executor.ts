/**
 * 并行构建执行器
 * 
 * 实现多格式并行打包，显著提升构建速度
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import { Worker } from 'worker_threads'
import * as os from 'os'
import type { BuildResult } from '../types/builder'
import type { BuilderConfig } from '../types/config'
import { Logger } from './logger'

/**
 * 构建任务
 */
export interface BuildTask {
  id: string
  format: 'esm' | 'cjs' | 'umd' | 'iife'
  config: BuilderConfig
  priority: number
}

/**
 * 并行构建选项
 */
export interface ParallelBuildOptions {
  maxConcurrency?: number
  timeout?: number
  enableWorkerThreads?: boolean
  logger?: Logger
}

/**
 * 并行构建执行器
 */
export class ParallelBuildExecutor {
  private logger: Logger
  private maxConcurrency: number
  private timeout: number
  private enableWorkerThreads: boolean
  private activeTasks: Map<string, Promise<BuildResult>>

  constructor(options: ParallelBuildOptions = {}) {
    this.logger = options.logger || new Logger()
    this.maxConcurrency = options.maxConcurrency || Math.max(os.cpus().length - 1, 1)
    this.timeout = options.timeout || 300000 // 5 分钟
    this.enableWorkerThreads = options.enableWorkerThreads ?? true
    this.activeTasks = new Map()

    this.logger.debug(`并行构建执行器初始化: ${this.maxConcurrency} 个并发`)
  }

  /**
   * 并行执行多格式构建
   */
  async executeParallel(
    tasks: BuildTask[],
    builderFn: (config: BuilderConfig) => Promise<BuildResult>
  ): Promise<Record<string, BuildResult>> {
    this.logger.info(`开始并行构建 ${tasks.length} 个格式...`)
    const startTime = Date.now()

    // 按优先级排序
    const sortedTasks = [...tasks].sort((a, b) => b.priority - a.priority)

    // 分批执行
    const results: Record<string, BuildResult> = {}
    const batches = this.createBatches(sortedTasks, this.maxConcurrency)

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i]
      this.logger.debug(`执行第 ${i + 1}/${batches.length} 批（${batch.length} 个任务）`)

      // 并行执行当前批次
      const batchResults = await Promise.all(
        batch.map(task => this.executeTask(task, builderFn))
      )

      // 收集结果
      batch.forEach((task, index) => {
        results[task.format] = batchResults[index]
      })
    }

    const duration = Date.now() - startTime
    this.logger.success(`并行构建完成，耗时 ${duration}ms`)

    return results
  }

  /**
   * 执行单个构建任务
   */
  private async executeTask(
    task: BuildTask,
    builderFn: (config: BuilderConfig) => Promise<BuildResult>
  ): Promise<BuildResult> {
    const taskId = `${task.format}-${Date.now()}`

    try {
      this.logger.debug(`开始构建 ${task.format.toUpperCase()} 格式`)
      const startTime = Date.now()

      // 如果启用 Worker Threads，在独立线程中执行
      let result: BuildResult
      if (this.enableWorkerThreads && this.shouldUseWorker(task)) {
        result = await this.executeInWorker(task, builderFn)
      } else {
        result = await this.executeInMainThread(task, builderFn)
      }

      const duration = Date.now() - startTime
      this.logger.success(`${task.format.toUpperCase()} 构建完成（${duration}ms）`)

      return result
    } catch (error) {
      this.logger.error(`${task.format.toUpperCase()} 构建失败:`, error)

      return {
        success: false,
        outputs: [],
        duration: 0,
        bundler: 'unknown',
        warnings: [],
        errors: [{
          name: 'BuildError',
          message: `${task.format} 构建失败: ${(error as Error).message}`,
          stack: (error as Error).stack
        } as Error],
        stats: {
          buildTime: 0,
          fileCount: 0,
          totalSize: {
            raw: 0,
            gzip: 0,
            brotli: 0,
            byType: {},
            byFormat: {} as any,
            largest: { file: '', size: 0 },
            fileCount: 0
          },
          byFormat: {} as any,
          modules: {
            total: 0,
            external: 0,
            internal: 0,
            largest: {} as any
          },
          dependencies: {
            total: 0,
            external: [],
            bundled: [],
            circular: []
          }
        },
        performance: {
          buildTime: 0,
          memoryUsage: {
            heapUsed: 0,
            heapTotal: 0,
            external: 0,
            rss: 0,
            peak: 0,
            trend: []
          },
          cacheStats: {
            hits: 0,
            misses: 0,
            hitRate: 0,
            size: 0,
            entries: 0,
            timeSaved: 0
          },
          fileStats: {
            totalFiles: 0,
            filesByType: {},
            averageProcessingTime: 0,
            slowestFiles: [],
            processingRate: 0
          },
          pluginPerformance: [],
          systemResources: {
            cpu: { usage: 0, cores: 0, speed: 0 },
            memory: { total: 0, free: 0, used: 0 },
            disk: { total: 0, free: 0, used: 0 }
          } as any
        },
        buildId: `${task.format}-${Date.now()}`,
        timestamp: Date.now(),
        mode: 'production'
      }
    } finally {
      this.activeTasks.delete(taskId)
    }
  }

  /**
   * 在主线程执行（默认方式，简单可靠）
   */
  private async executeInMainThread(
    task: BuildTask,
    builderFn: (config: BuilderConfig) => Promise<BuildResult>
  ): Promise<BuildResult> {
    // 为当前格式创建专门的配置
    const formatConfig = this.createFormatConfig(task)

    // 执行构建
    return await builderFn(formatConfig)
  }

  /**
   * 在 Worker 线程执行（更高性能，但设置复杂）
   */
  private async executeInWorker(
    task: BuildTask,
    builderFn: (config: BuilderConfig) => Promise<BuildResult>
  ): Promise<BuildResult> {
    // 注意：Worker 线程实现需要额外的序列化处理
    // 目前先使用主线程方式，未来可以优化
    return this.executeInMainThread(task, builderFn)
  }

  /**
   * 判断是否应该使用 Worker
   */
  private shouldUseWorker(task: BuildTask): boolean {
    // 简单任务不需要 Worker
    // UMD 通常是单文件，适合 Worker
    return task.format === 'umd'
  }

  /**
   * 创建格式特定配置
   */
  private createFormatConfig(task: BuildTask): BuilderConfig {
    const config = { ...task.config }

    // 确保 output 配置存在
    if (!config.output || typeof config.output !== 'object') {
      config.output = {}
    }

    // 设置当前格式
    const outputConfig = config.output as any

    // 根据格式配置输出
    switch (task.format) {
      case 'esm':
        outputConfig.format = 'esm'
        outputConfig.dir = outputConfig.esm?.dir || 'es'
        if (outputConfig.esm) {
          Object.assign(outputConfig, outputConfig.esm)
        }
        break

      case 'cjs':
        outputConfig.format = 'cjs'
        outputConfig.dir = outputConfig.cjs?.dir || 'lib'
        if (outputConfig.cjs) {
          Object.assign(outputConfig, outputConfig.cjs)
        }
        break

      case 'umd':
        outputConfig.format = 'umd'
        outputConfig.dir = outputConfig.umd?.dir || 'dist'
        if (outputConfig.umd) {
          Object.assign(outputConfig, outputConfig.umd)
        }
        break

      case 'iife':
        outputConfig.format = 'iife'
        outputConfig.dir = outputConfig.iife?.dir || 'dist'
        if (outputConfig.iife) {
          Object.assign(outputConfig, outputConfig.iife)
        }
        break
    }

    return config
  }

  /**
   * 创建批次
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = []

    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize))
    }

    return batches
  }

  /**
   * 生成构建任务
   */
  static generateTasks(config: BuilderConfig): BuildTask[] {
    const tasks: BuildTask[] = []
    const outputConfig = config.output

    if (!outputConfig || typeof outputConfig !== 'object') {
      return tasks
    }

    // 优先级：UMD > ESM > CJS（UMD 最快完成，用户最常需要）
    const priorityMap = {
      umd: 3,
      esm: 2,
      cjs: 1,
      iife: 1
    }

    // 检查启用的格式
    const formats: Array<'esm' | 'cjs' | 'umd' | 'iife'> = []

    if (outputConfig.esm) {
      formats.push('esm')
    }
    if (outputConfig.cjs) {
      formats.push('cjs')
    }
    if (outputConfig.umd) {
      formats.push('umd')
    }
    // iife 不在 OutputConfig 类型中，使用 any 类型断言
    if ((outputConfig as any).iife) {
      formats.push('iife')
    }

    // 如果没有指定格式，使用默认格式数组
    if (formats.length === 0 && outputConfig.format) {
      const formatArray = Array.isArray(outputConfig.format)
        ? outputConfig.format
        : [outputConfig.format]

      formats.push(...formatArray as any)
    }

    // 生成任务
    for (const format of formats) {
      tasks.push({
        id: `build-${format}`,
        format,
        config,
        priority: priorityMap[format] || 1
      })
    }

    return tasks
  }

  /**
   * 取消所有任务
   */
  async cancelAll(): Promise<void> {
    this.logger.info('取消所有构建任务...')
    this.activeTasks.clear()
  }

  /**
   * 获取活动任务数
   */
  getActiveTaskCount(): number {
    return this.activeTasks.size
  }
}

/**
 * 创建并行构建执行器
 */
export function createParallelBuildExecutor(options?: ParallelBuildOptions): ParallelBuildExecutor {
  return new ParallelBuildExecutor(options)
}

/**
 * 简化的并行构建函数
 */
export async function buildParallel(
  config: BuilderConfig,
  builderFn: (config: BuilderConfig) => Promise<BuildResult>,
  options?: ParallelBuildOptions
): Promise<Record<string, BuildResult>> {
  const executor = createParallelBuildExecutor(options)
  const tasks = ParallelBuildExecutor.generateTasks(config)

  if (tasks.length === 0) {
    throw new Error('没有找到需要构建的格式')
  }

  if (tasks.length === 1) {
    // 单格式直接构建，不需要并行
    const result = await builderFn(config)
    return { [tasks[0].format]: result }
  }

  return await executor.executeParallel(tasks, builderFn)
}



