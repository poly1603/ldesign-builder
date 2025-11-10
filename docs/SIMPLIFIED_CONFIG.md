# @ldesign/builder 简化配置指南

## 📝 概述

`@ldesign/builder` 现在支持极简配置方式,让你只需要几行代码就能完成复杂的构建配置。

## 🎯 核心理念

**最简配置**: 只需要 `esm: true`, `cjs: true`, `umd: true` 就能使用智能默认配置  
**渐进增强**: 需要自定义时,可以逐步添加配置项  
**类型安全**: 完整的 TypeScript 类型定义,IDE 自动补全

## 🚀 快速开始

### 最简配置 (推荐)

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  output: {
    esm: true,
    cjs: true,
    umd: true,
  },
})
```

**这就够了!** Builder 会自动:
- ✅ ESM 输出到 `es/` 目录,保留目录结构,生成 DTS 和 sourcemap
- ✅ CJS 输出到 `lib/` 目录,保留目录结构,生成 DTS 和 sourcemap
- ✅ UMD 输出到 `dist/` 目录,自动压缩,生成 sourcemap
- ✅ 从 `package.json` 自动推断库名称
- ✅ 从 `package.json` 自动推断外部依赖
- ✅ 自动检测入口文件 (`src/index.ts` 或 `index.ts`)

### 部分自定义配置

只需要覆盖你想改的部分:

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  output: {
    esm: true,  // 使用默认配置
    cjs: true,  // 使用默认配置
    umd: {
      name: 'MyCustomName',  // 只自定义库名称,其他使用默认配置
    },
  },
})
```

### 完全自定义配置

需要完全控制时,可以覆盖所有选项:

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  output: {
    esm: {
      dir: 'dist/esm',
      preserveStructure: true,
      dts: true,
      sourcemap: true,
      input: 'src/index.ts',
    },
    cjs: {
      dir: 'dist/cjs',
      preserveStructure: true,
      dts: true,
      sourcemap: 'inline',
      input: 'src/index.ts',
    },
    umd: {
      dir: 'dist/umd',
      name: 'MyLibrary',
      minify: true,
      sourcemap: true,
      input: 'src/index.ts',
      globals: {
        'vue': 'Vue',
        'react': 'React',
      },
    },
  },
})
```

## 📋 默认配置详情

### ESM 默认配置

```typescript
{
  dir: 'es',
  format: 'esm',
  preserveStructure: true,
  dts: true,
  sourcemap: true,
}
```

### CJS 默认配置

```typescript
{
  dir: 'lib',
  format: 'cjs',
  preserveStructure: true,
  dts: true,
  sourcemap: true,
}
```

### UMD 默认配置

```typescript
{
  dir: 'dist',
  format: 'umd',
  name: '<从 package.json 自动推断>',
  minify: true,
  sourcemap: true,
}
```

### IIFE 默认配置

```typescript
{
  dir: 'dist',
  format: 'iife',
  name: '<从 package.json 自动推断>',
  minify: true,
  sourcemap: true,
}
```

## 🔧 配置选项

### 格式配置 (FormatOutputConfig)

每个格式都支持以下配置项:

```typescript
interface FormatOutputConfig {
  /** 输出目录 */
  dir?: string

  /** 输入文件 (支持字符串、数组、对象) */
  input?: string | string[] | Record<string, string>

  /** 输出格式 */
  format?: 'esm' | 'cjs' | 'umd' | 'iife'

  /** 是否保留目录结构 */
  preserveStructure?: boolean

  /** 是否生成类型声明文件 */
  dts?: boolean

  /** 是否生成 sourcemap */
  sourcemap?: boolean | 'inline' | 'hidden'

  /** 导出模式 */
  exports?: 'auto' | 'default' | 'named' | 'none'

  /** 压缩配置 */
  minify?: boolean | MinifyConfig

  /** 文件名模式 */
  fileName?: string | ((chunkInfo: ChunkInfo) => string)

  /** 全局变量映射 (UMD/IIFE 需要) */
  globals?: Record<string, string>

