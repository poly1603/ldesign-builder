import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  libraryType: 'vue2',
  input: 'src/index.ts',

  // UMD 构建配置 - 必须显式启用
  umd: {
    enabled: true
  },

  output: {
    esm: { dir: 'es', format: 'esm', preserveStructure: true, dts: true, sourcemap: true },
    cjs: { dir: 'lib', format: 'cjs', preserveStructure: true, dts: true, sourcemap: true },
    umd: { dir: 'dist', format: 'umd', name: 'Vue2LibExample', minify: true, sourcemap: true, input: 'src/index.ts', globals: { 'vue': 'Vue' } }
  },
  external: ['vue'],
  globals: { 'vue': 'Vue' },
  vue: { target: 'vue2', style: { preprocessor: 'less' } },
  typescript: { tsconfig: './tsconfig.json', target: 'es2020' },
  style: { preprocessor: 'less', extract: true, minimize: true },
  performance: { treeshaking: true, minify: true },
  dts: true,
  sourcemap: true,
  clean: true
})

