import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  libraryType: 'solid',
  input: 'src/index.tsx',

  // UMD 构建配置 - 必须显式启用
  umd: {
    enabled: true
  },

  output: {
    esm: { dir: 'es', format: 'esm', preserveStructure: true, dts: true, sourcemap: true },
    cjs: { dir: 'lib', format: 'cjs', preserveStructure: true, dts: true, sourcemap: true },
    umd: { dir: 'dist', format: 'umd', name: 'SolidLibExample', minify: true, sourcemap: true, input: 'src/index.tsx', globals: { 'solid-js': 'Solid', 'solid-js/web': 'SolidWeb' } }
  },
  external: ['solid-js', 'solid-js/web', 'solid-js/store'],
  globals: { 'solid-js': 'Solid', 'solid-js/web': 'SolidWeb' },
  typescript: { tsconfig: './tsconfig.json', target: 'es2020' },
  style: { preprocessor: 'less', extract: true, minimize: true },
  performance: { treeshaking: true, minify: true },
  dts: true,
  sourcemap: true,
  clean: true
})