  /** 库名称 (UMD/IIFE 需要) */
  name?: string
}
```

## 💡 使用场景

### 场景 1: 纯 TypeScript 库

```typescript
export default defineConfig({
  output: {
    esm: true,
    cjs: true,
  },
})
```

### 场景 2: 浏览器 + Node.js 库

```typescript
export default defineConfig({
  output: {
    esm: true,
    cjs: true,
    umd: {
      name: 'MyLib',
    },
  },
})
```

### 场景 3: 多入口库

```typescript
export default defineConfig({
  output: {
    esm: {
      input: {
        'index': 'src/index.ts',
        'utils': 'src/utils/index.ts',
        'components': 'src/components/index.ts',
      },
    },
    cjs: {
      input: {
        'index': 'src/index.ts',
        'utils': 'src/utils/index.ts',
        'components': 'src/components/index.ts',
      },
    },
  },
})
```

### 场景 4: 自定义输出目录

```typescript
export default defineConfig({
  output: {
    esm: {
      dir: 'dist/esm',
    },
    cjs: {
      dir: 'dist/cjs',
    },
    umd: {
      dir: 'dist/browser',
      name: 'MyLib',
    },
  },
})
```

### 场景 5: 禁用某些格式

```typescript
export default defineConfig({
  output: {
    esm: true,
    cjs: false,  // 不生成 CJS
    umd: false,  // 不生成 UMD
  },
})
```

## 🎨 自动推断功能

### 库名称推断

从 `package.json` 的 `name` 字段自动推断:

```json
{
  "name": "@ldesign/engine-core"
}
```

推断结果: `LdesignEngineCore`

规则:
1. 移除 `@` 前缀
2. 将 `/` 和 `-` 替换为空格
3. 每个单词首字母大写
4. 移除空格

### 外部依赖推断

自动从 `package.json` 读取:
- `peerDependencies` (总是外部化)
- `dependencies` (总是外部化)

### 全局变量映射推断

常见库的全局变量自动映射:

```typescript
{
  'vue': 'Vue',
  'react': 'React',
  'react-dom': 'ReactDOM',
  '@angular/core': 'ng.core',
  'svelte': 'Svelte',
  'solid-js': 'Solid',
  'lit': 'Lit',
  'preact': 'preact',
  'jquery': 'jQuery',
  'lodash': '_',
  'moment': 'moment',
  'axios': 'axios',
}
```

其他库自动生成: `@scope/package-name` → `ScopePackageName`

## 📊 配置优先级

1. **用户显式配置** (最高优先级)
2. **默认配置**
3. **自动推断**

示例:

```typescript
export default defineConfig({
  output: {
    umd: {
      name: 'CustomName',  // 用户配置,优先级最高
      // dir: 'dist',      // 未配置,使用默认值
      // minify: true,     // 未配置,使用默认值
    },
  },
})
```

## 🔍 类型定义

完整的类型定义在 `tools/builder/src/types/output.ts`:

```typescript
export interface OutputConfig {
  /** ESM 格式配置 (true 使用默认配置, false 禁用) */
  esm?: boolean | FormatOutputConfig

  /** CJS 格式配置 (true 使用默认配置, false 禁用) */
  cjs?: boolean | FormatOutputConfig

  /** UMD 格式配置 (true 使用默认配置, false 禁用) */
  umd?: boolean | (FormatOutputConfig & {
    name?: string
    globals?: Record<string, string>
  })

  /** IIFE 格式配置 (true 使用默认配置, false 禁用) */
  iife?: boolean | (FormatOutputConfig & {
    name?: string
    globals?: Record<string, string>
  })
}
```

## ✅ 最佳实践

1. **优先使用简化配置**: 除非有特殊需求,否则使用 `true` 即可
2. **渐进式增强**: 从简单配置开始,需要时再添加自定义选项
3. **利用自动推断**: 让 builder 自动处理库名称、外部依赖等
4. **保持一致性**: 所有格式使用相同的 `input` 配置
5. **使用 TypeScript**: 获得完整的类型检查和 IDE 支持

## 🆚 对比

### 旧方式 (63 行)

```typescript
export default defineConfig({
  libraryType: 'typescript',
  input: 'src/index.ts',
  
  output: {
    esm: {
      dir: 'es',
      format: 'esm',
      preserveStructure: true,
      dts: true,
      sourcemap: true,
    },
    cjs: {
      dir: 'lib',
      format: 'cjs',
      preserveStructure: true,
      dts: true,
      sourcemap: true,
    },
    umd: {
      dir: 'dist',
      format: 'umd',
      name: 'LDesignEngineCore',
      minify: true,
      sourcemap: true,
      input: 'src/index.ts',
    },
  },
  
  typescript: {
    tsconfig: './tsconfig.json',
    target: 'es2020',
  },
  
  dts: true,
  sourcemap: true,
  clean: true,
})
```

### 新方式 (12 行)

```typescript
export default defineConfig({
  output: {
    esm: true,
    cjs: true,
    umd: {
      name: 'LDesignEngineCore',
      input: 'src/index.ts',
    },
  },
})
```

**减少了 81% 的代码!** 🎉

---

**更新时间**: 2025-11-03  
**版本**: @ldesign/builder v1.0.0+

