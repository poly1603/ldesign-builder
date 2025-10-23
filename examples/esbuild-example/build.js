/**
 * esbuild 极速构建示例
 * 
 * 演示如何使用 esbuild 进行极速开发构建
 */

import { LibraryBuilder } from '@ldesign/builder'

const builder = new LibraryBuilder()

await builder.initialize()

const result = await builder.build({
  bundler: 'esbuild',
  mode: 'development',
  input: 'src/index.ts',
  output: {
    esm: {
      dir: 'dist',
      format: 'esm'
    }
  },
  sourcemap: true,
  minify: false,
  dts: false  // 开发模式不生成类型声明
})

console.log('✅ 构建完成!')
console.log('耗时:', result.duration, 'ms')
console.log('输出:', result.outputs.length, '个文件')
console.log('打包器:', result.bundler)

await builder.dispose()


