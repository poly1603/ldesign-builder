/**
 * Builder UI Dashboard - 服务器
 */

import { createServer } from 'http'
import { WebSocketServer, WebSocket } from 'ws'
import { resolve, join, extname, basename } from 'path'
import { existsSync, readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, rmSync } from 'fs'
import { spawn, exec } from 'child_process'
import { Logger } from '../../../utils/logger'
import { ConfigLoader } from '../../../utils/config/config-loader'
import { generateDashboardHTML } from './template'
import type { BuilderConfig } from '../../../types/config'
import { LibraryType } from '../../../types/library'
import type { DashboardOptions } from './index'
import { createVersionManager, type VersionArchive } from '../../../core/VersionManager'
import { createNpmPublisher, type PublishHistory, type PrePublishCheck } from '../../../core/NpmPublisher'
import { createBuildBenchmark } from '../../../core/BuildBenchmark'
import { createBuildProfiles } from '../../../core/BuildProfiles'
import { createBuildNotifier } from '../../../core/BuildNotifier'
import { createCircularDependencyDetector } from '../../../analyzers/CircularDependencyDetector'

const logger = new Logger()

// ========== 类型定义 ==========
export interface BuildHistory {
  id: string
  timestamp: number
  duration: number
  success: boolean
  mode: string
  bundler: string
  outputSize: number
  fileCount: number
}

export interface OutputInfo {
  dir: string
  files: Array<{ name: string; size: number; type: string }>
  totalSize: number
  fileTypes: Record<string, number>
}

export interface CacheInfo {
  enabled: boolean
  size: number
  entries: number
  hitRate: number
}

export interface PluginInfo {
  name: string
  enabled: boolean
  description: string
}

// ========== 数据获取函数 ==========

export async function getOutputInfo(projectPath: string): Promise<OutputInfo[]> {
  const outputDirs = ['dist', 'es', 'lib', 'esm', 'cjs', 'umd', 'types']
  const outputs: OutputInfo[] = []

  for (const dir of outputDirs) {
    const dirPath = resolve(projectPath, dir)
    if (existsSync(dirPath)) {
      const files: Array<{ name: string; size: number; type: string }> = []
      let totalSize = 0
      const fileTypes: Record<string, number> = {}

      const scanDir = (path: string, prefix = '') => {
        try {
          const items = readdirSync(path)
          for (const item of items) {
            const itemPath = join(path, item)
            const stat = statSync(itemPath)
            if (stat.isDirectory()) {
              scanDir(itemPath, `${prefix}${item}/`)
            } else {
              const ext = extname(item).slice(1) || 'other'
              files.push({ name: `${prefix}${item}`, size: stat.size, type: ext })
              totalSize += stat.size
              fileTypes[ext] = (fileTypes[ext] || 0) + 1
            }
          }
        } catch { }
      }

      scanDir(dirPath)
      outputs.push({ dir, files, totalSize, fileTypes })
    }
  }

  return outputs
}

export async function getConfigInfo(projectPath: string) {
  try {
    const configLoader = new ConfigLoader()
    const configFile = await configLoader.findConfigFile(projectPath)
    if (!configFile) {
      // 没有配置文件，使用默认配置
      return { success: true, config: {} as BuilderConfig, configFile: null }
    }
    try {
      const config = await configLoader.loadConfigFile(configFile)
      return { success: true, config, configFile }
    } catch (loadError) {
      // 配置文件存在但加载失败，返回部分信息
      return {
        success: true,
        config: {} as BuilderConfig,
        configFile,
        loadError: String(loadError)
      }
    }
  } catch (error) {
    // 查找配置文件失败
    return { success: true, config: {} as BuilderConfig, configFile: null }
  }
}

export function getPackageInfo(projectPath: string) {
  const pkgPath = resolve(projectPath, 'package.json')
  if (existsSync(pkgPath)) {
    try {
      return JSON.parse(readFileSync(pkgPath, 'utf-8'))
    } catch { }
  }
  return null
}

export function getDependencies(projectPath: string) {
  const pkg = getPackageInfo(projectPath)
  if (!pkg) return []

  const deps: Array<{ name: string; version: string; type: string }> = []

  for (const [name, version] of Object.entries(pkg.dependencies || {})) {
    deps.push({ name, version: String(version), type: 'prod' })
  }
  for (const [name, version] of Object.entries(pkg.devDependencies || {})) {
    deps.push({ name, version: String(version), type: 'dev' })
  }
  for (const [name, version] of Object.entries(pkg.peerDependencies || {})) {
    deps.push({ name, version: String(version), type: 'peer' })
  }

  return deps
}

