/**
 * 构建性能基准测试
 * 
 * 跟踪和分析构建性能趋势
 */

import { resolve } from 'path'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'

// ========== 类型定义 ==========

export interface BuildMetrics {
  id: string
  timestamp: number
  duration: number
  mode: string
  bundler: string
  success: boolean
  
  // 输出指标
  outputSize: number
  fileCount: number
  
  // 详细性能
  phases?: {
    parsing?: number
    transforming?: number
    bundling?: number
    writing?: number
    dts?: number
  }
  
  // 系统信息
  system?: {
    node: string
    platform: string
    memory: number
    cpuCount: number
  }
  
  // 构建配置
  config?: {
    minify: boolean
    sourcemap: boolean
    dts: boolean
    formats: string[]
  }
  
  // Git 信息
  git?: {
    branch: string
    commit: string
    tag?: string
  }
}

export interface BenchmarkStats {
  totalBuilds: number
  successRate: number
  avgDuration: number
  minDuration: number
  maxDuration: number
  avgSize: number
  trend: 'improving' | 'stable' | 'degrading'
  lastWeekBuilds: number
  lastWeekAvgDuration: number
}

export interface PerformanceTrend {
  date: string
  avgDuration: number
  avgSize: number
  buildCount: number
  successRate: number
}

// ========== 构建基准测试类 ==========

export class BuildBenchmark {
  private projectPath: string
  private metricsPath: string
  private metrics: BuildMetrics[] = []
  private maxHistory = 500

  constructor(projectPath: string) {
    this.projectPath = projectPath
    this.metricsPath = resolve(projectPath, '.ldesign', 'benchmark.json')
    this.loadMetrics()
  }

  /**
   * 加载历史指标
   */
  private loadMetrics(): void {
    if (existsSync(this.metricsPath)) {
      try {
        this.metrics = JSON.parse(readFileSync(this.metricsPath, 'utf-8'))
      } catch {
        this.metrics = []
      }
    }
  }

  /**
   * 保存指标
   */
  private saveMetrics(): void {
    const dir = resolve(this.projectPath, '.ldesign')
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    
    // 限制历史记录数量
    if (this.metrics.length > this.maxHistory) {
      this.metrics = this.metrics.slice(-this.maxHistory)
    }
    
    writeFileSync(this.metricsPath, JSON.stringify(this.metrics, null, 2))
  }

  /**
   * 记录构建指标
   */
  record(metrics: Omit<BuildMetrics, 'id' | 'timestamp' | 'system'>): void {
    const fullMetrics: BuildMetrics = {
      ...metrics,
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      timestamp: Date.now(),
      system: {
        node: process.version,
        platform: process.platform,
        memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        cpuCount: require('os').cpus().length
      }
    }

    // 尝试获取 Git 信息
    try {
      const { execSync } = require('child_process')
      fullMetrics.git = {
        branch: execSync('git rev-parse --abbrev-ref HEAD', { cwd: this.projectPath, encoding: 'utf-8' }).trim(),
        commit: execSync('git rev-parse --short HEAD', { cwd: this.projectPath, encoding: 'utf-8' }).trim()
      }
      try {
        fullMetrics.git.tag = execSync('git describe --tags --abbrev=0', { cwd: this.projectPath, encoding: 'utf-8' }).trim()
      } catch {}
    } catch {}

    this.metrics.push(fullMetrics)
    this.saveMetrics()
  }

  /**
   * 获取所有指标
   */
  getMetrics(): BuildMetrics[] {
    return this.metrics
  }

  /**
   * 获取最近 N 条指标
   */
  getRecentMetrics(count: number = 20): BuildMetrics[] {
    return this.metrics.slice(-count)
  }

