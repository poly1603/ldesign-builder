# TDesign 风格构建示例

此示例展示如何使用 `@ldesign/builder` 生成与 TDesign Vue Next 完全一致的产物结构。

## 产物结构

使用此配置后,将自动生成以下产物:

```
your-library/
├── es/              # ES 模块 (.mjs + 编译后的 CSS)
│   ├── button/
│   │   ├── index.mjs
│   │   ├── button.mjs
│   │   └── style/
│   │       ├── css.mjs
│   │       └── index.css
│   └── input/
│       └── ...
├── esm/             # ESM 模块 (.js + less 源文件)
│   ├── button/
│   │   ├── index.js
│   │   ├── button.js
│   │   └── style/
│   │       ├── index.js
│   │       └── index.less
│   └── common/
│       └── style/
│           └── *.less
├── cjs/             # CJS 模块 (忽略样式)
│   ├── button/
│   │   ├── index.js
│   │   └── button.js
│   └── ...
└── dist/            # UMD 模块 (单个 CSS)
    ├── index.js
    ├── index.min.js
    ├── index.css
    └── index.min.css
```

## 配置说明

### 1. ES 模块 (推荐用于生产环境)

```typescript
output: {
  es: {
    dir: 'es'
  }
}
```

**特点:**
- 文件扩展名: `.mjs`
- 样式处理: 每个组件独立 CSS
- 样式路径转换: `import './style'` → `import './style/css.mjs'`
- 支持按需加载

**使用场景:**
- 生产环境构建
- 支持 Tree-shaking
- 按需加载组件和样式

### 2. ESM 模块 (推荐用于自定义主题)

```typescript
output: {
  esm: {
    dir: 'esm'
  }
}
```

**特点:**
- 文件扩展名: `.js`
- 样式处理: 保留 less 源文件
- 支持自定义主题

**使用场景:**
- 需要自定义主题
- 需要修改样式变量
- 开发环境

### 3. CJS 模块 (推荐用于 SSR)

```typescript
output: {
  cjs: {
    dir: 'cjs'
  }
}
```

**特点:**
- 文件扩展名: `.js`
- 样式处理: 完全忽略样式
- CommonJS 格式

**使用场景:**
- Node.js 环境
- SSR (服务端渲染)
- 不需要样式的场景

### 4. UMD 模块 (推荐用于浏览器直接引入)

```typescript
output: {
  umd: {
    dir: 'dist',
    name: 'MyLibrary'
  }
}
```

**特点:**
- 样式处理: 打包到单个 CSS
- 自动生成压缩版本
- 支持浏览器直接引入

**使用场景:**
- CDN 引入
- 浏览器直接使用
- 不使用构建工具的项目

## 使用方法

### 1. 安装依赖

```bash
pnpm add -D @ldesign/builder
```

### 2. 创建配置文件

```typescript
// builder.config.ts
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  output: {
    es: true,    // 使用默认配置
    esm: true,   // 使用默认配置
    cjs: true,   // 使用默认配置
    umd: { name: 'MyLibrary' }
  },
  external: ['vue']
})
```

### 3. 运行构建

```bash
pnpm ldesign-builder build
```

## 与 TDesign 的对比

| 特性 | TDesign | @ldesign/builder |
|------|---------|------------------|
| ES 产物 (.mjs) | ✅ | ✅ |
| ESM 产物 (.js) | ✅ | ✅ |
| CJS 产物 | ✅ | ✅ |
| UMD 产物 | ✅ | ✅ |
| 样式独立打包 | ✅ | ✅ |
| 保留 less 源文件 | ✅ | ✅ |
| 样式路径转换 | ✅ | ✅ |
| 自动生成压缩版本 | ✅ | ✅ |

## 优势

1. **配置简单** - 一行配置即可启用
2. **产物一致** - 与 TDesign 100% 一致
3. **自动优化** - 内部自动应用最佳实践
4. **向后兼容** - 不影响现有功能
5. **易于理解** - 配置直观,一看就懂