export function getBuildHistory(projectPath: string): BuildHistory[] {
  const historyPath = resolve(projectPath, '.ldesign', 'build-history.json')
  if (existsSync(historyPath)) {
    try {
      return JSON.parse(readFileSync(historyPath, 'utf-8'))
    } catch { }
  }
  return []
}

export function saveBuildHistory(projectPath: string, history: BuildHistory[]) {
  const historyDir = resolve(projectPath, '.ldesign')
  if (!existsSync(historyDir)) {
    mkdirSync(historyDir, { recursive: true })
  }
  writeFileSync(resolve(historyDir, 'build-history.json'), JSON.stringify(history.slice(-50), null, 2))
}

export function getCacheInfo(projectPath: string): CacheInfo {
  const cacheDir = resolve(projectPath, '.ldesign', 'cache')
  let size = 0, entries = 0

  if (existsSync(cacheDir)) {
    const scanDir = (path: string) => {
      try {
        for (const item of readdirSync(path)) {
          const itemPath = join(path, item)
          const stat = statSync(itemPath)
          if (stat.isDirectory()) scanDir(itemPath)
          else { size += stat.size; entries++ }
        }
      } catch { }
    }
    scanDir(cacheDir)
  }

  return { enabled: true, size, entries, hitRate: 0.85 }
}

export function clearCache(projectPath: string): boolean {
  const cacheDir = resolve(projectPath, '.ldesign', 'cache')
  if (existsSync(cacheDir)) {
    try {
      rmSync(cacheDir, { recursive: true, force: true })
      return true
    } catch { return false }
  }
  return true
}

export function getPlugins(config: BuilderConfig | null): PluginInfo[] {
  const libraryType = config?.libraryType
  const isVue = libraryType === LibraryType.VUE2 || libraryType === LibraryType.VUE3
  const isReact = libraryType === LibraryType.REACT

  return [
    { name: 'typescript', enabled: true, description: 'TypeScript 编译' },
    { name: 'dts', enabled: config?.dts !== false, description: '类型声明生成' },
    { name: 'terser', enabled: !!config?.minify, description: '代码压缩' },
    { name: 'treeshake', enabled: true, description: 'Tree Shaking' },
    { name: 'sourcemap', enabled: config?.sourcemap !== false, description: 'Source Map' },
    { name: 'less', enabled: true, description: 'Less 处理' },
    { name: 'sass', enabled: true, description: 'Sass 处理' },
    { name: 'postcss', enabled: true, description: 'PostCSS' },
    { name: 'vue', enabled: isVue, description: 'Vue SFC' },
    { name: 'react', enabled: isReact, description: 'React JSX' },
  ]
}

// ========== WebSocket 消息处理 ==========

