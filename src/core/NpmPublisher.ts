/**
 * NPM 发布管理器
 * 
 * 支持发布到官方 npm registry 和私有 npm 源
 * 提供预检查、版本管理、发布历史记录等功能
 * 
 * @author LDesign Team
 */

import { resolve, join } from 'path'
import { 
  existsSync, 
  readFileSync, 
  writeFileSync, 
  mkdirSync
} from 'fs'
import { spawn, execSync } from 'child_process'
import { Logger } from '../utils/logger'
import { VersionManager, createVersionManager } from './VersionManager'

const logger = new Logger()

// ========== 类型定义 ==========

export interface PublishOptions {
  registry?: string           // npm registry URL
  tag?: string               // npm tag, 默认 'latest'
  access?: 'public' | 'restricted'
  dryRun?: boolean           // 测试运行，不实际发布
  otp?: string               // 2FA 验证码
  skipValidation?: boolean   // 跳过预检查
  archiveBefore?: boolean    // 发布前归档当前版本
}

export interface PublishResult {
  success: boolean
  version: string
  registry: string
  tag: string
  publishedAt: number
  packageName: string
  tarballUrl?: string
  error?: string
  logs: string[]
}

export interface PublishHistory {
  version: string
  registry: string
  tag: string
  publishedAt: number
  success: boolean
  packageName: string
  tarballUrl?: string
  error?: string
}

export interface RegistryConfig {
  name: string
  url: string
  token?: string
  authType?: 'token' | 'basic' | 'none'
  username?: string
  email?: string
}

export interface PrePublishCheck {
  name: string
  passed: boolean
  message: string
  severity: 'error' | 'warning' | 'info'
}

export interface PackageInfo {
  name: string
  version: string
  description?: string
  main?: string
  module?: string
  types?: string
  typings?: string
  files?: string[]
  exports?: Record<string, any>
  publishConfig?: {
    registry?: string
    access?: string
    tag?: string
  }
  repository?: {
    type: string
    url: string
  }
  license?: string
  author?: string | { name: string; email?: string }
  keywords?: string[]
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

// ========== NPM 发布器 ==========

export class NpmPublisher {
  private projectPath: string
  private historyDir: string
  private publishHistory: PublishHistory[] = []
  private registries: RegistryConfig[] = []
  private versionManager: VersionManager

  constructor(projectPath: string) {
    this.projectPath = projectPath
    this.historyDir = resolve(projectPath, '.ldesign', 'publish')
    this.versionManager = createVersionManager(projectPath)

    this.ensureDirectories()
    this.loadPublishHistory()
    this.loadRegistryConfigs()
  }

  /**
   * 确保必要目录存在
   */
  private ensureDirectories(): void {
    if (!existsSync(this.historyDir)) {
      mkdirSync(this.historyDir, { recursive: true })
    }
  }

  /**
   * 加载发布历史
   */
  private loadPublishHistory(): void {
    const historyFile = resolve(this.historyDir, 'history.json')
    if (existsSync(historyFile)) {
      try {
        this.publishHistory = JSON.parse(readFileSync(historyFile, 'utf-8'))
      } catch {
        this.publishHistory = []
      }
    }
  }

  /**
   * 保存发布历史
   */
  private savePublishHistory(): void {
    const historyFile = resolve(this.historyDir, 'history.json')
    writeFileSync(historyFile, JSON.stringify(this.publishHistory.slice(-100), null, 2))
  }

  /**
   * 加载 registry 配置
   */
  private loadRegistryConfigs(): void {
    const configFile = resolve(this.historyDir, 'registries.json')
    
    // 默认配置
    this.registries = [
      {
        name: 'npm',
        url: 'https://registry.npmjs.org/',
        authType: 'token'
      },
      {
        name: 'npmmirror',
        url: 'https://registry.npmmirror.com/',
        authType: 'token'
      },
      {
        name: 'github',
        url: 'https://npm.pkg.github.com/',
        authType: 'token'
      }
    ]

    if (existsSync(configFile)) {
      try {
        const customRegistries = JSON.parse(readFileSync(configFile, 'utf-8'))
        this.registries = [...this.registries, ...customRegistries]
      } catch {}
    }
  }

  /**
   * 添加自定义 registry
   */
  addRegistry(registry: RegistryConfig): void {
    const existing = this.registries.findIndex(r => r.name === registry.name)
    if (existing >= 0) {
      this.registries[existing] = registry
    } else {
      this.registries.push(registry)
    }
    this.saveRegistryConfigs()
  }

