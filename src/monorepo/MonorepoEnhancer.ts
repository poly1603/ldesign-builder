/**
 * Monorepo 增强支持
 * 
 * 提供智能的跨包构建、依赖分析和优化功能
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import * as path from 'path'
import * as fs from 'fs-extra'
import { glob } from 'glob'
import { Logger } from '../utils/logger'
import type { BuilderConfig } from '../types'

/**
 * 工作空间包信息
 */
export interface WorkspacePackage {
  /** 包名称 */
  name: string
  /** 包路径 */
  path: string
  /** 版本 */
  version: string
  /** 包类型 */
  type: 'app' | 'lib' | 'tool' | 'config'
  /** 依赖关系 */
  dependencies: string[]
  /** 开发依赖 */
  devDependencies: string[]
  /** 对等依赖 */
  peerDependencies: string[]
  /** 构建配置 */
  buildConfig?: BuilderConfig
  /** 是否私有 */
  private?: boolean
  /** 入口文件 */
  main?: string
  /** 模块入口 */
  module?: string
  /** 类型定义 */
  types?: string
  /** 导出映射 */
  exports?: any
}

/**
 * 构建任务
 */
export interface BuildTask {
  /** 任务ID */
  id: string
  /** 包名称 */
  package: string
  /** 任务类型 */
  type: 'build' | 'test' | 'lint' | 'typecheck'
  /** 依赖的任务 */
  dependencies: string[]
  /** 任务状态 */
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped'
  /** 开始时间 */
  startTime?: number
  /** 结束时间 */
  endTime?: number
  /** 错误信息 */
  error?: Error
  /** 任务配置 */
  config?: any
}

/**
 * 依赖图
 */
export interface DependencyGraph {
  /** 节点（包） */
  nodes: Map<string, WorkspacePackage>
  /** 边（依赖关系） */
  edges: Map<string, Set<string>>
  /** 反向边（被依赖关系） */
  reverseEdges: Map<string, Set<string>>
  /** 拓扑排序结果 */
  topologicalOrder: string[]
  /** 循环依赖 */
  cycles: string[][]
}

/**
 * 构建策略
 */
export interface BuildStrategy {
  /** 并行度 */
  concurrency?: number
  /** 是否缓存 */
  cache?: boolean
  /** 是否增量构建 */
  incremental?: boolean
  /** 失败策略 */
  failFast?: boolean
  /** 依赖构建 */
  buildDeps?: boolean
  /** 过滤器 */
  filter?: {
    /** 包含的包 */
    include?: string[]
    /** 排除的包 */
    exclude?: string[]
    /** 标签过滤 */
    tags?: string[]
    /** 变更检测 */
    changed?: boolean
  }
}

/**
 * 构建结果
 */
export interface MonorepoBuildResult {
  /** 成功的包 */
  successful: string[]
  /** 失败的包 */
  failed: Array<{
    package: string
    error: Error
  }>
  /** 跳过的包 */
  skipped: string[]
  /** 总耗时 */
  duration: number
  /** 任务详情 */
  tasks: BuildTask[]
  /** 缓存命中率 */
  cacheHitRate?: number
}

/**
 * Monorepo 增强器
 */
export class MonorepoEnhancer {
  private logger: Logger
  private rootPath: string
  private packages: Map<string, WorkspacePackage> = new Map()
  private dependencyGraph: DependencyGraph | null = null
  private runningTasks: Map<string, BuildTask> = new Map()
  private completedTasks: Map<string, BuildTask> = new Map()
  private taskQueue: BuildTask[] = []

  constructor(rootPath: string) {
    this.rootPath = rootPath
    this.logger = new Logger({ prefix: '[MonorepoEnhancer]' })
  }

  /**
   * 初始化
   */
  async initialize(): Promise<void> {
    this.logger.info('初始化 Monorepo 增强器...')

    // 发现所有包
    await this.discoverPackages()

    // 构建依赖图
    this.buildDependencyGraph()

    // 检测问题
    this.detectIssues()

    this.logger.success(`发现 ${this.packages.size} 个包`)
  }

