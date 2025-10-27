/**
 * 插件市场系统
 * 
 * 提供插件发现、安装、管理和评分功能
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import * as path from 'path'
import * as fs from 'fs-extra'
import * as semver from 'semver'
import { Logger } from '../utils/logger'
import type { Plugin } from 'rollup'

/**
 * 插件元数据
 */
export interface PluginMetadata {
  /** 插件ID */
  id: string
  /** 插件名称 */
  name: string
  /** 插件版本 */
  version: string
  /** 插件描述 */
  description: string
  /** 作者信息 */
  author: {
    name: string
    email?: string
    url?: string
  }
  /** 分类标签 */
  tags: string[]
  /** 支持的构建器 */
  builders: ('rollup' | 'rolldown' | 'esbuild' | 'swc')[]
  /** 依赖项 */
  dependencies?: Record<string, string>
  /** 评分信息 */
  rating: {
    score: number // 0-5
    count: number
  }
  /** 下载量 */
  downloads: {
    total: number
    monthly: number
    weekly: number
  }
  /** 发布时间 */
  publishedAt: string
  /** 更新时间 */
  updatedAt: string
  /** 主页 */
  homepage?: string
  /** 仓库地址 */
  repository?: string
  /** 许可证 */
  license: string
  /** 关键词 */
  keywords?: string[]
  /** 截图 */
  screenshots?: string[]
  /** 是否官方认证 */
  verified?: boolean
  /** 是否推荐 */
  featured?: boolean
}

/**
 * 插件搜索选项
 */
export interface PluginSearchOptions {
  /** 搜索关键词 */
  query?: string
  /** 标签过滤 */
  tags?: string[]
  /** 构建器过滤 */
  builder?: string
  /** 排序方式 */
  sort?: 'downloads' | 'rating' | 'updated' | 'name'
  /** 排序顺序 */
  order?: 'asc' | 'desc'
  /** 分页 */
  page?: number
  /** 每页数量 */
  pageSize?: number
  /** 只显示官方认证 */
  verifiedOnly?: boolean
  /** 只显示推荐 */
  featuredOnly?: boolean
}

/**
 * 插件安装选项
 */
export interface PluginInstallOptions {
  /** 安装版本 */
  version?: string
  /** 强制重新安装 */
  force?: boolean
  /** 保存到配置 */
  save?: boolean
  /** 全局安装 */
  global?: boolean
  /** 开发依赖 */
  dev?: boolean
  /** 跳过依赖检查 */
  skipDeps?: boolean
}

/**
 * 插件评价
 */
export interface PluginReview {
  /** 评价ID */
  id: string
  /** 用户 */
  user: string
  /** 评分 */
  rating: number
  /** 标题 */
  title: string
  /** 内容 */
  content: string
  /** 时间 */
  createdAt: string
  /** 点赞数 */
  helpful: number
}

/**
 * 插件配置模板
 */
export interface PluginConfigTemplate {
  /** 模板名称 */
  name: string
  /** 描述 */
  description: string
  /** 配置内容 */
  config: any
  /** 适用场景 */
  useCase: string[]
}

/**
 * 插件市场管理器
 */
export class PluginMarketplace {
  private logger: Logger
  private registry: Map<string, PluginMetadata> = new Map()
  private installedPlugins: Map<string, any> = new Map()
  private configDir: string
  private cacheDir: string
  private registryUrl: string

  constructor(options: {
    configDir?: string
    cacheDir?: string
    registryUrl?: string
  } = {}) {
    this.configDir = options.configDir || path.join(process.cwd(), '.ldesign')
    this.cacheDir = options.cacheDir || path.join(this.configDir, 'plugin-cache')
    this.registryUrl = options.registryUrl || 'https://plugins.ldesign.dev/api/v1'

    this.logger = new Logger({ prefix: '[PluginMarket]' })

    // 确保目录存在
    fs.ensureDirSync(this.configDir)
    fs.ensureDirSync(this.cacheDir)

    // 加载本地缓存
    this.loadLocalRegistry()
  }