  /**
   * 保存 registry 配置
   */
  private saveRegistryConfigs(): void {
    const configFile = resolve(this.historyDir, 'registries.json')
    const customRegistries = this.registries.filter(r => 
      !['npm', 'npmmirror', 'github'].includes(r.name)
    )
    writeFileSync(configFile, JSON.stringify(customRegistries, null, 2))
  }

  /**
   * 获取 package.json 信息
   */
  getPackageInfo(): PackageInfo | null {
    const pkgPath = resolve(this.projectPath, 'package.json')
    if (existsSync(pkgPath)) {
      try {
        return JSON.parse(readFileSync(pkgPath, 'utf-8'))
      } catch {
        return null
      }
    }
    return null
  }

  /**
   * 更新 package.json
   */
  updatePackageJson(updates: Partial<PackageInfo>): void {
    const pkgPath = resolve(this.projectPath, 'package.json')
    const pkg = this.getPackageInfo() || {} as PackageInfo
    Object.assign(pkg, updates)
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
  }

  /**
   * 发布前检查
   */
  async runPrePublishChecks(): Promise<PrePublishCheck[]> {
    const checks: PrePublishCheck[] = []
    const pkg = this.getPackageInfo()

    // 1. 检查 package.json 是否存在
    checks.push({
      name: 'package.json',
      passed: !!pkg,
      message: pkg ? 'package.json 存在' : '缺少 package.json',
      severity: 'error'
    })

    if (!pkg) return checks

    // 2. 检查包名
    checks.push({
      name: 'name',
      passed: !!pkg.name && pkg.name.length > 0,
      message: pkg.name ? `包名: ${pkg.name}` : '缺少包名',
      severity: 'error'
    })

    // 3. 检查版本号
    const versionRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/
    checks.push({
      name: 'version',
      passed: !!pkg.version && versionRegex.test(pkg.version),
      message: pkg.version ? `版本: ${pkg.version}` : '缺少或无效的版本号',
      severity: 'error'
    })

    // 4. 检查 main/module 入口
    const hasEntry = !!(pkg.main || pkg.module || pkg.exports)
    checks.push({
      name: 'entry',
      passed: hasEntry,
      message: hasEntry ? '入口文件已配置' : '建议配置 main/module/exports 入口',
      severity: hasEntry ? 'info' : 'warning'
    })

    // 5. 检查 files 字段
    checks.push({
      name: 'files',
      passed: !!(pkg.files && pkg.files.length > 0),
      message: pkg.files ? `files: ${pkg.files.join(', ')}` : '建议配置 files 字段指定发布文件',
      severity: pkg.files ? 'info' : 'warning'
    })

    // 6. 检查构建产物
    const outputDirs = ['dist', 'es', 'lib', 'esm', 'cjs']
    const existingOutputs = outputDirs.filter(dir => 
      existsSync(resolve(this.projectPath, dir))
    )
    checks.push({
      name: 'build',
      passed: existingOutputs.length > 0,
      message: existingOutputs.length > 0 
        ? `构建产物: ${existingOutputs.join(', ')}`
        : '未找到构建产物，请先执行构建',
      severity: existingOutputs.length > 0 ? 'info' : 'error'
    })

    // 7. 检查类型声明
    const hasTypes = !!(pkg.types || pkg.typings) || 
      existsSync(resolve(this.projectPath, 'dist', 'index.d.ts')) ||
      existsSync(resolve(this.projectPath, 'types', 'index.d.ts'))
    checks.push({
      name: 'types',
      passed: hasTypes,
      message: hasTypes ? '类型声明已配置' : '建议添加类型声明',
      severity: hasTypes ? 'info' : 'warning'
    })

    // 8. 检查 README
    const hasReadme = existsSync(resolve(this.projectPath, 'README.md'))
    checks.push({
      name: 'readme',
      passed: hasReadme,
      message: hasReadme ? 'README.md 存在' : '建议添加 README.md',
      severity: hasReadme ? 'info' : 'warning'
    })

    // 9. 检查 LICENSE
    const hasLicense = existsSync(resolve(this.projectPath, 'LICENSE')) || !!pkg.license
    checks.push({
      name: 'license',
      passed: hasLicense,
      message: hasLicense ? `许可证: ${pkg.license || 'LICENSE 文件存在'}` : '建议添加许可证',
      severity: hasLicense ? 'info' : 'warning'
    })

    // 10. 检查 npm 登录状态
    try {
      const whoami = execSync('npm whoami', { encoding: 'utf-8' }).trim()
      checks.push({
        name: 'auth',
        passed: true,
        message: `已登录 npm: ${whoami}`,
        severity: 'info'
      })
    } catch {
      checks.push({
        name: 'auth',
        passed: false,
        message: '未登录 npm，请先执行 npm login',
        severity: 'error'
      })
    }

    return checks
  }

