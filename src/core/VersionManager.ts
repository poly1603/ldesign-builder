/**
 * 版本管理器
 * 
 * 负责管理构建版本、归档历史版本、版本记录等功能
 * 支持将旧版本打包为 npm 兼容的 .tgz 文件进行备份
 * 
 * @author LDesign Team
 */

import { resolve, join } from 'path'
import { 
  existsSync, 
  mkdirSync, 
  readFileSync, 
  writeFileSync, 
  readdirSync, 
  statSync, 
  rmSync,
  copyFileSync
} from 'fs'
import * as tar from 'tar'
import { Logger } from '../utils/logger'

const logger = new Logger()

// ========== 类型定义 ==========

export interface VersionInfo {
  version: string
  timestamp: number
  buildId: string
  bundler: string
  mode: 'development' | 'production'
  success: boolean
  duration: number
  outputs: VersionOutput[]
  totalSize: number
  fileCount: number
  checksum?: string
  tags?: string[]
  notes?: string
}

export interface VersionOutput {
  dir: string
  files: Array<{
    name: string
    size: number
    type: string
  }>
  totalSize: number
}

export interface VersionArchive {
  version: string
  archivePath: string
  archiveSize: number
  createdAt: number
  originalSize: number
  compressionRatio: number
}

export interface VersionManagerConfig {
  projectPath: string
  archiveDir?: string  // 默认 .ldesign/archives
  historyDir?: string  // 默认 .ldesign/versions
  maxVersions?: number // 最大保留版本数，默认 50
  autoArchive?: boolean // 自动归档旧版本
  compressionLevel?: number // 压缩级别 1-9
}

export interface PublishOptions {
  registry?: string      // npm registry URL
  tag?: string           // npm tag, 默认 'latest'
  access?: 'public' | 'restricted'
  dryRun?: boolean       // 测试运行，不实际发布
  otp?: string           // 2FA 验证码
}

// ========== 版本管理器 ==========

export class VersionManager {
  private projectPath: string
  private archiveDir: string
  private historyDir: string
  private maxVersions: number
  private autoArchive: boolean
  private compressionLevel: number
  private versionHistory: VersionInfo[] = []

  constructor(config: VersionManagerConfig) {
    this.projectPath = config.projectPath
    this.archiveDir = config.archiveDir || resolve(config.projectPath, '.ldesign', 'archives')
    this.historyDir = config.historyDir || resolve(config.projectPath, '.ldesign', 'versions')
    this.maxVersions = config.maxVersions || 50
    this.autoArchive = config.autoArchive !== false
    this.compressionLevel = config.compressionLevel || 6

    this.ensureDirectories()
    this.loadVersionHistory()
  }

  /**
   * 确保必要目录存在
   */
  private ensureDirectories(): void {
    if (!existsSync(this.archiveDir)) {
      mkdirSync(this.archiveDir, { recursive: true })
    }
    if (!existsSync(this.historyDir)) {
      mkdirSync(this.historyDir, { recursive: true })
    }
  }

  /**
   * 加载版本历史
   */
  private loadVersionHistory(): void {
    const historyFile = resolve(this.historyDir, 'history.json')
    if (existsSync(historyFile)) {
      try {
        this.versionHistory = JSON.parse(readFileSync(historyFile, 'utf-8'))
      } catch {
        this.versionHistory = []
      }
    }
  }

  /**
   * 保存版本历史
   */
  private saveVersionHistory(): void {
    const historyFile = resolve(this.historyDir, 'history.json')
    writeFileSync(historyFile, JSON.stringify(this.versionHistory, null, 2))
  }

