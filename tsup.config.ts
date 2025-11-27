/**
 * @ldesign/builder - tsup 构建配置
 *
 * 构建目标：
 * 1. 高性能构建 - 使用 esbuild 快速编译
 * 2. 双格式输出 - 同时支持 ESM 和 CJS
 * 3. 体积优化 - 生产环境压缩，移除无用代码
 * 4. 跨平台兼容 - Node.js 16+ 支持
 *
 * @author LDesign Team
 * @version 1.0.0
 */

import { defineConfig, type Options } from 'tsup'

// ============================================================
// 构建模式判断
// ============================================================
const isProduction = process.env.NODE_ENV === 'production'
const isDevelopment = !isProduction

// ============================================================
// 外部依赖配置
// 使用正则表达式批量匹配，减少配置冗余
// ============================================================
const externalDependencies: (string | RegExp)[] = [
  // Node.js 内置模块
  /^node:/,
  /^(path|fs|events|crypto|url|os|assert|util|module)$/,
  /^(worker_threads|child_process|stream|buffer|http|https|net|tls)$/,

  // 打包核心
  /^(rollup|rolldown|esbuild)$/,
  /^@rollup\//,
  /^@swc\//,

  // CLI 相关
  /^(chalk|commander|ora)$/,

  // 文件系统工具
  /^(fast-glob|glob|fs-extra|rimraf|chokidar)$/,

  // Vue 生态
  /^(@vitejs|@vue|unplugin-vue)/,
  /^vue$/,

  // React 生态
  /^react(-dom)?$/,

  // 样式处理
  /^(postcss|autoprefixer|less|sass|stylus|clean-css|cssnano)$/,
  /^rollup-plugin-/,
  /^vite-plugin-/,

  // Babel 相关
  /^@babel\//,
  /^babel-preset-/,

  // 其他依赖
  /^(typescript|tslib|zod|semver|jiti|svelte|gzip-size|pretty-bytes|vite)$/,
  /^acorn/,
]

// ============================================================
// esbuild 优化选项
// ============================================================
const esbuildOptions: Options['esbuildOptions'] = (options) => {
  // 外部包处理
  options.packages = 'external'

  // 日志配置 - 生产环境减少噪音
  options.logLevel = isProduction ? 'error' : 'warning'
  options.logLimit = 0

  // 代码优化
  options.legalComments = 'none' // 移除许可注释
  options.charset = 'utf8'
  options.treeShaking = true

  // 性能优化
  options.keepNames = true // 保留函数名，便于调试
  options.lineLimit = 0 // 不限制行长度
}

// ============================================================
// 输出文件扩展名配置
// ============================================================
const outExtension = ({ format }: { format: string }): { js: string } => ({
  js: format === 'esm' ? '.js' : '.cjs',
})

// ============================================================
// 主配置
// ============================================================
export default defineConfig({
  // 入口文件配置
  entry: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!src/tests/**',
  ],

  // 输出格式：同时支持 ESM 和 CJS
  format: ['esm', 'cjs'],

  // 输出目录
  outDir: 'dist',

  // 类型声明：使用 tsc 单独生成以避免内存问题
  dts: false,

  // 代码分割：关闭以保持简单的文件结构
  splitting: false,

  // Source Map：仅开发环境生成
  sourcemap: isDevelopment,

  // 清理输出目录：由 npm script 控制
  clean: false,

  // 压缩：仅生产环境
  minify: isProduction,

  // 输出扩展名
  outExtension,

  // 外部依赖
  external: externalDependencies,

  // 构建目标
  target: 'node16',

  // esbuild 选项
  esbuildOptions,

  // 静默模式：减少控制台输出
  silent: isProduction,

  // 构建完成回调
  onSuccess: async () => {
    const mode = isProduction ? '生产' : '开发'
    console.log(`\n✓ @ldesign/builder 构建完成 [${mode}模式]\n`)
  },
})


