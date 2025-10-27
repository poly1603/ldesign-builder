# 混合框架示例项目

这个示例展示了如何在同一个项目中同时使用 Vue 和 React 组件，并通过 @ldesign/builder 进行智能打包。

## 项目结构

```
src/
├── index.ts          # 主入口
├── vue/              # Vue 组件
│   ├── Button.vue    # Vue SFC 组件
│   ├── Card.vue.tsx  # Vue TSX 组件
│   └── composables.ts
├── react/            # React 组件
│   ├── Button.react.tsx
│   ├── Card.react.tsx
│   └── hooks.ts
└── shared/           # 共享代码
    ├── types.ts
    └── utils.ts
```

## 特性

- ✅ 支持 Vue SFC (.vue 文件)
- ✅ 支持 Vue TSX (.vue.tsx 文件)
- ✅ 支持 React TSX (.react.tsx 文件)
- ✅ 自动框架检测
- ✅ 智能 JSX 转换
- ✅ 分离打包模式
- ✅ 类型定义生成

## 构建配置

查看 `builder.config.ts` 了解详细的构建配置：

- **打包模式**: separated（分离模式）
- **JSX 处理**: 自动检测并应用正确的转换
- **输出结构**: Vue 和 React 代码分别输出到不同目录

## 使用方法

### 安装依赖

```bash
pnpm install
```

### 构建项目

```bash
pnpm build
```

### 开发模式

```bash
pnpm dev
```

## 输出结构

构建后的目录结构：

```
dist/
├── vue/              # Vue 组件
│   ├── index.js
│   ├── index.d.ts
│   └── components/
├── react/            # React 组件
│   ├── index.js
│   ├── index.d.ts
│   └── components/
├── shared/           # 共享代码
│   └── utils.js
└── index.js          # 主入口
```

## 使用构建产物

### 导入所有组件

```typescript
import { VueButton, ReactButton } from '@examples/mixed-framework'
```

### 仅导入 Vue 组件

```typescript
import { VueButton, VueCard } from '@examples/mixed-framework/vue'
```

### 仅导入 React 组件

```typescript
import { ReactButton, ReactCard } from '@examples/mixed-framework/react'
```

## 注意事项

1. Vue TSX 文件使用 `.vue.tsx` 扩展名
2. React TSX 文件使用 `.react.tsx` 扩展名
3. 共享代码应放在 `shared` 目录
4. 类型定义会自动生成并正确分离

