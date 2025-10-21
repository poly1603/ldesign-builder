/**
 * 智能优化建议系统
 * 分析项目结构和配置，提供针对性的优化建议
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import type { BuilderConfig } from '../types/config'
import type { BuildResult } from '../types/builder'
import { Logger } from '../utils/logger'

/**
 * 优化建议
 */
export interface Suggestion {
  category: 'performance' | 'size' | 'maintainability' | 'compatibility'
  priority: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  impact: string
  solution: string
  estimatedImprovement?: string
  codeExample?: string
}

/**
 * 优化建议系统
 */
export class OptimizationAdvisor {
  private logger: Logger

  constructor(logger?: Logger) {
    this.logger = logger || new Logger({ prefix: 'Advisor' })
  }

  /**
   * 分析并生成建议
   */
  analyze(config: BuilderConfig, result?: BuildResult): Suggestion[] {
    const suggestions: Suggestion[] = []

    // 性能相关建议
    suggestions.push(...this.analyzePerformance(config, result))

    // 体积相关建议
    suggestions.push(...this.analyzeSize(config, result))

    // 可维护性建议
    suggestions.push(...this.analyzeMaintainability(config))

    // 兼容性建议
    suggestions.push(...this.analyzeCompatibility(config))

    // 按优先级排序
    return this.sortByPriority(suggestions)
  }

  /**
   * 性能分析
   */
  private analyzePerformance(config: BuilderConfig, result?: BuildResult): Suggestion[] {
    const suggestions: Suggestion[] = []

    // 缓存建议
    if (!config.cache || (config.cache as any).enabled === false) {
      suggestions.push({
        category: 'performance',
        priority: 'high',
        title: '启用构建缓存',
        description: '当前未启用缓存，重复构建无法加速',
        impact: '重复构建时间可减少 60-80%',
        solution: '在配置中添加 cache: { enabled: true }',
        estimatedImprovement: '60-80% 加速',
        codeExample: `export default defineConfig({
  cache: {
    enabled: true,
    dir: 'node_modules/.cache/@ldesign/builder'
  }
})`
      })
    }

    // Tree Shaking 建议
    if (config.performance?.treeshaking === false) {
      suggestions.push({
        category: 'performance',
        priority: 'high',
        title: '启用 Tree Shaking',
        description: 'Tree Shaking 可以移除未使用的代码',
        impact: '打包体积可减少 30-50%',
        solution: '启用 performance.treeshaking',
        estimatedImprovement: '30-50% 体积减小',
        codeExample: `export default defineConfig({
  performance: {
    treeshaking: true
  }
})`
      })
    }

    // 增量构建建议
    if (!(config as any).incremental?.enabled) {
      suggestions.push({
        category: 'performance',
        priority: 'medium',
        title: '启用增量构建',
        description: '增量构建只重新编译变更的文件',
        impact: '开发时构建速度可提升 70-80%',
        solution: '添加 incremental 配置',
        estimatedImprovement: '70-80% 加速（开发时）',
        codeExample: `export default defineConfig({
  incremental: {
    enabled: true
  }
})`
      })
    }

    // 构建时间分析
    if (result && result.duration > 30000) { // 超过 30 秒
      suggestions.push({
        category: 'performance',
        priority: 'high',
        title: '构建时间过长',
        description: `当前构建耗时 ${(result.duration / 1000).toFixed(2)}s`,
        impact: '影响开发效率',
        solution: '考虑启用缓存、增量构建，或使用 SWC 编译器',
        estimatedImprovement: '可降至 5-10 秒'
      })
    }

    return suggestions
  }