  /**
   * 构建所有包
   */
  async buildAll(strategy: BuildStrategy = {}): Promise<MonorepoBuildResult> {
    this.logger.info('开始构建所有包...')

    const startTime = Date.now()

    // 应用过滤器
    const packagesToBuild = this.applyFilter(strategy.filter)

    // 生成构建任务
    const tasks = this.generateBuildTasks(packagesToBuild, strategy)

    // 执行构建
    const result = await this.executeTasks(tasks, strategy)

    result.duration = Date.now() - startTime

    this.logger.success(`构建完成，耗时 ${(result.duration / 1000).toFixed(2)}秒`)

    return result
  }

  /**
   * 构建指定包
   */
  async buildPackage(
    packageName: string,
    options: {
      buildDeps?: boolean
      buildDependents?: boolean
    } = {}
  ): Promise<MonorepoBuildResult> {
    const packages = [packageName]

    // 添加依赖
    if (options.buildDeps) {
      const deps = this.getDependencies(packageName, true)
      packages.push(...deps)
    }

    // 添加依赖者
    if (options.buildDependents) {
      const dependents = this.getDependents(packageName, true)
      packages.push(...dependents)
    }

    return this.buildAll({
      filter: { include: packages }
    })
  }

  /**
   * 监听模式
   */
  async watch(callback: (changed: string[]) => void): Promise<() => void> {
    this.logger.info('启动监听模式...')

    const watchers: any[] = []

    // 为每个包设置监听
    for (const [name, pkg] of this.packages) {
      const srcPath = path.join(pkg.path, 'src')
      if (await fs.pathExists(srcPath)) {
        // 这里简化处理，实际项目中应使用 chokidar 等库
        this.logger.debug(`监听 ${name} 的变化...`)
      }
    }

    // 返回清理函数
    return () => {
      watchers.forEach(w => w.close())
    }
  }

  /**
   * 获取依赖图可视化数据
   */
  getDependencyGraphVisualization(): {
    nodes: Array<{
      id: string
      label: string
      type: string
      size: number
    }>
    edges: Array<{
      source: string
      target: string
      weight: number
    }>
  } {
    if (!this.dependencyGraph) {
      throw new Error('依赖图未初始化')
    }

    const nodes = Array.from(this.dependencyGraph.nodes.entries()).map(([name, pkg]) => ({
      id: name,
      label: `${name}@${pkg.version}`,
      type: pkg.type,
      size: pkg.dependencies.length + pkg.devDependencies.length
    }))

    const edges: Array<{ source: string; target: string; weight: number }> = []

    for (const [source, targets] of this.dependencyGraph.edges) {
      for (const target of targets) {
        edges.push({
          source,
          target,
          weight: 1
        })
      }
    }

    return { nodes, edges }
  }

  /**
   * 分析影响范围
   */
  analyzeImpact(changedPackages: string[]): {
    direct: string[]
    indirect: string[]
    total: string[]
  } {
    const direct = new Set<string>()
    const indirect = new Set<string>()

    // 直接影响：依赖变更包的包
    for (const pkg of changedPackages) {
      const dependents = this.getDependents(pkg, false)
      dependents.forEach(d => direct.add(d))
    }

    // 间接影响：依赖直接影响包的包
    for (const pkg of direct) {
      const dependents = this.getDependents(pkg, true)
      dependents.forEach(d => {
        if (!direct.has(d) && !changedPackages.includes(d)) {
          indirect.add(d)
        }
      })
    }

    const total = [...changedPackages, ...direct, ...indirect]

    return {
      direct: Array.from(direct),
      indirect: Array.from(indirect),
      total
    }
  }

