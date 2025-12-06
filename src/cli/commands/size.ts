/**
 * Bundle 体积检查命令
 * 
 * 检查构建产物体积是否超过限制
 */

import { Command } from 'commander'
import { resolve, join, extname } from 'path'
import { existsSync, readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from 'fs'
import { logger } from '../../utils/logger'

// ========== 类型定义 ==========

interface SizeLimit {
  path: string
  limit: number
  gzip?: boolean
}

interface SizeConfig {
  limits: SizeLimit[]
  totalLimit?: number
}

interface SizeResult {
  path: string
  size: number
  limit: number
  passed: boolean
  percent: number
}

// ========== 工具函数 ==========

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(2) + ' MB'
}

function parseSize(size: string): number {
  const match = size.match(/^([\d.]+)\s*(B|KB|MB|GB)?$/i)
  if (!match) return 0
  
  const value = parseFloat(match[1])
  const unit = (match[2] || 'B').toUpperCase()
  
  const multipliers: Record<string, number> = {
    'B': 1,
    'KB': 1024,
    'MB': 1024 * 1024,
    'GB': 1024 * 1024 * 1024
  }
  
  return value * (multipliers[unit] || 1)
}

function getFileSize(filePath: string): number {
  if (!existsSync(filePath)) return 0
  
  const stat = statSync(filePath)
  if (stat.isFile()) return stat.size
  
  // 目录：计算总大小
  let total = 0
  const scanDir = (dir: string) => {
    const items = readdirSync(dir)
    for (const item of items) {
      const itemPath = join(dir, item)
      const itemStat = statSync(itemPath)
      if (itemStat.isDirectory()) {
        scanDir(itemPath)
      } else {
        total += itemStat.size
      }
    }
  }
  scanDir(filePath)
  return total
}

function getFileSizes(projectPath: string, pattern: string): Array<{ path: string; size: number }> {
  const results: Array<{ path: string; size: number }> = []
  
  // 简单的 glob 处理
  if (pattern.includes('*')) {
    const parts = pattern.split('*')
    const dir = resolve(projectPath, parts[0].replace(/\/+$/, '') || '.')
    const ext = parts[1] || ''
    
    if (existsSync(dir) && statSync(dir).isDirectory()) {
      const scanDir = (dirPath: string) => {
        const items = readdirSync(dirPath)
        for (const item of items) {
          const itemPath = join(dirPath, item)
          const stat = statSync(itemPath)
          if (stat.isDirectory()) {
            scanDir(itemPath)
          } else if (!ext || item.endsWith(ext)) {
            const relativePath = itemPath.replace(projectPath + '/', '')
            results.push({ path: relativePath, size: stat.size })
          }
        }
      }
      scanDir(dir)
    }
  } else {
    const fullPath = resolve(projectPath, pattern)
    if (existsSync(fullPath)) {
      results.push({ path: pattern, size: getFileSize(fullPath) })
    }
  }
  
  return results
}

function loadSizeConfig(projectPath: string): SizeConfig {
  // 尝试从多个位置加载配置
  const configPaths = [
    resolve(projectPath, '.ldesign', 'size-limit.json'),
    resolve(projectPath, 'size-limit.json'),
    resolve(projectPath, '.size-limit.json')
  ]
  
  for (const configPath of configPaths) {
    if (existsSync(configPath)) {
      try {
        return JSON.parse(readFileSync(configPath, 'utf-8'))
      } catch {}
    }
  }
  
  // 从 package.json 读取
  const pkgPath = resolve(projectPath, 'package.json')
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
      if (pkg['size-limit']) {
        return { limits: pkg['size-limit'] }
      }
    } catch {}
  }
  
  // 默认配置
  return {
    limits: [
      { path: 'dist/*.js', limit: 100 * 1024 },
      { path: 'dist/*.css', limit: 50 * 1024 }
    ],
    totalLimit: 500 * 1024
  }
}

function saveSizeConfig(projectPath: string, config: SizeConfig): void {
  const configDir = resolve(projectPath, '.ldesign')
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true })
  }
  
  const configPath = resolve(configDir, 'size-limit.json')
  writeFileSync(configPath, JSON.stringify(config, null, 2))
}

// ========== 命令定义 ==========

