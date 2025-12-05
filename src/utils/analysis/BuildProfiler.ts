/**
 * 构建性能分析器
 * 
 * 提供构建过程的详细性能分析，识别瓶颈并生成优化建议
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import { performance, PerformanceObserver } from 'perf_hooks'
import { Logger, createLogger } from '../logger'

/**
 * 性能指标
 */
export interface PerformanceMetric {
  name: string
  startTime: number
  endTime?: number
  duration?: number
  metadata?: Record<string, any>
}

/**
 * 阶段性能数据
 */
export interface PhasePerformance {
  phase: string
  duration: number
  percentage: number
  subPhases: PhasePerformance[]
  metadata?: Record<string, any>
}

/**
 * 文件处理性能数据
 */
export interface FilePerformance {
  file: string
  duration: number
  size: number
  processingRate: number // bytes/ms
  transforms: string[]
}

/**
 * 瓶颈识别结果
 */
export interface BottleneckAnalysis {
  type: 'slow-file' | 'slow-phase' | 'memory' | 'io'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  suggestion: string
  metrics: Record<string, number>
}

/**
 * 构建分析报告
 */
export interface BuildAnalysisReport {
  buildId: string
  totalDuration: number
  phases: PhasePerformance[]
  slowestFiles: FilePerformance[]
  bottlenecks: BottleneckAnalysis[]
  suggestions: string[]
  memoryPeak: number
  timestamp: Date
}

/**
 * 构建性能分析器
 */
export class BuildProfiler {
  private logger: Logger
  private metrics: Map<string, PerformanceMetric> = new Map()
  private phaseStack: string[] = []
  private fileMetrics: Map<string, FilePerformance> = new Map()
  private memorySnapshots: number[] = []
  private buildStartTime: number = 0
  private observer?: PerformanceObserver

  constructor(logger?: Logger) {
    this.logger = logger || createLogger({ level: 'info', prefix: '[Profiler]' })
  }

  /**
   * 开始构建分析
   */
  startBuild(buildId: string): void {
    this.buildStartTime = performance.now()
    this.metrics.clear()
    this.fileMetrics.clear()
    this.memorySnapshots = []
    this.phaseStack = []

    // 记录初始内存
    this.recordMemorySnapshot()

    // 设置性能观察器
    this.setupPerformanceObserver()

    this.startPhase(`build:${buildId}`)
    this.logger.debug(`开始构建分析: ${buildId}`)
  }

  /**
   * 结束构建分析
   */
  endBuild(buildId: string): BuildAnalysisReport {
    this.endPhase(`build:${buildId}`)
    this.recordMemorySnapshot()

    // 停止观察器
    this.stopPerformanceObserver()

    const totalDuration = performance.now() - this.buildStartTime
    const report = this.generateReport(buildId, totalDuration)

    this.logger.debug(`构建分析完成: ${buildId}, 耗时: ${totalDuration.toFixed(2)}ms`)

    return report
  }

  /**
   * 开始一个阶段
   */
  startPhase(phase: string, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name: phase,
      startTime: performance.now(),
      metadata
    }

    this.metrics.set(phase, metric)
    this.phaseStack.push(phase)