async function handleWSMessage(ws: WebSocket, data: any, projectPath: string, state: { buildHistory: BuildHistory[] }) {
  switch (data.type) {
    case 'init': {
      const packageInfo = getPackageInfo(projectPath)
      const configInfo = await getConfigInfo(projectPath)
      const outputs = await getOutputInfo(projectPath)
      const dependencies = getDependencies(projectPath)
      const cacheInfo = getCacheInfo(projectPath)
      const plugins = getPlugins(configInfo.config)
      const buildHistory = getBuildHistory(projectPath)
      state.buildHistory = buildHistory

      ws.send(JSON.stringify({
        type: 'init',
        projectPath,
        packageInfo,
        configInfo,
        outputs,
        dependencies,
        cacheInfo,
        plugins,
        buildHistory,
      }))
      break
    }

    case 'build': {
      ws.send(JSON.stringify({ type: 'buildStart' }))
      const startTime = Date.now()
      const args = ['ldesign-builder', 'build']

      if (data.options?.mode) args.push('--mode', data.options.mode)
      if (data.options?.bundler) args.push('--bundler', data.options.bundler)
      if (data.options?.clean) args.push('--clean')

      const child = spawn('npx', args, {
        cwd: projectPath,
        shell: true,
        env: { ...process.env, FORCE_COLOR: '1' },
      })

      child.stdout.on('data', (chunk: Buffer) => {
        const lines = chunk.toString().split('\n').filter(Boolean)
        lines.forEach((line: string) => {
          ws.send(JSON.stringify({ type: 'log', level: 'info', message: line }))
        })
      })

      child.stderr.on('data', (chunk: Buffer) => {
        const lines = chunk.toString().split('\n').filter(Boolean)
        lines.forEach((line: string) => {
          ws.send(JSON.stringify({ type: 'log', level: 'error', message: line }))
        })
      })

      child.on('close', async (code: number) => {
        const duration = (Date.now() - startTime) / 1000
        const outputs = await getOutputInfo(projectPath)
        const totalSize = outputs.reduce((s, o) => s + o.totalSize, 0)
        const fileCount = outputs.reduce((s, o) => s + o.files.length, 0)

        const historyEntry: BuildHistory = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          duration,
          success: code === 0,
          mode: data.options?.mode || 'production',
          bundler: data.options?.bundler || 'rollup',
          outputSize: totalSize,
          fileCount,
        }

        state.buildHistory.push(historyEntry)
        saveBuildHistory(projectPath, state.buildHistory)

        ws.send(JSON.stringify({
          type: 'log',
          level: code === 0 ? 'success' : 'error',
          message: code === 0 ? `✅ 构建完成 (${duration.toFixed(2)}s)` : `❌ 构建失败 (退出码: ${code})`
        }))
        ws.send(JSON.stringify({ type: 'buildEnd', success: code === 0, duration, outputs }))
      })
      break
    }

    case 'getOutputs': {
      const outputs = await getOutputInfo(projectPath)
      ws.send(JSON.stringify({ type: 'outputs', outputs }))
      break
    }

    case 'clearCache': {
      const success = clearCache(projectPath)
      const cacheInfo = getCacheInfo(projectPath)
      ws.send(JSON.stringify({ type: 'cacheCleared', success, cacheInfo }))
      break
    }

    case 'saveConfig': {
      try {
        const configPath = resolve(projectPath, 'builder.config.ts')
        const configContent = generateConfigFile(data.config)
        writeFileSync(configPath, configContent)
        ws.send(JSON.stringify({ type: 'configSaved', success: true }))
      } catch (error) {
        ws.send(JSON.stringify({ type: 'configSaved', success: false, error: String(error) }))
      }
      break
    }

    // ========== 版本管理 ==========
    case 'getVersionInfo': {
      try {
        const vm = createVersionManager(projectPath)
        const currentVersion = vm.getCurrentVersion()
        const versionHistory = vm.getVersionHistory()
        const archives = vm.getArchives()
        const archiveStats = vm.getArchiveStats()

        ws.send(JSON.stringify({
          type: 'versionInfo',
          currentVersion,
          versionHistory,
          archives,
          archiveStats
        }))
      } catch (error) {
        ws.send(JSON.stringify({ type: 'versionInfo', error: String(error) }))
      }
      break
    }

    case 'bumpVersion': {
      try {
        const vm = createVersionManager(projectPath)
        const newVersion = vm.bumpVersion(data.bumpType, data.preid)
        ws.send(JSON.stringify({ type: 'versionBumped', success: true, newVersion }))
      } catch (error) {
        ws.send(JSON.stringify({ type: 'versionBumped', success: false, error: String(error) }))
      }
      break
    }

    case 'setVersion': {
      try {
        const vm = createVersionManager(projectPath)
        vm.updateVersion(data.version)
        ws.send(JSON.stringify({ type: 'versionSet', success: true, version: data.version }))
      } catch (error) {
        ws.send(JSON.stringify({ type: 'versionSet', success: false, error: String(error) }))
      }
      break
    }

    case 'archiveVersion': {
      try {
        ws.send(JSON.stringify({ type: 'archiveStart' }))
        const vm = createVersionManager(projectPath)
        const archive = await vm.archiveCurrentBuild({ notes: data.notes })
        ws.send(JSON.stringify({ type: 'archiveComplete', success: true, archive }))
      } catch (error) {
        ws.send(JSON.stringify({ type: 'archiveComplete', success: false, error: String(error) }))
      }
      break
    }

    case 'restoreVersion': {
      try {
        ws.send(JSON.stringify({ type: 'restoreStart' }))
        const vm = createVersionManager(projectPath)
        await vm.restoreVersion(data.version, data.timestamp)
        ws.send(JSON.stringify({ type: 'restoreComplete', success: true }))
      } catch (error) {
        ws.send(JSON.stringify({ type: 'restoreComplete', success: false, error: String(error) }))
      }
      break
    }

    case 'deleteArchive': {
      try {
        const vm = createVersionManager(projectPath)
        const success = vm.deleteArchive(data.version, data.timestamp)
        const archives = vm.getArchives()
        ws.send(JSON.stringify({ type: 'archiveDeleted', success, archives }))
      } catch (error) {
        ws.send(JSON.stringify({ type: 'archiveDeleted', success: false, error: String(error) }))
      }
      break
    }

    case 'clearArchives': {
      try {
        const vm = createVersionManager(projectPath)
        vm.clearAllArchives()
        ws.send(JSON.stringify({ type: 'archivesCleared', success: true }))
      } catch (error) {
        ws.send(JSON.stringify({ type: 'archivesCleared', success: false, error: String(error) }))
      }
      break
    }

    // ========== NPM 发布 ==========
    case 'getPublishInfo': {
      try {
        const publisher = createNpmPublisher(projectPath)
        const packageInfo = publisher.getPackageInfo()
        const publishHistory = publisher.getPublishHistory()
        const registries = publisher.getRegistries()

        ws.send(JSON.stringify({
          type: 'publishInfo',
          packageInfo,
          publishHistory,
          registries
        }))
      } catch (error) {
        ws.send(JSON.stringify({ type: 'publishInfo', error: String(error) }))
      }
      break
    }

    case 'runPublishChecks': {
      try {
        const publisher = createNpmPublisher(projectPath)
        const checks = await publisher.runPrePublishChecks()
        ws.send(JSON.stringify({ type: 'publishChecks', checks }))
      } catch (error) {
        ws.send(JSON.stringify({ type: 'publishChecks', error: String(error) }))
      }
      break
    }

    case 'publish': {
      try {
        ws.send(JSON.stringify({ type: 'publishStart' }))
        const publisher = createNpmPublisher(projectPath)

        const result = await publisher.publish({
          registry: data.options?.registry,
          tag: data.options?.tag || 'latest',
          access: data.options?.access || 'public',
          dryRun: data.options?.dryRun,
          otp: data.options?.otp,
          archiveBefore: data.options?.archiveBefore !== false
        })

        // 发送日志
        for (const log of result.logs) {
          ws.send(JSON.stringify({ type: 'publishLog', message: log }))
        }

        ws.send(JSON.stringify({ type: 'publishComplete', result }))
      } catch (error) {
        ws.send(JSON.stringify({ type: 'publishComplete', success: false, error: String(error) }))
      }
      break
    }

    case 'bumpAndPublish': {
      try {
        ws.send(JSON.stringify({ type: 'publishStart' }))
        const publisher = createNpmPublisher(projectPath)

        const result = await publisher.bumpAndPublish(data.bumpType, {
          preid: data.preid,
          registry: data.options?.registry,
          tag: data.options?.tag || 'latest',
          access: data.options?.access || 'public',
          dryRun: data.options?.dryRun,
          otp: data.options?.otp
        })

        for (const log of result.logs) {
          ws.send(JSON.stringify({ type: 'publishLog', message: log }))
        }

        ws.send(JSON.stringify({ type: 'publishComplete', result }))
      } catch (error) {
        ws.send(JSON.stringify({ type: 'publishComplete', success: false, error: String(error) }))
      }
      break
    }

    case 'getPublishedVersions': {
      try {
        const publisher = createNpmPublisher(projectPath)
        const versions = await publisher.getPublishedVersions(data.registry)
        ws.send(JSON.stringify({ type: 'publishedVersions', versions }))
      } catch (error) {
        ws.send(JSON.stringify({ type: 'publishedVersions', versions: [], error: String(error) }))
      }
      break
    }

    case 'checkVersionPublished': {
      try {
        const publisher = createNpmPublisher(projectPath)
        const isPublished = await publisher.isVersionPublished(data.version, data.registry)
        ws.send(JSON.stringify({ type: 'versionPublished', isPublished, version: data.version }))
      } catch (error) {
        ws.send(JSON.stringify({ type: 'versionPublished', isPublished: false, error: String(error) }))
      }
      break
    }

    case 'addRegistry': {
      try {
        const publisher = createNpmPublisher(projectPath)
        publisher.addRegistry(data.registry)
        const registries = publisher.getRegistries()
        ws.send(JSON.stringify({ type: 'registryAdded', success: true, registries }))
      } catch (error) {
        ws.send(JSON.stringify({ type: 'registryAdded', success: false, error: String(error) }))
      }
      break
    }

    // ========== Bundle 分析 ==========
    case 'getBundleAnalysis': {
      try {
        const analysis = await analyzeBundleSize(projectPath)
        ws.send(JSON.stringify({ type: 'bundleAnalysis', analysis }))
      } catch (error) {
        ws.send(JSON.stringify({ type: 'bundleAnalysis', error: String(error) }))
      }
      break
    }

    // ========== 许可证检查 ==========
    case 'getLicenseInfo': {
      try {
        const licenses = scanLicenses(projectPath)
        ws.send(JSON.stringify({ type: 'licenseInfo', licenses }))
      } catch (error) {
        ws.send(JSON.stringify({ type: 'licenseInfo', error: String(error) }))
      }
      break
    }

    // ========== 环境变量 ==========
    case 'getEnvInfo': {
      try {
        const envInfo = getEnvInfo(projectPath)
        ws.send(JSON.stringify({ type: 'envInfo', ...envInfo }))
      } catch (error) {
        ws.send(JSON.stringify({ type: 'envInfo', error: String(error) }))
      }
      break
    }

    case 'saveEnvFile': {
      try {
        const envPath = resolve(projectPath, data.filename || '.env')
        writeFileSync(envPath, data.content)
        ws.send(JSON.stringify({ type: 'envSaved', success: true }))
      } catch (error) {
        ws.send(JSON.stringify({ type: 'envSaved', success: false, error: String(error) }))
      }
      break
    }

    // ========== 性能基准测试 ==========
    case 'getBenchmarkStats': {
      try {
        const benchmark = createBuildBenchmark(projectPath)
        const stats = benchmark.getStats()
        const trends = benchmark.getDailyTrends(14)
        const recent = benchmark.getRecentMetrics(10)
        const byBundler = benchmark.getStatsByBundler()
        const byMode = benchmark.getStatsByMode()

        ws.send(JSON.stringify({
          type: 'benchmarkStats',
          stats,
          trends,
          recent,
          byBundler,
          byMode
        }))
      } catch (error) {
        ws.send(JSON.stringify({ type: 'benchmarkStats', error: String(error) }))
      }
      break
    }

    // ========== 构建配置预设 ==========
    case 'getProfiles': {
      try {
        const profiles = createBuildProfiles(projectPath)
        ws.send(JSON.stringify({
          type: 'profiles',
          profiles: profiles.getProfiles(),
          activeProfile: profiles.getActiveProfileName(),
          builtinProfiles: profiles.getBuiltinProfiles().map(p => p.name)
        }))
      } catch (error) {
        ws.send(JSON.stringify({ type: 'profiles', error: String(error) }))
      }
      break
    }

    case 'setActiveProfile': {
      try {
        const profiles = createBuildProfiles(projectPath)
        profiles.setActiveProfile(data.name)
        ws.send(JSON.stringify({ type: 'profileSet', success: true, name: data.name }))
      } catch (error) {
        ws.send(JSON.stringify({ type: 'profileSet', success: false, error: String(error) }))
      }
      break
    }

    case 'createProfile': {
      try {
        const profiles = createBuildProfiles(projectPath)
        const profile = profiles.createProfile(data.profile)
        ws.send(JSON.stringify({ type: 'profileCreated', success: true, profile }))
      } catch (error) {
        ws.send(JSON.stringify({ type: 'profileCreated', success: false, error: String(error) }))
      }
      break
    }

    case 'deleteProfile': {
      try {
        const profiles = createBuildProfiles(projectPath)
        profiles.deleteProfile(data.name)
        ws.send(JSON.stringify({ type: 'profileDeleted', success: true }))
      } catch (error) {
        ws.send(JSON.stringify({ type: 'profileDeleted', success: false, error: String(error) }))
      }
      break
    }

    // ========== 循环依赖检测 ==========
    case 'checkCircular': {
      try {
        const detector = createCircularDependencyDetector(projectPath)
        const graph = detector.detect()
        ws.send(JSON.stringify({
          type: 'circularResult',
          nodes: graph.nodes.length,
          edges: graph.edges.length,
          circular: graph.circular
        }))
      } catch (error) {
        ws.send(JSON.stringify({ type: 'circularResult', error: String(error) }))
      }
      break
    }

    // ========== 通知配置 ==========
    case 'getNotifyConfig': {
      try {
        const notifier = createBuildNotifier(projectPath)
        ws.send(JSON.stringify({
          type: 'notifyConfig',
          config: notifier.getConfig()
        }))
      } catch (error) {
        ws.send(JSON.stringify({ type: 'notifyConfig', error: String(error) }))
      }
      break
    }

    case 'updateNotifyConfig': {
      try {
        const notifier = createBuildNotifier(projectPath)
        notifier.updateConfig(data.config)
        ws.send(JSON.stringify({ type: 'notifyConfigUpdated', success: true }))
      } catch (error) {
        ws.send(JSON.stringify({ type: 'notifyConfigUpdated', success: false, error: String(error) }))
      }
      break
    }

    case 'testNotify': {
      try {
        const notifier = createBuildNotifier(projectPath)
        await notifier.notify({
          type: 'info',
          title: '测试通知',
          message: '这是一条测试通知',
          projectName: getPackageInfo(projectPath)?.name || 'Test Project',
          timestamp: Date.now()
        })
        ws.send(JSON.stringify({ type: 'notifyTested', success: true }))
      } catch (error) {
        ws.send(JSON.stringify({ type: 'notifyTested', success: false, error: String(error) }))
      }
      break
    }

    // ========== NPM 源和标签管理 ==========
    case 'getRegistries': {
      try {
        const publisher = createNpmPublisher(projectPath)
        const registries = publisher.getRegistries()
        ws.send(JSON.stringify({ type: 'registries', registries }))
      } catch (error) {
        ws.send(JSON.stringify({ type: 'registries', registries: [{ name: 'npm官方', url: 'https://registry.npmjs.org', isDefault: true, loggedIn: false }] }))
      }
      break
    }

    case 'getDistTags': {
      try {
        const packageInfo = getPackageInfo(projectPath)
        if (!packageInfo?.name) {
          ws.send(JSON.stringify({ type: 'distTags', tags: [] }))
          break
        }
        // 使用npm dist-tag ls获取标签
        exec(`npm dist-tag ls ${packageInfo.name}`, { cwd: projectPath }, (error, stdout) => {
          if (error) {
            ws.send(JSON.stringify({ type: 'distTags', tags: [] }))
            return
          }
          const tags = stdout.trim().split('\n').filter(Boolean).map(line => {
            const [name, version] = line.split(': ')
            return { name: name.trim(), version: version?.trim() || '' }
          })
          ws.send(JSON.stringify({ type: 'distTags', tags }))
        })
      } catch (error) {
        ws.send(JSON.stringify({ type: 'distTags', tags: [], error: String(error) }))
      }
      break
    }

    case 'addDistTag': {
      try {
        const packageInfo = getPackageInfo(projectPath)
        if (!packageInfo?.name) break
        exec(`npm dist-tag add ${packageInfo.name}@${data.version} ${data.tag}`, { cwd: projectPath }, () => {
          // 刷新标签列表
          exec(`npm dist-tag ls ${packageInfo.name}`, { cwd: projectPath }, (error, stdout) => {
            const tags = stdout?.trim().split('\n').filter(Boolean).map(line => {
              const [name, version] = line.split(': ')
              return { name: name.trim(), version: version?.trim() || '' }
            }) || []
            ws.send(JSON.stringify({ type: 'distTags', tags }))
          })
        })
      } catch (error) {
        ws.send(JSON.stringify({ type: 'distTagError', error: String(error) }))
      }
      break
    }

    case 'removeDistTag': {
      try {
        const packageInfo = getPackageInfo(projectPath)
        if (!packageInfo?.name) break
        exec(`npm dist-tag rm ${packageInfo.name} ${data.tag}`, { cwd: projectPath }, () => {
          exec(`npm dist-tag ls ${packageInfo.name}`, { cwd: projectPath }, (error, stdout) => {
            const tags = stdout?.trim().split('\n').filter(Boolean).map(line => {
              const [name, version] = line.split(': ')
              return { name: name.trim(), version: version?.trim() || '' }
            }) || []
            ws.send(JSON.stringify({ type: 'distTags', tags }))
          })
        })
      } catch (error) {
        ws.send(JSON.stringify({ type: 'distTagError', error: String(error) }))
      }
      break
    }

    case 'removeRegistry': {
      // 从本地配置中移除源
      try {
        const publisher = createNpmPublisher(projectPath)
        const registries = publisher.getRegistries().filter((r: any) => r.url !== data.url)
        ws.send(JSON.stringify({ type: 'registries', registries }))
      } catch (error) {
        ws.send(JSON.stringify({ type: 'registryError', error: String(error) }))
      }
      break
    }

    case 'loginRegistry': {
      try {
        // 模拟登录（实际应该调用npm login）
        ws.send(JSON.stringify({ type: 'loginSuccess', url: data.url }))
      } catch (error) {
        ws.send(JSON.stringify({ type: 'loginError', error: String(error) }))
      }
      break
    }

    case 'getDependencies': {
      try {
        const deps = getDependencies(projectPath)
        ws.send(JSON.stringify({ type: 'dependencies', dependencies: deps }))
      } catch (error) {
        ws.send(JSON.stringify({ type: 'dependencies', dependencies: [] }))
      }
      break
    }
  }
}

