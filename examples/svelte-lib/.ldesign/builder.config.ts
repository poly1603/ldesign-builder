/**
 * Svelte 组件库构建配置
 * 
 * @description Svelte 组件库
 * @see https://svelte.dev/
 */
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 库类型
  libraryType: 'svelte',

  // 入口配置
  entry: 'src/index.ts',

  // 输出配置
  formats: ['esm', 'cjs'],

  // 外部依赖
  external: ['svelte', 'svelte/store', 'svelte/motion', 'svelte/transition'],

  // 类型声明
  dts: false, // Svelte 组件不生成 dts

  // 构建目标
  target: 'es2020',

  // 保持模块结构
  preserveModules: true,

  // Tree Shaking
  treeshake: true,

  // Svelte 需要 rollup 打包器（完整支持 .svelte 文件）
  bundler: 'rollup',

  // Svelte 预处理配置
  svelte: {
    preprocess: true, // 启用 TypeScript 预处理
    emitCss: true,
  },
})
