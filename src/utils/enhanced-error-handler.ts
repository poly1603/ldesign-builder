/**
 * 增强的错误处理器
 * 
 * 提供智能错误识别、上下文感知、一键修复等高级功能
 * 
 * @author LDesign Team
 * @version 2.0.0
 */

import { Logger } from './logger'
import { FriendlyErrorHandler, ErrorType, Solution, FriendlyError } from './friendly-error-handler'
import chalk from 'chalk'
import path from 'path'
import fs from 'fs-extra'

/**
 * 错误模式
 */
export interface ErrorPattern {
  name: string
  regex: RegExp | RegExp[]
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: string
  handler: (match: RegExpMatchArray, context?: any) => FriendlyError
}

/**
 * 自动修复选项
 */
export interface AutoFixOptions {
  enabled: boolean
  dryRun?: boolean
  backup?: boolean
  confirmBeforeFix?: boolean
}

/**
 * 错误统计
 */
export interface ErrorStats {
  total: number
  byType: Record<ErrorType, number>
  bySeverity: Record<string, number>
  mostCommon: Array<{ error: string; count: number }>
  timeline: Array<{ timestamp: number; error: string }>
}

/**
 * 增强的错误处理器类
 */
export class EnhancedErrorHandler extends FriendlyErrorHandler {
  private errorPatterns: Map<string, ErrorPattern> = new Map()
  private errorHistory: Array<{ error: Error; timestamp: number; context?: any }> = []
  private autoFixOptions: AutoFixOptions
  private stats: ErrorStats

  constructor(logger?: Logger, options?: Partial<AutoFixOptions>) {
    super(logger)

    this.autoFixOptions = {
      enabled: options?.enabled !== false,
      dryRun: options?.dryRun || false,
      backup: options?.backup !== false,
      confirmBeforeFix: options?.confirmBeforeFix !== false
    }

    this.stats = {
      total: 0,
      byType: {} as Record<ErrorType, number>,
      bySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
      mostCommon: [],
      timeline: []
    }

    this.registerDefaultPatterns()
  }