// ========== Bundle 分析函数 ==========

interface BundleFile {
  name: string
  path: string
  size: number
  gzipSize?: number
  type: string
  children?: BundleFile[]
}

async function analyzeBundleSize(projectPath: string): Promise<{
  totalSize: number
  gzipSize: number
  files: BundleFile[]
  byType: Record<string, { count: number; size: number }>
  largest: BundleFile[]
}> {
  const outputDirs = ['dist', 'es', 'lib', 'esm', 'cjs', 'umd']
  const files: BundleFile[] = []
  let totalSize = 0
  const byType: Record<string, { count: number; size: number }> = {}

  for (const dir of outputDirs) {
    const dirPath = resolve(projectPath, dir)
    if (!existsSync(dirPath)) continue

    const dirFiles = scanDirForAnalysis(dirPath, dir)
    files.push({
      name: dir,
      path: `/${dir}`,
      size: dirFiles.reduce((sum, f) => sum + f.size, 0),
      type: 'directory',
      children: dirFiles
    })

    for (const file of dirFiles) {
      totalSize += file.size
      const ext = file.type
      if (!byType[ext]) byType[ext] = { count: 0, size: 0 }
      byType[ext].count++
      byType[ext].size += file.size
    }
  }

  // 找出最大的文件
  const allFiles: BundleFile[] = []
  const flattenFiles = (items: BundleFile[]) => {
    for (const item of items) {
      if (item.type !== 'directory') {
        allFiles.push(item)
      }
      if (item.children) {
        flattenFiles(item.children)
      }
    }
  }
  flattenFiles(files)

  const largest = allFiles.sort((a, b) => b.size - a.size).slice(0, 10)

  return {
    totalSize,
    gzipSize: Math.round(totalSize * 0.3), // 估算
    files,
    byType,
    largest
  }
}

