import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  libraryType: 'svelte',
  input: 'src/index.ts',

  // UMD 构建配置 - 必须显式启用
  umd: {
    enabled: true
  },

  output: {
    esm: { dir: 'es', format: 'esm', preserveStructure: true, dts: true, sourcemap: true },
    cjs: { dir: 'lib', format: 'cjs', preserveStructure: true, dts: true, sourcemap: true },
    umd: { dir: 'dist', format: 'umd', name: 'SvelteLibExample', minify: true, sourcemap: true, input: 'src/index.ts' }
  },
  external: ['svelte', 'svelte/internal'],
  typescript: { tsconfig: './tsconfig.json', target: 'es2020' },
  style: { preprocessor: 'less', extract: true, minimize: true },
  performance: { treeshaking: true, minify: true },
  dts: true,
  sourcemap: true,
  clean: true
})

