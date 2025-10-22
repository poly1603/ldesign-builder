# @ldesign/builder 快速开始

> 🎯 零配置、极速、智能的前端库打包工具

## 🚀 5 分钟快速上手

### 1. 安装

```bash
# 使用 pnpm（推荐）
pnpm add @ldesign/builder -D

# 使用 npm
npm install @ldesign/builder --save-dev

# 使用 yarn
yarn add @ldesign/builder --dev
```

### 2. 零配置构建

```bash
# 就这么简单！
npx ldesign-builder build
```

**✨ 自动完成**：
- ✅ 检测项目类型（Vue/React/TypeScript...）
- ✅ 查找入口文件（src/index.ts）
- ✅ 生成多种格式（ESM + CJS + UMD）
- ✅ 输出到标准目录（es/, lib/, dist/）
- ✅ 生成类型声明（.d.ts）
- ✅ 并行构建（2-3倍速度提升）

### 3. 添加到 package.json

```json
{
  "scripts": {
    "build": "ldesign-builder build",
    "dev": "ldesign-builder build --mode development --watch"
  }
}
```

## 📦 支持的项目类型

### Vue 3 组件库 ✓
```bash
# 自动检测 Vue 3 项目
# 生成 ESM + CJS + UMD
# 自动排除 vue 依赖
npx ldesign-builder build
```

### Vue 2 组件库 ✓
```bash
# 自动检测 Vue 2 项目
# 使用 vue-template-compiler
npx ldesign-builder build
```

### React 组件库 ✓
```bash
# 自动检测 React 项目
# 支持 JSX/TSX
# 自动排除 react 和 react-dom
npx ldesign-builder build
```

### TypeScript 工具库 ✓
```bash
# 自动检测 TypeScript 项目
# 生成 ESM + CJS
# 完整类型声明
npx ldesign-builder build
```

### 样式库 (CSS/Less/Sass) ✓
```bash
# 自动检测样式库
# 提取和压缩 CSS
# 生成 ESM 格式
npx ldesign-builder build
```

### 其他框架
- ✓ Svelte
- ✓ Solid.js
- ✓ Preact
- ✓ Lit / Web Components
- ✓ Angular（基础支持）
- ✓ Qwik

## ⚡ 性能模式

### 开发模式（极速）
```bash
# 使用 esbuild 加速 10-100 倍
npx ldesign-builder build --mode development

# 或
pnpm dev
```

### 生产模式（优化）
```bash
# 使用 swc 加速 20 倍
npx ldesign-builder build --mode production

# 或
pnpm build
```

### 指定打包引擎
```bash
# 使用 esbuild（最快）
npx ldesign-builder build --bundler esbuild

# 使用 swc（快且全）
npx ldesign-builder build --bundler swc

# 使用 rollup（最稳定）
npx ldesign-builder build --bundler rollup

# 使用 rolldown（默认）
npx ldesign-builder build --bundler rolldown
```

## 🎨 可选配置

### 最小配置（推荐）

只在需要时创建配置文件：`.ldesign/builder.config.ts`

```typescript
export default {
  // 只配置需要覆盖的部分
  name: 'MyLib',  // UMD 名称（可选，自动从 package.json 读取）
  external: ['lodash']  // 额外的外部依赖（可选）
}
```

### 常用配置

```typescript
export default {
  // 基础配置
  name: 'MyLib',
  
  // 外部依赖（自动从 peerDependencies 读取）
  external: ['vue', 'lodash'],
  
  // 指定打包引擎
  bundler: 'swc',  // esbuild | swc | rollup | rolldown
  
  // 输出格式（默认自动推断）
  output: {
    esm: true,  // 启用 ESM
    cjs: true,  // 启用 CJS
    umd: true   // 启用 UMD
  }
}
```

### 完整配置示例

```typescript
export default {
  // 入口文件（可选，自动检测）
  input: 'src/index.ts',
  
  // 库名称
  name: 'MyAwesomeLib',
  
  // 打包引擎
  bundler: 'rollup',
  
  // 构建模式
  mode: 'production',
  
  // 输出配置
  output: {
    esm: {
      dir: 'es',
      format: 'esm',
      preserveStructure: true,
      dts: true
    },
    cjs: {
      dir: 'lib',
      format: 'cjs',
      preserveStructure: true,
      dts: true
    },
    umd: {
      dir: 'dist',
      format: 'umd',
      name: 'MyLib',
      minify: true
    }
  },
  
  // 外部依赖
  external: ['vue', 'lodash'],
  
  // 全局变量（UMD）
  globals: {
    vue: 'Vue',
    lodash: '_'
  },
  
  // TypeScript 配置
  typescript: {
    declaration: true,
    target: 'ES2020'
  }
}
```