  /**
   * 获取统计信息
   */
  getStats(): BenchmarkStats {
    if (this.metrics.length === 0) {
      return {
        totalBuilds: 0,
        successRate: 100,
        avgDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        avgSize: 0,
        trend: 'stable',
        lastWeekBuilds: 0,
        lastWeekAvgDuration: 0
      }
    }

    const successfulBuilds = this.metrics.filter(m => m.success)
    const durations = successfulBuilds.map(m => m.duration)
    const sizes = successfulBuilds.map(m => m.outputSize)

    // 计算趋势 - 比较最近 10 次和之前 10 次的平均时间
    let trend: 'improving' | 'stable' | 'degrading' = 'stable'
    if (successfulBuilds.length >= 20) {
      const recent = successfulBuilds.slice(-10)
      const previous = successfulBuilds.slice(-20, -10)
      const recentAvg = recent.reduce((s, m) => s + m.duration, 0) / 10
      const previousAvg = previous.reduce((s, m) => s + m.duration, 0) / 10
      
      const change = (recentAvg - previousAvg) / previousAvg
      if (change < -0.1) trend = 'improving'
      else if (change > 0.1) trend = 'degrading'
    }

    // 最近一周
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    const lastWeekMetrics = successfulBuilds.filter(m => m.timestamp > oneWeekAgo)

    return {
      totalBuilds: this.metrics.length,
      successRate: Math.round((successfulBuilds.length / this.metrics.length) * 100),
      avgDuration: durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
      minDuration: durations.length ? Math.min(...durations) : 0,
      maxDuration: durations.length ? Math.max(...durations) : 0,
      avgSize: sizes.length ? sizes.reduce((a, b) => a + b, 0) / sizes.length : 0,
      trend,
      lastWeekBuilds: lastWeekMetrics.length,
      lastWeekAvgDuration: lastWeekMetrics.length 
        ? lastWeekMetrics.reduce((s, m) => s + m.duration, 0) / lastWeekMetrics.length 
        : 0
    }
  }

  /**
   * 获取每日趋势
   */
  getDailyTrends(days: number = 30): PerformanceTrend[] {
    const trends: PerformanceTrend[] = []
    const now = new Date()
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)
      
      const dayMetrics = this.metrics.filter(m => 
        m.timestamp >= date.getTime() && m.timestamp < nextDate.getTime()
      )
      
      const successful = dayMetrics.filter(m => m.success)
      
