/**
 * TDesign 风格构建配置示例
 * 
 * 此配置展示如何使用 @ldesign/builder 生成与 TDesign 完全一致的产物结构
 */
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 输入配置
  input: 'src/**/*.{ts,tsx,vue}',

  // 输出配置 - TDesign 风格
  output: {
    // ES 模块 - 使用 .mjs + 编译后的 CSS
    es: {
      dir: 'es'
      // 自动应用:
      // - 文件扩展名: .mjs
      // - 样式模式: multi (每个组件独立 CSS)
      // - 样式路径转换: import './style' → import './style/css.mjs'
    },

    // ESM 模块 - 使用 .js + 保留 less 源文件
    esm: {
      dir: 'esm'
      // 自动应用:
      // - 文件扩展名: .js
      // - 样式模式: source (保留 less 源文件)
      // - 支持自定义主题
    },

    // CJS 模块 - 忽略样式
    cjs: {
      dir: 'cjs'
      // 自动应用:
      // - 文件扩展名: .js
      // - 样式模式: ignore (完全忽略样式)
      // - 适用于 SSR
    },

    // UMD 模块 - 单个 CSS
    umd: {
      dir: 'dist',
      name: 'MyComponentLibrary'
      // 自动应用:
      // - 样式模式: single (打包到单个 CSS)
      // - 生成压缩版本
    }
  },

  // 外部依赖
  external: ['vue', '@vueuse/core'],

  // 全局变量映射 (UMD 使用)
  globals: {
    vue: 'Vue',
    '@vueuse/core': 'VueUse'
  },

  // 库类型
  libraryType: 'vue3',

  // 打包器
  bundler: 'rollup'
})

