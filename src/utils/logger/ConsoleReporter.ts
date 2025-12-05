/**
 * 增强版控制台报告器
 * 
 * 提供美观、清晰、专业的构建控制台输出
 * 
 * @author LDesign Team
 * @version 2.0.0
 */

import chalk from 'chalk'

// ========== 类型定义 ==========

export interface BuildPhase {
  name: string
  status: 'pending' | 'running' | 'success' | 'error' | 'skipped'
  duration?: number
  details?: string
}

export interface FileOutput {
  path: string
  size: number
  gzipSize?: number
  format: string
  isEntry?: boolean
}

export interface BuildSummary {
  success: boolean
  totalDuration: number
  phases: BuildPhase[]
  outputs: FileOutput[]
  warnings: string[]
  errors: string[]
  bundler: string
  mode: string
  libraryType?: string
  cacheHits?: number
  cacheMisses?: number
}

export interface ReporterOptions {
  colors?: boolean
  verbose?: boolean
  showTimestamps?: boolean
  showFileDetails?: boolean
  maxOutputFiles?: number
  compactMode?: boolean
}

// ========== 图标和样式常量 ==========

const ICONS = {
  // 状态图标
  success: '✓',
  error: '✗',
  warning: '⚠',
  info: 'ℹ',
  pending: '○',
  running: '●',
  skipped: '◌',
  
  // 构建相关
  build: '🔨',
  bundle: '📦',
  file: '📄',
  folder: '📁',
  timer: '⏱',
  rocket: '🚀',
  gear: '⚙',
  lightning: '⚡',
  
  // 格式图标
  esm: 'ES',
  cjs: 'CJ',
  umd: 'UM',
  iife: 'IF',
  dts: 'TS',
  
  // 箭头和装饰
  arrow: '→',
  bullet: '•',
  line: '─',
  corner: '└',
  tee: '├',
  vertical: '│'
}

const COLORS = {
  primary: chalk.hex('#6366f1'),      // Indigo
  secondary: chalk.hex('#8b5cf6'),    // Purple
  success: chalk.hex('#10b981'),      // Emerald
  warning: chalk.hex('#f59e0b'),      // Amber
  error: chalk.hex('#ef4444'),        // Red
  info: chalk.hex('#3b82f6'),         // Blue
  muted: chalk.hex('#6b7280'),        // Gray
  highlight: chalk.hex('#06b6d4'),    // Cyan
  white: chalk.hex('#f9fafb'),        // White
  dim: chalk.dim
}

// ========== 工具函数 ==========

/**
 * 格式化文件大小
 */
function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(2))
  return `${size} ${sizes[i]}`
}

/**
 * 格式化持续时间
 */
