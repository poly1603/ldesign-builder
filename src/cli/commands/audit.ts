/**
 * 安全审计命令
 * 
 * 检查项目依赖的安全漏洞
 */

import { Command } from 'commander'
import { execSync } from 'child_process'
import { resolve } from 'path'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { logger } from '../../utils/logger'

// ========== 类型定义 ==========

interface Vulnerability {
  name: string
  severity: 'info' | 'low' | 'moderate' | 'high' | 'critical'
  title: string
  url?: string
  range: string
  fixAvailable: boolean
}

interface AuditResult {
  vulnerabilities: number
  info: number
  low: number
  moderate: number
  high: number
  critical: number
  details: Vulnerability[]
}

// ========== 工具函数 ==========

function runNpmAudit(projectPath: string, production: boolean): any {
  try {
    const args = production ? '--production' : ''
    const output = execSync(`npm audit --json ${args}`, {
      cwd: projectPath,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    })
    return JSON.parse(output)
  } catch (error: any) {
    // npm audit 在发现漏洞时返回非零退出码
    if (error.stdout) {
      try {
        return JSON.parse(error.stdout)
      } catch {}
    }
    return null
  }
}

function parseAuditResult(raw: any): AuditResult {
  const result: AuditResult = {
    vulnerabilities: 0,
    info: 0,
    low: 0,
    moderate: 0,
    high: 0,
    critical: 0,
    details: []
  }

  if (!raw) return result

  // npm 7+ 格式
  if (raw.metadata) {
    const meta = raw.metadata.vulnerabilities
    result.info = meta.info || 0
    result.low = meta.low || 0
    result.moderate = meta.moderate || 0
    result.high = meta.high || 0
    result.critical = meta.critical || 0
    result.vulnerabilities = meta.total || 0
  }

  // 解析漏洞详情
  if (raw.vulnerabilities) {
    for (const [name, vuln] of Object.entries(raw.vulnerabilities)) {
      const v = vuln as any
      result.details.push({
        name,
        severity: v.severity,
        title: v.name,
        url: v.url,
        range: v.range,
        fixAvailable: v.fixAvailable !== false
      })
    }
  }

  // npm 6 格式
  if (raw.advisories) {
    for (const advisory of Object.values(raw.advisories) as any[]) {
      result.details.push({
        name: advisory.module_name,
        severity: advisory.severity,
        title: advisory.title,
        url: advisory.url,
        range: advisory.vulnerable_versions,
        fixAvailable: advisory.patched_versions !== '<0.0.0'
      })
      
      switch (advisory.severity) {
        case 'info': result.info++; break
        case 'low': result.low++; break
        case 'moderate': result.moderate++; break
        case 'high': result.high++; break
        case 'critical': result.critical++; break
      }
    }
    result.vulnerabilities = result.details.length
  }

  return result
}

// ========== 命令定义 ==========

