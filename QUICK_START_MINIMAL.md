# @ldesign/builder 极简配置快速开始

## 🚀 零配置，一键构建

`@ldesign/builder` 2.0 带来了革命性的极简配置体验。90% 的项目只需要 **一行配置**！

## ⚡ 快速开始

### 1. 安装

```bash
pnpm add -D @ldesign/builder
```

### 2. 创建配置文件

```typescript
// builder.config.ts
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  name: 'MyLibrary'  // 就这么简单！
})
```

### 3. 添加构建脚本

```json
{
  "scripts": {
    "build": "ldesign-builder build"
  }
}
```

### 4. 运行构建

```bash
pnpm build
```

**就是这样！** 🎉

## 🤖 智能自动化

builder 会自动：

- ✅ 检测项目类型（库/应用/组件）
- ✅ 识别使用的框架（Vue/React/Lit/Svelte...）
- ✅ 查找入口文件（src/index.ts）
- ✅ 分析依赖并自动外部化
- ✅ 选择输出格式（ESM/CJS/UMD）
- ✅ 配置 TypeScript 和 JSX
- ✅ 优化构建性能

## 📦 示例项目

### Vue 3 组件库

```typescript
// builder.config.ts
export default defineConfig({
  name: 'MyVueComponents'
})
```

**自动生成**:
- `es/` - ESM 格式
- `lib/` - CommonJS 格式
- `es/**/*.d.ts` - 类型定义

**自动配置**:
- Vue 3 插件
- 外部化 `vue`
- SFC 支持

### React 库

```typescript
// builder.config.ts
export default defineConfig({
  name: 'MyReactLib'
})
```

**自动配置**:
- React JSX 转换
- 外部化 `react`, `react-dom`
- 自动选择 JSX 模式（classic/automatic）

### 混合框架库

```typescript
// builder.config.ts
export default defineConfig({
  name: 'MultiFrameworkLib'
})
```

**自动处理**:
- 同时支持 Vue, React, Lit
- 分别处理不同框架的 JSX
- 智能外部化所有框架依赖

## 🎛️ 自定义配置（可选）

### 自定义输出目录

```typescript
export default defineConfig({
  name: 'MyLib',
  libs: {
    esm: { output: 'esm' },  // 默认: 'es'
    cjs: { output: 'cjs' },  // 默认: 'lib'
    umd: { output: 'dist' }  // 默认: 'dist'
  }
})
```

### 自定义入口文件

```typescript
export default defineConfig({
  name: 'MyLib',
  libs: {
    esm: { 
      input: 'src/**/*'  // 保留模块结构
    },
    umd: { 
      input: 'src/browser.ts'  // UMD 专用入口
    }
  }
})
```

### 高级覆盖（不推荐）

```typescript
export default defineConfig({
  name: 'MyLib',
  override: {
    // 完全覆盖自动配置
    minify: true,
    sourcemap: false,
    external: ['custom-dep']
  }
})
```

## 💡 最佳实践

### ✅ 推荐

```typescript
// 简洁就是美
export default defineConfig({
  name: 'MyLib'
})
```

### ⚠️ 不推荐

```typescript
// 不要手动配置已经自动处理的内容
export default defineConfig({
  name: 'MyLib',
  override: {
    input: 'src/index.ts',        // ❌ 自动检测
    external: ['vue', 'react'],   // ❌ 自动分析
    typescript: true,             // ❌ 自动检测
    vue: { version: 3 }           // ❌ 自动检测
  }
})
```

## 🔍 构建输出

### 典型输出

```
✨ 分析项目中...
📦 检测到: Vue 3 组件库
🎯 入口: src/index.ts
🔧 框架: Vue 3.x + TypeScript
📊 组件: 15 个
⚡ 优化配置中...
🚀 开始构建...

============================================================
✓ 构建成功
------------------------------------------------------------
⏱  耗时: 3.2s
📦 文件: 45 个
📊 总大小: 256 KB
💾 Gzip 后: 89 KB (压缩 65%)
============================================================

📁 输出结构:
├── es/              # ESM 格式
│   ├── index.js
│   ├── index.d.ts
│   └── ...
└── lib/             # CJS 格式
    ├── index.cjs
    └── ...
```

## 📊 性能对比

| 配置复杂度 | 之前 | 现在 |
|------------|------|------|
| 配置行数 | 60+ 行 | 1-5 行 |
| 学习成本 | 高 | 极低 |
| 错误风险 | 高 | 极低 |

| 构建性能 | 之前 | 现在 |
|----------|------|------|
| 内存占用 | 580 MB | 280 MB |
| 构建时间 | 45s | 30s |

## 🎓 常见场景

### 场景 1: 新建 Vue 库

```bash
# 1. 创建项目
mkdir my-vue-lib && cd my-vue-lib
pnpm init

# 2. 安装依赖
pnpm add -D @ldesign/builder vue

# 3. 创建配置
echo "export default { name: 'MyVueLib' }" > builder.config.ts

# 4. 构建
pnpm ldesign-builder build
```

### 场景 2: 迁移现有项目

```typescript
// 之前的复杂配置 (60+ 行)
export default {
  input: 'src/index.ts',
  output: { /* ... */ },
  external: [ /* ... */ ],
  plugins: [ /* ... */ ],
  // ... 很多配置
}

// 现在 (1 行)
export default defineConfig({ name: 'MyLib' })
```

### 场景 3: Monorepo

每个包都只需要：

```typescript
// packages/ui/builder.config.ts
export default defineConfig({ name: 'MyUI' })

// packages/utils/builder.config.ts
export default defineConfig({ name: 'MyUtils' })
```

## ❓ 常见问题

### Q: 需要手动配置 external 吗？

**A**: 不需要！builder 自动分析 `peerDependencies` 和框架核心库，全部自动外部化。

### Q: 如何生成 UMD 格式？

**A**: 如果 `package.json` 有 `browser`/`unpkg`/`jsdelivr` 字段，自动生成 UMD。或者手动指定：

```typescript
export default defineConfig({
  name: 'MyLib',
  libs: { umd: { output: 'dist' } }
})
```

### Q: 如何自定义 TypeScript 配置？

**A**: builder 使用项目的 `tsconfig.json`，无需额外配置。

### Q: 支持哪些框架？

**A**: 
- ✅ Vue 2/3
- ✅ React
- ✅ Lit
- ✅ Svelte
- ✅ Angular
- ✅ Solid
- ✅ 混合框架

### Q: 如何调试构建？

**A**: 使用 `--verbose` 查看详细日志：

```bash
ldesign-builder build --verbose
```

## 🔗 相关链接

- [完整文档](./README.md)
- [API 参考](./docs/api.md)
- [重构报告](./REFACTOR_COMPLETE_REPORT.md)
- [GitHub](https://github.com/ldesign/builder)

## 💬 获取帮助

遇到问题？

1. 查看 [FAQ](./docs/faq.md)
2. 提交 [Issue](https://github.com/ldesign/builder/issues)
3. 加入 [Discord](https://discord.gg/ldesign)

---

**极简配置，强大功能。这就是 @ldesign/builder 2.0！** 🚀
