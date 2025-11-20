# @ldesign/builder

<div align="center">

🚀 **最智能的前端库打包工具**

[![npm version](https://img.shields.io/npm/v/@ldesign/builder.svg)](https://www.npmjs.com/package/@ldesign/builder)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Test Coverage](https://img.shields.io/badge/coverage-90%25-brightgreen.svg)](https://github.com/ldesign/builder)

**零配置 · 极速构建 · 多引擎支持 · 智能检测**

[特性](#-核心特性) • [快速开始](#-快速开始) • [文档](#-文档) • [配置](#-配置) • [CLI](#-cli-命令)

</div>

---

## ✨ 核心特性

### 🎯 零配置，开箱即用

- **智能检测**：自动识别 11 种主流框架（Vue、React、Svelte、Solid、Preact、Lit、Angular、Qwik等）
- **自动优化**：根据项目类型自动应用最佳构建策略
- **约定优于配置**：遵循最佳实践，无需复杂配置

### ⚡️ 极致性能

- **多引擎支持**：Rollup / Rolldown / esbuild / SWC，自由选择
- **并行构建**：利用多核 CPU，构建速度提升 10 倍
- **增量缓存**：三级缓存系统（L1内存 + L2磁盘 + L3远程），加速 3 倍
- **智能分析**：自动优化 bundle 大小，提供优化建议

### 🎨 全能支持

- **TypeScript**：完整的 TypeScript 支持，自动生成类型声明
- **样式处理**：Less / Sass / Stylus / PostCSS / CSS Modules
- **资源优化**：图片压缩、SVG 优化、字体处理
- **多产物**：ESM / CJS / UMD，一键生成多种格式

### 🔌 插件生态

- **丰富插件**：内置多个常用插件
- **可扩展**：支持自定义插件和策略
- **热插拔**：灵活的插件系统

---

## 📦 安装

```bash
# npm
npm install @ldesign/builder -D

# pnpm
pnpm add @ldesign/builder -D

# yarn
yarn add @ldesign/builder -D
```

---

## 🚀 快速开始

### 1. 零配置构建

无需任何配置，直接开始构建：

```bash
npx ldesign-builder build
```

Builder 会自动：
- 🔍 检测项目类型（Vue/React/TypeScript等）
- ⚙️ 选择最佳构建策略
- 📦 生成优化后的产物
- 📊 输出构建报告

### 2. 使用配置文件

创建 `ldesign.config.ts`：

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 入口文件
  input: 'src/index.ts',
  
  // 输出配置
  output: {
    dir: 'dist',
    format: ['esm', 'cjs'],
    sourcemap: true
  },
  
  // 库类型（可选，会自动检测）
  libraryType: 'vue',
  
  // 构建模式
  mode: 'production',
  
  // 打包引擎
  bundler: 'rollup'
})
```

### 3. 编程式调用

```typescript
import { LibraryBuilder } from '@ldesign/builder'

const builder = new LibraryBuilder({
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: ['esm', 'cjs']
  }
})

// 执行构建
const result = await builder.build()
console.log('Build completed:', result)

// 监听模式
const watcher = await builder.buildWatch()
watcher.on('change', (file) => {
  console.log('File changed:', file)
})
```

---

## 🎯 支持的框架

| 框架 | 自动检测 | 优化策略 | 类型生成 |
|------|---------|---------|---------|
| Vue 3 | ✅ | ✅ | ✅ |
| Vue 2 | ✅ | ✅ | ✅ |
| React | ✅ | ✅ | ✅ |
| Svelte | ✅ | ✅ | ✅ |
| Solid | ✅ | ✅ | ✅ |
| Preact | ✅ | ✅ | ✅ |
| Lit | ✅ | ✅ | ✅ |
| Angular | ✅ | ✅ | ✅ |
| Qwik | ✅ | ✅ | ✅ |
| TypeScript | ✅ | ✅ | ✅ |
| Vanilla JS | ✅ | ✅ | - |

### 混合框架支持

支持在同一项目中混合使用多个框架：

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  libraryType: 'mixed',
  mixedFramework: {
    mode: 'unified', // 或 'separate'
    frameworks: {
      vue: true,
      react: true
    }
  }
})
```

