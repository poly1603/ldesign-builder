# @ldesign/builder 使用指南

## 快速开始

### 安装

```bash
pnpm add @ldesign/builder -D
```

### 基本使用

#### 1. 使用配置预设（推荐）

在包根目录创建 `.ldesign/builder.config.ts`:

```typescript
import { defineConfig, monorepoPackage } from '@ldesign/builder'

export default defineConfig(
  monorepoPackage({
    umd: {
      name: 'MyPackage' // UMD 全局变量名
    }
  })
)
```

#### 2. 在 package.json 中添加构建脚本

```json
{
  "scripts": {
    "build": "ldesign-builder build"
  }
}
```

#### 3. 运行构建

```bash
pnpm build
```

## 配置预设

### 1. monorepoPackage - Monorepo 包预设

**适用于**: monorepo 中的标准包

**输出**: ESM (`es/`) + CJS (`lib/`) + UMD (`dist/`)

**特性**:
- ✅ 自动使用 `index-lib.ts` 作为 UMD 入口（精简版）
- ✅ ESM/CJS 使用 `index.ts`（完整版）
- ✅ 自动生成类型声明
- ✅ 自动排除示例、测试等非生产代码

```typescript
import { defineConfig, monorepoPackage } from '@ldesign/builder'

export default defineConfig(
  monorepoPackage({
    umd: {
      name: 'MyPackage'
    },
    external: ['vue', 'react'],
    globals: {
      vue: 'Vue',
      react: 'React'
    }
  })
)
```

### 2. vueLibrary - Vue 组件库预设

**适用于**: Vue 3 组件库

**输出**: ESM (`es/`) + CJS (`lib/`) + UMD (`dist/`)

**特性**:
- ✅ 自动处理 `.vue` 单文件组件
- ✅ 支持 Vue JSX/TSX
- ✅ Less/Sass/CSS 样式处理
- ✅ 自动配置 Vue 为外部依赖

```typescript
import { defineConfig, vueLibrary } from '@ldesign/builder'

export default defineConfig(
  vueLibrary({
    umd: {
      name: 'MyVueLib'
    },
    style: {
      preprocessor: 'less' // 或 'sass', 'stylus', 'css'
    }
  })
)
```

### 3. reactLibrary - React 组件库预设

**适用于**: React 组件库

**输出**: ESM (`es/`) + CJS (`lib/`) + UMD (`dist/`)

**特性**:
- ✅ JSX/TSX 转译
- ✅ React Runtime 自动配置
- ✅ CSS Modules 支持
- ✅ 自动配置 React 为外部依赖

```typescript
import { defineConfig, reactLibrary } from '@ldesign/builder'

export default defineConfig(
  reactLibrary({
    umd: {
      name: 'MyReactLib'
    }
  })
)
```

### 4. libraryPackage - 独立库预设

**适用于**: 独立发布的库（不需要 UMD）

**输出**: ESM (`es/`) + CJS (`lib/`)

```typescript
import { defineConfig, libraryPackage } from '@ldesign/builder'

export default defineConfig(
  libraryPackage({
    external: ['lodash']
  })
)
```

### 5. multiFrameworkLibrary - 多框架适配器预设

**适用于**: 支持多个框架的库（如 Cropper）

**输出**: 核心库 + 各框架适配器

```typescript
import { multiFrameworkLibrary } from '@ldesign/builder'

export default multiFrameworkLibrary({
  name: 'MyCropper',
  core: {
    // 核心库配置
  },
  vue: {
    // Vue 适配器配置
  },
  react: {
    // React 适配器配置
  },
  angular: {
    // Angular 适配器配置
  }
})
```

## 双入口配置

### 为什么需要双入口？

不同的输出格式可能需要不同的导出内容：

- **ESM/CJS**: 完整功能，包括框架集成（Vue/React）
- **UMD**: 精简版，只包含核心功能，减小体积

### 如何配置双入口？

#### 1. 创建两个入口文件

**src/index.ts** (完整版 - 用于 ESM/CJS):
```typescript
// 核心功能
export * from './core'

// Vue 集成
export * from './vue'

// React 集成  
export * from './react'

// 工具函数
export * from './utils'
```

**src/index-lib.ts** (精简版 - 用于 UMD):
```typescript
// 只导出核心功能，不包含框架集成
export * from './core'

// 只导出基本工具
export { someUtil } from './utils'

// 不导出 Vue/React 集成，减小 UMD 包体积
```

#### 2. 配置自动处理

使用 `monorepoPackage` 预设时，会自动：
- UMD 格式使用 `index-lib.ts`
- ESM/CJS 格式使用 `index.ts`

无需手动配置！

## 排除非生产代码

### 默认排除的目录和文件

Builder 默认排除以下内容，无需手动配置：

```typescript
[
  '**/__tests__/**',      // 测试目录
  '**/*.test.*',          // 测试文件
  '**/*.spec.*',          // 规范文件
  '**/examples/**',       // 示例目录
  '**/example/**',        // 示例目录
  '**/demo/**',           // 演示目录
  '**/demos/**',          // 演示目录
  '**/docs/**',           // 文档目录
  '**/dev/**',            // 开发目录
  '**/e2e/**',            // E2E 测试
  '**/benchmark/**',      // 基准测试
  '**/.vitepress/**',     // VitePress
  '**/.vuepress/**',      // VuePress
  '**/scripts/**',        // 脚本目录
]
```

### 添加自定义排除

```typescript
export default defineConfig(
  monorepoPackage({
    exclude: [
      '**/my-custom-dir/**',  // 自定义排除
      '**/*.md'               // 排除 Markdown 文件
    ]
  })
)
```

## 样式处理

### 支持的预处理器