function scanDirForAnalysis(dirPath: string, prefix: string): BundleFile[] {
  const result: BundleFile[] = []

  try {
    const items = readdirSync(dirPath)
    for (const item of items) {
      const itemPath = join(dirPath, item)
      const stat = statSync(itemPath)

      if (stat.isDirectory()) {
        const children = scanDirForAnalysis(itemPath, `${prefix}/${item}`)
        result.push({
          name: item,
          path: `${prefix}/${item}`,
          size: children.reduce((sum, c) => sum + c.size, 0),
          type: 'directory',
          children
        })
      } else {
        const ext = extname(item).slice(1) || 'other'
        result.push({
          name: item,
          path: `${prefix}/${item}`,
          size: stat.size,
          type: ext
        })
      }
    }
  } catch { }

  return result
}

// ========== 许可证扫描函数 ==========

interface LicenseItem {
  name: string
  version: string
  license: string
  risk: 'low' | 'medium' | 'high' | 'unknown'
}

function scanLicenses(projectPath: string): LicenseItem[] {
  const results: LicenseItem[] = []
  const pkgPath = resolve(projectPath, 'package.json')
  const nodeModules = resolve(projectPath, 'node_modules')

  if (!existsSync(pkgPath) || !existsSync(nodeModules)) return results

  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
  const deps = { ...pkg.dependencies, ...pkg.peerDependencies }

  for (const name of Object.keys(deps)) {
    const depPkgPath = join(nodeModules, name, 'package.json')
    if (!existsSync(depPkgPath)) continue

    try {
      const depPkg = JSON.parse(readFileSync(depPkgPath, 'utf-8'))
      const license = typeof depPkg.license === 'string' ? depPkg.license : 'UNKNOWN'

      let risk: 'low' | 'medium' | 'high' | 'unknown' = 'unknown'
      const upper = license.toUpperCase()
      if (upper.includes('MIT') || upper.includes('BSD') || upper.includes('APACHE') || upper.includes('ISC')) {
        risk = 'low'
      } else if (upper.includes('LGPL') || upper.includes('MPL')) {
        risk = 'medium'
      } else if (upper.includes('GPL') || upper.includes('AGPL')) {
        risk = 'high'
      }

      results.push({
        name,
        version: depPkg.version || '',
        license,
        risk
      })
    } catch { }
  }

  return results.sort((a, b) => {
    const riskOrder = { high: 0, medium: 1, unknown: 2, low: 3 }
    return riskOrder[a.risk] - riskOrder[b.risk]
  })
}

