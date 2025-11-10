# 前端框架支持总览

@ldesign/builder 是一个智能的前端库打包工具，支持几乎所有主流前端框架的库打包。

## 🎯 完整支持的框架 (11+)

### 1. **Vue 生态系统**

#### Vue 3 ✅
- **策略**: `Vue3Strategy`
- **文件**: `src/strategies/vue3/Vue3Strategy.ts`
- **特性**:
  - ✅ Vue 3 SFC 单文件组件编译
  - ✅ `<script setup>` 语法支持
  - ✅ TypeScript 完整支持
  - ✅ JSX/TSX 支持（通过 `unplugin-vue-jsx`）
  - ✅ 样式处理（Less/Sass/CSS）
  - ✅ 自动类型声明生成
  - ✅ 多入口自动发现
  - ✅ defineModel、props解构等新特性
- **检测依赖**: `vue: ^3.x`
- **外部依赖**: `vue`

#### Vue 2 ✅
- **策略**: `Vue2Strategy`
- **文件**: `src/strategies/vue2/Vue2Strategy.ts`
- **特性**:
  - ✅ Vue 2 SFC 单文件组件编译
  - ✅ TypeScript 支持
  - ✅ JSX 支持（通过 `@vitejs/plugin-vue2-jsx`）
  - ✅ 样式处理（Less/Sass/CSS）
  - ✅ 类型声明生成
  - ✅ 多入口自动发现
  - ✅ Vue Class Component 支持
- **检测依赖**: `vue: ^2.x`
- **外部依赖**: `vue`, `vue-property-decorator`, `vue-class-component`

---

### 2. **React 生态系统**

#### React ✅
- **策略**: `ReactStrategy`
- **文件**: `src/strategies/react/ReactStrategy.ts`
- **特性**:
  - ✅ JSX/TSX 编译（自动 JSX Runtime）
  - ✅ TypeScript 完整支持
  - ✅ Hooks 支持
  - ✅ React 18+ 特性
  - ✅ 样式处理（Less/Sass/CSS Modules）
  - ✅ 自动类型声明生成
  - ✅ Tree-shaking 优化
  - ✅ 多入口自动发现
- **检测依赖**: `react`
- **外部依赖**: `react`, `react-dom`

#### Preact ✅
- **策略**: `PreactStrategy`
- **文件**: `src/strategies/preact/PreactStrategy.ts`
- **特性**:
  - ✅ Preact 自动 JSX Runtime
  - ✅ React 兼容模式（自动映射 react → preact/compat）
  - ✅ TypeScript 支持
  - ✅ 极致体积优化
  - ✅ 样式处理
  - ✅ 激进压缩策略
- **检测依赖**: `preact`
- **外部依赖**: `preact`

---

### 3. **Web Components 生态**

#### Lit / Web Components ✅
- **策略**: `LitStrategy`
- **文件**: `src/strategies/lit/LitStrategy.ts`
- **特性**:
  - ✅ Lit 装饰器支持
  - ✅ Web Components 标准
  - ✅ TypeScript 完整支持
  - ✅ 样式处理（CSS-in-JS）
  - ✅ 类型声明生成
  - ✅ Shadow DOM 支持
- **检测依赖**: `lit`, `lit-element`
- **外部依赖**: `lit`

---

### 4. **现代响应式框架**

#### Svelte ✅
- **策略**: `SvelteStrategy`
- **文件**: `src/strategies/svelte/SvelteStrategy.ts`
- **特性**:
  - ✅ Svelte 组件编译
  - ✅ TypeScript 支持（通过 svelte-preprocess）
  - ✅ Scoped 样式
  - ✅ CSS 提取
  - ✅ 预处理器支持（Less/Sass）
  - ✅ SSR 友好
- **检测依赖**: `svelte`
- **外部依赖**: `svelte`

