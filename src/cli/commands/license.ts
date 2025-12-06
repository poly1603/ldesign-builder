/**
 * 依赖许可证检查器
 * 
 * 检查项目依赖的许可证合规性
 */

import { Command } from 'commander'
import { resolve, join } from 'path'
import { existsSync, readFileSync, readdirSync } from 'fs'
import { logger } from '../../utils/logger'

// ========== 类型定义 ==========

interface LicenseOptions {
  production?: boolean
  dev?: boolean
  output?: string
  allow?: string
  deny?: string
  format?: 'table' | 'json' | 'csv'
}

interface LicenseInfo {
  name: string
  version: string
  license: string
  licenseFile?: string
  repository?: string
  author?: string
  type: 'production' | 'development'
  risk: 'low' | 'medium' | 'high' | 'unknown'
}

// ========== 许可证分类 ==========

const LICENSE_CATEGORIES = {
  // 低风险 - 宽松许可证
  low: [
    'MIT', 'ISC', 'BSD-2-Clause', 'BSD-3-Clause', 'Apache-2.0', 
    'Unlicense', '0BSD', 'CC0-1.0', 'WTFPL', 'Zlib', 'BlueOak-1.0.0'
  ],
  // 中风险 - 需要注意
  medium: [
    'LGPL-2.0', 'LGPL-2.1', 'LGPL-3.0', 'MPL-2.0', 'EPL-1.0', 'EPL-2.0',
    'CC-BY-3.0', 'CC-BY-4.0', 'OSL-3.0'
  ],
  // 高风险 - 传染性许可证
  high: [
    'GPL-2.0', 'GPL-3.0', 'AGPL-3.0', 'CC-BY-NC-4.0', 'CC-BY-NC-SA-4.0',
    'SSPL-1.0', 'BSL-1.0'
  ]
}

// ========== 工具函数 ==========

function getLicenseRisk(license: string): 'low' | 'medium' | 'high' | 'unknown' {
  const normalized = license.toUpperCase().replace(/\s+/g, '-')
  
  for (const [risk, licenses] of Object.entries(LICENSE_CATEGORIES)) {
    if (licenses.some(l => normalized.includes(l.toUpperCase()))) {
      return risk as 'low' | 'medium' | 'high'
    }
  }
  
  // 特殊处理
  if (normalized.includes('MIT')) return 'low'
  if (normalized.includes('BSD')) return 'low'
  if (normalized.includes('APACHE')) return 'low'
  if (normalized.includes('GPL')) return 'high'
  if (normalized.includes('LGPL')) return 'medium'
  
  return 'unknown'
}

function findLicenseFile(pkgPath: string): string | undefined {
  const licenseFiles = ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'license', 'LICENCE', 'COPYING']
  
  for (const file of licenseFiles) {
    const filePath = join(pkgPath, file)
    if (existsSync(filePath)) {
      return filePath
    }
  }
  
  return undefined
}

function extractLicenseFromPackage(pkgJson: any): string {
  if (typeof pkgJson.license === 'string') {
    return pkgJson.license
  }
  
  if (pkgJson.license && pkgJson.license.type) {
    return pkgJson.license.type
  }
  
  if (Array.isArray(pkgJson.licenses)) {
    return pkgJson.licenses.map((l: any) => l.type || l).join(' OR ')
  }
  
  return 'UNKNOWN'
}

// ========== 扫描依赖 ==========

function scanDependencies(projectPath: string, options: LicenseOptions): LicenseInfo[] {
  const results: LicenseInfo[] = []
  const pkgPath = resolve(projectPath, 'package.json')
  
  if (!existsSync(pkgPath)) {
    logger.error('未找到 package.json')
    return results
  }
  
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
  const nodeModules = resolve(projectPath, 'node_modules')
  
  if (!existsSync(nodeModules)) {
    logger.error('未找到 node_modules，请先运行 npm install')
    return results
  }
  
  const depsToScan: Array<{ name: string; type: 'production' | 'development' }> = []
  
  // 收集生产依赖
  if (options.production !== false) {
    for (const name of Object.keys(pkg.dependencies || {})) {
      depsToScan.push({ name, type: 'production' })
    }
    for (const name of Object.keys(pkg.peerDependencies || {})) {
      depsToScan.push({ name, type: 'production' })
    }
  }
  
  // 收集开发依赖
  if (options.dev) {
    for (const name of Object.keys(pkg.devDependencies || {})) {
      depsToScan.push({ name, type: 'development' })
    }
  }
  
  // 扫描每个依赖
  for (const { name, type } of depsToScan) {
    const depPath = resolve(nodeModules, name)
    const depPkgPath = join(depPath, 'package.json')
    
    if (!existsSync(depPkgPath)) {
      // 处理 scoped 包
      if (name.startsWith('@')) {
        const [scope, pkgName] = name.split('/')
        const scopedPath = resolve(nodeModules, scope, pkgName, 'package.json')
        if (existsSync(scopedPath)) {
          const depPkg = JSON.parse(readFileSync(scopedPath, 'utf-8'))
          const license = extractLicenseFromPackage(depPkg)
          results.push({
            name,
            version: depPkg.version || 'unknown',
            license,
            licenseFile: findLicenseFile(resolve(nodeModules, scope, pkgName)),
            repository: depPkg.repository?.url || depPkg.homepage,
            author: typeof depPkg.author === 'string' ? depPkg.author : depPkg.author?.name,
            type,
            risk: getLicenseRisk(license)
          })
        }
      }
      continue
    }
    
    const depPkg = JSON.parse(readFileSync(depPkgPath, 'utf-8'))
    const license = extractLicenseFromPackage(depPkg)
    
    results.push({
      name,
      version: depPkg.version || 'unknown',
      license,
      licenseFile: findLicenseFile(depPath),
      repository: depPkg.repository?.url || depPkg.homepage,
      author: typeof depPkg.author === 'string' ? depPkg.author : depPkg.author?.name,
      type,
      risk: getLicenseRisk(license)
    })
  }
  
  return results
}

