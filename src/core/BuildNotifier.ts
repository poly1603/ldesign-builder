/**
 * 构建通知器
 * 
 * 支持多种通知方式：Webhook、桌面通知、邮件等
 */

import { execSync } from 'child_process'
import { resolve, join } from 'path'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import https from 'https'
import http from 'http'

// ========== 类型定义 ==========

export interface NotificationConfig {
  enabled: boolean
  
  // 桌面通知
  desktop?: {
    enabled: boolean
    sound?: boolean
  }
  
  // Webhook 通知
  webhook?: {
    enabled: boolean
    url: string
    method?: 'GET' | 'POST'
    headers?: Record<string, string>
    template?: string
  }
  
  // Slack 通知
  slack?: {
    enabled: boolean
    webhookUrl: string
    channel?: string
    username?: string
    iconEmoji?: string
  }
  
  // Discord 通知
  discord?: {
    enabled: boolean
    webhookUrl: string
  }
  
  // 飞书通知
  feishu?: {
    enabled: boolean
    webhookUrl: string
  }
  
  // 钉钉通知
  dingtalk?: {
    enabled: boolean
    webhookUrl: string
    secret?: string
  }
  
  // 企业微信通知
  wecom?: {
    enabled: boolean
    webhookUrl: string
  }

  // 通知触发条件
  triggers?: {
    onSuccess?: boolean
    onFailure?: boolean
    onWarning?: boolean
  }
}

export interface BuildNotification {
  type: 'success' | 'failure' | 'warning' | 'info'
  title: string
  message: string
  projectName: string
  version?: string
  duration?: number
  outputSize?: number
  timestamp: number
  details?: Record<string, any>
}

// ========== 默认配置 ==========

const DEFAULT_CONFIG: NotificationConfig = {
  enabled: true,
  desktop: {
    enabled: true,
    sound: true
  },
  triggers: {
    onSuccess: true,
    onFailure: true,
    onWarning: true
  }
}

// ========== 构建通知器类 ==========

export class BuildNotifier {
  private projectPath: string
  private config: NotificationConfig
  private configPath: string

  constructor(projectPath: string, config?: Partial<NotificationConfig>) {
    this.projectPath = projectPath
    this.configPath = resolve(projectPath, '.ldesign', 'notification.json')
    this.config = this.loadConfig(config)
  }

  /**
   * 加载配置
   */
  private loadConfig(override?: Partial<NotificationConfig>): NotificationConfig {
    let saved: Partial<NotificationConfig> = {}
    
    if (existsSync(this.configPath)) {
      try {
        saved = JSON.parse(readFileSync(this.configPath, 'utf-8'))
      } catch {}
    }

    return { ...DEFAULT_CONFIG, ...saved, ...override }
  }

  /**
   * 保存配置
   */
  saveConfig(): void {
    const dir = resolve(this.projectPath, '.ldesign')
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    writeFileSync(this.configPath, JSON.stringify(this.config, null, 2))
  }

  /**
   * 获取配置
   */
  getConfig(): NotificationConfig {
    return this.config
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<NotificationConfig>): void {
    this.config = { ...this.config, ...config }
    this.saveConfig()
  }

  /**
   * 发送通知
   */
  async notify(notification: BuildNotification): Promise<void> {
    if (!this.config.enabled) return

    // 检查触发条件
    const triggers = this.config.triggers || {}
    if (notification.type === 'success' && !triggers.onSuccess) return
    if (notification.type === 'failure' && !triggers.onFailure) return
    if (notification.type === 'warning' && !triggers.onWarning) return

    const promises: Promise<void>[] = []

    // 桌面通知
    if (this.config.desktop?.enabled) {
      promises.push(this.sendDesktopNotification(notification))
    }

    // Webhook
    if (this.config.webhook?.enabled && this.config.webhook.url) {
      promises.push(this.sendWebhook(notification))
    }

    // Slack
    if (this.config.slack?.enabled && this.config.slack.webhookUrl) {
      promises.push(this.sendSlackNotification(notification))
    }

    // Discord
    if (this.config.discord?.enabled && this.config.discord.webhookUrl) {
      promises.push(this.sendDiscordNotification(notification))
    }

    // 飞书
    if (this.config.feishu?.enabled && this.config.feishu.webhookUrl) {
      promises.push(this.sendFeishuNotification(notification))
    }

    // 钉钉
    if (this.config.dingtalk?.enabled && this.config.dingtalk.webhookUrl) {
      promises.push(this.sendDingtalkNotification(notification))
    }

    // 企业微信
    if (this.config.wecom?.enabled && this.config.wecom.webhookUrl) {
      promises.push(this.sendWecomNotification(notification))
    }

    await Promise.allSettled(promises)
  }