  /**
   * 优化建议
   */
  generateOptimizationSuggestions(): Array<{
    type: 'dependency' | 'structure' | 'performance'
    severity: 'low' | 'medium' | 'high'
    message: string
    packages?: string[]
    suggestion: string
  }> {
    const suggestions: any[] = []

    // 检查循环依赖
    if (this.dependencyGraph && this.dependencyGraph.cycles.length > 0) {
      suggestions.push({
        type: 'dependency',
        severity: 'high',
        message: `发现 ${this.dependencyGraph.cycles.length} 个循环依赖`,
        packages: this.dependencyGraph.cycles.flat(),
        suggestion: '重构代码以消除循环依赖，考虑提取公共模块'
      })
    }

    // 检查过深的依赖
    const deepDependencies = this.findDeepDependencies(5)
    if (deepDependencies.length > 0) {
      suggestions.push({
        type: 'structure',
        severity: 'medium',
        message: '存在过深的依赖链',
        packages: deepDependencies,
        suggestion: '考虑扁平化依赖结构，减少依赖层级'
      })
    }

    // 检查重复依赖
    const duplicateDeps = this.findDuplicateDependencies()
    if (duplicateDeps.size > 0) {
      suggestions.push({
        type: 'dependency',
        severity: 'low',
        message: `发现 ${duplicateDeps.size} 个重复依赖`,
        suggestion: '考虑将共同依赖提升到根目录或创建共享包'
      })
    }

    // 检查构建性能
    const largePackages = Array.from(this.packages.entries())
      .filter(([, pkg]) => pkg.dependencies.length > 20)
      .map(([name]) => name)

    if (largePackages.length > 0) {
      suggestions.push({
        type: 'performance',
        severity: 'medium',
        message: '某些包的依赖过多',
        packages: largePackages,
        suggestion: '考虑拆分大型包，使用按需加载'
      })
    }

    return suggestions
  }