// ========== 输出格式化 ==========

function formatTable(licenses: LicenseInfo[]): void {
  const riskColors: Record<string, string> = {
    low: '\x1b[32m',    // 绿色
    medium: '\x1b[33m', // 黄色
    high: '\x1b[31m',   // 红色
    unknown: '\x1b[90m' // 灰色
  }
  const reset = '\x1b[0m'

  console.log('')
  console.log('📋 依赖许可证报告')
  console.log('─'.repeat(80))
  console.log(
    '包名'.padEnd(35) + 
    '版本'.padEnd(12) + 
    '许可证'.padEnd(20) + 
    '风险'.padEnd(10)
  )
  console.log('─'.repeat(80))

  for (const lic of licenses) {
    const risk = `${riskColors[lic.risk]}${lic.risk.toUpperCase()}${reset}`
    console.log(
      lic.name.slice(0, 34).padEnd(35) + 
      lic.version.slice(0, 11).padEnd(12) + 
      lic.license.slice(0, 19).padEnd(20) + 
      risk
    )
  }

  console.log('─'.repeat(80))
}

function formatJson(licenses: LicenseInfo[]): string {
  return JSON.stringify(licenses, null, 2)
}

function formatCsv(licenses: LicenseInfo[]): string {
  const headers = ['name', 'version', 'license', 'type', 'risk', 'repository']
  const rows = licenses.map(l => [
    l.name,
    l.version,
    l.license,
    l.type,
    l.risk,
    l.repository || ''
  ])
  
  return [
    headers.join(','),
    ...rows.map(r => r.map(v => `"${v}"`).join(','))
  ].join('\n')
}

// ========== 执行检查 ==========

async function runLicenseCheck(projectPath: string, options: LicenseOptions): Promise<void> {
  console.log('')
  console.log('🔍 扫描依赖许可证...')
  
  const licenses = scanDependencies(projectPath, options)
  
  if (licenses.length === 0) {
    console.log('未找到依赖')
    return
  }

  // 过滤
  let filtered = licenses
  
  if (options.allow) {
    const allowed = options.allow.split(',').map(l => l.trim().toUpperCase())
    filtered = filtered.filter(l => allowed.some(a => l.license.toUpperCase().includes(a)))
  }
  
  if (options.deny) {
    const denied = options.deny.split(',').map(l => l.trim().toUpperCase())
    filtered = filtered.filter(l => !denied.some(d => l.license.toUpperCase().includes(d)))
  }

  // 排序
  filtered.sort((a, b) => {
    const riskOrder = { high: 0, medium: 1, unknown: 2, low: 3 }
    return riskOrder[a.risk] - riskOrder[b.risk]
  })

  // 输出
  switch (options.format) {
    case 'json':
      console.log(formatJson(filtered))
      break
    case 'csv':
      console.log(formatCsv(filtered))
      break
    default:
      formatTable(filtered)
  }

  // 统计
  const stats = {
    total: filtered.length,
    low: filtered.filter(l => l.risk === 'low').length,
    medium: filtered.filter(l => l.risk === 'medium').length,
    high: filtered.filter(l => l.risk === 'high').length,
    unknown: filtered.filter(l => l.risk === 'unknown').length
  }

  console.log('')
  console.log('📊 统计:')
  console.log(`   总计: ${stats.total} 个依赖`)
  console.log(`   🟢 低风险: ${stats.low}`)
  console.log(`   🟡 中风险: ${stats.medium}`)
  console.log(`   🔴 高风险: ${stats.high}`)
  console.log(`   ⚪ 未知: ${stats.unknown}`)

  // 风险警告
  if (stats.high > 0) {
    console.log('')
    logger.warn(`⚠️  发现 ${stats.high} 个高风险许可证，可能有传染性条款！`)
    const highRisk = filtered.filter(l => l.risk === 'high')
    for (const l of highRisk) {
      console.log(`   - ${l.name}: ${l.license}`)
    }
  }

  // 输出到文件
  if (options.output) {
    const { writeFileSync } = await import('fs')
    const output = options.format === 'json' 
      ? formatJson(filtered) 
      : options.format === 'csv' 
        ? formatCsv(filtered)
        : formatJson(filtered)
    
    writeFileSync(resolve(projectPath, options.output), output)
    logger.success(`报告已保存到: ${options.output}`)
  }

  console.log('')
}

// ========== 命令定义 ==========

export const licenseCommand = new Command('license')
  .description('检查依赖许可证')
  .option('--production', '仅检查生产依赖 (默认)')
  .option('--dev', '同时检查开发依赖')
  .option('-o, --output <file>', '输出报告到文件')
  .option('--allow <licenses>', '仅显示指定许可证 (逗号分隔)')
  .option('--deny <licenses>', '排除指定许可证 (逗号分隔)')
  .option('-f, --format <format>', '输出格式 (table|json|csv)', 'table')
  .action(async (options: LicenseOptions) => {
    try {
      await runLicenseCheck(process.cwd(), options)
    } catch (error) {
      logger.error('检查失败:', error)
      process.exit(1)
    }
  })

export function registerLicenseCommand(program: Command): void {
  program.addCommand(licenseCommand)
}
