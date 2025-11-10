# 输出配置

输出配置定义了构建产物的格式、目录和其他输出选项。

## output.formats

**类型**: `OutputFormat[]`  
**默认值**: `['esm', 'cjs']`

```typescript
type OutputFormat = 'esm' | 'cjs' | 'umd' | 'iife'
```

指定输出格式。

### ESM (ES Module)

```typescript
export default defineConfig({
  output: {
    formats: ['esm']
  }
})
```

**用途**: 现代浏览器、Node.js 12+  
**特点**: 支持 Tree-shaking、静态分析

### CJS (CommonJS)

```typescript
export default defineConfig({
  output: {
    formats: ['cjs']
  }
})
```

**用途**: Node.js、老版本工具  
**特点**: 广泛兼容、动态加载

### UMD (Universal Module Definition)

```typescript
export default defineConfig({
  output: {
    formats: ['umd'],
    name: 'MyLibrary' // UMD 需要库名
  }
})
```

**用途**: 浏览器直接使用（CDN）  
**特点**: 兼容多种模块系统

### IIFE (Immediately Invoked Function Expression)

```typescript
export default defineConfig({
  output: {
    formats: ['iife'],
    name: 'MyLibrary'
  }
})
```

**用途**: 浏览器直接使用（script 标签）  
**特点**: 无依赖、自执行

### 多格式输出

```typescript
export default defineConfig({
  output: {
    formats: ['esm', 'cjs', 'umd']
  }
})
```

## output.dir

**类型**: `string | Record<OutputFormat, string>`  
**默认值**: `{ esm: 'es', cjs: 'lib', umd: 'dist' }`

输出目录。

### 统一目录

```typescript
export default defineConfig({
  output: {
    dir: 'dist'
  }
})
```

### 不同格式不同目录

```typescript
export default defineConfig({
  output: {
    dir: {
      esm: 'es',
      cjs: 'lib',
      umd: 'dist'
    }
  }
})
```

## output.filename

**类型**: `string | Record<OutputFormat, string>`  
**默认值**: `'[name].js'`

文件名模板。

### 支持的占位符

- `[name]` - 入口名称
- `[hash]` - 内容哈希
- `[format]` - 输出格式

### 示例

```typescript
export default defineConfig({
  output: {
    filename: '[name].[format].js'
  }
})

// 输出: index.esm.js, index.cjs.js
```

### 不同格式不同文件名

```typescript
export default defineConfig({
  output: {
    filename: {
      esm: '[name].mjs',
      cjs: '[name].cjs',
      umd: '[name].min.js'
    }
  }
})
```

## output.name

**类型**: `string`  
**默认值**: package.json 的 name（驼峰格式）

UMD/IIFE 格式的全局变量名。

```typescript
export default defineConfig({
  output: {
    formats: ['umd'],
    name: 'MyLibrary'
  }
})
```

使用：

```html
<script src="dist/my-library.js"></script>
<script>
  console.log(window.MyLibrary)
</script>
```

## output.exports

**类型**: `'auto' | 'named' | 'default' | 'none'`  
**默认值**: `'auto'`

导出模式。

### auto（推荐）

```typescript
export default defineConfig({
  output: {
    exports: 'auto'
  }
})
```

自动检测并选择最佳模式。

### named

```typescript
export default defineConfig({
  output: {
    exports: 'named'
  }
})
```

仅命名导出：

```typescript
// 源代码
export const foo = 1
export const bar = 2

// 使用
import { foo, bar } from 'my-lib'
```

### default

```typescript
export default defineConfig({
  output: {
    exports: 'default'
  }
})
```

仅默认导出：

```typescript
// 源代码
export default { foo: 1, bar: 2 }

// 使用
import lib from 'my-lib'
```

## output.globals

**类型**: `Record<string, string>`  
**默认值**: `{}`

UMD 格式的全局变量映射。

```typescript
export default defineConfig({
  output: {
    formats: ['umd'],
    globals: {
      vue: 'Vue',
      react: 'React',
      'react-dom': 'ReactDOM'
    }
  }
})
```

## output.sourcemap

**类型**: `boolean | 'inline' | 'hidden'`  
**默认值**: `true`

是否生成 sourcemap。

### 启用

```typescript
export default defineConfig({
  output: {
    sourcemap: true
  }
})
```

### 内联

```typescript
export default defineConfig({
  output: {
    sourcemap: 'inline'
  }
})
```

### 隐藏

```typescript
export default defineConfig({
  output: {
    sourcemap: 'hidden' // 生成但不关联
  }
})
```