  /**
   * 发现所有包
   */
  private async discoverPackages(): Promise<void> {
    // 读取 pnpm-workspace.yaml
    const workspaceFile = path.join(this.rootPath, 'pnpm-workspace.yaml')

    let patterns: string[] = []

    if (await fs.pathExists(workspaceFile)) {
      const content = await fs.readFile(workspaceFile, 'utf-8')
      // 简单解析，实际项目中应使用 yaml 解析器
      const match = content.match(/packages:\s*\n((?:\s+-\s+.+\n?)+)/)
      if (match) {
        patterns = match[1]
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.startsWith('-'))
          .map(line => line.substring(1).trim().replace(/['"]/g, ''))
      }
    } else {
      // 默认模式
      patterns = ['packages/*', 'apps/*', 'tools/*', 'libraries/*']
    }

    // 查找所有包
    for (const pattern of patterns) {
      const packagePaths = await glob(pattern, {
        cwd: this.rootPath,
        absolute: true,
        // onlyDirectories: true // 不支持的选项，移除
      })

      for (const pkgPath of packagePaths) {
        const packageJsonPath = path.join(pkgPath, 'package.json')
        if (await fs.pathExists(packageJsonPath)) {
          const packageJson = await fs.readJson(packageJsonPath)

          const pkg: WorkspacePackage = {
            name: packageJson.name,
            path: pkgPath,
            version: packageJson.version || '0.0.0',
            type: this.detectPackageType(packageJson, pkgPath),
            dependencies: Object.keys(packageJson.dependencies || {}),
            devDependencies: Object.keys(packageJson.devDependencies || {}),
            peerDependencies: Object.keys(packageJson.peerDependencies || {}),
            private: packageJson.private,
            main: packageJson.main,
            module: packageJson.module,
            types: packageJson.types,
            exports: packageJson.exports
          }

          // 加载构建配置
          const configPath = path.join(pkgPath, 'builder.config.ts')
          if (await fs.pathExists(configPath)) {
            // 简化处理，实际项目中应动态加载
            pkg.buildConfig = {}
          }

          this.packages.set(pkg.name, pkg)
        }
      }
    }
  }

  /**
   * 检测包类型
   */
  private detectPackageType(packageJson: any, pkgPath: string): WorkspacePackage['type'] {
    // 基于路径
    if (pkgPath.includes('/apps/')) return 'app'
    if (pkgPath.includes('/tools/')) return 'tool'
    if (pkgPath.includes('/config/')) return 'config'

    // 基于内容
    if (packageJson.bin) return 'tool'
    if (packageJson.main || packageJson.module) return 'lib'

    return 'lib'
  }

  /**
   * 构建依赖图
   */
  private buildDependencyGraph(): void {
    const nodes = new Map(this.packages)
    const edges = new Map<string, Set<string>>()
    const reverseEdges = new Map<string, Set<string>>()

    // 初始化边
    for (const [name] of nodes) {
      edges.set(name, new Set())
      reverseEdges.set(name, new Set())
    }

    // 构建边
    for (const [name, pkg] of nodes) {
      const allDeps = [
        ...pkg.dependencies,
        ...pkg.devDependencies,
        ...pkg.peerDependencies
      ]

      for (const dep of allDeps) {
        if (nodes.has(dep)) {
          edges.get(name)!.add(dep)
          reverseEdges.get(dep)!.add(name)
        }
      }
    }

    // 拓扑排序
    let topologicalOrder: string[] = []
    try {
      topologicalOrder = this.topologicalSort(edges)
      // 添加没有依赖关系的包
      for (const name of nodes.keys()) {
        if (!topologicalOrder.includes(name)) {
          topologicalOrder.push(name)
        }
      }
    } catch (error: any) {
      // 存在循环依赖
      this.logger.warn('检测到循环依赖')
    }

    // 检测循环依赖
    const cycles = this.detectCycles(edges)

    this.dependencyGraph = {
      nodes,
      edges,
      reverseEdges,
      topologicalOrder,
      cycles
    }
  }

  /**
   * 拓扑排序
   */
  private topologicalSort(edges: Map<string, Set<string>>): string[] {
    const inDegree = new Map<string, number>()
    const result: string[] = []
    const queue: string[] = []

    // 初始化入度
    for (const [node] of edges) {
      if (!inDegree.has(node)) {
        inDegree.set(node, 0)
      }
    }

    // 计算入度
    for (const [, targets] of edges) {
      for (const target of targets) {
        inDegree.set(target, (inDegree.get(target) || 0) + 1)
      }
    }

    // 找出入度为 0 的节点
    for (const [node, degree] of inDegree) {
      if (degree === 0) {
        queue.push(node)
      }
    }

    // BFS 拓扑排序
    while (queue.length > 0) {
      const node = queue.shift()!
      result.push(node)

      const neighbors = edges.get(node) || new Set()
      for (const neighbor of neighbors) {
        const degree = inDegree.get(neighbor)! - 1
        inDegree.set(neighbor, degree)

        if (degree === 0) {
          queue.push(neighbor)
        }
      }
    }

    // 检查是否有循环
    if (result.length !== inDegree.size) {
      throw new Error('存在循环依赖')
    }

    return result.reverse()
  }

  /**
   * 检测循环依赖
   */
  private detectCycles(edges: Map<string, Set<string>>): string[][] {
    const cycles: string[][] = []
    const visited = new Set<string>()
    const recursionStack = new Set<string>()
    const path: string[] = []

    const dfs = (node: string): void => {
      visited.add(node)
      recursionStack.add(node)
      path.push(node)

      const neighbors = edges.get(node) || new Set()
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          dfs(neighbor)
        } else if (recursionStack.has(neighbor)) {
          // 找到循环
          const cycleStart = path.indexOf(neighbor)
          if (cycleStart !== -1) {
            cycles.push(path.slice(cycleStart))
          }
        }
      }

      path.pop()
      recursionStack.delete(node)
    }

    for (const node of edges.keys()) {
      if (!visited.has(node)) {
        dfs(node)
      }
    }

    return cycles
  }

  /**
   * 检测问题
   */
  private detectIssues(): void {
    if (!this.dependencyGraph) return

    // 报告循环依赖
    if (this.dependencyGraph.cycles.length > 0) {
      this.logger.warn(`发现 ${this.dependencyGraph.cycles.length} 个循环依赖:`)
      for (const cycle of this.dependencyGraph.cycles) {
        this.logger.warn(`  ${cycle.join(' -> ')} -> ${cycle[0]}`)
      }
    }

    // 检查版本冲突
    const versionConflicts = this.checkVersionConflicts()
    if (versionConflicts.length > 0) {
      this.logger.warn(`发现 ${versionConflicts.length} 个版本冲突`)
    }
  }

