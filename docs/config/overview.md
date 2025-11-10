# 配置概览

@ldesign/builder 提供了灵活的配置系统，支持零配置和完全自定义两种模式。

## 配置文件

配置文件可以使用多种格式：

### TypeScript（推荐）

```typescript
// .ldesign/builder.config.ts
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 你的配置
})
```

### JavaScript

```javascript
// .ldesign/builder.config.js
export default {
  // 你的配置
}
```

### JSON

```json
// .ldesign/builder.json
{
  // 你的配置
}
```

### package.json

```json
{
  "builder": {
    // 你的配置
  }
}
```

## 配置查找顺序

@ldesign/builder 会按以下顺序查找配置文件：

1. 命令行指定: `--config custom.config.ts`
2. `.ldesign/builder.config.ts`
3. `.ldesign/builder.config.js`
4. `.ldesign/builder.json`
5. `builder.config.ts`
6. `builder.config.js`
7. `package.json` 中的 `builder` 字段

## 完整配置示例

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // ========== 输入配置 ==========
  
  // 入口文件
  entry: 'src/index.ts',
  // 或多个入口
  entry: {
    main: 'src/index.ts',
    utils: 'src/utils.ts'
  },
  
  // 项目根目录
  cwd: process.cwd(),
  
  // 库类型（自动检测）
  libraryType: 'vue3', // 'vue2' | 'vue3' | 'react' | 'svelte' | ...
  
  // ========== 输出配置 ==========
  
  output: {
    // 输出格式
    formats: ['esm', 'cjs', 'umd'],
    
    // 输出目录
    dir: {
      esm: 'es',
      cjs: 'lib',
      umd: 'dist'
    },
    
    // 文件名模板
    filename: {
      esm: '[name].js',
      cjs: '[name].cjs',
      umd: '[name].umd.js'
    },
    
    // 库名称（UMD 格式需要）
    name: 'MyLibrary',
    
    // 全局变量名
    globals: {
      vue: 'Vue',
      react: 'React'
    },
    
    // 是否生成 sourcemap
    sourcemap: true,
    
    // Banner 注释
    banner: '/* My Library v1.0.0 */',
    
    // Footer 注释
    footer: '/* Copyright 2024 */'
  },
  
  // ========== 打包器配置 ==========
  
  // 选择打包器
  bundler: 'rollup', // 'rollup' | 'esbuild' | 'swc' | 'rolldown'
  
  // Rollup 特定配置
  rollup: {
    treeshake: true,
    preserveModules: false
  },
  
  // esbuild 特定配置
  esbuild: {
    platform: 'node',
    target: 'es2020'
  },
  
  // ========== 外部依赖 ==========
  
  // 外部依赖（不打包）
  external: ['vue', 'react'],
  
  // 或使用函数
  external: (id) => {
    return /^vue/.test(id)
  },
  
  // peer依赖自动external
  externalPeerDependencies: true,
  
  // ========== 插件 ==========
  
  plugins: [
    // Vue 插件（自动添加）
    // React 插件（自动添加）
  ],
  
  // ========== TypeScript ==========
  
  typescript: {
    // tsconfig 路径
    tsconfig: './tsconfig.json',
    
    // 是否生成声明文件
    declaration: true,
    
    // 声明文件输出目录
    declarationDir: 'types',
    
    // 是否检查类型
    check: true
  },
  
  // ========== 优化配置 ==========
  
  optimization: {
    // 是否压缩
    minify: true,
    
    // 压缩器
    minifier: 'terser', // 'terser' | 'esbuild' | 'swc'
    
    // Tree-shaking
    treeshake: true,
    
    // 代码分割
    splitting: false,
    
    // 压缩选项
    minifyOptions: {
      compress: {
        drop_console: true
      }
    }
  },
  
  // ========== 样式处理 ==========
  
  css: {
    // 是否提取CSS
    extract: true,
    
    // CSS模块
    modules: true,
    
    // PostCSS 配置
    postcss: {
      plugins: []
    },
    
    // 预处理器
    preprocessor: 'less', // 'less' | 'sass' | 'stylus'
  },
  
  // ========== 资源处理 ==========
  
  assets: {
    // 是否内联小文件
    inline: true,
    
    // 内联阈值（字节）
    inlineLimit: 4096,
    
    // 输出目录
    outDir: 'assets'
  },
  
  // ========== 构建模式 ==========
  
  // 开发或生产模式
  mode: 'production', // 'development' | 'production'
  
  // 环境变量
  env: {
    NODE_ENV: 'production'
  },
  
  // ========== 性能配置 ==========
  
  performance: {
    // 是否启用并行构建
    parallel: true,
    
    // 工作线程数
    workers: 4,
    
    // 是否启用缓存
    cache: true,
    
    // 缓存目录
    cacheDir: 'node_modules/.cache/builder'
  },
  
  // ========== 监听配置 ==========
  
  watch: {
    // 是否启用监听
    enabled: false,
    
    // 监听路径
    paths: ['src/**/*'],
    
    // 忽略路径
    ignored: ['**/*.test.ts'],
    
    // 防抖延迟
    debounce: 100
  },
  
  // ========== Monorepo 配置 ==========
  
  monorepo: {
    // 是否启用
    enabled: true,
    
    // workspace 根目录
    root: '../..',
    
    // 包管理器
    packageManager: 'pnpm', // 'pnpm' | 'lerna' | 'yarn' | 'nx'
  },
  
  // ========== 钩子 ==========
  
  hooks: {
    // 构建前
    onBeforeBuild: async (context) => {
      console.log('Building...')
    },
    
    // 构建后
    onAfterBuild: async (context) => {
      console.log('Build complete!')
    },
    
    // 错误处理
    onError: async (error) => {
      console.error('Build failed:', error)
    }
  }
})
```

## 配置分类

### 核心配置

最常用的配置选项：

- [输入配置](/config/input) - 入口文件、项目类型
- [输出配置](/config/output) - 输出格式、目录、文件名
- [打包器配置](/config/bundler) - 选择和配置打包引擎

### 高级配置

进阶使用的配置：

- [插件配置](/config/plugins) - 插件系统
- [优化配置](/config/optimization) - 性能优化选项

### 专项配置

特定场景的配置：

- TypeScript - 类型声明生成
- CSS - 样式处理
- Assets - 资源处理
- Watch - 监听模式
- Monorepo - 多包项目

## 配置合并

配置文件会与默认配置合并：

```typescript
// 默认配置
const defaultConfig = {
  bundler: 'rollup',
  output: {
    formats: ['esm', 'cjs']
  }
}

