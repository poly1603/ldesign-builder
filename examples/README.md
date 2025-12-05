# @ldesign/builder 示例项目

本目录包含多个示例项目，用于测试和演示 @ldesign/builder 的功能。

## 项目列表

| 项目 | 类型 | 说明 |
|------|------|------|
| `tdesign-like` | Vue3 组件库 | 模拟 TDesign 结构的 Vue3 组件库 |
| `tdesign-react-like` | React 组件库 | 模拟 TDesign 结构的 React 组件库 |
| `utils-lib` | 工具函数库 | 纯 TypeScript 工具函数库 |
| `icon-font-lib` | 图标字体库 | 包含字体文件和 Less 样式 |
| `svelte-lib` | Svelte 组件库 | Svelte 5 组件库示例 |
| `node-cli-lib` | Node CLI 工具 | Node.js 命令行工具库 |
| `web-components-lib` | Web Components | 原生 Web Components 组件库 |
| `css-framework` | CSS 框架 | 纯 CSS/Less 样式框架 |
| `lit-components-lib` | Lit 组件库 | Lit 3 Web Components 组件库 |
| `solid-lib` | Solid.js 组件库 | Solid.js 响应式组件库 |
| `preact-lib` | Preact 组件库 | Preact 轻量级组件库 |
| `alpine-lib` | Alpine.js 插件库 | Alpine.js 插件和指令库 |

## 📁 项目结构

```
examples/
├── utils-lib/              # 纯 TypeScript 工具库
├── tdesign-like/          # Vue3 组件库 (TSX)
├── tdesign-react-like/    # React 组件库
├── icon-font-lib/         # 字体图标库
├── css-framework/         # 纯 CSS 框架
├── node-cli-lib/          # Node.js CLI 工具
├── web-components-lib/    # Web Components
├── svelte-lib/           # Svelte 组件库
├── solid-lib/            # Solid.js 组件库
├── preact-lib/           # Preact 组件库
├── lit-components-lib/   # Lit Web Components
├── alpine-lib/           # Alpine.js 插件库
└── stencil-lib/          # Stencil 组件库
```

## ⚙️ 配置文件

每个示例项目都有规范的构建配置文件：

```
project/
└── .ldesign/
    └── builder.config.ts   # 构建配置文件
```

### 配置文件示例

**TypeScript 工具库** (utils-lib):
```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  entry: 'src/index.ts',
  formats: ['esm', 'cjs'],
  dts: true,
  treeshake: true,
})
```

**Vue3 组件库** (tdesign-like):
```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  entry: 'src/index.ts',
  formats: ['esm', 'cjs', 'umd'],
  external: ['vue'],
  preserveModules: true,
  dts: true,
})
```

**React 组件库** (tdesign-react-like):
```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  entry: 'src/index.tsx',
  formats: ['esm', 'cjs'],
  external: ['react', 'react-dom'],
  jsx: 'react',
  preserveModules: true,
  dts: true,
})
```

**Node.js CLI 工具** (node-cli-lib):
```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli/index.ts',
  },
  formats: ['esm', 'cjs'],
  platform: 'node',
  target: 'node16',
  shims: true,
})
```

## 示例项目

### 1. tdesign-like - Vue3 组件库

类似 TDesign Vue Next 的组件库结构：
- Vue 3 SFC 组件 (Button, Input, Select, Modal, Table)
- Less 样式文件
- TypeScript 类型定义
- Vue 指令和 Hooks

```bash
cd examples/tdesign-like
pnpm install
pnpm build
```

### 2. utils-lib - TypeScript 工具库

纯 TypeScript 工具函数库：
- 类型工具、字符串处理、数组操作
- 对象工具、日期工具、异步工具
- DOM 工具、验证工具、存储工具

```bash
cd examples/utils-lib
pnpm install
pnpm build
```

## 支持的资源类型

| 资源类型 | 扩展名 | 
|----------|--------|
| TypeScript | `.ts`, `.tsx` |
| Vue SFC | `.vue` |
| Less/SCSS | `.less`, `.scss` |
| CSS | `.css` |

## 打包引擎支持

@ldesign/builder 支持多种打包引擎：