## 📁 输出结构

### 默认输出

```
your-project/
├── es/              # ESM 格式 (import)
│   ├── index.js
│   ├── index.d.ts
│   └── ...
│
├── lib/             # CJS 格式 (require)
│   ├── index.cjs
│   ├── index.d.ts
│   └── ...
│
├── dist/            # UMD 格式 (浏览器)
│   ├── index.umd.js
│   └── index.umd.js.map
│
└── .ldesign/
    └── build-manifest.json  # 构建清单
```

### Package.json 配置

```json
{
  "name": "my-awesome-lib",
  "version": "1.0.0",
  "type": "module",
  "main": "./lib/index.cjs",
  "module": "./es/index.js",
  "types": "./es/index.d.ts",
  "exports": {
    ".": {
      "import": "./es/index.js",
      "require": "./lib/index.cjs",
      "types": "./es/index.d.ts"
    }
  },
  "files": ["es", "lib", "dist"]
}
```

## 🔥 实际案例

### 案例 1：Vue 3 组件库

```bash
# 项目结构
my-vue-lib/
├── package.json      # peerDependencies: { "vue": "^3.0.0" }
├── src/
│   ├── index.ts
│   ├── Button.vue
│   └── Input.vue

# 构建（零配置！）
npx ldesign-builder build

# 输出
✓ 检测到 Vue 3 项目
✓ 生成 ESM (es/)
✓ 生成 CJS (lib/)
✓ 生成 UMD (dist/)
✓ 生成类型声明
✓ 构建完成 (12s)
```

### 案例 2：TypeScript 工具库

```bash
# 项目结构
my-utils/
├── package.json
├── src/
│   ├── index.ts
│   ├── string/
│   ├── number/
│   └── date/

# 构建（零配置！）
npx ldesign-builder build

# 输出
✓ 检测到 TypeScript 项目
✓ 生成 ESM (es/)
✓ 生成 CJS (lib/)
✓ 保留目录结构
✓ 生成类型声明
✓ 构建完成 (5s)
```

### 案例 3：React 组件库

```bash
# 项目结构
my-react-lib/
├── package.json      # peerDependencies: { "react": "^18.0.0" }
├── src/
│   ├── index.tsx
│   ├── Button.tsx
│   └── Card.tsx

# 构建（零配置！）
npx ldesign-builder build

# 输出
✓ 检测到 React 项目
✓ 生成 ESM (es/)
✓ 生成 CJS (lib/)
✓ 支持 JSX/TSX
✓ 生成类型声明
✓ 构建完成 (8s)
```

## 🎯 常见问题

### Q: 需要配置文件吗？
**A**: 90% 的项目不需要！工具会自动检测和配置。

### Q: 如何指定入口文件？
**A**: 自动查找 `src/index.ts|js|tsx|jsx|vue`。如果需要自定义，在配置文件中设置 `input`。

### Q: 支持 Monorepo 吗？
**A**: 完全支持！自动检测 pnpm workspace、lerna、nx 等。

### Q: 如何加速构建？
**A**: 
- 开发模式：`--mode development`（使用 esbuild）
- 生产模式：`--bundler swc`（使用 swc）
- 并行构建：自动启用

### Q: 输出的文件命名规则？
**A**: 
- ESM: `[name].js`
- CJS: `[name].cjs`
- UMD: `[name].umd.js`
- Types: `[name].d.ts`

### Q: 如何自定义输出目录？
**A**: 在配置文件中：
```typescript
export default {
  output: {
    esm: { dir: 'esm' },
    cjs: { dir: 'cjs' },
    umd: { dir: 'umd' }
  }
}
```

### Q: 支持 CSS 预处理器吗？
**A**: 完全支持！自动检测和处理 Less、Sass、Stylus。

### Q: 如何生成 sourcemap？
**A**: 默认生成。如需禁用：
```typescript
export default {
  sourcemap: false
}
```

## 🔧 高级用法

### 监听模式
```bash
npx ldesign-builder build --watch
```

### 分析打包
```bash
npx ldesign-builder build --analyze
```

### 清理输出
```bash
npx ldesign-builder build --clean
```

### 调试模式
```bash
npx ldesign-builder build --debug
```

## 📚 更多资源

- [完整文档](./README.md)
- [API 参考](./docs/API.md)
- [优化指南](./OPTIMIZATION_PROGRESS.md)
- [实施总结](./IMPLEMENTATION_SUMMARY.md)

## 💬 需要帮助？

- 📖 查看[文档](./README.md)
- 🐛 提交 [Issue](https://github.com/ldesign/packages/builder/issues)
- 💡 查看[示例项目](./examples/)

---

**开始构建你的库吧！** 🚀

```bash
npx ldesign-builder build
```