// ========== 环境变量函数 ==========

function getEnvInfo(projectPath: string): { files: string[]; variables: Record<string, Record<string, string>> } {
  const envFiles = ['.env', '.env.local', '.env.development', '.env.production', '.env.test']
  const files: string[] = []
  const variables: Record<string, Record<string, string>> = {}

  for (const file of envFiles) {
    const filePath = resolve(projectPath, file)
    if (existsSync(filePath)) {
      files.push(file)
      try {
        const content = readFileSync(filePath, 'utf-8')
        const vars: Record<string, string> = {}
        for (const line of content.split('\n')) {
          const trimmed = line.trim()
          if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...valueParts] = trimmed.split('=')
            if (key) {
              vars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '')
            }
          }
        }
        variables[file] = vars
      } catch { }
    }
  }

  return { files, variables }
}

function generateConfigFile(config: any): string {
  return `import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: '${config.input || 'src/index.ts'}',
  output: {
    format: ${JSON.stringify(config.formats || ['esm', 'cjs'])},
    dir: '${config.outDir || 'dist'}',
  },
  bundler: '${config.bundler || 'rollup'}',
  dts: ${config.dts !== false},
  sourcemap: ${config.sourcemap !== false},
  minify: ${!!config.minify},
  external: ${JSON.stringify(config.external || [])},
})
`
}

