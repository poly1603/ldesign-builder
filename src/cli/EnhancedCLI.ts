/**
 * 增强的 CLI 工具
 * 
 * 提供美化的输出、进度追踪、交互式提示等功能
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import chalk from 'chalk'
import ora, { Ora } from 'ora'
import type { BuilderConfig } from '../types/config'
import type { BuildResult } from '../types/builder'

/**
 * CLI 主题配置
 */
export interface CLITheme {
  primary: typeof chalk.blue
  success: typeof chalk.green
  warning: typeof chalk.yellow
  error: typeof chalk.red
  info: typeof chalk.cyan
  muted: typeof chalk.gray
}

/**
 * 默认主题
 */
const defaultTheme: CLITheme = {
  primary: chalk.blue,
  success: chalk.green,
  warning: chalk.yellow,
  error: chalk.red,
  info: chalk.cyan,
  muted: chalk.gray
}

/**
 * 进度步骤
 */
export interface ProgressStep {
  id: string
  title: string
  status: 'pending' | 'running' | 'success' | 'error' | 'skipped'
  duration?: number
  error?: Error
}

/**
 * 增强的 CLI 类
 */
export class EnhancedCLI {
  private theme: CLITheme
  private spinner?: Ora
  private steps: Map<string, ProgressStep> = new Map()
  private startTime: number = 0
  private verboseMode: boolean = false

  constructor(theme: Partial<CLITheme> = {}, verbose: boolean = false) {
    this.theme = { ...defaultTheme, ...theme }
    this.verboseMode = verbose
  }

  /**
   * 显示欢迎横幅
   */
  showBanner(): void {
    const banner = `
${chalk.cyan.bold('╔════════════════════════════════════════════════════════╗')}
${chalk.cyan.bold('║')}  ${chalk.white.bold('@ldesign/builder')}                                ${chalk.cyan.bold('║')}
${chalk.cyan.bold('║')}  ${chalk.gray('智能前端库打包工具 - 零配置·极速构建')}      ${chalk.cyan.bold('║')}
${chalk.cyan.bold('╚════════════════════════════════════════════════════════╝')}
    `
    console.log(banner)
  }

  /**
   * 显示配置信息
   */
  showConfig(config: BuilderConfig): void {
    console.log(chalk.bold('\n📋 构建配置:\n'))

    const items = [
      ['入口', this.formatValue(config.input)],
      ['输出', this.formatValue(config.outDir || config.output)],
      ['格式', this.formatValue(config.formats || 'auto')],
      ['打包器', this.formatValue(config.bundler || 'auto')],
      ['模式', this.formatValue(config.mode || 'production')],
      ['压缩', this.formatValue(config.minify !== false)],
      ['Sourcemap', this.formatValue(config.sourcemap !== false)],
    ]

    items.forEach(([label, value]) => {
      console.log(`  ${chalk.gray('•')} ${chalk.cyan(label)}: ${value}`)
    })

    console.log()
  }

  /**
   * 开始构建流程
   */
  startBuild(): void {
    this.startTime = Date.now()
    console.log(chalk.bold.blue('\n🚀 开始构建...\n'))
  }

  /**
   * 添加进度步骤
   */
  addStep(id: string, title: string): void {
    this.steps.set(id, {
      id,
      title,
      status: 'pending'
    })
  }

  /**
   * 开始某个步骤
   */
  startStep(id: string): void {
    const step = this.steps.get(id)
    if (!step) return

    step.status = 'running'
    step.duration = Date.now()

    this.spinner = ora({
      text: chalk.cyan(step.title),
      spinner: 'dots'
    }).start()
  }

  /**
   * 完成某个步骤
   */
  completeStep(id: string, message?: string): void {
    const step = this.steps.get(id)
    if (!step) return

    step.status = 'success'
    step.duration = Date.now() - (step.duration || Date.now())

    if (this.spinner) {
      this.spinner.succeed(
        chalk.green(step.title) + 
        (message ? ` ${chalk.gray(message)}` : '') +
        chalk.gray(` (${this.formatDuration(step.duration)})`)
      )
      this.spinner = undefined
    }
  }

