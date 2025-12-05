/**
 * TDesign React Like 组件库构建配置
 */
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  libraryType: 'react', // React 组件库
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
      preserveLessSource: true
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
      name: 'TDesignReactLike',
      entryFileNames: 'tdesign-react-like.js'
      // globals: { react: 'React', 'react-dom': 'ReactDOM' } // 默认已包含
    }
  ]
  // external: ['react', 'react-dom'], // 默认已包含
  // typescript: { ... }, // 默认启用
  // style: { ... } // 默认 auto
})
