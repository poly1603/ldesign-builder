/**
 * TDesign-like Vue3 组件库构建配置
 */
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // libraryType: 'vue3', // 自动检测
  // input: 'src/index.ts', // 默认值

  output: [
    {
      // ES modules - 编译后的 CSS (快速使用)
      format: 'esm',
      dir: 'es',
      preserveModules: true,
      preserveModulesRoot: 'src',
      entryFileNames: '[name].mjs'
    },
    {
      // ES modules - 保留 Less 源文件 (支持用户定制变量)
      format: 'esm',
      dir: 'esm',
      preserveModules: true,
      preserveModulesRoot: 'src',
      entryFileNames: '[name].mjs',
      preserveLessSource: true // 显式配置保留 Less
    },
    {
      // CommonJS - 编译后的 CSS
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
      name: 'TDesignLike',
      entryFileNames: 'tdesign-like.js'
      // globals: { vue: 'Vue' } // 默认已包含
    }
  ]
  // external: ['vue'], // 默认已包含
  // typescript: { ... }, // 默认启用
  // style: { ... }, // 默认 auto
  // vue: { ... } // 默认值
})
