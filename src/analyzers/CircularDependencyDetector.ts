/**
 * 循环依赖检测器
 * 
 * 检测项目中的循环导入问题
 */

import { resolve, join, dirname, extname, relative } from 'path'
import { existsSync, readFileSync, readdirSync, statSync } from 'fs'

// ========== 类型定义 ==========

export interface ImportInfo {
  source: string
  target: string
  line: number
  importType: 'import' | 'require' | 'dynamic'
}

export interface CircularDependency {
  cycle: string[]
  files: string[]
  severity: 'error' | 'warning'
}

export interface DependencyGraph {
  nodes: string[]
  edges: ImportInfo[]
  circular: CircularDependency[]
}

export interface DetectionOptions {
  include?: string[]
  exclude?: string[]
  extensions?: string[]
  aliases?: Record<string, string>
  maxDepth?: number
}

// ========== 循环依赖检测器类 ==========

export class CircularDependencyDetector {
  private projectPath: string
  private options: DetectionOptions
  private graph: Map<string, Set<string>> = new Map()
  private imports: Map<string, ImportInfo[]> = new Map()
  private visited: Set<string> = new Set()
  private cycles: CircularDependency[] = []

  constructor(projectPath: string, options: DetectionOptions = {}) {
    this.projectPath = projectPath
    this.options = {
      include: ['src'],
      exclude: ['node_modules', 'dist', 'es', 'lib', '__tests__', '*.test.*', '*.spec.*'],
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.vue', '.svelte'],
      maxDepth: 100,
      ...options
    }
  }

  /**
   * 运行检测
   */
  detect(): DependencyGraph {
    this.graph.clear()
    this.imports.clear()
    this.visited.clear()
    this.cycles = []

    // 扫描所有文件
    for (const dir of this.options.include || ['src']) {
      const dirPath = resolve(this.projectPath, dir)
      if (existsSync(dirPath)) {
        this.scanDirectory(dirPath)
      }
    }

    // 检测循环
    this.detectCycles()

    return {
      nodes: Array.from(this.graph.keys()),
      edges: Array.from(this.imports.values()).flat(),
      circular: this.cycles
    }
  }

  /**
   * 扫描目录
   */
  private scanDirectory(dirPath: string, depth = 0): void {
    if (depth > (this.options.maxDepth || 100)) return

    try {
      const items = readdirSync(dirPath)

      for (const item of items) {
        const itemPath = join(dirPath, item)
        
        // 检查排除规则
        if (this.isExcluded(itemPath)) continue

        const stat = statSync(itemPath)

        if (stat.isDirectory()) {
          this.scanDirectory(itemPath, depth + 1)
        } else if (stat.isFile()) {
          const ext = extname(item)
          if (this.options.extensions?.includes(ext)) {
            this.analyzeFile(itemPath)
          }
        }
      }
    } catch {}
  }

  /**
   * 检查是否排除
   */
  private isExcluded(filePath: string): boolean {
    const relativePath = relative(this.projectPath, filePath)
    
    for (const pattern of this.options.exclude || []) {
      if (pattern.includes('*')) {
        // 简单的通配符匹配
        const regex = new RegExp(pattern.replace(/\*/g, '.*'))
        if (regex.test(relativePath)) return true
      } else {
        if (relativePath.includes(pattern)) return true
      }
    }
    
    return false
  }

  /**
   * 分析文件
   */
  private analyzeFile(filePath: string): void {
    const relativePath = relative(this.projectPath, filePath)
    
    if (!this.graph.has(relativePath)) {
      this.graph.set(relativePath, new Set())
      this.imports.set(relativePath, [])
    }

    try {
      const content = readFileSync(filePath, 'utf-8')
      const imports = this.extractImports(content, filePath)

      for (const imp of imports) {
        const resolvedPath = this.resolveImport(imp.target, filePath)
        
        if (resolvedPath) {
          const relativeResolved = relative(this.projectPath, resolvedPath)
          this.graph.get(relativePath)!.add(relativeResolved)
          
          this.imports.get(relativePath)!.push({
            source: relativePath,
            target: relativeResolved,
            line: imp.line,
            importType: imp.importType
          })
        }
      }
    } catch {}
  }

