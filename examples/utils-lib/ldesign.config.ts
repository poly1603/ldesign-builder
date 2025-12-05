/**
 * 工具函数库构建配置
 */

import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  libraryType: 'typescript',
  input: 'src/index.ts',
  output: [
    { format: 'esm', dir: 'es', entryFileNames: '[name].mjs' },
    { format: 'cjs', dir: 'lib', entryFileNames: '[name].js' }
  ],
  typescript: {
    enabled: true,
    declaration: true,
    declarationDir: 'es'
  },
  optimization: {
    treeshake: true,
    minify: true,
    sourcemap: true
  }
})