  /**
   * 发送桌面通知
   */
  private async sendDesktopNotification(notification: BuildNotification): Promise<void> {
    const { title, message, type } = notification
    const icon = type === 'success' ? '✅' : type === 'failure' ? '❌' : '⚠️'

    try {
      if (process.platform === 'darwin') {
        // macOS
        const script = `display notification "${message}" with title "${icon} ${title}"`
        execSync(`osascript -e '${script}'`)
      } else if (process.platform === 'win32') {
        // Windows - 使用 PowerShell
        const ps = `
          [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
          $template = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02)
          $textNodes = $template.GetElementsByTagName("text")
          $textNodes.Item(0).AppendChild($template.CreateTextNode("${title}")) | Out-Null
          $textNodes.Item(1).AppendChild($template.CreateTextNode("${message}")) | Out-Null
          $toast = [Windows.UI.Notifications.ToastNotification]::new($template)
          [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("LDesign Builder").Show($toast)
        `
        execSync(`powershell -Command "${ps.replace(/\n/g, ' ')}"`, { stdio: 'ignore' })
      } else {
        // Linux - 使用 notify-send
        execSync(`notify-send "${icon} ${title}" "${message}"`, { stdio: 'ignore' })
      }
    } catch {
      // 桌面通知失败不抛出错误
    }
  }

  /**
   * 发送 Webhook 通知
   */
  private async sendWebhook(notification: BuildNotification): Promise<void> {
    const { url, method = 'POST', headers = {} } = this.config.webhook!

    const payload = JSON.stringify({
      ...notification,
      source: 'ldesign-builder'
    })

    await this.httpRequest(url, method, payload, {
      'Content-Type': 'application/json',
      ...headers
    })
  }

  /**
   * 发送 Slack 通知
   */
  private async sendSlackNotification(notification: BuildNotification): Promise<void> {
    const { webhookUrl, channel, username, iconEmoji } = this.config.slack!
    const { title, message, type, projectName, duration, outputSize } = notification

    const color = type === 'success' ? '#36a64f' : type === 'failure' ? '#dc3545' : '#ffc107'
    const emoji = type === 'success' ? ':white_check_mark:' : type === 'failure' ? ':x:' : ':warning:'

    const payload = {
      channel,
      username: username || 'LDesign Builder',
      icon_emoji: iconEmoji || ':package:',
      attachments: [{
        color,
        title: `${emoji} ${title}`,
        text: message,
        fields: [
          { title: '项目', value: projectName, short: true },
          { title: '耗时', value: duration ? `${duration.toFixed(2)}s` : '-', short: true },
          { title: '产物大小', value: outputSize ? this.formatSize(outputSize) : '-', short: true }
        ],
        footer: 'LDesign Builder',
        ts: Math.floor(notification.timestamp / 1000)
      }]
    }

    await this.httpRequest(webhookUrl, 'POST', JSON.stringify(payload), {
      'Content-Type': 'application/json'
    })
  }

  /**
   * 发送 Discord 通知
   */
  private async sendDiscordNotification(notification: BuildNotification): Promise<void> {
    const { webhookUrl } = this.config.discord!
    const { title, message, type, projectName, duration, outputSize } = notification

    const color = type === 'success' ? 0x36a64f : type === 'failure' ? 0xdc3545 : 0xffc107

    const payload = {
      embeds: [{
        title,
        description: message,
        color,
        fields: [
          { name: '项目', value: projectName, inline: true },
          { name: '耗时', value: duration ? `${duration.toFixed(2)}s` : '-', inline: true },
          { name: '大小', value: outputSize ? this.formatSize(outputSize) : '-', inline: true }
        ],
        footer: { text: 'LDesign Builder' },
        timestamp: new Date(notification.timestamp).toISOString()
      }]
    }

    await this.httpRequest(webhookUrl, 'POST', JSON.stringify(payload), {
      'Content-Type': 'application/json'
    })
  }