function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`
  const minutes = Math.floor(ms / 60000)
  const seconds = ((ms % 60000) / 1000).toFixed(1)
  return `${minutes}m ${seconds}s`
}

/**
 * 创建进度条
 */
function createProgressBar(
  percent: number, 
  width: number = 30, 
  useColors: boolean = true
): string {
  const filled = Math.round(width * (percent / 100))
  const empty = width - filled
  
  const filledChar = '█'
  const emptyChar = '░'
  
  const bar = filledChar.repeat(filled) + emptyChar.repeat(empty)
  
  if (useColors) {
    const color = percent === 100 
      ? COLORS.success 
      : percent > 50 
        ? COLORS.highlight 
        : COLORS.warning
    return color(bar)
  }
  
  return bar
}

/**
 * 获取格式徽章
 */
function getFormatBadge(format: string, useColors: boolean = true): string {
  const badges: Record<string, { label: string; color: typeof COLORS.primary }> = {
    esm: { label: ' ESM ', color: COLORS.success },
    es: { label: ' ESM ', color: COLORS.success },
    cjs: { label: ' CJS ', color: COLORS.info },
    commonjs: { label: ' CJS ', color: COLORS.info },
    umd: { label: ' UMD ', color: COLORS.warning },
    iife: { label: 'IIFE ', color: COLORS.secondary },
    dts: { label: ' DTS ', color: COLORS.highlight },
    types: { label: ' DTS ', color: COLORS.highlight }
  }
  
  const badge = badges[format.toLowerCase()] || { label: format.toUpperCase().padEnd(4), color: COLORS.muted }
  
  if (useColors) {
    return badge.color.inverse(badge.label)
  }
  return `[${badge.label.trim()}]`
}

/**
 * 截断路径
 */
function truncatePath(path: string, maxLength: number = 50): string {
  if (path.length <= maxLength) return path
  const parts = path.split('/')
  if (parts.length <= 2) return '...' + path.slice(-(maxLength - 3))
  return parts[0] + '/.../' + parts.slice(-2).join('/')
}

// ========== 主类 ==========

/**
 * 控制台报告器
 */
export class ConsoleReporter {
  private options: Required<ReporterOptions>
  private startTime: number = 0
  private currentPhase: string = ''
  private spinnerFrame: number = 0
  private spinnerInterval: NodeJS.Timeout | null = null
  
  constructor(options: ReporterOptions = {}) {
    this.options = {
      colors: options.colors ?? true,
      verbose: options.verbose ?? false,
      showTimestamps: options.showTimestamps ?? false,
      showFileDetails: options.showFileDetails ?? true,
      maxOutputFiles: options.maxOutputFiles ?? 20,
      compactMode: options.compactMode ?? false
    }
  }
  
  // ========== 构建生命周期方法 ==========
  
  /**
   * 打印构建开始
   */
  printBuildStart(config: {
    bundler: string
    mode: string
    libraryType?: string
    input?: string | string[]
    outputDir?: string
  }): void {
    const { colors } = this.options
    this.startTime = Date.now()
    
    console.log('')
    
    // 头部边框
    const headerLine = colors 
      ? COLORS.primary('╭' + '─'.repeat(56) + '╮')
      : '╭' + '─'.repeat(56) + '╮'
    console.log(headerLine)
    
    // 标题
    const title = `${ICONS.rocket} @ldesign/builder`
    const titlePadded = this.centerText(title, 56)
    console.log(colors 
      ? COLORS.primary('│') + COLORS.white.bold(titlePadded) + COLORS.primary('│')
      : '│' + titlePadded + '│'
    )
    
    // 分隔线
    console.log(colors 
      ? COLORS.primary('├' + '─'.repeat(56) + '┤')
      : '├' + '─'.repeat(56) + '┤'
    )
    
    // 配置信息
    const items = [
      { label: '打包器', value: config.bundler, icon: ICONS.gear },
      { label: '模式', value: config.mode, icon: config.mode === 'production' ? '🏭' : '🔧' },
      { label: '类型', value: config.libraryType || 'auto', icon: ICONS.bundle }
    ]
    
    for (const item of items) {
      const line = `  ${item.icon} ${item.label}: ${item.value}`
      const paddedLine = line.padEnd(54)
      console.log(colors
        ? COLORS.primary('│') + ' ' + COLORS.dim(item.icon + ' ' + item.label + ': ') + COLORS.highlight(item.value) + ' '.repeat(56 - line.length) + COLORS.primary('│')
        : '│ ' + paddedLine + ' │'
      )
    }
    
    // 底部边框
    console.log(colors 
      ? COLORS.primary('╰' + '─'.repeat(56) + '╯')
      : '╰' + '─'.repeat(56) + '╯'
    )
    
    console.log('')
  }
  
  /**
   * 打印构建阶段
   */
  printPhase(phase: string, status: 'start' | 'end' | 'skip', details?: string): void {
    const { colors } = this.options
    
    if (status === 'start') {
      this.currentPhase = phase
      const icon = colors ? COLORS.highlight(ICONS.running) : ICONS.running
      const text = colors ? COLORS.white(phase) : phase
      process.stdout.write(`  ${icon} ${text}...`)
    } else if (status === 'end') {
      const icon = colors ? COLORS.success(ICONS.success) : ICONS.success
      const suffix = details ? (colors ? COLORS.dim(` (${details})`) : ` (${details})`) : ''
      console.log(`\r  ${icon} ${phase}${suffix}`)
    } else if (status === 'skip') {
      const icon = colors ? COLORS.muted(ICONS.skipped) : ICONS.skipped
      const text = colors ? COLORS.muted(phase) : phase
      console.log(`  ${icon} ${text} (跳过)`)
    }
  }
  
  /**
   * 打印进度
   */
  printProgress(current: number, total: number, message?: string): void {
    const { colors } = this.options
    const percent = Math.round((current / total) * 100)
    const bar = createProgressBar(percent, 25, colors)
    const percentText = `${percent}%`.padStart(4)
    const msg = message ? ` ${message}` : ''
    
    process.stdout.write(`\r  ${bar} ${percentText}${msg}`)
    
    if (current >= total) {
      console.log('')
    }
  }
  
  /**
   * 打印输出文件列表
   */
  printOutputFiles(files: FileOutput[]): void {
    const { colors, showFileDetails, maxOutputFiles } = this.options
    
    if (files.length === 0) return
    
    console.log('')
    const title = colors 
      ? COLORS.white.bold(`  ${ICONS.folder} 输出文件`)
      : `  ${ICONS.folder} 输出文件`
    console.log(title)
    console.log('')
    
    // 按格式分组
    const grouped = this.groupFilesByFormat(files)
    const displayFiles = files.slice(0, maxOutputFiles)
    
    for (let i = 0; i < displayFiles.length; i++) {
      const file = displayFiles[i]
      const isLast = i === displayFiles.length - 1
      const prefix = isLast ? ICONS.corner : ICONS.tee
      
      const badge = getFormatBadge(file.format, colors)
      const path = colors ? COLORS.dim(truncatePath(file.path, 40)) : truncatePath(file.path, 40)
      const size = colors ? COLORS.highlight(formatSize(file.size)) : formatSize(file.size)
      const gzip = file.gzipSize 
        ? (colors ? COLORS.muted(` (gzip: ${formatSize(file.gzipSize)})`) : ` (gzip: ${formatSize(file.gzipSize)})`)
        : ''
      const entry = file.isEntry 
        ? (colors ? COLORS.success(' ★') : ' ★')
        : ''
      
      console.log(`    ${prefix} ${badge} ${path} ${ICONS.arrow} ${size}${gzip}${entry}`)
    }
    
    if (files.length > maxOutputFiles) {
      const remaining = files.length - maxOutputFiles
      console.log(colors 
        ? COLORS.muted(`    ... 还有 ${remaining} 个文件`)
        : `    ... 还有 ${remaining} 个文件`
      )
    }
    
    // 打印分组摘要
    if (showFileDetails && Object.keys(grouped).length > 1) {
      console.log('')
      console.log(colors ? COLORS.dim('    格式统计:') : '    格式统计:')
      for (const [format, formatFiles] of Object.entries(grouped)) {
        const totalSize = formatFiles.reduce((sum, f) => sum + f.size, 0)
        const badge = getFormatBadge(format, colors)
        console.log(`      ${badge} ${formatFiles.length} 个文件, ${formatSize(totalSize)}`)
      }
    }
  }
  
  /**
   * 打印构建成功摘要
   */
  printBuildSuccess(summary: BuildSummary): void {
    const { colors } = this.options
    const totalDuration = Date.now() - this.startTime
    
    console.log('')
    
    // 成功边框
    const borderColor = colors ? COLORS.success : (s: string) => s
    console.log(borderColor('╭' + '─'.repeat(56) + '╮'))
    
    // 标题
    const title = `${ICONS.success} 构建成功`
    const titlePadded = this.centerText(title, 56)
    console.log(borderColor('│') + (colors ? COLORS.success.bold(titlePadded) : titlePadded) + borderColor('│'))
    
    // 分隔线
    console.log(borderColor('├' + '─'.repeat(56) + '┤'))
    
    // 统计信息
    const stats = [
      { label: '总耗时', value: formatDuration(totalDuration), icon: ICONS.timer },
      { label: '打包器', value: summary.bundler, icon: ICONS.gear },
      { label: '文件数', value: `${summary.outputs.length} 个`, icon: ICONS.file },
      { label: '总大小', value: formatSize(summary.outputs.reduce((sum, f) => sum + f.size, 0)), icon: ICONS.bundle }
    ]
    
    if (summary.cacheHits !== undefined) {
      const hitRate = summary.cacheHits + (summary.cacheMisses || 0) > 0
        ? Math.round(summary.cacheHits / (summary.cacheHits + (summary.cacheMisses || 0)) * 100)
        : 0
      stats.push({ label: '缓存命中', value: `${hitRate}%`, icon: ICONS.lightning })
    }
    
    for (const stat of stats) {
      const line = `  ${stat.icon} ${stat.label}: ${stat.value}`
      this.printBoxLine(line, 56, borderColor, colors ? COLORS.highlight : (s: string) => s)
    }
    
    // 警告
    if (summary.warnings.length > 0) {
      console.log(borderColor('├' + '─'.repeat(56) + '┤'))
      const warningLine = `  ${ICONS.warning} 警告: ${summary.warnings.length} 个`
      this.printBoxLine(warningLine, 56, borderColor, colors ? COLORS.warning : (s: string) => s)
    }
    
    // 底部边框
    console.log(borderColor('╰' + '─'.repeat(56) + '╯'))
    
    console.log('')
  }
  
  /**
   * 打印构建失败
   */
  printBuildError(error: Error, details?: string[]): void {
    const { colors } = this.options
    
    console.log('')
    
    // 错误边框
    const borderColor = colors ? COLORS.error : (s: string) => s
    console.log(borderColor('╭' + '─'.repeat(56) + '╮'))
    
    // 标题
    const title = `${ICONS.error} 构建失败`
    const titlePadded = this.centerText(title, 56)
    console.log(borderColor('│') + (colors ? COLORS.error.bold(titlePadded) : titlePadded) + borderColor('│'))
    
    // 分隔线
    console.log(borderColor('├' + '─'.repeat(56) + '┤'))
    
    // 错误信息
    const errorMessage = error.message.length > 50 
      ? error.message.substring(0, 47) + '...'
      : error.message
    this.printBoxLine(`  错误: ${errorMessage}`, 56, borderColor)
    
    // 详细信息
    if (details && details.length > 0) {
      console.log(borderColor('├' + '─'.repeat(56) + '┤'))
      for (const detail of details.slice(0, 5)) {
        const truncated = detail.length > 52 ? detail.substring(0, 49) + '...' : detail
        this.printBoxLine(`  ${ICONS.bullet} ${truncated}`, 56, borderColor)
      }
    }
    
    // 底部边框
    console.log(borderColor('╰' + '─'.repeat(56) + '╯'))
    
    console.log('')
  }
  
  /**
   * 打印警告列表
   */
  printWarnings(warnings: string[]): void {
    if (warnings.length === 0) return
    
    const { colors } = this.options
    
    console.log('')
    const title = colors 
      ? COLORS.warning.bold(`  ${ICONS.warning} 警告 (${warnings.length})`)
      : `  ${ICONS.warning} 警告 (${warnings.length})`
    console.log(title)
    
    for (const warning of warnings.slice(0, 10)) {
      const truncated = warning.length > 60 ? warning.substring(0, 57) + '...' : warning
      console.log(colors 
        ? COLORS.warning(`    ${ICONS.bullet} `) + COLORS.dim(truncated)
        : `    ${ICONS.bullet} ${truncated}`
      )
    }
    
    if (warnings.length > 10) {
      console.log(colors
        ? COLORS.muted(`    ... 还有 ${warnings.length - 10} 个警告`)
        : `    ... 还有 ${warnings.length - 10} 个警告`
      )
    }
  }
  
  /**
   * 打印性能报告
   */
  printPerformanceReport(metrics: {
    buildTime: number
    phases: Array<{ name: string; duration: number }>
    memoryPeak?: number
    cacheStats?: { hits: number; misses: number }
  }): void {
    const { colors, verbose } = this.options
    
    if (!verbose) return
    
    console.log('')
    const title = colors 
      ? COLORS.info.bold(`  ${ICONS.timer} 性能报告`)
      : `  ${ICONS.timer} 性能报告`
    console.log(title)
    console.log('')
    
    // 阶段耗时
    const totalTime = metrics.buildTime
    for (const phase of metrics.phases) {
      const percent = Math.round((phase.duration / totalTime) * 100)
      const bar = createProgressBar(percent, 15, colors)
      const duration = formatDuration(phase.duration).padStart(8)
      const percentText = `${percent}%`.padStart(4)
      
      console.log(`    ${phase.name.padEnd(20)} ${bar} ${duration} ${percentText}`)
    }
    
    // 内存使用
    if (metrics.memoryPeak) {
      console.log('')
      console.log(colors
        ? COLORS.dim(`    内存峰值: ${formatSize(metrics.memoryPeak)}`)
        : `    内存峰值: ${formatSize(metrics.memoryPeak)}`
      )
    }
    
    // 缓存统计
    if (metrics.cacheStats) {
      const { hits, misses } = metrics.cacheStats
      const hitRate = hits + misses > 0 ? Math.round(hits / (hits + misses) * 100) : 0
      console.log(colors
        ? COLORS.dim(`    缓存命中率: ${hitRate}% (${hits}/${hits + misses})`)
        : `    缓存命中率: ${hitRate}% (${hits}/${hits + misses})`
      )
    }
  }
  
  // ========== 辅助方法 ==========
  
  /**
   * 居中文本
   */
  private centerText(text: string, width: number): string {
    const visibleLength = this.getVisibleLength(text)
    const padding = Math.max(0, width - visibleLength)
    const leftPad = Math.floor(padding / 2)
    const rightPad = padding - leftPad
    return ' '.repeat(leftPad) + text + ' '.repeat(rightPad)
  }
  
  /**
   * 获取可见字符长度（忽略 ANSI 转义序列）
   */
  private getVisibleLength(str: string): number {
    // eslint-disable-next-line no-control-regex
    return str.replace(/\x1b\[[0-9;]*m/g, '').length
  }
  
  /**
   * 打印边框内的行
   */
  private printBoxLine(
    content: string, 
    width: number, 
    borderColor: (s: string) => string,
    valueColor?: (s: string) => string
  ): void {
    const visibleLength = this.getVisibleLength(content)
    const padding = Math.max(0, width - visibleLength - 2)
    const paddedContent = content + ' '.repeat(padding)
    console.log(borderColor('│') + ' ' + paddedContent + borderColor('│'))
  }
  
  /**
   * 按格式分组文件
   */
  private groupFilesByFormat(files: FileOutput[]): Record<string, FileOutput[]> {
    const grouped: Record<string, FileOutput[]> = {}
    for (const file of files) {
      const format = file.format.toLowerCase()
      if (!grouped[format]) {
        grouped[format] = []
      }
      grouped[format].push(file)
    }
    return grouped
  }
  
  /**
   * 启动加载动画
   */
  startSpinner(message: string): void {
    const spinnerChars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
    const { colors } = this.options
    
    this.spinnerInterval = setInterval(() => {
      const char = spinnerChars[this.spinnerFrame % spinnerChars.length]
      const spinner = colors ? COLORS.highlight(char) : char
      process.stdout.write(`\r  ${spinner} ${message}`)
      this.spinnerFrame++
    }, 80)
  }
  
  /**
   * 停止加载动画
   */
  stopSpinner(success: boolean = true): void {
    if (this.spinnerInterval) {
      clearInterval(this.spinnerInterval)
      this.spinnerInterval = null
    }
    
    const { colors } = this.options
    const icon = success
      ? (colors ? COLORS.success(ICONS.success) : ICONS.success)
      : (colors ? COLORS.error(ICONS.error) : ICONS.error)
    
    process.stdout.write(`\r  ${icon} `)
  }
}

/**
 * 创建控制台报告器实例
 */
export function createConsoleReporter(options?: ReporterOptions): ConsoleReporter {
  return new ConsoleReporter(options)
}

/**
 * 默认控制台报告器实例
 */
export const consoleReporter = new ConsoleReporter()

export default ConsoleReporter
