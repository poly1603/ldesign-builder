import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 暂时使用 react 类型,因为 Qwik 依赖安装有问题
  // Qwik 的 JSX 语法与 React 类似,可以用 React 策略构建
  libraryType: 'react',
  input: 'src/index.ts',

  // UMD 构建配置 - 必须显式启用
  umd: {
    enabled: true
  },

  output: {
    esm: { dir: 'es', format: 'esm', preserveStructure: true, dts: true, sourcemap: true },
    cjs: { dir: 'lib', format: 'cjs', preserveStructure: true, dts: true, sourcemap: true },
    umd: { dir: 'dist', format: 'umd', name: 'QwikLibExample', minify: true, sourcemap: true, input: 'src/index.ts', globals: { 'react': 'React', 'react-dom': 'ReactDOM' } }
  },
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  globals: { 'react': 'React', 'react-dom': 'ReactDOM' },
  typescript: { tsconfig: './tsconfig.json', target: 'es2020' },
  style: { preprocessor: 'less', extract: true, minimize: true },
  performance: { treeshaking: true, minify: true },
  dts: true,
  sourcemap: true,
  clean: true
})

