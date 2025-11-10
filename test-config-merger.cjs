/**
 * 测试配置合并功能
 */

const { createSmartConfigMerger } = require('./dist/utils/SmartConfigMerger.cjs')
const { createOutputConfigMerger } = require('./dist/utils/OutputConfigMerger.cjs')

console.log('=== 测试 SmartConfigMerger ===\n')

// 测试 1: 数组合并 - external (unique 策略)
console.log('测试 1: external 数组去重合并')
const merger = createSmartConfigMerger()
const baseConfig1 = {
  external: ['react', 'react-dom'],
  plugins: []
}
const userConfig1 = {
  external: ['lodash', 'react'], // react 重复
  plugins: []
}
const result1 = merger.merge(baseConfig1, userConfig1)
console.log('Base external:', baseConfig1.external)
console.log('User external:', userConfig1.external)
console.log('Merged external:', result1.external)
console.log('✅ 预期: [\'react\', \'react-dom\', \'lodash\']')
console.log('✅ 实际:', JSON.stringify(result1.external))
console.log()

// 测试 2: 数组合并 - plugins (concat 策略)
console.log('测试 2: plugins 数组顺序合并')
const baseConfig2 = {
  plugins: [{ name: 'pluginA' }, { name: 'pluginB' }]
}
const userConfig2 = {
  plugins: [{ name: 'pluginC' }]
}
const result2 = merger.merge(baseConfig2, userConfig2)
console.log('Base plugins:', baseConfig2.plugins.map(p => p.name))
console.log('User plugins:', userConfig2.plugins.map(p => p.name))
console.log('Merged plugins:', result2.plugins.map(p => p.name))
console.log('✅ 预期: [\'pluginA\', \'pluginB\', \'pluginC\']')
console.log('✅ 实际:', JSON.stringify(result2.plugins.map(p => p.name)))
console.log()

// 测试 3: 对象深度合并
console.log('测试 3: 对象深度合并')
const baseConfig3 = {
  globals: {
    react: 'React',
    'react-dom': 'ReactDOM'
  }
}
const userConfig3 = {
  globals: {
    lodash: '_'
  }
}
const result3 = merger.merge(baseConfig3, userConfig3)
console.log('Base globals:', baseConfig3.globals)
console.log('User globals:', userConfig3.globals)
console.log('Merged globals:', result3.globals)
console.log('✅ 预期: { react: \'React\', \'react-dom\': \'ReactDOM\', lodash: \'_\' }')
console.log('✅ 实际:', JSON.stringify(result3.globals))
console.log()

// 测试 4: 函数合并 - external
console.log('测试 4: external 函数合并 (OR 逻辑)')
const baseConfig4 = {
  external: (id) => id.startsWith('react')
}
const userConfig4 = {
  external: (id) => id.startsWith('lodash')
}
const result4 = merger.merge(baseConfig4, userConfig4, { mergeFunctions: true })
console.log('Base external(\'react-dom\'):', baseConfig4.external('react-dom'))
console.log('Base external(\'lodash\'):', baseConfig4.external('lodash'))
console.log('User external(\'react-dom\'):', userConfig4.external('react-dom'))
console.log('User external(\'lodash\'):', userConfig4.external('lodash'))
console.log('Merged external(\'react-dom\'):', result4.external('react-dom'))
console.log('Merged external(\'lodash\'):', result4.external('lodash'))
console.log('Merged external(\'vue\'):', result4.external('vue'))
console.log('✅ 预期: react-dom=true, lodash=true, vue=false')
console.log()

console.log('\n=== 测试 OutputConfigMerger ===\n')

// 测试 5: 输出配置合并
console.log('测试 5: 输出配置合并')
const outputMerger = createOutputConfigMerger()
const baseOutput = {
  esm: {
    dir: 'es',
    preserveStructure: true
  },
  cjs: {
    dir: 'lib',
    preserveStructure: true
  }
}
const userOutput = {
  esm: {
    sourcemap: true
  },
  umd: {
    dir: 'dist',
    name: 'MyLib'
  }
}
const result5 = outputMerger.merge(baseOutput, userOutput)
console.log('Base output:', JSON.stringify(baseOutput, null, 2))
console.log('User output:', JSON.stringify(userOutput, null, 2))
console.log('Merged output:', JSON.stringify(result5, null, 2))
console.log('✅ ESM 配置应该合并: dir=es, preserveStructure=true, sourcemap=true')
console.log('✅ CJS 配置应该保留: dir=lib, preserveStructure=true')
console.log('✅ UMD 配置应该添加: dir=dist, name=MyLib')
console.log()

// 测试 6: 格式禁用
console.log('测试 6: 格式禁用')
const baseOutput2 = {
  esm: true,
  cjs: true,
  umd: true
}
const userOutput2 = {
  umd: false // 禁用 UMD
}
const result6 = outputMerger.merge(baseOutput2, userOutput2)
console.log('Base output:', baseOutput2)
console.log('User output:', userOutput2)
console.log('Merged output:', result6)
console.log('✅ 预期: esm=true, cjs=true, umd=false')
console.log('✅ 实际:', JSON.stringify(result6))
console.log()

// 测试 7: 输出配置验证
console.log('测试 7: 输出配置验证')
const validOutput = {
  esm: true,
  umd: {
    name: 'MyLib',
    globals: { react: 'React' }
  }
}
const invalidOutput = {
  umd: {
    // 缺少 name
    globals: { react: 'React' }
  }
}
const validation1 = outputMerger.validate(validOutput)
const validation2 = outputMerger.validate(invalidOutput)
console.log('Valid output validation:', validation1)
console.log('Invalid output validation:', validation2)
console.log('✅ 预期: valid=true, invalid=false')
console.log('✅ 实际: valid=' + validation1.valid + ', invalid=' + validation2.valid)
console.log()

console.log('\n=== 所有测试完成 ===')

