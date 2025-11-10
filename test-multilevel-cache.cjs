/**
 * 多层缓存系统测试
 */

const path = require('path')
const fs = require('fs-extra')

async function runTests() {
  console.log('🧪 开始测试多层缓存系统...\n')

  // 动态导入 ESM 模块
  const { createMultiLevelCache } = await import('./dist/utils/MultiLevelCache.js')

  let passedTests = 0
  let totalTests = 0

  // 测试 1: 创建多层缓存实例
  totalTests++
  try {
    const cache = createMultiLevelCache({
      l1MaxSize: 10,
      l1MaxMemory: 1024 * 1024, // 1MB
      l2MaxSize: 10 * 1024 * 1024, // 10MB
      ttl: 60000 // 1分钟
    })

    console.log('✅ 测试 1: 创建多层缓存实例成功')
    passedTests++
  } catch (error) {
    console.error('❌ 测试 1 失败:', error.message)
  }

  // 测试 2: L1 缓存读写
  totalTests++
  try {
    const cache = createMultiLevelCache({
      l1MaxSize: 10,
      l1MaxMemory: 1024 * 1024
    })

    await cache.set('test-key-1', { data: 'test-value-1' })
    const value = await cache.get('test-key-1')

    if (value && value.data === 'test-value-1') {
      console.log('✅ 测试 2: L1 缓存读写成功')
      passedTests++
    } else {
      console.error('❌ 测试 2 失败: 读取的值不匹配')
    }
  } catch (error) {
    console.error('❌ 测试 2 失败:', error.message)
  }

  // 测试 3: L2 缓存读写
  totalTests++
  try {
    const testCacheDir = path.join(__dirname, 'node_modules', '.cache', 'test-multilevel')
    await fs.remove(testCacheDir) // 清理测试目录

    const cache = createMultiLevelCache({
      l1MaxSize: 10,
      l1MaxMemory: 1024 * 1024,
      l2CacheDir: testCacheDir,
      l2MaxSize: 10 * 1024 * 1024
    })

    await cache.set('test-key-2', { data: 'test-value-2' })
    
    // 等待 L2 写入完成
    await new Promise(resolve => setTimeout(resolve, 100))

    const value = await cache.get('test-key-2')

    if (value && value.data === 'test-value-2') {
      console.log('✅ 测试 3: L2 缓存读写成功')
      passedTests++
    } else {
      console.error('❌ 测试 3 失败: 读取的值不匹配')
    }

    // 清理测试目录
    await fs.remove(testCacheDir)
  } catch (error) {
    console.error('❌ 测试 3 失败:', error.message)
  }

  // 测试 4: 缓存提升 (L2 -> L1)
  totalTests++
  try {
    const testCacheDir = path.join(__dirname, 'node_modules', '.cache', 'test-multilevel-promote')
    await fs.remove(testCacheDir)

    // 创建第一个缓存实例写入数据
    const cache1 = createMultiLevelCache({
      l1MaxSize: 10,
      l1MaxMemory: 1024 * 1024,
      l2CacheDir: testCacheDir,
      l2MaxSize: 10 * 1024 * 1024,
      autoPromote: true
    })

    // 写入缓存
    await cache1.set('test-key-3', { data: 'test-value-3' })

    // 等待 L2 写入完成
    await new Promise(resolve => setTimeout(resolve, 100))

    // 创建第二个缓存实例 (L1 为空,但 L2 有数据)
    const cache2 = createMultiLevelCache({
      l1MaxSize: 10,
      l1MaxMemory: 1024 * 1024,
      l2CacheDir: testCacheDir,
      l2MaxSize: 10 * 1024 * 1024,
      autoPromote: true
    })

    // 从 L2 读取 (应该自动提升到 L1)
    const value1 = await cache2.get('test-key-3')

    // 再次读取 (应该从 L1 读取)
    const value2 = await cache2.get('test-key-3')

    const stats = cache2.getStats()

    if (value1 && value2 && value1.data === 'test-value-3' && stats.l1.hits >= 1) {
      console.log('✅ 测试 4: 缓存自动提升成功 (L2 -> L1)')
      passedTests++
    } else {
      console.error('❌ 测试 4 失败: 缓存提升不正确')
      console.error('  L1 hits:', stats.l1.hits)
      console.error('  L2 hits:', stats.l2.hits)
    }

    // 清理测试目录
    await fs.remove(testCacheDir)
  } catch (error) {
    console.error('❌ 测试 4 失败:', error.message)
  }

  // 测试 5: LRU 驱逐策略
  totalTests++
  try {
    const cache = createMultiLevelCache({
      l1MaxSize: 3, // 只允许 3 个条目
      l1MaxMemory: 1024 * 1024
    })

    // 写入 4 个条目
    await cache.set('key-1', { data: 'value-1' })
    await cache.set('key-2', { data: 'value-2' })
    await cache.set('key-3', { data: 'value-3' })
    await cache.set('key-4', { data: 'value-4' }) // 应该驱逐 key-1

    const stats = cache.getStats()

    if (stats.l1.size <= 3) {
      console.log('✅ 测试 5: LRU 驱逐策略正常工作')
      passedTests++
    } else {
      console.error('❌ 测试 5 失败: LRU 驱逐策略不正确')
    }
  } catch (error) {
    console.error('❌ 测试 5 失败:', error.message)
  }

  // 测试 6: 缓存统计信息
  totalTests++
  try {
    const cache = createMultiLevelCache({
      l1MaxSize: 10,
      l1MaxMemory: 1024 * 1024
    })

    await cache.set('stats-key-1', { data: 'value-1' })
    await cache.get('stats-key-1') // L1 Hit
    await cache.get('stats-key-2') // L1 Miss, L2 Miss

    const stats = cache.getStats()

    // L1: 1 hit, 1 miss
    // L2: 0 hit, 1 miss (只在 L1 miss 时才查询 L2)
    // Total: 1 hit, 1 miss (从用户角度看,只有一次成功,一次失败)
    if (
      stats.l1.hits === 1 &&
      stats.l1.misses === 1 &&
      stats.l1.hitRate === 0.5 &&
      stats.total.hits === 1 &&
      stats.total.misses === 1 &&
      stats.total.hitRate === 0.5
    ) {
      console.log('✅ 测试 6: 缓存统计信息正确')
      passedTests++
    } else {
      console.error('❌ 测试 6 失败: 缓存统计信息不正确')
      console.error('  期望: L1 hits=1, misses=1, hitRate=0.5')
      console.error('  期望: Total hits=1, misses=1, hitRate=0.5')
      console.error('  实际统计:', JSON.stringify(stats, null, 2))
    }
  } catch (error) {
    console.error('❌ 测试 6 失败:', error.message)
  }

  // 测试 7: 缓存删除
  totalTests++
  try {
    const testCacheDir = path.join(__dirname, 'node_modules', '.cache', 'test-multilevel-delete')
    await fs.remove(testCacheDir)

    const cache = createMultiLevelCache({
      l1MaxSize: 10,
      l1MaxMemory: 1024 * 1024,
      l2CacheDir: testCacheDir,
      l2MaxSize: 10 * 1024 * 1024
    })

    await cache.set('delete-key', { data: 'delete-value' })
    
    // 等待 L2 写入完成
    await new Promise(resolve => setTimeout(resolve, 100))

    const exists1 = await cache.has('delete-key')
    await cache.delete('delete-key')
    const exists2 = await cache.has('delete-key')

    if (exists1 && !exists2) {
      console.log('✅ 测试 7: 缓存删除成功')
      passedTests++
    } else {
      console.error('❌ 测试 7 失败: 缓存删除不正确')
    }

    // 清理测试目录
    await fs.remove(testCacheDir)
  } catch (error) {
    console.error('❌ 测试 7 失败:', error.message)
  }

  // 测试 8: 缓存清空
  totalTests++
  try {
    const testCacheDir = path.join(__dirname, 'node_modules', '.cache', 'test-multilevel-clear')
    await fs.remove(testCacheDir)

    const cache = createMultiLevelCache({
      l1MaxSize: 10,
      l1MaxMemory: 1024 * 1024,
      l2CacheDir: testCacheDir,
      l2MaxSize: 10 * 1024 * 1024
    })

    await cache.set('clear-key-1', { data: 'value-1' })
    await cache.set('clear-key-2', { data: 'value-2' })
    
    // 等待 L2 写入完成
    await new Promise(resolve => setTimeout(resolve, 100))

    await cache.clear()

    const exists1 = await cache.has('clear-key-1')
    const exists2 = await cache.has('clear-key-2')
    const stats = cache.getStats()

    if (!exists1 && !exists2 && stats.l1.size === 0) {
      console.log('✅ 测试 8: 缓存清空成功')
      passedTests++
    } else {
      console.error('❌ 测试 8 失败: 缓存清空不正确')
    }

    // 清理测试目录
    await fs.remove(testCacheDir)
  } catch (error) {
    console.error('❌ 测试 8 失败:', error.message)
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

