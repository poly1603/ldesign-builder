/**
 * 版本管理命令
 * 
 * 提供版本号管理、归档、恢复等功能
 */

import { Command } from 'commander'
import { createVersionManager } from '../../core/VersionManager'
import { logger } from '../../utils/logger'

/**
 * 版本管理命令
 */
export const versionCommand = new Command('version')
  .description('版本管理')
  .addCommand(
    new Command('show')
      .description('显示当前版本')
      .action(() => {
        const vm = createVersionManager(process.cwd())
        const version = vm.getCurrentVersion()
        logger.info(`当前版本: ${version}`)
      })
  )
  .addCommand(
    new Command('bump')
      .description('递增版本号')
      .argument('<type>', '版本类型: major, minor, patch, prerelease')
      .option('--preid <id>', '预发布标识符 (如 alpha, beta, rc)')
      .action((type: string, options) => {
        const vm = createVersionManager(process.cwd())
        const validTypes = ['major', 'minor', 'patch', 'prerelease']
        
        if (!validTypes.includes(type)) {
          logger.error(`无效的版本类型: ${type}`)
          logger.info(`有效类型: ${validTypes.join(', ')}`)
          process.exit(1)
        }

        const newVersion = vm.bumpVersion(type as any, options.preid)
        logger.success(`版本已更新: ${newVersion}`)
      })
  )
  .addCommand(
    new Command('set')
      .description('设置版本号')
      .argument('<version>', '新版本号')
      .action((version: string) => {
        const vm = createVersionManager(process.cwd())
        vm.updateVersion(version)
        logger.success(`版本已设置: ${version}`)
      })
  )
  .addCommand(
    new Command('history')
      .description('显示版本历史')
      .option('-n, --limit <n>', '显示条数', '10')
      .action((options) => {
        const vm = createVersionManager(process.cwd())
        const history = vm.getVersionHistory()
        const limit = parseInt(options.limit)
        
        if (history.length === 0) {
          logger.info('暂无版本历史')
          return
        }

        logger.info(`\n📋 版本历史 (最近 ${Math.min(limit, history.length)} 条):\n`)
        
        const recent = history.slice(-limit).reverse()
        for (const v of recent) {
          const date = new Date(v.timestamp).toLocaleString()
          const status = v.success ? '✅' : '❌'
          const size = formatSize(v.totalSize)
          
          console.log(`  ${status} v${v.version}`)
          console.log(`     时间: ${date}`)
          console.log(`     引擎: ${v.bundler} | 模式: ${v.mode}`)
          console.log(`     耗时: ${v.duration.toFixed(2)}s | 大小: ${size}`)
          console.log('')
        }
      })
  )
  .addCommand(
    new Command('archive')
      .description('归档当前版本')
      .option('-n, --notes <notes>', '归档备注')
      .action(async (options) => {
        try {
          const vm = createVersionManager(process.cwd())
          logger.info('📦 正在归档当前版本...')
          
          const archive = await vm.archiveCurrentBuild({
            notes: options.notes
          })
          
          logger.success(`\n归档完成!`)
          logger.info(`  版本: ${archive.version}`)
          logger.info(`  路径: ${archive.archivePath}`)
          logger.info(`  大小: ${formatSize(archive.archiveSize)}`)
          logger.info(`  压缩率: ${(archive.compressionRatio * 100).toFixed(1)}%`)
        } catch (error) {
          logger.error('归档失败:', error)
          process.exit(1)
        }
      })
  )
  .addCommand(
    new Command('archives')
      .description('列出所有归档')
      .action(() => {
        const vm = createVersionManager(process.cwd())
        const archives = vm.getArchives()
        
        if (archives.length === 0) {
          logger.info('暂无归档')
          return
        }

        logger.info(`\n📚 归档列表 (${archives.length} 个):\n`)
        
        for (const a of archives) {
          const date = new Date(a.createdAt).toLocaleString()
          console.log(`  📦 v${a.version}`)
          console.log(`     时间: ${date}`)
          console.log(`     大小: ${formatSize(a.archiveSize)} (原始: ${formatSize(a.originalSize)})`)
          if ((a as any).notes) {
            console.log(`     备注: ${(a as any).notes}`)
          }
          console.log('')
        }
      })
  )
  .addCommand(
    new Command('restore')
      .description('恢复指定版本')
      .argument('<version>', '要恢复的版本号')
      .option('-y, --yes', '跳过确认')
      .action(async (version: string, options) => {
        const vm = createVersionManager(process.cwd())
        
        if (!options.yes) {
          logger.warn(`⚠️  将恢复到版本 ${version}，当前版本会自动备份`)
          logger.info('按 Ctrl+C 取消，或等待 5 秒继续...')
          await new Promise(r => setTimeout(r, 5000))
        }

        try {
          await vm.restoreVersion(version)
          logger.success(`✅ 已恢复到版本: ${version}`)
        } catch (error) {
          logger.error('恢复失败:', error)
          process.exit(1)
        }
      })
  )
  .addCommand(
    new Command('clean-archives')
      .description('清理所有归档')
      .option('-y, --yes', '跳过确认')
      .action(async (options) => {
        const vm = createVersionManager(process.cwd())
        
        if (!options.yes) {
          const stats = vm.getArchiveStats()
          logger.warn(`⚠️  将删除 ${stats.totalArchives} 个归档 (${formatSize(stats.totalSize)})`)
          logger.info('按 Ctrl+C 取消，或等待 5 秒继续...')
          await new Promise(r => setTimeout(r, 5000))
        }

        vm.clearAllArchives()
        logger.success('✅ 归档已清理')
      })
  )

/**
 * 格式化文件大小
 */
function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(2) + ' MB'
}

/**
 * 注册版本命令
 */
export function registerVersionCommand(program: Command): void {
  program.addCommand(versionCommand)
}
