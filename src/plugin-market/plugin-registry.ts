/**
 * 插件注册中心
 * 
 * 提供插件发现、版本管理、依赖解析功能
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import { Logger } from '../utils/logger'
import type { BuilderConfig } from '../types/config'
import path from 'path'
import fs from 'fs-extra'

/**
 * 插件元数据
 */
export interface PluginMetadata {
  /** 插件名称 */
  name: string

  /** 版本 */
  version: string

  /** 描述 */
  description: string

  /** 作者 */
  author: string

  /** 标签 */
  tags: string[]

  /** 依赖 */
  dependencies?: Record<string, string>

  /** peer 依赖 */
  peerDependencies?: Record<string, string>

  /** 支持的框架 */
  frameworks?: string[]

  /** 支持的打包器 */
  bundlers?: string[]

  /** npm 包名 */
  package: string

  /** 仓库地址 */
  repository?: string

  /** 主页 */
  homepage?: string

  /** 许可证 */
  license?: string

  /** 下载次数 */
  downloads?: number

  /** 评分 */
  rating?: number
}

/**
 * 插件注册中心
 */
export class PluginRegistry {
  private plugins: Map<string, PluginMetadata> = new Map()
  private logger: Logger
  private registryPath: string

  constructor(registryPath?: string) {
    this.logger = new Logger({ prefix: 'PluginRegistry' })
    this.registryPath = registryPath || path.join(
      process.cwd(),
      'node_modules',
      '.cache',
      '@ldesign',
      'plugin-registry.json'
    )

    this.loadRegistry()
  }

  /**
   * 加载注册表
   */
  private async loadRegistry(): Promise<void> {
    try {
      if (await fs.pathExists(this.registryPath)) {
        const data = await fs.readJSON(this.registryPath)

        for (const plugin of data.plugins || []) {
          this.plugins.set(plugin.name, plugin)
        }

        this.logger.debug(`加载了 ${this.plugins.size} 个插件`)
      } else {
        // 注册默认插件
        this.registerDefaultPlugins()
      }
    } catch (error) {
      this.logger.warn('加载插件注册表失败:', error)
      this.registerDefaultPlugins()
    }
  }

  /**
   * 注册默认插件
   */
  private registerDefaultPlugins(): void {
    const defaultPlugins: PluginMetadata[] = [
      {
        name: 'image-optimizer',
        version: '1.0.0',
        description: '图片自动优化和格式转换',
        author: 'LDesign Team',
        tags: ['image', 'optimization', 'webp', 'avif'],
        package: '@ldesign/builder-plugin-image-optimizer',
        frameworks: ['vue', 'react', 'svelte', 'solid'],
        bundlers: ['rollup', 'rolldown', 'esbuild', 'swc']
      },
      {
        name: 'svg-optimizer',
        version: '1.0.0',
        description: 'SVG 优化和组件生成',
        author: 'LDesign Team',
        tags: ['svg', 'optimization', 'sprite'],
        package: '@ldesign/builder-plugin-svg-optimizer',
        frameworks: ['vue', 'react', 'svelte'],
        bundlers: ['rollup', 'rolldown', 'esbuild']
      },
      {
        name: 'i18n-extractor',
        version: '1.0.0',
        description: '自动提取和管理国际化资源',
        author: 'LDesign Team',
        tags: ['i18n', 'translation', 'localization'],
        package: '@ldesign/builder-plugin-i18n',
        frameworks: ['vue', 'react', 'svelte', 'solid'],
        bundlers: ['rollup', 'rolldown']
      },
      {
        name: 'tailwind-plugin',
        version: '1.0.0',
        description: 'Tailwind CSS 集成',
        author: 'LDesign Team',
        tags: ['css', 'tailwind', 'utility'],
        package: '@ldesign/builder-plugin-tailwind',
        frameworks: ['vue', 'react', 'svelte', 'solid'],
        bundlers: ['rollup', 'rolldown', 'esbuild']
      }
    ]

    for (const plugin of defaultPlugins) {
      this.plugins.set(plugin.name, plugin)
    }
  }

  /**
   * 搜索插件
   */
  search(query: string, filters?: {
    tags?: string[]
    frameworks?: string[]
    bundlers?: string[]
  }): PluginMetadata[] {
    let results = Array.from(this.plugins.values())

    // 文本搜索
    if (query) {
      const lowerQuery = query.toLowerCase()
      results = results.filter(p =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.tags.some(t => t.toLowerCase().includes(lowerQuery))
      )
    }

    // 标签过滤
    if (filters?.tags && filters.tags.length > 0) {
      results = results.filter(p =>
        filters.tags!.some(tag => p.tags.includes(tag))
      )
    }

    // 框架过滤
    if (filters?.frameworks && filters.frameworks.length > 0) {
      results = results.filter(p =>
        p.frameworks && filters.frameworks!.some(f => p.frameworks!.includes(f))
      )
    }

    // 打包器过滤
    if (filters?.bundlers && filters.bundlers.length > 0) {
      results = results.filter(p =>
        p.bundlers && filters.bundlers!.some(b => p.bundlers!.includes(b))
      )
    }

    // 按评分和下载量排序
    return results.sort((a, b) => {
      const scoreA = (a.rating || 0) * 0.6 + (a.downloads || 0) / 10000 * 0.4
      const scoreB = (b.rating || 0) * 0.6 + (b.downloads || 0) / 10000 * 0.4
      return scoreB - scoreA
    })
  }

  /**
   * 获取插件
   */
  getPlugin(name: string): PluginMetadata | undefined {
    return this.plugins.get(name)
  }

  /**
   * 获取所有插件
   */
  getAllPlugins(): PluginMetadata[] {
    return Array.from(this.plugins.values())
  }

  /**
   * 获取推荐插件
   */
  getRecommendedPlugins(config: BuilderConfig): PluginMetadata[] {
    const framework = config.libraryType
    const bundler = config.bundler

    return this.search('', {
      frameworks: framework ? [framework] : undefined,
      bundlers: bundler ? [bundler] : undefined
    }).slice(0, 10)
  }

  /**
   * 安装插件
   */
  async installPlugin(name: string, version?: string): Promise<boolean> {
    const plugin = this.plugins.get(name)

    if (!plugin) {
      this.logger.error(`插件不存在: ${name}`)
      return false
    }

    const packageName = plugin.package
    const versionSpec = version || plugin.version

    this.logger.info(`安装插件: ${packageName}@${versionSpec}`)

    try {
      const { execSync } = require('child_process')
      execSync(`npm install ${packageName}@${versionSpec} --save-dev`, {
        stdio: 'inherit'
      })

      this.logger.success(`插件已安装: ${packageName}`)
      return true
    } catch (error) {
      this.logger.error(`插件安装失败:`, error)
      return false
    }
  }

  /**
   * 保存注册表
   */
  async saveRegistry(): Promise<void> {
    const data = {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      plugins: Array.from(this.plugins.values())
    }

    await fs.ensureDir(path.dirname(this.registryPath))
    await fs.writeJSON(this.registryPath, data, { spaces: 2 })
  }
}

/**
 * 创建插件注册中心
 */
export function createPluginRegistry(registryPath?: string): PluginRegistry {
  return new PluginRegistry(registryPath)
}


