/**
 * 智能打包引擎选择器
 * 
 * 零配置自动选择最优打包引擎，基于：
 * - 项目类型检测（组件库、工具库、CLI）
 * - 框架检测（Vue、React、Svelte 等）
 * - 项目复杂度分析
 * - 依赖特征分析
 * - 运行环境检测
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import path from 'path'
import { Logger } from '../utils/logger'
import { exists, readFile, findFiles } from '../utils/file-system'
import type { BundlerType } from '../types/bundler'
import type { LibraryType } from '../types/library'

/**
 * 项目分析结果
 */
export interface ProjectAnalysis {
  /** 项目类型 */
  projectType: 'component-library' | 'utility-library' | 'cli-tool' | 'node-library' | 'style-library' | 'application'
  /** 框架类型 */
  framework: LibraryType | 'unknown'
  /** 主要语言 */
  language: 'typescript' | 'javascript' | 'mixed'
  /** 复杂度评分 (0-100) */
  complexity: number
  /** 文件统计 */
  fileStats: {
    total: number
    typescript: number
    javascript: number
    vue: number
    jsx: number
    tsx: number
    css: number
    less: number
    scss: number
  }
  /** 特性检测 */
  features: {
    hasDecorators: boolean
    hasJsx: boolean
    hasVueSfc: boolean
    hasCssModules: boolean
    hasMonorepo: boolean
    hasComplexPlugins: boolean
    needsTreeShaking: boolean
    needsCodeSplitting: boolean
  }
  /** 依赖信息 */
  dependencies: {
    total: number
    hasVue: boolean
    hasReact: boolean
    hasSvelte: boolean
    hasSolid: boolean
    hasLit: boolean
    hasAngular: boolean
  }
}

/**
 * 引擎推荐结果
 */
export interface BundlerRecommendation {
  /** 推荐的引擎 */
  bundler: BundlerType
  /** 推荐原因 */
  reason: string
  /** 置信度 (0-1) */
  confidence: number
  /** 备选方案 */
  alternatives: Array<{
    bundler: BundlerType
    reason: string
    score: number
  }>
  /** 项目分析结果 */
  analysis: ProjectAnalysis
}

/**
 * 引擎评分规则
 */
interface ScoringRule {
  condition: (analysis: ProjectAnalysis) => boolean
  bundler: BundlerType
  score: number
  reason: string
}

/**
 * 智能打包引擎选择器
 */
export class SmartBundlerSelector {
  private logger: Logger
  private projectPath: string

  constructor(projectPath: string = process.cwd(), logger?: Logger) {
    this.projectPath = projectPath
    this.logger = logger || new Logger({ prefix: '[SmartBundlerSelector]' })
  }

  /**
   * 自动选择最佳打包引擎
   */
  async selectBestBundler(): Promise<BundlerRecommendation> {
    this.logger.info('🔍 分析项目特征...')
    
    const analysis = await this.analyzeProject()
    
    this.logger.info('🧠 计算最佳引擎...')
    
    const recommendation = this.calculateBestBundler(analysis)
    
    this.logger.success(`✨ 推荐使用: ${recommendation.bundler} (${recommendation.reason})`)
    
    return recommendation
  }

  /**
   * 分析项目特征
   */
  async analyzeProject(): Promise<ProjectAnalysis> {
    const [
      fileStats,
      features,
      dependencies,
      projectType
    ] = await Promise.all([
      this.analyzeFiles(),
      this.analyzeFeatures(),
      this.analyzeDependencies(),
      this.detectProjectType()
    ])

    const framework = this.detectFramework(dependencies, fileStats)
    const language = this.detectLanguage(fileStats)
    const complexity = this.calculateComplexity(fileStats, features, dependencies)

    return {
      projectType,
      framework,
      language,
      complexity,
      fileStats,
      features,
      dependencies
    }
  }

