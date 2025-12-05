/**
 * 工具函数库构建配置
 */
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // libraryType: 'typescript', // 自动检测
  // input: 'src/index.ts', // 默认值

  output: [
    {
      // ES modules
      format: 'esm',
      dir: 'es',
      preserveModules: true,
      preserveModulesRoot: 'src',
      entryFileNames: '[name].mjs'
    },
    {
      // ES modules (别名)
      format: 'esm',
      dir: 'esm',
      preserveModules: true,
      preserveModulesRoot: 'src',
      entryFileNames: '[name].mjs'
    },
    {
      // CommonJS
      format: 'cjs',
      dir: 'lib',
      preserveModules: true,
      preserveModulesRoot: 'src',
      entryFileNames: '[name].js'
    },
    {
      // UMD
      format: 'umd',
      dir: 'dist',
      name: 'UtilsLib',
      entryFileNames: 'utils-lib.js'
    }
  ]
  // typescript: { ... } // 默认启用
})