      trends.push({
        date: date.toISOString().split('T')[0],
        avgDuration: successful.length 
          ? successful.reduce((s, m) => s + m.duration, 0) / successful.length 
          : 0,
        avgSize: successful.length 
          ? successful.reduce((s, m) => s + m.outputSize, 0) / successful.length 
          : 0,
        buildCount: dayMetrics.length,
        successRate: dayMetrics.length 
          ? Math.round((successful.length / dayMetrics.length) * 100) 
          : 100
      })
    }
    
    return trends
  }

  /**
   * 按打包引擎统计
   */
  getStatsByBundler(): Record<string, { count: number; avgDuration: number; avgSize: number }> {
    const byBundler: Record<string, BuildMetrics[]> = {}
    
    for (const m of this.metrics.filter(m => m.success)) {
      if (!byBundler[m.bundler]) byBundler[m.bundler] = []
      byBundler[m.bundler].push(m)
    }
    
    const result: Record<string, { count: number; avgDuration: number; avgSize: number }> = {}
    
    for (const [bundler, metrics] of Object.entries(byBundler)) {
      result[bundler] = {
        count: metrics.length,
        avgDuration: metrics.reduce((s, m) => s + m.duration, 0) / metrics.length,
        avgSize: metrics.reduce((s, m) => s + m.outputSize, 0) / metrics.length
      }
    }
    
    return result
  }

  /**
   * 按模式统计
   */
  getStatsByMode(): Record<string, { count: number; avgDuration: number; avgSize: number }> {
    const byMode: Record<string, BuildMetrics[]> = {}
    
    for (const m of this.metrics.filter(m => m.success)) {
      if (!byMode[m.mode]) byMode[m.mode] = []
      byMode[m.mode].push(m)
    }
    
    const result: Record<string, { count: number; avgDuration: number; avgSize: number }> = {}
    
    for (const [mode, metrics] of Object.entries(byMode)) {
      result[mode] = {
        count: metrics.length,
        avgDuration: metrics.reduce((s, m) => s + m.duration, 0) / metrics.length,
        avgSize: metrics.reduce((s, m) => s + m.outputSize, 0) / metrics.length
      }
    }
    
    return result
  }

  /**
   * 获取性能对比
   */
  compareWithBaseline(baselineId?: string): {
    baseline: BuildMetrics | null
    current: BuildMetrics | null
    comparison: {
      durationChange: number
      sizeChange: number
      improved: boolean
    } | null
  } {
    const successful = this.metrics.filter(m => m.success)
    if (successful.length === 0) {
      return { baseline: null, current: null, comparison: null }
    }

    const current = successful[successful.length - 1]
    const baseline = baselineId 
      ? successful.find(m => m.id === baselineId)
      : successful.length > 1 ? successful[successful.length - 2] : null

    if (!baseline) {
      return { baseline: null, current, comparison: null }
    }

    const durationChange = ((current.duration - baseline.duration) / baseline.duration) * 100
    const sizeChange = ((current.outputSize - baseline.outputSize) / baseline.outputSize) * 100

    return {
      baseline,
      current,
      comparison: {
        durationChange,
        sizeChange,
        improved: durationChange < 0 && sizeChange <= 0
      }
    }
  }

  /**
   * 清空历史
   */
  clear(): void {
    this.metrics = []
    this.saveMetrics()
  }

  /**
   * 导出报告
   */
  exportReport(): string {
    const stats = this.getStats()
    const trends = this.getDailyTrends(7)
    const byBundler = this.getStatsByBundler()
    const byMode = this.getStatsByMode()

    let report = `# 构建性能报告\n\n`
    report += `生成时间: ${new Date().toLocaleString()}\n\n`
    
    report += `## 总体统计\n\n`
    report += `- 总构建次数: ${stats.totalBuilds}\n`
    report += `- 成功率: ${stats.successRate}%\n`
    report += `- 平均耗时: ${stats.avgDuration.toFixed(2)}s\n`
    report += `- 最短耗时: ${stats.minDuration.toFixed(2)}s\n`
    report += `- 最长耗时: ${stats.maxDuration.toFixed(2)}s\n`
    report += `- 平均产物大小: ${this.formatSize(stats.avgSize)}\n`
    report += `- 性能趋势: ${stats.trend === 'improving' ? '📈 改善' : stats.trend === 'degrading' ? '📉 下降' : '➡️ 稳定'}\n\n`

    report += `## 最近一周\n\n`
    report += `- 构建次数: ${stats.lastWeekBuilds}\n`
    report += `- 平均耗时: ${stats.lastWeekAvgDuration.toFixed(2)}s\n\n`

    report += `## 每日趋势\n\n`
    report += `| 日期 | 构建数 | 成功率 | 平均耗时 | 平均大小 |\n`
    report += `|------|--------|--------|----------|----------|\n`
    for (const t of trends) {
      report += `| ${t.date} | ${t.buildCount} | ${t.successRate}% | ${t.avgDuration.toFixed(2)}s | ${this.formatSize(t.avgSize)} |\n`
    }
    report += '\n'

    report += `## 按打包引擎\n\n`
    for (const [bundler, s] of Object.entries(byBundler)) {
      report += `- **${bundler}**: ${s.count}次, 平均 ${s.avgDuration.toFixed(2)}s, ${this.formatSize(s.avgSize)}\n`
    }
    report += '\n'

    report += `## 按构建模式\n\n`
    for (const [mode, s] of Object.entries(byMode)) {
      report += `- **${mode}**: ${s.count}次, 平均 ${s.avgDuration.toFixed(2)}s, ${this.formatSize(s.avgSize)}\n`
    }

    return report
  }

  private formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1024 / 1024).toFixed(2) + ' MB'
  }
}

/**
 * 创建构建基准测试实例
 */
export function createBuildBenchmark(projectPath: string): BuildBenchmark {
  return new BuildBenchmark(projectPath)
}
