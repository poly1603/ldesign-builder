/**
 * 库类型检测器
 * 
 * 负责自动检测项目的库类型
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import path from 'path'
import {
  LibraryType,
  LibraryDetectionResult
} from '../types/library'
import type { DetectionEvidence } from '../types/strategy'
import { LIBRARY_TYPE_PATTERNS, LIBRARY_TYPE_PRIORITY } from '../constants/library-types'
import { findFiles, exists, readFile } from '../utils/file-system'
import { Logger } from '../utils/logger'
import { ErrorHandler } from '../utils/error-handler'

/**
 * 库类型检测器选项
 */
export interface LibraryDetectorOptions {
  logger?: Logger
  confidence?: number
  cache?: boolean
}

/**
 * 库类型检测器类
 */
export class LibraryDetector {
  private logger: Logger
  private errorHandler: ErrorHandler
  private options: LibraryDetectorOptions

  constructor(options: LibraryDetectorOptions = {}) {
    this.options = {
      confidence: 0.6,
      cache: true,
      ...options
    }

    this.logger = options.logger || new Logger()
    this.errorHandler = new ErrorHandler({ logger: this.logger })
  }

  /**
   * 检测库类型
   */
  async detect(projectPath: string): Promise<LibraryDetectionResult> {
    try {
      this.logger.info(`开始检测项目类型: ${projectPath}`)

      const scores: Record<LibraryType, number> = {
        typescript: 0,
        style: 0,
        vue2: 0,
        vue3: 0,
        react: 0,
        svelte: 0,
        solid: 0,
        preact: 0,
        lit: 0,
        angular: 0,
        qwik: 0,
        mixed: 0
      }

      const evidence: Record<LibraryType, DetectionEvidence[]> = {
        typescript: [],
        style: [],
        vue2: [],
        vue3: [],
        react: [],
        svelte: [],
        solid: [],
        preact: [],
        lit: [],
        angular: [],
        qwik: [],
        mixed: []
      }

      // 检测文件模式
      await this.detectFilePatterns(projectPath, scores, evidence)

      // 检测依赖
      await this.detectDependencies(projectPath, scores, evidence)

      // 检测配置文件
      await this.detectConfigFiles(projectPath, scores, evidence)

      // 检测 package.json 字段
      await this.detectPackageJsonFields(projectPath, scores, evidence)

      // 如果检测到 .vue 文件，优先判定为 Vue 项目（根据依赖决定 2/3 版本），以确保无需额外配置也能正确处理 SFC
      try {
        const vueFiles = await findFiles(['src/**/*.vue', 'lib/**/*.vue', 'components/**/*.vue'], {
          cwd: projectPath,
          ignore: ['node_modules/**', 'dist/**', '**/*.test.*', '**/*.spec.*']
        })

        if (vueFiles.length > 0) {
          // 解析 package.json 以判断 Vue 主版本
          let vueMajor = 3
          try {
            const pkgPath = path.join(projectPath, 'package.json')
            if (await exists(pkgPath)) {
              const pkg = JSON.parse(await readFile(pkgPath, 'utf-8'))
              const allDeps = { ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies }
              const vueVer: string | undefined = allDeps?.vue
              if (typeof vueVer === 'string') {
                // 粗略解析主版本：匹配 ^3, ~3, 3., >=3 等
                if (/(^|[^\d])2(\D|$)/.test(vueVer)) vueMajor = 2
                else if (/(^|[^\d])3(\D|$)/.test(vueVer)) vueMajor = 3
              }
            }
          } catch { }

          const forcedType = vueMajor === 2 ? LibraryType.VUE2 : LibraryType.VUE3
          const forcedEvidence = [
            ...evidence[forcedType],
            {
              type: 'file',
              description: `检测到 ${vueFiles.length} 个 .vue 文件，优先判定为 ${forcedType}`,
              weight: 1,
              source: vueFiles.slice(0, 3).join(', ')
            }
          ] as DetectionEvidence[]

          const result: LibraryDetectionResult = {
            type: forcedType,
            confidence: 1,
            evidence: forcedEvidence
          }

          this.logger.success(`检测完成: ${forcedType} (置信度: 100.0%)`)
          return result
        }
      } catch (e) {
        this.logger.debug('Vue 文件快速检测失败，回退到评分机制:', e)
      }

      // 计算最终分数（常规路径）
      const finalScores = this.calculateFinalScores(scores)

      // 找到最高分的类型
      const detectedType = this.getBestMatch(finalScores)
      const confidence = finalScores[detectedType]

      const result: LibraryDetectionResult = {
        type: detectedType,
        confidence,
        evidence: evidence[detectedType]
      }

      this.logger.success(`检测完成: ${detectedType} (置信度: ${(confidence * 100).toFixed(1)}%)`)

      return result

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.logger.error(`项目类型检测失败: ${errorMessage}`)
      this.errorHandler.handle(error instanceof Error ? error : new Error(errorMessage), 'detect')

      // 返回默认结果，使用 Mixed 作为最安全的 fallback
      return {
        type: LibraryType.MIXED,  // 改为 Mixed，更兼容
        confidence: 0.1, // 降低置信度以反映检测失败
        evidence: [{
          type: 'error',
          description: `检测过程中发生错误: ${errorMessage}，使用 Mixed 策略作为安全后备`,
          weight: 0.1
        }]
      }
    }
  }

