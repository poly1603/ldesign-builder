/**
 * 智能构建诊断系统
 * 
 * 提供自动化的构建问题诊断、性能分析和优化建议
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import type { BuilderConfig } from '../types/config'
import type { BuildResult } from '../types/builder'
import type { PlainObject } from '../types/strict-types'
import { Logger } from './logger'
import chalk from 'chalk'
import path from 'path'
import fs from 'fs-extra'

/**
 * 诊断级别
 */
export enum DiagnosticLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * 诊断类别
 */
export enum DiagnosticCategory {
  PERFORMANCE = 'performance',
  CONFIGURATION = 'configuration',
  DEPENDENCIES = 'dependencies',
  CODE_QUALITY = 'code-quality',
  SECURITY = 'security',
  BEST_PRACTICES = 'best-practices'
}

/**
 * 诊断结果
 */
export interface DiagnosticResult {
  id: string
  level: DiagnosticLevel
  category: DiagnosticCategory
  title: string
  description: string
  impact: 'low' | 'medium' | 'high'
  suggestions: DiagnosticSuggestion[]
  metadata?: PlainObject
}

/**
 * 诊断建议
 */
export interface DiagnosticSuggestion {
  title: string
  description: string
  action?: 'command' | 'config' | 'code' | 'manual'
  command?: string
  config?: string
  codeExample?: string
  estimatedImpact?: string
  priority?: number
}

/**
 * 诊断报告
 */
export interface DiagnosticReport {
  timestamp: number
  duration: number
  summary: {
    total: number
    byLevel: Record<DiagnosticLevel, number>
    byCategory: Record<DiagnosticCategory, number>
  }
  results: DiagnosticResult[]
  recommendations: string[]
  score: number // 0-100
}

/**
 * 智能构建诊断器
 */
export class SmartBuildDiagnostics {
  private logger: Logger
  private config: BuilderConfig
  private buildResult?: BuildResult

  constructor(config: BuilderConfig, logger?: Logger) {
    this.config = config
    this.logger = logger || new Logger({ prefix: 'Diagnostics' })
  }

  /**
   * 运行完整诊断
   */
  async diagnose(buildResult?: BuildResult): Promise<DiagnosticReport> {
    const startTime = Date.now()
    this.buildResult = buildResult

    this.logger.info('开始构建诊断...')

    const results: DiagnosticResult[] = []

    // 1. 配置诊断
    results.push(...await this.diagnoseConfiguration())

    // 2. 性能诊断
    if (buildResult) {
      results.push(...await this.diagnosePerformance(buildResult))
    }

    // 3. 依赖诊断
    results.push(...await this.diagnoseDependencies())

    // 4. 代码质量诊断
    results.push(...await this.diagnoseCodeQuality())

    // 5. 安全诊断
    results.push(...await this.diagnoseSecurity())

    // 6. 最佳实践诊断
    results.push(...await this.diagnoseBestPractices())

    const duration = Date.now() - startTime

    // 生成报告
    const report = this.generateReport(results, duration)

    // 显示报告
    this.displayReport(report)

    return report
  }