  /**
   * 搜索插件
   */
  async search(options: PluginSearchOptions = {}): Promise<{
    plugins: PluginMetadata[]
    total: number
    page: number
    pageSize: number
  }> {
    this.logger.info('搜索插件...', options)

    // 从注册表获取插件列表
    let plugins = Array.from(this.registry.values())

    // 关键词搜索
    if (options.query) {
      const query = options.query.toLowerCase()
      plugins = plugins.filter(plugin =>
        plugin.name.toLowerCase().includes(query) ||
        plugin.description.toLowerCase().includes(query) ||
        plugin.tags.some(tag => tag.toLowerCase().includes(query)) ||
        plugin.keywords?.some(kw => kw.toLowerCase().includes(query))
      )
    }

    // 标签过滤
    if (options.tags?.length) {
      plugins = plugins.filter(plugin =>
        options.tags!.every(tag => plugin.tags.includes(tag))
      )
    }

    // 构建器过滤
    if (options.builder) {
      plugins = plugins.filter(plugin =>
        plugin.builders.includes(options.builder as any)
      )
    }

    // 认证过滤
    if (options.verifiedOnly) {
      plugins = plugins.filter(plugin => plugin.verified)
    }

    // 推荐过滤
    if (options.featuredOnly) {
      plugins = plugins.filter(plugin => plugin.featured)
    }

    // 排序
    const sortField = options.sort || 'downloads'
    const order = options.order || 'desc'

    plugins.sort((a, b) => {
      let compareValue = 0

      switch (sortField) {
        case 'downloads':
          compareValue = a.downloads.total - b.downloads.total
          break
        case 'rating':
          compareValue = a.rating.score - b.rating.score
          break
        case 'updated':
          compareValue = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          break
        case 'name':
          compareValue = a.name.localeCompare(b.name)
          break
      }

      return order === 'desc' ? -compareValue : compareValue
    })

    // 分页
    const page = options.page || 1
    const pageSize = options.pageSize || 20
    const start = (page - 1) * pageSize
    const end = start + pageSize

    const paginatedPlugins = plugins.slice(start, end)

    return {
      plugins: paginatedPlugins,
      total: plugins.length,
      page,
      pageSize
    }
  }

  /**
   * 获取插件详情
   */
  async getPlugin(pluginId: string): Promise<PluginMetadata | null> {
    // 先从本地缓存查找
    if (this.registry.has(pluginId)) {
      return this.registry.get(pluginId)!
    }

    // 从远程获取
    try {
      const plugin = await this.fetchPluginFromRegistry(pluginId)
      if (plugin) {
        this.registry.set(pluginId, plugin)
        this.saveLocalRegistry()
      }
      return plugin
    } catch (error) {
      this.logger.error(`获取插件详情失败: ${error}`)
      return null
    }
  }

  /**
   * 安装插件
   */
  async install(pluginId: string, options: PluginInstallOptions = {}): Promise<void> {
    this.logger.info(`安装插件: ${pluginId}`)

    // 获取插件信息
    const pluginInfo = await this.getPlugin(pluginId)
    if (!pluginInfo) {
      throw new Error(`插件不存在: ${pluginId}`)
    }

    // 检查版本
    const version = options.version || pluginInfo.version
    if (!semver.valid(version)) {
      throw new Error(`无效的版本号: ${version}`)
    }

    // 检查是否已安装
    if (this.installedPlugins.has(pluginId) && !options.force) {
      this.logger.warn(`插件已安装: ${pluginId}`)
      return
    }

    // 下载插件
    const pluginPath = await this.downloadPlugin(pluginId, version)

    // 安装依赖
    if (!options.skipDeps && pluginInfo.dependencies) {
      await this.installDependencies(pluginInfo.dependencies)
    }

    // 加载插件
    const plugin = await this.loadPlugin(pluginPath)
    this.installedPlugins.set(pluginId, {
      metadata: pluginInfo,
      plugin,
      path: pluginPath,
      version
    })

    // 保存到配置
    if (options.save) {
      await this.savePluginConfig(pluginId, version, options.dev)
    }

    this.logger.success(`插件安装成功: ${pluginId}@${version}`)
  }

  /**
   * 卸载插件
   */
  async uninstall(pluginId: string): Promise<void> {
    this.logger.info(`卸载插件: ${pluginId}`)

    if (!this.installedPlugins.has(pluginId)) {
      throw new Error(`插件未安装: ${pluginId}`)
    }

    // 移除插件
    const pluginData = this.installedPlugins.get(pluginId)
    this.installedPlugins.delete(pluginId)

    // 清理缓存
    if (pluginData?.path) {
      await fs.remove(pluginData.path)
    }

    // 更新配置
    await this.removePluginConfig(pluginId)

    this.logger.success(`插件卸载成功: ${pluginId}`)
  }