  /**
   * 发布到 npm
   */
  async publish(options: PublishOptions = {}): Promise<PublishResult> {
    const pkg = this.getPackageInfo()
    const logs: string[] = []
    const startTime = Date.now()

    if (!pkg) {
      return {
        success: false,
        version: '0.0.0',
        registry: options.registry || 'https://registry.npmjs.org/',
        tag: options.tag || 'latest',
        publishedAt: startTime,
        packageName: 'unknown',
        error: '缺少 package.json',
        logs: ['错误: 缺少 package.json']
      }
    }

    const registry = options.registry || pkg.publishConfig?.registry || 'https://registry.npmjs.org/'
    const tag = options.tag || pkg.publishConfig?.tag || 'latest'
    const access = options.access || pkg.publishConfig?.access || 'public'

    logs.push(`📦 准备发布 ${pkg.name}@${pkg.version}`)
    logs.push(`📡 Registry: ${registry}`)
    logs.push(`🏷️ Tag: ${tag}`)

    // 预检查
    if (!options.skipValidation) {
      logs.push('🔍 执行发布前检查...')
      const checks = await this.runPrePublishChecks()
      const errors = checks.filter(c => !c.passed && c.severity === 'error')
      
      if (errors.length > 0) {
        const errorMsg = errors.map(e => e.message).join('; ')
        logs.push(`❌ 检查失败: ${errorMsg}`)
        return {
          success: false,
          version: pkg.version,
          registry,
          tag,
          publishedAt: startTime,
          packageName: pkg.name,
          error: errorMsg,
          logs
        }
      }
      logs.push('✅ 预检查通过')
    }

    // 发布前归档
    if (options.archiveBefore) {
      logs.push('📚 归档当前版本...')
      try {
        await this.versionManager.archiveCurrentBuild({
          notes: `发布前自动归档 v${pkg.version}`
        })
        logs.push('✅ 归档完成')
      } catch (error) {
        logs.push(`⚠️ 归档失败: ${error}`)
      }
    }

    // 构建 npm publish 命令
    const args = ['publish']
    
    if (registry !== 'https://registry.npmjs.org/') {
      args.push('--registry', registry)
    }
    
    args.push('--tag', tag)
    args.push('--access', access)
    
    if (options.otp) {
      args.push('--otp', options.otp)
    }
    
    if (options.dryRun) {
      args.push('--dry-run')
      logs.push('🧪 Dry Run 模式')
    }

    logs.push(`🚀 执行: npm ${args.join(' ')}`)

    return new Promise((resolve) => {
      const child = spawn('npm', args, {
        cwd: this.projectPath,
        shell: true,
        env: { ...process.env, FORCE_COLOR: '1' }
      })

      child.stdout.on('data', (data) => {
        const lines = data.toString().split('\n').filter(Boolean)
        logs.push(...lines)
      })

      child.stderr.on('data', (data) => {
        const lines = data.toString().split('\n').filter(Boolean)
        logs.push(...lines)
      })

      child.on('close', (code) => {
        const success = code === 0
        const result: PublishResult = {
          success,
          version: pkg.version,
          registry,
          tag,
          publishedAt: Date.now(),
          packageName: pkg.name,
          logs
        }

        if (success) {
          logs.push(`✅ ${pkg.name}@${pkg.version} 发布成功！`)
          result.tarballUrl = `${registry}${pkg.name}/-/${pkg.name.replace('@', '').replace('/', '-')}-${pkg.version}.tgz`
          
          // 记录发布历史
          this.publishHistory.push({
            version: pkg.version,
            registry,
            tag,
            publishedAt: result.publishedAt,
            success: true,
            packageName: pkg.name,
            tarballUrl: result.tarballUrl
          })
        } else {
          logs.push(`❌ 发布失败 (退出码: ${code})`)
          result.error = `发布失败，退出码: ${code}`
          
          this.publishHistory.push({
            version: pkg.version,
            registry,
            tag,
            publishedAt: result.publishedAt,
            success: false,
            packageName: pkg.name,
            error: result.error
          })
        }

        this.savePublishHistory()
        resolve(result)
      })
    })
  }