  /**
   * 分析文件统计
   */
  private async analyzeFiles(): Promise<ProjectAnalysis['fileStats']> {
    const stats = {
      total: 0,
      typescript: 0,
      javascript: 0,
      vue: 0,
      jsx: 0,
      tsx: 0,
      css: 0,
      less: 0,
      scss: 0
    }

    try {
      const files = await findFiles(['src/**/*'], {
        cwd: this.projectPath,
        ignore: ['node_modules/**', 'dist/**', '**/*.test.*', '**/*.spec.*', '**/*.d.ts']
      })

      for (const file of files) {
        const ext = path.extname(file).toLowerCase()
        stats.total++

        switch (ext) {
          case '.ts': stats.typescript++; break
          case '.js': stats.javascript++; break
          case '.vue': stats.vue++; break
          case '.jsx': stats.jsx++; break
          case '.tsx': stats.tsx++; break
          case '.css': stats.css++; break
          case '.less': stats.less++; break
          case '.scss': case '.sass': stats.scss++; break
        }
      }
    } catch (error) {
      this.logger.debug('文件分析失败:', error)
    }

    return stats
  }

  /**
   * 分析项目特性
   */
  private async analyzeFeatures(): Promise<ProjectAnalysis['features']> {
    const features = {
      hasDecorators: false,
      hasJsx: false,
      hasVueSfc: false,
      hasCssModules: false,
      hasMonorepo: false,
      hasComplexPlugins: false,
      needsTreeShaking: true,
      needsCodeSplitting: false
    }

    try {
      // 检测装饰器
      const tsconfigPath = path.join(this.projectPath, 'tsconfig.json')
      if (await exists(tsconfigPath)) {
        const tsconfig = JSON.parse(await readFile(tsconfigPath, 'utf-8'))
        features.hasDecorators = tsconfig.compilerOptions?.experimentalDecorators === true
      }

      // 检测 Vue SFC
      const vueFiles = await findFiles(['src/**/*.vue'], {
        cwd: this.projectPath,
        ignore: ['node_modules/**']
      })
      features.hasVueSfc = vueFiles.length > 0

      // 检测 JSX/TSX
      const jsxFiles = await findFiles(['src/**/*.jsx', 'src/**/*.tsx'], {
        cwd: this.projectPath,
        ignore: ['node_modules/**']
      })
      features.hasJsx = jsxFiles.length > 0

      // 检测 CSS Modules
      const cssModuleFiles = await findFiles(['src/**/*.module.css', 'src/**/*.module.less', 'src/**/*.module.scss'], {
        cwd: this.projectPath,
        ignore: ['node_modules/**']
      })
      features.hasCssModules = cssModuleFiles.length > 0

      // 检测 Monorepo
      const monorepoIndicators = [
        'pnpm-workspace.yaml',
        'lerna.json',
        'nx.json',
        'rush.json'
      ]
      for (const indicator of monorepoIndicators) {
        if (await exists(path.join(this.projectPath, indicator))) {
          features.hasMonorepo = true
          break
        }
      }

      // 检测是否需要代码分割（多入口或动态导入）
      const srcFiles = await findFiles(['src/**/*.{ts,tsx,js,jsx}'], {
        cwd: this.projectPath,
        ignore: ['node_modules/**']
      })
      
      for (const file of srcFiles.slice(0, 20)) { // 只检查前20个文件
        try {
          const content = await readFile(path.join(this.projectPath, file), 'utf-8')
          if (content.includes('import(') || content.includes('require.ensure')) {
            features.needsCodeSplitting = true
            break
          }
        } catch {}
      }

    } catch (error) {
      this.logger.debug('特性分析失败:', error)
    }

    return features
  }