export const sizeCommand = new Command('size')
  .description('检查 Bundle 体积')
  .option('--json', '输出 JSON 格式')
  .option('--ci', 'CI 模式 - 超限时退出码为 1')
  .option('-l, --limit <size>', '总体积限制 (如: 500KB)')
  .action((options) => {
    const projectPath = process.cwd()
    const config = loadSizeConfig(projectPath)
    
    console.log('')
    console.log('📦 检查 Bundle 体积')
    console.log('─'.repeat(60))

    const results: SizeResult[] = []
    let totalSize = 0
    let hasFailure = false

    for (const limitConfig of config.limits) {
      const files = getFileSizes(projectPath, limitConfig.path)
      
      for (const file of files) {
        totalSize += file.size
        const passed = file.size <= limitConfig.limit
        const percent = Math.round((file.size / limitConfig.limit) * 100)
        
        if (!passed) hasFailure = true
        
        results.push({
          path: file.path,
          size: file.size,
          limit: limitConfig.limit,
          passed,
          percent
        })
      }
    }

    // JSON 输出
    if (options.json) {
      console.log(JSON.stringify({ results, totalSize, hasFailure }, null, 2))
      if (options.ci && hasFailure) process.exit(1)
      return
    }

    // 表格输出
    console.log('')
    console.log(
      '文件'.padEnd(40) +
      '大小'.padEnd(12) +
      '限制'.padEnd(12) +
      '状态'
    )
    console.log('─'.repeat(60))

    for (const result of results) {
      const icon = result.passed ? '✅' : '❌'
      const bar = result.percent <= 100 
        ? '█'.repeat(Math.min(10, Math.round(result.percent / 10))) + '░'.repeat(10 - Math.min(10, Math.round(result.percent / 10)))
        : '█'.repeat(10) + '⚠️'
      
      console.log(
        result.path.slice(0, 39).padEnd(40) +
        formatSize(result.size).padEnd(12) +
        formatSize(result.limit).padEnd(12) +
        `${icon} ${bar} ${result.percent}%`
      )
    }

    console.log('─'.repeat(60))
    console.log('')

    // 总体积
    const totalLimit = options.limit ? parseSize(options.limit) : config.totalLimit
    if (totalLimit) {
      const totalPercent = Math.round((totalSize / totalLimit) * 100)
      const totalPassed = totalSize <= totalLimit
      const totalIcon = totalPassed ? '✅' : '❌'
      
      if (!totalPassed) hasFailure = true
      
      console.log(`总体积: ${formatSize(totalSize)} / ${formatSize(totalLimit)} ${totalIcon} (${totalPercent}%)`)
    } else {
      console.log(`总体积: ${formatSize(totalSize)}`)
    }

    console.log('')

    if (hasFailure) {
      logger.warn('⚠️  部分文件超出体积限制!')
      if (options.ci) process.exit(1)
    } else {
      logger.success('✅ 所有文件都在限制范围内')
    }
    console.log('')
  })

export const sizeInitCommand = new Command('size:init')
  .description('初始化体积限制配置')
  .action(() => {
    const projectPath = process.cwd()
    
    const config: SizeConfig = {
      limits: [
        { path: 'dist/*.js', limit: 100 * 1024 },
        { path: 'dist/*.mjs', limit: 100 * 1024 },
        { path: 'dist/*.cjs', limit: 100 * 1024 },
        { path: 'dist/*.css', limit: 50 * 1024 }
      ],
      totalLimit: 500 * 1024
    }
    
    saveSizeConfig(projectPath, config)
    logger.success('体积限制配置已创建: .ldesign/size-limit.json')
    
    console.log('')
    console.log('配置说明:')
    console.log('  limits: 各文件/目录的体积限制')
    console.log('  totalLimit: 总体积限制')
    console.log('  支持通配符，如 dist/*.js')
    console.log('')
  })

export const sizeSetCommand = new Command('size:set')
  .description('设置体积限制')
  .argument('<path>', '文件或目录路径')
  .argument('<limit>', '体积限制 (如: 100KB)')
  .action((path: string, limit: string) => {
    const projectPath = process.cwd()
    const config = loadSizeConfig(projectPath)
    
    const limitBytes = parseSize(limit)
    if (limitBytes <= 0) {
      logger.error('无效的体积限制')
      process.exit(1)
    }
    
    // 查找或添加
    const existing = config.limits.find(l => l.path === path)
    if (existing) {
      existing.limit = limitBytes
    } else {
      config.limits.push({ path, limit: limitBytes })
    }
    
    saveSizeConfig(projectPath, config)
    logger.success(`已设置 ${path} 的体积限制为 ${formatSize(limitBytes)}`)
  })

/**
 * 注册体积检查命令
 */
export function registerSizeCommands(program: Command): void {
  program.addCommand(sizeCommand)
  program.addCommand(sizeInitCommand)
  program.addCommand(sizeSetCommand)
}