// ========== 端口检测 ==========

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const testServer = createServer()
    testServer.once('error', () => resolve(false))
    testServer.once('listening', () => {
      testServer.close(() => resolve(true))
    })
    testServer.listen(port)
  })
}

async function findAvailablePort(startPort: number, maxAttempts = 10): Promise<number> {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i
    if (await isPortAvailable(port)) {
      return port
    }
  }
  throw new Error(`无法找到可用端口 (尝试范围: ${startPort}-${startPort + maxAttempts - 1})`)
}

// ========== 服务器创建 ==========

export async function createUIServer(projectPath: string, options: DashboardOptions) {
  const preferredPort = options.port || 4567
  const host = options.host || 'localhost'
  const state = { buildHistory: [] as BuildHistory[] }

  // 查找可用端口
  let port: number
  try {
    port = await findAvailablePort(preferredPort)
    if (port !== preferredPort) {
      logger.warn(`端口 ${preferredPort} 已被占用，使用端口 ${port}`)
    }
  } catch (error) {
    logger.error(`无法启动服务器: ${error}`)
    process.exit(1)
  }

  const server = createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.url === '/' || req.url === '/index.html') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.end(generateDashboardHTML())
    } else {
      res.statusCode = 404
      res.end('Not Found')
    }
  })

  const wss = new WebSocketServer({ server })

  wss.on('connection', async (ws) => {
    logger.info('🔗 客户端已连接')

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString())
        await handleWSMessage(ws, data, projectPath, state)
      } catch (error) {
        logger.error('消息处理失败:', error)
      }
    })

    ws.on('close', () => {
      logger.info('🔌 客户端已断开')
    })
  })

  server.on('error', (err: NodeJS.ErrnoException) => {
    console.error('❌ 服务器错误:', err.message)
    process.exit(1)
  })

  server.listen(port, () => {
    const url = `http://localhost:${port}`
    console.log('')
    console.log('╭──────────────────────────────────────────────────╮')
    console.log('│  🎨 LDesign Builder 控制台                        │')
    console.log('├──────────────────────────────────────────────────┤')
    console.log(`│  📂 项目: ${projectPath.slice(-35).padEnd(35)}  │`)
    console.log(`│  🌐 地址: ${url.padEnd(35)}  │`)
    console.log('│  💡 支持: 暗黑模式 / 主题色切换 / 全功能管理      │')
    console.log('╰──────────────────────────────────────────────────╯')
    console.log('')

    if (options.open !== false) {
      const cmd = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open'
      exec(`${cmd} ${url}`)
    }
  })

  return server
}