  /**
   * 分析依赖
   */
  private async analyzeDependencies(): Promise<ProjectAnalysis['dependencies']> {
    const deps = {
      total: 0,
      hasVue: false,
      hasReact: false,
      hasSvelte: false,
      hasSolid: false,
      hasLit: false,
      hasAngular: false
    }

    try {
      const pkgPath = path.join(this.projectPath, 'package.json')
      if (await exists(pkgPath)) {
        const pkg = JSON.parse(await readFile(pkgPath, 'utf-8'))
        const allDeps = {
          ...pkg.dependencies,
          ...pkg.devDependencies,
          ...pkg.peerDependencies
        }

        deps.total = Object.keys(allDeps).length
        deps.hasVue = !!(allDeps.vue || allDeps['@vue/composition-api'])
        deps.hasReact = !!(allDeps.react || allDeps['react-dom'])
        deps.hasSvelte = !!allDeps.svelte
        deps.hasSolid = !!allDeps['solid-js']
        deps.hasLit = !!allDeps.lit
        deps.hasAngular = !!(allDeps['@angular/core'])
      }
    } catch (error) {
      this.logger.debug('依赖分析失败:', error)
    }

    return deps
  }

  /**
   * 检测项目类型
   */
  private async detectProjectType(): Promise<ProjectAnalysis['projectType']> {
    try {
      const pkgPath = path.join(this.projectPath, 'package.json')
      if (await exists(pkgPath)) {
        const pkg = JSON.parse(await readFile(pkgPath, 'utf-8'))

        // CLI 工具
        if (pkg.bin) {
          return 'cli-tool'
        }

        // Node 库
        if (pkg.engines?.node && !pkg.browser) {
          return 'node-library'
        }

        // 组件库
        const peerDeps = pkg.peerDependencies || {}
        if (peerDeps.vue || peerDeps.react || peerDeps['solid-js'] || peerDeps.svelte) {
          return 'component-library'
        }

        // 样式库
        if (pkg.style || pkg.sass) {
          return 'style-library'
        }
      }

      // 检测 src/components 目录
      if (await exists(path.join(this.projectPath, 'src/components'))) {
        return 'component-library'
      }

      return 'utility-library'
    } catch {
      return 'utility-library'
    }
  }

  /**
   * 检测框架
   */
  private detectFramework(
    deps: ProjectAnalysis['dependencies'],
    stats: ProjectAnalysis['fileStats']
  ): LibraryType | 'unknown' {
    if (stats.vue > 0 || deps.hasVue) return 'vue3' as LibraryType
    if (deps.hasReact) return 'react' as LibraryType
    if (deps.hasSvelte) return 'svelte' as LibraryType
    if (deps.hasSolid) return 'solid' as LibraryType
    if (deps.hasLit) return 'lit' as LibraryType
    if (deps.hasAngular) return 'angular' as LibraryType
    if (stats.typescript > 0 || stats.tsx > 0) return 'typescript' as LibraryType
    return 'unknown'
  }

  /**
   * 检测主要语言
   */
  private detectLanguage(stats: ProjectAnalysis['fileStats']): 'typescript' | 'javascript' | 'mixed' {
    const tsCount = stats.typescript + stats.tsx
    const jsCount = stats.javascript + stats.jsx

    if (tsCount > 0 && jsCount === 0) return 'typescript'
    if (jsCount > 0 && tsCount === 0) return 'javascript'
    return 'mixed'
  }

  /**
   * 计算复杂度评分
   */
  private calculateComplexity(
    stats: ProjectAnalysis['fileStats'],
    features: ProjectAnalysis['features'],
    deps: ProjectAnalysis['dependencies']
  ): number {
    let score = 0

    // 文件数量
    score += Math.min(stats.total / 10, 30)

    // 框架混合
    const frameworkCount = [deps.hasVue, deps.hasReact, deps.hasSvelte, deps.hasSolid].filter(Boolean).length
    score += frameworkCount * 15

    // 特性复杂度
    if (features.hasDecorators) score += 10
    if (features.hasCssModules) score += 5
    if (features.hasMonorepo) score += 20
    if (features.needsCodeSplitting) score += 10

    // 样式复杂度
    const styleCount = stats.css + stats.less + stats.scss
    if (styleCount > 20) score += 10

    return Math.min(score, 100)
  }

