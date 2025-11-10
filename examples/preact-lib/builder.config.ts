import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  libraryType: 'preact',
  input: 'src/index.tsx',

  // UMD 构建配置 - 必须显式启用
  umd: {
    enabled: true
  },

  output: {
    esm: { dir: 'es', format: 'esm', preserveStructure: true, dts: true, sourcemap: true },
    cjs: { dir: 'lib', format: 'cjs', preserveStructure: true, dts: true, sourcemap: true },
    umd: { dir: 'dist', format: 'umd', name: 'PreactLibExample', minify: true, sourcemap: true, input: 'src/index.tsx', globals: { 'preact': 'preact', 'preact/hooks': 'preactHooks' } }
  },
  external: ['preact', 'preact/hooks'],
  globals: { 'preact': 'preact', 'preact/hooks': 'preactHooks' },
  typescript: { tsconfig: './tsconfig.json', target: 'es2020' },
  style: { preprocessor: 'less', extract: true, minimize: true },
  performance: { treeshaking: true, minify: true },
  dts: true,
  sourcemap: true,
  clean: true
})

