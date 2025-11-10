# 打包引擎

@ldesign/builder 支持 4 种打包引擎，每种都有其独特的优势。本文将帮助你选择最适合的引擎。

## 支持的引擎

| 引擎 | 语言 | 速度 | 输出质量 | 生态 | 推荐场景 |
|------|------|------|---------|------|----------|
| **esbuild** | Go | ⚡⚡⚡⚡⚡ | ⭐⭐⭐ | ⭐⭐⭐ | 开发环境 |
| **swc** | Rust | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ | ⭐⭐⭐ | 快速生产构建 |
| **rollup** | JS | ⚡⚡ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 生产环境 |
| **rolldown** | Rust | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ | ⭐⭐ | 现代化项目 |

## esbuild

### 特点

- 🚀 **极速** - 10-100x 更快
- 📦 **内置** - 无需额外配置
- 🎯 **简单** - API 简洁

### 优势

```bash
# 速度对比
Rollup:   ████████████████████ 20s
esbuild:  █ 0.2s  ⚡ 100x 更快
```

**适合**：
- 开发环境，需要快速反馈
- 快速原型验证
- 简单项目，不需要复杂优化

### 劣势

- ❌ Tree-shaking 不够完美
- ❌ 输出体积较大（~10-20%）
- ❌ 插件生态相对较小
- ❌ 不支持某些高级特性

### 使用

```bash
# 构建
ldesign-builder build --bundler esbuild

# 监听（推荐用于开发）
ldesign-builder watch --bundler esbuild
```

### 配置

```typescript
export default defineConfig({
  bundler: 'esbuild',
  esbuild: {
    // 目标平台
    platform: 'browser', // 'browser' | 'node'
    
    // 目标环境
    target: 'es2020',
    
    // 压缩选项
    minify: true,
    
    // 保留名称
    keepNames: true,
    
    // JSX
    jsx: 'automatic',
    
    // 定义全局变量
    define: {
      __VERSION__: '"1.0.0"'
    }
  }
})
```

### 性能数据

| 项目规模 | Rollup | esbuild | 提速 |
|---------|--------|---------|------|
| 小型（<100 模块） | 5s | 0.1s | 50x |
| 中型（100-500） | 15s | 0.3s | 50x |
| 大型（>500） | 30s | 0.5s | 60x |

## swc

### 特点

- ⚡ **快速** - 20x 更快
- 🎯 **平衡** - 速度和体积兼顾
- 🔧 **强大** - 支持更多特性

### 优势

**速度 vs 体积**：
```
速度:  Rollup < swc <<< esbuild
体积:  Rollup ≈ swc < esbuild
      
swc 是最佳平衡点！
```

**适合**：
- 生产环境，追求速度
- 需要较好的 Tree-shaking
- TypeScript 项目
- 现代 JavaScript 特性

### 使用

```bash
# 构建
ldesign-builder build --bundler swc

# 生产构建（推荐）
ldesign-builder build --bundler swc --mode production
```

### 配置

```typescript
export default defineConfig({
  bundler: 'swc',
  swc: {
    // JIT 编译
    jsc: {
      parser: {
        syntax: 'typescript',
        tsx: true,
        decorators: true
      },
      transform: {
        react: {
          runtime: 'automatic'
        }
      },
      target: 'es2020',
      minify: {
        compress: true,
        mangle: true
      }
    },
    
    // 模块配置
    module: {
      type: 'es6'
    }
  }
})
```

### 性能数据

| 指标 | Rollup | swc | esbuild |
|------|--------|-----|---------|
| 构建速度 | 30s | 1.5s | 0.5s |
| 输出体积 | 100KB | 105KB | 120KB |
| Tree-shaking | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

## Rollup

### 特点

- 🎯 **最优化** - 最小的输出体积
- 🔧 **成熟** - 丰富的插件生态
- 📦 **标准** - 业界标准

### 优势

**最佳输出质量**：
```typescript
// Tree-shaking 示例
// 源代码
export function used() { }
export function unused() { }

// Rollup 输出 - 完美
export function used() { }

// esbuild 输出 - 可能保留
export function used() { }
export function unused() { } // 未使用但保留
```

**适合**：
- 生产环境，追求最优体积
- 开源库，需要最佳质量
- 复杂项目，需要高级特性
- 需要丰富的插件支持

### 使用

```bash
# 生产构建（默认）
ldesign-builder build

# 指定 Rollup
ldesign-builder build --bundler rollup
```

### 配置

```typescript
export default defineConfig({
  bundler: 'rollup',
  rollup: {
    // Tree-shaking
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false
    },
    
    // 保留模块结构
    preserveModules: true,
    
    // 外部依赖
    external: ['vue', 'react'],
    
    // 输出配置
    output: {
      // 导出模式
      exports: 'named',
      
      // 是否压缩
      compact: true,
      
      // Banner
      banner: '/* My Library */',
      
      // 全局变量
      globals: {
        vue: 'Vue',
        react: 'React'
      }
    }
  }
})
```

### 性能数据

| 指标 | 值 |
|------|---|
| 构建速度 | 基准（1x） |
| 输出体积 | 最小（基准） |
| Tree-shaking | 完美 |
| 插件数量 | 1000+ |

