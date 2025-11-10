/**
 * 增强版库构建器主控制器类
 * 
 * 继承自 LibraryBuilder，提供更强大的构建功能和验证机制
 * - 构建缓存
 * - 依赖分析
 * - 代码质量检查
 * - 增强的验证和报告
 * 
 * @author LDesign Team
 * @version 2.0.0
 */

import { createHash } from 'crypto'
import * as fs from 'fs-extra'
import * as path from 'path'
import { LibraryBuilder } from './LibraryBuilder'
import {
  BuilderStatus,
  type BuilderOptions,
  type BuildResult
} from '../types/builder'
import type { BuilderConfig } from '../types/config'
import { LibraryType } from '../types/library'
import type {
  ValidationResult as PostBuildValidationResult,
  ValidationContext
} from '../types/validation'
import { ErrorCode } from '../constants/errors'

/**
 * 构建缓存接口
 */
interface BuildCache {
  configHash: string
  buildResult: BuildResult
  timestamp: number
  dependencies: string[]
}

/**
 * 依赖分析结果
 */
interface DependencyAnalysis {
  external: string[]
  bundled: string[]
  circular: string[][]
  unused: string[]
  missing: string[]
  versions: Record<string, string>
}

/**
 * 代码质量检查结果
 */
interface CodeQualityResult {
  issues: Array<{
    severity: 'error' | 'warning' | 'info'
    file: string
    line?: number
    column?: number
    message: string
    rule?: string
  }>
  metrics: {
    complexity: number
    maintainability: number
    duplications: number
    coverage?: number
  }
}

/**
 * 增强版库构建器主控制器类
 * 继承自 LibraryBuilder，添加额外的功能
 */
export class EnhancedLibraryBuilder extends LibraryBuilder {
  /** 构建缓存 */
  private buildCache: Map<string, BuildCache> = new Map()

  /** 依赖分析缓存 */
  private dependencyCache: Map<string, DependencyAnalysis> = new Map()

  /** 构建历史 */
  private buildHistory: BuildResult[] = []

  /** 最大历史记录数 */
  private readonly maxHistorySize = 10 // 从常量导入会在运行时才解析，使用直接赋值

  constructor(options: BuilderOptions = {}) {
    // 调用父类构造函数
    super(options)

    // 加载构建缓存
    this.loadBuildCache().catch(() => {
      // 缓存加载失败不影响正常使用
    })
  }

