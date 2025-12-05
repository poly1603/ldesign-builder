/**
 * Alpine.js 插件库构建配置
 * 
 * @description Alpine.js 指令和插件库
 * @see https://alpinejs.dev/
 */
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 入口配置
  entry: 'src/index.ts',

  // 输出配置
  formats: ['esm', 'cjs', 'umd'],
  outDir: 'dist',

  // UMD 配置
  umd: {
    name: 'AlpinePlugins',
    globals: {
      'alpinejs': 'Alpine',
    },
  },

  // 外部依赖
  external: ['alpinejs'],

  // 类型声明
  dts: true,

  // 构建目标
  target: 'es2020',

  // Tree Shaking
  treeshake: true,
})
