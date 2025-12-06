/**
 * 代码检查命令
 * 
 * 循环依赖检测、类型检查等
 */

import { Command } from 'commander'
import { resolve } from 'path'
import { writeFileSync } from 'fs'
import { createCircularDependencyDetector } from '../../analyzers/CircularDependencyDetector'
import { logger } from '../../utils/logger'

// ========== 循环依赖检查命令 ==========

export const circularCommand = new Command('circular')
  .description('检测循环依赖')
  .option('-d, --dir <dirs>', '扫描目录 (逗号分隔)', 'src')
  .option('-e, --exclude <patterns>', '排除模式 (逗号分隔)')
  .option('-o, --output <file>', '输出报告文件')
  .option('--dot <file>', '输出 DOT 图形文件')
  .option('--json', '输出 JSON 格式')
  .option('--fail-on-circular', '发现循环依赖时退出码为 1')
  .action(async (options) => {
    const projectPath = process.cwd()
    
    console.log('')
    console.log('🔍 检测循环依赖...')
    console.log('')

    const detector = createCircularDependencyDetector(projectPath, {
      include: options.dir.split(',').map((d: string) => d.trim()),
      exclude: options.exclude 
        ? options.exclude.split(',').map((p: string) => p.trim())
        : undefined
    })

    const graph = detector.detect()

    // JSON 输出
    if (options.json) {
      console.log(JSON.stringify(graph, null, 2))
      return
    }

    // 统计信息
    console.log('📊 扫描结果:')
    console.log(`   文件数量: ${graph.nodes.length}`)
    console.log(`   导入关系: ${graph.edges.length}`)
    console.log(`   循环依赖: ${graph.circular.length}`)
    console.log('')

    // 显示循环依赖
    if (graph.circular.length > 0) {
      console.log('⚠️  发现循环依赖:')
      console.log('')
      
      for (let i = 0; i < graph.circular.length; i++) {
        const cycle = graph.circular[i]
        const icon = cycle.severity === 'error' ? '🔴' : '🟡'
        
        console.log(`${icon} 循环 ${i + 1}:`)
        for (let j = 0; j < cycle.cycle.length; j++) {
          const arrow = j < cycle.cycle.length - 1 ? '  ↓' : ''
          console.log(`   ${cycle.cycle[j]}${arrow}`)
        }
        console.log('')
      }
    } else {
      console.log('✅ 未发现循环依赖')
      console.log('')
    }

    // 输出报告
    if (options.output) {
      const report = detector.generateReport()
      writeFileSync(resolve(projectPath, options.output), report)
      logger.success(`报告已保存: ${options.output}`)
    }

    // 输出 DOT 图
    if (options.dot) {
      const dot = detector.toDot()
      writeFileSync(resolve(projectPath, options.dot), dot)
      logger.success(`DOT 图已保存: ${options.dot}`)
      console.log('   可使用 Graphviz 渲染: dot -Tpng -o graph.png ' + options.dot)
    }

    // 失败退出
    if (options.failOnCircular && graph.circular.length > 0) {
      process.exit(1)
    }
  })

// ========== 依赖分析命令 ==========

export const depsCommand = new Command('deps')
  .description('分析文件依赖')
  .argument('<file>', '文件路径')
  .option('--dependents', '显示被依赖者而非依赖')
  .action((file: string, options) => {
    const projectPath = process.cwd()
    const detector = createCircularDependencyDetector(projectPath)
    
    // 先运行检测以构建图
    detector.detect()

    console.log('')
    
    if (options.dependents) {
      const dependents = detector.getDependents(file)
      console.log(`📥 被引用 "${file}" 的文件 (${dependents.length}):`)
      for (const dep of dependents) {
        console.log(`   ${dep}`)
      }
    } else {
      const deps = detector.getDependencies(file)
      console.log(`📤 "${file}" 的依赖 (${deps.length}):`)
      for (const dep of deps) {
        console.log(`   ${dep}`)
      }
    }
    
    console.log('')
  })

// ========== 注册检查命令 ==========

export function registerCheckCommands(program: Command): void {
  program.addCommand(circularCommand)
  program.addCommand(depsCommand)
}
