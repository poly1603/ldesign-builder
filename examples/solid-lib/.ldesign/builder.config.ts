/**
 * Solid.js 组件库构建配置
 * 
 * @description Solid.js 响应式组件库
 * @see https://www.solidjs.com/
 */
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 入口配置
  entry: 'src/index.ts',

  // 输出配置
  formats: ['esm', 'cjs'],

  // 外部依赖
  external: ['solid-js', 'solid-js/web', 'solid-js/store'],
  globals: {
    'solid-js': 'Solid',
  },

  // JSX 配置（Solid 使用 preserve 模式）
  jsx: 'preserve',

  // 类型声明
  dts: true,

  // 构建目标
  target: 'es2020',

  // 保持模块结构
  preserveModules: true,

  // Tree Shaking（Solid 细粒度响应式需要）
  treeshake: true,
})
