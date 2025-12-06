/**
 * Git Hooks 集成命令
 * 
 * 管理 Git 钩子，支持构建前检查
 */

import { Command } from 'commander'
import { resolve, join } from 'path'
import { existsSync, readFileSync, writeFileSync, mkdirSync, chmodSync, unlinkSync } from 'fs'
import { execSync } from 'child_process'
import { logger } from '../../utils/logger'

// ========== 类型定义 ==========

interface HooksConfig {
  'pre-commit'?: string[]
  'pre-push'?: string[]
  'commit-msg'?: string[]
  'post-merge'?: string[]
}

// ========== 默认钩子脚本 ==========

const DEFAULT_HOOKS: HooksConfig = {
  'pre-commit': [
    'ldesign-builder typecheck --ci',
    'ldesign-builder circular --fail-on-circular'
  ],
  'pre-push': [
    'ldesign-builder build',
    'ldesign-builder size --ci'
  ]
}

const HOOK_TEMPLATE = `#!/bin/sh
# LDesign Builder Git Hook
# 自动生成，请勿手动编辑

set -e

{{COMMANDS}}
`

// ========== 工具函数 ==========

function getGitDir(projectPath: string): string | null {
  try {
    const gitDir = execSync('git rev-parse --git-dir', {
      cwd: projectPath,
      encoding: 'utf-8'
    }).trim()
    return resolve(projectPath, gitDir)
  } catch {
    return null
  }
}

function getHooksDir(projectPath: string): string | null {
  const gitDir = getGitDir(projectPath)
  if (!gitDir) return null
  return join(gitDir, 'hooks')
}

function loadHooksConfig(projectPath: string): HooksConfig {
  const configPath = resolve(projectPath, '.ldesign', 'hooks.json')
  
  if (existsSync(configPath)) {
    try {
      return JSON.parse(readFileSync(configPath, 'utf-8'))
    } catch {}
  }
  
  // 从 package.json 读取
  const pkgPath = resolve(projectPath, 'package.json')
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
      if (pkg['ldesign-hooks']) {
        return pkg['ldesign-hooks']
      }
    } catch {}
  }
  
  return {}
}

function saveHooksConfig(projectPath: string, config: HooksConfig): void {
  const configDir = resolve(projectPath, '.ldesign')
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true })
  }
  
  const configPath = join(configDir, 'hooks.json')
  writeFileSync(configPath, JSON.stringify(config, null, 2))
}

function generateHookScript(commands: string[]): string {
  const cmdStr = commands.map(cmd => {
    // 处理 Windows 兼容
    return `echo "Running: ${cmd}"\n${cmd}`
  }).join('\n\n')
  
  return HOOK_TEMPLATE.replace('{{COMMANDS}}', cmdStr)
}

function installHook(projectPath: string, hookName: string, commands: string[]): boolean {
  const hooksDir = getHooksDir(projectPath)
  if (!hooksDir) {
    logger.error('未找到 Git 仓库')
    return false
  }
  
  if (!existsSync(hooksDir)) {
    mkdirSync(hooksDir, { recursive: true })
  }
  
  const hookPath = join(hooksDir, hookName)
  const script = generateHookScript(commands)
  
  writeFileSync(hookPath, script)
  
  // Unix 系统需要设置执行权限
  if (process.platform !== 'win32') {
    chmodSync(hookPath, '755')
  }
  
  return true
}

function uninstallHook(projectPath: string, hookName: string): boolean {
  const hooksDir = getHooksDir(projectPath)
  if (!hooksDir) return false
  
  const hookPath = join(hooksDir, hookName)
  
  if (existsSync(hookPath)) {
    // 检查是否是我们的钩子
    const content = readFileSync(hookPath, 'utf-8')
    if (content.includes('LDesign Builder Git Hook')) {
      unlinkSync(hookPath)
      return true
    } else {
      logger.warn(`${hookName} 钩子不是由 LDesign Builder 创建的，跳过`)
      return false
    }
  }
  
  return false
}

// ========== 命令定义 ==========

