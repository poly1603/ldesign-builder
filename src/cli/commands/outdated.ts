/**
 * 依赖更新检查命令
 * 
 * 检查项目依赖是否有更新版本
 */

import { Command } from 'commander'
import { resolve } from 'path'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'
import { logger } from '../../utils/logger'

// ========== 类型定义 ==========

interface PackageInfo {
  current: string
  wanted: string
  latest: string
  type: 'dependencies' | 'devDependencies' | 'peerDependencies'
  homepage?: string
}

interface OutdatedResult {
  [packageName: string]: PackageInfo
}

// ========== 工具函数 ==========

function getOutdatedPackages(projectPath: string, includeDevDeps: boolean): OutdatedResult {
  try {
    const args = includeDevDeps ? '' : '--production'
    const output = execSync(`npm outdated --json ${args}`, {
      cwd: projectPath,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    })
    return JSON.parse(output || '{}')
  } catch (error: any) {
    // npm outdated 在有过期包时返回非零退出码
    if (error.stdout) {
      try {
        return JSON.parse(error.stdout)
      } catch {
        return {}
      }
    }
    return {}
  }
}

function getSemverDiff(current: string, latest: string): 'major' | 'minor' | 'patch' | 'none' {
  const currentParts = current.replace(/[^0-9.]/g, '').split('.').map(Number)
  const latestParts = latest.replace(/[^0-9.]/g, '').split('.').map(Number)
  
  if (latestParts[0] > currentParts[0]) return 'major'
  if (latestParts[1] > currentParts[1]) return 'minor'
  if (latestParts[2] > currentParts[2]) return 'patch'
  return 'none'
}

function formatVersion(current: string, latest: string): string {
  const diff = getSemverDiff(current, latest)
  const colors: Record<string, string> = {
    major: '\x1b[31m', // 红色
    minor: '\x1b[33m', // 黄色
    patch: '\x1b[32m', // 绿色
    none: '\x1b[0m'
  }
  const reset = '\x1b[0m'
  return `${current} → ${colors[diff]}${latest}${reset}`
}

// ========== 命令定义 ==========

export const outdatedCommand = new Command('outdated')
  .description('检查依赖更新')
  .option('--dev', '包含开发依赖')
  .option('--json', '输出 JSON 格式')
  .option('--major', '仅显示主版本更新')
  .option('--minor', '仅显示次版本更新')
  .option('--patch', '仅显示补丁更新')
  .action((options) => {
    const projectPath = process.cwd()
    
    console.log('')
    console.log('🔍 检查依赖更新...')
    console.log('')

    const outdated = getOutdatedPackages(projectPath, options.dev)
    const packages = Object.entries(outdated)

    if (packages.length === 0) {
      console.log('✅ 所有依赖都是最新版本')
      console.log('')
      return
    }

    // 过滤
    let filtered = packages
    if (options.major) {
      filtered = packages.filter(([, info]) => getSemverDiff(info.current, info.latest) === 'major')
    } else if (options.minor) {
      filtered = packages.filter(([, info]) => getSemverDiff(info.current, info.latest) === 'minor')
    } else if (options.patch) {
      filtered = packages.filter(([, info]) => getSemverDiff(info.current, info.latest) === 'patch')
    }

    if (filtered.length === 0) {
      console.log('✅ 没有符合条件的更新')
      console.log('')
      return
    }

    // JSON 输出
    if (options.json) {
      console.log(JSON.stringify(Object.fromEntries(filtered), null, 2))
      return
    }

    // 分组统计
    const byDiff = {
      major: filtered.filter(([, info]) => getSemverDiff(info.current, info.latest) === 'major'),
      minor: filtered.filter(([, info]) => getSemverDiff(info.current, info.latest) === 'minor'),
      patch: filtered.filter(([, info]) => getSemverDiff(info.current, info.latest) === 'patch')
    }

    // 显示结果
    console.log('─'.repeat(70))
    console.log(
      '包名'.padEnd(35) +
      '当前版本'.padEnd(12) +
      '最新版本'.padEnd(12) +
      '类型'
    )
    console.log('─'.repeat(70))

    for (const [name, info] of filtered) {
      const diff = getSemverDiff(info.current, info.latest)
      const diffIcon = diff === 'major' ? '🔴' : diff === 'minor' ? '🟡' : '🟢'
      
      console.log(
        name.slice(0, 34).padEnd(35) +
        info.current.padEnd(12) +
        info.latest.padEnd(12) +
        `${diffIcon} ${diff}`
      )
    }

    console.log('─'.repeat(70))
    console.log('')
    console.log('📊 统计:')
    console.log(`   🔴 主版本更新: ${byDiff.major.length}`)
    console.log(`   🟡 次版本更新: ${byDiff.minor.length}`)
    console.log(`   🟢 补丁更新: ${byDiff.patch.length}`)
    console.log('')

    if (byDiff.major.length > 0) {
      console.log('⚠️  主版本更新可能包含破坏性变更，请查阅更新日志')
    }
    console.log('')
  })