- CSS
- Less
- Sass/SCSS
- Stylus

### 配置样式处理

```typescript
export default defineConfig(
  vueLibrary({
    style: {
      extract: true,         // 提取样式到单独文件
      minimize: true,        // 压缩样式
      autoprefixer: true,    // 自动添加浏览器前缀
      preprocessor: 'less',  // 预处理器
      modules: false         // CSS Modules（React 推荐开启）
    }
  })
)
```

## 外部依赖配置

### 为什么需要配置外部依赖？

将框架和大型库标记为外部依赖可以：
- ✅ 减小打包体积
- ✅ 避免重复打包
- ✅ 让用户使用自己安装的版本

### 配置外部依赖

```typescript
export default defineConfig(
  monorepoPackage({
    // 外部依赖列表
    external: [
      'vue',
      'react',
      'react-dom',
      'lodash',
      '@ldesign/http'  // 内部依赖也可以标记为外部
    ],
    
    // UMD 格式的全局变量映射
    globals: {
      'vue': 'Vue',
      'react': 'React',
      'react-dom': 'ReactDOM',
      'lodash': '_',
      '@ldesign/http': 'LDesignHttp'
    }
  })
)
```

## 输出目录结构

### 标准输出结构

```
your-package/
├── es/               # ESM 格式
│   ├── index.js
│   ├── index.d.ts
│   ├── core/
│   │   ├── xxx.js
│   │   └── xxx.d.ts
│   └── utils/
│       ├── xxx.js
│       └── xxx.d.ts
├── lib/              # CJS 格式
│   ├── index.cjs
│   ├── index.d.ts
│   ├── core/
│   │   ├── xxx.cjs
│   │   └── xxx.d.ts
│   └── utils/
│       ├── xxx.cjs
│       └── xxx.d.ts
└── dist/             # UMD 格式
    ├── index.umd.js
    ├── index.umd.min.js
    └── index.d.ts
```

### package.json 配置

```json
{
  "main": "./lib/index.cjs",
  "module": "./es/index.js",
  "types": "./es/index.d.ts",
  "unpkg": "./dist/index.umd.min.js",
  "jsdelivr": "./dist/index.umd.min.js",
  "exports": {
    ".": {
      "types": "./es/index.d.ts",
      "import": "./es/index.js",
      "require": "./lib/index.cjs"
    }
  },
  "files": [
    "es",
    "lib",
    "dist",
    "README.md",
    "LICENSE"
  ]
}
```

## 常见问题

### 1. 如何只输出 ESM 和 CJS？

使用 `libraryPackage` 预设，或者自定义 `output`:

```typescript
export default defineConfig(
  monorepoPackage({
    output: {
      esm: { dir: 'es', format: 'esm', dts: true },
      cjs: { dir: 'lib', format: 'cjs', dts: true },
      // 不配置 umd
    }
  })
)
```

### 2. 如何禁用类型声明生成？

```typescript
export default defineConfig(
  monorepoPackage({
    dts: false
  })
)
```

### 3. 如何自定义输出目录？

```typescript
export default defineConfig(
  monorepoPackage({
    output: {
      esm: { dir: 'esm', format: 'esm' },  // 自定义为 esm/
      cjs: { dir: 'cjs', format: 'cjs' },  // 自定义为 cjs/
      umd: { dir: 'umd', format: 'umd' }   // 自定义为 umd/
    }
  })
)
```

### 4. 构建时出现 "examples/xxx.vue not found" 错误？

这说明示例文件被包含在构建中。解决方法：

1. 确保使用了预设配置（自动排除示例）
2. 或手动添加排除：
   ```typescript
   exclude: ['**/examples/**']
   ```

### 5. UMD 包太大怎么办？

1. 使用 `index-lib.ts` 精简入口（自动）
2. 配置更多外部依赖：
   ```typescript
   external: ['vue', 'lodash', 'axios']
   ```
3. 开启代码压缩（UMD 默认开启）

## 迁移指南

### 从 Vite 迁移到 Builder

#### 1. 创建 Builder 配置

```bash
mkdir -p .ldesign
touch .ldesign/builder.config.ts
```

#### 2. 选择合适的预设

根据项目类型选择：
- Vue 项目 → `vueLibrary`
- React 项目 → `reactLibrary`
- TypeScript 库 → `libraryPackage`
- Monorepo 包 → `monorepoPackage`

#### 3. 更新 package.json

```json
{
  "scripts": {
    "build": "ldesign-builder build",  // 替换 vite build
    "dev": "vite"  // 开发环境仍可使用 Vite
  }
}
```

#### 4. 测试构建

```bash
pnpm build
```

## 最佳实践

### 1. 目录结构

```
your-package/
├── .ldesign/
│   └── builder.config.ts    # 构建配置
├── src/
│   ├── index.ts             # 完整入口（ESM/CJS）
│   ├── index-lib.ts         # 精简入口（UMD）
│   ├── core/                # 核心功能
│   ├── utils/               # 工具函数
│   ├── vue/                 # Vue 集成（可选）
│   └── react/               # React 集成（可选）
├── examples/                # 示例（自动排除）
├── __tests__/               # 测试（自动排除）
└── package.json
```

### 2. 导出策略

- **index.ts**: 导出所有功能，用于 ESM/CJS
- **index-lib.ts**: 只导出核心功能，用于 UMD

### 3. 依赖管理

- 框架（Vue/React）→ `external` + `peerDependencies`
- 工具库（lodash）→ `external` 或打包（视情况）
- 小型库（< 10KB）→ 可以打包

---

**需要帮助？** 查看 [完整文档](./README.md) 或 [优化报告](./OPTIMIZATION_COMPLETE.md)

