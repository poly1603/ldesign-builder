/**
 * CSS 框架构建配置
 * 
 * @description 纯 CSS/Less 样式框架
 */
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 入口配置
  entry: 'src/index.ts',

  // 输出配置
  formats: ['esm', 'cjs'],

  // 类型声明
  dts: true,

  // 构建目标
  target: 'es2020',

  // 样式配置
  style: {
    extract: true,
    preprocessor: 'less',
    minimize: true,
    autoprefixer: true,
  },

  // Tree Shaking
  treeshake: true,
})
