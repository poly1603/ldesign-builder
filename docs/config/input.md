# 输入配置

输入配置定义了构建的源文件和项目设置。

## entry

**类型**: `string | string[] | Record<string, string>`  
**默认值**: 自动检测

指定入口文件。

### 单入口

```typescript
export default defineConfig({
  entry: 'src/index.ts'
})
```

### 多入口（数组）

```typescript
export default defineConfig({
  entry: [
    'src/index.ts',
    'src/utils.ts'
  ]
})
```

### 多入口（对象）

```typescript
export default defineConfig({
  entry: {
    main: 'src/index.ts',
    utils: 'src/utils.ts',
    helpers: 'src/helpers/index.ts'
  }
})
```

### 自动检测

如果不指定，将按以下顺序查找：

1. `src/index.ts`
2. `src/index.tsx`
3. `src/index.js`
4. `src/index.jsx`
5. `src/main.ts`
6. `index.ts`
7. `index.js`

## cwd

**类型**: `string`  
**默认值**: `process.cwd()`

项目根目录。

```typescript
export default defineConfig({
  cwd: '/path/to/project'
})
```

## libraryType

**类型**: `LibraryType`  
**默认值**: 自动检测

```typescript
type LibraryType = 
  | 'vue2' | 'vue3' 
  | 'react' 
  | 'svelte' 
  | 'solid' | 'solid-start'
  | 'preact' 
  | 'lit' 
  | 'angular' 
  | 'qwik' 
  | 'astro' 
  | 'nuxt3' 
  | 'remix'
  | 'typescript' 
  | 'vanilla'
```

### 手动指定

```typescript
export default defineConfig({
  libraryType: 'vue3'
})
```

### 自动检测逻辑

检测顺序：

1. 检查 `dependencies` 和 `devDependencies`
2. 扫描源文件（.vue, .tsx, .svelte 等）
3. 分析导入语句
4. 默认为 `typescript` 或 `vanilla`

## include

**类型**: `string[]`  
**默认值**: `['src/**/*']`

包含的文件模式。

```typescript
export default defineConfig({
  include: [
    'src/**/*.ts',
    'lib/**/*.ts'
  ]
})
```

## exclude

**类型**: `string[]`  
**默认值**: `['node_modules/**', '**/*.test.*', '**/*.spec.*']`

排除的文件模式。

```typescript
export default defineConfig({
  exclude: [
    '**/*.test.ts',
    '**/__tests__/**',
    '**/examples/**'
  ]
})
```

## alias

**类型**: `Record<string, string>`  
**默认值**: `{}`

路径别名。

```typescript
export default defineConfig({
  alias: {
    '@': './src',
    '@components': './src/components',
    '@utils': './src/utils'
  }
})
```

使用：

```typescript
// 原始
import Button from '../../../components/Button'

// 使用别名
import Button from '@components/Button'
```

## srcDir

**类型**: `string`  
**默认值**: `'src'`

源代码目录。

```typescript
export default defineConfig({
  srcDir: 'lib'
})
```

## rootDir

**类型**: `string`  
**默认值**: `process.cwd()`

项目根目录（相对于配置文件）。

```typescript
export default defineConfig({
  rootDir: '..'
})
```

## 完整示例

```typescript
import { defineConfig } from '@ldesign/builder'
import { resolve } from 'path'

export default defineConfig({
  // 单入口
  entry: 'src/index.ts',
  
  // 或多入口
  entry: {
    main: 'src/index.ts',
    utils: 'src/utils.ts'
  },
  
  // 项目根目录
  cwd: process.cwd(),
  
  // 库类型
  libraryType: 'vue3',
  
  // 包含文件
  include: [
    'src/**/*.ts',
    'src/**/*.vue'
  ],
  
  // 排除文件
  exclude: [
    '**/*.test.ts',
    '**/__tests__/**',
    '**/examples/**',
    '**/*.stories.ts'
  ],
  
  // 路径别名
  alias: {
    '@': resolve(__dirname, './src'),
    '@components': resolve(__dirname, './src/components'),
    '@utils': resolve(__dirname, './src/utils'),
    '@hooks': resolve(__dirname, './src/hooks')
  },
  
  // 源代码目录
  srcDir: 'src',
  
  // 根目录
  rootDir: process.cwd()
})
```

## 常见模式

### Vue 3 组件库

```typescript
export default defineConfig({
  entry: 'src/index.ts',
  libraryType: 'vue3',
  include: [
    'src/**/*.ts',
    'src/**/*.vue'
  ],
  exclude: [
    '**/*.test.ts',
    '**/examples/**'
  ]
})
```

### React Hooks 库

```typescript
export default defineConfig({
  entry: 'src/index.ts',
  libraryType: 'react',
  include: [
    'src/**/*.ts',
    'src/**/*.tsx'
  ]
})
```

### TypeScript 工具库

```typescript
export default defineConfig({
  entry: {
    main: 'src/index.ts',
    dom: 'src/dom.ts',
    string: 'src/string.ts',
    array: 'src/array.ts'
  },
  libraryType: 'typescript'
})
```

### Monorepo 包

```typescript
export default defineConfig({
  entry: 'src/index.ts',
  alias: {
    '@core': '../../core/src',
    '@utils': '../../utils/src'
  }
})
```

## 最佳实践

### 1. 使用绝对路径

```typescript
import { resolve } from 'path'

export default defineConfig({
  entry: resolve(__dirname, './src/index.ts'),
  alias: {
    '@': resolve(__dirname, './src')
  }
})
```

### 2. 显式排除测试文件

```typescript
export default defineConfig({
  exclude: [
    '**/*.test.*',
    '**/*.spec.*',
    '**/__tests__/**',
    '**/__mocks__/**',
    '**/test/**',
    '**/tests/**'
  ]
})
```

### 3. 合理使用别名

```typescript
export default defineConfig({
  alias: {
    // 通用别名
    '@': './src',
    
    // 功能别名
    '@components': './src/components',
    '@utils': './src/utils',
    '@hooks': './src/hooks',
    '@types': './src/types',
    
    // 避免深层导入
    '@shared': './src/shared'
  }
})
```

### 4. 多入口场景

```typescript
// 按功能分组
export default defineConfig({
  entry: {
    // 核心功能
    core: 'src/core/index.ts',
    
    // DOM 工具
    dom: 'src/dom/index.ts',
    
    // 数据处理
    data: 'src/data/index.ts',
    
    // 工具函数
    utils: 'src/utils/index.ts'
  }
})
```

## 故障排查

### 入口文件未找到

```bash
✖ 错误: 找不到入口文件

解决方案:
  1. 检查文件路径是否正确
  2. 确保文件存在
  3. 使用绝对路径
  4. 检查 cwd 设置
```

```typescript
// ✅ 正确
entry: 'src/index.ts'

// ✅ 也正确
entry: resolve(__dirname, './src/index.ts')

// ❌ 错误（相对于错误的位置）
entry: '../src/index.ts'
```

### 别名无法解析

```bash
✖ 错误: 无法解析模块 '@/components'

解决方案:
  1. 检查别名配置
  2. 使用绝对路径
  3. 确保路径存在
```

```typescript
// ✅ 正确
alias: {
  '@': resolve(__dirname, './src')
}

// ❌ 错误（相对路径可能有问题）
alias: {
  '@': './src'
}
```

## 下一步

- 📦 [输出配置](/config/output) - 配置输出选项
- 🔧 [打包器配置](/config/bundler) - 选择打包引擎
- 🎨 [优化配置](/config/optimization) - 性能优化