  /**
   * 步骤失败
   */
  failStep(id: string, error: Error): void {
    const step = this.steps.get(id)
    if (!step) return

    step.status = 'error'
    step.error = error
    step.duration = Date.now() - (step.duration || Date.now())

    if (this.spinner) {
      this.spinner.fail(chalk.red(step.title))
      this.spinner = undefined
    }
  }

  /**
   * 跳过某个步骤
   */
  skipStep(id: string, reason?: string): void {
    const step = this.steps.get(id)
    if (!step) return

    step.status = 'skipped'

    console.log(
      chalk.gray('⊘') + ' ' + 
      chalk.gray(step.title) + 
      (reason ? ` ${chalk.gray(`(${reason})`)}` : '')
    )
  }

  /**
   * 显示构建结果
   */
  showBuildResult(result: BuildResult): void {
    const duration = Date.now() - this.startTime

    console.log(chalk.bold.green('\n✨ 构建成功!\n'))

    // 输出文件统计
    if (result.outputs && result.outputs.length > 0) {
      console.log(chalk.bold('📦 输出文件:\n'))

      let totalSize = 0

      result.outputs.forEach(output => {
        const size = output.size || 0
        totalSize += size

        const sizeStr = this.formatFileSize(size)
        const gzipStr = output.gzipSize 
          ? ` ${chalk.gray(`(gzip: ${this.formatFileSize(output.gzipSize)})`)}`
          : ''

        console.log(
          `  ${chalk.gray('•')} ${chalk.cyan(output.fileName)}: ` +
          `${chalk.yellow(sizeStr)}${gzipStr}`
        )
      })

      console.log(
        chalk.gray(`\n  总大小: ${chalk.white(this.formatFileSize(totalSize))}`)
      )
    }

    // 性能统计
    console.log(chalk.bold('\n⏱️  性能统计:\n'))
    console.log(`  ${chalk.gray('•')} 总耗时: ${chalk.cyan(this.formatDuration(duration))}`)

    if (result.stats) {
      if (result.stats.bundleTime) {
        console.log(`  ${chalk.gray('•')} 打包耗时: ${chalk.cyan(this.formatDuration(result.stats.bundleTime))}`)
      }
      if (result.stats.transformTime) {
        console.log(`  ${chalk.gray('•')} 转换耗时: ${chalk.cyan(this.formatDuration(result.stats.transformTime))}`)
      }
    }

    // 显示步骤摘要
    if (this.steps.size > 0) {
      console.log(chalk.bold('\n📊 步骤摘要:\n'))

      const successSteps = Array.from(this.steps.values()).filter(s => s.status === 'success')
      const errorSteps = Array.from(this.steps.values()).filter(s => s.status === 'error')
      const skippedSteps = Array.from(this.steps.values()).filter(s => s.status === 'skipped')

      console.log(`  ${chalk.green('✓')} 成功: ${successSteps.length}`)
      if (errorSteps.length > 0) {
        console.log(`  ${chalk.red('✗')} 失败: ${errorSteps.length}`)
      }
      if (skippedSteps.length > 0) {
        console.log(`  ${chalk.gray('⊘')} 跳过: ${skippedSteps.length}`)
      }
    }

    console.log()
  }

  /**
   * 显示错误
   */
  showError(error: Error | string, context?: string): void {
    console.log()
    console.log(chalk.bold.red('❌ 构建失败\n'))

    if (context) {
      console.log(chalk.gray(`位置: ${context}\n`))
    }

    const message = typeof error === 'string' ? error : error.message
    console.log(chalk.red(message))

    if (error instanceof Error && error.stack && this.verboseMode) {
      console.log(chalk.gray('\n堆栈跟踪:'))
      console.log(chalk.gray(error.stack))
    }

    console.log()
  }

  /**
   * 显示警告
   */
  showWarning(message: string): void {
    console.log(chalk.yellow(`⚠️  ${message}`))
  }