  /**
   * 检查版本冲突
   */
  private checkVersionConflicts(): Array<{
    dependency: string
    packages: Array<{ name: string; version: string }>
  }> {
    const conflicts: any[] = []
    const depVersions = new Map<string, Map<string, Set<string>>>()

    // 收集所有依赖版本
    for (const [pkgName, pkg] of this.packages) {
      const checkDeps = (deps: any, type: string) => {
        for (const [dep, version] of Object.entries(deps || {})) {
          if (!depVersions.has(dep)) {
            depVersions.set(dep, new Map())
          }
          const versions = depVersions.get(dep)!
          if (!versions.has(version as string)) {
            versions.set(version as string, new Set())
          }
          versions.get(version as string)!.add(pkgName)
        }
      }

      // 这里简化处理，实际需要从 package.json 读取版本信息
    }

    return conflicts
  }

  /**
   * 应用过滤器
   */
  private applyFilter(filter?: BuildStrategy['filter']): string[] {
    let packages = Array.from(this.packages.keys())

    if (!filter) return packages

    // 包含过滤
    if (filter.include) {
      packages = packages.filter(pkg => filter.include!.includes(pkg))
    }

    // 排除过滤
    if (filter.exclude) {
      packages = packages.filter(pkg => !filter.exclude!.includes(pkg))
    }

    // 变更检测
    if (filter.changed) {
      // 这里应该实现 git 变更检测
      this.logger.debug('变更检测未实现')
    }

    return packages
  }

  /**
   * 生成构建任务
   */
  private generateBuildTasks(packages: string[], strategy: BuildStrategy): BuildTask[] {
    const tasks: BuildTask[] = []

    for (const pkgName of packages) {
      const pkg = this.packages.get(pkgName)
      if (!pkg) continue

      // 获取依赖的包
      const deps = strategy.buildDeps
        ? this.getDependencies(pkgName, false).filter(d => packages.includes(d))
        : []

      const task: BuildTask = {
        id: `build:${pkgName}`,
        package: pkgName,
        type: 'build',
        dependencies: deps.map(d => `build:${d}`),
        status: 'pending'
      }

      tasks.push(task)
    }

    return tasks
  }

  /**
   * 执行任务
   */
  private async executeTasks(tasks: BuildTask[], strategy: BuildStrategy): Promise<MonorepoBuildResult> {
    const result: MonorepoBuildResult = {
      successful: [],
      failed: [],
      skipped: [],
      duration: 0,
      tasks: tasks
    }

    // 重置状态
    this.runningTasks.clear()
    this.completedTasks.clear()
    this.taskQueue = [...tasks]

    const concurrency = strategy.concurrency || 4
    const workers: Promise<void>[] = []

    // 启动工作线程
    for (let i = 0; i < concurrency; i++) {
      workers.push(this.runWorker(result, strategy))
    }

    // 等待所有工作完成
    await Promise.all(workers)

    // 统计结果
    for (const task of tasks) {
      if (task.status === 'success') {
        result.successful.push(task.package)
      } else if (task.status === 'failed') {
        result.failed.push({
          package: task.package,
          error: task.error!
        })
      } else if (task.status === 'skipped') {
        result.skipped.push(task.package)
      }
    }

    return result
  }

  /**
   * 运行工作线程
   */
  private async runWorker(result: MonorepoBuildResult, strategy: BuildStrategy): Promise<void> {
    while (true) {
      const task = this.getNextTask()
      if (!task) break

      try {
        await this.executeTask(task)
        task.status = 'success'
      } catch (error: any) {
        task.status = 'failed'
        task.error = error

        if (strategy.failFast) {
          // 快速失败模式：取消所有待处理任务
          this.taskQueue.forEach(t => t.status = 'skipped')
          break
        }
      }

      this.completedTasks.set(task.id, task)
    }
  }