  /**
   * 发送飞书通知
   */
  private async sendFeishuNotification(notification: BuildNotification): Promise<void> {
    const { webhookUrl } = this.config.feishu!
    const { title, message, type, projectName, duration, outputSize } = notification

    const color = type === 'success' ? 'green' : type === 'failure' ? 'red' : 'yellow'

    const payload = {
      msg_type: 'interactive',
      card: {
        header: {
          title: { content: title, tag: 'plain_text' },
          template: color
        },
        elements: [
          {
            tag: 'div',
            text: { content: message, tag: 'plain_text' }
          },
          {
            tag: 'div',
            fields: [
              { is_short: true, text: { content: `**项目:** ${projectName}`, tag: 'lark_md' } },
              { is_short: true, text: { content: `**耗时:** ${duration?.toFixed(2) || '-'}s`, tag: 'lark_md' } },
              { is_short: true, text: { content: `**大小:** ${outputSize ? this.formatSize(outputSize) : '-'}`, tag: 'lark_md' } }
            ]
          }
        ]
      }
    }

    await this.httpRequest(webhookUrl, 'POST', JSON.stringify(payload), {
      'Content-Type': 'application/json'
    })
  }

  /**
   * 发送钉钉通知
   */
  private async sendDingtalkNotification(notification: BuildNotification): Promise<void> {
    const { webhookUrl } = this.config.dingtalk!
    const { title, message, type, projectName, duration, outputSize } = notification

    const emoji = type === 'success' ? '✅' : type === 'failure' ? '❌' : '⚠️'

    const payload = {
      msgtype: 'markdown',
      markdown: {
        title: `${emoji} ${title}`,
        text: `### ${emoji} ${title}\n\n${message}\n\n- **项目:** ${projectName}\n- **耗时:** ${duration?.toFixed(2) || '-'}s\n- **大小:** ${outputSize ? this.formatSize(outputSize) : '-'}`
      }
    }

    await this.httpRequest(webhookUrl, 'POST', JSON.stringify(payload), {
      'Content-Type': 'application/json'
    })
  }

  /**
   * 发送企业微信通知
   */
  private async sendWecomNotification(notification: BuildNotification): Promise<void> {
    const { webhookUrl } = this.config.wecom!
    const { title, message, type, projectName, duration, outputSize } = notification

    const emoji = type === 'success' ? '✅' : type === 'failure' ? '❌' : '⚠️'

    const payload = {
      msgtype: 'markdown',
      markdown: {
        content: `### ${emoji} ${title}\n\n${message}\n\n> 项目: ${projectName}\n> 耗时: ${duration?.toFixed(2) || '-'}s\n> 大小: ${outputSize ? this.formatSize(outputSize) : '-'}`
      }
    }

    await this.httpRequest(webhookUrl, 'POST', JSON.stringify(payload), {
      'Content-Type': 'application/json'
    })
  }

  /**
   * HTTP 请求
   */
  private httpRequest(url: string, method: string, body: string, headers: Record<string, string>): Promise<void> {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url)
      const client = urlObj.protocol === 'https:' ? https : http

      const req = client.request({
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method,
        headers: {
          ...headers,
          'Content-Length': Buffer.byteLength(body)
        }
      }, (res) => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve()
        } else {
          reject(new Error(`HTTP ${res.statusCode}`))
        }
      })

      req.on('error', reject)
      req.write(body)
      req.end()
    })
  }

  /**
   * 格式化文件大小
   */
  private formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1024 / 1024).toFixed(2) + ' MB'
  }

  /**
   * 构建成功通知
   */
  async notifySuccess(projectName: string, duration: number, outputSize?: number, version?: string): Promise<void> {
    await this.notify({
      type: 'success',
      title: '构建成功',
      message: `${projectName} 构建完成，耗时 ${duration.toFixed(2)} 秒`,
      projectName,
      version,
      duration,
      outputSize,
      timestamp: Date.now()
    })
  }

  /**
   * 构建失败通知
   */
  async notifyFailure(projectName: string, error: string, duration?: number): Promise<void> {
    await this.notify({
      type: 'failure',
      title: '构建失败',
      message: `${projectName} 构建失败: ${error}`,
      projectName,
      duration,
      timestamp: Date.now(),
      details: { error }
    })
  }

  /**
   * 构建警告通知
   */
  async notifyWarning(projectName: string, message: string): Promise<void> {
    await this.notify({
      type: 'warning',
      title: '构建警告',
      message: `${projectName}: ${message}`,
      projectName,
      timestamp: Date.now()
    })
  }
}

/**
 * 创建构建通知器实例
 */
export function createBuildNotifier(projectPath: string, config?: Partial<NotificationConfig>): BuildNotifier {
  return new BuildNotifier(projectPath, config)
}
