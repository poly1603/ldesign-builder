/**
 * 构建通知配置命令
 * 
 * 管理构建通知渠道和配置
 */

import { Command } from 'commander'
import { createBuildNotifier, type NotificationConfig } from '../../core/BuildNotifier'
import { logger } from '../../utils/logger'

// ========== 命令定义 ==========

export const notifyCommand = new Command('notify')
  .description('构建通知配置')
  .addCommand(
    new Command('status')
      .description('显示通知配置状态')
      .action(() => {
        const notifier = createBuildNotifier(process.cwd())
        const config = notifier.getConfig()

        console.log('')
        console.log('🔔 构建通知配置')
        console.log('─'.repeat(50))
        console.log(`  通知功能: ${config.enabled ? '✅ 启用' : '❌ 禁用'}`)
        console.log('')
        console.log('📢 通知渠道:')
        console.log(`  桌面通知:   ${config.desktop?.enabled ? '✅' : '❌'}`)
        console.log(`  Webhook:    ${config.webhook?.enabled ? '✅' : '❌'} ${config.webhook?.url || ''}`)
        console.log(`  Slack:      ${config.slack?.enabled ? '✅' : '❌'}`)
        console.log(`  Discord:    ${config.discord?.enabled ? '✅' : '❌'}`)
        console.log(`  飞书:       ${config.feishu?.enabled ? '✅' : '❌'}`)
        console.log(`  钉钉:       ${config.dingtalk?.enabled ? '✅' : '❌'}`)
        console.log(`  企业微信:   ${config.wecom?.enabled ? '✅' : '❌'}`)
        console.log('')
        console.log('🎯 触发条件:')
        console.log(`  构建成功:   ${config.triggers?.onSuccess !== false ? '✅' : '❌'}`)
        console.log(`  构建失败:   ${config.triggers?.onFailure !== false ? '✅' : '❌'}`)
        console.log(`  构建警告:   ${config.triggers?.onWarning !== false ? '✅' : '❌'}`)
        console.log('')
      })
  )
  .addCommand(
    new Command('enable')
      .description('启用通知')
      .action(() => {
        const notifier = createBuildNotifier(process.cwd())
        notifier.updateConfig({ enabled: true })
        logger.success('通知已启用')
      })
  )
  .addCommand(
    new Command('disable')
      .description('禁用通知')
      .action(() => {
        const notifier = createBuildNotifier(process.cwd())
        notifier.updateConfig({ enabled: false })
        logger.success('通知已禁用')
      })
  )
  .addCommand(
    new Command('desktop')
      .description('配置桌面通知')
      .option('--enable', '启用')
      .option('--disable', '禁用')
      .option('--sound', '启用声音')
      .option('--no-sound', '禁用声音')
      .action((options) => {
        const notifier = createBuildNotifier(process.cwd())
        const config = notifier.getConfig()
        
        const desktop: any = { ...config.desktop }
        if (options.enable) desktop.enabled = true
        if (options.disable) desktop.enabled = false
        if (options.sound !== undefined) desktop.sound = options.sound
        
        notifier.updateConfig({ desktop })
        logger.success('桌面通知配置已更新')
      })
  )
  .addCommand(
    new Command('webhook')
      .description('配置 Webhook 通知')
      .option('--enable', '启用')
      .option('--disable', '禁用')
      .option('-u, --url <url>', 'Webhook URL')
      .option('-m, --method <method>', 'HTTP 方法 (GET/POST)', 'POST')
      .action((options) => {
        const notifier = createBuildNotifier(process.cwd())
        const config = notifier.getConfig()
        
        const webhook: any = { ...config.webhook }
        if (options.enable) webhook.enabled = true
        if (options.disable) webhook.enabled = false
        if (options.url) webhook.url = options.url
        if (options.method) webhook.method = options.method
        
        notifier.updateConfig({ webhook })
        logger.success('Webhook 配置已更新')
      })
  )
  .addCommand(
    new Command('slack')
      .description('配置 Slack 通知')
      .option('--enable', '启用')
      .option('--disable', '禁用')
      .option('-u, --url <url>', 'Slack Webhook URL')
      .option('-c, --channel <channel>', '频道名称')
      .option('--username <name>', '机器人名称')
      .action((options) => {
        const notifier = createBuildNotifier(process.cwd())
        const config = notifier.getConfig()
        
        const slack: any = { ...config.slack }
        if (options.enable) slack.enabled = true
        if (options.disable) slack.enabled = false
        if (options.url) slack.webhookUrl = options.url
        if (options.channel) slack.channel = options.channel
        if (options.username) slack.username = options.username
        
        notifier.updateConfig({ slack })
        logger.success('Slack 配置已更新')
      })
  )
  .addCommand(
    new Command('discord')
      .description('配置 Discord 通知')
      .option('--enable', '启用')
      .option('--disable', '禁用')
      .option('-u, --url <url>', 'Discord Webhook URL')
      .action((options) => {
        const notifier = createBuildNotifier(process.cwd())
        const config = notifier.getConfig()
        
        const discord: any = { ...config.discord }
        if (options.enable) discord.enabled = true
        if (options.disable) discord.enabled = false
        if (options.url) discord.webhookUrl = options.url
        
        notifier.updateConfig({ discord })
        logger.success('Discord 配置已更新')
      })
  )
  .addCommand(
    new Command('feishu')
      .description('配置飞书通知')
      .option('--enable', '启用')
      .option('--disable', '禁用')
      .option('-u, --url <url>', '飞书 Webhook URL')
      .action((options) => {
        const notifier = createBuildNotifier(process.cwd())
        const config = notifier.getConfig()
        
        const feishu: any = { ...config.feishu }
        if (options.enable) feishu.enabled = true
        if (options.disable) feishu.enabled = false
        if (options.url) feishu.webhookUrl = options.url
        
        notifier.updateConfig({ feishu })
        logger.success('飞书配置已更新')
      })
  )
  .addCommand(
    new Command('dingtalk')
      .description('配置钉钉通知')
      .option('--enable', '启用')
      .option('--disable', '禁用')
      .option('-u, --url <url>', '钉钉 Webhook URL')
      .option('-s, --secret <secret>', '签名密钥')
      .action((options) => {
        const notifier = createBuildNotifier(process.cwd())
        const config = notifier.getConfig()
        
        const dingtalk: any = { ...config.dingtalk }
        if (options.enable) dingtalk.enabled = true
        if (options.disable) dingtalk.enabled = false
        if (options.url) dingtalk.webhookUrl = options.url
        if (options.secret) dingtalk.secret = options.secret
        
        notifier.updateConfig({ dingtalk })
        logger.success('钉钉配置已更新')
      })
  )
  .addCommand(
    new Command('wecom')
      .description('配置企业微信通知')
      .option('--enable', '启用')
      .option('--disable', '禁用')
      .option('-u, --url <url>', '企业微信 Webhook URL')
      .action((options) => {
        const notifier = createBuildNotifier(process.cwd())
        const config = notifier.getConfig()
        
        const wecom: any = { ...config.wecom }
        if (options.enable) wecom.enabled = true
        if (options.disable) wecom.enabled = false
        if (options.url) wecom.webhookUrl = options.url
        
        notifier.updateConfig({ wecom })
        logger.success('企业微信配置已更新')
      })
  )
  .addCommand(
    new Command('triggers')
      .description('配置触发条件')
      .option('--on-success', '构建成功时通知')
      .option('--no-on-success', '构建成功时不通知')
      .option('--on-failure', '构建失败时通知')
      .option('--no-on-failure', '构建失败时不通知')
      .option('--on-warning', '构建警告时通知')
      .option('--no-on-warning', '构建警告时不通知')
      .action((options) => {
        const notifier = createBuildNotifier(process.cwd())
        const config = notifier.getConfig()
        
        const triggers = { ...config.triggers }
        if (options.onSuccess !== undefined) triggers.onSuccess = options.onSuccess
        if (options.onFailure !== undefined) triggers.onFailure = options.onFailure
        if (options.onWarning !== undefined) triggers.onWarning = options.onWarning
        
        notifier.updateConfig({ triggers })
        logger.success('触发条件已更新')
      })
  )
  .addCommand(
    new Command('test')
      .description('发送测试通知')
      .option('-t, --type <type>', '通知类型 (success/failure/warning/info)', 'info')
      .action(async (options) => {
        const notifier = createBuildNotifier(process.cwd())
        
        console.log('📤 发送测试通知...')
        
        try {
          await notifier.notify({
            type: options.type,
            title: '测试通知',
            message: `这是一条 ${options.type} 类型的测试通知`,
            projectName: 'Test Project',
            timestamp: Date.now()
          })
          logger.success('测试通知已发送')
        } catch (error) {
          logger.error('发送失败:', error)
        }
      })
  )

/**
 * 注册通知命令
 */
export function registerNotifyCommand(program: Command): void {
  program.addCommand(notifyCommand)
}
