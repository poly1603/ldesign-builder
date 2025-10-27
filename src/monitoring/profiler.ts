/**
 * 性能分析器
 * 
 * 提供构建性能分析、火焰图生成、瓶颈检测等功能
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import * as path from 'path'
import * as fs from 'fs-extra'
import { performance, PerformanceObserver } from 'perf_hooks'
import * as v8 from 'v8'
import { Logger } from '../utils/logger'

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  /** 总构建时间 */
  totalTime: number
  /** 各阶段时间 */
  phases: Map<string, PhaseMetrics>
  /** CPU 使用率 */
  cpuUsage: CPUUsage
  /** 内存使用 */
  memoryUsage: MemoryUsage
  /** 文件 I/O */
  fileIO: FileIOMetrics
  /** 瓶颈列表 */
  bottlenecks: Bottleneck[]
  /** 优化建议 */
  suggestions: string[]
}

/**
 * 阶段指标
 */
export interface PhaseMetrics {
  name: string
  duration: number
  startTime: number
  endTime: number
  children?: Map<string, PhaseMetrics>
  metadata?: any
}

/**
 * CPU 使用情况
 */
export interface CPUUsage {
  user: number
  system: number
  percent: number
}

/**
 * 内存使用情况
 */
export interface MemoryUsage {
  heapUsed: number
  heapTotal: number
  external: number
  rss: number
  arrayBuffers: number
  peak: number
}

/**
 * 文件 I/O 指标
 */
export interface FileIOMetrics {
  reads: number
  writes: number
  bytesRead: number
  bytesWritten: number
  slowestOps: Array<{
    operation: string
    path: string
    duration: number
  }>
}

/**
 * 性能瓶颈
 */
export interface Bottleneck {
  type: 'cpu' | 'memory' | 'io' | 'time'
  severity: 'low' | 'medium' | 'high'
  description: string
  phase?: string
  impact: number // 0-100
  suggestion?: string
}

/**
 * 火焰图数据
 */
export interface FlameGraphData {
  name: string
  value: number
  children?: FlameGraphData[]
  metadata?: any
}

/**
 * 性能分析器配置
 */
export interface PerformanceProfilerConfig {
  /** 启用性能分析 */
  enabled?: boolean
  /** 采样间隔（毫秒） */
  sampleInterval?: number
  /** 生成火焰图 */
  generateFlameGraph?: boolean
  /** 生成报告 */
  generateReport?: boolean
  /** 输出目录 */
  outputDir?: string
  /** CPU 分析 */
  cpuProfiling?: boolean
  /** 内存分析 */
  memoryProfiling?: boolean
  /** 瓶颈阈值 */
  bottleneckThreshold?: {
    time?: number // 毫秒
    cpu?: number // 百分比
    memory?: number // MB
  }
}

/**
 * 性能分析器
 */
export class PerformanceProfiler {
  private config: PerformanceProfilerConfig
  private logger: Logger
  private metrics: PerformanceMetrics
  private currentPhase: string | null = null
  private phaseStack: string[] = []
  private startTime: number = 0
  private cpuUsageStart: NodeJS.CpuUsage | null = null
  private memoryPeak: number = 0
  private observer: PerformanceObserver | null = null
  private samplingInterval: NodeJS.Timer | null = null

  constructor(config: PerformanceProfilerConfig = {}) {
    this.config = {
      enabled: true,
      sampleInterval: 100,
      generateFlameGraph: true,
      generateReport: true,
      outputDir: '.cache/performance',
      cpuProfiling: true,
      memoryProfiling: true,
      bottleneckThreshold: {
        time: 5000, // 5秒
        cpu: 80, // 80%
        memory: 1024 // 1GB
      },
      ...config
    }

    this.logger = new Logger({ prefix: '[PerformanceProfiler]' })

    // 初始化指标
    this.metrics = {
      totalTime: 0,
      phases: new Map(),
      cpuUsage: { user: 0, system: 0, percent: 0 },
      memoryUsage: {
        heapUsed: 0,
        heapTotal: 0,
        external: 0,
        rss: 0,
        arrayBuffers: 0,
        peak: 0
      },
      fileIO: {
        reads: 0,
        writes: 0,
        bytesRead: 0,
        bytesWritten: 0,
        slowestOps: []
      },
      bottlenecks: [],
      suggestions: []
    }

    if (this.config.enabled) {
      this.setupObserver()
    }
  }

