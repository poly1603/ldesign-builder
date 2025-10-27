# 迁移指南

> **从其他构建工具迁移到 @ldesign/builder**

---

## 📚 目录

1. [从 Rollup 迁移](#1-从-rollup-迁移)
2. [从 Webpack 迁移](#2-从-webpack-迁移)
3. [从 Vite 迁移](#3-从-vite-迁移)
4. [从 Parcel 迁移](#4-从-parcel-迁移)
5. [从 esbuild 迁移](#5-从-esbuild-迁移)

---

## 1. 从 Rollup 迁移

### 1.1 配置对比

**Rollup 配置：**
```javascript
// rollup.config.js
export default {
  input: 'src/index.ts',
  output: [
    { file: 'dist/index.js', format: 'esm' },
    { file: 'dist/index.cjs', format: 'cjs' }
  ],
  external: ['vue', 'react'],
  plugins: [
    typescript(),
    commonjs(),
    resolve()
  ]
}
```

**@ldesign/builder 配置：**
```typescript
// ldesign.config.ts
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: ['esm', 'cjs']  // 自动生成 index.js 和 index.cjs
  },
  external: ['vue', 'react']
  // 插件自动加载，无需手动配置
})
```

### 1.2 插件迁移

**Rollup 插件 → @ldesign/builder：**

| Rollup 插件 | @ldesign/builder | 说明 |
|------------|------------------|------|
| `@rollup/plugin-typescript` | 内置 | 自动检测并配置 |
| `@rollup/plugin-commonjs` | 内置 | 自动处理 |
| `@rollup/plugin-node-resolve` | 内置 | 自动处理 |
| `rollup-plugin-vue` | 内置 | 检测到 Vue 自动启用 |
| `@rollup/plugin-terser` | `minify: true` | 配置项启用 |
| `rollup-plugin-postcss` | 内置 | 自动处理 CSS |

**迁移步骤：**
1. 移除内置功能的插件
2. 保留自定义插件
3. 调整配置格式

### 1.3 迁移示例

**迁移前（Rollup）：**
```javascript
import typescript from '@rollup/plugin-typescript'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import vue from 'rollup-plugin-vue'

export default {
  input: 'src/index.ts',
  output: [
    { file: 'dist/index.esm.js', format: 'esm' },
    { file: 'dist/index.cjs.js', format: 'cjs' }
  ],
  external: ['vue'],
  plugins: [
    vue(),
    typescript({ declaration: true }),
    commonjs(),
    resolve(),
    terser()
  ]
}
```

**迁移后（@ldesign/builder）：**
```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: ['esm', 'cjs']
  },
  external: ['vue'],
  minify: true,
  dts: true
  // 就这么简单！其他都自动处理
})
```

---

## 2. 从 Webpack 迁移

### 2.1 配置对比

**Webpack 配置：**
```javascript
// webpack.config.js
module.exports = {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    library: {
      name: 'MyLibrary',
      type: 'umd'
    }
  },
  externals: {
    vue: 'vue',
    react: 'react'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
}
```

**@ldesign/builder 配置：**
```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: ['umd'],
    name: 'MyLibrary'
  },
  external: ['vue', 'react']
  // CSS 和 TypeScript 自动处理
})
```

### 2.2 Loader → 自动处理

| Webpack Loader | @ldesign/builder |
|----------------|------------------|
| `ts-loader` | 内置 TypeScript 支持 |
| `babel-loader` | 内置 Babel 支持 |
| `css-loader` | 内置 CSS 处理 |
| `sass-loader` | 内置 SASS 处理 |
| `vue-loader` | 内置 Vue 处理 |

### 2.3 Plugin 迁移

**常用 Webpack 插件的替代方案：**

| Webpack Plugin | @ldesign/builder |
|----------------|------------------|
| `HtmlWebpackPlugin` | 不需要（库构建） |
| `MiniCssExtractPlugin` | `output.extractCSS: true` |
| `TerserPlugin` | `minify: true` |
| `DefinePlugin` | `define: {}` 配置 |

---

## 3. 从 Vite 迁移

### 3.1 概念映射

| Vite 概念 | @ldesign/builder |
|-----------|------------------|
| `vite.config.ts` | `ldesign.config.ts` |
| `build.lib` | 默认模式 |
| `build.rollupOptions` | 直接使用根级配置 |

### 3.2 配置迁移

**Vite 配置：**
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['vue']
    }
  }
})
```

**@ldesign/builder 配置：**
```typescript
// ldesign.config.ts
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  output: {
    format: ['esm', 'cjs']
  },
  external: ['vue']
  // Vue 插件自动加载
})
```

---

## 4. 从 Parcel 迁移

### 4.1 零配置到零配置

Parcel 和 @ldesign/builder 都支持零配置，迁移很简单！

**Parcel：**
```bash
parcel build src/index.ts
```

**@ldesign/builder：**
```bash
ldesign-builder build
```

### 4.2 配置文件迁移

**Parcel 配置（.parcelrc）：**
```json
{
  "extends": "@parcel/config-default",
  "transformers": {
    "*.ts": ["@parcel/transformer-typescript-types"]
  }
}
```

**@ldesign/builder 配置：**
```typescript
export default defineConfig({
  input: 'src/index.ts',
  dts: true  // 生成 TypeScript 声明文件
})
```

---

## 5. 从 esbuild 迁移

### 5.1 配置对比

**esbuild 配置：**
```javascript
require('esbuild').build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/index.js',
  format: 'esm',
  minify: true,
  sourcemap: true
})
```

**@ldesign/builder 配置：**
```typescript
export default defineConfig({
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'esm'
  },
  bundler: 'esbuild',  // 使用 esbuild 作为打包器
  minify: true,
  sourcemap: true
})
```

### 5.2 保持 esbuild 的速度

```typescript
export default defineConfig({
  bundler: 'esbuild',  // 使用 esbuild（10-100x 速度）
  // 其他配置...
})
```

---

## 🎯 迁移检查清单

### 准备阶段
- [ ] ✅ 备份现有配置
- [ ] ✅ 记录当前构建产物
- [ ] ✅ 记录构建时间和体积

### 迁移阶段
- [ ] ✅ 安装 @ldesign/builder
- [ ] ✅ 创建 ldesign.config.ts
- [ ] ✅ 迁移基础配置
- [ ] ✅ 迁移插件配置
- [ ] ✅ 更新 package.json scripts

### 验证阶段
- [ ] ✅ 运行构建，检查产物
- [ ] ✅ 对比构建产物（文件数量、大小）
- [ ] ✅ 运行测试，确保功能正常
- [ ] ✅ 检查类型定义是否正确

### 优化阶段
- [ ] ✅ 启用缓存提升速度
- [ ] ✅ 启用并行构建
- [ ] ✅ 优化外部依赖配置
- [ ] ✅ 启用 tree-shaking

---

## 🚀 迁移后的优势

### 性能提升
- **构建速度**：提升 20-50%（使用缓存后提升 5-10x）
- **内存占用**：降低 20-30%
- **开发体验**：更快的热更新

### 功能增强
- ✅ 自动检测项目类型
- ✅ 零配置支持
- ✅ 多打包器支持
- ✅ 更好的错误提示
- ✅ 完整的中文文档

### 维护成本
- ✅ 配置更简单（减少 60-90% 配置代码）
- ✅ 依赖更少
- ✅ 更新更简单

---

## 💡 迁移技巧

### 技巧1：渐进式迁移

```typescript
// 第一步：最小配置
export default defineConfig({
  input: 'src/index.ts'
})

// 第二步：添加输出配置
export default defineConfig({
  input: 'src/index.ts',
  output: {
    format: ['esm', 'cjs']
  }
})

// 第三步：添加优化选项
export default defineConfig({
  input: 'src/index.ts',
  output: {
    format: ['esm', 'cjs']
  },
  minify: true,
  treeshake: true
})
```

### 技巧2：保留原有工具链

```typescript
// 可以继续使用原有的 Rollup 插件
import myRollupPlugin from 'rollup-plugin-xxx'

export default defineConfig({
  plugins: [
    // 包装 Rollup 插件
    {
      name: 'rollup-plugin-wrapper',
      apply(config) {
        return {
          ...config,
          rollupOptions: {
            plugins: [myRollupPlugin()]
          }
        }
      }
    }
  ]
})
```

---

## 📞 需要帮助？

如果在迁移过程中遇到问题：

1. 📖 查看[完整文档](https://ldesign.dev/builder)
2. 💬 在 [Discussions](https://github.com/ldesign/builder/discussions) 提问
3. 🐛 提交 [Issue](https://github.com/ldesign/builder/issues)
4. 📧 发邮件到：migration-help@ldesign.dev

---

**祝迁移顺利！** 🎉