export const auditCommand = new Command('audit')
  .description('安全漏洞检查')
  .option('--production', '仅检查生产依赖')
  .option('--json', '输出 JSON 格式')
  .option('--fix', '尝试自动修复')
  .option('--ci', 'CI 模式 - 发现高危漏洞时退出码为 1')
  .action((options) => {
    const projectPath = process.cwd()
    
    console.log('')
    console.log('🔒 安全漏洞检查')
    console.log('─'.repeat(60))
    console.log('')

    // 运行 npm audit
    const raw = runNpmAudit(projectPath, !!options.production)
    
    if (!raw) {
      logger.error('无法执行安全检查，请确保已安装 node_modules')
      process.exit(1)
    }

    const result = parseAuditResult(raw)

    // JSON 输出
    if (options.json) {
      console.log(JSON.stringify(result, null, 2))
      return
    }

    // 统计
    if (result.vulnerabilities === 0) {
      console.log('✅ 未发现安全漏洞')
      console.log('')
      return
    }

    console.log('📊 漏洞统计:')
    console.log(`   💀 严重 (Critical): ${result.critical}`)
    console.log(`   🔴 高危 (High):     ${result.high}`)
    console.log(`   🟠 中危 (Moderate): ${result.moderate}`)
    console.log(`   🟡 低危 (Low):      ${result.low}`)
    console.log(`   ℹ️  信息 (Info):     ${result.info}`)
    console.log('')
    console.log(`   总计: ${result.vulnerabilities} 个漏洞`)
    console.log('')

    // 详情
    if (result.details.length > 0) {
      console.log('📋 漏洞详情:')
      console.log('─'.repeat(60))
      
      // 按严重程度排序
      const severityOrder = { critical: 0, high: 1, moderate: 2, low: 3, info: 4 }
      const sorted = result.details.sort((a, b) => 
        severityOrder[a.severity] - severityOrder[b.severity]
      )

      for (const vuln of sorted.slice(0, 20)) {
        const icon = vuln.severity === 'critical' ? '💀' :
                     vuln.severity === 'high' ? '🔴' :
                     vuln.severity === 'moderate' ? '🟠' :
                     vuln.severity === 'low' ? '🟡' : 'ℹ️'
        
        console.log(`\n${icon} ${vuln.name} (${vuln.severity})`)
        console.log(`   ${vuln.title}`)
        console.log(`   影响版本: ${vuln.range}`)
        console.log(`   可修复: ${vuln.fixAvailable ? '✅ 是' : '❌ 否'}`)
        if (vuln.url) {
          console.log(`   详情: ${vuln.url}`)
        }
      }

      if (result.details.length > 20) {
        console.log(`\n   ... 还有 ${result.details.length - 20} 个漏洞`)
      }
      
      console.log('')
    }

    // 修复建议
    if (options.fix) {
      console.log('🔧 尝试自动修复...')
      try {
        execSync('npm audit fix', { cwd: projectPath, stdio: 'inherit' })
        logger.success('修复完成')
      } catch {
        logger.warn('部分漏洞无法自动修复，可能需要手动升级依赖')
      }
    } else {
      console.log('💡 运行 `ldesign-builder audit --fix` 尝试自动修复')
      console.log('   或运行 `npm audit fix --force` 强制修复（可能破坏兼容性）')
    }
    console.log('')

    // CI 模式
    if (options.ci && (result.critical > 0 || result.high > 0)) {
      process.exit(1)
    }
  })

export const auditReportCommand = new Command('audit:report')
  .description('生成安全报告')
  .option('-o, --output <file>', '输出文件', 'security-report.md')
  .action((options) => {
    const projectPath = process.cwd()
    const raw = runNpmAudit(projectPath, false)
    const result = parseAuditResult(raw)

    let report = '# 安全审计报告\n\n'
    report += `生成时间: ${new Date().toLocaleString()}\n\n`
    
    report += '## 概览\n\n'
    report += `- 总漏洞数: ${result.vulnerabilities}\n`
    report += `- 严重: ${result.critical}\n`
    report += `- 高危: ${result.high}\n`
    report += `- 中危: ${result.moderate}\n`
    report += `- 低危: ${result.low}\n`
    report += `- 信息: ${result.info}\n\n`

    if (result.details.length > 0) {
      report += '## 漏洞详情\n\n'
      
      for (const vuln of result.details) {
        report += `### ${vuln.name} (${vuln.severity})\n\n`
        report += `- **标题**: ${vuln.title}\n`
        report += `- **影响版本**: ${vuln.range}\n`
        report += `- **可修复**: ${vuln.fixAvailable ? '是' : '否'}\n`
        if (vuln.url) {
          report += `- **详情**: ${vuln.url}\n`
        }
        report += '\n'
      }
    }

    report += '## 建议\n\n'
    if (result.critical > 0 || result.high > 0) {
      report += '⚠️ **请立即处理严重和高危漏洞！**\n\n'
    }
    report += '1. 运行 `npm audit fix` 尝试自动修复\n'
    report += '2. 对于无法自动修复的，考虑手动升级或替换依赖\n'
    report += '3. 使用 `npm audit fix --force` 可强制修复，但可能破坏兼容性\n'

    writeFileSync(resolve(projectPath, options.output), report)
    logger.success(`报告已生成: ${options.output}`)
  })

/**
 * 注册安全审计命令
 */
export function registerAuditCommands(program: Command): void {
  program.addCommand(auditCommand)
  program.addCommand(auditReportCommand)
}
