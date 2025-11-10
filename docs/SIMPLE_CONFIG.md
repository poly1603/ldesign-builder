# 简化配置指南

## 为什么需要简化配置?

传统的构建工具配置往往非常复杂,需要配置几十甚至上百个选项。`@ldesign/builder` 的简化配置系统让你只需要配置 **5-10 个核心选项**,其他选项使用智能默认值。

## 配置对比

### 传统配置 (100+ 行)

```typescript
export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: ['esm', 'cjs', 'umd'],
    sourcemap: true,
    esm: {
      dir: 'es',
      format: 'esm',
      preserveStructure: true,
      dts: true
    },
    cjs: {
      dir: 'lib',
      format: 'cjs',
      preserveStructure: true,
      dts: true
    },
    umd: {
      dir: 'dist',
      format: 'umd',
      minify: true,
      sourcemap: true
    }
  },
  libraryType: 'react',
  external: ['react', 'react-dom'],
  globals: {
    react: 'React',
    'react-dom': 'ReactDOM'
  },
  typescript: {
    declaration: true,
    declarationDir: 'dist/types',
    target: 'ES2020',
    module: 'ESNext'
  },
  performance: {
    treeshaking: true,
    minify: true
  },
  // ... 还有几十个配置项
}
```

### 简化配置 (5 行)

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  preset: 'react',
  name: 'MyLibrary'
})
```

**效果完全相同!** 🎉

## 核心概念

### 1. 预设 (Presets)

预设是预先配置好的配置模板,包含了特定类型项目的最佳实践配置。

```typescript
defineConfig({
  preset: 'react' // 使用 React 预设
})
```

### 2. 智能默认值

未配置的选项会使用智能默认值:

- **入口文件**: 自动检测 `src/index.ts`
- **输出目录**: `dist`
- **输出格式**: 根据项目类型自动推断
- **外部依赖**: 自动检测 `package.json` 的依赖
- **类型声明**: 自动生成
- **Sourcemap**: 自动生成

### 3. 自动检测

即使不提供配置文件,也能自动检测项目类型并使用最佳配置:

```bash
# 零配置构建
npx @ldesign/builder build
```

## 可用预设

| 预设 | 描述 | 输出格式 | 适用场景 |
|------|------|---------|---------|
| `typescript` | TypeScript 库 | ESM + CJS | 通用 TS 库 |
| `react` | React 组件库 | ESM + CJS + UMD | React 组件 |
| `vue3` | Vue 3 组件库 | ESM + CJS + UMD | Vue 3 组件 |
| `vue2` | Vue 2 组件库 | ESM + CJS + UMD | Vue 2 组件 |
| `svelte` | Svelte 组件库 | ESM + CJS | Svelte 组件 |
| `solid` | Solid.js 组件库 | ESM + CJS | Solid 组件 |
| `preact` | Preact 组件库 | ESM + CJS + UMD | Preact 组件 |
| `lit` | Lit Web Components | ESM + CJS | Web Components |
| `angular` | Angular 库 | ESM + CJS | Angular 库 |
| `qwik` | Qwik 组件库 | ESM | Qwik 组件 |
| `style` | 样式库 | ESM | CSS/Less/Sass |
| `mixed` | 混合库 | ESM + CJS | TS + 样式 |
| `node` | Node.js 库 | ESM + CJS | Node.js 库 |
| `cli` | CLI 工具 | CJS | 命令行工具 |

## 配置选项

### 核心选项 (必需)

#### preset

使用预设配置。

```typescript
preset: 'react' | 'vue3' | 'typescript' | ...
```

### 常用选项 (可选)

#### input

入口文件。

```typescript
// 单入口
input: 'src/index.ts'

// 多入口
input: ['src/index.ts', 'src/utils.ts']

