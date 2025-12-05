/**
 * 图标字体库构建配置
 */
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // libraryType: 'style', // 自动检测
  // input: 'src/index.ts', // 默认值

  output: [
    {
      // ES modules - 编译后的 CSS
      format: 'esm',
      dir: 'es',
      preserveModules: true,
      preserveModulesRoot: 'src',
      entryFileNames: '[name].mjs'
    },
    {
      // ES modules - 保留源文件
      format: 'esm',
      dir: 'esm',
      preserveModules: true,
      preserveModulesRoot: 'src',
      entryFileNames: '[name].mjs',
      preserveLessSource: true
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
      name: 'IconFontLib',
      entryFileNames: 'icon-font-lib.js'
    }
  ]
  // typescript: { ... }, // 默认启用
  // style: { ... } // 默认 auto
})