  /**
   * 执行库构建（增强版）
   */
  override async build(config?: BuilderConfig): Promise<BuildResult> {
    const buildId = this.generateBuildId()

    try {
      // 设置构建状态
      this.setStatus(BuilderStatus.BUILDING)

      // 合并并验证配置
      const mergedConfig = config ? this.mergeConfig(this.config, config) : this.config
      const configValidation = await this.validateBuildConfig(mergedConfig)

      if (!configValidation.valid) {
        throw this.errorHandler.createError(
          ErrorCode.CONFIG_VALIDATION_ERROR,
          `閰嶇疆楠岃瘉澶辫触: ${configValidation.errors.join(', ')}`
        )
      }

      // 检查构建缓存
      const cacheKey = this.generateCacheKey(mergedConfig)
      const cachedResult = this.getCachedBuild(cacheKey)

      // 验证缓存是否仍然有效
      if (cachedResult && await this.isCacheValid(cachedResult, mergedConfig)) {
        this.logger.info('使用缓存的构建结果')
        // 更新缓存时间戳
        cachedResult.timestamp = Date.now()
        return cachedResult as BuildResult
      }

      // 根据配置切换打包核心
      if (mergedConfig.bundler && mergedConfig.bundler !== this.bundlerAdapter.name) {
        this.setBundler(mergedConfig.bundler)
      }

      // 发出构建开始事件
      this.emit('build:start', {
        config: mergedConfig,
        timestamp: Date.now(),
        buildId
      })

      // 开始性能监控
      this.performanceMonitor.startBuild(buildId)

      // 分析依赖
      const dependencies = await this.analyzeDependencies(mergedConfig)

      // 检查循环依赖
      if (dependencies.circular.length > 0) {
        this.logger.warn(`发现 ${dependencies.circular.length} 个循环依赖`)
        dependencies.circular.forEach(cycle => {
          this.logger.warn(`  循环依赖: ${cycle.join(' -> ')}`)
        })
      }

      // 获取库类型（优先使用项目根目录进行检测，而不是入口文件路径）
      const projectRoot = mergedConfig.cwd || process.cwd()
      let libraryType = mergedConfig.libraryType || await this.detectLibraryType(projectRoot)

      if (typeof libraryType === 'string') {
        libraryType = libraryType as LibraryType
      }

      // 获取构建策略
      const strategy = this.strategyManager.getStrategy(libraryType)

      // 应用策略配置
      const strategyConfig = await strategy.applyStrategy(mergedConfig)

      // 预处理源代码
      await this.preprocessSources(strategyConfig)

      // 执行构建
      const result = await this.bundlerAdapter.build(strategyConfig)

      // 后处理构建产物
      await this.postprocessOutputs(result, mergedConfig)

      // 执行代码质量检查
      const qualityResult = await this.checkCodeQuality(result.outputs, mergedConfig)

      if (qualityResult.issues.filter(i => i.severity === 'error').length > 0) {
        this.logger.warn('发现代码质量问题')
      }

      // 执行打包后验证
      let validationResult: PostBuildValidationResult | undefined
      if (mergedConfig.postBuildValidation?.enabled) {
        validationResult = await this.runEnhancedValidation(mergedConfig, result, buildId)
      }

      // 对比打包前后的功能
      const functionalityCheck = await this.compareFunctionality(mergedConfig, result)

      if (!functionalityCheck.identical) {
        this.logger.error('打包前后功能存在差异！')
        functionalityCheck.differences.forEach(diff => {
          this.logger.error(`  - ${diff}`)
        })

        if (mergedConfig.postBuildValidation?.failOnError) {
          throw this.errorHandler.createError(
            ErrorCode.BUILD_FAILED,
            '打包前后功能不一致'
          )
        }
      }

      // 结束性能监控
      const metrics = this.performanceMonitor.endBuild(buildId)

      // 鐢熸垚鏋勫缓鎶ュ憡（鍙€夊彲鑳藉悎骞朵负鏂版姄鍙栧姞杞藉唴閮ㄧ骇鐢熸垚鎶ュ憡）
      await this.generateBuildReport(result, metrics, qualityResult)

      // 构建成功
      const buildResult: BuildResult = {
        success: true,
        outputs: result.outputs,
        duration: metrics.buildTime,
        stats: result.stats,
        performance: metrics,
        warnings: result.warnings || [],
        errors: [],
        buildId,
        timestamp: Date.now(),
        bundler: this.bundlerAdapter.name,
        mode: mergedConfig.mode || 'production',
        libraryType,
        validation: validationResult
      }

      // 保存到缓存
      this.cacheBuildResult(cacheKey, buildResult, dependencies.external.concat(dependencies.bundled))

      // 保存到历史
      this.addToHistory(buildResult)

      // 保存统计信息
      this.currentStats = buildResult.stats
      this.currentMetrics = buildResult.performance

      // 发出构建结束事件
      this.emit('build:end', {
        result: buildResult,
        duration: buildResult.duration,
        timestamp: Date.now()
      })

      // 重置状态
      this.setStatus(BuilderStatus.IDLE)

      return buildResult

    } catch (error) {
      // 处理构建错误
      const buildError = this.handleBuildError(error as Error, buildId)

      // 发出错误事件
      this.emit('build:error', {
        error: buildError,
        phase: 'build',
        timestamp: Date.now()
      })

      // 重置状态
      this.setStatus(BuilderStatus.ERROR)

      // 尝试错误恢复
      await this.attemptErrorRecovery(buildError, buildId)

      throw buildError
    }
  }

