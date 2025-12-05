/**
 * Lit Web Components 组件库构建配置
 * 
 * @description 基于 Lit 的 Web Components 组件库
 * @see https://lit.dev/
 */
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 入口配置
  entry: 'src/index.ts',

  // 输出配置
  formats: ['esm', 'cjs'],

  // 外部依赖
  external: ['lit', '@lit/reactive-element'],

  // 类型声明
  dts: true,

  // 构建目标（Lit 需要较新的浏览器支持）
  target: 'es2021',

  // 保持模块结构（组件库推荐）
  preserveModules: true,

  // Tree Shaking
  treeshake: true,

  // TypeScript 装饰器支持
  typescript: {
    experimentalDecorators: true,
  },
})