  /**
   * 计算最佳引擎
   */
  private calculateBestBundler(analysis: ProjectAnalysis): BundlerRecommendation {
    const scores: Record<BundlerType, { score: number; reasons: string[] }> = {
      'esbuild': { score: 0, reasons: [] },
      'swc': { score: 0, reasons: [] },
      'rollup': { score: 0, reasons: [] },
      'rolldown': { score: 0, reasons: [] },
      'vite': { score: 0, reasons: [] },
      'rspack': { score: 0, reasons: [] },
      'turbopack': { score: 0, reasons: [] },
      'webpack': { score: 0, reasons: [] },
      'parcel': { score: 0, reasons: [] }
    }

    // 评分规则
    const rules: ScoringRule[] = [
      // === esbuild 规则 ===
      {
        condition: (a) => a.projectType === 'utility-library' && a.language === 'typescript' && !a.features.hasDecorators,
        bundler: 'esbuild',
        score: 90,
        reason: '纯 TypeScript 工具库，极速构建'
      },
      {
        condition: (a) => a.projectType === 'cli-tool',
        bundler: 'esbuild',
        score: 85,
        reason: 'CLI 工具，快速打包'
      },
      {
        condition: (a) => a.complexity < 20 && !a.features.hasVueSfc,
        bundler: 'esbuild',
        score: 70,
        reason: '简单项目，esbuild 最快'
      },

      // === SWC 规则 ===
      {
        condition: (a) => a.language === 'typescript' && a.features.hasDecorators,
        bundler: 'swc',
        score: 85,
        reason: 'TypeScript + 装饰器，SWC 原生支持'
      },
      {
        condition: (a) => a.framework === 'react' && !a.features.hasVueSfc,
        bundler: 'swc',
        score: 80,
        reason: 'React 项目，SWC 快速转译'
      },
      {
        condition: (a) => a.projectType === 'node-library',
        bundler: 'swc',
        score: 75,
        reason: 'Node 库，SWC 转译效率高'
      },

      // === Rollup 规则 ===
      {
        condition: (a) => a.features.hasVueSfc,
        bundler: 'rollup',
        score: 90,
        reason: 'Vue SFC 组件库，Rollup 生态最完善'
      },
      {
        condition: (a) => a.projectType === 'component-library' && a.framework === 'vue3',
        bundler: 'rollup',
        score: 88,
        reason: 'Vue 组件库，Rollup 插件支持最好'
      },
      {
        condition: (a) => a.features.needsTreeShaking && a.complexity > 50,
        bundler: 'rollup',
        score: 75,
        reason: '需要 Tree-shaking，Rollup 效果最佳'
      },
      {
        condition: (a) => a.framework === 'svelte',
        bundler: 'rollup',
        score: 85,
        reason: 'Svelte 项目，Rollup 是官方推荐'
      },

      // === Rolldown 规则 ===
      {
        condition: (a) => a.complexity > 30 && a.complexity < 70 && !a.features.hasVueSfc,
        bundler: 'rolldown',
        score: 75,
        reason: '中等复杂度，Rolldown 兼容 Rollup 且更快'
      },
      {
        condition: (a) => a.projectType === 'utility-library' && a.fileStats.total > 50,
        bundler: 'rolldown',
        score: 70,
        reason: '大型工具库，Rolldown 性能优秀'
      },

      // === Vite 规则 ===
      {
        condition: (a) => a.projectType === 'application',
        bundler: 'vite',
        score: 85,
        reason: '应用项目，Vite 开发体验最佳'
      },
      {
        condition: (a) => a.framework === 'vue3' && a.projectType !== 'component-library',
        bundler: 'vite',
        score: 80,
        reason: 'Vue 3 项目，Vite 原生支持'
      },

      // === Rspack 规则 ===
      {
        condition: (a) => a.features.hasMonorepo && a.complexity > 60,
        bundler: 'rspack',
        score: 80,
        reason: 'Monorepo + 高复杂度，Rspack Webpack 兼容'
      },
      {
        condition: (a) => a.features.hasCssModules && a.complexity > 40,
        bundler: 'rspack',
        score: 70,
        reason: 'CSS Modules，Rspack 原生支持'
      },

      // === Turbopack 规则 ===
      {
        condition: (a) => a.features.needsCodeSplitting && a.fileStats.total > 100,
        bundler: 'turbopack',
        score: 70,
        reason: '大型项目 + 代码分割，Turbopack 增量构建快'
      }
    ]

    // 应用评分规则
    for (const rule of rules) {
      if (rule.condition(analysis)) {
        scores[rule.bundler].score += rule.score
        scores[rule.bundler].reasons.push(rule.reason)
      }
    }

    // 基础分数（确保可用引擎有基础分）
    const availableBundlers: BundlerType[] = ['rollup', 'esbuild', 'swc', 'rolldown', 'vite']
    for (const bundler of availableBundlers) {
      if (scores[bundler].score === 0) {
        scores[bundler].score = 10
        scores[bundler].reasons.push('可用的备选引擎')
      }
    }

    // 找到最高分
    let bestBundler: BundlerType = 'rollup'
    let bestScore = 0

    for (const [bundler, data] of Object.entries(scores)) {
      if (data.score > bestScore) {
        bestScore = data.score
        bestBundler = bundler as BundlerType
      }
    }

    // 构建备选方案
    const alternatives = Object.entries(scores)
      .filter(([bundler]) => bundler !== bestBundler)
      .filter(([_, data]) => data.score > 0)
      .sort((a, b) => b[1].score - a[1].score)
      .slice(0, 3)
      .map(([bundler, data]) => ({
        bundler: bundler as BundlerType,
        reason: data.reasons[0] || '备选引擎',
        score: data.score
      }))

    return {
      bundler: bestBundler,
      reason: scores[bestBundler].reasons[0] || '最佳匹配',
      confidence: Math.min(bestScore / 100, 1),
      alternatives,
      analysis
    }
  }