export const updateCommand = new Command('upgrade')
  .description('更新依赖到最新版本')
  .option('--dev', '包含开发依赖')
  .option('--major', '更新主版本')
  .option('--minor', '更新次版本 (默认)')
  .option('--patch', '仅更新补丁版本')
  .option('--interactive', '交互式选择')
  .option('-y, --yes', '跳过确认')
  .action(async (options) => {
    const projectPath = process.cwd()
    
    console.log('')
    console.log('🔄 更新依赖...')
    console.log('')

    const outdated = getOutdatedPackages(projectPath, options.dev)
    const packages = Object.entries(outdated)

    if (packages.length === 0) {
      console.log('✅ 所有依赖都是最新版本')
      return
    }

    // 确定更新级别
    let maxLevel: 'major' | 'minor' | 'patch' = 'minor'
    if (options.patch) maxLevel = 'patch'
    if (options.major) maxLevel = 'major'

    // 过滤要更新的包
    const toUpdate = packages.filter(([, info]) => {
      const diff = getSemverDiff(info.current, info.latest)
      if (maxLevel === 'patch') return diff === 'patch'
      if (maxLevel === 'minor') return diff === 'patch' || diff === 'minor'
      return true
    })

    if (toUpdate.length === 0) {
      console.log('✅ 没有可更新的依赖')
      return
    }

    console.log(`将更新 ${toUpdate.length} 个依赖:`)
    for (const [name, info] of toUpdate) {
      console.log(`   ${name}: ${info.current} → ${info.latest}`)
    }
    console.log('')

    // 确认
    if (!options.yes) {
      const readline = await import('readline')
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })
      
      const confirmed = await new Promise<boolean>((resolve) => {
        rl.question('确认更新? [y/N]: ', (answer) => {
          rl.close()
          resolve(answer.toLowerCase() === 'y')
        })
      })
      
      if (!confirmed) {
        console.log('已取消')
        return
      }
    }

    // 更新 package.json
    const pkgPath = resolve(projectPath, 'package.json')
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))

    for (const [name, info] of toUpdate) {
      if (pkg.dependencies?.[name]) {
        pkg.dependencies[name] = `^${info.latest}`
      }
      if (pkg.devDependencies?.[name]) {
        pkg.devDependencies[name] = `^${info.latest}`
      }
      if (pkg.peerDependencies?.[name]) {
        pkg.peerDependencies[name] = `^${info.latest}`
      }
    }

    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
    logger.success('package.json 已更新')

    console.log('')
    console.log('💡 运行 `npm install` 以安装更新')
    console.log('')
  })

/**
 * 注册过期检查命令
 */
export function registerOutdatedCommands(program: Command): void {
  program.addCommand(outdatedCommand)
  program.addCommand(updateCommand)
}