  /**
   * 开始性能分析
   */
  start(): void {
    if (!this.config.enabled) return

    this.logger.info('开始性能分析...')

    this.startTime = performance.now()
    this.cpuUsageStart = process.cpuUsage()

    // 开始采样
    if (this.config.sampleInterval) {
      this.startSampling()
    }

    // 启动 CPU 分析
    if (this.config.cpuProfiling) {
      // 实际项目中可以使用 v8-profiler-next
      this.logger.debug('CPU 分析已启动')
    }
  }

  /**
   * 结束性能分析
   */
  async stop(): Promise<PerformanceMetrics> {
    if (!this.config.enabled) return this.metrics

    // 停止采样
    if (this.samplingInterval) {
      clearInterval(this.samplingInterval as any)
      this.samplingInterval = null
    }

    // 计算总时间
    this.metrics.totalTime = performance.now() - this.startTime

    // 计算 CPU 使用率
    if (this.cpuUsageStart) {
      const cpuUsageEnd = process.cpuUsage(this.cpuUsageStart)
      this.metrics.cpuUsage = {
        user: cpuUsageEnd.user / 1000, // 转换为毫秒
        system: cpuUsageEnd.system / 1000,
        percent: ((cpuUsageEnd.user + cpuUsageEnd.system) / (this.metrics.totalTime * 1000)) * 100
      }
    }

    // 最终内存使用
    this.updateMemoryUsage()
    this.metrics.memoryUsage.peak = this.memoryPeak

    // 检测瓶颈
    this.detectBottlenecks()

    // 生成优化建议
    this.generateSuggestions()

    // 生成报告
    if (this.config.generateReport) {
      await this.generateReport()
    }

    // 生成火焰图
    if (this.config.generateFlameGraph) {
      await this.generateFlameGraph()
    }

    this.logger.success('性能分析完成')

    return this.metrics
  }

  /**
   * 开始一个阶段
   */
  startPhase(name: string, metadata?: any): void {
    if (!this.config.enabled) return

    const phase: PhaseMetrics = {
      name,
      startTime: performance.now() - this.startTime,
      endTime: 0,
      duration: 0,
      metadata,
      children: new Map()
    }

    // 处理嵌套阶段
    if (this.currentPhase) {
      const parentPhase = this.getPhase(this.currentPhase)
      if (parentPhase && parentPhase.children) {
        parentPhase.children.set(name, phase)
      }
      this.phaseStack.push(this.currentPhase)
    } else {
      this.metrics.phases.set(name, phase)
    }

    this.currentPhase = name
  }

  /**
   * 结束一个阶段
   */
  endPhase(name?: string): void {
    if (!this.config.enabled) return

    const phaseName = name || this.currentPhase
    if (!phaseName) return

    const phase = this.getPhase(phaseName)
    if (phase) {
      phase.endTime = performance.now() - this.startTime
      phase.duration = phase.endTime - phase.startTime
    }

    // 恢复父阶段
    if (this.phaseStack.length > 0) {
      this.currentPhase = this.phaseStack.pop() || null
    } else {
      this.currentPhase = null
    }
  }

  /**
   * 记录文件操作
   */
  recordFileOperation(operation: 'read' | 'write', filePath: string, bytes: number, duration: number): void {
    if (!this.config.enabled) return

    if (operation === 'read') {
      this.metrics.fileIO.reads++
      this.metrics.fileIO.bytesRead += bytes
    } else {
      this.metrics.fileIO.writes++
      this.metrics.fileIO.bytesWritten += bytes
    }

    // 记录慢操作
    if (duration > 100) { // 超过 100ms
      this.metrics.fileIO.slowestOps.push({
        operation,
        path: filePath,
        duration
      })

      // 只保留最慢的 10 个操作
      this.metrics.fileIO.slowestOps.sort((a, b) => b.duration - a.duration)
      this.metrics.fileIO.slowestOps = this.metrics.fileIO.slowestOps.slice(0, 10)
    }
  }