export const hooksCommand = new Command('hooks')
  .description('Git Hooks 管理')
  .addCommand(
    new Command('install')
      .description('安装 Git 钩子')
      .option('--all', '安装所有默认钩子')
      .option('--pre-commit', '安装 pre-commit 钩子')
      .option('--pre-push', '安装 pre-push 钩子')
      .option('--commit-msg', '安装 commit-msg 钩子')
      .action((options) => {
        const projectPath = process.cwd()
        const gitDir = getGitDir(projectPath)
        
        if (!gitDir) {
          logger.error('未找到 Git 仓库，请先运行 git init')
          process.exit(1)
        }
        
        let config = loadHooksConfig(projectPath)
        
        // 如果没有配置，使用默认配置
        if (Object.keys(config).length === 0) {
          config = { ...DEFAULT_HOOKS }
        }
        
        const hooksToInstall: string[] = []
        
        if (options.all) {
          hooksToInstall.push('pre-commit', 'pre-push', 'commit-msg', 'post-merge')
        } else {
          if (options.preCommit) hooksToInstall.push('pre-commit')
          if (options.prePush) hooksToInstall.push('pre-push')
          if (options.commitMsg) hooksToInstall.push('commit-msg')
        }
        
        // 默认安装 pre-commit 和 pre-push
        if (hooksToInstall.length === 0) {
          hooksToInstall.push('pre-commit', 'pre-push')
        }
        
        console.log('')
        console.log('🪝 安装 Git 钩子')
        console.log('─'.repeat(40))
        
        for (const hook of hooksToInstall) {
          const commands = config[hook as keyof HooksConfig] || DEFAULT_HOOKS[hook as keyof HooksConfig] || []
          
          if (commands.length === 0) {
            console.log(`   ⏭️  ${hook}: 无命令，跳过`)
            continue
          }
          
          if (installHook(projectPath, hook, commands)) {
            console.log(`   ✅ ${hook}: 已安装`)
            console.log(`      ${commands.join('\n      ')}`)
          } else {
            console.log(`   ❌ ${hook}: 安装失败`)
          }
        }
        
        // 保存配置
        saveHooksConfig(projectPath, config)
        
        console.log('')
        logger.success('Git 钩子安装完成')
        console.log('')
      })
  )
  .addCommand(
    new Command('uninstall')
      .description('卸载 Git 钩子')
      .option('--all', '卸载所有钩子')
      .argument('[hooks...]', '要卸载的钩子名称')
      .action((hooks: string[], options) => {
        const projectPath = process.cwd()
        
        const hooksToUninstall = options.all 
          ? ['pre-commit', 'pre-push', 'commit-msg', 'post-merge']
          : hooks.length > 0 ? hooks : ['pre-commit', 'pre-push']
        
        console.log('')
        console.log('🪝 卸载 Git 钩子')
        console.log('─'.repeat(40))
        
        for (const hook of hooksToUninstall) {
          if (uninstallHook(projectPath, hook)) {
            console.log(`   ✅ ${hook}: 已卸载`)
          } else {
            console.log(`   ⏭️  ${hook}: 未安装或非本工具创建`)
          }
        }
        
        console.log('')
      })
  )
  .addCommand(
    new Command('list')
      .description('列出已安装的钩子')
      .action(() => {
        const projectPath = process.cwd()
        const hooksDir = getHooksDir(projectPath)
        const config = loadHooksConfig(projectPath)
        
        console.log('')
        console.log('🪝 Git 钩子配置')
        console.log('─'.repeat(40))
        
        const allHooks = ['pre-commit', 'pre-push', 'commit-msg', 'post-merge']
        
        for (const hook of allHooks) {
          const hookPath = hooksDir ? join(hooksDir, hook) : ''
          const installed = hookPath && existsSync(hookPath)
          const isOurs = installed && readFileSync(hookPath, 'utf-8').includes('LDesign Builder')
          
          const status = !installed ? '❌ 未安装' :
                         isOurs ? '✅ 已安装' : '⚠️ 第三方'
          
          const commands = config[hook as keyof HooksConfig] || []
          
          console.log(`\n${status} ${hook}`)
          if (commands.length > 0) {
            for (const cmd of commands) {
              console.log(`   └─ ${cmd}`)
            }
          }
        }
        
        console.log('')
      })
  )
  .addCommand(
    new Command('add')
      .description('添加钩子命令')
      .argument('<hook>', '钩子名称 (pre-commit/pre-push/commit-msg)')
      .argument('<command>', '要执行的命令')
      .action((hook: string, command: string) => {
        const projectPath = process.cwd()
        const config = loadHooksConfig(projectPath)
        
        if (!config[hook as keyof HooksConfig]) {
          (config as any)[hook] = []
        }
        
        (config as any)[hook].push(command)
        saveHooksConfig(projectPath, config)
        
        logger.success(`已添加命令到 ${hook}`)
        
        // 重新安装钩子
        const commands = (config as any)[hook]
        if (installHook(projectPath, hook, commands)) {
          logger.success(`${hook} 钩子已更新`)
        }
      })
  )
  .addCommand(
    new Command('remove')
      .description('移除钩子命令')
      .argument('<hook>', '钩子名称')
      .argument('<index>', '命令索引 (从 0 开始)')
      .action((hook: string, index: string) => {
        const projectPath = process.cwd()
        const config = loadHooksConfig(projectPath)
        
        const commands = (config as any)[hook] as string[] | undefined
        if (!commands || commands.length === 0) {
          logger.error(`${hook} 没有配置命令`)
          return
        }
        
        const idx = parseInt(index)
        if (idx < 0 || idx >= commands.length) {
          logger.error('索引超出范围')
          return
        }
        
        const removed = commands.splice(idx, 1)
        saveHooksConfig(projectPath, config)
        
        logger.success(`已移除: ${removed[0]}`)
        
        // 重新安装钩子
        if (commands.length > 0) {
          installHook(projectPath, hook, commands)
        } else {
          uninstallHook(projectPath, hook)
        }
      })
  )

/**
 * 注册钩子命令
 */
export function registerHooksCommand(program: Command): void {
  program.addCommand(hooksCommand)
}