  /**
   * 提取导入语句
   */
  private extractImports(content: string, filePath: string): Array<{ target: string; line: number; importType: 'import' | 'require' | 'dynamic' }> {
    const imports: Array<{ target: string; line: number; importType: 'import' | 'require' | 'dynamic' }> = []
    const lines = content.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // ES import
      const importMatch = line.match(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/i)
      if (importMatch) {
        imports.push({ target: importMatch[1], line: i + 1, importType: 'import' })
        continue
      }

      // ES import (仅副作用)
      const sideEffectMatch = line.match(/import\s+['"]([^'"]+)['"]/i)
      if (sideEffectMatch) {
        imports.push({ target: sideEffectMatch[1], line: i + 1, importType: 'import' })
        continue
      }

      // ES export from
      const exportMatch = line.match(/export\s+.*?\s+from\s+['"]([^'"]+)['"]/i)
      if (exportMatch) {
        imports.push({ target: exportMatch[1], line: i + 1, importType: 'import' })
        continue
      }

      // CommonJS require
      const requireMatch = line.match(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/i)
      if (requireMatch) {
        imports.push({ target: requireMatch[1], line: i + 1, importType: 'require' })
        continue
      }

      // Dynamic import
      const dynamicMatch = line.match(/import\s*\(\s*['"]([^'"]+)['"]\s*\)/i)
      if (dynamicMatch) {
        imports.push({ target: dynamicMatch[1], line: i + 1, importType: 'dynamic' })
        continue
      }
    }