  /**
   * 更新插件
   */
  async update(pluginId: string, version?: string): Promise<void> {
    this.logger.info(`更新插件: ${pluginId}`)

    if (!this.installedPlugins.has(pluginId)) {
      throw new Error(`插件未安装: ${pluginId}`)
    }

    const installed = this.installedPlugins.get(pluginId)
    const pluginInfo = await this.getPlugin(pluginId)

    if (!pluginInfo) {
      throw new Error(`无法获取插件信息: ${pluginId}`)
    }

    // 确定目标版本
    const targetVersion = version || pluginInfo.version

    // 检查是否需要更新
    if (semver.gte(installed.version, targetVersion)) {
      this.logger.info(`插件已是最新版本: ${pluginId}@${installed.version}`)
      return
    }

    // 执行更新
    await this.install(pluginId, {
      version: targetVersion,
      force: true,
      save: true
    })

    this.logger.success(`插件更新成功: ${pluginId}@${targetVersion}`)
  }

  /**
   * 列出已安装的插件
   */
  listInstalled(): Array<{
    id: string
    version: string
    metadata: PluginMetadata
  }> {
    return Array.from(this.installedPlugins.entries()).map(([id, data]) => ({
      id,
      version: data.version,
      metadata: data.metadata
    }))
  }

  /**
   * 获取插件实例
   */
  getPluginInstance(pluginId: string): Plugin | null {
    const pluginData = this.installedPlugins.get(pluginId)
    return pluginData?.plugin || null
  }

  /**
   * 评价插件
   */
  async ratePlugin(pluginId: string, rating: number, review?: {
    title: string
    content: string
  }): Promise<void> {
    if (rating < 1 || rating > 5) {
      throw new Error('评分必须在 1-5 之间')
    }

    // 这里应该调用远程 API
    this.logger.info(`评价插件 ${pluginId}: ${rating} 星`)

    // 模拟更新本地缓存
    const plugin = this.registry.get(pluginId)
    if (plugin) {
      const totalScore = plugin.rating.score * plugin.rating.count
      plugin.rating.count++
      plugin.rating.score = (totalScore + rating) / plugin.rating.count
      this.saveLocalRegistry()
    }
  }

  /**
   * 获取插件评价
   */
  async getReviews(pluginId: string, options?: {
    page?: number
    pageSize?: number
    sort?: 'helpful' | 'recent'
  }): Promise<{
    reviews: PluginReview[]
    total: number
  }> {
    // 模拟返回评价数据
    const mockReviews: PluginReview[] = [
      {
        id: '1',
        user: 'developer1',
        rating: 5,
        title: '非常好用的插件',
        content: '这个插件大大提升了我的构建效率，配置简单，功能强大。',
        createdAt: new Date().toISOString(),
        helpful: 42
      },
      {
        id: '2',
        user: 'developer2',
        rating: 4,
        title: '功能不错，但有改进空间',
        content: '整体功能很好，但在某些边缘情况下会有问题。',
        createdAt: new Date().toISOString(),
        helpful: 15
      }
    ]

    return {
      reviews: mockReviews,
      total: mockReviews.length
    }
  }

  /**
   * 获取推荐插件
   */
  async getRecommended(options?: {
    limit?: number
    category?: string
  }): Promise<PluginMetadata[]> {
    const limit = options?.limit || 10

    // 获取推荐插件
    let plugins = Array.from(this.registry.values())
      .filter(p => p.featured || p.rating.score >= 4.5)

    // 按类别过滤
    if (options?.category) {
      plugins = plugins.filter(p => options.category && p.tags.includes(options.category))
    }

    // 排序并限制数量
    return plugins
      .sort((a, b) => b.downloads.monthly - a.downloads.monthly)
      .slice(0, limit)
  }

  /**
   * 获取插件配置模板
   */
  async getConfigTemplates(pluginId: string): Promise<PluginConfigTemplate[]> {
    // 模拟返回配置模板
    return [
      {
        name: '基础配置',
        description: '适用于大多数项目的基础配置',
        config: {
          // 插件特定配置
        },
        useCase: ['通用']
      },
      {
        name: '性能优化',
        description: '注重构建性能的配置',
        config: {
          // 性能相关配置
        },
        useCase: ['大型项目', '性能敏感']
      }
    ]
  }

