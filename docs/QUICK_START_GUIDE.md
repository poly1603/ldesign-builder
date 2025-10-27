# @ldesign/builder 快速开始指南

> **5 分钟上手，构建你的第一个库！** 🚀

---

## 📦 安装

### 使用 npm
```bash
npm install @ldesign/builder --save-dev
```

### 使用 pnpm（推荐）
```bash
pnpm add @ldesign/builder -D
```

### 使用 yarn
```bash
yarn add @ldesign/builder --dev
```

---

## 🎯 最简单的使用方式

### 零配置构建

**步骤1：创建入口文件**
```typescript
// src/index.ts
export function hello(name: string): string {
  return `Hello, ${name}!`
}
```

**步骤2：在 package.json 添加构建脚本**
```json
{
  "scripts": {
    "build": "ldesign-builder build"
  }
}
```

**步骤3：运行构建**
```bash
npm run build
```

**就这么简单！** ✨

输出结果：
```
dist/
├── index.js      # ESM 格式
├── index.cjs     # CJS 格式
├── index.d.ts    # TypeScript 声明文件
└── index.d.cts   # CJS 声明文件
```

---

## ⚙️ 使用配置文件

### 创建配置文件

```bash
# 创建 TypeScript 配置文件（推荐）
touch ldesign.config.ts
```

### 基础配置示例

```typescript
// ldesign.config.ts
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 入口文件
  input: 'src/index.ts',
  
  // 输出配置
  output: {
    dir: 'dist',
    format: ['esm', 'cjs'],  // 输出 ESM 和 CJS 两种格式
    sourcemap: true           // 生成 source map
  },
  
  // 外部依赖（不会被打包）
  external: ['vue', 'react'],
  
  // 启用代码压缩
  minify: true,
  
  // 启用 tree-shaking
  treeshake: true
})
```

### 运行构建

```bash
npm run build
```

---

## 🎨 常见场景示例

### 场景1：Vue 3 组件库

```typescript
// ldesign.config.ts
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  
  output: {
    dir: 'dist',
    format: ['esm', 'cjs'],
    preserveModules: true  // 保持模块结构，支持按需引入
  },
  
  // 自动检测为 Vue 3 项目
  // 会自动应用 Vue 3 构建策略
  
  external: ['vue'],
  
  // Vue 3 组件库推荐配置
  treeshake: true,
  minify: true,
  sourcemap: true
})
```

**package.json 配置：**
```json
{
  "name": "@myorg/ui",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "files": ["dist"],
  "peerDependencies": {
    "vue": "^3.0.0"
  }
}
```

### 场景2：React 组件库

```typescript
// ldesign.config.ts
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.tsx',
  
  output: {
    dir: 'dist',
    format: ['esm', 'cjs'],
    preserveModules: true
  },
  
  external: ['react', 'react-dom'],
  
  // React 组件库推荐配置
  jsx: 'react',  // JSX 编译模式
  minify: true,
  sourcemap: true
})
```

### 场景3：TypeScript 工具库

```typescript
// ldesign.config.ts
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  
  output: {
    dir: 'dist',
    format: ['esm', 'cjs'],
    preserveModules: false  // 打包为单文件
  },
  
  // 纯 TypeScript 库，无需外部依赖
  external: [],
  
  minify: true,
  sourcemap: true,
  
  // 生成声明文件
  dts: true
})
```

### 场景4：Monorepo 项目

```typescript
// 根目录 ldesign.config.ts
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // Monorepo 模式
  monorepo: true,
  
  // 包目录
  packages: 'packages/*',
  
  // 并行构建
  parallel: true,
  
  // 增量构建
  incremental: true,
  
  // 共享配置
  shared: {
    external: ['vue', 'react'],
    minify: true,
    sourcemap: true
  }
})
```

**构建所有包：**
```bash
# 一键构建所有包（按依赖顺序）
ldesign-builder build --all

# 只构建变更的包
ldesign-builder build --changed
```

---

## 🔧 CLI 命令详解

### 基础命令

```bash
# 构建
ldesign-builder build

# 监听模式
ldesign-builder build --watch

# 指定入口和输出
ldesign-builder build -i src/index.ts -o dist

# 指定格式
ldesign-builder build -f esm,cjs,umd,dts
```

### 高级选项