  /**
   * 体积分析
   */
  private analyzeSize(config: BuilderConfig, result?: BuildResult): Suggestion[] {
    const suggestions: Suggestion[] = []

    // 压缩建议
    if (config.performance?.minify === false && config.mode === 'production') {
      suggestions.push({
        category: 'size',
        priority: 'high',
        title: '生产环境启用压缩',
        description: '生产环境应该启用代码压缩',
        impact: '打包体积可减少 40-60%',
        solution: '启用 minify 选项',
        estimatedImprovement: '40-60% 体积减小',
        codeExample: `export default defineConfig({
  performance: {
    minify: true  // 或使用 mode: 'production' 自动启用
  }
})`
      })
    }

    // 外部依赖建议
    if (!config.external || (Array.isArray(config.external) && config.external.length === 0)) {
      suggestions.push({
        category: 'size',
        priority: 'medium',
        title: '配置外部依赖',
        description: '未配置 external，所有依赖都会被打包',
        impact: '打包体积可能过大',
        solution: '将 peerDependencies 配置为 external',
        codeExample: `export default defineConfig({
  external: ['vue', 'react', 'lodash']
})`
      })
    }

    // 体积检查
    if (result && result.stats?.totalSize?.raw > 1024 * 1024) { // > 1MB
      suggestions.push({
        category: 'size',
        priority: 'medium',
        title: '打包体积较大',
        description: `当前体积 ${(result.stats.totalSize.raw / 1024 / 1024).toFixed(2)} MB`,
        impact: '影响加载速度',
        solution: '考虑代码分割、移除未使用的依赖、启用压缩',
        estimatedImprovement: '可减小 30-50%'
      })
    }

    return suggestions
  }

  /**
   * 可维护性分析
   */
  private analyzeMaintainability(config: BuilderConfig): Suggestion[] {
    const suggestions: Suggestion[] = []

    // TypeScript 声明建议
    if (config.typescript?.declaration === false) {
      suggestions.push({
        category: 'maintainability',
        priority: 'medium',
        title: '生成类型声明文件',
        description: 'TypeScript 项目应该生成 .d.ts 文件',
        impact: '提升库的可用性和 IDE 支持',
        solution: '启用 typescript.declaration',
        codeExample: `export default defineConfig({
  typescript: {
    declaration: true,
    declarationMap: true
  }
})`
      })
    }

    // Source map 建议
    if (config.sourcemap === false) {
      suggestions.push({
        category: 'maintainability',
        priority: 'low',
        title: '生成 Source Maps',
        description: 'Source Maps 便于调试',
        impact: '提升调试体验',
        solution: '启用 sourcemap',
        codeExample: `export default defineConfig({
  sourcemap: true
})`
      })
    }

    return suggestions
  }

  /**
   * 兼容性分析
   */
  private analyzeCompatibility(config: BuilderConfig): Suggestion[] {
    const suggestions: Suggestion[] = []

    // 输出格式建议
    const formats = config.output?.format
    if (formats) {
      const formatArray = Array.isArray(formats) ? formats : [formats]
      
      if (!formatArray.includes('esm' as any)) {
        suggestions.push({
          category: 'compatibility',
          priority: 'medium',
          title: '添加 ESM 格式',
          description: 'ESM 是现代 JavaScript 的标准模块格式',
          impact: '提升与现代工具的兼容性',
          solution: '添加 ESM 格式输出',
          codeExample: `export default defineConfig({
  output: {
    format: ['esm', 'cjs']
  }
})`
        })
      }

      if (!formatArray.includes('cjs' as any)) {
        suggestions.push({
          category: 'compatibility',
          priority: 'low',
          title: '添加 CommonJS 格式',
          description: 'CommonJS 格式用于 Node.js 兼容',
          impact: '提升 Node.js 环境兼容性',
          solution: '添加 CJS 格式输出'
        })
      }
    }

    return suggestions
  }

  /**
   * 按优先级排序
   */
  private sortByPriority(suggestions: Suggestion[]): Suggestion[] {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    return suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
  }

  /**
   * 显示建议
   */
  displaySuggestions(suggestions: Suggestion[]): void {
    if (suggestions.length === 0) {
      this.logger.success('✅ 配置良好，无优化建议')
      return
    }

    this.logger.info(`💡 发现 ${suggestions.length} 条优化建议:\n`)

    for (const suggestion of suggestions) {
      const icon = suggestion.priority === 'critical' ? '🔴'
        : suggestion.priority === 'high' ? '🟠'
        : suggestion.priority === 'medium' ? '🟡'
        : '🟢'

      this.logger.info(`${icon} ${suggestion.title}`)
      this.logger.info(`   ${suggestion.description}`)
      this.logger.info(`   影响: ${suggestion.impact}`)
      this.logger.info(`   解决: ${suggestion.solution}`)
      
      if (suggestion.estimatedImprovement) {
        this.logger.info(`   预期: ${suggestion.estimatedImprovement}`)
      }
      
      this.logger.newLine()
    }
  }
}

/**
 * 创建优化建议系统
 */
export function createOptimizationAdvisor(logger?: Logger): OptimizationAdvisor {
  return new OptimizationAdvisor(logger)
}

