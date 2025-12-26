/**
 * 基础适配器 Banner 生成器
 * 
 * 提供通用的 Banner/Footer/Intro/Outro 生成功能
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import path from 'path'
import fs from 'fs-extra'
import type { UnifiedConfig } from '../../types/adapter'
import { Logger } from '../../utils/logger'

/**
 * Banner 配置
 */
export interface BannerConfig {
  /** 直接文本 */
  text?: string
  /** 从文件读取 */
  file?: string
  /** 是否自动生成 */
  auto?: boolean
  /** 包含的字段 */
  fields?: Array<'name' | 'version' | 'author' | 'license' | 'date' | 'description'>
  /** 自定义模板 */
  template?: string
  /** Footer 配置 */
  footer?: string | { text?: string; file?: string }
  /** Intro 配置（模块开头） */
  intro?: string
  /** Outro 配置（模块结尾） */
  outro?: string
}

/**
 * 包信息
 */
interface PackageInfo {
  name?: string
  version?: string
  author?: string | { name: string; email?: string }
  license?: string
  description?: string
}

/**
 * 默认 Banner 模板
 */
const DEFAULT_BANNER_TEMPLATE = `/**
 * {{name}} v{{version}}
 * {{description}}
 * 
 * @author {{author}}
 * @license {{license}}
 * @date {{date}}
 */`

/**
 * 基础适配器 Banner 生成器
 */
export class BaseAdapterBannerGenerator {
  private logger: Logger
  private packageInfo: PackageInfo | null = null

  constructor(logger?: Logger) {
    this.logger = logger || new Logger()
  }

  /**
   * 解析 Banner 配置并生成最终文本
   */
  async resolveBanner(bannerConfig: BannerConfig | string | undefined, config?: UnifiedConfig): Promise<string | undefined> {
    if (!bannerConfig) {
      return undefined
    }

    // 如果是字符串，直接返回
    if (typeof bannerConfig === 'string') {
      return bannerConfig
    }

    // 从文件读取
    if (bannerConfig.file) {
      try {
        const filePath = path.resolve(process.cwd(), bannerConfig.file)
        if (await fs.pathExists(filePath)) {
          const content = await fs.readFile(filePath, 'utf-8')
          return this.processTemplate(content)
        }
      } catch (error) {
        this.logger.warn(`读取 Banner 文件失败: ${(error as Error).message}`)
      }
    }

    // 直接文本
    if (bannerConfig.text) {
      return this.processTemplate(bannerConfig.text)
    }

    // 自动生成
    if (bannerConfig.auto) {
      return await this.generateAutoBanner(bannerConfig)
    }

    // 自定义模板
    if (bannerConfig.template) {
      return this.processTemplate(bannerConfig.template)
    }

    return undefined
  }

  /**
   * 解析 Footer
   */
  async resolveFooter(bannerConfig: BannerConfig | undefined): Promise<string | undefined> {
    if (!bannerConfig?.footer) {
      return undefined
    }

    const footer = bannerConfig.footer

    if (typeof footer === 'string') {
      return footer
    }

    if (footer.file) {
      try {
        const filePath = path.resolve(process.cwd(), footer.file)
        if (await fs.pathExists(filePath)) {
          return await fs.readFile(filePath, 'utf-8')
        }
      } catch (error) {
        this.logger.warn(`读取 Footer 文件失败: ${(error as Error).message}`)
      }
    }

    return footer.text
  }

  /**
   * 解析 Intro
   */
  async resolveIntro(bannerConfig: BannerConfig | undefined): Promise<string | undefined> {
    return bannerConfig?.intro
  }

  /**
   * 解析 Outro
   */
  async resolveOutro(bannerConfig: BannerConfig | undefined): Promise<string | undefined> {
    return bannerConfig?.outro
  }

  /**
   * 解析所有 Banner 相关配置
   */
  async resolveAll(config: UnifiedConfig): Promise<{
    banner?: string
    footer?: string
    intro?: string
    outro?: string
  }> {
    const bannerConfig = (config as any).banner as BannerConfig | string | undefined

    return {
      banner: await this.resolveBanner(bannerConfig, config),
      footer: await this.resolveFooter(typeof bannerConfig === 'object' ? bannerConfig : undefined),
      intro: await this.resolveIntro(typeof bannerConfig === 'object' ? bannerConfig : undefined),
      outro: await this.resolveOutro(typeof bannerConfig === 'object' ? bannerConfig : undefined)
    }
  }

  /**
   * 自动生成 Banner
   */
  private async generateAutoBanner(bannerConfig: BannerConfig): Promise<string> {
    const pkgInfo = await this.getPackageInfo()
    const fields = bannerConfig.fields || ['name', 'version', 'author', 'license', 'date']
    const template = bannerConfig.template || DEFAULT_BANNER_TEMPLATE

    return this.processTemplate(template, pkgInfo, fields)
  }

  /**
   * 处理模板
   */
  private processTemplate(
    template: string, 
    pkgInfo?: PackageInfo | null,
    fields?: string[]
  ): string {
    const info = pkgInfo || this.packageInfo || {}
    const date = new Date().toISOString().split('T')[0]

    let result = template

    // 替换模板变量
    const variables: Record<string, string> = {
      name: info.name || 'Unknown',
      version: info.version || '0.0.0',
      author: typeof info.author === 'string' 
        ? info.author 
        : info.author?.name || 'Unknown',
      license: info.license || 'MIT',
      description: info.description || '',
      date
    }

    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
    }

    return result
  }

  /**
   * 获取包信息
   */
  private async getPackageInfo(): Promise<PackageInfo> {
    if (this.packageInfo) {
      return this.packageInfo
    }

    const pkgPath = path.join(process.cwd(), 'package.json')

    try {
      if (await fs.pathExists(pkgPath)) {
        this.packageInfo = await fs.readJSON(pkgPath)
        return this.packageInfo!
      }
    } catch (error) {
      this.logger.debug(`读取 package.json 失败: ${(error as Error).message}`)
    }

    return {}
  }

  /**
   * 生成最小化 Banner（用于压缩后的代码）
   */
  async generateMinimalBanner(): Promise<string> {
    const pkgInfo = await this.getPackageInfo()
    const author = typeof pkgInfo.author === 'string' 
      ? pkgInfo.author 
      : pkgInfo.author?.name || ''

    return `/*! ${pkgInfo.name || ''} v${pkgInfo.version || '0.0.0'} | ${pkgInfo.license || 'MIT'} | ${author} */`
  }

  /**
   * 为 CSS 文件生成 Banner
   */
  async generateCssBanner(): Promise<string> {
    const pkgInfo = await this.getPackageInfo()
    
    return `/**
 * ${pkgInfo.name || 'Styles'} v${pkgInfo.version || '0.0.0'}
 * @license ${pkgInfo.license || 'MIT'}
 */`
  }
}