// 用户配置
const userConfig = {
  output: {
    formats: ['esm']
  }
}

// 最终配置（深度合并）
const finalConfig = {
  bundler: 'rollup',  // 保留默认值
  output: {
    formats: ['esm']  // 用户配置覆盖
  }
}
```

## 环境变量

可以在配置中使用环境变量：

```typescript
export default defineConfig({
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  
  optimization: {
    minify: process.env.MINIFY === 'true'
  },
  
  env: {
    API_URL: process.env.API_URL
  }
})
```

## 条件配置

根据不同条件使用不同配置：

```typescript
export default defineConfig(({ mode, command }) => {
  if (mode === 'production') {
    return {
      optimization: {
        minify: true
      }
    }
  }
  
  return {
    optimization: {
      minify: false
    }
  }
})
```

## 多配置

支持导出多个配置：

```typescript
export default [
  // 浏览器版本
  defineConfig({
    entry: 'src/index.ts',
    output: {
      formats: ['esm', 'umd']
    }
  }),
  
  // Node.js 版本
  defineConfig({
    entry: 'src/node.ts',
    output: {
      formats: ['cjs']
    }
  })
]
```

## 配置继承

从其他配置文件继承：

```typescript
import baseConfig from './base.config'

export default defineConfig({
  ...baseConfig,
  
  // 覆盖特定选项
  bundler: 'esbuild'
})
```

## 配置验证

配置会自动验证，错误会有详细提示：

```bash
✖ 配置错误: output.formats
  - 应该是数组
  - 收到: "esm"
  
建议:
  output: {
    formats: ['esm'] // ✅ 正确
  }
```

## 配置工具

### defineConfig

提供类型提示的配置助手：

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 自动补全和类型检查
})
```

### loadConfig

手动加载配置：

```typescript
import { loadConfig } from '@ldesign/builder'

const config = await loadConfig()
console.log(config)
```

### validateConfig

验证配置：

```typescript
import { validateConfig } from '@ldesign/builder'

const isValid = validateConfig(myConfig)
```

## 调试配置

查看最终使用的配置：

```bash
# 打印配置
ldesign-builder build --debug

# 输出配置到文件
ldesign-builder build --debug --output-config config.json
```

## 下一步

- 📖 详细了解 [输入配置](/config/input)
- 📦 学习 [输出配置](/config/output)
- ⚡ 探索 [打包器配置](/config/bundler)
- 🔌 使用 [插件系统](/config/plugins)
- 🚀 优化 [性能配置](/config/optimization)