  /**
   * 获取当前项目版本
   */
  getCurrentVersion(): string {
    const pkgPath = resolve(this.projectPath, 'package.json')
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
        return pkg.version || '0.0.0'
      } catch {
        return '0.0.0'
      }
    }
    return '0.0.0'
  }

  /**
   * 更新项目版本
   */
  updateVersion(newVersion: string): void {
    const pkgPath = resolve(this.projectPath, 'package.json')
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
        pkg.version = newVersion
        writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
        logger.success(`版本已更新: ${newVersion}`)
      } catch (error) {
        logger.error('更新版本失败:', error)
        throw error
      }
    }
  }

  /**
   * 递增版本号
   */
  bumpVersion(type: 'major' | 'minor' | 'patch' | 'prerelease' = 'patch', preid?: string): string {
    const current = this.getCurrentVersion()
    const parts = current.split('-')
    const [major, minor, patch] = parts[0].split('.').map(Number)

    let newVersion: string

    switch (type) {
      case 'major':
        newVersion = `${major + 1}.0.0`
        break
      case 'minor':
        newVersion = `${major}.${minor + 1}.0`
        break
      case 'patch':
        newVersion = `${major}.${minor}.${patch + 1}`
        break
      case 'prerelease':
        const prereleaseId = preid || 'alpha'
        if (parts[1]) {
          // 已有预发布版本号
          const preNum = parseInt(parts[1].split('.')[1] || '0') + 1
          newVersion = `${major}.${minor}.${patch}-${prereleaseId}.${preNum}`
        } else {
          newVersion = `${major}.${minor}.${patch}-${prereleaseId}.0`
        }
        break
      default:
        newVersion = `${major}.${minor}.${patch + 1}`
    }

    this.updateVersion(newVersion)
    return newVersion
  }

  /**
   * 记录构建版本
   */
  async recordBuild(buildInfo: Omit<VersionInfo, 'version'>): Promise<VersionInfo> {
    const version = this.getCurrentVersion()
    const versionInfo: VersionInfo = {
      version,
      ...buildInfo
    }

    // 添加到历史记录
    this.versionHistory.push(versionInfo)

    // 保存版本快照
    const snapshotFile = resolve(this.historyDir, `${version}-${buildInfo.timestamp}.json`)
    writeFileSync(snapshotFile, JSON.stringify(versionInfo, null, 2))

    // 自动归档旧版本
    if (this.autoArchive && this.versionHistory.length > this.maxVersions) {
      await this.archiveOldVersions()
    }

    // 保存历史
    this.saveVersionHistory()

    logger.success(`版本 ${version} 构建记录已保存`)
    return versionInfo
  }

  /**
   * 归档当前构建产物为 npm 兼容的 .tgz 文件
   */
  async archiveCurrentBuild(options?: { 
    version?: string
    outputDirs?: string[]
    notes?: string 
  }): Promise<VersionArchive> {
    const version = options?.version || this.getCurrentVersion()
    const timestamp = Date.now()
    const archiveName = `${this.getPackageName()}-${version}-${timestamp}.tgz`
    const archivePath = resolve(this.archiveDir, archiveName)

    // 需要归档的目录
    const outputDirs = options?.outputDirs || ['dist', 'es', 'lib', 'esm', 'cjs', 'umd', 'types']
    const existingDirs = outputDirs.filter(dir => 
      existsSync(resolve(this.projectPath, dir))
    )

    if (existingDirs.length === 0) {
      throw new Error('没有找到可归档的构建产物目录')
    }

    // 创建临时目录用于打包
    const tempDir = resolve(this.historyDir, `temp-${timestamp}`)
    mkdirSync(tempDir, { recursive: true })

    try {
      // 复制 package.json
      const pkgPath = resolve(this.projectPath, 'package.json')
      if (existsSync(pkgPath)) {
        copyFileSync(pkgPath, resolve(tempDir, 'package.json'))
      }

      // 复制 README.md
      const readmePath = resolve(this.projectPath, 'README.md')
      if (existsSync(readmePath)) {
        copyFileSync(readmePath, resolve(tempDir, 'README.md'))
      }

      // 复制构建产物
      for (const dir of existingDirs) {
        const srcDir = resolve(this.projectPath, dir)
        const destDir = resolve(tempDir, dir)
        this.copyDirectory(srcDir, destDir)
      }

      // 创建 .tgz 压缩包
      await this.createTarGzip(tempDir, archivePath)

      // 获取归档信息
      const archiveStat = statSync(archivePath)
      const originalSize = this.getDirectorySize(tempDir)

      const archive: VersionArchive = {
        version,
        archivePath,
        archiveSize: archiveStat.size,
        createdAt: timestamp,
        originalSize,
        compressionRatio: originalSize > 0 ? archiveStat.size / originalSize : 1
      }

      // 记录归档信息
      this.saveArchiveInfo(archive, options?.notes)

      logger.success(`版本 ${version} 已归档: ${archiveName}`)
      logger.info(`  原始大小: ${this.formatSize(originalSize)}`)
      logger.info(`  压缩后: ${this.formatSize(archiveStat.size)}`)
      logger.info(`  压缩率: ${(archive.compressionRatio * 100).toFixed(1)}%`)

      return archive

    } finally {
      // 清理临时目录
      rmSync(tempDir, { recursive: true, force: true })
    }
  }

  /**
   * 复制目录
   */
  private copyDirectory(src: string, dest: string): void {
    mkdirSync(dest, { recursive: true })
    const items = readdirSync(src)

    for (const item of items) {
      const srcPath = join(src, item)
      const destPath = join(dest, item)
      const stat = statSync(srcPath)

      if (stat.isDirectory()) {
        this.copyDirectory(srcPath, destPath)
      } else {
        copyFileSync(srcPath, destPath)
      }
    }
  }

  /**
   * 创建 tar.gz 压缩包
   */
  private async createTarGzip(sourceDir: string, targetPath: string): Promise<void> {
    await tar.create({
      gzip: true,
      file: targetPath,
      cwd: sourceDir,
      prefix: 'package'
    }, readdirSync(sourceDir))
  }

  /**
   * 解压归档文件
   */
  async extractArchive(archivePath: string, targetDir: string): Promise<void> {
    if (!existsSync(archivePath)) {
      throw new Error(`归档文件不存在: ${archivePath}`)
    }

    mkdirSync(targetDir, { recursive: true })

    await tar.extract({
      file: archivePath,
      cwd: targetDir,
      strip: 1 // 移除 'package' 前缀
    })

    logger.success(`归档已解压到: ${targetDir}`)
  }

  /**
   * 保存归档信息
   */
  private saveArchiveInfo(archive: VersionArchive, notes?: string): void {
    const archivesFile = resolve(this.archiveDir, 'archives.json')
    let archives: Array<VersionArchive & { notes?: string }> = []

    if (existsSync(archivesFile)) {
      try {
        archives = JSON.parse(readFileSync(archivesFile, 'utf-8'))
      } catch {
        archives = []
      }
    }

    archives.push({ ...archive, notes })
    writeFileSync(archivesFile, JSON.stringify(archives, null, 2))
  }

  /**
   * 获取所有归档列表
   */
  getArchives(): Array<VersionArchive & { notes?: string }> {
    const archivesFile = resolve(this.archiveDir, 'archives.json')
    if (existsSync(archivesFile)) {
      try {
        return JSON.parse(readFileSync(archivesFile, 'utf-8'))
      } catch {
        return []
      }
    }
    return []
  }

  /**
   * 删除归档
   */
  deleteArchive(version: string, timestamp?: number): boolean {
    const archives = this.getArchives()
    const index = archives.findIndex(a => 
      a.version === version && (!timestamp || a.createdAt === timestamp)
    )

    if (index === -1) {
      return false
    }

    const archive = archives[index]
    
    // 删除文件
    if (existsSync(archive.archivePath)) {
      rmSync(archive.archivePath)
    }

    // 更新列表
    archives.splice(index, 1)
    const archivesFile = resolve(this.archiveDir, 'archives.json')
    writeFileSync(archivesFile, JSON.stringify(archives, null, 2))

    logger.info(`已删除归档: ${archive.version}`)
    return true
  }

  /**
   * 恢复指定版本
   */
  async restoreVersion(version: string, timestamp?: number): Promise<void> {
    const archives = this.getArchives()
    const archive = archives.find(a => 
      a.version === version && (!timestamp || a.createdAt === timestamp)
    )

    if (!archive) {
      throw new Error(`未找到版本 ${version} 的归档`)
    }

    // 备份当前版本
    await this.archiveCurrentBuild({ 
      notes: `恢复版本前的自动备份` 
    })

    // 解压归档到项目目录
    await this.extractArchive(archive.archivePath, this.projectPath)

    logger.success(`已恢复版本: ${version}`)
  }

  /**
   * 归档旧版本
   */
  private async archiveOldVersions(): Promise<void> {
    const versionsToArchive = this.versionHistory.slice(0, -this.maxVersions)
    
    for (const versionInfo of versionsToArchive) {
      const snapshotFile = resolve(
        this.historyDir, 
        `${versionInfo.version}-${versionInfo.timestamp}.json`
      )
      
      // 移动快照到归档目录
      if (existsSync(snapshotFile)) {
        const archiveFile = resolve(
          this.archiveDir, 
          `snapshot-${versionInfo.version}-${versionInfo.timestamp}.json`
        )
        copyFileSync(snapshotFile, archiveFile)
        rmSync(snapshotFile)
      }
    }

    // 更新历史记录
    this.versionHistory = this.versionHistory.slice(-this.maxVersions)
    this.saveVersionHistory()

    logger.info(`已归档 ${versionsToArchive.length} 个旧版本记录`)
  }

  /**
   * 获取版本历史
   */
  getVersionHistory(): VersionInfo[] {
    return [...this.versionHistory]
  }

  /**
   * 获取特定版本信息
   */
  getVersionInfo(version: string): VersionInfo | undefined {
    return this.versionHistory.find(v => v.version === version)
  }

  /**
   * 清理所有归档
   */
  clearAllArchives(): void {
    const archives = this.getArchives()
    
    for (const archive of archives) {
      if (existsSync(archive.archivePath)) {
        rmSync(archive.archivePath)
      }
    }

    const archivesFile = resolve(this.archiveDir, 'archives.json')
    writeFileSync(archivesFile, '[]')

    logger.info('已清理所有归档')
  }

  /**
   * 获取包名称
   */
  private getPackageName(): string {
    const pkgPath = resolve(this.projectPath, 'package.json')
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
        return (pkg.name || 'package').replace(/[@\/]/g, '-').replace(/^-/, '')
      } catch {
        return 'package'
      }
    }
    return 'package'
  }

  /**
   * 获取目录大小
   */
  private getDirectorySize(dirPath: string): number {
    let totalSize = 0

    const scanDir = (path: string) => {
      try {
        const items = readdirSync(path)
        for (const item of items) {
          const itemPath = join(path, item)
          const stat = statSync(itemPath)
          if (stat.isDirectory()) {
            scanDir(itemPath)
          } else {
            totalSize += stat.size
          }
        }
      } catch {}
    }

    scanDir(dirPath)
    return totalSize
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
   * 获取归档目录路径
   */
  getArchiveDir(): string {
    return this.archiveDir
  }

  /**
   * 获取归档统计信息
   */
  getArchiveStats(): {
    totalArchives: number
    totalSize: number
    oldestVersion: string | null
    newestVersion: string | null
    versions: string[]
  } {
    const archives = this.getArchives()
    const totalSize = archives.reduce((sum, a) => sum + a.archiveSize, 0)
    const versions = [...new Set(archives.map(a => a.version))]

    return {
      totalArchives: archives.length,
      totalSize,
      oldestVersion: archives.length > 0 ? archives[0].version : null,
      newestVersion: archives.length > 0 ? archives[archives.length - 1].version : null,
      versions
    }
  }
}

// 导出创建函数
export function createVersionManager(projectPath: string, options?: Partial<VersionManagerConfig>): VersionManager {
  return new VersionManager({
    projectPath,
    ...options
  })
}
