# TypeScript 配置指南

## 📚 概述

本指南提供了使用 @ldesign/builder 打包 TypeScript 项目的最佳实践和配置建议。

## 🎯 标准配置

### 内置 tsconfig.base.json

Builder 提供了标准的 TypeScript 配置文件 `config/tsconfig.base.json`：

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "strict": false,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "jsx": "preserve"
  }
}
```

### 关键配置说明

#### moduleResolution: "bundler"
- TypeScript 5.0+ 新增选项
- 专为打包工具优化
- 更好的 ESM 支持

#### isolatedModules: true
- 每个文件独立编译
- 提高编译速度
- 支持增量构建
- **注意**：不能与 `preserveConstEnums` 同时使用

#### skipLibCheck: true
- 跳过 .d.ts 文件检查
- 显著提升编译速度
- 推荐在库项目中使用

## ⚠️ 常见配置冲突

### 1. isolatedModules vs preserveConstEnums

❌ **错误配置**：
```json
{
  "compilerOptions": {
    "isolatedModules": true,
    "preserveConstEnums": true  // 冲突！
  }
}
```

✅ **正确配置**：
```json
{
  "compilerOptions": {
    "isolatedModules": true
    // 不设置 preserveConstEnums（默认为 false）
  }
}
```

**错误信息**：
```
Option 'preserveConstEnums' cannot be disabled when 'isolatedModules' is enabled
```

### 2. moduleResolution 选择

对于不同的 TypeScript 版本：

**TypeScript 5.0+**（推荐）：
```json
{
  "compilerOptions": {
    "moduleResolution": "bundler"
  }
}
```

**TypeScript < 5.0**：
```json
{
  "compilerOptions": {
    "moduleResolution": "node"
  }
}
```

### 3. strict 模式权衡

**开发新项目**（推荐严格模式）：
```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true
  }
}
```

**维护旧项目**（渐进式严格）：
```json
{
  "compilerOptions": {
    "strict": false,
    "strictNullChecks": false,  // 逐步开启
    "noImplicitAny": false       // 逐步开启
  }
}
```

## 🔧 项目类型配置

### Vue 3 项目

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "jsxImportSource": "vue",
    "types": ["vue", "node"]
  }
}
```

### React 项目

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "types": ["react", "react-dom", "node"]
  }
}
```

### 纯 TypeScript 库

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "declarationMap": true,
    "types": ["node"]
  }
}
```

## 📦 Builder 使用

### 基本命令

```bash
# 使用默认配置
ldesign-builder build

# 指定格式
ldesign-builder build -f esm,cjs,umd

# 监听模式
ldesign-builder build --watch
```

### 配置文件

在项目根目录创建 `ldesign.config.ts`：

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  formats: ['esm', 'cjs'],
  sourcemap: true,
  minify: true,
  // Builder 会自动合并内置 tsconfig
})
```

## 🎨 最佳实践

### 1. 版本统一

**所有包使用统一的 TypeScript 版本**：

```json
{
  "devDependencies": {
    "typescript": "^5.7.3"
  }
}
```

避免在 `dependencies` 中声明 TypeScript。

### 2. 导出规范

**使用明确的导出**：

```typescript
// ✓ 推荐
export { functionA } from './moduleA'
export { functionB } from './moduleB'

// ❌ 避免
export * from './moduleA'
export * from './moduleB'  // 可能导致命名冲突
```

**类型导出分离**：

```typescript
// src/index.ts
export { MyClass } from './core'
export type { MyInterface, MyType } from './types'
```

### 3. 避免循环依赖

**使用桶文件（barrel files）**：

```
src/
├── index.ts          # 主入口
├── core/
│   ├── index.ts      # 桶文件
│   ├── moduleA.ts
│   └── moduleB.ts
└── utils/
    ├── index.ts      # 桶文件
    ├── utilA.ts
    └── utilB.ts
```

```typescript
// src/core/index.ts
export { ModuleA } from './moduleA'
export { ModuleB } from './moduleB'

// src/index.ts
export * from './core'
export * from './utils'
```

### 4. Path Mapping

**使用 paths 简化导入**：

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/core/*": ["src/core/*"],
      "@/utils/*": ["src/utils/*"]
    }
  }
}
```

```typescript
// 使用
import { MyClass } from '@/core/MyClass'
// 而不是
import { MyClass } from '../../core/MyClass'
```

## 🐛 常见问题

### Q1: 打包时提示 "Multiple exports with the same name"

**原因**：重复导出同名成员

**解决**：
```typescript
// ❌ 错误
export { usePagination } from './moduleA'
export { usePagination } from './moduleB'

// ✓ 正确
export { usePagination } from './moduleA'
export { usePagination as usePaginationB } from './moduleB'
```

### Q2: 打包时提示 "is not exported by"

**原因**：导入的名称不存在

**解决**：
```typescript
// 确保导出和导入名称一致
// moduleA.ts
export function myFunction() { }

// index.ts
import { myFunction } from './moduleA'  // ✓
// import { myFunc } from './moduleA'   // ❌
```

### Q3: 类型声明文件生成失败

**原因**：TypeScript 配置问题或代码类型错误

**解决**：
1. 检查 `tsconfig.json` 中 `declaration: true`
2. 运行 `tsc --noEmit` 检查类型错误
3. 修复所有类型错误

### Q4: Builder 识别项目类型错误

**原因**：LibraryDetector 检测逻辑问题

**解决**：
```typescript
// ldesign.config.ts
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 明确指定项目类型
  enableVue: true,  // Vue 项目
  // 或
  enableReact: true,  // React 项目
})
```

## 📊 性能优化

### 编译速度优化

```json
{
  "compilerOptions": {
    "skipLibCheck": true,        // 跳过库检查
    "incremental": true,          // 增量编译
    "tsBuildInfoFile": ".tsbuildinfo"  // 缓存文件
  }
}
```

### 打包体积优化

```typescript
// ldesign.config.ts
export default defineConfig({
  minify: true,           // 压缩代码
  sourcemap: false,       // 生产环境禁用 sourcemap
  treeshake: true,        // Tree-shaking
})
```

## 🔍 调试技巧

### 查看实际使用的配置

```bash
# 查看 TypeScript 配置
tsc --showConfig

# 查看 Builder 配置
ldesign-builder build --debug
```

### 常用检查命令

```bash
# 类型检查
tsc --noEmit

# 查看编译输出
tsc --listEmittedFiles

# 查看文件依赖
tsc --listFiles
```

## 📚 参考资源

- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [TSConfig 参考](https://www.typescriptlang.org/tsconfig)
- [TypeScript 5.0 新特性](https://devblogs.microsoft.com/typescript/announcing-typescript-5-0/)

---

**最后更新**：2024-10-22
**适用版本**：@ldesign/builder ^1.0.0, TypeScript ^5.7.3