| 打包引擎 | 说明 | 最佳场景 |
|----------|------|----------|
| **rollup** (默认) | 功能完整，插件生态丰富 | Vue/React 组件库 |
| **rolldown** | Rust 实现，构建速度快 2-5x | 纯 TS/JS 工具库 |
| **esbuild** | 超快构建，适合开发环境 | 快速迭代开发 |
| **swc** | Rust 实现，完整的 TS/JSX 支持 | 生产构建 |

### 切换打包引擎

```bash
# 使用默认的 rollup
pnpm build

# 使用 rolldown（速度更快）
npx ldesign-builder build --bundler rolldown

# 使用 esbuild（最快）
npx ldesign-builder build --bundler esbuild

# 使用 swc（Rust 实现）
npx ldesign-builder build --bundler swc
```

### 各引擎特点

| 特性 | rollup | rolldown | esbuild | swc |
|------|--------|----------|---------|-----|
| 速度 | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Vue SFC | ✅ | ⚠️ 有限 | ❌ | ❌ |
| Less/SCSS | ✅ | ✅ | ⚠️ 有限 | ❌ |
| 插件生态 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| Tree-shaking | ✅ | ✅ | ✅ | ❌ |

### 使用建议

- **Vue/React 组件库**: 使用 `rollup`（功能最完整）
- **纯 TypeScript 工具库**: 使用 `rolldown` 或 `esbuild`（速度快）
- **快速开发迭代**: 使用 `esbuild`（构建最快）
- **生产环境**: 使用 `rollup` 或 `swc`（稳定可靠）

### 🔍 智能兼容性检查

Builder 会自动检测项目特征并提示不兼容的打包引擎配置：

```bash
# 示例：在 Vue 项目中使用 esbuild 时会显示警告
npx ldesign-builder build --bundler esbuild

# 输出：
# ╭─────────────────────────────────────────────────────╮
# │  🔍 打包引擎兼容性检查                               │
# ├─────────────────────────────────────────────────────┤
# │  ⚠️  检测到 Vue 单文件组件 (.vue)，esbuild 不支持    │
# ├─────────────────────────────────────────────────────┤
# │  💡 建议使用 rollup（功能最完整）或 rolldown         │
# ╰─────────────────────────────────────────────────────╯
```

**检测的项目特征**:
- Vue SFC (.vue 文件)
- Svelte 组件 (.svelte 文件)
- Less/SCSS/Sass 样式预处理
- 字体文件 (woff, woff2, ttf)
- TypeScript 装饰器

**控制选项**:
- `--force`: 强制执行，忽略兼容性警告
- `--no-compat-check`: 禁用兼容性检查

### 项目兼容性矩阵

| 项目 | rollup | rolldown | esbuild | swc |
|------|--------|----------|---------|-----|
| **utils-lib** | ✅ 35个/92KB | ✅ 1个/16KB | ✅ 1个/15KB | ✅ 1个/447B |
| **tdesign-like** (Vue3) | ✅ 40个/73KB | ✅ 2个/100KB | ⚠️ 有限 | ⚠️ 有限 |
| **tdesign-react-like** | ✅ 完整 | ✅ 完整 | ✅ 完整 | ✅ 完整 |
| **icon-font-lib** | ✅ 完整 | ✅ 完整 | ⚠️ 字体限制 | ⚠️ 有限 |
| **node-cli-lib** | ✅ 20个/39KB | ✅ 4个/11KB | ✅ 完整 | ✅ 完整 |
| **web-components-lib** | ✅ 20个/56KB | ✅ 完整 | ✅ 1个/9KB | ✅ 完整 |
| **css-framework** | ✅ 6个/17KB | ✅ 完整 | ⚠️ Less限制 | ⚠️ 有限 |
| **svelte-lib** | ✅ 完整 | ⚠️ 有限 | ⚠️ 有限 | ⚠️ 有限 |
| **lit-components-lib** | ✅ 完整 | ✅ 完整 | ✅ 完整 | ✅ 完整 |
| **solid-lib** | ✅ 完整 | ✅ 200KB | ✅ 完整 | ✅ 完整 |
| **preact-lib** | ✅ 完整 | ✅ 完整 | ✅ 完整 | ✅ 完整 |
| **alpine-lib** | ✅ 完整 | ✅ 完整 | ✅ 完整 | ✅ 完整 |

> ✅ = 完整支持，⚠️ = 部分支持或有限制

## TDesign 结构特点

1. **多入口构建** - 每个组件独立入口
2. **样式分离** - JS 和 CSS 独立打包
3. **多格式输出** - ESM/CJS/UMD
