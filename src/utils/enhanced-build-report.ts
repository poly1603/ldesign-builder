/**
 * 增强的构建报告生成器
 * 
 * 生成美观的交互式 HTML 报告，包含图表和详细分析
 * 
 * @author LDesign Team
 * @version 2.0.0
 */

import path from 'path'
import fs from 'fs-extra'
import { Logger } from './logger'
import type { BuildReportData } from './build-report-generator'

/**
 * 增强的报告数据
 */
export interface EnhancedBuildReportData extends BuildReportData {
  /** 模块依赖图 */
  dependencyGraph?: {
    nodes: Array<{ id: string; label: string; size: number }>
    edges: Array<{ source: string; target: string; weight?: number }>
  }

  /** Tree-shaking 分析 */
  treeshaking?: {
    removed: number
    kept: number
    savings: number
  }

  /** 代码重复分析 */
  duplication?: {
    duplicatedCode: number
    duplicatedModules: Array<{
      module: string
      instances: number
      size: number
    }>
  }

  /** 历史对比 */
  comparison?: {
    previousBuild?: {
      timestamp: number
      duration: number
      size: number
    }
    changes: {
      duration: number // 变化百分比
      size: number
      files: number
    }
  }

  /** Bundle 大小趋势 */
  trends?: Array<{
    timestamp: number
    size: number
    duration: number
  }>
}

/**
 * 增强的构建报告生成器
 */
export class EnhancedBuildReportGenerator {
  private logger: Logger
  private outputDir: string
  private historyFile: string

  constructor(outputDir?: string) {
    this.logger = new Logger({ prefix: 'EnhancedReport' })
    this.outputDir = outputDir || path.join(process.cwd(), 'build-reports')
    this.historyFile = path.join(this.outputDir, 'history.json')
  }

  /**
   * 生成增强报告
   */
  async generate(data: EnhancedBuildReportData): Promise<void> {
    await fs.ensureDir(this.outputDir)

    // 加载历史数据
    const history = await this.loadHistory()

    // 添加对比数据
    if (history.length > 0) {
      data.comparison = this.compareWithPrevious(data, history[history.length - 1])
      data.trends = history.slice(-10).map(h => ({
        timestamp: h.timestamp,
        size: h.outputs.reduce((sum, o) => sum + o.size, 0),
        duration: h.duration
      }))
    }

    // 保存到历史
    await this.saveToHistory(data)

    // 生成 HTML 报告
    await this.generateHTMLReport(data)

    // 生成 JSON 报告
    await this.generateJSONReport(data)

    this.logger.success(`报告已生成: ${this.outputDir}`)
  }

  /**
   * 生成 HTML 报告
   */
  private async generateHTMLReport(data: EnhancedBuildReportData): Promise<void> {
    const html = this.buildHTML(data)
    const htmlPath = path.join(this.outputDir, `report-${Date.now()}.html`)
    await fs.writeFile(htmlPath, html)
  }