  /**
   * 分析源文件统计信息
   */
  private async analyzeSourceFiles(projectPath: string): Promise<{
    typescript: number
    tsx: number
    vue: number
    jsx: number
    css: number
    less: number
    scss: number
    sass: number
    total: number
  }> {
    const stats = {
      typescript: 0,
      tsx: 0,
      vue: 0,
      jsx: 0,
      css: 0,
      less: 0,
      scss: 0,
      sass: 0,
      total: 0
    }

    try {
      const allFiles = await findFiles(['src/**/*'], {
        cwd: projectPath,
        ignore: ['node_modules/**', 'dist/**', '**/*.test.*', '**/*.spec.*', '**/__tests__/**', '**/*.d.ts']
      })

      for (const file of allFiles) {
        const ext = path.extname(file).toLowerCase()
        stats.total++

        switch (ext) {
          case '.ts': stats.typescript++; break
          case '.tsx': stats.tsx++; break
          case '.vue': stats.vue++; break
          case '.jsx': stats.jsx++; break
          case '.css': stats.css++; break
          case '.less': stats.less++; break
          case '.scss': stats.scss++; break
          case '.sass': stats.sass++; break
        }
      }

      this.logger.debug('源文件统计:', stats)
    } catch (error) {
      this.logger.debug('源文件分析失败:', error)
    }

    return stats
  }