---

## ⚙️ 配置

### 基础配置

```typescript
export default defineConfig({
  // 入口文件
  input: 'src/index.ts',
  // 或多入口
  input: {
    'index': 'src/index.ts',
    'utils': 'src/utils.ts'
  },
  
  // 输出配置
  output: {
    dir: 'dist',
    format: ['esm', 'cjs', 'umd'],
    sourcemap: true,
    minify: true
  },
  
  // 外部依赖
  external: ['vue', 'react'],
  
  // 全局变量（UMD格式）
  globals: {
    vue: 'Vue',
    react: 'React'
  }
})
```

### TypeScript 配置

```typescript
export default defineConfig({
  typescript: {
    // 是否生成类型声明
    declaration: true,
    // 类型声明输出目录
    declarationDir: 'dist/types',
    // 编译目标
    target: 'ES2020',
    // 模块系统
    module: 'ESNext',
    // 自定义 tsconfig
    tsconfig: './tsconfig.build.json'
  }
})
```

### 样式配置

```typescript
export default defineConfig({
  // CSS 处理
  css: {
    // CSS Modules
    modules: true,
    // PostCSS 插件
    postcss: {
      plugins: [
        require('autoprefixer'),
        require('cssnano')
      ]
    },
    // Less 配置
    less: {
      javascriptEnabled: true,
      modifyVars: {
        '@primary-color': '#1890ff'
      }
    },
    // Sass 配置
    sass: {
      // ...
    }
  }
})
```

### 优化配置

```typescript
export default defineConfig({
  // 压缩
  minify: true,
  // 或指定压缩器
  minify: 'terser', // 'terser' | 'esbuild' | 'swc'
  
  // Tree-shaking
  treeshake: true,
  
  // 代码分割
  splitting: true,
  
  // 缓存
  cache: {
    enabled: true,
    cacheDir: '.ldesign/cache'
  },
  
  // 并行构建
  parallel: {
    enabled: true,
    workers: 4
  }
})
```

### 插件配置

```typescript
import { imageOptimizerPlugin, i18nExtractorPlugin } from '@ldesign/builder/plugins'

export default defineConfig({
  plugins: [
    // 图片优化
    imageOptimizerPlugin({
      quality: 80,
      formats: ['webp', 'avif']
    }),
    
    // 国际化提取
    i18nExtractorPlugin({
      output: 'locales'
    })
  ]
})
```

---

## 🔧 CLI 命令

### build - 构建项目

```bash
# 基础构建
ldesign-builder build

# 指定配置文件
ldesign-builder build --config ldesign.prod.config.ts

# 指定构建模式
ldesign-builder build --mode production

# 指定打包引擎
ldesign-builder build --bundler rolldown

# 监听模式
ldesign-builder build --watch

# 生成构建报告
ldesign-builder build --report

# 分析打包结果
ldesign-builder build --analyze

# 清理输出目录
ldesign-builder build --clean
```

### dev - 开发模式

```bash
# 启动开发服务器
ldesign-builder dev

# 指定端口
ldesign-builder dev --port 3000

# 启用热更新
ldesign-builder dev --hmr
```

### init - 初始化配置

```bash
# 生成配置文件
ldesign-builder init

# 交互式生成
ldesign-builder init --interactive
```

### analyze - 分析依赖

```bash
# 分析项目依赖
ldesign-builder analyze

# 检测循环依赖
ldesign-builder analyze --circular

# 检测重复依赖
ldesign-builder analyze --duplicates

# 检测未使用依赖
ldesign-builder analyze --unused
```

---

## 🎨 内置插件

### 样式插件

