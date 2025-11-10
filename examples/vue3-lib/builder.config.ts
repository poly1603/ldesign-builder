import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 库类型
  libraryType: 'vue3',

  // 入口文件
  input: 'src/index.ts',

  // UMD 构建配置 - 必须显式启用
  umd: {
    enabled: true
  },

  // 输出配置 - 支持 ESM, CJS, UMD 三种格式
  output: {
    // ESM 格式 - 输出到 es/ 目录
    esm: {
      dir: 'es',
      format: 'esm',
      preserveStructure: true,
      dts: true,
      sourcemap: true
    },
    
    // CJS 格式 - 输出到 lib/ 目录
    cjs: {
      dir: 'lib',
      format: 'cjs',
      preserveStructure: true,
      dts: true,
      sourcemap: true
    },
    
    // UMD 格式 - 输出到 dist/ 目录
    umd: {
      dir: 'dist',
      format: 'umd',
      name: 'Vue3LibExample',
      minify: true,
      sourcemap: true,
      input: 'src/index.ts', // 显式指定 UMD 入口文件
      globals: {
        'vue': 'Vue'
      }
    }
  },
  
  // 外部依赖
  external: ['vue'],
  
  // 全局变量映射
  globals: {
    'vue': 'Vue'
  },
  
  // Vue 配置
  vue: {
    target: 'vue3',
    style: {
      preprocessor: 'less'
    }
  },
  
  // TypeScript 配置
  typescript: {
    tsconfig: './tsconfig.json',
    target: 'es2020'
  },
  
  // 样式配置
  style: {
    preprocessor: 'less',
    extract: true,
    minimize: true,
    modules: false
  },
  
  // 性能配置
  performance: {
    treeshaking: true,
    minify: true
  },
  
  // 生成类型声明文件
  dts: true,
  
  // 生成 sourcemap
  sourcemap: true,
  
  // 清理输出目录
  clean: true
})