## Rolldown

### 特点

- 🚀 **快速** - Rust 实现的 Rollup
- 🔄 **兼容** - 兼容 Rollup API
- 🆕 **现代** - 现代化设计

### 优势

**结合两者优势**：
```
速度: Rollup < Rolldown < esbuild
质量: esbuild < Rolldown ≈ Rollup
兼容: 完全兼容 Rollup 插件
```

**适合**：
- 追求性能的现代项目
- 需要 Rollup 质量 + 速度
- Vite 项目（未来默认）

### 使用

```bash
# 构建
ldesign-builder build --bundler rolldown
```

::: warning 注意
Rolldown 还在快速发展中，API 可能会变化。
建议用于新项目或实验性项目。
:::

### 配置

```typescript
export default defineConfig({
  bundler: 'rolldown',
  rolldown: {
    // 大部分配置与 Rollup 相同
    treeshake: true,
    external: ['vue'],
    
    // Rolldown 特有配置
    experimental: {
      // 实验性特性
      topLevelAwait: true
    }
  }
})
```

## 引擎选择指南

### 决策树

```
开始
  ↓
是否开发环境？
  ├─ 是 → esbuild ⚡
  └─ 否 → 继续
       ↓
    是否追求极致体积？
      ├─ 是 → Rollup 📦
      └─ 否 → 继续
           ↓
        需要快速构建？
          ├─ 是 → swc ⚡
          └─ 否 → Rolldown 🚀
```

### 场景推荐

#### 开发环境

```typescript
{
  bundler: 'esbuild',
  mode: 'development'
}
```

**原因**：
- ⚡ 毫秒级热更新
- 快速反馈循环
- 无需完美优化

#### 生产环境 - 开源库

```typescript
{
  bundler: 'rollup',
  mode: 'production'
}
```

**原因**：
- 📦 最小体积
- 🎯 完美 Tree-shaking
- 🔧 成熟生态

#### 生产环境 - 企业项目

```typescript
{
  bundler: 'swc',
  mode: 'production'
}
```

**原因**：
- ⚡ 20x 更快
- 📦 接近 Rollup 体积
- ⚖️ 最佳平衡

#### CI/CD 环境

```typescript
{
  bundler: 'swc', // 或 esbuild
  mode: 'production',
  optimization: {
    minify: true
  }
}
```

**原因**：
- ⏱️ 节省 CI 时间
- 💰 降低成本
- ✅ 足够的质量

## 混合使用

不同格式使用不同引擎：

```typescript
export default [
  // 开发版 - esbuild
  defineConfig({
    bundler: 'esbuild',
    output: {
      formats: ['esm']
    }
  }),
  
  // 生产版 - Rollup
  defineConfig({
    bundler: 'rollup',
    output: {
      formats: ['esm', 'cjs', 'umd']
    }
  })
]
```

## 性能对比总结

### 构建时间（1000 模块）

```
esbuild:  ████ 0.5s
swc:      ████████ 1.5s
rolldown: ████████████ 3s
rollup:   ████████████████████████████████ 30s
```

### 输出体积

```
rollup:   ████████████████████ 100KB
swc:      █████████████████████ 105KB
rolldown: █████████████████████ 105KB
esbuild:  ████████████████████████ 120KB
```

### Tree-shaking 质量

```
rollup:   ⭐⭐⭐⭐⭐ 100%
rolldown: ⭐⭐⭐⭐⭐ 95%
swc:      ⭐⭐⭐⭐ 85%
esbuild:  ⭐⭐⭐ 75%
```

## 最佳实践

### 1. 根据环境切换

```json
{
  "scripts": {
    "dev": "ldesign-builder watch --bundler esbuild",
    "build": "ldesign-builder build --bundler rollup",
    "build:fast": "ldesign-builder build --bundler swc"
  }
}
```

### 2. 验证输出

```bash
# 先用 esbuild 快速验证
ldesign-builder build --bundler esbuild

# 确认后用 Rollup 生产构建
ldesign-builder build --bundler rollup
```

### 3. 性能分析

```bash
# 分析各引擎性能
ldesign-builder analyze --bundler esbuild
ldesign-builder analyze --bundler swc
ldesign-builder analyze --bundler rollup
```

## 常见问题

### Q: 能否同时使用多个引擎？

A: 可以，使用多配置：

```typescript
export default [
  defineConfig({ bundler: 'esbuild' }),
  defineConfig({ bundler: 'rollup' })
]
```

### Q: 如何选择？

A: 看需求：
- **开发**: esbuild
- **质量**: Rollup
- **平衡**: swc
- **现代**: Rolldown

### Q: 能否动态切换？

A: 可以，通过环境变量：

```typescript
export default defineConfig({
  bundler: process.env.BUNDLER || 'rollup'
})
```

## 下一步

- 📖 [性能优化](/guide/performance) - 优化构建性能
- 🔧 [配置选项](/config/bundler) - 详细配置
- 📊 [构建分析](/guide/cli#analyze) - 分析构建结果
- 🛠️ [插件开发](/guide/plugin-dev) - 开发自定义插件