// 命名入口
input: {
  main: 'src/index.ts',
  utils: 'src/utils.ts'
}
```

**默认值**: `'src/index.ts'` (自动检测)

#### outDir

输出目录。

```typescript
outDir: 'dist'
```

**默认值**: `'dist'`

#### formats

输出格式。

```typescript
formats: ['esm', 'cjs', 'umd', 'iife']
```

**默认值**: 根据预设自动配置

#### external

外部依赖。

```typescript
external: ['react', 'react-dom']
```

**默认值**: 自动检测 `package.json`

#### name

UMD 模块名称。

```typescript
name: 'MyLibrary'
```

**默认值**: 从 `package.json` 的 `name` 字段推断

#### dts

是否生成类型声明。

```typescript
dts: true | false
```

**默认值**: `true`

#### sourcemap

是否生成 sourcemap。

```typescript
sourcemap: true | false
```

**默认值**: `true`

#### minify

是否压缩代码。

```typescript
minify: true | false
```

**默认值**: `true` (生产模式)

#### mode

构建模式。

```typescript
mode: 'development' | 'production'
```

**默认值**: `'production'`

#### clean

是否清理输出目录。

```typescript
clean: true | false
```

**默认值**: `true`

#### globals

全局变量映射 (UMD)。

```typescript
globals: {
  react: 'React',
  'react-dom': 'ReactDOM'
}
```

**默认值**: 自动推断常见库

## 使用示例

### React 组件库

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  preset: 'react',
  name: 'MyReactLibrary'
})
```

### Vue 3 组件库

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  preset: 'vue3',
  name: 'MyVueLibrary'
})
```

### TypeScript 工具库

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  preset: 'typescript',
  input: 'src/index.ts',
  formats: ['esm', 'cjs']
})
```

### CLI 工具

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  preset: 'cli',
  input: 'src/cli.ts',
  outDir: 'bin',
  dts: false
})
```

### 多入口库

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  preset: 'typescript',
  input: {
    main: 'src/index.ts',
    utils: 'src/utils.ts',
    helpers: 'src/helpers.ts'
  }
})
```

## 高级用法

### 覆盖预设配置

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  preset: 'react',
  // 覆盖预设的输出格式
  formats: ['esm', 'cjs'], // 不输出 UMD
  // 覆盖预设的压缩配置
  minify: false
})
```

### 混合使用

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  preset: 'react',
  input: 'src/index.ts',
  outDir: 'dist',
  formats: ['esm', 'cjs', 'umd'],
  external: ['react', 'react-dom', 'lodash'],
  name: 'MyLibrary',
  minify: true
})
```

## 迁移指南

### 从完整配置迁移

如果你已经有完整配置,可以逐步迁移到简化配置:

**步骤 1**: 识别项目类型,选择合适的预设

```typescript
// 之前
export default {
  libraryType: 'react',
  // ... 100+ 行配置
}

// 之后
export default defineConfig({
  preset: 'react'
})
```

**步骤 2**: 保留必要的自定义配置

```typescript
export default defineConfig({
  preset: 'react',
  name: 'MyCustomName', // 保留自定义名称
  external: ['react', 'react-dom', 'custom-lib'] // 保留自定义外部依赖
})
```

**步骤 3**: 删除冗余配置

删除所有可以由预设或自动检测提供的配置。

## 最佳实践

1. **优先使用预设** - 预设包含了最佳实践配置
2. **只配置必要选项** - 让自动检测处理其他选项
3. **使用语义化命名** - 为 UMD 模块使用清晰的名称
4. **合理设置外部依赖** - 避免打包不必要的依赖
5. **开发时关闭压缩** - 提高构建速度

## 常见问题

### Q: 如何查看完整的配置?

A: 使用 `--verbose` 标志:

```bash
npx @ldesign/builder build --verbose
```

### Q: 如何禁用自动检测?

A: 在完整配置中设置:

```typescript
import type { BuilderConfig } from '@ldesign/builder'

const config: BuilderConfig = {
  // 使用完整配置,禁用自动检测
}

export default config
```

### Q: 预设不满足需求怎么办?

A: 可以覆盖预设的任何配置:

```typescript
defineConfig({
  preset: 'react',
  // 覆盖任何配置
  formats: ['esm'], // 只输出 ESM
  minify: false     // 不压缩
})
```

### Q: 如何创建自定义预设?

A: 使用 `applyPreset` 函数:

```typescript
import { applyPreset } from '@ldesign/builder'

const myPreset = applyPreset('react', {
  // 自定义配置
  minify: false,
  formats: ['esm']
})

export default myPreset
```

## 总结

简化配置让你:

- ✅ **配置减少 90%** - 从 100+ 行减少到 5-10 行
- ✅ **开箱即用** - 预设包含最佳实践
- ✅ **智能默认** - 自动检测和推断
- ✅ **灵活覆盖** - 可以覆盖任何配置
- ✅ **零配置** - 甚至可以不提供配置文件

开始使用简化配置,让构建更简单! 🚀

