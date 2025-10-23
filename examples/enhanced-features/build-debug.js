/**
 * 调试模式构建示例
 * 
 * 演示如何使用构建调试器
 */

import { LibraryBuilder, createBuildDebugger } from '@ldesign/builder'

// 创建调试器
const debugger = createBuildDebugger({
  enabled: true,
  pauseOnStart: false,
  logAllPhases: true
})

// 添加断点
debugger.addBreakpoint({
  phase: 'transform',
  enabled: true
})

// 监听断点
debugger.on('breakpoint:hit', ({ id, context }) => {
  console.log('\n🔴 命中断点:', id)
  console.log('阶段:', context.phase)
  console.log('文件:', context.file)
  console.log('变量:', Object.keys(context.variables))
  console.log('调用栈:', context.stack)

  // 查看监视的变量
  const watched = debugger.getWatchedVariables()
  console.log('监视变量:', watched)

  // 继续执行
  setTimeout(() => {
    console.log('➡️  继续执行...\n')
    debugger.continue()
  }, 1000)
})

// 监听阶段变化
debugger.on('phase:enter', (context) => {
  console.log(`📍 进入阶段: ${context.phase}`)
})

const builder = new LibraryBuilder()
await builder.initialize()

const result = await builder.build({
  bundler: 'rollup',
  input: 'src/index.ts'
})

console.log('\n✅ 调试构建完成!')
console.log('断点命中统计:', debugger.getBreakpoints().map(bp => ({
  id: bp.id,
  hits: bp.hitCount
})))

await builder.dispose()


