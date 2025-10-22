# TypeScript 声明文件生成指南

## 概述

`@ldesign/builder` 现在支持使用独立的 DtsGenerator 生成 TypeScript 声明文件（.d.ts），不再过度依赖 TypeScript 版本和 tsconfig 配置。

## 核心特性

### 1. 独立的 DTS 生成器

- 使用 TypeScript Compiler API 直接生成声明文件
- 不依赖 `rollup-plugin-dts` 或其他插件
- 避免版本兼容性问题
- 保持源码目录结构

### 2. 多目录支持

- ESM 格式：生成到 `es/` 目录
- CJS 格式：生成到 `lib/` 目录  
- UMD/IIFE 格式：生成到 `dist/` 目录

### 3. 作为独立 Format

`dts` 现在是一个独立的输出格式，可以与其他格式一起使用：

```typescript
// builder.config.ts
export default {
  output: {
    format: ['esm', 'cjs', 'dts']
  }
}
```

## 使用方法

### 1. CLI 使用

```bash
# 生成 ESM + CJS + DTS
ldesign-builder build -f esm,cjs,dts

# 仅生成 DTS
ldesign-builder build -f dts

# 生成所有格式（包括 UMD）
ldesign-builder build -f esm,cjs,umd,dts
```

### 2. API 使用

```typescript
import { LibraryBuilder } from '@ldesign/builder'

const builder = new LibraryBuilder({
  output: {
    format: ['esm', 'cjs', 'dts']
  },
  sourcemap: true
})

await builder.build()
```

### 3. 配置文件使用

```typescript
// builder.config.ts
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  output: {
    format: ['esm', 'cjs', 'dts'],
    sourcemap: true
  },
  typescript: {
    declaration: true,
    declarationMap: true
  }
})
```

### 4. 直接使用 DtsGenerator

```typescript
import { DtsGenerator } from '@ldesign/builder/generators/DtsGenerator'

const generator = new DtsGenerator({
  srcDir: 'src',
  outDir: 'es',
  preserveStructure: true,
  declarationMap: true
})

const result = await generator.generate()

if (result.success) {
  console.log(`生成了 ${result.files.length} 个声明文件`)
} else {
  console.error('生成失败:', result.errors)
}
```

## 生成选项

### DtsGeneratorOptions

```typescript
interface DtsGeneratorOptions {
  /** 源码目录 */
  srcDir: string
  
  /** 输出目录 */
  outDir: string
  
  /** tsconfig 文件路径（可选） */
  tsconfig?: string
  
  /** 是否保持源码目录结构（默认: true） */
  preserveStructure?: boolean
  
  /** 是否生成 declarationMap（默认: false） */
  declarationMap?: boolean
  
  /** 项目根目录（可选） */
  rootDir?: string
  
  /** 要处理的文件模式（可选） */
  include?: string[]
  
  /** 要排除的文件模式（可选） */
  exclude?: string[]
  
  /** 日志记录器（可选） */
  logger?: Logger
}
```

### 默认值

```typescript
{
  preserveStructure: true,
  declarationMap: false,
  include: ['**/*.ts', '**/*.tsx', '**/*.vue'],
  exclude: [
    '**/*.test.ts',
    '**/*.spec.ts',
    '**/__tests__/**',
    '**/node_modules/**'
  ]
}
```

## 目录结构

生成的声明文件会保持源码的目录结构：

```
src/
  ├── index.ts
  ├── utils/
  │   ├── helper.ts
  │   └── format.ts
  └── components/
      └── Button.ts

↓ 生成后 ↓

es/
  ├── index.js
  ├── index.d.ts
  ├── utils/
  │   ├── helper.js
  │   ├── helper.d.ts
  │   ├── format.js
  │   └── format.d.ts
  └── components/
      ├── Button.js
      └── Button.d.ts

lib/
  ├── index.cjs
  ├── index.d.ts
  ├── utils/
  │   ├── helper.cjs
  │   ├── helper.d.ts
  │   ├── format.cjs
  │   └── format.d.ts
  └── components/
      ├── Button.cjs
      └── Button.d.ts
```

## Package.json 配置

确保 package.json 正确配置 exports 字段：

