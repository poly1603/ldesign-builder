/**
 * NPM 发布命令
 * 
 * 提供发布到 npm/私有源的功能
 */

import { Command } from 'commander'
import { createNpmPublisher } from '../../core/NpmPublisher'
import { logger } from '../../utils/logger'

/**
 * 发布命令
 */
export const publishCommand = new Command('publish')
  .description('发布到 npm registry')
  .option('-r, --registry <url>', 'npm registry URL')
  .option('-t, --tag <tag>', 'npm tag', 'latest')
  .option('-a, --access <access>', '访问权限 (public/restricted)', 'public')
  .option('--otp <code>', '2FA 验证码')
  .option('--dry-run', '测试运行，不实际发布')
  .option('--skip-validation', '跳过预检查')
  .option('--no-archive', '不归档当前版本')
  .option('--bump <type>', '发布前递增版本 (major/minor/patch/prerelease)')
  .option('--preid <id>', '预发布标识符')
  .action(async (options) => {
    try {
      const publisher = createNpmPublisher(process.cwd())

      // 如果需要递增版本
      if (options.bump) {
        const validTypes = ['major', 'minor', 'patch', 'prerelease']
        if (!validTypes.includes(options.bump)) {
          logger.error(`无效的版本类型: ${options.bump}`)
          process.exit(1)
        }

        logger.info(`📦 发布前递增版本: ${options.bump}`)
        const result = await publisher.bumpAndPublish(options.bump, {
          preid: options.preid,
          registry: options.registry,
          tag: options.tag,
          access: options.access,
          otp: options.otp,
          dryRun: options.dryRun,
          skipValidation: options.skipValidation,
          archiveBefore: options.archive !== false
        })

        printResult(result)
        process.exit(result.success ? 0 : 1)
      }

      // 普通发布
      logger.info('🚀 开始发布...\n')

      const result = await publisher.publish({
        registry: options.registry,
        tag: options.tag,
        access: options.access,
        otp: options.otp,
        dryRun: options.dryRun,
        skipValidation: options.skipValidation,
        archiveBefore: options.archive !== false
      })

      printResult(result)
      process.exit(result.success ? 0 : 1)

    } catch (error) {
      logger.error('发布失败:', error)
      process.exit(1)
    }
  })

/**
 * 检查命令
 */
export const publishCheckCommand = new Command('publish:check')
  .description('执行发布前检查')
  .action(async () => {
    try {
      const publisher = createNpmPublisher(process.cwd())
      logger.info('🔍 执行发布前检查...\n')

      const checks = await publisher.runPrePublishChecks()
      
      let hasError = false
      for (const check of checks) {
        const icon = check.passed 
          ? '✅' 
          : check.severity === 'error' 
            ? '❌' 
            : '⚠️'
        
        console.log(`  ${icon} ${check.name}: ${check.message}`)
        
        if (!check.passed && check.severity === 'error') {
          hasError = true
        }
      }

      console.log('')
      
      if (hasError) {
        logger.error('检查未通过，请修复上述错误后重试')
        process.exit(1)
      } else {
        logger.success('✅ 所有检查通过，可以发布')
      }

    } catch (error) {
      logger.error('检查失败:', error)
      process.exit(1)
    }
  })

/**
 * 发布历史命令
 */
export const publishHistoryCommand = new Command('publish:history')
  .description('显示发布历史')
  .option('-n, --limit <n>', '显示条数', '10')
  .action((options) => {
    const publisher = createNpmPublisher(process.cwd())
    const history = publisher.getPublishHistory()
    const limit = parseInt(options.limit)

    if (history.length === 0) {
      logger.info('暂无发布历史')
      return
    }

    logger.info(`\n📋 发布历史 (最近 ${Math.min(limit, history.length)} 条):\n`)

    const recent = history.slice(-limit).reverse()
    for (const h of recent) {
      const date = new Date(h.publishedAt).toLocaleString()
      const status = h.success ? '✅' : '❌'
      
      console.log(`  ${status} ${h.packageName}@${h.version}`)
      console.log(`     时间: ${date}`)
      console.log(`     Registry: ${h.registry}`)
      console.log(`     Tag: ${h.tag}`)
      if (h.error) {
        console.log(`     错误: ${h.error}`)
      }
      console.log('')
    }
  })

/**
 * 已发布版本命令
 */
