/**
 * DTS 生成示例
 * 
 * 演示如何使用新的 DtsGenerator 生成类型声明文件
 */

import { LibraryBuilder } from '../src'
import { generateDts, DtsGenerator } from '../src/generators/DtsGenerator'
import path from 'path'

// ========== 示例 1: 使用 CLI 方式 ==========
console.log('示例 1: CLI 使用方式')
console.log('运行命令：ldesign-builder build -f esm,cjs,dts')
console.log('')

// ========== 示例 2: 使用 LibraryBuilder API ==========
async function example2() {
  console.log('示例 2: LibraryBuilder API')

  const builder = new LibraryBuilder({
    root: process.cwd(),
    input: 'src/index.ts',
    output: {
      format: ['esm', 'cjs', 'dts'],
      sourcemap: true
    },
    clean: true
  })

  try {
    const result = await builder.build()
    console.log('✅ 构建成功！')
    console.log(`生成的文件: ${result.outputs?.length || 0} 个`)
  } catch (error) {
    console.error('❌ 构建失败:', error)
  }
}

// ========== 示例 3: 直接使用 DtsGenerator ==========
async function example3() {
  console.log('示例 3: 直接使用 DtsGenerator')

  // 方法 A: 使用快捷函数
  const result1 = await generateDts({
    srcDir: path.join(process.cwd(), 'src'),
    outDir: path.join(process.cwd(), 'es'),
    preserveStructure: true,
    declarationMap: true
  })

  if (result1.success) {
    console.log(`✅ 生成成功！共 ${result1.files.length} 个文件`)
    console.log(`耗时: ${result1.duration}ms`)
  } else {
    console.error('❌ 生成失败')
    result1.errors?.forEach(err => console.error(`  - ${err}`))
  }

  // 方法 B: 使用类实例
  const generator = new DtsGenerator({
    srcDir: 'src',
    outDir: 'lib',
    preserveStructure: true,
    declarationMap: false,
    exclude: [
      '**/*.test.ts',
      '**/*.spec.ts',
      '**/__tests__/**'
    ]
  })

  const result2 = await generator.generate()
  console.log(`lib/ 目录: ${result2.files.length} 个文件`)
}

// ========== 示例 4: 为多个目录生成 ==========
async function example4() {
  console.log('示例 4: 为多个目录生成声明文件')

  const outputDirs = ['es', 'lib']

  for (const outDir of outputDirs) {
    console.log(`\n生成到 ${outDir}/...`)

    const result = await generateDts({
      srcDir: 'src',
      outDir,
      preserveStructure: true,
      declarationMap: outDir === 'es' // 只为 es 生成 map
    })

    if (result.success) {
      console.log(`✅ ${outDir}/ 完成: ${result.files.length} 个文件`)
    } else {
      console.error(`❌ ${outDir}/ 失败`)
    }
  }
}

// ========== 示例 5: 自定义编译选项 ==========
async function example5() {
  console.log('示例 5: 自定义编译选项')

  const generator = new DtsGenerator({
    srcDir: 'src',
    outDir: 'types',
    tsconfig: './tsconfig.build.json', // 使用自定义 tsconfig
    preserveStructure: true,
    include: [
      '**/*.ts',
      '**/*.tsx'
      // 不包括 .vue 文件
    ],
    exclude: [
      '**/*.test.ts',
      '**/*.spec.ts',
      '**/__tests__/**',
      '**/__mocks__/**',
      '**/fixtures/**',
      '**/examples/**'
    ]
  })

  const result = await generator.generate()

  console.log('\n生成结果:')
  console.log(`  成功: ${result.success}`)
  console.log(`  文件数: ${result.files.length}`)
  console.log(`  耗时: ${result.duration}ms`)

  if (result.warnings && result.warnings.length > 0) {
    console.log('\n⚠️  警告:')
    result.warnings.forEach(warn => console.log(`  - ${warn}`))
  }

  if (result.errors && result.errors.length > 0) {
    console.log('\n❌ 错误:')
    result.errors.forEach(err => console.log(`  - ${err}`))
  }
}

// ========== 示例 6: 配置文件方式 ==========
console.log('\n示例 6: builder.config.ts 配置文件')
console.log(`
// builder.config.ts
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  output: {
    format: ['esm', 'cjs', 'dts'],
    sourcemap: true
  },
  typescript: {
    declaration: true,
    declarationMap: true,
    target: 'ES2020',
    module: 'ESNext'
  },
  clean: true
})
`)

// ========== 示例 7: package.json scripts ==========
console.log('\n示例 7: package.json scripts 配置')
console.log(`
{
  "scripts": {
    "build": "ldesign-builder build -f esm,cjs,dts",
    "build:dts": "ldesign-builder build -f dts",
    "build:watch": "ldesign-builder watch -f esm,cjs,dts",
    "type-check": "tsc --noEmit",
    "prebuild": "npm run type-check"
  }
}
`)

// ========== 运行示例 ==========
async function runExamples() {
  console.log('='.repeat(60))
  console.log('DTS Generator 使用示例')
  console.log('='.repeat(60))
  console.log('')

  // 取消注释以运行相应示例
  // await example2()
  // await example3()
  // await example4()
  // await example5()
}

// 如果直接运行此文件
if (require.main === module) {
  runExamples().catch(console.error)
}

export {
  example2,
  example3,
  example4,
  example5
}


