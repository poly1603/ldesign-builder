/**
 * 图标字体库构建配置
 */
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  libraryType: 'style',
  input: 'src/index.ts',
  output: [
    { format: 'esm', dir: 'es', entryFileNames: '[name].mjs' },
    { format: 'cjs', dir: 'lib', entryFileNames: '[name].js' }
  ],
  typescript: { enabled: true, declaration: true },
  style: {
    preprocessor: 'less',
    extract: 'dist/index.css',
    sourceMap: true
  },
  assets: {
    fonts: {
      include: ['**/*.woff', '**/*.woff2', '**/*.ttf', '**/*.eot'],
      outputDir: 'dist/fonts'
    }
  }
})
