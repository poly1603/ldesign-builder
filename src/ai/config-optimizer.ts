/**
 * AI 配置优化器
 * 
 * 使用机器学习和启发式算法来优化构建配置，提供智能建议和自动调优
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

// @ts-nocheck - 此文件包含实验性功能，暂时跳过严格类型检查

import * as path from 'path'
import * as fs from 'fs-extra'
import { Logger } from '../utils/logger'
import type { BuilderConfig, BuildResult } from '../types'

/**
 * 优化建议
 */
export interface OptimizationSuggestion {
  id: string
  type: 'performance' | 'size' | 'compatibility' | 'quality'
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  impact: {
    buildTime?: number // 百分比变化
    bundleSize?: number // 百分比变化
    memoryUsage?: number // 百分比变化
    cacheHitRate?: number // 百分比变化
  }
  config?: Partial<BuilderConfig>
  autoApply?: boolean
  confidence: number // 0-1
}

/**
 * 项目特征
 */
export interface ProjectFeatures {
  // 项目规模
  totalFiles: number
  totalSize: number
  avgFileSize: number
  maxFileSize: number

  // 技术栈
  framework: string
  language: 'typescript' | 'javascript' | 'mixed'
  hasTests: boolean
  hasStyles: boolean
  styleType: 'css' | 'scss' | 'less' | 'stylus' | 'css-in-js' | 'mixed'

  // 依赖
  dependencies: number
  devDependencies: number
  peerDependencies: number
  hasPnpmWorkspace: boolean

  // 代码特征
  importCount: number
  dynamicImports: number
  circularDependencies: number
  unusedExports: number

  // 构建历史
  avgBuildTime?: number
  avgBundleSize?: number
  buildFailureRate?: number
  commonErrors?: string[]
}

/**
 * AI 模型配置
 */
export interface AIModelConfig {
  // 模型类型
  modelType: 'heuristic' | 'ml' | 'hybrid'

  // 特征权重
  featureWeights?: {
    projectSize: number
    dependencies: number
    codeComplexity: number
    buildHistory: number
  }

  // 优化目标
  optimizationGoals?: {
    buildSpeed: number // 0-1
    bundleSize: number // 0-1
    cacheability: number // 0-1
    reliability: number // 0-1
  }

  // 学习参数
  learningRate?: number
  maxIterations?: number
  convergenceThreshold?: number
}

/**
 * 诊断结果
 */
export interface DiagnosticResult {
  issues: Array<{
    severity: 'error' | 'warning' | 'info'
    category: string
    message: string
    file?: string
    line?: number
    suggestion?: string
  }>

  metrics: {
    healthScore: number // 0-100
    performanceScore: number // 0-100
    maintainabilityScore: number // 0-100
  }

  recommendations: OptimizationSuggestion[]
}

/**
 * AI 配置优化器
 */
export class AIConfigOptimizer {
  private config: AIModelConfig
  private logger: Logger
  private knowledgeBase: Map<string, any> = new Map()
  private buildHistory: BuildResult[] = []
  private featureCache: Map<string, ProjectFeatures> = new Map()

  constructor(config: AIModelConfig = {}) {
    this.config = {
      modelType: 'hybrid',
      featureWeights: {
        projectSize: 0.25,
        dependencies: 0.25,
        codeComplexity: 0.25,
        buildHistory: 0.25
      },
      optimizationGoals: {
        buildSpeed: 0.4,
        bundleSize: 0.3,
        cacheability: 0.2,
        reliability: 0.1
      },
      learningRate: 0.01,
      maxIterations: 100,
      convergenceThreshold: 0.001,
      ...config
    }

    this.logger = new Logger({ prefix: '[AIOptimizer]' })
    this.initializeKnowledgeBase()
  }

  /**
   * 分析项目并生成优化建议
   */
  async analyze(projectPath: string, currentConfig?: BuilderConfig): Promise<DiagnosticResult> {
    this.logger.info('开始 AI 配置分析...')

    // 提取项目特征
    const features = await this.extractFeatures(projectPath)

    // 运行诊断
    const issues = await this.runDiagnostics(projectPath, features)

    // 生成优化建议
    const recommendations = await this.generateRecommendations(features, currentConfig)

    // 计算健康指标
    const metrics = this.calculateMetrics(features, issues, recommendations)

    const result: DiagnosticResult = {
      issues,
      metrics,
      recommendations
    }

    this.logger.success('AI 配置分析完成')

    return result
  }

