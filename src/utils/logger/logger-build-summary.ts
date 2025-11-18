/**
 * 构建摘要展示工具函数
 *
 * 【功能描述】
 * 将 Logger 的构建结果摘要展示逻辑从核心类中拆分出来，
 * 便于复用和单元测试，同时保持 Logger.showBuildSummary 的行为不变。
 *
 * @module utils/logger/logger-build-summary
 */

import chalk from 'chalk'
import { formatDuration, formatBytes } from './formatters'
import type { BuildSummaryData } from './logger-types'
import type { Logger } from './Logger'

/**
 * 使用指定的 Logger 实例输出构建摘要信息
 *
 * @param logger - 日志记录器实例
 * @param data - 构建摘要数据
 */
export function renderBuildSummary(logger: Logger, data: BuildSummaryData): void {
  logger.newLine()
  logger.divider('=', 60)

  // ========== 显示构建状态 ==========
  const statusIcon = data.status === 'success' ? '✓' : data.status === 'failed' ? '✗' : '⚠'
  const statusColor = data.status === 'success'
    ? chalk.green
    : data.status === 'failed'
      ? chalk.red
      : chalk.yellow
  const statusText = statusColor.bold(
    `${statusIcon} 构建${data.status === 'success' ? '成功' : data.status === 'failed' ? '失败' : '完成（有警告）'}`
  )

  console.log(statusText)
  logger.divider('-', 60)

  // ========== 显示构建信息 ==========
  console.log(`⏱  耗时: ${chalk.yellow(formatDuration(data.duration))}`)
  console.log(`📦 文件: ${chalk.cyan(data.fileCount)} 个`)
  console.log(`📊 总大小: ${chalk.cyan(formatBytes(data.totalSize))}`)

  // ========== 显示警告和错误 ==========
  if (data.warnings && data.warnings > 0) {
    console.log(`⚠️  警告: ${chalk.yellow(data.warnings)} 个`)
  }

  if (data.errors && data.errors > 0) {
    console.log(`❌ 错误: ${chalk.red(data.errors)} 个`)
  }

  logger.divider('=', 60)
  logger.newLine()
}