  /**
   * 检测文件模式
   */
  private async detectFilePatterns(
    projectPath: string,
    scores: Record<LibraryType, number>,
    evidence: Record<LibraryType, DetectionEvidence[]>
  ): Promise<void> {
    // 首先统计所有源文件类型
    const fileStats = await this.analyzeSourceFiles(projectPath)

    for (const [type, pattern] of Object.entries(LIBRARY_TYPE_PATTERNS)) {
      const libraryType = type as LibraryType

      try {
        const files = await findFiles([...pattern.files], {
          cwd: projectPath,
          ignore: ['node_modules/**', 'dist/**', 'build/**', 'es/**', 'lib/**', 'cjs/**', '**/*.test.*', '**/*.spec.*']
        })

        if (files.length > 0) {
          // 特殊处理样式库：只有当样式文件是主要文件时才判定为样式库
          if (libraryType === LibraryType.STYLE) {
            const tsFileCount = fileStats.typescript + fileStats.tsx
            const styleFileCount = fileStats.css + fileStats.less + fileStats.scss + fileStats.sass

            // 如果 TypeScript 文件数量 >= 样式文件数量，不判定为样式库
            if (tsFileCount >= styleFileCount) {
              this.logger.debug(`跳过样式库判定：TS文件(${tsFileCount}) >= 样式文件(${styleFileCount})`)
              continue
            }

            // 如果样式文件数量不足10个，也不判定为样式库（避免误判）
            if (styleFileCount < 10) {
              this.logger.debug(`跳过样式库判定：样式文件太少(${styleFileCount})`)
              continue
            }
          }

          // 智能评分：文件数量越多，置信度越高，但有上限
          const fileCountScore = Math.min(files.length * 0.08, 1)
          const score = fileCountScore * pattern.weight
          scores[libraryType] += score

          evidence[libraryType].push({
            type: 'file',
            description: `找到 ${files.length} 个 ${libraryType} 相关文件`,
            weight: score,
            source: files.slice(0, 3).join(', ') + (files.length > 3 ? ` ... (共 ${files.length} 个)` : '')
          })

          // 额外加分：如果检测到关键入口文件
          const hasMainEntry = files.some(f =>
            f.includes('src/index.') || f.includes('index.') || f.includes('main.')
          )
          if (hasMainEntry) {
            scores[libraryType] += 0.1
          }
        }
      } catch (error) {
        this.logger.debug(`检测 ${libraryType} 文件模式失败:`, error)
      }
    }
  }