#### Solid.js ✅
- **策略**: `SolidStrategy`
- **文件**: `src/strategies/solid/SolidStrategy.ts`
- **特性**:
  - ✅ Solid JSX 转换（通过 babel-preset-solid）
  - ✅ TypeScript 支持
  - ✅ 细粒度响应式
  - ✅ 样式处理
  - ✅ 生产优化
  - ✅ 回退到 esbuild
- **检测依赖**: `solid-js`
- **外部依赖**: `solid-js`

---

### 5. **企业级框架**

#### Angular ✅ (基础支持)
- **策略**: `AngularStrategy`
- **文件**: `src/strategies/angular/AngularStrategy.ts`
- **特性**:
  - ✅ TypeScript 编译
  - ✅ 装饰器支持
  - ✅ ES2018+ 目标
  - ✅ 类型声明生成
  - ⚠️ 建议使用 `ng-packagr` 获得完整支持
- **检测依赖**: `@angular/core`
- **外部依赖**: `@angular/core`, `@angular/common`

---

### 6. **新兴框架**

#### Qwik ✅
- **策略**: `QwikStrategy`
- **文件**: `src/strategies/qwik/QwikStrategy.ts`
- **特性**:
  - ✅ Qwik 优化器支持
  - ✅ Resumability 特性
  - ✅ TypeScript 支持
  - ✅ JSX Runtime
  - ✅ 样式处理（CSS Modules）
  - ✅ 库模式构建
- **检测依赖**: `@builder.io/qwik`
- **外部依赖**: `@builder.io/qwik`

---

### 7. **通用支持**

#### TypeScript ✅
- **策略**: `TypeScriptStrategy`
- **文件**: `src/strategies/typescript/TypeScriptStrategy.ts`
- **特性**:
  - ✅ 纯 TypeScript 项目
  - ✅ 类型声明生成
  - ✅ 多种输出格式
  - ✅ Tree-shaking
- **适用**: 不使用任何框架的纯 TypeScript 库

#### Style Library ✅
- **策略**: `StyleStrategy`
- **文件**: `src/strategies/style/StyleStrategy.ts`
- **特性**:
  - ✅ CSS/Less/Sass/Stylus
  - ✅ PostCSS 处理
  - ✅ CSS Modules
  - ✅ Autoprefixer
  - ✅ 压缩优化

#### Mixed Library ✅
- **策略**: `MixedStrategy`
- **文件**: `src/strategies/mixed/MixedStrategy.ts`
- **特性**:
  - ✅ 多框架混合项目
  - ✅ 灵活配置
  - ✅ 自动策略组合

---

## 🎯 自动检测能力

打包器会自动检测你的项目类型，基于以下信息：

### 依赖检测
```json
{
  "dependencies": {
    "vue": "^3.0.0",           // → Vue3Strategy
    "react": "^18.0.0",        // → ReactStrategy
    "svelte": "^4.0.0",        // → SvelteStrategy
    "solid-js": "^1.0.0",      // → SolidStrategy
    "preact": "^10.0.0",       // → PreactStrategy
    "lit": "^3.0.0",           // → LitStrategy
    "@angular/core": "^17.0.0", // → AngularStrategy
    "@builder.io/qwik": "^1.0.0" // → QwikStrategy
  }
}
```

### 文件扩展名检测
- `.vue` → Vue3Strategy
- `.jsx` / `.tsx` → ReactStrategy
- `.svelte` → SvelteStrategy

### 置信度评分
- **0.9+**: 高置信度（依赖检测）
- **0.7+**: 中等置信度（文件检测）
- **0.5+**: 低置信度（默认 TypeScript）

---

## 🚀 使用示例

### 自动检测（推荐）
```bash
# 零配置，自动检测框架
npx ldesign-builder build
```

### 手动指定框架
```typescript
// .ldesign/builder.config.ts
export default {
  libraryType: 'react', // 或 'vue3', 'svelte', 'solid' 等
  input: 'src/index.tsx',
  output: {
    format: ['esm', 'cjs'],
    dir: 'dist'
  }
}
```