  /**
   * 构建 HTML 内容
   */
  private buildHTML(data: EnhancedBuildReportData): string {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>构建报告 - ${new Date(data.timestamp).toLocaleString()}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      min-height: 100vh;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
    }
    .header h1 {
      font-size: 32px;
      margin-bottom: 10px;
    }
    .header .meta {
      opacity: 0.9;
      font-size: 14px;
    }
    .status {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      margin-left: 10px;
    }
    .status.success { background: #10b981; color: white; }
    .status.failed { background: #ef4444; color: white; }
    .status.warning { background: #f59e0b; color: white; }
    
    .content { padding: 30px; }
    .section {
      margin-bottom: 40px;
      padding: 20px;
      background: #f9fafb;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }
    .section h2 {
      color: #1f2937;
      font-size: 20px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
    }
    .section h2::before {
      content: '';
      display: inline-block;
      width: 6px;
      height: 24px;
      background: #667eea;
      margin-right: 12px;
      border-radius: 3px;
    }
    
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border-left: 4px solid #667eea;
    }
    .stat-card .label {
      color: #6b7280;
      font-size: 14px;
      margin-bottom: 8px;
    }
    .stat-card .value {
      color: #1f2937;
      font-size: 28px;
      font-weight: bold;
    }
    .stat-card .unit {
      color: #6b7280;
      font-size: 14px;
      margin-left: 4px;
    }
    
    .files-table {
      width: 100%;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .files-table table {
      width: 100%;
      border-collapse: collapse;
    }
    .files-table th {
      background: #f3f4f6;
      color: #374151;
      font-weight: 600;
      text-align: left;
      padding: 12px 16px;
      font-size: 14px;
    }
    .files-table td {
      padding: 12px 16px;
      border-top: 1px solid #e5e7eb;
      font-size: 13px;
    }
    .files-table tr:hover {
      background: #f9fafb;
    }
    
    .chart-container {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    
    .progress-bar {
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 8px;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea, #764ba2);
      border-radius: 4px;
      transition: width 0.3s ease;
    }
    
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    .badge.js { background: #fef3c7; color: #92400e; }
    .badge.css { background: #dbeafe; color: #1e40af; }
    .badge.map { background: #e0e7ff; color: #3730a3; }
    .badge.dts { background: #ddd6fe; color: #5b21b6; }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 构建报告</h1>
      <div class="meta">
        <span>${new Date(data.timestamp).toLocaleString()}</span>
        <span class="status ${data.status}">${this.getStatusText(data.status)}</span>
      </div>
    </div>
    
    <div class="content">
      <!-- 核心统计 -->
      <div class="stats">
        <div class="stat-card">
          <div class="label">构建时间</div>
          <div class="value">${(data.duration / 1000).toFixed(2)}<span class="unit">s</span></div>
        </div>
        <div class="stat-card">
          <div class="label">输出文件</div>
          <div class="value">${data.outputs.length}<span class="unit">个</span></div>
        </div>
        <div class="stat-card">
          <div class="label">总大小</div>
          <div class="value">${this.formatSize(data.outputs.reduce((sum, o) => sum + o.size, 0))}</div>
        </div>
        ${data.memory ? `
        <div class="stat-card">
          <div class="label">峰值内存</div>
          <div class="value">${this.formatSize(data.memory.peak)}</div>
        </div>
        ` : ''}
      </div>
      
      <!-- 文件大小分析 -->
      <div class="section">
        <h2>📦 文件分析</h2>
        ${this.buildFilesTable(data.outputs)}
        ${this.buildFileSizeChart(data.outputs)}
      </div>
      
      <!-- 性能分析 -->
      ${data.performance ? `
      <div class="section">
        <h2>⚡ 性能分析</h2>
        ${this.buildPerformanceChart(data.performance)}
      </div>
      ` : ''}
      
      <!-- 趋势图 -->
      ${data.trends && data.trends.length > 0 ? `
      <div class="section">
        <h2>📈 构建趋势</h2>
        ${this.buildTrendsChart(data.trends)}
      </div>
      ` : ''}
      
      <!-- 依赖分析 -->
      ${data.dependencies ? `
      <div class="section">
        <h2>📚 依赖分析</h2>
        <div class="stats">
          <div class="stat-card">
            <div class="label">总依赖</div>
            <div class="value">${data.dependencies.total}</div>
          </div>
          <div class="stat-card">
            <div class="label">生产依赖</div>
            <div class="value">${data.dependencies.production}</div>
          </div>
          <div class="stat-card">
            <div class="label">开发依赖</div>
            <div class="value">${data.dependencies.development}</div>
          </div>
        </div>
      </div>
      ` : ''}
      
      <!-- 问题列表 -->
      ${data.issues && data.issues.length > 0 ? `
      <div class="section">
        <h2>⚠️ 问题 (${data.issues.length})</h2>
        ${this.buildIssuesList(data.issues)}
      </div>
      ` : ''}
    </div>
  </div>
  
  <script>
    ${this.buildChartScripts(data)}
  </script>
</body>
</html>`
  }

  /**
   * 构建文件表格
   */
  private buildFilesTable(outputs: any[]): string {
    const rows = outputs.map(output => {
      const ext = path.extname(output.file).slice(1)
      const badge = ext === 'js' || ext === 'cjs' ? 'js'
        : ext === 'css' ? 'css'
          : ext === 'map' ? 'map'
            : ext === 'ts' ? 'dts'
              : 'other'

      return `
        <tr>
          <td><span class="badge ${badge}">${ext.toUpperCase()}</span></td>
          <td><code>${output.file}</code></td>
          <td>${this.formatSize(output.size)}</td>
          <td>${output.gzipSize ? this.formatSize(output.gzipSize) : '-'}</td>
          <td>${this.buildSizeBar(output.size, outputs)}</td>
        </tr>
      `
    }).join('')

    return `
      <div class="files-table">
        <table>
          <thead>
            <tr>
              <th>类型</th>
              <th>文件</th>
              <th>大小</th>
              <th>Gzip</th>
              <th>占比</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `
  }

  /**
   * 构建大小条形图
   */
  private buildSizeBar(size: number, outputs: any[]): string {
    const maxSize = Math.max(...outputs.map(o => o.size))
    const percentage = (size / maxSize * 100).toFixed(1)

    return `
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${percentage}%"></div>
      </div>
    `
  }

  /**
   * 构建文件大小图表容器
   */
  private buildFileSizeChart(outputs: any[]): string {
    return `
      <div class="chart-container">
        <canvas id="fileSizeChart" width="800" height="300"></canvas>
      </div>
    `
  }

  /**
   * 构建性能图表
   */
  private buildPerformanceChart(performance: any): string {
    return `
      <div class="chart-container">
        <canvas id="performanceChart" width="800" height="300"></canvas>
      </div>
    `
  }

  /**
   * 构建趋势图表
   */
  private buildTrendsChart(trends: any[]): string {
    return `
      <div class="chart-container">
        <canvas id="trendsChart" width="800" height="300"></canvas>
      </div>
    `
  }

  /**
   * 构建问题列表
   */
  private buildIssuesList(issues: any[]): string {
    return `
      <div style="background: white; padding: 20px; border-radius: 8px;">
        ${issues.map(issue => `
          <div style="margin-bottom: 12px; padding: 12px; background: ${issue.type === 'error' ? '#fee' : '#fef3c7'}; border-radius: 6px;">
            <strong style="color: ${issue.type === 'error' ? '#dc2626' : '#d97706'}">
              ${issue.type === 'error' ? '❌' : '⚠️'} ${issue.message}
            </strong>
            ${issue.file ? `<div style="font-size: 12px; color: #6b7280; margin-top: 4px;">${issue.file}:${issue.line || '?'}</div>` : ''}
          </div>
        `).join('')}
      </div>
    `
  }

  /**
   * 构建图表脚本
   */
  private buildChartScripts(data: EnhancedBuildReportData): string {
    return `
    // 文件大小饼图
    if (document.getElementById('fileSizeChart')) {
      const ctx = document.getElementById('fileSizeChart').getContext('2d')
      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ${JSON.stringify(data.outputs.map(o => path.basename(o.file)))},
          datasets: [{
            data: ${JSON.stringify(data.outputs.map(o => o.size))},
            backgroundColor: [
              '#667eea', '#764ba2', '#f59e0b', '#10b981', '#3b82f6',
              '#8b5cf6', '#ec4899', '#f97316', '#06b6d4', '#84cc16'
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: '文件大小分布'
            },
            legend: {
              position: 'right'
            }
          }
        }
      })
    }
    
    // 性能阶段条形图
    ${data.performance ? `
    if (document.getElementById('performanceChart')) {
      const ctx = document.getElementById('performanceChart').getContext('2d')
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ${JSON.stringify(data.performance.phases.map(p => p.name))},
          datasets: [{
            label: '耗时 (ms)',
            data: ${JSON.stringify(data.performance.phases.map(p => p.duration))},
            backgroundColor: '#667eea'
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: '构建阶段耗时'
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      })
    }
    ` : ''}
    
    // 趋势折线图
    ${data.trends && data.trends.length > 0 ? `
    if (document.getElementById('trendsChart')) {
      const ctx = document.getElementById('trendsChart').getContext('2d')
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ${JSON.stringify(data.trends.map(t => new Date(t.timestamp).toLocaleTimeString()))},
          datasets: [
            {
              label: '包大小 (bytes)',
              data: ${JSON.stringify(data.trends.map(t => t.size))},
              borderColor: '#667eea',
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
              yAxisID: 'y'
            },
            {
              label: '构建时间 (ms)',
              data: ${JSON.stringify(data.trends.map(t => t.duration))},
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true,
          interaction: {
            mode: 'index',
            intersect: false
          },
          plugins: {
            title: {
              display: true,
              text: '构建趋势（最近10次）'
            }
          },
          scales: {
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: {
                display: true,
                text: '包大小'
              }
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              title: {
                display: true,
                text: '构建时间'
              },
              grid: {
                drawOnChartArea: false
              }
            }
          }
        }
      })
    }
    ` : ''}
    `
  }

  /**
   * 生成 JSON 报告
   */
  private async generateJSONReport(data: EnhancedBuildReportData): Promise<void> {
    const jsonPath = path.join(this.outputDir, `report-${Date.now()}.json`)
    await fs.writeJSON(jsonPath, data, { spaces: 2 })
  }

  /**
   * 加载历史记录
   */
  private async loadHistory(): Promise<EnhancedBuildReportData[]> {
    try {
      if (await fs.pathExists(this.historyFile)) {
        return await fs.readJSON(this.historyFile)
      }
    } catch (error) {
      this.logger.debug('加载历史记录失败:', error)
    }
    return []
  }

  /**
   * 保存到历史
   */
  private async saveToHistory(data: EnhancedBuildReportData): Promise<void> {
    const history = await this.loadHistory()
    history.push(data)

    // 保留最近 50 次构建
    if (history.length > 50) {
      history.splice(0, history.length - 50)
    }

    await fs.writeJSON(this.historyFile, history, { spaces: 2 })
  }

  /**
   * 与上次构建对比
   */
  private compareWithPrevious(current: EnhancedBuildReportData, previous: EnhancedBuildReportData): any {
    const currentSize = current.outputs.reduce((sum, o) => sum + o.size, 0)
    const previousSize = previous.outputs.reduce((sum, o) => sum + o.size, 0)

    return {
      previousBuild: {
        timestamp: previous.timestamp,
        duration: previous.duration,
        size: previousSize
      },
      changes: {
        duration: ((current.duration - previous.duration) / previous.duration) * 100,
        size: ((currentSize - previousSize) / previousSize) * 100,
        files: current.outputs.length - previous.outputs.length
      }
    }
  }

  /**
   * 格式化大小
   */
  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  }

  /**
   * 获取状态文本
   */
  private getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      success: '✅ 成功',
      failed: '❌ 失败',
      warning: '⚠️ 警告'
    }
    return statusMap[status] || status
  }
}

/**
 * 创建增强报告生成器
 */
export function createEnhancedBuildReportGenerator(outputDir?: string): EnhancedBuildReportGenerator {
  return new EnhancedBuildReportGenerator(outputDir)
}