  /**
   * 检测依赖
   */
  private async detectDependencies(
    projectPath: string,
    scores: Record<LibraryType, number>,
    evidence: Record<LibraryType, DetectionEvidence[]>
  ): Promise<void> {
    try {
      const packageJsonPath = path.join(projectPath, 'package.json')

      if (await exists(packageJsonPath)) {
        const packageContent = await readFile(packageJsonPath, 'utf-8')
        const packageJson = JSON.parse(packageContent)

        const allDeps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
          ...packageJson.peerDependencies
        }

        for (const [type, pattern] of Object.entries(LIBRARY_TYPE_PATTERNS)) {
          const libraryType = type as LibraryType
          const matchedDeps: string[] = []

          // 检测依赖时，同时检查 dependencies 和 devDependencies
          const patternWithDevDeps = pattern as any
          const depsToCheck = [...pattern.dependencies, ...(patternWithDevDeps.devDependencies || [])]

          for (const dep of depsToCheck) {
            if (this.matchDependency(dep, allDeps)) {
              matchedDeps.push(dep)
            }
          }

          if (matchedDeps.length > 0) {
            // 如果匹配到核心依赖，给予更高的权重
            const coreDepMatched = pattern.dependencies.some(dep =>
              this.matchDependency(dep, allDeps)
            )
            const weightMultiplier = coreDepMatched ? 1.0 : 0.7

            const baseScore = Math.min(matchedDeps.length / Math.max(depsToCheck.length, 1), 1)
            const score = baseScore * pattern.weight * 0.8 * weightMultiplier
            scores[libraryType] += score

            evidence[libraryType].push({
              type: 'dependency',
              description: `找到相关依赖: ${matchedDeps.slice(0, 5).join(', ')}${matchedDeps.length > 5 ? '...' : ''}`,
              weight: score,
              source: 'package.json'
            })
          }
        }
      }
    } catch (error) {
      this.logger.debug('检测依赖失败:', error)
    }
  }

  /**
   * 检测配置文件
   */
  private async detectConfigFiles(
    projectPath: string,
    scores: Record<LibraryType, number>,
    evidence: Record<LibraryType, DetectionEvidence[]>
  ): Promise<void> {
    for (const [type, pattern] of Object.entries(LIBRARY_TYPE_PATTERNS)) {
      const libraryType = type as LibraryType
      const foundConfigs: string[] = []

      for (const configFile of pattern.configs) {
        const configPath = path.join(projectPath, configFile)

        if (await exists(configPath)) {
          foundConfigs.push(configFile)
        }
      }

      if (foundConfigs.length > 0) {
        const score = (foundConfigs.length / pattern.configs.length) * pattern.weight * 0.6
        scores[libraryType] += score

        evidence[libraryType].push({
          type: 'config',
          description: `找到配置文件: ${foundConfigs.join(', ')}`,
          weight: score,
          source: foundConfigs.join(', ')
        })
      }
    }
  }

  /**
   * 检测 package.json 字段
   */
  private async detectPackageJsonFields(
    projectPath: string,
    scores: Record<LibraryType, number>,
    evidence: Record<LibraryType, DetectionEvidence[]>
  ): Promise<void> {
    try {
      const packageJsonPath = path.join(projectPath, 'package.json')

      if (await exists(packageJsonPath)) {
        const packageContent = await readFile(packageJsonPath, 'utf-8')
        const packageJson = JSON.parse(packageContent)

        for (const [type, pattern] of Object.entries(LIBRARY_TYPE_PATTERNS)) {
          const libraryType = type as LibraryType
          const foundFields: string[] = []

          for (const field of pattern.packageJsonFields) {
            if (packageJson[field]) {
              foundFields.push(field)
            }
          }

          if (foundFields.length > 0) {
            const score = (foundFields.length / pattern.packageJsonFields.length) * pattern.weight * 0.4
            scores[libraryType] += score

            evidence[libraryType].push({
              type: 'config',
              description: `找到 package.json 字段: ${foundFields.join(', ')}`,
              weight: score,
              source: 'package.json'
            })
          }
        }
      }
    } catch (error) {
      this.logger.debug('检测 package.json 字段失败:', error)
    }
  }

  /**
   * 计算最终分数
   */
  private calculateFinalScores(scores: Record<LibraryType, number>): Record<LibraryType, number> {
    const finalScores: Record<LibraryType, number> = { ...scores }

    // 应用优先级权重
    for (const [type, priority] of Object.entries(LIBRARY_TYPE_PRIORITY)) {
      const libraryType = type as LibraryType
      finalScores[libraryType] *= (priority / 10)
    }

    // 归一化分数
    const maxScore = Math.max(...Object.values(finalScores))
    if (maxScore > 0) {
      for (const type of Object.keys(finalScores) as LibraryType[]) {
        finalScores[type] = Math.min(finalScores[type] / maxScore, 1)
      }
    }

    return finalScores
  }

  /**
   * 获取最佳匹配
   */
  private getBestMatch(scores: Record<LibraryType, number>): LibraryType {
    let bestType: LibraryType = LibraryType.TYPESCRIPT
    let bestScore = 0

    for (const [type, score] of Object.entries(scores)) {
      if (score > bestScore) {
        bestScore = score
        bestType = type as LibraryType
      }
    }

    // 如果最高分数低于阈值，返回默认类型
    if (bestScore < this.options.confidence!) {
      return LibraryType.MIXED
    }

    return bestType
  }

  /**
   * 匹配依赖
   */
  private matchDependency(pattern: string, dependencies: Record<string, string>): boolean {
    // 支持版本范围匹配
    if (pattern.includes('@')) {
      const [name, version] = pattern.split('@')
      return !!(dependencies[name] && dependencies[name].includes(version))
    }

    return !!dependencies[pattern]
  }

  /**
   * 检测 Monorepo 结构
   */
  async detectMonorepo(projectPath: string): Promise<{
    isMonorepo: boolean
    type?: 'pnpm' | 'lerna' | 'nx' | 'yarn' | 'rush'
    workspaces?: string[]
  }> {
    try {
      // 检测 pnpm workspace
      const pnpmWorkspace = path.join(projectPath, 'pnpm-workspace.yaml')
      if (await exists(pnpmWorkspace)) {
        return { isMonorepo: true, type: 'pnpm' }
      }

      // 检测 lerna
      const lernaJson = path.join(projectPath, 'lerna.json')
      if (await exists(lernaJson)) {
        return { isMonorepo: true, type: 'lerna' }
      }

      // 检测 nx
      const nxJson = path.join(projectPath, 'nx.json')
      if (await exists(nxJson)) {
        return { isMonorepo: true, type: 'nx' }
      }

      // 检测 rush
      const rushJson = path.join(projectPath, 'rush.json')
      if (await exists(rushJson)) {
        return { isMonorepo: true, type: 'rush' }
      }

      // 检测 yarn workspaces
      const packageJsonPath = path.join(projectPath, 'package.json')
      if (await exists(packageJsonPath)) {
        const content = await readFile(packageJsonPath, 'utf-8')
        const packageJson = JSON.parse(content)
        if (packageJson.workspaces) {
          return {
            isMonorepo: true,
            type: 'yarn',
            workspaces: Array.isArray(packageJson.workspaces)
              ? packageJson.workspaces
              : packageJson.workspaces.packages || []
          }
        }
      }

      return { isMonorepo: false }
    } catch (error) {
      this.logger.debug('Monorepo 检测失败:', error)
      return { isMonorepo: false }
    }
  }

  /**
   * 推断项目类型（组件库、工具库、CLI等）
   */
  async inferProjectCategory(projectPath: string): Promise<
    'component-library' | 'utility-library' | 'cli-tool' | 'node-library' | 'style-library' | 'mixed'
  > {
    try {
      const packageJsonPath = path.join(projectPath, 'package.json')
      if (await exists(packageJsonPath)) {
        const content = await readFile(packageJsonPath, 'utf-8')
        const packageJson = JSON.parse(content)

        // CLI 工具检测
        if (packageJson.bin) {
          return 'cli-tool'
        }

        // Node 库检测（有 engines.node 声明）
        if (packageJson.engines?.node) {
          return 'node-library'
        }

        // 组件库检测（有 peerDependencies 中包含框架）
        // 优先检测组件库，避免误判为样式库
        const peerDeps = packageJson.peerDependencies || {}
        if (peerDeps.vue || peerDeps.react || peerDeps['solid-js'] || peerDeps.svelte) {
          return 'component-library'
        }

        // TypeScript/工具库检测 - 在样式库之前检测
        // 如果有 types/typings 字段或主要是 .ts 文件，优先判定为工具库
        if (packageJson.types || packageJson.typings || packageJson.main?.endsWith('.ts')) {
          // 检查是否有TypeScript源文件
          try {
            const tsFiles = await findFiles(['src/**/*.ts', 'src/**/*.tsx'], {
              cwd: projectPath,
              ignore: ['node_modules/**', 'dist/**', '**/*.test.*', '**/*.spec.*', '**/*.d.ts']
            })

            if (tsFiles.length > 0) {
              return 'utility-library'
            }
          } catch { }
        }

        // 样式库检测 - 放到最后，避免误判
        // 只有在 package.json 中明确声明 style/sass/less 字段，且没有其他明显特征时才判定为样式库
        if (packageJson.style || packageJson.sass) {
          // 再检查是否真的主要是样式文件
          try {
            const styleFiles = await findFiles(['src/**/*.css', 'src/**/*.less', 'src/**/*.scss'], {
              cwd: projectPath,
              ignore: ['node_modules/**', 'dist/**']
            })
            const tsFiles = await findFiles(['src/**/*.ts', 'src/**/*.tsx'], {
              cwd: projectPath,
              ignore: ['node_modules/**', 'dist/**', '**/*.d.ts']
            })

            // 只有当样式文件数量远多于TS文件时才判定为样式库
            if (styleFiles.length > tsFiles.length * 2) {
              return 'style-library'
            }
          } catch { }
        }
      }

      // 基于文件结构判断
      const componentsDir = path.join(projectPath, 'src/components')
      if (await exists(componentsDir)) {
        return 'component-library'
      }

      return 'utility-library'
    } catch (error) {
      this.logger.debug('项目类型推断失败:', error)
      return 'mixed'
    }
  }
}