## output.banner / footer

**类型**: `string`  
**默认值**: `''`

在输出文件顶部/底部添加注释。

```typescript
export default defineConfig({
  output: {
    banner: `/**
 * My Library v${version}
 * (c) 2024 Author Name
 * @license MIT
 */`,
    footer: '/* Build Date: ' + new Date().toISOString() + ' */'
  }
})
```

## output.clean

**类型**: `boolean`  
**默认值**: `true`

构建前是否清理输出目录。

```typescript
export default defineConfig({
  output: {
    clean: true
  }
})
```

## output.preserveModules

**类型**: `boolean`  
**默认值**: `false`

是否保留模块结构。

### 禁用（默认）

```
dist/
  └── index.js  # 所有代码打包到一起
```

### 启用

```
dist/
  ├── index.js
  ├── utils.js
  ├── components/
  │   ├── Button.js
  │   └── Input.js
  └── ...
```

```typescript
export default defineConfig({
  output: {
    preserveModules: true
  }
})
```

**适用场景**: 组件库、需要按需加载

## 完整示例

```typescript
import { defineConfig } from '@ldesign/builder'
import pkg from './package.json'

export default defineConfig({
  output: {
    // 输出格式
    formats: ['esm', 'cjs', 'umd'],
    
    // 输出目录
    dir: {
      esm: 'es',
      cjs: 'lib',
      umd: 'dist'
    },
    
    // 文件名
    filename: {
      esm: '[name].mjs',
      cjs: '[name].cjs',
      umd: '[name].min.js'
    },
    
    // UMD 全局变量名
    name: 'MyLibrary',
    
    // 导出模式
    exports: 'named',
    
    // 全局变量映射
    globals: {
      vue: 'Vue',
      react: 'React'
    },
    
    // 生成 sourcemap
    sourcemap: true,
    
    // Banner
    banner: `/**
 * ${pkg.name} v${pkg.version}
 * (c) 2024 ${pkg.author}
 * @license ${pkg.license}
 */`,
    
    // 清理输出目录
    clean: true,
    
    // 保留模块结构
    preserveModules: false
  }
})
```

## 常见场景

### 组件库

```typescript
export default defineConfig({
  output: {
    formats: ['esm', 'cjs'],
    dir: {
      esm: 'es',
      cjs: 'lib'
    },
    preserveModules: true, // 支持按需加载
    sourcemap: true
  }
})
```

### CDN 库

```typescript
export default defineConfig({
  output: {
    formats: ['umd'],
    dir: 'dist',
    name: 'MyLibrary',
    filename: '[name].min.js',
    sourcemap: false,
    globals: {
      vue: 'Vue'
    }
  }
})
```

### Node.js 库

```typescript
export default defineConfig({
  output: {
    formats: ['cjs'],
    dir: 'lib',
    sourcemap: false
  }
})
```

### 现代化库

```typescript
export default defineConfig({
  output: {
    formats: ['esm'],
    dir: 'dist',
    filename: '[name].mjs',
    sourcemap: true
  }
})
```

## package.json 配置

配合 package.json 使用：

```json
{
  "name": "my-library",
  "version": "1.0.0",
  "main": "./lib/index.js",
  "module": "./es/index.js",
  "types": "./es/index.d.ts",
  "unpkg": "./dist/index.min.js",
  "jsdelivr": "./dist/index.min.js",
  "exports": {
    ".": {
      "types": "./es/index.d.ts",
      "import": "./es/index.js",
      "require": "./lib/index.js"
    }
  },
  "files": ["es", "lib", "dist"]
}
```

## 最佳实践

### 1. 合理选择格式

```typescript
// 现代项目
formats: ['esm']

// 兼容性项目
formats: ['esm', 'cjs']

// 需要 CDN
formats: ['esm', 'cjs', 'umd']
```

### 2. 使用标准目录

```typescript
dir: {
  esm: 'es',      // 标准
  cjs: 'lib',     // 标准
  umd: 'dist'     // 标准
}
```

### 3. 生成 sourcemap

```typescript
// 开发
sourcemap: true

// 生产（可选）
sourcemap: process.env.NODE_ENV === 'development'
```

### 4. 添加 Banner

```typescript
banner: `/**
 * ${pkg.name} v${pkg.version}
 * @license ${pkg.license}
 */`
```

## 下一步

- 🔧 [打包器配置](/config/bundler) - 配置打包引擎
- 🎨 [优化配置](/config/optimization) - 性能优化
- 📖 [配置概览](/config/overview) - 查看所有配置