    this.logger.debug(`开始阶段: ${phase}`)
  }

  /**
   * 结束一个阶段
   */
  endPhase(phase: string): number {
    const metric = this.metrics.get(phase)
    if (!metric) {
      this.logger.warn(`未找到阶段: ${phase}`)
      return 0
    }

    metric.endTime = performance.now()
    metric.duration = metric.endTime - metric.startTime

    // 从栈中移除
    const index = this.phaseStack.indexOf(phase)
    if (index > -1) {
      this.phaseStack.splice(index, 1)
    }

    this.logger.debug(`结束阶段: ${phase}, 耗时: ${metric.duration.toFixed(2)}ms`)

    return metric.duration
  }

  /**
   * 记录文件处理性能
   */
  recordFileProcessing(file: string, duration: number, size: number, transforms: string[] = []): void {
    const processingRate = size > 0 ? size / duration : 0

    this.fileMetrics.set(file, {
      file,
      duration,
      size,
      processingRate,
      transforms
    })
  }

  /**
   * 记录内存快照
   */
  recordMemorySnapshot(): void {
    const memUsage = process.memoryUsage()
    this.memorySnapshots.push(memUsage.heapUsed / 1024 / 1024) // MB
  }

  /**
   * 设置性能观察器
   */
  private setupPerformanceObserver(): void {
    try {
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        for (const entry of entries) {
          if (entry.entryType === 'measure') {
            this.logger.debug(`性能测量: ${entry.name} = ${entry.duration.toFixed(2)}ms`)
          }
        }
      })

      this.observer.observe({ entryTypes: ['measure'] })
    } catch (error) {
      // 某些环境可能不支持 PerformanceObserver
      this.logger.debug('PerformanceObserver 不可用')
    }
  }

  /**
   * 停止性能观察器
   */
  private stopPerformanceObserver(): void {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = undefined
    }
  }

  /**
   * 生成分析报告
   */
  private generateReport(buildId: string, totalDuration: number): BuildAnalysisReport {
    const phases = this.calculatePhasePerformance(totalDuration)
    const slowestFiles = this.getSlowerstFiles(10)
    const bottlenecks = this.identifyBottlenecks(totalDuration, phases, slowestFiles)
    const suggestions = this.generateSuggestions(bottlenecks)
    const memoryPeak = Math.max(...this.memorySnapshots, 0)

    return {
      buildId,
      totalDuration,
      phases,
      slowestFiles,
      bottlenecks,
      suggestions,
      memoryPeak,
      timestamp: new Date()
    }
  }

  /**
   * 计算阶段性能
   */
  private calculatePhasePerformance(totalDuration: number): PhasePerformance[] {
    const phases: PhasePerformance[] = []

    for (const [name, metric] of this.metrics) {
      if (metric.duration !== undefined) {
        phases.push({
          phase: name,
          duration: metric.duration,
          percentage: (metric.duration / totalDuration) * 100,
          subPhases: [],
          metadata: metric.metadata
        })
      }
    }

    // 按耗时排序
    return phases.sort((a, b) => b.duration - a.duration)
  }

  /**
   * 获取最慢的文件
   */
  private getSlowerstFiles(limit: number): FilePerformance[] {
    return Array.from(this.fileMetrics.values())
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit)
  }

  /**
   * 识别瓶颈
   */
  private identifyBottlenecks(
    totalDuration: number,
    phases: PhasePerformance[],
    slowestFiles: FilePerformance[]
  ): BottleneckAnalysis[] {
    const bottlenecks: BottleneckAnalysis[] = []

    // 检测慢文件
    for (const file of slowestFiles) {
      const percentage = (file.duration / totalDuration) * 100
      if (percentage > 10) {
        bottlenecks.push({
          type: 'slow-file',
          severity: percentage > 30 ? 'critical' : percentage > 20 ? 'high' : 'medium',
          description: `文件 ${file.file} 处理时间占总时间的 ${percentage.toFixed(1)}%`,
          suggestion: this.getFileOptimizationSuggestion(file),
          metrics: {
            duration: file.duration,
            size: file.size,
            percentage
          }
        })
      }
    }

    // 检测慢阶段
    for (const phase of phases) {
      if (phase.percentage > 40 && !phase.phase.startsWith('build:')) {
        bottlenecks.push({
          type: 'slow-phase',
          severity: phase.percentage > 60 ? 'critical' : phase.percentage > 50 ? 'high' : 'medium',
          description: `阶段 ${phase.phase} 耗时占比 ${phase.percentage.toFixed(1)}%`,
          suggestion: this.getPhaseOptimizationSuggestion(phase),
          metrics: {
            duration: phase.duration,
            percentage: phase.percentage
          }
        })
      }
    }

    // 检测内存问题
    const memoryPeak = Math.max(...this.memorySnapshots, 0)
    if (memoryPeak > 1024) { // > 1GB
      bottlenecks.push({
        type: 'memory',
        severity: memoryPeak > 2048 ? 'critical' : 'high',
        description: `内存峰值达到 ${memoryPeak.toFixed(0)}MB`,
        suggestion: '考虑启用增量构建或分批处理大文件',
        metrics: {
          peakMB: memoryPeak
        }
      })
    }

    return bottlenecks
  }

  /**
   * 获取文件优化建议
   */
  private getFileOptimizationSuggestion(file: FilePerformance): string {
    if (file.transforms.includes('typescript')) {
      return '考虑使用 esbuild 替代 tsc 进行 TypeScript 转译'
    }
    if (file.transforms.includes('babel')) {
      return '考虑使用 SWC 替代 Babel 进行转译'
    }
    if (file.size > 100 * 1024) {
      return '文件较大，考虑代码分割或延迟加载'
    }
    return '检查文件是否包含不必要的依赖'
  }

  /**
   * 获取阶段优化建议
   */
  private getPhaseOptimizationSuggestion(phase: PhasePerformance): string {
    const phaseName = phase.phase.toLowerCase()

    if (phaseName.includes('resolve')) {
      return '考虑配置更精确的 alias 减少模块解析时间'
    }
    if (phaseName.includes('transform')) {
      return '考虑启用转换缓存或使用更快的转换器'
    }
    if (phaseName.includes('generate') || phaseName.includes('write')) {
      return '考虑启用并行写入或使用 SSD'
    }
    if (phaseName.includes('dts') || phaseName.includes('typescript')) {
      return '类型生成较慢，考虑使用 vue-tsc 或 rollup-plugin-dts'
    }

    return '分析该阶段的具体操作，寻找优化机会'
  }

  /**
   * 生成优化建议
   */
  private generateSuggestions(bottlenecks: BottleneckAnalysis[]): string[] {
    const suggestions: string[] = []

    // 根据瓶颈生成通用建议
    const hasCritical = bottlenecks.some(b => b.severity === 'critical')
    const hasMemoryIssue = bottlenecks.some(b => b.type === 'memory')
    const hasSlowFiles = bottlenecks.some(b => b.type === 'slow-file')

    if (hasCritical) {
      suggestions.push('🚨 存在严重性能瓶颈，建议优先解决')
    }

    if (hasMemoryIssue) {
      suggestions.push('💾 内存使用较高，建议启用增量构建减少内存压力')
    }

    if (hasSlowFiles) {
      suggestions.push('📁 存在处理较慢的文件，考虑代码分割或优化依赖')
    }

    // 添加瓶颈的具体建议
    for (const bottleneck of bottlenecks) {
      suggestions.push(`• ${bottleneck.suggestion}`)
    }

    // 通用建议
    if (suggestions.length === 0) {
      suggestions.push('✅ 构建性能良好，暂无明显瓶颈')
    }

    return suggestions
  }

  /**
   * 打印分析报告
   */
  printReport(report: BuildAnalysisReport): void {
    console.log('\n' + '='.repeat(60))
    console.log('📊 构建性能分析报告')
    console.log('='.repeat(60))
    
    console.log(`\n⏱  总耗时: ${report.totalDuration.toFixed(2)}ms`)
    console.log(`💾 内存峰值: ${report.memoryPeak.toFixed(0)}MB`)
    
    console.log('\n📈 阶段耗时:')
    for (const phase of report.phases.slice(0, 5)) {
      const bar = '█'.repeat(Math.round(phase.percentage / 5))
      console.log(`   ${phase.phase}: ${phase.duration.toFixed(0)}ms (${phase.percentage.toFixed(1)}%) ${bar}`)
    }

    if (report.slowestFiles.length > 0) {
      console.log('\n🐢 最慢文件:')
      for (const file of report.slowestFiles.slice(0, 5)) {
        console.log(`   ${file.file}: ${file.duration.toFixed(0)}ms`)
      }
    }

    if (report.bottlenecks.length > 0) {
      console.log('\n⚠️  瓶颈识别:')
      for (const bottleneck of report.bottlenecks) {
        const icon = bottleneck.severity === 'critical' ? '🔴' : 
                     bottleneck.severity === 'high' ? '🟠' : '🟡'
        console.log(`   ${icon} ${bottleneck.description}`)
      }
    }

    console.log('\n💡 优化建议:')
    for (const suggestion of report.suggestions) {
      console.log(`   ${suggestion}`)
    }

    console.log('\n' + '='.repeat(60))
  }
}

/**
 * 创建构建分析器实例
 */
export function createBuildProfiler(logger?: Logger): BuildProfiler {
  return new BuildProfiler(logger)
}

/**
 * 全局构建分析器实例
 */
let globalProfiler: BuildProfiler | null = null

/**
 * 获取全局构建分析器
 */
export function getGlobalBuildProfiler(): BuildProfiler {
  if (!globalProfiler) {
    globalProfiler = new BuildProfiler()
  }
  return globalProfiler
}