```bash
# 启用压缩
ldesign-builder build --minify

# 生成 sourcemap
ldesign-builder build --sourcemap

# 清理输出目录
ldesign-builder build --clean

# 分析打包结果
ldesign-builder build --analyze

# 生成构建报告
ldesign-builder build --report

# 设置体积限制
ldesign-builder build --size-limit 200k

# 指定打包器
ldesign-builder build --bundler rollup

# 指定模式
ldesign-builder build --mode production
```

### 组合使用

```bash
# 生产环境完整构建
ldesign-builder build \
  -f esm,cjs,dts \
  --minify \
  --sourcemap \
  --clean \
  --analyze \
  --report \
  --size-limit 500k
```

---

## 📊 构建输出说明

### 标准输出结构

```
dist/
├── index.js          # ESM 格式（默认）
├── index.cjs         # CJS 格式
├── index.umd.js      # UMD 格式（可选）
├── index.d.ts        # TypeScript 声明文件
├── index.d.cts       # CJS 声明文件
├── index.js.map      # Source map
└── build-report.json # 构建报告（可选）
```

### Package.json 配置

```json
{
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "files": ["dist"]
}
```

---

## 🎓 进阶技巧

### 使用环境变量

```typescript
export default defineConfig({
  // 在配置中使用环境变量
  output: {
    dir: process.env.OUTPUT_DIR || 'dist'
  },
  
  minify: process.env.NODE_ENV === 'production',
  
  // 环境特定配置
  env: {
    development: {
      sourcemap: 'inline',
      minify: false
    },
    production: {
      sourcemap: true,
      minify: true
    }
  }
})
```

### 使用插件

```typescript
import { defineConfig } from '@ldesign/builder'
import { cssInJSPlugin } from '@ldesign/builder/plugins'

export default defineConfig({
  input: 'src/index.ts',
  
  plugins: [
    cssInJSPlugin({
      // CSS-in-JS 插件配置
    })
  ]
})
```

### 监听模式

```typescript
// ldesign.config.ts
export default defineConfig({
  watch: {
    include: 'src/**',
    exclude: ['**/*.test.ts']
  }
})
```

```bash
# 启动监听
npm run build -- --watch
```

---

## 🐛 常见问题

### Q1: 如何处理样式文件？

```typescript
export default defineConfig({
  input: 'src/index.ts',
  
  // 方式1：自动处理（推荐）
  // 会自动检测并处理 .css、.scss、.less 等
  
  // 方式2：手动配置
  plugins: [
    postcssPlugin({
      extract: true,  // 提取为独立 CSS 文件
      minimize: true  // 压缩 CSS
    })
  ]
})
```

### Q2: 如何处理图片和字体？

```typescript
import { defineConfig } from '@ldesign/builder'
import { imageOptimizerPlugin } from '@ldesign/builder/plugins'

export default defineConfig({
  plugins: [
    imageOptimizerPlugin({
      // 图片优化配置
      quality: 80,
      formats: ['webp', 'avif']
    })
  ]
})
```

### Q3: 构建很慢怎么办？

```bash
# 使用更快的打包器（开发环境）
ldesign-builder build --bundler esbuild

# 启用缓存
ldesign-builder build --cache

# 启用并行构建
ldesign-builder build --parallel

# 减少输出格式
ldesign-builder build -f esm
```

### Q4: 如何调试构建问题？

```bash
# 启用详细日志
DEBUG=* ldesign-builder build

# 生成构建报告
ldesign-builder build --report --analyze

# 使用调试模式
ldesign-builder build --debug
```

---

## 🎉 下一步

- 📖 阅读[最佳实践指南](./BEST_PRACTICES.md)
- 🏗️ 了解[架构设计](./ARCHITECTURE.md)
- 🔌 学习[插件开发](./PLUGIN_DEVELOPMENT.md)
- 💬 加入[社区讨论](https://github.com/ldesign/builder/discussions)

---

## 💡 获取帮助

- 📚 [完整文档](https://ldesign.dev/builder)
- 💬 [GitHub Discussions](https://github.com/ldesign/builder/discussions)
- 🐛 [提交 Issue](https://github.com/ldesign/builder/issues)
- 📧 邮件：support@ldesign.dev

---

祝你使用愉快！Happy Building! 🎊

