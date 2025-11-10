# @ldesign/builder 示例项目

这个目录包含了使用 `@ldesign/builder` 构建各种前端框架组件库的完整示例。

## 📦 示例列表

| 框架 | 目录 | 说明 |
|------|------|------|
| React | [react-lib](./react-lib) | React 18 组件库示例 |
| Vue 3 | [vue3-lib](./vue3-lib) | Vue 3 Composition API 组件库示例 |
| Vue 2 | [vue2-lib](./vue2-lib) | Vue 2.7 组件库示例 |
| Svelte | [svelte-lib](./svelte-lib) | Svelte 4 组件库示例 |
| Solid | [solid-lib](./solid-lib) | Solid.js 组件库示例 |
| Preact | [preact-lib](./preact-lib) | Preact 10 组件库示例 |
| Lit | [lit-lib](./lit-lib) | Lit 3 Web Components 组件库示例 |
| Qwik | [qwik-lib](./qwik-lib) | Qwik 组件库示例 |

## ✨ 共同特性

所有示例项目都包含以下特性：

### 1. 多格式输出

- **ESM** (ES Modules) - 现代 JavaScript 模块格式
  - 输出目录：`es/`
  - 支持 tree-shaking
  - 保留目录结构
  - 包含类型声明文件

- **CJS** (CommonJS) - Node.js 兼容格式
  - 输出目录：`lib/`
  - 兼容 Node.js 环境
  - 保留目录结构
  - 包含类型声明文件

- **UMD** (Universal Module Definition) - 通用模块格式
  - 输出目录：`dist/`
  - 可在浏览器中直接使用
  - 单文件打包
  - 已压缩和优化

### 2. TypeScript 支持

- 完整的 TypeScript 类型定义
- 自动生成 `.d.ts` 类型声明文件
- 严格的类型检查

### 3. 样式处理

- Less 预处理器支持
- 自动提取 CSS 文件
- CSS 压缩和优化
- 支持 CSS Modules（可选）

### 4. 开发体验

- Source Map 支持
- 监听模式（watch mode）
- 快速构建
- 详细的构建日志

## 🚀 快速开始

### 安装依赖

在任何示例项目目录下运行：

```bash
npm install
```

### 构建项目

```bash
npm run build
```

构建完成后，会在项目根目录生成以下目录：

- `es/` - ESM 格式输出
- `lib/` - CJS 格式输出
- `dist/` - UMD 格式输出

### 监听模式

```bash
npm run build:watch
```

### 清理输出

```bash
npm run clean
```

## 📝 配置说明

每个示例项目都包含一个 `builder.config.ts` 配置文件，展示了如何配置 `@ldesign/builder`。

### 基本配置结构

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 库类型（自动检测框架）
  libraryType: 'react', // 'vue3' | 'vue2' | 'svelte' | 'solid' | 'preact' | 'lit' | 'qwik'
  
  // 入口文件
  input: 'src/index.ts',
  
  // 输出配置
  output: {
    // ESM 格式
    esm: {
      dir: 'es',
      format: 'esm',
      preserveStructure: true,
      dts: true,
      sourcemap: true
    },
    
    // CJS 格式
    cjs: {
      dir: 'lib',
      format: 'cjs',
      preserveStructure: true,
      dts: true,
      sourcemap: true
    },
    
    // UMD 格式
    umd: {
      dir: 'dist',
      format: 'umd',
      name: 'MyLibrary',
      minify: true,
      sourcemap: true,
      globals: {
        'react': 'React'
      }
    }
  },
  
  // 外部依赖
  external: ['react', 'react-dom'],
  
  // 全局变量映射
  globals: {
    'react': 'React',
    'react-dom': 'ReactDOM'
  },
  
  // TypeScript 配置
  typescript: {
    tsconfig: './tsconfig.json',
    target: 'es2020'
  },
  
  // 样式配置
  style: {
    preprocessor: 'less',
    extract: true,
    minimize: true
  },
  
  // 性能配置
  performance: {
    treeshaking: true,
    minify: true
  },
  
  // 生成类型声明文件
  dts: true,
  
  // 生成 sourcemap
  sourcemap: true,
  
  // 清理输出目录
  clean: true
})
```

## 🎯 使用场景

### 1. 组件库开发

所有示例都展示了如何构建可复用的组件库：

- 导出多个组件
- 提供 TypeScript 类型定义
- 支持按需引入
- 样式自动处理

### 2. 工具库开发

可以参考这些示例构建纯 TypeScript 工具库：

- 移除框架相关配置
- 设置 `libraryType: 'typescript'`
- 专注于逻辑代码

### 3. Monorepo 项目

这些示例可以作为 monorepo 中的子包：

- 使用 workspace 协议
- 共享构建配置
- 统一版本管理

## 📚 学习资源

### 文档

- [快速开始](../docs/guide/getting-started.md)
- [配置指南](../docs/config/README.md)
- [API 文档](../docs/api/README.md)

### 示例代码

每个示例项目都包含：

- 完整的项目结构
- 详细的 README 说明
- 可运行的构建配置
- 示例组件代码

## 🔧 故障排除

### 构建失败

1. 确保已安装所有依赖：
   ```bash
   npm install
   ```

2. 检查 Node.js 版本（需要 >= 16.0.0）：
   ```bash
   node --version
   ```

3. 清理缓存和输出目录：
   ```bash
   npm run clean
   rm -rf node_modules
   npm install
   ```

### 类型声明文件未生成

确保配置文件中启用了 `dts` 选项：

```typescript
export default defineConfig({
  dts: true,
  output: {
    esm: {
      dts: true
    }
  }
})
```

### 样式文件未提取

确保配置了样式提取：

```typescript
export default defineConfig({
  style: {
    extract: true,
    preprocessor: 'less'
  }
})
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这些示例！

## 📄 License

MIT

---

**提示**: 这些示例项目仅用于演示目的。在实际项目中，请根据具体需求调整配置。