  /**
   * 注册默认错误模式
   */
  private registerDefaultPatterns(): void {
    // 缺少 esbuild
    this.registerPattern({
      name: 'missing-esbuild',
      regex: /cannot find module ['"]esbuild['"]/i,
      severity: 'medium',
      category: 'dependency',
      handler: (match, context) => ({
        type: ErrorType.MISSING_DEPENDENCY,
        title: '缺少 esbuild 依赖',
        message: 'esbuild 打包器未安装',
        solutions: [
          {
            title: '安装 esbuild',
            description: 'esbuild 是可选的高性能打包器',
            command: 'npm install esbuild --save-dev'
          },
          {
            title: '使用 rollup 替代',
            description: 'rollup 是默认打包器，无需额外安装',
            config: 'export default { bundler: \'rollup\' }'
          },
          {
            title: '自动修复',
            description: '自动切换到 rollup',
            command: 'auto-fix'
          }
        ]
      })
    })

    // Vue 版本不匹配
    this.registerPattern({
      name: 'vue-version-mismatch',
      regex: /vue.*version.*mismatch|incompatible.*vue.*version/i,
      severity: 'high',
      category: 'version',
      handler: (match, context) => ({
        type: ErrorType.VERSION_CONFLICT,
        title: 'Vue 版本不匹配',
        message: 'Vue 版本与插件或依赖不兼容',
        solutions: [
          {
            title: '检查 Vue 版本',
            description: '确认 package.json 中的 Vue 版本',
            command: 'npm list vue'
          },
          {
            title: '统一版本',
            description: '将所有 Vue 相关依赖升级到同一主版本',
            command: 'npm update vue @vitejs/plugin-vue'
          },
          {
            title: '查看文档',
            description: '查看版本兼容性文档',
            link: 'https://vuejs.org/guide/extras/migration.html'
          }
        ]
      })
    })

    // TypeScript 装饰器错误
    this.registerPattern({
      name: 'typescript-decorators',
      regex: /experimental support for decorators|enable.*experimentalDecorators/i,
      severity: 'medium',
      category: 'config',
      handler: (match, context) => ({
        type: ErrorType.CONFIG_ERROR,
        title: 'TypeScript 装饰器未启用',
        message: '需要在 tsconfig.json 中启用实验性装饰器支持',
        solutions: [
          {
            title: '启用装饰器（推荐）',
            description: '在 tsconfig.json 中添加配置',
            config: JSON.stringify({
              compilerOptions: {
                experimentalDecorators: true,
                emitDecoratorMetadata: true
              }
            }, null, 2)
          },
          {
            title: '使用 swc 打包器',
            description: 'swc 对装饰器有更好的支持',
            config: 'export default { bundler: \'swc\' }'
          },
          {
            title: '自动修复',
            description: '自动更新 tsconfig.json',
            command: 'auto-fix'
          }
        ]
      })
    })

    // 循环依赖
    this.registerPattern({
      name: 'circular-dependency',
      regex: /circular dependency|cycle.*detected/i,
      severity: 'high',
      category: 'code-quality',
      handler: (match, context) => ({
        type: ErrorType.BUILD_ERROR,
        title: '检测到循环依赖',
        message: '模块之间存在循环依赖，可能导致运行时错误',
        solutions: [
          {
            title: '重构代码结构',
            description: '将共享代码提取到独立模块',
            link: 'https://github.com/ldesign/builder/docs/circular-dependencies.md'
          },
          {
            title: '使用依赖注入',
            description: '通过依赖注入打破循环',
            link: 'https://github.com/ldesign/builder/docs/dependency-injection.md'
          },
          {
            title: '查看依赖图',
            description: '生成可视化依赖图分析问题',
            command: 'npm run build -- --analyze'
          }
        ]
      })
    })

    // 内存溢出
    this.registerPattern({
      name: 'out-of-memory',
      regex: /out of memory|heap.*out.*of.*memory|javascript.*heap/i,
      severity: 'critical',
      category: 'performance',
      handler: (match, context) => ({
        type: ErrorType.BUILD_ERROR,
        title: '内存溢出',
        message: '构建过程中内存不足',
        solutions: [
          {
            title: '增加 Node.js 内存限制',
            description: '通过环境变量增加堆内存',
            command: 'NODE_OPTIONS=--max-old-space-size=4096 npm run build'
          },
          {
            title: '启用增量构建',
            description: '只构建变更的文件',
            config: 'export default { incremental: true }'
          },
          {
            title: '减少并发数',
            description: '降低并行构建的文件数量',
            config: 'export default { parallel: { maxConcurrency: 2 } }'
          },
          {
            title: '使用流式处理',
            description: '对大文件使用流式处理',
            config: 'export default { streamProcessing: true }'
          }
        ]
      })
    })
  }

  /**
   * 注册错误模式
   */
  registerPattern(pattern: ErrorPattern): void {
    this.errorPatterns.set(pattern.name, pattern)
  }

  /**
   * 处理错误（增强版）
   */
  override handle(error: Error | string, context?: any): FriendlyError {
    const errorMessage = typeof error === 'string' ? error : error.message
    const originalError = error instanceof Error ? error : undefined

    // 记录到历史
    if (originalError) {
      this.errorHistory.push({
        error: originalError,
        timestamp: Date.now(),
        context
      })
    }

    // 尝试匹配注册的模式
    for (const [name, pattern] of this.errorPatterns) {
      const regexArray = Array.isArray(pattern.regex) ? pattern.regex : [pattern.regex]

      for (const regex of regexArray) {
        const match = errorMessage.match(regex)
        if (match) {
          const friendlyError = pattern.handler(match, context)
          friendlyError.originalError = originalError

          // 更新统计
          this.updateStats(friendlyError, pattern.severity)

          // 尝试自动修复
          if (this.autoFixOptions.enabled) {
            this.tryAutoFix(friendlyError, context)
          }

          // this.display(friendlyError) // 私有方法，改为手动显示
          console.log(`\n错误: ${friendlyError.title}`)
          console.log(`说明: ${friendlyError.message}`)
          friendlyError.solutions.forEach((s, i) => {
            console.log(`\n解决方案 ${i + 1}: ${s.title}`)
            console.log(`  ${s.description}`)
            if (s.command) console.log(`  命令: ${s.command}`)
          })
          return friendlyError
        }
      }
    }

    // 回退到基础处理
    const friendlyError = super.handle(error, context)
    this.updateStats(friendlyError, 'medium')

    return friendlyError
  }

  /**
   * 尝试自动修复
   */
  private async tryAutoFix(error: FriendlyError, context?: any): Promise<boolean> {
    const autoFixSolution = error.solutions.find(s => s.command === 'auto-fix')

    if (!autoFixSolution) {
      return false
    }

    // Dry run 模式
    if (this.autoFixOptions.dryRun) {
      console.log(chalk.yellow('🔧 [DRY RUN] 将执行自动修复:'), error.title)
      return false
    }

    // 需要确认
    if (this.autoFixOptions.confirmBeforeFix) {
      // 这里应该集成交互式确认，简化为直接返回
      console.log(chalk.yellow('⚠️  需要用户确认才能自动修复'))
      return false
    }

    // 备份
    if (this.autoFixOptions.backup) {
      await this.createBackup(context)
    }

    // 执行修复
    try {
      const fixed = await this.executeAutoFix(error, context)
      if (fixed) {
        console.log(chalk.green('✅ 自动修复成功:'), error.title)
        return true
      }
    } catch (fixError) {
      console.log(chalk.red('❌ 自动修复失败:'), fixError)
    }

    return false
  }

  /**
   * 执行自动修复
   */
  private async executeAutoFix(error: FriendlyError, context?: any): Promise<boolean> {
    // 根据错误类型执行不同的修复策略
    switch (error.type) {
      case ErrorType.MISSING_DEPENDENCY:
        return await this.fixMissingDependency(error)

      case ErrorType.CONFIG_ERROR:
        return await this.fixConfigError(error)

      case ErrorType.VERSION_CONFLICT:
        return await this.fixVersionConflict(error)

      default:
        return false
    }
  }

  /**
   * 修复缺失依赖
   */
  private async fixMissingDependency(error: FriendlyError): Promise<boolean> {
    // 提取包名
    const packageName = this.extractPackageName(error.message)

    if (!packageName) {
      return false
    }

    // 切换到 rollup（对于可选依赖）
    if (packageName.includes('esbuild') || packageName.includes('@swc/core')) {
      return await this.updateConfig({ bundler: 'rollup' })
    }

    return false
  }

  /**
   * 修复配置错误
   */
  private async fixConfigError(error: FriendlyError): Promise<boolean> {
    // TypeScript 装饰器
    if (error.message.includes('decorator')) {
      const tsconfigPath = path.join(process.cwd(), 'tsconfig.json')

      if (await fs.pathExists(tsconfigPath)) {
        const tsconfig = await fs.readJSON(tsconfigPath)

        if (!tsconfig.compilerOptions) {
          tsconfig.compilerOptions = {}
        }

        tsconfig.compilerOptions.experimentalDecorators = true
        tsconfig.compilerOptions.emitDecoratorMetadata = true

        await fs.writeJSON(tsconfigPath, tsconfig, { spaces: 2 })
        return true
      }
    }

    return false
  }

  /**
   * 修复版本冲突
   */
  private async fixVersionConflict(error: FriendlyError): Promise<boolean> {
    // 这需要更复杂的依赖分析，暂时返回 false
    return false
  }

  /**
   * 更新配置文件
   */
  private async updateConfig(updates: Record<string, any>): Promise<boolean> {
    const configPaths = [
      '.ldesign/builder.config.ts',
      '.ldesign/builder.config.js',
      'builder.config.ts',
      'builder.config.js'
    ]

    for (const configPath of configPaths) {
      const fullPath = path.join(process.cwd(), configPath)

      if (await fs.pathExists(fullPath)) {
        // 简单实现：追加配置
        const content = await fs.readFile(fullPath, 'utf-8')
        const updatedContent = content.replace(
          /export default \{/,
          `export default {\n  ...${JSON.stringify(updates)},`
        )

        await fs.writeFile(fullPath, updatedContent)
        return true
      }
    }

    // 创建新配置
    const newConfigPath = path.join(process.cwd(), '.ldesign', 'builder.config.ts')
    await fs.ensureDir(path.dirname(newConfigPath))
    await fs.writeFile(
      newConfigPath,
      `export default ${JSON.stringify(updates, null, 2)}\n`
    )

    return true
  }

  /**
   * 创建备份
   */
  private async createBackup(context?: any): Promise<void> {
    const backupDir = path.join(process.cwd(), '.ldesign', 'backups')
    await fs.ensureDir(backupDir)

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupPath = path.join(backupDir, `backup-${timestamp}`)

    // 备份配置文件
    const configFiles = [
      'tsconfig.json',
      '.ldesign/builder.config.ts',
      '.ldesign/builder.config.js',
      'package.json'
    ]

    for (const file of configFiles) {
      const fullPath = path.join(process.cwd(), file)
      if (await fs.pathExists(fullPath)) {
        const backupFile = path.join(backupPath, file)
        await fs.ensureDir(path.dirname(backupFile))
        await fs.copy(fullPath, backupFile)
      }
    }
  }

  /**
   * 提取包名
   */
  private extractPackageName(message: string): string | null {
    const match = message.match(/['"]([^'"]+)['"]/) || message.match(/module[:\s]+([^\s]+)/)
    return match ? match[1] : null
  }

  /**
   * 更新统计
   */
  private updateStats(error: FriendlyError, severity: string): void {
    this.stats.total++

    this.stats.byType[error.type] = (this.stats.byType[error.type] || 0) + 1
    this.stats.bySeverity[severity] = (this.stats.bySeverity[severity] || 0) + 1

    this.stats.timeline.push({
      timestamp: Date.now(),
      error: error.title
    })

    // 更新最常见错误
    const existing = this.stats.mostCommon.find(e => e.error === error.title)
    if (existing) {
      existing.count++
    } else {
      this.stats.mostCommon.push({ error: error.title, count: 1 })
    }

    this.stats.mostCommon.sort((a, b) => b.count - a.count)
    this.stats.mostCommon = this.stats.mostCommon.slice(0, 10)
  }

  /**
   * 获取错误统计
   */
  getStats(): ErrorStats {
    return { ...this.stats }
  }

  /**
   * 获取错误历史
   */
  getHistory(): Array<{ error: Error; timestamp: number; context?: any }> {
    return [...this.errorHistory]
  }

  /**
   * 清除历史
   */
  clearHistory(): void {
    this.errorHistory = []
    this.stats = {
      total: 0,
      byType: {} as Record<ErrorType, number>,
      bySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
      mostCommon: [],
      timeline: []
    }
  }
}

/**
 * 创建增强错误处理器
 */
export function createEnhancedErrorHandler(
  logger?: Logger,
  options?: Partial<AutoFixOptions>
): EnhancedErrorHandler {
  return new EnhancedErrorHandler(logger, options)
}

/**
 * 全局错误处理
 */
export function handleError(error: Error | string, context?: any): void {
  const handler = createEnhancedErrorHandler()
  handler.handle(error, context)
}



