/**
 * 性能基准测试命令
 * 
 * 跟踪和分析构建性能
 */

import { Command } from 'commander'
import { resolve } from 'path'
import { writeFileSync } from 'fs'
import { createBuildBenchmark } from '../../core/BuildBenchmark'
import { logger } from '../../utils/logger'

// ========== 工具函数 ==========

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(2) + ' MB'
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return seconds.toFixed(2) + 's'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs.toFixed(0)}s`
}

// ========== 命令定义 ==========

export const benchmarkCommand = new Command('benchmark')
  .alias('bench')
  .description('构建性能基准测试')
  .addCommand(
    new Command('stats')
      .description('显示性能统计')
      .action(() => {
        const benchmark = createBuildBenchmark(process.cwd())
        const stats = benchmark.getStats()

        console.log('')
        console.log('📊 构建性能统计')
        console.log('─'.repeat(50))
        console.log('')
        console.log(`  总构建次数:     ${stats.totalBuilds}`)
        console.log(`  成功率:         ${stats.successRate}%`)
        console.log('')
        console.log(`  平均耗时:       ${formatDuration(stats.avgDuration)}`)
        console.log(`  最短耗时:       ${formatDuration(stats.minDuration)}`)
        console.log(`  最长耗时:       ${formatDuration(stats.maxDuration)}`)
        console.log('')
        console.log(`  平均产物大小:   ${formatSize(stats.avgSize)}`)
        console.log('')
        
        const trendIcon = stats.trend === 'improving' ? '📈' : stats.trend === 'degrading' ? '📉' : '➡️'
        const trendText = stats.trend === 'improving' ? '改善' : stats.trend === 'degrading' ? '下降' : '稳定'
        console.log(`  性能趋势:       ${trendIcon} ${trendText}`)
        console.log('')
        console.log('─'.repeat(50))
        console.log(`  最近一周: ${stats.lastWeekBuilds} 次构建, 平均 ${formatDuration(stats.lastWeekAvgDuration)}`)
        console.log('')
      })
  )
  .addCommand(
    new Command('history')
      .description('显示构建历史')
      .option('-n, --limit <n>', '显示条数', '20')
      .action((options) => {
        const benchmark = createBuildBenchmark(process.cwd())
        const metrics = benchmark.getRecentMetrics(parseInt(options.limit))

        if (metrics.length === 0) {
          console.log('\n暂无构建历史\n')
          return
        }

        console.log('')
        console.log('📋 构建历史')
        console.log('─'.repeat(70))
        console.log(
          '状态'.padEnd(4) +
          '时间'.padEnd(20) +
          '耗时'.padEnd(10) +
          '大小'.padEnd(12) +
          '模式'.padEnd(12) +
          '引擎'
        )
        console.log('─'.repeat(70))

        for (const m of metrics.reverse()) {
          const status = m.success ? '✅' : '❌'
          const time = new Date(m.timestamp).toLocaleString()
          const duration = formatDuration(m.duration)
          const size = formatSize(m.outputSize)
          
          console.log(
            status.padEnd(4) +
            time.padEnd(20) +
            duration.padEnd(10) +
            size.padEnd(12) +
            m.mode.padEnd(12) +
            m.bundler
          )
        }

        console.log('─'.repeat(70))
        console.log('')
      })
  )
  .addCommand(
    new Command('trend')
      .description('显示每日趋势')
      .option('-d, --days <n>', '天数', '14')
      .action((options) => {
        const benchmark = createBuildBenchmark(process.cwd())
        const trends = benchmark.getDailyTrends(parseInt(options.days))

        console.log('')
        console.log('📈 每日构建趋势')
        console.log('─'.repeat(60))
        console.log(
          '日期'.padEnd(12) +
          '构建数'.padEnd(8) +
          '成功率'.padEnd(8) +
          '平均耗时'.padEnd(12) +
          '平均大小'
        )
        console.log('─'.repeat(60))

        for (const t of trends) {
          if (t.buildCount === 0) continue
          
          console.log(
            t.date.padEnd(12) +
            String(t.buildCount).padEnd(8) +
            (t.successRate + '%').padEnd(8) +
            formatDuration(t.avgDuration).padEnd(12) +
            formatSize(t.avgSize)
          )
        }

        console.log('─'.repeat(60))
        console.log('')
      })
  )
  .addCommand(
    new Command('compare')
      .description('比较构建性能')
      .option('--baseline <id>', '基准构建 ID')
      .action((options) => {
        const benchmark = createBuildBenchmark(process.cwd())
        const comparison = benchmark.compareWithBaseline(options.baseline)

        if (!comparison.current) {
          console.log('\n暂无构建记录\n')
          return
        }

        console.log('')
        console.log('📊 构建对比')
        console.log('─'.repeat(50))

        if (comparison.baseline && comparison.comparison) {
          console.log('\n基准构建:')
          console.log(`  时间: ${new Date(comparison.baseline.timestamp).toLocaleString()}`)
          console.log(`  耗时: ${formatDuration(comparison.baseline.duration)}`)
          console.log(`  大小: ${formatSize(comparison.baseline.outputSize)}`)

          console.log('\n当前构建:')
          console.log(`  时间: ${new Date(comparison.current.timestamp).toLocaleString()}`)
          console.log(`  耗时: ${formatDuration(comparison.current.duration)}`)
          console.log(`  大小: ${formatSize(comparison.current.outputSize)}`)

          console.log('\n变化:')
          const durationChange = comparison.comparison.durationChange
          const sizeChange = comparison.comparison.sizeChange
          
          const durationIcon = durationChange < 0 ? '✅' : durationChange > 0 ? '⚠️' : '➡️'
          const sizeIcon = sizeChange < 0 ? '✅' : sizeChange > 0 ? '⚠️' : '➡️'
          
          console.log(`  ${durationIcon} 耗时: ${durationChange > 0 ? '+' : ''}${durationChange.toFixed(1)}%`)
          console.log(`  ${sizeIcon} 大小: ${sizeChange > 0 ? '+' : ''}${sizeChange.toFixed(1)}%`)

          if (comparison.comparison.improved) {
            console.log('\n🎉 性能有所提升!')
          }
        } else {
          console.log('\n当前构建:')
          console.log(`  时间: ${new Date(comparison.current.timestamp).toLocaleString()}`)
          console.log(`  耗时: ${formatDuration(comparison.current.duration)}`)
          console.log(`  大小: ${formatSize(comparison.current.outputSize)}`)
          console.log('\n(需要至少 2 次构建才能进行对比)')
        }

        console.log('')
      })
  )
  .addCommand(
    new Command('report')
      .description('生成性能报告')
      .option('-o, --output <file>', '输出文件', 'benchmark-report.md')
      .action((options) => {
        const benchmark = createBuildBenchmark(process.cwd())
        const report = benchmark.exportReport()

        writeFileSync(resolve(process.cwd(), options.output), report)
        logger.success(`报告已生成: ${options.output}`)
      })
  )
  .addCommand(
    new Command('clear')
      .description('清空历史记录')
      .option('-y, --yes', '跳过确认')
      .action(async (options) => {
        if (!options.yes) {
          const readline = await import('readline')
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
          })
          
          const confirmed = await new Promise<boolean>((resolve) => {
            rl.question('确定清空所有构建历史? [y/N]: ', (answer) => {
              rl.close()
              resolve(answer.toLowerCase() === 'y')
            })
          })
          
          if (!confirmed) {
            console.log('已取消')
            return
          }
        }

        const benchmark = createBuildBenchmark(process.cwd())
        benchmark.clear()
        logger.success('历史记录已清空')
      })
  )

/**
 * 注册基准测试命令
 */
export function registerBenchmarkCommand(program: Command): void {
  program.addCommand(benchmarkCommand)
}