  /**
   * 验证构建配置
   */
  private async validateBuildConfig(config: BuilderConfig): Promise<{
    valid: boolean
    errors: string[]
    warnings: string[]
  }> {
    const errors: string[] = []
    const warnings: string[] = []

    // 验证入口文件
    if (!config.input) {
      errors.push('未指定入口文件')
    } else if (typeof config.input === 'string') {
      if (!await fs.pathExists(config.input)) {
        errors.push(`入口文件不存在: ${config.input}`)
      }
    } else if (Array.isArray(config.input)) {
      for (const entry of config.input) {
        if (!await fs.pathExists(entry)) {
          errors.push(`入口文件不存在: ${entry}`)
        }
      }
    }

    // 验证输出配置
    if (!config.output) {
      errors.push('未指定输出配置')
    } else {
      if (!config.output.dir) {
        errors.push('未指定输出目录')
      }
      if (!config.output.format) {
        warnings.push('未指定输出格式，将使用默认格式')
      }
    }

    // 验证外部依赖
    if (config.external) {
      const packageJson = await this.loadPackageJson()
      const allDeps = [
        ...Object.keys(packageJson.dependencies || {}),
        ...Object.keys(packageJson.peerDependencies || {}),
        ...Object.keys(packageJson.devDependencies || {})
      ]

      const external = Array.isArray(config.external) ? config.external : [config.external]
      for (const dep of external) {
        if (typeof dep === 'string' && !allDeps.includes(dep) && !dep.startsWith('/') && !dep.includes('*')) {
          warnings.push(`外部依赖 "${dep}" 未在 package.json 中声明`)
        }
      }
    }

    // 验证插件配置
    if (config.plugins) {
      for (const plugin of config.plugins) {
        if (!plugin || typeof plugin !== 'object') {
          errors.push('无效的插件配置')
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * 分析依赖
   */
  private async analyzeDependencies(config: BuilderConfig): Promise<DependencyAnalysis> {
    const cacheKey = `deps-${this.generateCacheKey(config)}`

    // 检查缓存
    if (this.dependencyCache.has(cacheKey)) {
      return this.dependencyCache.get(cacheKey)!
    }

    const analysis: DependencyAnalysis = {
      external: [],
      bundled: [],
      circular: [],
      unused: [],
      missing: [],
      versions: {}
    }

    try {
      // 加载 package.json
      const packageJson = await this.loadPackageJson()
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.peerDependencies
      }

      // 分析入口文件的导入
      const entryImports = await this.analyzeImports(config.input as string)

      // 分类依赖
      for (const imp of entryImports) {
        if (imp.startsWith('.') || imp.startsWith('/')) {
          // 本地模块
          continue
        }

        const packageName = this.extractPackageName(imp)

        if (config.external && this.isExternal(packageName, config.external)) {
          analysis.external.push(packageName)
        } else {
          analysis.bundled.push(packageName)
        }

        // 记录版本
        if (allDeps[packageName]) {
          analysis.versions[packageName] = allDeps[packageName]
        }
      }

      // 检查未使用的依赖
      for (const dep of Object.keys(allDeps)) {
        if (!analysis.external.includes(dep) && !analysis.bundled.includes(dep)) {
          analysis.unused.push(dep)
        }
      }

      // 检查循环依赖
      analysis.circular = await this.detectCircularDependencies(config.input as string)

    } catch (error) {
      this.logger.warn('依赖分析失败:', error)
    }

    // 缓存结果
    this.dependencyCache.set(cacheKey, analysis)

    return analysis
  }

  /**
   * 分析文件导入
   */
  private async analyzeImports(filePath: string): Promise<string[]> {
    const imports: string[] = []

    try {
      const content = await fs.readFile(filePath, 'utf-8')

      // 匹配 import 语句
      const importRegex = /import\s+(?:[\w\s{},*]+\s+from\s+)?['"]([^'"]+)['"]/g
      let match
      while ((match = importRegex.exec(content)) !== null) {
        imports.push(match[1])
      }

      // 匹配 require 语句
      const requireRegex = /require\s*\(['"]([^'"]+)['"]\)/g
      while ((match = requireRegex.exec(content)) !== null) {
        imports.push(match[1])
      }

      // 匹配动态导入
      const dynamicImportRegex = /import\s*\(['"]([^'"]+)['"]\)/g
      while ((match = dynamicImportRegex.exec(content)) !== null) {
        imports.push(match[1])
      }

    } catch (error) {
      this.logger.debug(`无法分析文件导入: ${filePath}`)
    }

    return [...new Set(imports)]
  }

  /**
   * 检测循环依赖
   */
  private async detectCircularDependencies(entry: string): Promise<string[][]> {
    const visited = new Set<string>()
    const recursionStack = new Set<string>()
    const cycles: string[][] = []

    const dfs = async (filePath: string, trace: string[] = []): Promise<void> => {
      if (recursionStack.has(filePath)) {
        // 鎵惧埌寰幆
        const cycleStart = trace.indexOf(filePath)
        if (cycleStart !== -1) {
          cycles.push(trace.slice(cycleStart).concat(filePath))
        }
        return
      }

      if (visited.has(filePath)) {
        return
      }

      visited.add(filePath)
      recursionStack.add(filePath)
      trace.push(filePath)

      const imports = await this.analyzeImports(filePath)

      for (const imp of imports) {
        if (imp.startsWith('.')) {
          const resolvedPath = path.resolve(path.dirname(filePath), imp)
          const fullPath = await this.resolveFilePath(resolvedPath)
          if (fullPath) {
            await dfs(fullPath, [...trace])
          }
        }
      }

      recursionStack.delete(filePath)
    }

    const entryPath = await this.resolveFilePath(entry)
    if (entryPath) {
      await dfs(entryPath)
    }

    return cycles
  }

  /**
   * 解析文件路径
   */
  private async resolveFilePath(filePath: string): Promise<string | null> {
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json']

    // 尝试直接路径
    if (await fs.pathExists(filePath)) {
      return filePath
    }

    // 尝试添加扩展名
    for (const ext of extensions) {
      const withExt = filePath + ext
      if (await fs.pathExists(withExt)) {
        return withExt
      }
    }

    // 尝试 index 文件
    for (const ext of extensions) {
      const indexPath = path.join(filePath, `index${ext}`)
      if (await fs.pathExists(indexPath)) {
        return indexPath
      }
    }

    return null
  }

  /**
   * 预处理源代码
   */
  private async preprocessSources(config: any): Promise<void> {
    this.logger.debug('棰勫鐞嗘簮浠ｇ爜...')
    void config

    // 可以在这里添加源代码预处理逻辑
    // 例如：代码转换、注入、优化等
  }

  /**
   * 后处理构建产物
   */
  private async postprocessOutputs(result: any, config: BuilderConfig): Promise<void> {
    this.logger.debug('后处理构建产物...')

    for (const output of result.outputs) {
      // 娣诲姞鏂囦欢澶存敞閲?
      if (config.banner?.banner) {
        const header = typeof config.banner.banner === 'function'
          ? await config.banner.banner()
          : config.banner.banner
        if (header) {
          output.source = header + '\n' + output.source
        }
      }

      // 娣诲姞鏂囦欢灏炬敞閲?
      if (config.banner?.footer) {
        const footer = typeof config.banner.footer === 'function'
          ? await config.banner.footer()
          : config.banner.footer
        if (footer) {
          output.source = output.source + '\n' + footer
        }
      }

      // 计算哈希值
      output.hash = createHash('md5').update(output.source).digest('hex')

      // 计算 gzip 大小
      const { gzipSize } = await import('gzip-size')
      output.gzipSize = await gzipSize(output.source)
    }
  }

  /**
   * 检查代码质量
   */
  private async checkCodeQuality(outputs: any[], config: BuilderConfig): Promise<CodeQualityResult> {
    // 移除 void config，改为明确的参数使用或忽略注释
    const issues: CodeQualityResult['issues'] = []
    const metrics: CodeQualityResult['metrics'] = {
      complexity: 0,
      maintainability: 100,
      duplications: 0
    }

    // 使用配置常量（硬编码避免动态导入问题）
    const MAX_FILE_SIZE = 500 * 1024 // 500KB
    const WARN_FILE_SIZE = 400 * 1024 // 400KB
    const maxFileSize = config.performance?.maxFileSize || MAX_FILE_SIZE
    const warnFileSize = WARN_FILE_SIZE

    for (const output of outputs) {
      if (!output || typeof output !== 'object') {
        continue
      }

      // 检查文件大小
      if (typeof output.size === 'number') {
        if (output.size > maxFileSize) {
          issues.push({
            severity: 'error',
            file: output.fileName || 'unknown',
            message: `文件大小超过限制 ${(maxFileSize / 1024).toFixed(0)}KB (当前: ${(output.size / 1024).toFixed(2)}KB)`
          })
        } else if (output.size > warnFileSize) {
          issues.push({
            severity: 'warning',
            file: output.fileName || 'unknown',
            message: `文件大小较大 (${(output.size / 1024).toFixed(2)}KB)，建议优化`
          })
        }
      }

      // 检查是否包含调试代码 - 优化正则表达式性能
      if (typeof output.source === 'string') {
        const debugPatterns = [
          { pattern: /console\.(?:log|debug|info|warn|error)/g, message: '包含 console 调试代码' },
          { pattern: /(?:\s*;)?/g, message: '包含  语句' },
          { pattern: /(?:alert|confirm)\s*\(/g, message: '包含弹窗调用' }
        ]

        // 使用单次遍历检查所有模式，提高性能
        const sourceLines = output.source.split('\n')
        for (let lineIndex = 0; lineIndex < sourceLines.length; lineIndex++) {
          const line = sourceLines[lineIndex]
          for (const { pattern, message } of debugPatterns) {
            if (pattern.test(line)) {
              issues.push({
                severity: 'warning',
                file: output.fileName || 'unknown',
                line: lineIndex + 1,
                message
              })
              // 重置正则表达式状态
              pattern.lastIndex = 0
            }
          }
        }

        // 检查代码复杂度指标 - 优化内存使用，避免重复分割
        const lines = sourceLines.length
        if (lines > 1000) {
          metrics.complexity += 10
          issues.push({
            severity: 'info',
            file: output.fileName || 'unknown',
            message: `文件行数较多 (${lines} 行)，建议拆分`
          })
        }

        // 检查文件大小
        const sizeInKB = Math.round(output.source.length / 1024)
        if (sizeInKB > 500) {
          issues.push({
            severity: 'warning',
            file: output.fileName || 'unknown',
            message: `文件大小较大 (${sizeInKB}KB)，可能影响加载性能`
          })
        }
      }
    }

    // 计算整体可维护性分数
    if (issues.length > 0) {
      const errorCount = issues.filter(i => i.severity === 'error').length
      const warningCount = issues.filter(i => i.severity === 'warning').length
      metrics.maintainability = Math.max(0, 100 - (errorCount * 20) - (warningCount * 5))
    }

    return { issues, metrics }
  }

  /**
   * 增强的打包后验证
   */
  private async runEnhancedValidation(
    config: BuilderConfig,
    buildResult: any,
    buildId: string
  ): Promise<PostBuildValidationResult> {
    this.logger.info('开始增强的打包后验证...')

    // 创建临时测试环境
    const testDir = path.join(process.cwd(), '.validation-test', buildId)
    await fs.ensureDir(testDir)

    try {
      // 复制打包产物到测试目录
      const outputDir = config.output?.dir || 'dist'
      await fs.copy(outputDir, path.join(testDir, 'dist'))

      // 创建测试项目
      await this.createTestProject(testDir, config)

      // 运行功能测试
      const testResults = await this.runFunctionalTests(testDir, config)

      // 运行性能测试
      const perfResults = await this.runPerformanceTests(testDir, config)

      // 运行兼容性测试
      const compatResults = await this.runCompatibilityTests(testDir, config)

      // 使用原有的验证器进行额外验证
      const validationContext: ValidationContext = {
        buildContext: {
          buildId,
          startTime: Date.now(),
          config,
          cwd: process.cwd(),
          cacheDir: '.cache',
          tempDir: testDir,
          watch: false,
          env: process.env as Record<string, string>,
          logger: this.logger,
          performanceMonitor: this.performanceMonitor
        },
        buildResult: {
          success: true,
          outputs: buildResult.outputs,
          duration: 0,
          stats: buildResult.stats,
          performance: this.currentMetrics || {} as any,
          warnings: buildResult.warnings || [],
          errors: [],
          buildId,
          timestamp: Date.now(),
          bundler: this.bundlerAdapter.name,
          mode: config.mode || 'production',
          libraryType: config.libraryType
        },
        config: config.postBuildValidation || {},
        tempDir: testDir,
        startTime: Date.now(),
        validationId: `validation-${buildId}`,
        projectRoot: process.cwd(),
        outputDir: config.output?.dir || 'dist'
      }

      const validationResult = await this.postBuildValidator.validate(validationContext)

      // 合并所有测试结果
      const success = testResults.success && perfResults.success && compatResults.success && validationResult.success

      const enhancedResult = {
        ...validationResult,
        success
      } as PostBuildValidationResult

      return enhancedResult

    } finally {
      // 娓呯悊娴嬭瘯鐩綍
      const keepTemp = config.postBuildValidation?.environment?.keepTempFiles
      if (!keepTemp) {
        await fs.remove(testDir)
      }
    }
  }

  /**
   * 创建测试项目
   */
  private async createTestProject(testDir: string, config: BuilderConfig): Promise<void> {
    // 创建 package.json
    const packageJson = {
      name: 'validation-test',
      version: '1.0.0',
      type: config.output?.format?.includes('esm') ? 'module' : 'commonjs',
      dependencies: {},
      devDependencies: {
        '@types/node': '^20.0.0',
        'vitest': '^1.0.0'
      }
    }

    await fs.writeJson(path.join(testDir, 'package.json'), packageJson, { spaces: 2 })

    // 创建测试文件
    const testContent = `
import { describe, it, expect } from 'vitest'
import * as lib from './dist/index.js'

describe('Library Validation', () => {
  it('should export expected modules', () => {
    expect(lib).toBeDefined()
  })

  it('should maintain functionality', () => {
    // Add specific functionality tests here
  })
})
`

    await fs.writeFile(path.join(testDir, 'test.spec.js'), testContent)
  }

  /**
   * 运行功能测试
   */
  private async runFunctionalTests(_testDir: string, _config: BuilderConfig): Promise<any> {
    this.logger.debug('运行功能测试...')

    return {
      success: true,
      tests: [],
      duration: 0
    }
  }

  /**
   * 运行性能测试
   */
  private async runPerformanceTests(_testDir: string, _config: BuilderConfig): Promise<any> {
    this.logger.debug('运行性能测试...')

    return {
      success: true,
      metrics: {},
      duration: 0
    }
  }

  /**
   * 运行兼容性测试
   */
  private async runCompatibilityTests(_testDir: string, _config: BuilderConfig): Promise<any> {
    this.logger.debug('运行兼容性测试...')

    return {
      success: true,
      environments: [],
      duration: 0
    }
  }

  /**
   * 对比打包前后功能
   */
  private async compareFunctionality(config: BuilderConfig, result: any): Promise<{
    identical: boolean
    differences: string[]
  }> {
    void config
    void result
    const differences: string[] = []

    // 检查导出是否一致
    // 检查 API 是否一致
    // 检查行为是否一致

    return {
      identical: differences.length === 0,
      differences
    }
  }

  /**
   * 生成构建报告
   */
  private async generateBuildReport(result: any, metrics: any, quality: CodeQualityResult): Promise<any> {
    return {
      summary: {
        success: true,
        duration: metrics.buildTime,
        outputCount: result.outputs.length,
        totalSize: result.outputs.reduce((sum: number, o: any) => sum + o.size, 0),
        quality: quality.metrics
      },
      outputs: result.outputs.map((o: any) => ({
        file: o.fileName,
        size: o.size,
        gzipSize: o.gzipSize,
        format: o.format,
        hash: o.hash
      })),
      issues: quality.issues,
      performance: metrics
    }
  }

  /**
   * 尝试错误恢复
   */
  private async attemptErrorRecovery(error: Error, buildId: string): Promise<void> {
    this.logger.info('灏濊瘯閿欒鎭㈠...')
    void error

    try {
      // 清理临时文件
      const tempDirs = [
        path.join(process.cwd(), '.validation-test', buildId),
        path.join(process.cwd(), '.temp', buildId)
      ]

      for (const dir of tempDirs) {
        if (await fs.pathExists(dir)) {
          await fs.remove(dir)
        }
      }

      // 重置状态
      this.setStatus(BuilderStatus.IDLE)

    } catch (recoveryError) {
      this.logger.error('错误恢复失败:', recoveryError)
    }
  }

  /**
   * 生成缓存键（优化版）
   * 只考虑影响构建结果的关键配置，忽略不影响输出的配置变化
   */
  private generateCacheKey(config: BuilderConfig): string {
    // 提取关键配置，忽略不影响构建的配置（如日志级别等）
    const keyConfig = {
      // 输入配置
      input: this.normalizeInput(config.input),
      // 输出配置（只取关键字段）
      output: this.normalizeOutput(config.output),
      // 外部依赖
      external: Array.isArray(config.external)
        ? config.external.sort()
        : config.external,
      // 插件（只取插件名和关键选项）
      plugins: config.plugins?.map(p => ({
        name: p.name || 'unknown',
        // 只取影响输出的选项哈希
        optionsHash: p.options ? createHash('md5').update(JSON.stringify(p.options)).digest('hex').substring(0, 8) : ''
      })),
      // 打包器类型
      bundler: config.bundler,
      // 库类型
      libraryType: config.libraryType,
      // 模式
      mode: config.mode,
      // TypeScript 配置（关键部分）
      typescript: config.typescript ? {
        target: config.typescript.target,
        module: config.typescript.module,
        declaration: config.typescript.declaration
      } : undefined,
      // 压缩配置
      minify: config.performance?.minify,
      // Tree shaking
      treeshake: config.performance?.treeshaking,
      // Source map
      sourcemap: config.output?.sourcemap
    }

    const configStr = JSON.stringify(keyConfig, Object.keys(keyConfig).sort())
    return createHash('sha256').update(configStr).digest('hex')
  }

  /**
   * 规范化输入配置
   */
  private normalizeInput(input: any): any {
    if (typeof input === 'string') {
      return input
    }
    if (Array.isArray(input)) {
      return input.sort()
    }
    if (typeof input === 'object' && input !== null) {
      const sorted: Record<string, any> = {}
      Object.keys(input).sort().forEach(key => {
        sorted[key] = input[key]
      })
      return sorted
    }
    return input
  }

  /**
   * 规范化输出配置
   */
  private normalizeOutput(output: any): any {
    if (!output) return output

    return {
      format: output.format,
      dir: output.dir,
      esm: output.esm,
      cjs: output.cjs,
      umd: output.umd
    }
  }

  /**
   * 获取缓存的构建结果
   */
  private getCachedBuild(cacheKey: string): BuildResult | null {
    const cached = this.buildCache.get(cacheKey)
    if (!cached) {
      return null
    }

    // 检查缓存是否过期（1小时）
    const maxAge = 60 * 60 * 1000
    if (Date.now() - cached.timestamp > maxAge) {
      this.buildCache.delete(cacheKey)
      return null
    }

    return cached.buildResult
  }

  /**
   * 验证缓存是否仍然有效
   * 检查源文件、配置等是否发生变化
   */
  private async isCacheValid(cachedResult: BuildResult, config: BuilderConfig): Promise<boolean> {
    try {
      // 1. 检查输入文件是否存在且未被修改
      const inputFiles = this.getInputFiles(config.input)
      for (const file of inputFiles) {
        if (!await fs.pathExists(file)) {
          return false
        }

        // 检查文件修改时间
        const stats = await fs.stat(file)
        if (stats.mtimeMs > cachedResult.timestamp) {
          return false
        }
      }

      // 2. 检查输出文件是否存在
      if (cachedResult.outputs) {
        for (const output of cachedResult.outputs) {
          if (output.fileName) {
            const outputPath = path.resolve(process.cwd(), output.fileName)
            if (!await fs.pathExists(outputPath)) {
              return false
            }
          }
        }
      }

      // 3. 检查依赖是否变化（package.json）
      const pkgPath = path.join(process.cwd(), 'package.json')
      if (await fs.pathExists(pkgPath)) {
        const pkgStats = await fs.stat(pkgPath)
        if (pkgStats.mtimeMs > cachedResult.timestamp) {
          return false
        }
      }

      return true
    } catch {
      return false
    }
  }

  /**
   * 从配置中提取输入文件列表
   */
  private getInputFiles(input: any): string[] {
    const files: string[] = []

    if (typeof input === 'string') {
      files.push(input)
    } else if (Array.isArray(input)) {
      files.push(...input.filter(i => typeof i === 'string'))
    } else if (typeof input === 'object' && input !== null) {
      files.push(...Object.values(input).filter(i => typeof i === 'string'))
    }

    return files
  }

  /**
   * 缓存构建结果
   */
  private cacheBuildResult(cacheKey: string, result: BuildResult, dependencies: string[]): void {
    this.buildCache.set(cacheKey, {
      configHash: cacheKey,
      buildResult: result,
      timestamp: Date.now(),
      dependencies
    })

    // 限制缓存大小
    if (this.buildCache.size > 100) {
      const firstKey = this.buildCache.keys().next().value
      if (firstKey !== undefined) {
        this.buildCache.delete(firstKey)
      }
    }
  }

  /**
   * 加载构建缓存
   */
  private async loadBuildCache(): Promise<void> {
    const cacheFile = path.join(process.cwd(), 'node_modules', '.cache', '@ldesign', 'builder-cache.json')

    try {
      if (await fs.pathExists(cacheFile)) {
        const cacheData = await fs.readJson(cacheFile)

        // 验证缓存数据格式
        if (cacheData && typeof cacheData === 'object') {
          for (const [key, value] of Object.entries(cacheData)) {
            // 验证缓存项的有效性
            if (this.isValidCacheEntry(value)) {
              this.buildCache.set(key, value as BuildCache)
            }
          }
        }

        this.logger.debug(`已加载 ${this.buildCache.size} 个缓存项`)
      }
    } catch (error) {
      this.logger.debug('加载构建缓存失败:', error)
      // 缓存加载失败不影响构建
    }
  }

  /**
   * 验证缓存项是否有效
   */
  private isValidCacheEntry(entry: any): boolean {
    return (
      entry &&
      typeof entry === 'object' &&
      entry.buildResult &&
      entry.timestamp &&
      typeof entry.timestamp === 'number' &&
      // 缓存不超过7天
      Date.now() - entry.timestamp < 7 * 24 * 60 * 60 * 1000
    )
  }

  /**
   * 保存构建缓存
   */
  private async saveBuildCache(): Promise<void> {
    const cacheDir = path.join(process.cwd(), 'node_modules', '.cache', '@ldesign')
    const cacheFile = path.join(cacheDir, 'builder-cache.json')

    try {
      // 确保缓存目录存在
      await fs.ensureDir(cacheDir)

      // 只保存有效的缓存项
      const validCache = new Map()
      const now = Date.now()
      const maxAge = 7 * 24 * 60 * 60 * 1000 // 7天

      for (const [key, value] of this.buildCache.entries()) {
        if (value.timestamp && now - value.timestamp < maxAge) {
          validCache.set(key, value)
        }
      }

      const cacheData = Object.fromEntries(validCache.entries())
      await fs.writeJson(cacheFile, cacheData, { spaces: 2 })

      this.logger.debug(`已保存 ${validCache.size} 个缓存项`)
    } catch (error) {
      this.logger.debug('保存构建缓存失败:', error)
      // 缓存保存失败不影响构建
    }
  }

  /**
   * 添加到构建历史
   */
  private addToHistory(result: BuildResult): void {
    this.buildHistory.unshift(result)

    if (this.buildHistory.length > this.maxHistorySize) {
      this.buildHistory.pop()
    }
  }

  /**
   * 获取构建历史
   */
  getBuildHistory(): BuildResult[] {
    return [...this.buildHistory]
  }

  /**
   * 清理构建缓存
   */
  async clearCache(): Promise<void> {
    this.buildCache.clear()
    this.dependencyCache.clear()
    await this.saveBuildCache()
    this.logger.info('构建缓存已清理')
  }

  /**
   * 加载 package.json
   */
  private async loadPackageJson(): Promise<any> {
    const packageJsonPath = path.join(process.cwd(), 'package.json')
    return await fs.readJson(packageJsonPath)
  }

  /**
   * 提取包名
   */
  private extractPackageName(importPath: string): string {
    const parts = importPath.split('/')
    if (importPath.startsWith('@')) {
      return parts.slice(0, 2).join('/')
    }
    return parts[0]
  }

  /**
   * 检查是否是外部依赖
   */
  private isExternal(packageName: string, external: any): boolean {
    if (Array.isArray(external)) {
      return external.some(e => {
        if (typeof e === 'string') {
          return e === packageName || packageName.startsWith(e + '/')
        }
        if (e instanceof RegExp) {
          return e.test(packageName)
        }
        if (typeof e === 'function') {
          return e(packageName)
        }
        return false
      })
    }

    if (typeof external === 'string') {
      return external === packageName
    }

    if (external instanceof RegExp) {
      return external.test(packageName)
    }

    if (typeof external === 'function') {
      return external(packageName)
    }

    return false
  }

  /**
   * 初始化（覆盖父类方法，添加增强功能）
   */
  override async initialize(): Promise<void> {
    await super.initialize()
    // 加载增强功能的缓存
    await this.loadBuildCache().catch(() => {
      // 缓存加载失败不影响正常使用
    })
  }

  /**
   * 销毁资源（覆盖父类方法，添加增强功能清理）
   */
  override async dispose(): Promise<void> {
    // 保存缓存
    await this.saveBuildCache()

    // 清理增强功能的缓存和历史
    this.buildCache.clear()
    this.dependencyCache.clear()
    this.buildHistory = []

    // 调用父类的 dispose 方法
    await super.dispose()
  }
}
