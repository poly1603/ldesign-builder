# 混合框架智能打包系统实施报告

## 概述

成功实现了混合框架智能打包系统，支持在同一项目中同时使用 Vue 和 React 组件。该系统能够自动识别文件所属框架，并应用正确的 JSX 转换和插件配置。

## 已完成功能

### 1. 框架检测器 (`FrameworkDetector`)

位置：`src/detectors/FrameworkDetector.ts`

功能特性：
- 自动检测文件所属框架（Vue/React）
- 支持多种检测方式：
  - 文件扩展名检测（.vue 文件）
  - 文件命名模式（.vue.tsx, .react.tsx）
  - 导入语句分析
  - JSX pragma 检测
  - 代码特征分析（Hooks、Composition API 等）
- 检测结果缓存
- 批量检测支持

### 2. 双 JSX 转换器 (`DualJSXTransformer`)

位置：`src/transformers/DualJSXTransformer.ts`

功能特性：
- 支持 Vue JSX 和 React JSX 的独立转换
- 可配置的转换选项：
  - Vue: pragma、优化、合并 props 等
  - React: classic/automatic 运行时
- 自动检测并转换
- 条件转换器创建
- 元数据提取（导入、组件等）

### 3. 插件编排器 (`PluginOrchestrator`)

位置：`src/optimizers/plugin-orchestrator/PluginOrchestrator.ts`

功能特性：
- 智能管理不同框架的插件
- 自动解决插件冲突
- 插件优先级管理
- 条件插件创建
- 框架特定插件映射

### 4. 增强混合策略 (`EnhancedMixedStrategy`)

位置：`src/strategies/mixed/EnhancedMixedStrategy.ts`

功能特性：
- 四种打包模式：
  - **unified**: 统一打包
  - **separated**: 分离打包
  - **component**: 组件级打包
  - **custom**: 自定义分组
- 智能框架识别
- 文件分组规则
- 智能外部化
- 多种输出组织方式

### 5. 配置集成

已将混合框架配置集成到核心系统：
- 更新了 `BuilderConfig` 类型定义
- 添加了 `mixedFramework` 和 `autoDetectFramework` 配置项
- 在策略管理器中注册了增强混合策略
- 更新了导出索引

### 6. 示例配置

位置：`examples/mixed-framework/builder.config.ts`

展示了完整的混合框架项目配置，包括：
- JSX 文件关联规则
- 框架特定配置
- 文件分组规则
- 输出组织方式
- 高级选项

## 使用方法

### 基本配置

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  libraryType: 'enhanced-mixed',
  
  mixedFramework: {
    mode: 'separated',
    
    jsx: {
      autoDetect: true,
      fileAssociations: {
        '**/*.vue.tsx': 'vue',
        '**/*.react.tsx': 'react'
      }
    },
    
    frameworks: {
      vue: { version: 3 },
      react: { jsx: 'automatic' }
    }
  }
})
```

### 文件命名约定

为了获得最佳的框架检测效果，建议采用以下命名约定：

- Vue TSX 文件：`Component.vue.tsx`
- React TSX 文件：`Component.react.tsx`
- 或使用目录分离：`vue/Component.tsx`、`react/Component.tsx`

### 输出模式说明

#### 1. 统一模式 (unified)
所有代码打包到一个文件，适合小型项目：
```
dist/
  ├── index.js
  ├── index.d.ts
  └── styles.css
```

#### 2. 分离模式 (separated)
Vue 和 React 代码分别打包，适合大型项目：
```
dist/
  ├── vue/
  │   ├── index.js
  │   └── components/
  ├── react/
  │   ├── index.js
  │   └── components/
  └── shared/
      └── utils.js
```

#### 3. 组件模式 (component)
每个组件独立打包，最大化 Tree Shaking：
```
dist/
  ├── components/
  │   ├── VueButton/
  │   └── ReactButton/
  └── index.js
```

#### 4. 自定义模式 (custom)
通过 groups 配置实现完全自定义的输出结构。

## 技术亮点

1. **智能框架检测**：通过多种方式自动识别文件所属框架
2. **灵活的 JSX 转换**：支持不同框架的 JSX 语法特性
3. **插件冲突解决**：自动处理不同框架插件之间的冲突
4. **多样化输出**：提供多种输出组织方式，满足不同需求
5. **性能优化**：支持并行检测、缓存等性能优化特性

## 已知限制

1. 需要安装额外的 Babel 相关依赖
2. 某些复杂的跨框架导入可能需要手动配置
3. TypeScript 类型检查还存在一些问题需要修复

## 下一步计划

1. 修复所有 TypeScript 类型错误
2. 添加完整的测试用例
3. 优化框架检测算法
4. 支持更多框架（如 Solid、Svelte）
5. 提供 CLI 工具简化配置

## 总结

混合框架智能打包系统的实现为 @ldesign/builder 带来了强大的多框架支持能力。开发者可以在同一项目中自由使用 Vue 和 React 组件，而无需担心构建配置的复杂性。系统会自动处理框架检测、JSX 转换、插件管理等技术细节，让开发者专注于业务逻辑的实现。