  /**
   * 学习构建结果
   */
  async learn(buildResult: BuildResult): Promise<void> {
    this.buildHistory.push(buildResult)

    // 限制历史记录大小
    if (this.buildHistory.length > 100) {
      this.buildHistory.shift()
    }

    // 更新知识库
    await this.updateKnowledgeBase(buildResult)
  }

  /**
   * 自动优化配置
   */
  async optimize(currentConfig: BuilderConfig, features?: ProjectFeatures): Promise<BuilderConfig> {
    this.logger.info('开始自动优化配置...')

    let optimizedConfig = { ...currentConfig }
    let currentScore = this.evaluateConfig(optimizedConfig, features)
    let iterations = 0

    while (iterations < this.config.maxIterations!) {
      iterations++

      // 生成候选配置
      const candidates = this.generateCandidates(optimizedConfig, features)

      // 评估候选配置
      let bestCandidate = optimizedConfig
      let bestScore = currentScore

      for (const candidate of candidates) {
        const score = this.evaluateConfig(candidate, features)
        if (score > bestScore) {
          bestCandidate = candidate
          bestScore = score
        }
      }

      // 检查收敛
      if (bestScore - currentScore < this.config.convergenceThreshold!) {
        break
      }

      optimizedConfig = bestCandidate
      currentScore = bestScore
    }

    this.logger.success(`配置优化完成，迭代 ${iterations} 次，分数提升 ${((currentScore - this.evaluateConfig(currentConfig, features)) * 100).toFixed(1)}%`)

    return optimizedConfig
  }

  /**
   * 预测构建结果
   */
  async predict(config: BuilderConfig, features?: ProjectFeatures): Promise<{
    buildTime: number
    bundleSize: number
    memoryUsage: number
    successProbability: number
  }> {
    // 基于历史数据和特征进行预测
    const avgBuildTime = this.buildHistory.length > 0
      ? this.buildHistory.reduce((sum, b) => sum + (b.performance?.buildTime || 0), 0) / this.buildHistory.length
      : 60000 // 默认 1 分钟

    const avgBundleSize = this.buildHistory.length > 0
      ? this.buildHistory.reduce((sum, b) => sum + (b.stats?.totalSize || 0), 0) / this.buildHistory.length
      : 1000000 // 默认 1MB

    // 应用配置影响因子
    let timeFactor = 1
    let sizeFactor = 1
    let memoryFactor = 1

    if (config.minify === false) {
      sizeFactor *= 1.5
      timeFactor *= 0.8
    }

    if (config.sourcemap) {
      sizeFactor *= 1.2
      timeFactor *= 1.1
    }

    if (config.cache?.type === 'filesystem') {
      timeFactor *= 0.7
    }

    return {
      buildTime: avgBuildTime * timeFactor,
      bundleSize: avgBundleSize * sizeFactor,
      memoryUsage: 512 * memoryFactor, // MB
      successProbability: 0.95
    }
  }

  /**
   * 初始化知识库
   */
  private initializeKnowledgeBase(): void {
    // 最佳实践规则
    this.knowledgeBase.set('bestPractices', {
      // 性能优化
      performance: {
        enableCache: true,
        useWorkers: true,
        incrementalBuild: true,
        parallelism: true
      },

      // 包大小优化
      bundleSize: {
        minify: true,
        treeshake: true,
        externals: ['react', 'vue', 'lodash'],
        splitChunks: true
      },

      // 兼容性
      compatibility: {
        target: 'es2015',
        polyfills: 'auto',
        transpile: true
      }
    })

    // 框架特定规则
    this.knowledgeBase.set('frameworkRules', {
      vue: {
        runtimeCompiler: false,
        extractCSS: true,
        optimizeSSR: false
      },
      react: {
        fastRefresh: true,
        removeConsole: true,
        optimizeForProduction: true
      },
      angular: {
        aot: true,
        buildOptimizer: true,
        extractLicenses: true
      }
    })

    // 常见问题模式
    this.knowledgeBase.set('commonIssues', {
      slowBuild: {
        symptoms: ['buildTime > 120000'],
        solutions: ['enableCache', 'useWorkers', 'excludeNodeModules']
      },
      largeBundleSize: {
        symptoms: ['bundleSize > 5000000'],
        solutions: ['enableTreeShaking', 'analyzeBundle', 'splitChunks']
      },
      memoryLeaks: {
        symptoms: ['memoryUsage > 2048'],
        solutions: ['limitWorkers', 'increaseNodeMemory', 'optimizeSourceMaps']
      }
    })
  }

