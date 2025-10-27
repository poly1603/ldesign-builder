import { defineConfig } from '@ldesign/builder'

/**
 * 混合框架项目配置示例
 * 
 * 这个配置展示了如何在同一个项目中同时使用 Vue 和 React 组件
 */
export default defineConfig({
  // 使用增强混合策略
  libraryType: 'enhanced-mixed',

  // 混合框架配置
  mixedFramework: {
    // 打包模式：separated - 分离打包各框架代码
    mode: 'separated',

    // JSX 处理策略
    jsx: {
      // 自动检测文件所属框架
      autoDetect: true,

      // 默认框架（当无法自动检测时使用）
      defaultFramework: 'react',

      // 文件关联规则
      fileAssociations: {
        '**/*.vue.tsx': 'vue',      // .vue.tsx 文件使用 Vue JSX
        '**/*.react.tsx': 'react',  // .react.tsx 文件使用 React JSX
        '**/vue/**/*.tsx': 'vue',   // vue 目录下的 TSX 使用 Vue JSX
        '**/react/**/*.tsx': 'react' // react 目录下的 TSX 使用 React JSX
      }
    },

    // 框架特定配置
    frameworks: {
      vue: {
        version: 3,
        jsx: {
          optimize: true,
          mergeProps: true,
          transformOn: true
        },
        // Vue 特定的外部依赖
        external: ['vue', 'vue-router', 'pinia']
      },
      react: {
        version: '18',
        jsx: 'automatic', // 使用新的 JSX 转换
        // React 特定的外部依赖
        external: ['react', 'react-dom', 'react-router-dom']
      }
    },

    // 文件分组规则（用于自定义模式）
    groups: {
      'vue-components': {
        pattern: 'src/vue/**',
        framework: 'vue',
        output: {
          dir: 'dist/vue',
          format: 'es'
        }
      },
      'react-components': {
        pattern: 'src/react/**',
        framework: 'react',
        output: {
          dir: 'dist/react',
          format: 'es'
        }
      },
      'shared-utils': {
        pattern: 'src/utils/**',
        framework: 'auto', // 自动检测
        output: {
          dir: 'dist/shared',
          format: 'cjs' // 共享代码使用 CommonJS
        }
      }
    },

    // 输出配置
    output: {
      // 保留模块结构
      preserveModules: true,
      preserveModulesRoot: 'src',

      // 分离框架代码
      separateFrameworks: true,

      // 按框架分目录
      frameworkDirs: {
        vue: 'vue',
        react: 'react',
        shared: 'shared'
      }
    },

    // 高级选项
    advanced: {
      // 并行检测框架类型
      parallelDetection: true,

      // 缓存检测结果
      cacheDetection: true,

      // 智能外部化（自动外部化未使用的框架）
      smartExternals: true,

      // 不共享运行时（各框架独立）
      sharedRuntime: false
    }
  },

  // 自动检测框架
  autoDetectFramework: true,

  // 入口配置
  input: {
    'index': 'src/index.ts',
    'vue/index': 'src/vue/index.ts',
    'react/index': 'src/react/index.ts'
  },

  // 输出配置
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: true,
    // 保留原始文件结构
    preserveModules: true,
    // 入口文件命名
    entryFileNames: '[name].js',
    // chunk 文件命名
    chunkFileNames: 'chunks/[name]-[hash].js'
  },

  // TypeScript 配置
  typescript: {
    declaration: true,
    declarationMap: true,
    // 为每个框架生成单独的类型定义
    declarationDir: (id) => {
      if (id.includes('/vue/')) return 'dist/vue/types'
      if (id.includes('/react/')) return 'dist/react/types'
      return 'dist/types'
    }
  },

  // 外部依赖（智能外部化会补充）
  external: [
    // 共享的外部依赖
    'tslib',
    '@babel/runtime'
  ],

  // 别名配置
  alias: {
    '@': './src',
    '@vue': './src/vue',
    '@react': './src/react',
    '@shared': './src/shared'
  },

  // 优化配置
  optimization: {
    // 启用 Tree Shaking
    treeShake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false
    },

    // 代码分割
    manualChunks: {
      // Vue 运行时
      'vue-runtime': ['vue', 'vue-router', 'pinia'],
      // React 运行时
      'react-runtime': ['react', 'react-dom', 'react-router-dom'],
      // 工具库
      'utils': ['lodash-es', 'dayjs']
    }
  },

  // 插件配置
  plugins: [
    // 可以添加额外的插件
  ],

  // 构建后验证
  postBuildValidation: {
    enabled: true,
    checks: {
      // 检查类型定义
      types: true,
      // 检查导出
      exports: true,
      // 检查包大小
      size: {
        limit: '100kb',
        gzip: true
      }
    }
  }
})

/**
 * 不同打包模式说明：
 * 
 * 1. unified（统一模式）
 *    - 所有代码打包到一个文件
 *    - 适合小型项目或组件数量较少的情况
 *    - 输出结构简单
 * 
 * 2. separated（分离模式）
 *    - Vue 和 React 代码分别打包
 *    - 各框架有独立的入口和输出
 *    - 适合大型项目，便于按需加载
 * 
 * 3. component（组件模式）
 *    - 每个组件独立打包
 *    - 保留原始目录结构
 *    - 最大化 Tree Shaking 效果
 * 
 * 4. custom（自定义模式）
 *    - 通过 groups 配置自定义分组
 *    - 灵活控制输出结构
 *    - 适合特殊需求
 */