export const publishVersionsCommand = new Command('publish:versions')
  .description('查看已发布的版本列表')
  .option('-r, --registry <url>', 'npm registry URL')
  .action(async (options) => {
    try {
      const publisher = createNpmPublisher(process.cwd())
      const pkg = publisher.getPackageInfo()
      
      if (!pkg) {
        logger.error('缺少 package.json')
        process.exit(1)
      }

      logger.info(`🔍 查询 ${pkg.name} 的已发布版本...\n`)
      
      const versions = await publisher.getPublishedVersions(options.registry)
      
      if (versions.length === 0) {
        logger.info('未找到已发布版本')
        return
      }

      logger.info(`已发布 ${versions.length} 个版本:\n`)
      
      // 分组显示
      const groups: Record<string, string[]> = {}
      for (const v of versions) {
        const [major, minor] = v.split('.')
        const key = `${major}.${minor}.x`
        if (!groups[key]) groups[key] = []
        groups[key].push(v)
      }

      for (const [group, vers] of Object.entries(groups).reverse()) {
        console.log(`  ${group}: ${vers.join(', ')}`)
      }

    } catch (error) {
      logger.error('查询失败:', error)
      process.exit(1)
    }
  })

/**
 * Registry 管理命令
 */
export const registryCommand = new Command('registry')
  .description('管理 npm registry')
  .addCommand(
    new Command('list')
      .description('列出可用的 registry')
      .action(() => {
        const publisher = createNpmPublisher(process.cwd())
        const registries = publisher.getRegistries()

        logger.info('\n📡 可用的 Registry:\n')
        
        for (const reg of registries) {
          console.log(`  📦 ${reg.name}`)
          console.log(`     URL: ${reg.url}`)
          console.log(`     认证: ${reg.authType || 'none'}`)
          console.log('')
        }
      })
  )
  .addCommand(
    new Command('add')
      .description('添加自定义 registry')
      .argument('<name>', 'registry 名称')
      .argument('<url>', 'registry URL')
      .option('--token <token>', '认证 token')
      .action((name: string, url: string, options) => {
        const publisher = createNpmPublisher(process.cwd())
        
        publisher.addRegistry({
          name,
          url,
          token: options.token,
          authType: options.token ? 'token' : 'none'
        })

        logger.success(`✅ 已添加 registry: ${name}`)
      })
  )

/**
 * 撤销发布命令
 */
export const unpublishCommand = new Command('unpublish')
  .description('撤销已发布的版本')
  .argument('<version>', '要撤销的版本号')
  .option('--otp <code>', '2FA 验证码')
  .option('-y, --yes', '跳过确认')
  .action(async (version: string, options) => {
    const publisher = createNpmPublisher(process.cwd())
    const pkg = publisher.getPackageInfo()

    if (!pkg) {
      logger.error('缺少 package.json')
      process.exit(1)
    }

    if (!options.yes) {
      logger.warn(`⚠️  将撤销 ${pkg.name}@${version}`)
      logger.warn('此操作不可逆！')
      logger.info('按 Ctrl+C 取消，或等待 5 秒继续...')
      await new Promise(r => setTimeout(r, 5000))
    }

    const success = await publisher.unpublish(version, { otp: options.otp })
    process.exit(success ? 0 : 1)
  })

/**
 * 打印发布结果
 */
function printResult(result: any): void {
  console.log('\n' + '─'.repeat(50))
  
  if (result.success) {
    logger.success(`\n🎉 发布成功!\n`)
    console.log(`  📦 包名: ${result.packageName}`)
    console.log(`  🏷️  版本: ${result.version}`)
    console.log(`  📡 Registry: ${result.registry}`)
    console.log(`  🔖 Tag: ${result.tag}`)
    if (result.tarballUrl) {
      console.log(`  📎 Tarball: ${result.tarballUrl}`)
    }
  } else {
    logger.error(`\n❌ 发布失败\n`)
    console.log(`  错误: ${result.error}`)
  }

  console.log('\n' + '─'.repeat(50))
  
  if (result.logs && result.logs.length > 0) {
    console.log('\n📋 日志:\n')
    for (const log of result.logs.slice(-20)) {
      console.log(`  ${log}`)
    }
  }
}

/**
 * 注册发布命令
 */
export function registerPublishCommands(program: Command): void {
  program.addCommand(publishCommand)
  program.addCommand(publishCheckCommand)
  program.addCommand(publishHistoryCommand)
  program.addCommand(publishVersionsCommand)
  program.addCommand(registryCommand)
  program.addCommand(unpublishCommand)
}
