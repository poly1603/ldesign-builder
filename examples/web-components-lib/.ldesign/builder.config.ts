/**
 * Web Components 组件库构建配置
 * 
 * @description 原生 Web Components 组件库（使用 TypeScript 装饰器）
 */
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 入口配置
  entry: 'src/index.ts',

  // 输出配置
  formats: ['esm', 'cjs', 'umd'],

  // UMD 配置
  umd: {
    name: 'WebComponents',
  },

  // 类型声明
  dts: true,

  // 构建目标（Web Components 需要较新浏览器）
  target: 'es2020',

  // 保持模块结构
  preserveModules: true,

  // Tree Shaking
  treeshake: true,

  // TypeScript 装饰器支持
  typescript: {
    experimentalDecorators: true,
  },
})