  /**
   * 发布到多个 registry
   */
  async publishToMultiple(registries: string[], options: Omit<PublishOptions, 'registry'> = {}): Promise<PublishResult[]> {
    const results: PublishResult[] = []
    
    for (const registry of registries) {
      logger.info(`发布到: ${registry}`)
      const result = await this.publish({ ...options, registry })
      results.push(result)
      
      if (!result.success && !options.dryRun) {
        logger.warn(`发布到 ${registry} 失败，继续下一个...`)
      }
    }
    
    return results
  }

  /**
   * 获取发布历史
   */
  getPublishHistory(): PublishHistory[] {
    return [...this.publishHistory]
  }

  /**
   * 获取可用的 registry 列表
   */
  getRegistries(): RegistryConfig[] {
    return [...this.registries]
  }

  /**
   * 检查包是否已发布
   */
  async isVersionPublished(version?: string, registry?: string): Promise<boolean> {
    const pkg = this.getPackageInfo()
    if (!pkg) return false

    const checkVersion = version || pkg.version
    const checkRegistry = registry || 'https://registry.npmjs.org/'

    try {
      const result = execSync(
        `npm view ${pkg.name}@${checkVersion} version --registry ${checkRegistry}`,
        { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
      ).trim()
      return result === checkVersion
    } catch {
      return false
    }
  }

  /**
   * 获取已发布的版本列表
   */
  async getPublishedVersions(registry?: string): Promise<string[]> {
    const pkg = this.getPackageInfo()
    if (!pkg) return []

    const checkRegistry = registry || 'https://registry.npmjs.org/'

    try {
      const result = execSync(
        `npm view ${pkg.name} versions --json --registry ${checkRegistry}`,
        { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
      )
      return JSON.parse(result)
    } catch {
      return []
    }
  }

  /**
   * 撤销已发布的版本
   */
  async unpublish(version: string, options?: { otp?: string }): Promise<boolean> {
    const pkg = this.getPackageInfo()
    if (!pkg) return false

    try {
      const args = ['unpublish', `${pkg.name}@${version}`]
      if (options?.otp) {
        args.push('--otp', options.otp)
      }

      execSync(`npm ${args.join(' ')}`, { 
        cwd: this.projectPath,
        encoding: 'utf-8' 
      })
      
      logger.success(`已撤销 ${pkg.name}@${version}`)
      return true
    } catch (error) {
      logger.error(`撤销失败: ${error}`)
      return false
    }
  }

  /**
   * 设置发布前版本号
   */
  async bumpAndPublish(
    bumpType: 'major' | 'minor' | 'patch' | 'prerelease',
    options?: PublishOptions & { preid?: string }
  ): Promise<PublishResult> {
    // 递增版本
    const newVersion = this.versionManager.bumpVersion(bumpType, options?.preid)
    logger.info(`版本已更新: ${newVersion}`)

    // 归档旧版本
    if (options?.archiveBefore !== false) {
      try {
        await this.versionManager.archiveCurrentBuild({
          notes: `版本升级前备份`
        })
      } catch (error) {
        logger.warn(`归档失败: ${error}`)
      }
    }

    // 发布
    return this.publish(options)
  }

  /**
   * 生成 .npmrc 配置
   */
  generateNpmrc(registries?: RegistryConfig[]): string {
    const configs = registries || this.registries
    const lines: string[] = []

    for (const reg of configs) {
      if (reg.token) {
        // 提取 registry 的域名部分
        const url = new URL(reg.url)
        lines.push(`//${url.host}/:_authToken=${reg.token}`)
      }
    }

    return lines.join('\n')
  }

  /**
   * 保存 .npmrc 文件
   */
  saveNpmrc(content: string, scope?: string): void {
    const npmrcPath = scope 
      ? resolve(this.projectPath, '.npmrc')
      : resolve(process.env.HOME || process.env.USERPROFILE || '', '.npmrc')

    let existingContent = ''
    if (existsSync(npmrcPath)) {
      existingContent = readFileSync(npmrcPath, 'utf-8')
    }

    // 合并配置
    const newContent = existingContent 
      ? `${existingContent}\n${content}`
      : content

    writeFileSync(npmrcPath, newContent)
    logger.success(`已更新 .npmrc: ${npmrcPath}`)
  }
}

// 导出创建函数
export function createNpmPublisher(projectPath: string): NpmPublisher {
  return new NpmPublisher(projectPath)
}