  /**
   * 创建插件
   */
  async createPlugin(options: {
    name: string
    description: string
    template?: string
  }): Promise<string> {
    this.logger.info('创建新插件...')

    const pluginName = options.name.toLowerCase().replace(/\s+/g, '-')
    const pluginDir = path.join(process.cwd(), pluginName)

    // 创建插件目录结构
    await fs.ensureDir(pluginDir)
    await fs.ensureDir(path.join(pluginDir, 'src'))
    await fs.ensureDir(path.join(pluginDir, 'tests'))

    // 创建 package.json
    const packageJson = {
      name: `@ldesign-plugin/${pluginName}`,
      version: '0.1.0',
      description: options.description,
      main: 'dist/index.js',
      types: 'dist/index.d.ts',
      scripts: {
        build: 'tsc',
        test: 'jest',
        prepublish: 'npm run build'
      },
      keywords: ['ldesign', 'plugin', 'builder'],
      author: '',
      license: 'MIT',
      devDependencies: {
        '@types/node': '^18.0.0',
        'typescript': '^5.0.0',
        'jest': '^29.0.0'
      },
      peerDependencies: {
        '@ldesign/builder': '^1.0.0'
      }
    }

    await fs.writeJson(path.join(pluginDir, 'package.json'), packageJson, { spaces: 2 })

    // 创建主文件
    const indexContent = `/**
 * ${options.description}
 */

import type { Plugin } from 'rollup'

export interface ${this.toPascalCase(pluginName)}Options {
  // 添加插件选项
}

export function ${this.toCamelCase(pluginName)}(options: ${this.toPascalCase(pluginName)}Options = {}): Plugin {
  return {
    name: '${pluginName}',
    
    // 实现插件钩子
    buildStart() {
      console.log('${pluginName} 插件已启动')
    },
    
    transform(code, id) {
      // 转换代码逻辑
      return null
    }
  }
}

export default ${this.toCamelCase(pluginName)}
`

    await fs.writeFile(path.join(pluginDir, 'src/index.ts'), indexContent)

    // 创建 TypeScript 配置
    const tsConfig = {
      compilerOptions: {
        target: 'ES2020',
        module: 'commonjs',
        lib: ['ES2020'],
        declaration: true,
        outDir: './dist',
        rootDir: './src',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist', 'tests']
    }

    await fs.writeJson(path.join(pluginDir, 'tsconfig.json'), tsConfig, { spaces: 2 })

    // 创建 README
    const readmeContent = `# ${options.name}

${options.description}

## 安装

\`\`\`bash
npm install @ldesign-plugin/${pluginName}
\`\`\`

## 使用

\`\`\`typescript
import { ${this.toCamelCase(pluginName)} } from '@ldesign-plugin/${pluginName}'

export default {
  plugins: [
    ${this.toCamelCase(pluginName)}({
      // 配置选项
    })
  ]
}
\`\`\`

## 配置选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| ... | ... | ... | ... |

## License

MIT
`

    await fs.writeFile(path.join(pluginDir, 'README.md'), readmeContent)

    this.logger.success(`插件创建成功: ${pluginDir}`)

    return pluginDir
  }

  /**
   * 从注册表获取插件
   */
  private async fetchPluginFromRegistry(pluginId: string): Promise<PluginMetadata | null> {
    // 模拟从远程注册表获取
    // 实际项目中应该使用 HTTP 请求
    return this.createMockPlugin(pluginId)
  }

  /**
   * 下载插件
   */
  private async downloadPlugin(pluginId: string, version: string): Promise<string> {
    const pluginDir = path.join(this.cacheDir, pluginId, version)
    await fs.ensureDir(pluginDir)

    // 模拟下载过程
    // 实际项目中应该从 npm 或其他源下载
    const pluginFile = path.join(pluginDir, 'index.js')

    // 创建模拟插件文件
    const mockPluginCode = `
module.exports = function ${this.toCamelCase(pluginId)}Plugin(options = {}) {
  return {
    name: '${pluginId}',
    buildStart() {
      console.log('${pluginId} plugin started with options:', options)
    }
  }
}
`

    await fs.writeFile(pluginFile, mockPluginCode)

    return pluginDir
  }

  /**
   * 加载插件
   */
  private async loadPlugin(pluginPath: string): Promise<Plugin> {
    try {
      const pluginModule = require(path.join(pluginPath, 'index.js'))
      return typeof pluginModule === 'function' ? pluginModule() : pluginModule.default()
    } catch (error) {
      throw new Error(`加载插件失败: ${error}`)
    }
  }

  /**
   * 安装依赖
   */
  private async installDependencies(dependencies: Record<string, string>): Promise<void> {
    // 实际项目中应该使用包管理器安装依赖
    this.logger.info('安装插件依赖...', dependencies)
  }

  /**
   * 保存插件配置
   */
  private async savePluginConfig(pluginId: string, version: string, dev?: boolean): Promise<void> {
    const configFile = path.join(this.configDir, 'plugins.json')
    let config: any = {}

    if (await fs.pathExists(configFile)) {
      config = await fs.readJson(configFile)
    }

    const section = dev ? 'devDependencies' : 'dependencies'
    if (!config[section]) {
      config[section] = {}
    }

    config[section][pluginId] = version

    await fs.writeJson(configFile, config, { spaces: 2 })
  }

  /**
   * 移除插件配置
   */
  private async removePluginConfig(pluginId: string): Promise<void> {
    const configFile = path.join(this.configDir, 'plugins.json')

    if (!await fs.pathExists(configFile)) {
      return
    }

    const config = await fs.readJson(configFile)

    delete config.dependencies?.[pluginId]
    delete config.devDependencies?.[pluginId]

    await fs.writeJson(configFile, config, { spaces: 2 })
  }

  /**
   * 加载本地注册表
   */
  private loadLocalRegistry(): void {
    const registryFile = path.join(this.cacheDir, 'registry.json')

    if (fs.existsSync(registryFile)) {
      try {
        const data = fs.readJsonSync(registryFile)
        data.forEach((plugin: PluginMetadata) => {
          this.registry.set(plugin.id, plugin)
        })
      } catch (error) {
        this.logger.error('加载本地注册表失败:', error)
      }
    }

    // 初始化一些模拟数据
    this.initializeMockData()
  }

  /**
   * 保存本地注册表
   */
  private saveLocalRegistry(): void {
    const registryFile = path.join(this.cacheDir, 'registry.json')
    const data = Array.from(this.registry.values())

    try {
      fs.writeJsonSync(registryFile, data, { spaces: 2 })
    } catch (error) {
      this.logger.error('保存本地注册表失败:', error)
    }
  }

  /**
   * 初始化模拟数据
   */
  private initializeMockData(): void {
    const mockPlugins = [
      this.createMockPlugin('vue-optimizer', {
        name: 'Vue 优化器',
        description: 'Vue 3 项目的构建优化插件',
        tags: ['vue', 'optimization', 'performance'],
        featured: true
      }),
      this.createMockPlugin('react-fast-refresh', {
        name: 'React Fast Refresh',
        description: 'React 快速刷新插件，提升开发体验',
        tags: ['react', 'hmr', 'development'],
        verified: true
      }),
      this.createMockPlugin('bundle-analyzer-plus', {
        name: 'Bundle 分析器增强版',
        description: '高级的包分析和可视化工具',
        tags: ['analysis', 'visualization', 'optimization'],
        featured: true,
        verified: true
      }),
      this.createMockPlugin('auto-externals', {
        name: '自动外部化',
        description: '智能检测并外部化大型依赖',
        tags: ['optimization', 'externals', 'performance']
      }),
      this.createMockPlugin('css-optimizer', {
        name: 'CSS 优化器',
        description: '高级 CSS 压缩和优化',
        tags: ['css', 'optimization', 'minification']
      })
    ]

    mockPlugins.forEach(plugin => {
      this.registry.set(plugin.id, plugin)
    })
  }

  /**
   * 创建模拟插件
   */
  private createMockPlugin(id: string, overrides?: Partial<PluginMetadata>): PluginMetadata {
    const base: PluginMetadata = {
      id,
      name: id,
      version: '1.0.0',
      description: `${id} 插件`,
      author: {
        name: 'LDesign Team',
        email: 'team@ldesign.dev'
      },
      tags: ['general'],
      builders: ['rollup', 'rolldown'],
      rating: {
        score: 4.5,
        count: Math.floor(Math.random() * 100) + 10
      },
      downloads: {
        total: Math.floor(Math.random() * 10000) + 1000,
        monthly: Math.floor(Math.random() * 1000) + 100,
        weekly: Math.floor(Math.random() * 300) + 50
      },
      publishedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      license: 'MIT',
      homepage: `https://plugins.ldesign.dev/${id}`,
      repository: `https://github.com/ldesign-plugins/${id}`,
      ...overrides
    }

    return base
  }

  /**
   * 转换为 PascalCase
   */
  private toPascalCase(str: string): string {
    return str
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('')
  }

  /**
   * 转换为 camelCase
   */
  private toCamelCase(str: string): string {
    const pascal = this.toPascalCase(str)
    return pascal.charAt(0).toLowerCase() + pascal.slice(1)
  }
}

/**
 * 创建插件市场实例
 */
export function createPluginMarketplace(options?: {
  configDir?: string
  cacheDir?: string
  registryUrl?: string
}): PluginMarketplace {
  return new PluginMarketplace(options)
}


