# 快速开始

本指南将帮助你在几分钟内开始使用 @ldesign/builder。

## 安装

:::: code-group
::: code-group-item pnpm
```bash
pnpm add @ldesign/builder -D
```
:::

::: code-group-item npm
```bash
npm install @ldesign/builder --save-dev
```
:::

::: code-group-item yarn
```bash
yarn add @ldesign/builder --dev
```
:::
::::

## 零配置构建

@ldesign/builder 的最大特点是**零配置**。对于 90% 的项目，你无需任何配置即可开始构建。

```bash
# 直接构建
npx ldesign-builder build
```

### 它会自动完成

✅ **自动检测**项目类型（Vue/React/TypeScript...）  
✅ **自动查找**入口文件（src/index.ts, index.ts...）  
✅ **自动生成**多种格式（ESM + CJS + UMD）  
✅ **自动输出**到标准目录（es/, lib/, dist/）  
✅ **自动生成**类型声明（.d.ts）  
✅ **自动优化**代码（Tree-shaking, Minify）

### 项目结构

```
my-library/
├── src/
│   └── index.ts        # 入口文件
├── package.json
└── tsconfig.json       # 可选
```

运行构建后：

```
my-library/
├── es/                 # ESM 格式
│   ├── index.js
│   └── index.d.ts
├── lib/                # CJS 格式
│   ├── index.js
│   └── index.d.ts
└── dist/               # UMD 格式（可选）
    ├── index.js
    └── index.min.js
```

## 使用配置文件

如果需要自定义配置，创建配置文件：

:::: code-group
::: code-group-item TypeScript
```typescript
// .ldesign/builder.config.ts
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 输入
  entry: 'src/index.ts',
  
  // 输出
  output: {
    formats: ['esm', 'cjs', 'umd'],
    dir: {
      esm: 'es',
      cjs: 'lib',
      umd: 'dist'
    }
  },
  
  // 打包器（可选）
  bundler: 'rollup', // 'rollup' | 'esbuild' | 'swc' | 'rolldown'
  
  // 优化（可选）
  optimization: {
    minify: true,
    treeshake: true
  }
})
```
:::

::: code-group-item JavaScript
```javascript
// .ldesign/builder.config.js
export default {
  entry: 'src/index.ts',
  output: {
    formats: ['esm', 'cjs']
  }
}
```
:::

::: code-group-item JSON
```json
{
  "entry": "src/index.ts",
  "output": {
    "formats": ["esm", "cjs"]
  }
}
```
:::
::::

## CLI 命令

### 构建命令

```bash
# 基础构建
npx ldesign-builder build

# 指定配置文件
npx ldesign-builder build --config my-config.ts

# 指定打包器
npx ldesign-builder build --bundler esbuild

# 开发模式（不压缩）
npx ldesign-builder build --mode development

# 生产模式（默认）
npx ldesign-builder build --mode production
```

### 监听模式

```bash
# 监听文件变化并自动重新构建
npx ldesign-builder watch

# 指定打包器
npx ldesign-builder watch --bundler esbuild
```

### 初始化配置

```bash
# 交互式创建配置文件
npx ldesign-builder init
```

### 分析构建

```bash
# 生成构建分析报告
npx ldesign-builder analyze

# 打开可视化报告
npx ldesign-builder analyze --open
```

### 清理输出

```bash
# 清理所有输出目录
npx ldesign-builder clean
```

## package.json 配置

将命令添加到 package.json：

```json
{
  "name": "my-library",
  "version": "1.0.0",
  "scripts": {
    "build": "ldesign-builder build",
    "dev": "ldesign-builder watch",
    "clean": "ldesign-builder clean"
  },
  "main": "./lib/index.js",
  "module": "./es/index.js",
  "types": "./es/index.d.ts",
  "exports": {
    ".": {
      "types": "./es/index.d.ts",
      "import": "./es/index.js",
      "require": "./lib/index.js"
    }
  },
  "files": ["es", "lib", "dist", "README.md"],
  "devDependencies": {
    "@ldesign/builder": "^1.0.0"
  }
}
```

## 下一步

- 📖 了解 [零配置构建](/guide/zero-config)
- 🔧 学习 [配置选项](/config/overview)
- ⚡ 探索 [打包引擎](/guide/bundlers)
- 🎯 查看 [框架支持](/guide/frameworks)
- 📦 构建 [Monorepo 项目](/guide/monorepo)
