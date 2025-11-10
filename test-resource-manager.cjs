/**
 * 测试资源管理器功能
 */

const { ResourceManager, ResourceGroup, using } = require('./dist/utils/ResourceManager.cjs')
const { ManagedWatcher } = require('./dist/utils/ManagedWatcher.cjs')
const fs = require('fs')
const path = require('path')

async function runTests() {
console.log('=== 测试 ResourceManager ===\n')

// 测试 1: 基本资源管理
console.log('测试 1: 基本资源管理')
async function test1() {
  const manager = new ResourceManager()
  
  let resource1Disposed = false
  let resource2Disposed = false
  
  const resource1 = {
    dispose: async () => {
      resource1Disposed = true
      console.log('  Resource 1 disposed')
    }
  }
  
  const resource2 = {
    dispose: async () => {
      resource2Disposed = true
      console.log('  Resource 2 disposed')
    }
  }
  
  manager.register(resource1)
  manager.register(resource2)
  
  console.log('  Registered 2 resources')
  console.log('  Resource count:', manager.getResourceCount())
  
  await manager.dispose()
  
  console.log('  ✅ Resource 1 disposed:', resource1Disposed)
  console.log('  ✅ Resource 2 disposed:', resource2Disposed)
  console.log('  ✅ Manager disposed:', manager.isDisposed())
}

await test1()
console.log()

// 测试 2: 清理回调
console.log('测试 2: 清理回调')
async function test2() {
  const manager = new ResourceManager()
  
  let callback1Called = false
  let callback2Called = false
  
  manager.registerCleanup(async () => {
    callback1Called = true
    console.log('  Cleanup callback 1 called')
  })
  
  manager.registerCleanup(async () => {
    callback2Called = true
    console.log('  Cleanup callback 2 called')
  })
  
  console.log('  Registered 2 cleanup callbacks')
  console.log('  Cleanup callback count:', manager.getCleanupCallbackCount())
  
  await manager.dispose()
  
  console.log('  ✅ Callback 1 called:', callback1Called)
  console.log('  ✅ Callback 2 called:', callback2Called)
}

await test2()
console.log()

// 测试 3: using 模式
console.log('测试 3: using 模式')
async function test3() {
  let disposed = false
  
  const result = await using(new ResourceManager(), async (manager) => {
    manager.registerCleanup(() => {
      disposed = true
      console.log('  Resource auto-disposed in using block')
    })
    
    console.log('  Inside using block')
    return 'test result'
  })
  
  console.log('  ✅ Result:', result)
  console.log('  ✅ Auto-disposed:', disposed)
}

await test3()
console.log()

// 测试 4: ResourceGroup
console.log('测试 4: ResourceGroup')
async function test4() {
  const group = new ResourceGroup()
  
  let resource1Disposed = false
  let resource2Disposed = false
  
  group.add({
    dispose: async () => {
      resource1Disposed = true
      console.log('  Group resource 1 disposed')
    }
  })
  
  group.add({
    dispose: async () => {
      resource2Disposed = true
      console.log('  Group resource 2 disposed')
    }
  })
  
  console.log('  Added 2 resources to group')
  console.log('  Group resource count:', group.getResourceCount())
  
  await group.dispose()
  
  console.log('  ✅ Resource 1 disposed:', resource1Disposed)
  console.log('  ✅ Resource 2 disposed:', resource2Disposed)
  console.log('  ✅ Group disposed:', group.isDisposed())
}

await test4()
console.log()

// 测试 5: ManagedWatcher
console.log('测试 5: ManagedWatcher')
async function test5() {
  // 创建测试文件
  const testDir = path.join(__dirname, 'test-watch-dir')
  const testFile = path.join(testDir, 'test.txt')
  
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true })
  }
  
  const watcher = new ManagedWatcher(testDir, {
    ignoreInitial: true
  })
  
  let changeCount = 0
  
  watcher.on('change', (filePath) => {
    changeCount++
    console.log('  File changed:', path.basename(filePath))
  })
  
  console.log('  Created watcher for:', testDir)
  console.log('  Listener count:', watcher.listenerCount())
  console.log('  Event names:', watcher.eventNames())
  
  // 等待 watcher 初始化
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // 触发文件变化
  fs.writeFileSync(testFile, 'test content 1')
  await new Promise(resolve => setTimeout(resolve, 200))
  
  fs.writeFileSync(testFile, 'test content 2')
  await new Promise(resolve => setTimeout(resolve, 200))
  
  console.log('  ✅ Change count:', changeCount)
  
  // 清理
  await watcher.dispose()
  console.log('  ✅ Watcher disposed:', watcher.isDisposed())
  console.log('  ✅ Listener count after dispose:', watcher.listenerCount())
  
  // 清理测试文件
  fs.rmSync(testDir, { recursive: true, force: true })
}

await test5()
console.log()

// 测试 6: 资源管理器 + ManagedWatcher
console.log('测试 6: 资源管理器 + ManagedWatcher')
async function test6() {
  const manager = new ResourceManager()
  
  // 创建测试文件
  const testDir = path.join(__dirname, 'test-watch-dir-2')
  
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true })
  }
  
  const watcher = new ManagedWatcher(testDir)
  
  // 注册到资源管理器
  manager.register(watcher)
  
  console.log('  Created watcher and registered to manager')
  console.log('  Manager resource count:', manager.getResourceCount())
  console.log('  Watcher disposed:', watcher.isDisposed())
  
  // 释放资源管理器 (应该自动释放 watcher)
  await manager.dispose()
  
  console.log('  ✅ Manager disposed:', manager.isDisposed())
  console.log('  ✅ Watcher auto-disposed:', watcher.isDisposed())
  
  // 清理测试文件
  fs.rmSync(testDir, { recursive: true, force: true })
}

await test6()
console.log()

// 测试 7: 错误处理
console.log('测试 7: 错误处理')
async function test7() {
  const manager = new ResourceManager()
  
  let goodResourceDisposed = false
  
  // 添加一个会失败的资源
  manager.register({
    dispose: async () => {
      throw new Error('Dispose failed')
    }
  })
  
  // 添加一个正常的资源
  manager.register({
    dispose: async () => {
      goodResourceDisposed = true
      console.log('  Good resource disposed')
    }
  })
  
  console.log('  Registered 2 resources (1 will fail)')
  
  try {
    await manager.dispose()
  } catch (error) {
    console.log('  ✅ Caught error:', error.message)
  }
  
  console.log('  ✅ Good resource still disposed:', goodResourceDisposed)
  console.log('  ✅ Manager disposed:', manager.isDisposed())
}

await test7()
console.log()

console.log('=== 所有测试完成 ===')
}

// 运行测试
runTests().catch(error => {
  console.error('测试失败:', error)
  process.exit(1)
})