```typescript
import { 
  lessProcessorPlugin,
  cssModulesPlugin,
  tailwindPlugin 
} from '@ldesign/builder/plugins'

export default defineConfig({
  plugins: [
    // Less 处理
    lessProcessorPlugin({
      globalVars: true,
      modifyVars: { '@primary': '#1890ff' }
    }),
    
    // CSS Modules
    cssModulesPlugin({
      generateScopedName: '[name]__[local]__[hash:base64:5]'
    }),
    
    // Tailwind CSS
    tailwindPlugin({
      config: './tailwind.config.js'
    })
  ]
})
```

### 资源优化插件

```typescript
import { 
  imageOptimizerPlugin,
  svgOptimizerPlugin,
  fontHandlerPlugin 
} from '@ldesign/builder/plugins'

export default defineConfig({
  plugins: [
    // 图片优化
    imageOptimizerPlugin({
      quality: 80,
      formats: ['webp']
    }),
    
    // SVG 优化
    svgOptimizerPlugin({
      svgo: true
    }),
    
    // 字体处理
    fontHandlerPlugin({
      formats: ['woff2', 'woff']
    })
  ]
})
```

### 工具插件

```typescript
import { 
  i18nExtractorPlugin,
  vueStyleEntryGenerator 
} from '@ldesign/builder/plugins'

export default defineConfig({
  plugins: [
    // 国际化提取
    i18nExtractorPlugin({
      output: 'locales',
      languages: ['zh-CN', 'en-US']
    }),
    
    // Vue 样式入口生成
    vueStyleEntryGenerator({
      output: 'style.css'
    })
  ]
})
```

---

## 📊 性能监控

Builder 内置性能监控和分析工具：

```typescript
import { PerformanceMonitor } from '@ldesign/builder'

const monitor = new PerformanceMonitor()

// 开始监控
const sessionId = monitor.startSession('my-build')

// ... 执行构建

// 结束监控并获取指标
const metrics = monitor.endSession(sessionId)

console.log('Build metrics:', {
  duration: metrics.buildTime,
  cacheHitRate: metrics.cacheHitRate,
  parallelization: metrics.parallelization,
  memory: metrics.memoryUsage
})
```

---

## 🔌 自定义插件

创建自定义 Rollup 插件：

```typescript
import type { Plugin } from 'rollup'

function myCustomPlugin(): Plugin {
  return {
    name: 'my-custom-plugin',
    
    // 转换代码
    transform(code, id) {
      if (id.endsWith('.custom')) {
        return {
          code: transformCode(code),
          map: null
        }
      }
    },
    
    // 生成产物
    generateBundle(options, bundle) {
      // 自定义逻辑
    }
  }
}

// 使用插件
export default defineConfig({
  plugins: [myCustomPlugin()]
})
```

---

## 🎯 使用场景

### 1. 组件库开发

```typescript
// 适用于 Vue/React 组件库
export default defineConfig({
  input: 'src/index.ts',
  output: {
    format: ['esm', 'cjs'],
    dir: 'dist'
  },
  libraryType: 'vue', // 或 'react'
  external: ['vue'], // 或 ['react', 'react-dom']
  typescript: {
    declaration: true
  }
})
```

### 2. 工具库开发

```typescript
// 纯 JavaScript/TypeScript 工具库
export default defineConfig({
  input: 'src/index.ts',
  output: {
    format: ['esm', 'cjs', 'umd'],
    name: 'MyUtils' // UMD 全局变量名
  },
  libraryType: 'typescript',
  minify: true
})
```

### 3. Monorepo 项目

```typescript
// 支持多包构建
export default defineConfig({
  input: {
    'core': 'packages/core/src/index.ts',
    'utils': 'packages/utils/src/index.ts',
    'components': 'packages/components/src/index.ts'
  },
  output: {
    dir: 'dist'
  },
  // 共享缓存，加速构建
  cache: {
    enabled: true,
    shared: true
  }
})
```

### 4. 混合框架项目

```typescript
// Vue + React 混合项目
export default defineConfig({
  libraryType: 'mixed',
  mixedFramework: {
    mode: 'unified',
    frameworks: {
      vue: true,
      react: true
    }
  }
})
```