  /**
   * 设置性能观察器
   */
  private setupObserver(): void {
    this.observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // 处理性能条目
        this.logger.debug(`Performance entry: ${entry.name} - ${entry.duration}ms`)
      }
    })

    this.observer.observe({ entryTypes: ['measure', 'mark'] })
  }

  /**
   * 开始采样
   */
  private startSampling(): void {
    this.samplingInterval = setInterval(() => {
      this.updateMemoryUsage()

      // 记录内存峰值
      if (this.metrics.memoryUsage.heapUsed > this.memoryPeak) {
        this.memoryPeak = this.metrics.memoryUsage.heapUsed
      }
    }, this.config.sampleInterval!)
  }

  /**
   * 更新内存使用
   */
  private updateMemoryUsage(): void {
    const memUsage = process.memoryUsage()

    this.metrics.memoryUsage = {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      rss: memUsage.rss,
      arrayBuffers: memUsage.arrayBuffers || 0,
      peak: this.memoryPeak
    }
  }

  /**
   * 获取阶段
   */
  private getPhase(name: string): PhaseMetrics | null {
    // 在顶层查找
    if (this.metrics.phases.has(name)) {
      return this.metrics.phases.get(name)!
    }

    // 递归查找子阶段
    for (const [, phase] of this.metrics.phases) {
      const found = this.findPhaseRecursive(phase, name)
      if (found) return found
    }

    return null
  }

  /**
   * 递归查找阶段
   */
  private findPhaseRecursive(phase: PhaseMetrics, name: string): PhaseMetrics | null {
    if (phase.name === name) return phase

    if (phase.children) {
      for (const [, child] of phase.children) {
        const found = this.findPhaseRecursive(child, name)
        if (found) return found
      }
    }

    return null
  }

  /**
   * 检测瓶颈
   */
  private detectBottlenecks(): void {
    const threshold = this.config.bottleneckThreshold!

    // 检测时间瓶颈
    for (const [, phase] of this.metrics.phases) {
      this.detectPhaseBottlenecks(phase, threshold)
    }

    // 检测 CPU 瓶颈
    if (this.metrics.cpuUsage.percent > threshold.cpu!) {
      this.metrics.bottlenecks.push({
        type: 'cpu',
        severity: 'high',
        description: `CPU 使用率过高: ${this.metrics.cpuUsage.percent.toFixed(1)}%`,
        impact: this.metrics.cpuUsage.percent,
        suggestion: '考虑使用 Worker 线程或优化算法'
      })
    }

    // 检测内存瓶颈
    const memoryUsageMB = this.metrics.memoryUsage.peak / (1024 * 1024)
    if (memoryUsageMB > threshold.memory!) {
      this.metrics.bottlenecks.push({
        type: 'memory',
        severity: 'high',
        description: `内存使用过高: ${memoryUsageMB.toFixed(0)}MB`,
        impact: (memoryUsageMB / threshold.memory!) * 100,
        suggestion: '考虑优化数据结构或使用流式处理'
      })
    }

    // 检测 I/O 瓶颈
    if (this.metrics.fileIO.slowestOps.length > 5) {
      this.metrics.bottlenecks.push({
        type: 'io',
        severity: 'medium',
        description: `文件 I/O 操作过慢: ${this.metrics.fileIO.slowestOps.length} 个慢操作`,
        impact: 60,
        suggestion: '考虑使用批量操作或异步 I/O'
      })
    }

    // 按影响排序
    this.metrics.bottlenecks.sort((a, b) => b.impact - a.impact)
  }

  /**
   * 检测阶段瓶颈
   */
  private detectPhaseBottlenecks(phase: PhaseMetrics, threshold: any): void {
    if (phase.duration > threshold.time!) {
      this.metrics.bottlenecks.push({
        type: 'time',
        severity: phase.duration > threshold.time! * 2 ? 'high' : 'medium',
        description: `阶段 "${phase.name}" 耗时过长: ${phase.duration.toFixed(0)}ms`,
        phase: phase.name,
        impact: Math.min((phase.duration / this.metrics.totalTime) * 100, 100),
        suggestion: `优化 "${phase.name}" 阶段的处理逻辑`
      })
    }

    // 递归检查子阶段
    if (phase.children) {
      for (const [, child] of phase.children) {
        this.detectPhaseBottlenecks(child, threshold)
      }
    }
  }

  /**
   * 生成优化建议
   */
  private generateSuggestions(): void {
    // 基于瓶颈生成建议
    for (const bottleneck of this.metrics.bottlenecks) {
      if (bottleneck.suggestion && !this.metrics.suggestions.includes(bottleneck.suggestion)) {
        this.metrics.suggestions.push(bottleneck.suggestion)
      }
    }

    // 通用建议
    if (this.metrics.totalTime > 60000) { // 超过 1 分钟
      this.metrics.suggestions.push('构建时间过长，考虑启用增量构建或缓存')
    }

    if (this.metrics.phases.size > 20) {
      this.metrics.suggestions.push('构建阶段过多，考虑合并或并行执行某些阶段')
    }

    const ioRatio = (this.metrics.fileIO.reads + this.metrics.fileIO.writes) / (this.metrics.totalTime / 1000)
    if (ioRatio > 100) { // 每秒超过 100 次 I/O
      this.metrics.suggestions.push('I/O 操作频繁，考虑使用内存缓存或批量操作')
    }
  }

  /**
   * 生成火焰图数据
   */
  private buildFlameGraphData(): FlameGraphData {
    const root: FlameGraphData = {
      name: 'Total',
      value: this.metrics.totalTime,
      children: []
    }

    // 转换阶段数据为火焰图格式
    for (const [name, phase] of this.metrics.phases) {
      root.children!.push(this.phaseToFlameGraph(phase))
    }

    return root
  }

  /**
   * 阶段转火焰图
   */
  private phaseToFlameGraph(phase: PhaseMetrics): FlameGraphData {
    const data: FlameGraphData = {
      name: phase.name,
      value: phase.duration,
      metadata: phase.metadata
    }

    if (phase.children && phase.children.size > 0) {
      data.children = []
      for (const [, child] of phase.children) {
        data.children.push(this.phaseToFlameGraph(child))
      }
    }

    return data
  }

  /**
   * 生成火焰图
   */
  private async generateFlameGraph(): Promise<void> {
    const flameGraphData = this.buildFlameGraphData()
    const outputPath = path.join(this.config.outputDir!, 'flamegraph.json')

    await fs.ensureDir(this.config.outputDir!)
    await fs.writeJson(outputPath, flameGraphData, { spaces: 2 })

    // 生成 HTML 可视化
    const html = this.generateFlameGraphHTML(flameGraphData)
    const htmlPath = path.join(this.config.outputDir!, 'flamegraph.html')
    await fs.writeFile(htmlPath, html)

    this.logger.info(`火焰图已生成: ${htmlPath}`)
  }

  /**
   * 生成火焰图 HTML
   */
  private generateFlameGraphHTML(data: FlameGraphData): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>构建性能火焰图</title>
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
        }
        .cell {
            cursor: pointer;
            stroke: #fff;
            stroke-width: 1px;
        }
        .label {
            font-size: 12px;
            text-anchor: middle;
            pointer-events: none;
        }
        .tooltip {
            position: absolute;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 5px 10px;
            border-radius: 3px;
            font-size: 12px;
            pointer-events: none;
        }
        #info {
            margin: 20px 0;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <h1>构建性能火焰图</h1>
    <div id="info">
        <p>总时间: ${(this.metrics.totalTime / 1000).toFixed(2)}秒</p>
        <p>点击方块查看详情，点击空白处返回</p>
    </div>
    <div id="chart"></div>
    <script>
        const data = ${JSON.stringify(data)};
        
        // 创建火焰图
        const width = 1200;
        const height = 600;
        const cellHeight = 20;
        
        const svg = d3.select("#chart")
            .append("svg")
            .attr("width", width)
            .attr("height", height);
            
        const partition = d3.partition()
            .size([width, height]);
            
        const root = d3.hierarchy(data)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value);
            
        partition(root);
        
        const color = d3.scaleOrdinal(d3.schemeCategory10);
        
        const cell = svg.selectAll("g")
            .data(root.descendants())
            .enter().append("g")
            .attr("transform", d => \`translate(\${d.y0},\${d.x0})\`);
            
        cell.append("rect")
            .attr("class", "cell")
            .attr("width", d => d.y1 - d.y0)
            .attr("height", d => d.x1 - d.x0)
            .attr("fill", d => color(d.data.name))
            .on("click", clicked);
            
        cell.append("text")
            .attr("class", "label")
            .attr("x", d => (d.y1 - d.y0) / 2)
            .attr("y", d => (d.x1 - d.x0) / 2)
            .attr("dy", "0.35em")
            .text(d => {
                const width = d.y1 - d.y0;
                if (width > 50) {
                    return d.data.name;
                }
                return "";
            });
            
        // Tooltip
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
            
        cell.on("mouseover", function(event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(\`<strong>\${d.data.name}</strong><br/>时间: \${d.data.value.toFixed(2)}ms<br/>占比: \${((d.data.value / data.value) * 100).toFixed(1)}%\`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
        
        function clicked(event, p) {
            root.each(d => d.target = {
                x0: (d.x0 - p.x0) / (p.x1 - p.x0) * width,
                x1: (d.x1 - p.x0) / (p.x1 - p.x0) * width,
                y0: d.y0 - p.y0,
                y1: d.y1 - p.y0
            });
            
            cell.transition()
                .duration(750)
                .attr("transform", d => \`translate(\${d.target.y0},\${d.target.x0})\`);
                
            cell.select("rect")
                .transition()
                .duration(750)
                .attr("width", d => d.target.y1 - d.target.y0)
                .attr("height", d => d.target.x1 - d.target.x0);
                
            cell.select("text")
                .transition()
                .duration(750)
                .attr("x", d => (d.target.y1 - d.target.y0) / 2)
                .attr("y", d => (d.target.x1 - d.target.x0) / 2)
                .text(d => {
                    const width = d.target.y1 - d.target.y0;
                    if (width > 50) {
                        return d.data.name;
                    }
                    return "";
                });
        }
    </script>
</body>
</html>
    `
  }

  /**
   * 生成性能报告
   */
  private async generateReport(): Promise<void> {
    const report = this.buildReport()
    const outputPath = path.join(this.config.outputDir!, 'performance-report.md')

    await fs.ensureDir(this.config.outputDir!)
    await fs.writeFile(outputPath, report)

    this.logger.info(`性能报告已生成: ${outputPath}`)
  }

  /**
   * 构建报告内容
   */
  private buildReport(): string {
    const lines: string[] = []

    lines.push('# 构建性能分析报告')
    lines.push('')
    lines.push(`生成时间: ${new Date().toISOString()}`)
    lines.push('')

    lines.push('## 总体指标')
    lines.push('')
    lines.push(`- **总构建时间**: ${(this.metrics.totalTime / 1000).toFixed(2)}秒`)
    lines.push(`- **CPU 使用率**: ${this.metrics.cpuUsage.percent.toFixed(1)}%`)
    lines.push(`- **内存峰值**: ${(this.metrics.memoryUsage.peak / (1024 * 1024)).toFixed(0)}MB`)
    lines.push(`- **文件操作**: ${this.metrics.fileIO.reads} 次读取, ${this.metrics.fileIO.writes} 次写入`)
    lines.push('')

    lines.push('## 阶段耗时')
    lines.push('')
    lines.push('| 阶段 | 耗时(ms) | 占比 |')
    lines.push('|------|----------|------|')

    for (const [name, phase] of this.metrics.phases) {
      const percent = (phase.duration / this.metrics.totalTime) * 100
      lines.push(`| ${name} | ${phase.duration.toFixed(0)} | ${percent.toFixed(1)}% |`)
    }
    lines.push('')

    if (this.metrics.bottlenecks.length > 0) {
      lines.push('## 性能瓶颈')
      lines.push('')

      for (const bottleneck of this.metrics.bottlenecks) {
        lines.push(`### ${bottleneck.severity.toUpperCase()}: ${bottleneck.description}`)
        lines.push(`- 类型: ${bottleneck.type}`)
        lines.push(`- 影响: ${bottleneck.impact.toFixed(0)}%`)
        if (bottleneck.suggestion) {
          lines.push(`- 建议: ${bottleneck.suggestion}`)
        }
        lines.push('')
      }
    }

    if (this.metrics.suggestions.length > 0) {
      lines.push('## 优化建议')
      lines.push('')

      for (const suggestion of this.metrics.suggestions) {
        lines.push(`- ${suggestion}`)
      }
      lines.push('')
    }

    lines.push('## 详细指标')
    lines.push('')
    lines.push('### CPU 使用')
    lines.push(`- 用户时间: ${this.metrics.cpuUsage.user.toFixed(0)}ms`)
    lines.push(`- 系统时间: ${this.metrics.cpuUsage.system.toFixed(0)}ms`)
    lines.push('')

    lines.push('### 内存使用')
    lines.push(`- 堆使用: ${(this.metrics.memoryUsage.heapUsed / (1024 * 1024)).toFixed(0)}MB`)
    lines.push(`- 堆总量: ${(this.metrics.memoryUsage.heapTotal / (1024 * 1024)).toFixed(0)}MB`)
    lines.push(`- RSS: ${(this.metrics.memoryUsage.rss / (1024 * 1024)).toFixed(0)}MB`)
    lines.push('')

    if (this.metrics.fileIO.slowestOps.length > 0) {
      lines.push('### 最慢的文件操作')
      lines.push('')
      lines.push('| 操作 | 文件 | 耗时(ms) |')
      lines.push('|------|------|----------|')

      for (const op of this.metrics.fileIO.slowestOps) {
        lines.push(`| ${op.operation} | ${path.basename(op.path)} | ${op.duration.toFixed(0)} |`)
      }
    }

    return lines.join('\n')
  }
}

/**
 * 创建性能分析器
 */
export function createPerformanceProfiler(config?: PerformanceProfilerConfig): PerformanceProfiler {
  return new PerformanceProfiler(config)
}