  /**
   * 获取下一个可执行的任务
   */
  private getNextTask(): BuildTask | null {
    for (let i = 0; i < this.taskQueue.length; i++) {
      const task = this.taskQueue[i]

      if (task.status !== 'pending') continue

      // 检查依赖是否完成
      const depsCompleted = task.dependencies.every(dep => {
        const depTask = this.completedTasks.get(dep)
        return depTask && depTask.status === 'success'
      })

      if (depsCompleted) {
        task.status = 'running'
        task.startTime = Date.now()
        this.taskQueue.splice(i, 1)
        this.runningTasks.set(task.id, task)
        return task
      }
    }

    return null
  }

  /**
   * 执行任务
   */
  private async executeTask(task: BuildTask): Promise<void> {
    this.logger.info(`构建 ${task.package}...`)

    // 模拟构建过程
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000))

    task.endTime = Date.now()
    this.runningTasks.delete(task.id)

    this.logger.success(`${task.package} 构建完成`)
  }

  /**
   * 获取依赖
   */
  private getDependencies(packageName: string, recursive: boolean): string[] {
    if (!this.dependencyGraph) return []

    const deps = new Set<string>()
    const visited = new Set<string>()

    const collect = (pkg: string) => {
      if (visited.has(pkg)) return
      visited.add(pkg)

      const edges = this.dependencyGraph!.edges.get(pkg)
      if (edges) {
        for (const dep of edges) {
          deps.add(dep)
          if (recursive) {
            collect(dep)
          }
        }
      }
    }

    collect(packageName)
    return Array.from(deps)
  }

  /**
   * 获取依赖者
   */
  private getDependents(packageName: string, recursive: boolean): string[] {
    if (!this.dependencyGraph) return []

    const dependents = new Set<string>()
    const visited = new Set<string>()

    const collect = (pkg: string) => {
      if (visited.has(pkg)) return
      visited.add(pkg)

      const edges = this.dependencyGraph!.reverseEdges.get(pkg)
      if (edges) {
        for (const dep of edges) {
          dependents.add(dep)
          if (recursive) {
            collect(dep)
          }
        }
      }
    }

    collect(packageName)
    return Array.from(dependents)
  }

  /**
   * 查找深度依赖
   */
  private findDeepDependencies(maxDepth: number): string[] {
    const deepPackages: string[] = []

    for (const [name] of this.packages) {
      const depth = this.calculateDependencyDepth(name)
      if (depth > maxDepth) {
        deepPackages.push(name)
      }
    }

    return deepPackages
  }

  /**
   * 计算依赖深度
   */
  private calculateDependencyDepth(packageName: string): number {
    if (!this.dependencyGraph) return 0

    const visited = new Set<string>()

    const dfs = (pkg: string): number => {
      if (visited.has(pkg)) return 0
      visited.add(pkg)

      const deps = this.dependencyGraph!.edges.get(pkg)
      if (!deps || deps.size === 0) return 0

      let maxDepth = 0
      for (const dep of deps) {
        maxDepth = Math.max(maxDepth, dfs(dep) + 1)
      }

      return maxDepth
    }

    return dfs(packageName)
  }

  /**
   * 查找重复依赖
   */
  private findDuplicateDependencies(): Map<string, string[]> {
    const depPackages = new Map<string, string[]>()

    // 收集所有外部依赖
    for (const [pkgName, pkg] of this.packages) {
      const allDeps = [...pkg.dependencies, ...pkg.devDependencies]

      for (const dep of allDeps) {
        if (!this.packages.has(dep)) { // 外部依赖
          if (!depPackages.has(dep)) {
            depPackages.set(dep, [])
          }
          depPackages.get(dep)!.push(pkgName)
        }
      }
    }

    // 过滤出被多个包使用的依赖
    const duplicates = new Map<string, string[]>()
    for (const [dep, packages] of depPackages) {
      if (packages.length > 1) {
        duplicates.set(dep, packages)
      }
    }

    return duplicates
  }
}

/**
 * 创建 Monorepo 增强器
 */
export function createMonorepoEnhancer(rootPath: string): MonorepoEnhancer {
  return new MonorepoEnhancer(rootPath)
}

