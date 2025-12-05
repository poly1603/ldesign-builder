/**
 * Preact 组件库构建配置
 * 
 * @description Preact 轻量级组件库
 * @see https://preactjs.com/
 */
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 库类型
  libraryType: 'preact',

  // 入口配置
  entry: 'src/index.ts',

  // 输出配置
  formats: ['esm', 'cjs'],

  // 外部依赖
  external: ['preact', 'preact/hooks'],
  globals: {
    'preact': 'Preact',
  },

  // JSX 配置（Preact）
  jsx: 'react',
  jsxFactory: 'h',
  jsxFragment: 'Fragment',

  // 类型声明
  dts: true,

  // 构建目标
  target: 'es2020',

  // 保持模块结构
  preserveModules: true,

  // Tree Shaking
  treeshake: true,
})