### 针对特定框架优化

#### React 项目
```typescript
export default {
  libraryType: 'react',
  external: ['react', 'react-dom'],
  output: {
    esm: { dir: 'es', format: 'esm' },
    cjs: { dir: 'lib', format: 'cjs' }
  }
}
```

#### Vue 3 项目
```typescript
export default {
  libraryType: 'vue3',
  vue: {
    jsx: { enabled: true },
    script: { 
      defineModel: true,
      propsDestructure: true 
    }
  }
}
```

#### Solid 项目
```typescript
export default {
  libraryType: 'solid',
  mode: 'production',
  performance: {
    minify: true,
    treeshaking: true
  }
}
```

---

## 📊 框架支持矩阵

| 框架 | SFC/组件 | TypeScript | JSX/TSX | 样式处理 | DTS生成 | 优先级 |
|------|----------|-----------|---------|---------|---------|--------|
| Vue 3 | ✅ | ✅ | ✅ | ✅ | ✅ | 10 |
| Vue 2 | ✅ | ✅ | ✅ | ✅ | ✅ | 10 |
| React | ✅ | ✅ | ✅ | ✅ | ✅ | 10 |
| Svelte | ✅ | ✅ | ❌ | ✅ | ✅ | 9 |
| Solid | ✅ | ✅ | ✅ | ✅ | ✅ | 9 |
| Preact | ✅ | ✅ | ✅ | ✅ | ✅ | 9 |
| Lit | ✅ | ✅ | ❌ | ✅ | ✅ | 8 |
| Angular | ✅ | ✅ | ❌ | ✅ | ✅ | 7 |
| Qwik | ✅ | ✅ | ✅ | ✅ | ✅ | 15 |
| TypeScript | ❌ | ✅ | ❌ | ❌ | ✅ | 5 |

---

## 🔧 扩展新框架支持

如果需要添加新的框架支持，请按以下步骤：

### 1. 创建策略类
```typescript
// src/strategies/yourframework/YourFrameworkStrategy.ts
import type { ILibraryStrategy } from '../../types/strategy'
import { LibraryType } from '../../types/library'

export class YourFrameworkStrategy implements ILibraryStrategy {
  readonly name = 'yourframework'
  readonly supportedTypes = [LibraryType.YOUR_FRAMEWORK]
  readonly priority = 10

  async applyStrategy(config: BuilderConfig): Promise<UnifiedConfig> {
    // 实现策略逻辑
  }

  isApplicable(config: BuilderConfig): boolean {
    return config.libraryType === LibraryType.YOUR_FRAMEWORK
  }

  // ... 其他必需方法
}
```

### 2. 注册到 LibraryType
```typescript
// src/types/library.ts
export enum LibraryType {
  // ...
  YOUR_FRAMEWORK = 'yourframework'
}
```

### 3. 注册到 StrategyManager
```typescript
// src/core/StrategyManager.ts
import { YourFrameworkStrategy } from '../strategies/yourframework/YourFrameworkStrategy'

// 在 registerDefaultStrategies() 中:
this.registerStrategy(new YourFrameworkStrategy())
```

### 4. 添加自动检测逻辑
```typescript
// src/core/StrategyManager.ts
// 在 detectStrategy() 中添加:
if (packageJson.dependencies?.yourframework || 
    packageJson.devDependencies?.yourframework) {
  detectedStrategy = LibraryType.YOUR_FRAMEWORK
  confidence = 0.9
  evidence.push('检测到 YourFramework 依赖')
}
```

---

## 📚 相关文档

- [快速开始](./README.md#-快速开始)
- [配置指南](./docs/CONFIGURATION.md)
- [性能优化](./PERFORMANCE_OPTIMIZATION.md)
- [API 文档](./docs/API.md)

---

## 🤝 贡献

欢迎为新框架支持贡献代码！请查看 [贡献指南](./CONTRIBUTING.md)。

## 📝 许可证

MIT License