  /**
   * 诊断配置
   */
  private async diagnoseConfiguration(): Promise<DiagnosticResult[]> {
    const results: DiagnosticResult[] = []

    // 检查是否缺少必要配置
    if (!this.config.input) {
      results.push({
        id: 'missing-input',
        level: DiagnosticLevel.ERROR,
        category: DiagnosticCategory.CONFIGURATION,
        title: '缺少入口配置',
        description: '未指定构建入口文件',
        impact: 'high',
        suggestions: [
          {
            title: '添加入口配置',
            description: '在配置文件中指定入口',
            action: 'config',
            config: 'export default {\n  input: "src/index.ts"\n}',
            priority: 1
          }
        ]
      })
    }

    // 检查输出配置
    if (!this.config.output && !this.config.outDir) {
      results.push({
        id: 'missing-output',
        level: DiagnosticLevel.WARNING,
        category: DiagnosticCategory.CONFIGURATION,
        title: '未配置输出目录',
        description: '将使用默认输出目录，建议明确指定',
        impact: 'low',
        suggestions: [
          {
            title: '指定输出目录',
            description: '明确指定输出目录以避免混淆',
            action: 'config',
            config: 'export default {\n  outDir: "dist"\n}',
            priority: 2
          }
        ]
      })
    }

    // 检查外部依赖配置
    const packageJsonPath = path.join(process.cwd(), 'package.json')
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath)
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.peerDependencies
      }

      if (Object.keys(allDeps).length > 0 && !this.config.external) {
        results.push({
          id: 'missing-external',
          level: DiagnosticLevel.WARNING,
          category: DiagnosticCategory.CONFIGURATION,
          title: '未配置外部依赖',
          description: '项目有依赖但未配置 external，可能导致体积过大',
          impact: 'medium',
          suggestions: [
            {
              title: '自动排除依赖',
              description: '自动将 dependencies 和 peerDependencies 标记为外部',
              action: 'config',
              config: 'export default {\n  external: Object.keys({\n    ...require("./package.json").dependencies,\n    ...require("./package.json").peerDependencies\n  })\n}',
              estimatedImpact: '可减少 50-80% 的打包体积',
              priority: 1
            }
          ]
        })
      }
    }

    // 检查 UMD 配置
    if (this.config.formats?.includes('umd' as any) && !this.config.name) {
      results.push({
        id: 'missing-umd-name',
        level: DiagnosticLevel.ERROR,
        category: DiagnosticCategory.CONFIGURATION,
        title: 'UMD 格式缺少库名称',
        description: 'UMD 格式需要指定全局变量名',
        impact: 'high',
        suggestions: [
          {
            title: '添加库名称',
            description: '为 UMD 格式指定全局变量名',
            action: 'config',
            config: 'export default {\n  name: "MyLibrary",\n  formats: ["umd", "esm", "cjs"]\n}',
            priority: 1
          }
        ]
      })
    }

    return results
  }

  /**
   * 诊断性能
   */
  private async diagnosePerformance(buildResult: BuildResult): Promise<DiagnosticResult[]> {
    const results: DiagnosticResult[] = []

    // 检查构建时间
    if (buildResult.duration && buildResult.duration > 30000) {
      results.push({
        id: 'slow-build',
        level: DiagnosticLevel.WARNING,
        category: DiagnosticCategory.PERFORMANCE,
        title: '构建速度较慢',
        description: `构建耗时 ${(buildResult.duration / 1000).toFixed(2)}s，超过推荐值`,
        impact: 'medium',
        suggestions: [
          {
            title: '使用 esbuild 加速',
            description: 'esbuild 可提供 10-100 倍的构建速度',
            action: 'config',
            config: 'export default {\n  bundler: "esbuild"\n}',
            estimatedImpact: '构建速度提升 10-100 倍',
            priority: 1
          },
          {
            title: '启用增量构建',
            description: '只重新构建变更的文件',
            action: 'config',
            config: 'export default {\n  incremental: true\n}',
            estimatedImpact: '重复构建提速 60-80%',
            priority: 2
          },
          {
            title: '启用缓存',
            description: '使用构建缓存',
            action: 'config',
            config: 'export default {\n  cache: true\n}',
            estimatedImpact: '重复构建提速 30-50%',
            priority: 2
          }
        ]
      })
    }

    // 检查产物大小
    if (buildResult.outputs) {
      const totalSize = buildResult.outputs.reduce((sum, output) => sum + (output.size || 0), 0)
      
      if (totalSize > 1024 * 1024) { // > 1MB
        results.push({
          id: 'large-bundle',
          level: DiagnosticLevel.WARNING,
          category: DiagnosticCategory.PERFORMANCE,
          title: '打包体积过大',
          description: `总体积 ${(totalSize / 1024 / 1024).toFixed(2)}MB，建议优化`,
          impact: 'medium',
          suggestions: [
            {
              title: '启用 Tree Shaking',
              description: '自动移除未使用的代码',
              action: 'config',
              config: 'export default {\n  treeshake: true\n}',
              estimatedImpact: '减少 20-40% 体积',
              priority: 1
            },
            {
              title: '配置外部依赖',
              description: '不打包大型依赖库',
              action: 'config',
              config: 'export default {\n  external: ["vue", "react", "lodash"]\n}',
              estimatedImpact: '减少 50-80% 体积',
              priority: 1
            },
            {
              title: '启用代码压缩',
              description: '压缩输出代码',
              action: 'config',
              config: 'export default {\n  minify: true\n}',
              estimatedImpact: '减少 30-50% 体积',
              priority: 2
            }
          ]
        })
      }
    }

    return results
  }

  /**
   * 诊断依赖
   */
  private async diagnoseDependencies(): Promise<DiagnosticResult[]> {
    const results: DiagnosticResult[] = []

    const packageJsonPath = path.join(process.cwd(), 'package.json')
    if (!await fs.pathExists(packageJsonPath)) {
      return results
    }

    const packageJson = await fs.readJson(packageJsonPath)

    // 检查缺少的 peer dependencies
    if (packageJson.peerDependencies) {
      for (const [dep, version] of Object.entries(packageJson.peerDependencies)) {
        const isInstalled = await this.isDependencyInstalled(dep)
        if (!isInstalled) {
          results.push({
            id: `missing-peer-${dep}`,
            level: DiagnosticLevel.WARNING,
            category: DiagnosticCategory.DEPENDENCIES,
            title: '缺少 peer dependency',
            description: `需要安装 ${dep}@${version}`,
            impact: 'high',
            suggestions: [
              {
                title: '安装依赖',
                description: `安装 ${dep}`,
                action: 'command',
                command: `npm install ${dep}@${version}`,
                priority: 1
              }
            ]
          })
        }
      }
    }

    // 检查过时的依赖
    // 这里可以添加更复杂的版本检查逻辑

    return results
  }

  /**
   * 诊断代码质量
   */
  private async diagnoseCodeQuality(): Promise<DiagnosticResult[]> {
    const results: DiagnosticResult[] = []

    // 检查是否有 TypeScript
    const hasTsConfig = await fs.pathExists(path.join(process.cwd(), 'tsconfig.json'))
    
    if (hasTsConfig && !this.config.dts) {
      results.push({
        id: 'missing-dts',
        level: DiagnosticLevel.INFO,
        category: DiagnosticCategory.CODE_QUALITY,
        title: '未生成类型声明',
        description: 'TypeScript 项目建议生成 .d.ts 文件',
        impact: 'low',
        suggestions: [
          {
            title: '启用类型声明生成',
            description: '自动生成 TypeScript 类型声明文件',
            action: 'config',
            config: 'export default {\n  dts: true\n}',
            estimatedImpact: '提升 TypeScript 用户体验',
            priority: 2
          }
        ]
      })
    }

    // 检查 sourcemap
    if (!this.config.sourcemap) {
      results.push({
        id: 'missing-sourcemap',
        level: DiagnosticLevel.INFO,
        category: DiagnosticCategory.CODE_QUALITY,
        title: '未生成 sourcemap',
        description: 'Sourcemap 有助于调试',
        impact: 'low',
        suggestions: [
          {
            title: '启用 sourcemap',
            description: '生成 sourcemap 便于调试',
            action: 'config',
            config: 'export default {\n  sourcemap: true\n}',
            priority: 3
          }
        ]
      })
    }

    return results
  }

  /**
   * 诊断安全性
   */
  private async diagnoseSecurity(): Promise<DiagnosticResult[]> {
    const results: DiagnosticResult[] = []

    // 这里可以添加安全性检查
    // 例如：检查已知漏洞、敏感信息泄露等

    return results
  }

  /**
   * 诊断最佳实践
   */
  private async diagnoseBestPractices(): Promise<DiagnosticResult[]> {
    const results: DiagnosticResult[] = []

    // 检查是否使用多格式输出
    const formats = this.config.formats || []
    if (formats.length < 2) {
      results.push({
        id: 'single-format',
        level: DiagnosticLevel.INFO,
        category: DiagnosticCategory.BEST_PRACTICES,
        title: '仅输出单一格式',
        description: '建议同时输出 ESM 和 CJS 格式以提高兼容性',
        impact: 'low',
        suggestions: [
          {
            title: '输出多种格式',
            description: '同时输出 ESM、CJS 格式',
            action: 'config',
            config: 'export default {\n  formats: ["esm", "cjs"]\n}',
            estimatedImpact: '提高包的兼容性',
            priority: 2
          }
        ]
      })
    }

    // 检查是否有 README
    const hasReadme = await fs.pathExists(path.join(process.cwd(), 'README.md'))
    if (!hasReadme) {
      results.push({
        id: 'missing-readme',
        level: DiagnosticLevel.INFO,
        category: DiagnosticCategory.BEST_PRACTICES,
        title: '缺少 README',
        description: '建议添加 README.md 文档',
        impact: 'low',
        suggestions: [
          {
            title: '创建 README',
            description: '添加项目文档',
            action: 'manual',
            priority: 3
          }
        ]
      })
    }

    return results
  }

  /**
   * 生成报告
   */
  private generateReport(results: DiagnosticResult[], duration: number): DiagnosticReport {
    const summary = {
      total: results.length,
      byLevel: this.countByLevel(results),
      byCategory: this.countByCategory(results)
    }

    const recommendations = this.generateRecommendations(results)
    const score = this.calculateScore(results)

    return {
      timestamp: Date.now(),
      duration,
      summary,
      results,
      recommendations,
      score
    }
  }

  /**
   * 按级别统计
   */
  private countByLevel(results: DiagnosticResult[]): Record<DiagnosticLevel, number> {
    const counts: Record<DiagnosticLevel, number> = {
      [DiagnosticLevel.INFO]: 0,
      [DiagnosticLevel.WARNING]: 0,
      [DiagnosticLevel.ERROR]: 0,
      [DiagnosticLevel.CRITICAL]: 0
    }

    results.forEach(result => {
      counts[result.level]++
    })

    return counts
  }

  /**
   * 按类别统计
   */
  private countByCategory(results: DiagnosticResult[]): Record<DiagnosticCategory, number> {
    const counts: Record<DiagnosticCategory, number> = {
      [DiagnosticCategory.PERFORMANCE]: 0,
      [DiagnosticCategory.CONFIGURATION]: 0,
      [DiagnosticCategory.DEPENDENCIES]: 0,
      [DiagnosticCategory.CODE_QUALITY]: 0,
      [DiagnosticCategory.SECURITY]: 0,
      [DiagnosticCategory.BEST_PRACTICES]: 0
    }

    results.forEach(result => {
      counts[result.category]++
    })

    return counts
  }

  /**
   * 生成总体建议
   */
  private generateRecommendations(results: DiagnosticResult[]): string[] {
    const recommendations: string[] = []

    const errors = results.filter(r => r.level === DiagnosticLevel.ERROR)
    const warnings = results.filter(r => r.level === DiagnosticLevel.WARNING)

    if (errors.length > 0) {
      recommendations.push(`发现 ${errors.length} 个错误，建议优先修复`)
    }

    if (warnings.length > 0) {
      recommendations.push(`发现 ${warnings.length} 个警告，建议关注`)
    }

    // 性能相关建议
    const perfIssues = results.filter(r => r.category === DiagnosticCategory.PERFORMANCE)
    if (perfIssues.length > 0) {
      recommendations.push('发现性能问题，建议参考性能优化建议')
    }

    return recommendations
  }

  /**
   * 计算健康分数 (0-100)
   */
  private calculateScore(results: DiagnosticResult[]): number {
    let score = 100

    results.forEach(result => {
      switch (result.level) {
        case DiagnosticLevel.CRITICAL:
          score -= 20
          break
        case DiagnosticLevel.ERROR:
          score -= 10
          break
        case DiagnosticLevel.WARNING:
          score -= 5
          break
        case DiagnosticLevel.INFO:
          score -= 1
          break
      }
    })

    return Math.max(0, score)
  }

  /**
   * 显示报告
   */
  private displayReport(report: DiagnosticReport): void {
    console.log('\n' + chalk.bold.cyan('='.repeat(60)))
    console.log(chalk.bold.cyan('  构建诊断报告'))
    console.log(chalk.bold.cyan('='.repeat(60)) + '\n')

    // 健康分数
    const scoreColor = report.score >= 80 ? 'green' : report.score >= 60 ? 'yellow' : 'red'
    console.log(chalk.bold('健康分数: ') + chalk[scoreColor].bold(`${report.score}/100`) + '\n')

    // 统计摘要
    console.log(chalk.bold('问题统计:'))
    console.log(`  总计: ${report.summary.total}`)
    console.log(chalk.red(`  ❌ 错误: ${report.summary.byLevel[DiagnosticLevel.ERROR]}`))
    console.log(chalk.yellow(`  ⚠️  警告: ${report.summary.byLevel[DiagnosticLevel.WARNING]}`))
    console.log(chalk.blue(`  ℹ️  信息: ${report.summary.byLevel[DiagnosticLevel.INFO]}`))
    console.log()

    // 详细问题
    if (report.results.length > 0) {
      console.log(chalk.bold('详细问题:\n'))

      report.results
        .sort((a, b) => {
          const levelOrder = { critical: 0, error: 1, warning: 2, info: 3 }
          return levelOrder[a.level] - levelOrder[b.level]
        })
        .forEach((result, index) => {
          this.displayDiagnosticResult(result, index + 1)
        })
    }

    // 总体建议
    if (report.recommendations.length > 0) {
      console.log(chalk.bold.green('\n💡 总体建议:\n'))
      report.recommendations.forEach(rec => {
        console.log(`  • ${rec}`)
      })
    }

    console.log('\n' + chalk.bold.cyan('='.repeat(60)) + '\n')
  }

  /**
   * 显示单个诊断结果
   */
  private displayDiagnosticResult(result: DiagnosticResult, index: number): void {
    const levelIcon = {
      critical: '🔴',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    }

    const levelColor = {
      critical: 'red',
      error: 'red',
      warning: 'yellow',
      info: 'blue'
    }

    console.log(
      chalk[levelColor[result.level]].bold(`${index}. ${levelIcon[result.level]} ${result.title}`)
    )
    console.log(`   ${chalk.gray(result.description)}`)

    if (result.suggestions.length > 0) {
      console.log(chalk.bold('   建议:'))
      result.suggestions
        .sort((a, b) => (a.priority || 999) - (b.priority || 999))
        .slice(0, 2) // 只显示前 2 个建议
        .forEach(suggestion => {
          console.log(`   • ${suggestion.title}`)
          if (suggestion.estimatedImpact) {
            console.log(chalk.gray(`     预期效果: ${suggestion.estimatedImpact}`))
          }
        })
    }

    console.log()
  }

  /**
   * 检查依赖是否已安装
   */
  private async isDependencyInstalled(dep: string): Promise<boolean> {
    try {
      const nodeModulesPath = path.join(process.cwd(), 'node_modules', dep)
      return await fs.pathExists(nodeModulesPath)
    } catch {
      return false
    }
  }
}

/**
 * 创建智能诊断器
 */
export function createSmartDiagnostics(
  config: BuilderConfig,
  logger?: Logger
): SmartBuildDiagnostics {
  return new SmartBuildDiagnostics(config, logger)
}
