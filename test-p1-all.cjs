/**
 * P1 所有任务快速测试
 */

async function runTests() {
  console.log('🧪 开始测试 P1 所有任务...\n')

  let passedTests = 0
  let totalTests = 0

  // ========== P1-1: 类型安全增强器 ==========
  console.log('📦 测试 P1-1: 类型安全增强器\n')

  const { TypeGuards, SafeConfigAccessor, SafeJSON, SafeArray, SafeObject } = await import('./dist/utils/TypeSafetyEnhancer.js')

  // 测试 1: TypeGuards
  totalTests++
  try {
    if (TypeGuards.isString('hello') && !TypeGuards.isString(123) &&
        TypeGuards.isNumber(123) && !TypeGuards.isNumber('hello') &&
        TypeGuards.isArray([1, 2, 3]) && !TypeGuards.isArray('not array')) {
      console.log('✅ 测试 1: TypeGuards 类型检查正常')
      passedTests++
    } else {
      console.error('❌ 测试 1 失败: TypeGuards 类型检查异常')
    }
  } catch (error) {
    console.error('❌ 测试 1 失败:', error.message)
  }

  // 测试 2: SafeConfigAccessor
  totalTests++
  try {
    const config = { name: 'test', count: 42, enabled: true }
    const accessor = new SafeConfigAccessor(config)
    
    if (accessor.getString('name') === 'test' &&
        accessor.getNumber('count') === 42 &&
        accessor.getBoolean('enabled') === true &&
        accessor.getString('missing', 'default') === 'default') {
      console.log('✅ 测试 2: SafeConfigAccessor 正常工作')
      passedTests++
    } else {
      console.error('❌ 测试 2 失败: SafeConfigAccessor 返回值不正确')
    }
  } catch (error) {
    console.error('❌ 测试 2 失败:', error.message)
  }

  // 测试 3: SafeJSON
  totalTests++
  try {
    const obj = { name: 'test', value: 123 }
    const json = SafeJSON.stringify(obj)
    const parsed = SafeJSON.parse(json)
    
    if (json && parsed && parsed.name === 'test' && parsed.value === 123) {
      console.log('✅ 测试 3: SafeJSON 正常工作')
      passedTests++
    } else {
      console.error('❌ 测试 3 失败: SafeJSON 解析异常')
    }
  } catch (error) {
    console.error('❌ 测试 3 失败:', error.message)
  }

  // 测试 4: SafeArray
  totalTests++
  try {
    const arr = [1, 2, null, 3, undefined, 4]
    const compacted = SafeArray.compact(arr)
    const unique = SafeArray.unique([1, 2, 2, 3, 3, 4])
    
    if (compacted.length === 4 && unique.length === 4) {
      console.log('✅ 测试 4: SafeArray 正常工作')
      passedTests++
    } else {
      console.error('❌ 测试 4 失败: SafeArray 结果不正确')
    }
  } catch (error) {
    console.error('❌ 测试 4 失败:', error.message)
  }

  // 测试 5: SafeObject
  totalTests++
  try {
    const obj = { a: 1, b: 2, c: 3 }
    const picked = SafeObject.pick(obj, 'a', 'b')
    const omitted = SafeObject.omit(obj, 'c')
    
    if (Object.keys(picked).length === 2 && Object.keys(omitted).length === 2) {
      console.log('✅ 测试 5: SafeObject 正常工作')
      passedTests++
    } else {
      console.error('❌ 测试 5 失败: SafeObject 结果不正确')
    }
  } catch (error) {
    console.error('❌ 测试 5 失败:', error.message)
  }

  // ========== P1-3: 错误恢复管理器 ==========
  console.log('\n📦 测试 P1-3: 错误恢复管理器\n')

  const { ErrorRecoveryManager, ErrorType, RecoveryStrategy } = await import('./dist/utils/ErrorRecoveryManager.js')

  // 测试 6: 错误诊断
  totalTests++
  try {
    const manager = new ErrorRecoveryManager()
    const networkError = new Error('ECONNREFUSED: Connection refused')
    const diagnosis = manager.diagnose(networkError)
    
    if (diagnosis.type === ErrorType.NETWORK && diagnosis.canRecover) {
      console.log('✅ 测试 6: 错误诊断正常工作')
      passedTests++
    } else {
      console.error('❌ 测试 6 失败: 错误诊断结果不正确')
    }
  } catch (error) {
    console.error('❌ 测试 6 失败:', error.message)
  }

  // 测试 7: 自动恢复 (成功)
  totalTests++
  try {
    const manager = new ErrorRecoveryManager()
    let attempts = 0
    
    const result = await manager.recover(async () => {
      attempts++
      if (attempts < 2) {
        throw new Error('Temporary error')
      }
      return 'success'
    }, { maxRetries: 3, retryDelay: 100 })
    
    if (result === 'success' && attempts === 2) {
      console.log('✅ 测试 7: 自动恢复成功')
      passedTests++
    } else {
      console.error('❌ 测试 7 失败: 恢复结果不正确')
    }
  } catch (error) {
    console.error('❌ 测试 7 失败:', error.message)
  }

  // 测试 8: Fallback 值
  totalTests++
  try {
    const manager = new ErrorRecoveryManager()
    
    const result = await manager.recover(async () => {
      throw new Error('Always fails')
    }, { maxRetries: 1, retryDelay: 50, fallbackValue: 'fallback' })
    
    if (result === 'fallback') {
      console.log('✅ 测试 8: Fallback 值正常工作')
      passedTests++
    } else {
      console.error('❌ 测试 8 失败: Fallback 值不正确')
    }
  } catch (error) {
    console.error('❌ 测试 8 失败:', error.message)
  }

  // ========== P1-4: 依赖注入容器 ==========
  console.log('\n📦 测试 P1-4: 依赖注入容器\n')

  const { Container, ServiceLifetime, createContainerBuilder } = await import('./dist/utils/DependencyInjection.js')

  // 测试 9: 单例服务
  totalTests++
  try {
    const container = new Container()
    let instanceCount = 0
    
    container.registerSingleton('service', () => {
      instanceCount++
      return { id: instanceCount }
    })
    
    const instance1 = await container.resolve('service')
    const instance2 = await container.resolve('service')
    
    if (instance1 === instance2 && instanceCount === 1) {
      console.log('✅ 测试 9: 单例服务正常工作')
      passedTests++
    } else {
      console.error('❌ 测试 9 失败: 单例服务创建了多个实例')
    }
  } catch (error) {
    console.error('❌ 测试 9 失败:', error.message)
  }

  // 测试 10: 瞬态服务
  totalTests++
  try {
    const container = new Container()
    let instanceCount = 0
    
    container.registerTransient('service', () => {
      instanceCount++
      return { id: instanceCount }
    })
    
    const instance1 = await container.resolve('service')
    const instance2 = await container.resolve('service')
    
    if (instance1 !== instance2 && instanceCount === 2) {
      console.log('✅ 测试 10: 瞬态服务正常工作')
      passedTests++
    } else {
      console.error('❌ 测试 10 失败: 瞬态服务没有创建新实例')
    }
  } catch (error) {
    console.error('❌ 测试 10 失败:', error.message)
  }

  // 测试 11: 作用域服务
  totalTests++
  try {
    const container = new Container()
    let instanceCount = 0
    
    container.registerScoped('service', () => {
      instanceCount++
      return { id: instanceCount }
    })
    
    const scope1 = container.createScope()
    const scope2 = container.createScope()
    
    const instance1a = await scope1.resolve('service')
    const instance1b = await scope1.resolve('service')
    const instance2 = await scope2.resolve('service')
    
    if (instance1a === instance1b && instance1a !== instance2 && instanceCount === 2) {
      console.log('✅ 测试 11: 作用域服务正常工作')
      passedTests++
    } else {
      console.error('❌ 测试 11 失败: 作用域服务行为不正确')
    }
  } catch (error) {
    console.error('❌ 测试 11 失败:', error.message)
  }

  // 测试 12: ContainerBuilder
  totalTests++
  try {
    const builder = createContainerBuilder()
    builder
      .addSingleton('logger', () => ({ log: () => {} }))
      .addTransient('service', (c) => ({ logger: c.resolveSync('logger') }))
    
    const container = builder.build()
    const service = await container.resolve('service')
    
    if (service && service.logger) {
      console.log('✅ 测试 12: ContainerBuilder 正常工作')
      passedTests++
    } else {
      console.error('❌ 测试 12 失败: ContainerBuilder 构建失败')
    }
  } catch (error) {
    console.error('❌ 测试 12 失败:', error.message)
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