    return imports
  }

  /**
   * 解析导入路径
   */
  private resolveImport(importPath: string, fromFile: string): string | null {
    // 跳过 node_modules
    if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
      // 检查别名
      for (const [alias, target] of Object.entries(this.options.aliases || {})) {
        if (importPath === alias || importPath.startsWith(alias + '/')) {
          importPath = importPath.replace(alias, target)
          break
        }
      }
      
      if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
        return null
      }
    }

    const fromDir = dirname(fromFile)
    let resolved = resolve(fromDir, importPath)

    // 尝试不同的扩展名
    for (const ext of ['', ...this.options.extensions || []]) {
      const withExt = resolved + ext
      if (existsSync(withExt) && statSync(withExt).isFile()) {
        return withExt
      }
    }

    // 尝试 index 文件
    for (const ext of this.options.extensions || []) {
      const indexFile = join(resolved, `index${ext}`)
      if (existsSync(indexFile)) {
        return indexFile
      }
    }

    return null
  }

  /**
   * 检测循环依赖
   */
  private detectCycles(): void {
    const visited = new Set<string>()
    const recursionStack = new Set<string>()
    const path: string[] = []

    const dfs = (node: string): void => {
      visited.add(node)
      recursionStack.add(node)
      path.push(node)

      const neighbors = this.graph.get(node) || new Set()
      
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          dfs(neighbor)
        } else if (recursionStack.has(neighbor)) {
          // 发现循环
          const cycleStart = path.indexOf(neighbor)
          const cycle = path.slice(cycleStart)
          cycle.push(neighbor) // 闭合循环
          
          // 检查是否已记录
          const cycleKey = [...cycle].sort().join('|')
          const exists = this.cycles.some(c => 
            [...c.cycle].sort().join('|') === cycleKey
          )
          
          if (!exists) {
            this.cycles.push({
              cycle,
              files: cycle.slice(0, -1),
              severity: cycle.length <= 3 ? 'error' : 'warning'
            })
          }
        }
      }

      path.pop()
      recursionStack.delete(node)
    }

    for (const node of this.graph.keys()) {
      if (!visited.has(node)) {
        dfs(node)
      }
    }
  }

  /**
   * 获取文件的依赖
   */
  getDependencies(filePath: string): string[] {
    const relativePath = relative(this.projectPath, resolve(this.projectPath, filePath))
    return Array.from(this.graph.get(relativePath) || [])
  }

  /**
   * 获取文件的被依赖者
   */
  getDependents(filePath: string): string[] {
    const relativePath = relative(this.projectPath, resolve(this.projectPath, filePath))
    const dependents: string[] = []
    
    for (const [node, deps] of this.graph.entries()) {
      if (deps.has(relativePath)) {
        dependents.push(node)
      }
    }
    
    return dependents
  }

  /**
   * 生成 DOT 格式图
   */
  toDot(): string {
    let dot = 'digraph Dependencies {\n'
    dot += '  rankdir=LR;\n'
    dot += '  node [shape=box, style=rounded];\n\n'

    // 标记循环依赖的节点
    const cycleNodes = new Set<string>()
    for (const cycle of this.cycles) {
      for (const node of cycle.files) {
        cycleNodes.add(node)
      }
    }

    // 节点
    for (const node of this.graph.keys()) {
      const label = node.split('/').slice(-2).join('/')
      const color = cycleNodes.has(node) ? ', color=red, penwidth=2' : ''
      dot += `  "${node}" [label="${label}"${color}];\n`
    }

    dot += '\n'

    // 边
    for (const [source, targets] of this.graph.entries()) {
      for (const target of targets) {
        const isInCycle = this.cycles.some(c => 
          c.cycle.includes(source) && c.cycle.includes(target)
        )
        const color = isInCycle ? ' [color=red, penwidth=2]' : ''
        dot += `  "${source}" -> "${target}"${color};\n`
      }
    }

    dot += '}\n'
    return dot
  }

  /**
   * 生成报告
   */
  generateReport(): string {
    const graph = this.detect()
    
    let report = `# 依赖分析报告\n\n`
    report += `生成时间: ${new Date().toLocaleString()}\n\n`
    
    report += `## 概览\n\n`
    report += `- 文件数量: ${graph.nodes.length}\n`
    report += `- 导入关系: ${graph.edges.length}\n`
    report += `- 循环依赖: ${graph.circular.length}\n\n`

    if (graph.circular.length > 0) {
      report += `## ⚠️ 循环依赖\n\n`
      
      for (let i = 0; i < graph.circular.length; i++) {
        const cycle = graph.circular[i]
        const icon = cycle.severity === 'error' ? '🔴' : '🟡'
        report += `### ${icon} 循环 ${i + 1}\n\n`
        report += '```\n'
        report += cycle.cycle.join('\n  ↓\n')
        report += '\n```\n\n'
      }
    } else {
      report += `## ✅ 未发现循环依赖\n\n`
    }

    // 最多依赖的文件
    const byDependencyCount = Array.from(this.graph.entries())
      .map(([file, deps]) => ({ file, count: deps.size }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    if (byDependencyCount.length > 0) {
      report += `## 导入最多的文件 (Top 10)\n\n`
      for (const { file, count } of byDependencyCount) {
        report += `- ${file}: ${count} 个导入\n`
      }
      report += '\n'
    }

    // 被依赖最多的文件
    const dependentCount = new Map<string, number>()
    for (const deps of this.graph.values()) {
      for (const dep of deps) {
        dependentCount.set(dep, (dependentCount.get(dep) || 0) + 1)
      }
    }
    
    const byDependentCount = Array.from(dependentCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)

    if (byDependentCount.length > 0) {
      report += `## 被引用最多的文件 (Top 10)\n\n`
      for (const [file, count] of byDependentCount) {
        report += `- ${file}: 被 ${count} 个文件引用\n`
      }
    }

    return report
  }
}

/**
 * 创建循环依赖检测器实例
 */
export function createCircularDependencyDetector(
  projectPath: string, 
  options?: DetectionOptions
): CircularDependencyDetector {
  return new CircularDependencyDetector(projectPath, options)
}
