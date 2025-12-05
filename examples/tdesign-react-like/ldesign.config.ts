/**
 * TDesign React Like 组件库构建配置
 */
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  libraryType: 'react',
  input: 'src/index.ts',
  output: [
    { format: 'esm', dir: 'es', preserveModules: true, preserveModulesRoot: 'src', entryFileNames: '[name].mjs' },
    { format: 'cjs', dir: 'lib', preserveModules: true, preserveModulesRoot: 'src', entryFileNames: '[name].js' }
  ],
  external: ['react', 'react-dom'],
  typescript: { enabled: true, declaration: true, declarationDir: 'es' },
  style: { preprocessor: 'less', extract: true, generateStyleEntry: true }
})
