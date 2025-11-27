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
import { LOG_ICONS, BUILD_SUMMARY_FORMAT } from '../../constants/log-config'
import type { BuildSummaryData } from './logger-types'
import type { Logger } from './Logger'

/** 状态图标映射 */
const STATUS_ICONS: Record<BuildSummaryData['status'], string> = {
  success: LOG_ICONS.SUCCESS,
  failed: LOG_ICONS.ERROR,
  warning: LOG_ICONS.WARNING,
}

/** 状态颜色映射 */
const STATUS_COLORS: Record<BuildSummaryData['status'], typeof chalk.green> = {
  success: chalk.green,
  failed: chalk.red,
  warning: chalk.yellow,
}

/**
 * 使用指定的 Logger 实例输出构建摘要信息
 *
 * @param logger - 日志记录器实例
 * @param data - 构建摘要数据
 */
export function renderBuildSummary(logger: Logger, data: BuildSummaryData): void {
  const { STATUS_LABELS, FIELD_LABELS } = BUILD_SUMMARY_FORMAT

  logger.newLine()
  logger.divider('═', 60)

  // ========== 显示构建状态 ==========
  const statusIcon = STATUS_ICONS[data.status]
  const statusColor = STATUS_COLORS[data.status]
  const statusLabel = STATUS_LABELS[data.status]
  const statusText = statusColor.bold(`${statusIcon} 构建${statusLabel}`)

  console.log(statusText)
  logger.divider('─', 60)

  // ========== 显示构建信息 ==========
  console.log(`  ${FIELD_LABELS.duration}:   ${chalk.yellow(formatDuration(data.duration))}`)
  console.log(`  ${FIELD_LABELS.fileCount}: ${chalk.cyan(data.fileCount)} 个`)
  console.log(`  ${FIELD_LABELS.totalSize}: ${chalk.cyan(formatBytes(data.totalSize))}`)

  // ========== 显示警告和错误 ==========
  if (data.warnings && data.warnings > 0) {
    console.log(`  ${FIELD_LABELS.warnings}:   ${chalk.yellow(data.warnings)} 个`)
  }

  if (data.errors && data.errors > 0) {
    console.log(`  ${FIELD_LABELS.errors}:   ${chalk.red(data.errors)} 个`)
  }

  logger.divider('═', 60)
  logger.newLine()
}

