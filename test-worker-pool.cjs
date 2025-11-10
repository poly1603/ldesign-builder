/**
 * Worker 池和并行构建管理器测试
 */

const path = require('path')

async function runTests() {
  console.log('🧪 开始测试 Worker 池和并行构建管理器...\n')

  // 动态导入 ESM 模块
  const { createParallelBuildManager, generateBuildTasks } = await import('./dist/utils/ParallelBuildManager.js')

  let passedTests = 0
  let totalTests = 0

  // 测试 1: 创建并行构建管理器
  totalTests++
  try {
    const manager = createParallelBuildManager({
      maxWorkers: 2,
      enableWorkerPool: false // 暂时禁用 Worker 池,因为 Worker 脚本需要编译
    })

    console.log('✅ 测试 1: 创建并行构建管理器成功')
    passedTests++

    // 清理
    await manager.dispose()
  } catch (error) {
    console.error('❌ 测试 1 失败:', error.message)
  }

  // 测试 2: 生成构建任务
  totalTests++
  try {
    const config = {
      input: 'src/index.ts',
      output: {
        format: ['esm', 'cjs', 'umd']
      }
    }

    const tasks = generateBuildTasks(config)

    if (tasks.length === 3 && tasks[0].format === 'esm' && tasks[1].format === 'cjs' && tasks[2].format === 'umd') {
      console.log('✅ 测试 2: 生成构建任务成功')
      passedTests++
    } else {
      console.error('❌ 测试 2 失败: 任务数量或格式不正确')
      console.error('  实际任务:', tasks.map(t => t.format))
    }
  } catch (error) {
    console.error('❌ 测试 2 失败:', error.message)
  }

  // 测试 3: 并行构建 (模拟)
  totalTests++
  try {
    const manager = createParallelBuildManager({
      maxWorkers: 2,
      enableWorkerPool: false
    })

    const config = {
      input: 'src/index.ts',
      output: {
        format: ['esm', 'cjs']
      }
    }

    const tasks = generateBuildTasks(config)

    // 模拟构建函数
    const mockBuilderFn = async (cfg) => {
      await new Promise(resolve => setTimeout(resolve, 100)) // 模拟构建时间
      return {
        success: true,
        outputs: [],
        duration: 100,
        buildId: `build-${Date.now()}`,
        timestamp: Date.now(),
        bundler: 'rollup',
        mode: 'production'
      }
    }

    const results = await manager.buildParallel(tasks, mockBuilderFn)

    if (results.length === 2 && results[0].format === 'esm' && results[1].format === 'cjs') {
      console.log('✅ 测试 3: 并行构建成功')
      passedTests++
    } else {
      console.error('❌ 测试 3 失败: 构建结果不正确')
    }

    // 清理
    await manager.dispose()
  } catch (error) {
    console.error('❌ 测试 3 失败:', error.message)
  }

  // 测试 4: 并行处理文件
  totalTests++
  try {
    const manager = createParallelBuildManager({
      maxWorkers: 2,
      enableWorkerPool: false
    })

    const files = ['file1.ts', 'file2.ts', 'file3.ts', 'file4.ts', 'file5.ts']

    // 模拟文件处理函数
    const mockProcessor = async (file) => {
      await new Promise(resolve => setTimeout(resolve, 50))
      return { file, processed: true }
    }

    const results = await manager.processFilesParallel(files, mockProcessor)

    if (results.size === 5 && results.get('file1.ts').processed) {
      console.log('✅ 测试 4: 并行处理文件成功')
      passedTests++
    } else {
      console.error('❌ 测试 4 失败: 文件处理结果不正确')
    }

    // 清理
    await manager.dispose()
  } catch (error) {
    console.error('❌ 测试 4 失败:', error.message)
  }

  // 测试 5: 获取统计信息
  totalTests++
  try {
    const manager = createParallelBuildManager({
      maxWorkers: 2,
      enableWorkerPool: false
    })

    const config = {
      input: 'src/index.ts',
      output: {
        format: ['esm']
      }
    }

    const tasks = generateBuildTasks(config)

    // 模拟构建函数
    const mockBuilderFn = async (cfg) => {
      await new Promise(resolve => setTimeout(resolve, 100))
      return {
        success: true,
        outputs: [],
        duration: 100,
        buildId: `build-${Date.now()}`,
        timestamp: Date.now(),
        bundler: 'rollup',
        mode: 'production'
      }
    }

    await manager.buildParallel(tasks, mockBuilderFn)

    const stats = manager.getStats()

    if (stats.completedTasks === 1 && stats.failedTasks === 0) {
      console.log('✅ 测试 5: 获取统计信息成功')
      passedTests++
    } else {
      console.error('❌ 测试 5 失败: 统计信息不正确')
      console.error('  实际统计:', stats)
    }

    // 清理
    await manager.dispose()
  } catch (error) {
    console.error('❌ 测试 5 失败:', error.message)
  }

  // 测试 6: 任务优先级排序
  totalTests++
  try {
    const config = {
      input: 'src/index.ts',
      output: {
        format: ['umd', 'esm', 'cjs']
      }
    }

    const tasks = generateBuildTasks(config)

    // 检查优先级: ESM (10) > CJS (9) > UMD (8)
    if (tasks[0].priority === 8 && tasks[1].priority === 10 && tasks[2].priority === 9) {
      console.log('✅ 测试 6: 任务优先级设置正确')
      passedTests++
    } else {
      console.error('❌ 测试 6 失败: 任务优先级不正确')
      console.error('  实际优先级:', tasks.map(t => ({ format: t.format, priority: t.priority })))
    }
  } catch (error) {
    console.error('❌ 测试 6 失败:', error.message)
  }

  // 测试 7: 空任务列表处理
  totalTests++
  try {
    const manager = createParallelBuildManager({
      maxWorkers: 2,
      enableWorkerPool: false
    })

    const mockBuilderFn = async (cfg) => {
      return {
        success: true,
        outputs: [],
        duration: 0,
        buildId: `build-${Date.now()}`,
        timestamp: Date.now(),
        bundler: 'rollup',
        mode: 'production'
      }
    }

    const results = await manager.buildParallel([], mockBuilderFn)

    if (results.length === 0) {
      console.log('✅ 测试 7: 空任务列表处理成功')
      passedTests++
    } else {
      console.error('❌ 测试 7 失败: 空任务列表应返回空结果')
    }

    // 清理
    await manager.dispose()
  } catch (error) {
    console.error('❌ 测试 7 失败:', error.message)
  }

  // 输出测试结果
  console.log(`\n📊 测试结果: ${passedTests}/${totalTests} 通过`)

  if (passedTests === totalTests) {
    console.log('🎉 所有测试通过!')
    process.exit(0)
  } else {
    console.error(`❌ ${totalTests - passedTests} 个测试失败`)
    process.exit(1)
  }
}

runTests().catch(error => {
  console.error('❌ 测试运行失败:', error)
  process.exit(1)
})