  /**
   * 显示信息
   */
  showInfo(message: string): void {
    console.log(chalk.cyan(`ℹ️  ${message}`))
  }

  /**
   * 显示提示
   */
  showHint(message: string): void {
    console.log(chalk.gray(`💡 ${message}`))
  }

  /**
   * 显示分隔线
   */
  showDivider(): void {
    console.log(chalk.gray('─'.repeat(60)))
  }

  /**
   * 显示表格
   */
  showTable(headers: string[], rows: string[][]): void {
    // 计算列宽
    const colWidths = headers.map((header, i) => {
      const contentWidths = rows.map(row => (row[i] || '').length)
      return Math.max(header.length, ...contentWidths) + 2
    })

    // 显示表头
    const headerRow = headers.map((h, i) => 
      h.padEnd(colWidths[i])
    ).join(' │ ')
    console.log(chalk.bold(headerRow))
    console.log(chalk.gray('─'.repeat(headerRow.length)))

    // 显示行
    rows.forEach(row => {
      const rowStr = row.map((cell, i) => 
        cell.padEnd(colWidths[i])
      ).join(' │ ')
      console.log(rowStr)
    })

    console.log()
  }

  /**
   * 显示进度条
   */
  showProgressBar(current: number, total: number, label?: string): void {
    const percentage = Math.floor((current / total) * 100)
    const barLength = 40
    const filledLength = Math.floor((barLength * current) / total)
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength)

    const text = label ? `${label} ` : ''
    process.stdout.write(
      `\r${text}${chalk.cyan(bar)} ${chalk.yellow(percentage)}% ${chalk.gray(`(${current}/${total})`)}`
    )

    if (current === total) {
      process.stdout.write('\n')
    }
  }

  /**
   * 清除当前行
   */
  clearLine(): void {
    process.stdout.write('\r' + ' '.repeat(80) + '\r')
  }

  /**
   * 格式化值
   */
  private formatValue(value: any): string {
    if (typeof value === 'boolean') {
      return value ? chalk.green('是') : chalk.gray('否')
    }
    if (typeof value === 'string') {
      return chalk.white(value)
    }
    if (Array.isArray(value)) {
      return chalk.white(value.join(', '))
    }
    if (typeof value === 'object' && value !== null) {
      return chalk.white(JSON.stringify(value))
    }
    return chalk.white(String(value))
  }

  /**
   * 格式化文件大小
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
  }

  /**
   * 格式化持续时间
   */
  private formatDuration(ms: number): string {
    if (ms < 1000) {
      return `${ms.toFixed(0)}ms`
    }
    return `${(ms / 1000).toFixed(2)}s`
  }

  /**
   * 询问用户确认
   */
  async confirm(message: string, defaultValue: boolean = false): Promise<boolean> {
    // 这里可以集成 inquirer 或其他交互式库
    // 简化实现：直接返回默认值
    console.log(chalk.yellow(`? ${message} ${defaultValue ? '(Y/n)' : '(y/N)'}`))
    return defaultValue
  }

  /**
   * 显示选择列表
   */
  async select(message: string, choices: string[]): Promise<string> {
    // 这里可以集成 inquirer 或其他交互式库
    // 简化实现：返回第一个选项
    console.log(chalk.yellow(`? ${message}`))
    choices.forEach((choice, i) => {
      console.log(chalk.gray(`  ${i + 1}. ${choice}`))
    })
    return choices[0]
  }

  /**
   * 显示输入提示
   */
  async input(message: string, defaultValue?: string): Promise<string> {
    // 这里可以集成 inquirer 或其他交互式库
    // 简化实现：返回默认值或空字符串
    console.log(chalk.yellow(`? ${message}${defaultValue ? ` (${defaultValue})` : ''}`))
    return defaultValue || ''
  }
}

/**
 * 创建增强 CLI 实例
 */
export function createEnhancedCLI(
  theme?: Partial<CLITheme>,
  verbose?: boolean
): EnhancedCLI {
  return new EnhancedCLI(theme, verbose)
}

/**
 * 默认 CLI 实例
 */
export const cli = new EnhancedCLI()
