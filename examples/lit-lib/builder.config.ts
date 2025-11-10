import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  libraryType: 'lit',
  input: 'src/index.ts',

  // UMD 构建配置 - 必须显式启用
  umd: {
    enabled: true
  },

  output: {
    esm: { dir: 'es', format: 'esm', preserveStructure: true, dts: true, sourcemap: true },
    cjs: { dir: 'lib', format: 'cjs', preserveStructure: true, dts: true, sourcemap: true },
    umd: { dir: 'dist', format: 'umd', name: 'LitLibExample', minify: true, sourcemap: true, input: 'src/index.ts', globals: { 'lit': 'Lit' } }
  },
  external: ['lit', 'lit/decorators.js', 'lit/directives/class-map.js'],
  globals: { 'lit': 'Lit' },
  typescript: { tsconfig: './tsconfig.json', target: 'es2020' },
  style: { preprocessor: 'less', extract: true, minimize: true },
  performance: { treeshaking: true, minify: true },
  dts: true,
  sourcemap: true,
  clean: true
})

