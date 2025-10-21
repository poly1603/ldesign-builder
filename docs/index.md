---
layout: home

hero:
  name: "@ldesign/builder"
  text: "强大的库构建工具"
  tagline: "支持 TypeScript、Vue、样式等多种项目类型，双引擎驱动，提供统一的构建体验"
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/start
    - theme: alt
      text: 查看示例
      link: /examples/basic
    - theme: alt
      text: API 参考
      link: /api/build

features:
  - icon: 🚀
    title: 零配置体验
    details: 自动检测项目类型（Vue、React、TypeScript），智能配置最佳插件组合，开箱即用无需复杂配置
  - icon: 📦
    title: 多格式输出
    details: 一键生成 ESM、CJS、UMD 等多种格式，保持目录结构，满足不同使用场景和模块系统
  - icon: 🔧
    title: 完整类型支持
    details: 自动生成 TypeScript 声明文件，支持分离式和捆绑式输出，完美的类型安全保障
  - icon: ⚡
    title: 高性能构建
    details: 基于 Rollup 4.x 和现代插件生态，快速构建，智能优化，生成高质量的输出代码
  - icon: 🎯
    title: 智能检测
    details: 自动识别文件类型和依赖关系，智能配置插件和构建选项，减少手动配置工作
  - icon: 🛠️
    title: 编程式 API
    details: 提供简洁易用的编程式 API，支持构建、监听、分析等功能，完整的 TypeScript 类型定义
  - icon: 🔍
    title: 高级分析功能
    details: 智能依赖分析、构建性能监控、代码分割优化、构建缓存管理，全方位提升开发体验
  - icon: 📊
    title: 性能优化
    details: 内置性能分析器、缓存管理器、代码分割优化器，帮助识别瓶颈并提供优化建议
---

## 快速体验

```bash
# 安装
npm install @ldesign/builder
```

```typescript
// 最简单的使用
import { build } from '@ldesign/builder'

await build({
  input: 'src/index.ts',
  outDir: 'dist'
})
```

## 为什么选择 @ldesign/builder？

### 🎯 专注于前端库构建

与通用构建工具不同，@ldesign/builder 专门为前端库构建而设计，提供了针对性的优化和最佳实践。

### 🧠 智能化配置

- **自动项目检测**：识别 Vue、React、TypeScript 等项目类型
- **智能插件配置**：根据项目特点自动配置最佳插件组合
- **依赖关系分析**：自动分析文件依赖，优化构建输出
- **高级分析功能**：智能依赖分析、性能监控、代码分割优化

### 📈 现代化工具链

- **基于 Rollup 4.x**：享受最新的构建性能和特性
- **现代插件生态**：使用 unplugin-vue、unplugin-vue-jsx 等现代插件
- **TypeScript 优先**：完整的类型安全支持

### 🔄 灵活的输出格式

```typescript
await build({
  input: 'src/index.ts',
  formats: ['esm', 'cjs', 'umd'], // 多格式输出
  dts: true, // 类型声明文件
  name: 'MyLibrary' // UMD 全局变量名
})
```

## 支持的项目类型

| 项目类型 | 自动检测 | 插件支持 | 示例 |
|---------|---------|---------|------|
| Vue 组件库 | ✅ | unplugin-vue, unplugin-vue-jsx | [查看示例](/examples/vue) |
| React 组件库 | ✅ | @rollup/plugin-babel, JSX | [查看示例](/examples/react) |
| TypeScript 库 | ✅ | @rollup/plugin-typescript | [查看示例](/examples/typescript) |
| JavaScript 库 | ✅ | @rollup/plugin-babel | [查看示例](/examples/basic) |

## 立即开始

<div class="tip custom-block" style="padding-top: 8px">

只需要几分钟，就能让你的前端库拥有专业级的构建配置！

</div>

[开始使用 →](/guide/start)