```json
{
  "name": "@my/package",
  "version": "1.0.0",
  "type": "module",
  "main": "./lib/index.cjs",
  "module": "./es/index.js",
  "types": "./es/index.d.ts",
  "exports": {
    ".": {
      "types": "./es/index.d.ts",
      "import": "./es/index.js",
      "require": "./lib/index.cjs"
    },
    "./utils": {
      "types": "./es/utils/index.d.ts",
      "import": "./es/utils/index.js",
      "require": "./lib/utils/index.cjs"
    }
  },
  "files": [
    "es",
    "lib",
    "dist"
  ]
}
```

## 错误处理

DtsGenerator 会自动过滤以下类型的错误：

- `.vue` 文件相关的错误
- 类型定义文件找不到（TS2688, TS7016）
- 模块找不到（TS2307）
- 未使用的变量（TS6133）
- 全局类型找不到（TS2304）

如果需要更严格的类型检查，请使用独立的 `tsc --noEmit` 命令。

## 性能优化

### 1. 增量编译

DtsGenerator 支持增量编译，会生成 `.tsbuildinfo` 文件以加速后续构建。

### 2. 跳过库检查

默认启用 `skipLibCheck` 以提高性能。

### 3. 并行生成

当同时为多个目录生成声明文件时，会并行处理以提高速度。

## 故障排除

### 问题：生成的声明文件不完整

**解决方案：**
1. 检查 `tsconfig.json` 的 `include` 和 `exclude` 配置
2. 确保所有源文件都被正确识别
3. 查看构建日志中的警告信息

### 问题：类型错误导致生成失败

**解决方案：**
1. 使用 `skipLibCheck: true` 跳过库检查
2. 检查并修复源码中的类型错误
3. 使用 `tsc --noEmit` 进行独立的类型检查

### 问题：目录结构不匹配

**解决方案：**
1. 确保 `preserveStructure: true`
2. 检查 `rootDir` 配置是否正确
3. 验证 `srcDir` 指向正确的源码目录

## 最佳实践

### 1. 分离类型检查和构建

```json
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "build": "ldesign-builder build -f esm,cjs,dts",
    "prebuild": "npm run type-check"
  }
}
```

### 2. 使用 declarationMap 提高调试体验

```typescript
export default defineConfig({
  output: {
    format: ['esm', 'cjs', 'dts'],
    sourcemap: true
  },
  typescript: {
    declarationMap: true  // 生成 .d.ts.map
  }
})
```

### 3. 配置合理的排除规则

```typescript
const generator = new DtsGenerator({
  srcDir: 'src',
  outDir: 'es',
  exclude: [
    '**/*.test.ts',
    '**/*.spec.ts',
    '**/__tests__/**',
    '**/__mocks__/**',
    '**/fixtures/**'
  ]
})
```

## 与其他工具集成

### Rollup

DtsGenerator 已集成到 RollupAdapter 中，会在构建时自动调用。

### Vite

可以作为 Vite 插件使用（需要额外配置）。

### TypeScript Project References

支持 TypeScript 项目引用，会自动处理依赖关系。

## API 参考

### createDtsGenerator(options)

创建 DTS 生成器实例。

**参数：**
- `options: DtsGeneratorOptions` - 生成器选项

**返回：**
- `DtsGenerator` - 生成器实例

### generateDts(options)

快捷生成函数。

**参数：**
- `options: DtsGeneratorOptions` - 生成器选项

**返回：**
- `Promise<DtsGenerationResult>` - 生成结果

### DtsGenerator.generate()

执行声明文件生成。

**返回：**
- `Promise<DtsGenerationResult>` - 包含生成的文件列表、错误和警告

### DtsGenerator.clean()

清理输出目录。

**返回：**
- `Promise<void>`

## 更新日志

### v1.0.0 (2024-01-XX)

- ✨ 新增独立的 DtsGenerator 类
- ✨ 支持 `dts` 作为独立输出格式
- ✨ 支持 es/lib 多目录输出
- ✨ 保持源码目录结构
- ✨ 自动过滤常见类型错误
- 🐛 修复 TypeScript 版本兼容性问题
- 🐛 修复 tsconfig 配置依赖问题

## 相关链接

- [TypeScript Compiler API 文档](https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API)
- [Builder 配置指南](./CONFIGURATION.md)
- [输出格式说明](./OUTPUT_FORMATS.md)