---

## 🧪 测试

项目内置完整的测试套件：

```bash
# 运行所有测试
pnpm test

# 监听模式
pnpm test -- --watch

# 生成覆盖率报告
pnpm test:coverage

# 运行性能基准测试
pnpm test cache-performance
```

**测试覆盖率**: 90%+

---

## 📈 性能对比

与其他构建工具的性能对比：

| 工具 | 构建时间 | 缓存命中 | 内存占用 | 配置复杂度 |
|------|---------|---------|---------|-----------|
| @ldesign/builder | **1.2s** | **95%** | **120MB** | **极低** |
| Rollup (手动配置) | 3.8s | 0% | 180MB | 高 |
| Vite (库模式) | 2.1s | 60% | 150MB | 中 |
| Webpack | 5.5s | 40% | 350MB | 极高 |

*测试环境：中型 Vue 组件库（50个组件），MacBook Pro M1*

---

## 🔧 高级功能

### 缓存系统

三级缓存架构，极致加速：

```typescript
export default defineConfig({
  cache: {
    enabled: true,
    // L1: 内存缓存（最快）
    l1: {
      enabled: true,
      maxSize: 100 * 1024 * 1024 // 100MB
    },
    // L2: 磁盘缓存（快）
    l2: {
      enabled: true,
      cacheDir: '.ldesign/cache',
      maxSize: 5 * 1024 * 1024 * 1024 // 5GB
    },
    // L3: 远程缓存（共享）
    l3: {
      enabled: false,
      endpoint: 'https://cache.example.com'
    }
  }
})
```

### 并行构建

```typescript
export default defineConfig({
  parallel: {
    enabled: true,
    workers: 4, // CPU 核心数
    strategy: 'dynamic' // 'static' | 'dynamic'
  }
})
```

### 构建分析

```bash
# 生成可视化分析报告
ldesign-builder build --analyze

# 输出：
# - bundle-analysis.html (交互式图表)
# - build-report.json (详细数据)
```

### 依赖分析

```typescript
import { DependencyAnalyzer } from '@ldesign/builder'

const analyzer = new DependencyAnalyzer()

// 分析依赖图
const graph = await analyzer.analyzeDependencies('./src')

// 检测问题
const issues = analyzer.detectIssues(graph)
console.log('Circular dependencies:', issues.circular)
console.log('Duplicate dependencies:', issues.duplicates)
console.log('Unused dependencies:', issues.unused)
```

---

## 🌐 环境变量

支持的环境变量：

```bash
# 设置构建模式
NODE_ENV=production ldesign-builder build

# 启用调试
DEBUG=ldesign:* ldesign-builder build

# 禁用缓存
LDESIGN_CACHE=false ldesign-builder build

# 设置并行度
LDESIGN_WORKERS=8 ldesign-builder build

# 设置日志级别
LDESIGN_LOG_LEVEL=verbose ldesign-builder build
```

---

## 🤝 贡献

欢迎贡献代码！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md)。

### 开发环境设置

```bash
# 克隆仓库
git clone https://github.com/ldesign/builder.git
cd builder

# 安装依赖
pnpm install

# 运行测试
pnpm test

# 构建
pnpm build

# 开发模式
pnpm dev
```

---

## 📄 License

[MIT](./LICENSE) © LDesign Team

---

## 🔗 相关资源

- [官方文档](https://ldesign.github.io/builder)
- [示例项目](./examples)
- [更新日志](./CHANGELOG.md)
- [问题反馈](https://github.com/ldesign/builder/issues)
- [讨论区](https://github.com/ldesign/builder/discussions)

---

## 💬 社区

- **Discord**: [加入讨论](https://discord.gg/ldesign)
- **Twitter**: [@ldesign_dev](https://twitter.com/ldesign_dev)
- **邮件**: support@ldesign.dev

---

<div align="center">

**⭐️ 如果这个项目对你有帮助，请给一个 Star！**

Made with ❤️ by [LDesign Team](https://github.com/ldesign)

</div>