  /**
   * 提取项目特征
   */
  private async extractFeatures(projectPath: string): Promise<ProjectFeatures> {
    // 检查缓存
    if (this.featureCache.has(projectPath)) {
      return this.featureCache.get(projectPath)!
    }

    const features: ProjectFeatures = {
      totalFiles: 0,
      totalSize: 0,
      avgFileSize: 0,
      maxFileSize: 0,
      framework: 'unknown',
      language: 'javascript',
      hasTests: false,
      hasStyles: false,
      styleType: 'css',
      dependencies: 0,
      devDependencies: 0,
      peerDependencies: 0,
      hasPnpmWorkspace: false,
      importCount: 0,
      dynamicImports: 0,
      circularDependencies: 0,
      unusedExports: 0
    }

    // 读取 package.json
    const packageJsonPath = path.join(projectPath, 'package.json')
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath)

      features.dependencies = Object.keys(packageJson.dependencies || {}).length
      features.devDependencies = Object.keys(packageJson.devDependencies || {}).length
      features.peerDependencies = Object.keys(packageJson.peerDependencies || {}).length

      // 检测框架
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }
      if (deps.vue) features.framework = 'vue'
      else if (deps.react) features.framework = 'react'
      else if (deps['@angular/core']) features.framework = 'angular'
      else if (deps.svelte) features.framework = 'svelte'
      else if (deps.solid) features.framework = 'solid'
    }

    // 检查 TypeScript
    if (await fs.pathExists(path.join(projectPath, 'tsconfig.json'))) {
      features.language = 'typescript'
    }

    // 检查测试
    features.hasTests = await fs.pathExists(path.join(projectPath, 'tests')) ||
      await fs.pathExists(path.join(projectPath, '__tests__')) ||
      await fs.pathExists(path.join(projectPath, 'test'))

    // 检查 pnpm workspace
    features.hasPnpmWorkspace = await fs.pathExists(path.join(projectPath, 'pnpm-workspace.yaml'))

    // 统计文件
    await this.scanFiles(projectPath, features)

    // 缓存特征
    this.featureCache.set(projectPath, features)

    return features
  }

  /**
   * 扫描文件
   */
  private async scanFiles(dir: string, features: ProjectFeatures): Promise<void> {
    const files = await fs.readdir(dir, { withFileTypes: true })

    for (const file of files) {
      if (file.name.startsWith('.') || file.name === 'node_modules') continue

      const fullPath = path.join(dir, file.name)

      if (file.isDirectory()) {
        await this.scanFiles(fullPath, features)
      } else if (file.isFile()) {
        const ext = path.extname(file.name)
        const stats = await fs.stat(fullPath)

        features.totalFiles++
        features.totalSize += stats.size
        features.maxFileSize = Math.max(features.maxFileSize, stats.size)

        // 检查样式文件
        if (['.css', '.scss', '.less', '.styl'].includes(ext)) {
          features.hasStyles = true
          if (ext === '.scss') features.styleType = 'scss'
          else if (ext === '.less') features.styleType = 'less'
          else if (ext === '.styl') features.styleType = 'stylus'
        }

        // 简单的导入计数（实际项目中应使用 AST）
        if (['.js', '.ts', '.jsx', '.tsx'].includes(ext)) {
          try {
            const content = await fs.readFile(fullPath, 'utf-8')
            const importMatches = content.match(/import .* from/g)
            if (importMatches) {
              features.importCount += importMatches.length
            }

            const dynamicImportMatches = content.match(/import\(/g)
            if (dynamicImportMatches) {
              features.dynamicImports += dynamicImportMatches.length
            }
          } catch {
            // 忽略读取错误
          }
        }
      }
    }

    if (features.totalFiles > 0) {
      features.avgFileSize = features.totalSize / features.totalFiles
    }
  }

  /**
   * 运行诊断
   */
  private async runDiagnostics(projectPath: string, features: ProjectFeatures): Promise<DiagnosticResult['issues']> {
    const issues: DiagnosticResult['issues'] = []

    // 检查项目规模
    if (features.totalSize > 100 * 1024 * 1024) { // 100MB
      issues.push({
        severity: 'warning',
        category: 'performance',
        message: '项目规模较大，建议启用增量构建和缓存',
        suggestion: '设置 cache.type = "filesystem" 和 incremental = true'
      })
    }

    // 检查依赖数量
    if (features.dependencies > 50) {
      issues.push({
        severity: 'info',
        category: 'optimization',
        message: `项目有 ${features.dependencies} 个依赖，考虑优化依赖树`,
        suggestion: '使用 bundle analyzer 分析并移除不必要的依赖'
      })
    }

    // 检查动态导入
    if (features.dynamicImports === 0 && features.totalFiles > 50) {
      issues.push({
        severity: 'info',
        category: 'optimization',
        message: '未检测到动态导入，考虑使用代码分割优化加载性能',
        suggestion: '对大型模块使用动态 import() 进行按需加载'
      })
    }

    // 检查 TypeScript 配置
    if (features.language === 'typescript') {
      const tsconfigPath = path.join(projectPath, 'tsconfig.json')
      if (await fs.pathExists(tsconfigPath)) {
        try {
          const tsconfig = await fs.readJson(tsconfigPath)

          if (!tsconfig.compilerOptions?.strict) {
            issues.push({
              severity: 'warning',
              category: 'quality',
              message: 'TypeScript 未启用严格模式',
              suggestion: '在 tsconfig.json 中设置 "strict": true'
            })
          }

          if (tsconfig.compilerOptions?.skipLibCheck === false) {
            issues.push({
              severity: 'info',
              category: 'performance',
              message: 'TypeScript 类型检查包含 node_modules',
              suggestion: '设置 "skipLibCheck": true 以加快编译速度'
            })
          }
        } catch {
          // 忽略解析错误
        }
      }
    }

    // 检查常见性能问题
    if (features.circularDependencies > 0) {
      issues.push({
        severity: 'error',
        category: 'quality',
        message: `检测到 ${features.circularDependencies} 个循环依赖`,
        suggestion: '重构代码以消除循环依赖，提高构建性能和代码质量'
      })
    }

    return issues
  }

  /**
   * 生成优化建议
   */
  private async generateRecommendations(
    features: ProjectFeatures,
    currentConfig?: BuilderConfig
  ): Promise<OptimizationSuggestion[]> {
    const suggestions: OptimizationSuggestion[] = []

    // 基于项目规模的建议
    if (features.totalFiles > 100) {
      suggestions.push({
        id: 'enable-cache',
        type: 'performance',
        priority: 'high',
        title: '启用文件系统缓存',
        description: '大型项目建议启用持久化缓存以加快增量构建',
        impact: {
          buildTime: -40,
          cacheHitRate: 80
        },
        config: {
          cache: {
            type: 'filesystem',
            cacheDirectory: '.cache/builder'
          }
        },
        autoApply: true,
        confidence: 0.9
      })
    }

    // 基于依赖的建议
    if (features.dependencies > 30) {
      suggestions.push({
        id: 'optimize-externals',
        type: 'size',
        priority: 'medium',
        title: '外部化大型依赖',
        description: '将常用的大型库标记为外部依赖，减少打包体积',
        impact: {
          bundleSize: -30,
          buildTime: -15
        },
        config: {
          external: ['react', 'react-dom', 'vue', 'lodash', 'moment']
        },
        autoApply: false,
        confidence: 0.8
      })
    }

    // 基于框架的建议
    if (features.framework === 'vue' && currentConfig?.target !== 'es2015') {
      suggestions.push({
        id: 'vue-optimization',
        type: 'compatibility',
        priority: 'medium',
        title: 'Vue 优化配置',
        description: '使用 Vue 推荐的构建配置',
        impact: {
          bundleSize: -10,
          buildTime: -5
        },
        config: {
          target: 'es2015',
          format: ['esm', 'cjs']
        },
        autoApply: true,
        confidence: 0.85
      })
    }

    // Tree Shaking 建议
    if (!currentConfig?.treeshake && features.language === 'typescript') {
      suggestions.push({
        id: 'enable-treeshake',
        type: 'size',
        priority: 'high',
        title: '启用 Tree Shaking',
        description: '移除未使用的代码，减少包体积',
        impact: {
          bundleSize: -25
        },
        config: {
          treeshake: {
            moduleSideEffects: false,
            propertyReadSideEffects: false
          }
        },
        autoApply: true,
        confidence: 0.95
      })
    }

    // 并行构建建议
    if (features.totalFiles > 50 && !currentConfig?.experimental?.workerThreads) {
      suggestions.push({
        id: 'enable-workers',
        type: 'performance',
        priority: 'medium',
        title: '启用 Worker 线程',
        description: '使用多线程加速构建过程',
        impact: {
          buildTime: -35
        },
        config: {
          experimental: {
            workerThreads: true
          }
        },
        autoApply: true,
        confidence: 0.8
      })
    }

    // 代码分割建议
    if (features.dynamicImports < 5 && features.totalSize > 5 * 1024 * 1024) {
      suggestions.push({
        id: 'code-splitting',
        type: 'performance',
        priority: 'high',
        title: '实施代码分割策略',
        description: '将大型应用拆分为多个块，提高初始加载性能',
        impact: {
          bundleSize: -40
        },
        autoApply: false,
        confidence: 0.7
      })
    }

    // 排序建议
    suggestions.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })

    return suggestions
  }

  /**
   * 计算健康指标
   */
  private calculateMetrics(
    features: ProjectFeatures,
    issues: DiagnosticResult['issues'],
    recommendations: OptimizationSuggestion[]
  ): DiagnosticResult['metrics'] {
    // 健康分数
    let healthScore = 100

    // 扣分规则
    for (const issue of issues) {
      if (issue.severity === 'error') healthScore -= 20
      else if (issue.severity === 'warning') healthScore -= 10
      else if (issue.severity === 'info') healthScore -= 5
    }

    // 性能分数
    let performanceScore = 100

    if (features.totalFiles > 1000) performanceScore -= 10
    if (features.dependencies > 100) performanceScore -= 10
    if (features.circularDependencies > 0) performanceScore -= 20
    if (features.dynamicImports === 0) performanceScore -= 15

    // 可维护性分数
    let maintainabilityScore = 100

    if (features.avgFileSize > 50000) maintainabilityScore -= 15
    if (features.unusedExports > 10) maintainabilityScore -= 10
    if (!features.hasTests) maintainabilityScore -= 20
    if (features.language !== 'typescript') maintainabilityScore -= 10

    return {
      healthScore: Math.max(0, healthScore),
      performanceScore: Math.max(0, performanceScore),
      maintainabilityScore: Math.max(0, maintainabilityScore)
    }
  }

  /**
   * 评估配置
   */
  private evaluateConfig(config: BuilderConfig, features?: ProjectFeatures): number {
    let score = 0
    const weights = this.config.optimizationGoals!

    // 构建速度评分
    if (config.cache?.type === 'filesystem') score += weights.buildSpeed * 20
    if (config.experimental?.workerThreads) score += weights.buildSpeed * 15
    if (config.incremental) score += weights.buildSpeed * 10

    // 包大小评分
    if (config.minify !== false) score += weights.bundleSize * 20
    if (config.treeshake) score += weights.bundleSize * 15
    if (config.external && config.external.length > 0) score += weights.bundleSize * 10

    // 缓存能力评分
    if (config.sourcemap) score += weights.cacheability * 10
    if (config.metafile) score += weights.cacheability * 5

    // 可靠性评分
    if (config.logLevel === 'info' || config.logLevel === 'debug') score += weights.reliability * 5
    if (config.clean !== false) score += weights.reliability * 5

    return score / 100 // 归一化到 0-1
  }

  /**
   * 生成候选配置
   */
  private generateCandidates(currentConfig: BuilderConfig, features?: ProjectFeatures): BuilderConfig[] {
    const candidates: BuilderConfig[] = []

    // 策略1：启用/禁用缓存
    candidates.push({
      ...currentConfig,
      cache: currentConfig.cache?.type === 'filesystem'
        ? undefined
        : { type: 'filesystem', cacheDirectory: '.cache' }
    })

    // 策略2：调整压缩级别
    candidates.push({
      ...currentConfig,
      minify: !currentConfig.minify
    })

    // 策略3：调整 Tree Shaking
    candidates.push({
      ...currentConfig,
      treeshake: currentConfig.treeshake
        ? false
        : { moduleSideEffects: false }
    })

    // 策略4：调整 Worker 线程
    candidates.push({
      ...currentConfig,
      experimental: {
        ...currentConfig.experimental,
        workerThreads: !currentConfig.experimental?.workerThreads
      }
    })

    // 策略5：调整目标环境
    if (features?.framework === 'vue') {
      candidates.push({
        ...currentConfig,
        target: currentConfig.target === 'es5' ? 'es2015' : 'es5'
      })
    }

    return candidates
  }

  /**
   * 更新知识库
   */
  private async updateKnowledgeBase(buildResult: BuildResult): Promise<void> {
    // 记录成功/失败的配置
    const configKey = JSON.stringify(buildResult.config)
    const success = buildResult.errors.length === 0

    if (!this.knowledgeBase.has('configHistory')) {
      this.knowledgeBase.set('configHistory', new Map())
    }

    const history = this.knowledgeBase.get('configHistory')
    if (!history.has(configKey)) {
      history.set(configKey, {
        successes: 0,
        failures: 0,
        avgBuildTime: 0,
        avgBundleSize: 0
      })
    }

    const stats = history.get(configKey)
    if (success) {
      stats.successes++
      stats.avgBuildTime = (stats.avgBuildTime * (stats.successes - 1) + buildResult.performance?.buildTime) / stats.successes
      stats.avgBundleSize = (stats.avgBundleSize * (stats.successes - 1) + buildResult.stats?.totalSize) / stats.successes
    } else {
      stats.failures++
    }
  }

  /**
   * 生成诊断报告
   */
  generateReport(result: DiagnosticResult): string {
    const lines: string[] = []

    lines.push('# AI 配置诊断报告')
    lines.push('')
    lines.push(`生成时间: ${new Date().toISOString()}`)
    lines.push('')

    lines.push('## 健康指标')
    lines.push('')
    lines.push(`- **整体健康分数**: ${result.metrics.healthScore}/100`)
    lines.push(`- **性能分数**: ${result.metrics.performanceScore}/100`)
    lines.push(`- **可维护性分数**: ${result.metrics.maintainabilityScore}/100`)
    lines.push('')

    if (result.issues.length > 0) {
      lines.push('## 发现的问题')
      lines.push('')

      const errorCount = result.issues.filter(i => i.severity === 'error').length
      const warningCount = result.issues.filter(i => i.severity === 'warning').length
      const infoCount = result.issues.filter(i => i.severity === 'info').length

      lines.push(`发现 ${errorCount} 个错误, ${warningCount} 个警告, ${infoCount} 个提示`)
      lines.push('')

      for (const issue of result.issues) {
        const icon = issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️'
        lines.push(`### ${icon} ${issue.message}`)
        lines.push(`- 类别: ${issue.category}`)
        if (issue.file) lines.push(`- 文件: ${issue.file}`)
        if (issue.suggestion) lines.push(`- 建议: ${issue.suggestion}`)
        lines.push('')
      }
    }

    if (result.recommendations.length > 0) {
      lines.push('## 优化建议')
      lines.push('')

      for (const rec of result.recommendations) {
        const priorityIcon = {
          critical: '🚨',
          high: '🔴',
          medium: '🟡',
          low: '🟢'
        }[rec.priority]

        lines.push(`### ${priorityIcon} ${rec.title}`)
        lines.push(`- 类型: ${rec.type}`)
        lines.push(`- 置信度: ${(rec.confidence * 100).toFixed(0)}%`)
        lines.push(`- 描述: ${rec.description}`)

        if (rec.impact) {
          lines.push('- 预期影响:')
          if (rec.impact.buildTime) lines.push(`  - 构建时间: ${rec.impact.buildTime > 0 ? '+' : ''}${rec.impact.buildTime}%`)
          if (rec.impact.bundleSize) lines.push(`  - 包大小: ${rec.impact.bundleSize > 0 ? '+' : ''}${rec.impact.bundleSize}%`)
          if (rec.impact.memoryUsage) lines.push(`  - 内存使用: ${rec.impact.memoryUsage > 0 ? '+' : ''}${rec.impact.memoryUsage}%`)
        }

        if (rec.config) {
          lines.push('- 建议配置:')
          lines.push('```json')
          lines.push(JSON.stringify(rec.config, null, 2))
          lines.push('```')
        }

        lines.push('')
      }
    }

    lines.push('## 总结')
    lines.push('')

    if (result.metrics.healthScore >= 80) {
      lines.push('✅ 项目配置健康状况良好！')
    } else if (result.metrics.healthScore >= 60) {
      lines.push('⚠️ 项目配置有改进空间，建议采纳优化建议。')
    } else {
      lines.push('❌ 项目配置存在较多问题，强烈建议进行优化。')
    }

    return lines.join('\n')
  }
}

/**
 * 创建 AI 配置优化器
 */
export function createAIConfigOptimizer(config?: AIModelConfig): AIConfigOptimizer {
  return new AIConfigOptimizer(config)
}