  /**
   * 快速检测（不进行完整分析）
   */
  async quickDetect(): Promise<BundlerType> {
    try {
      const pkgPath = path.join(this.projectPath, 'package.json')
      if (!await exists(pkgPath)) {
        return 'rollup' // 默认
      }

      const pkg = JSON.parse(await readFile(pkgPath, 'utf-8'))
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies }

      // CLI 工具 → esbuild
      if (pkg.bin) {
        return 'esbuild'
      }

      // Vue 项目 → rollup
      if (allDeps.vue || allDeps['@vue/composition-api']) {
        return 'rollup'
      }

      // React 项目 → swc
      if (allDeps.react) {
        return 'swc'
      }

      // Svelte → rollup
      if (allDeps.svelte) {
        return 'rollup'
      }

      // 纯 TypeScript → esbuild
      const tsconfigPath = path.join(this.projectPath, 'tsconfig.json')
      if (await exists(tsconfigPath)) {
        const tsconfig = JSON.parse(await readFile(tsconfigPath, 'utf-8'))
        if (!tsconfig.compilerOptions?.experimentalDecorators) {
          return 'esbuild'
        }
        return 'swc' // 有装饰器用 swc
      }

      return 'rollup'
    } catch {
      return 'rollup'
    }
  }
}

/**
 * 创建智能选择器
 */
export function createSmartBundlerSelector(projectPath?: string, logger?: Logger): SmartBundlerSelector {
  return new SmartBundlerSelector(projectPath, logger)
}

/**
 * 快速选择最佳引擎
 */
export async function selectBestBundler(projectPath?: string): Promise<BundlerType> {
  const selector = new SmartBundlerSelector(projectPath)
  return selector.quickDetect()
}

/**
 * 获取完整推荐
 */
export async function getBundlerRecommendation(projectPath?: string): Promise<BundlerRecommendation> {
  const selector = new SmartBundlerSelector(projectPath)
  return selector.selectBestBundler()
}
