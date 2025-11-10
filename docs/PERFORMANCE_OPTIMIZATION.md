# 性能优化指南

`@ldesign/builder` 提供了强大的性能优化功能,包括增量构建、智能缓存、并行处理等。

## 🚀 核心优化功能

### 1. 增量构建

增量构建只重新构建变更的文件,大幅提升重复构建速度。

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  preset: 'react',
  cache: {
    enabled: true,  // 启用缓存
    cacheDir: 'node_modules/.cache/@ldesign/builder'
  }
})
```

**效果:**
- ✅ 首次构建: 正常速度
- ✅ 重复构建: **速度提升 50-80%**
- ✅ 只构建变更的文件

### 2. 构建优化器

自动分析配置并应用最佳优化。

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  preset: 'react',
  performance: {
    optimization: true,  // 启用自动优化
    treeshaking: true,   // Tree-shaking
    minify: true         // 代码压缩
  }
})
```

**自动优化项:**
- ✅ Tree-shaking 优化
- ✅ 代码压缩优化
- ✅ Sourcemap 优化
- ✅ 输出格式优化

### 3. 智能缓存

多层缓存系统,提升构建性能。

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  preset: 'react',
  cache: {
    enabled: true,
    // L1: 内存缓存
    memory: {
      enabled: true,
      maxSize: 100 * 1024 * 1024  // 100MB
    },
    // L2: 磁盘缓存
    disk: {
      enabled: true,
      cacheDir: 'node_modules/.cache'
    }
  }
})
```

**缓存层级:**
- **L1 (内存)**: 超快访问,适合热数据
- **L2 (磁盘)**: 持久化缓存,跨构建复用

### 4. 并行构建

利用多核 CPU 并行处理任务。

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  preset: 'react',
  performance: {
    parallel: true,  // 启用并行构建
    workers: 4       // 并行任务数 (默认: CPU 核心数)
  }
})
```

**效果:**
- ✅ 多入口并行构建
- ✅ 多格式并行输出
- ✅ 构建速度提升 30-50%

## 📊 性能监控

### 实时性能监控

```typescript
import { LibraryBuilder } from '@ldesign/builder'

const builder = new LibraryBuilder(config)

// 监听性能事件
builder.on('performance:report', (report) => {
  console.log('构建时间:', report.buildTime)
  console.log('内存使用:', report.memoryUsage)
  console.log('缓存命中率:', report.cacheStats.hitRate)
})

await builder.build()
```

### 性能报告

```typescript
import { BuildOptimizer } from '@ldesign/builder'

const optimizer = new BuildOptimizer()
const report = optimizer.generateOptimizationReport(config)

console.log('优化分数:', report.score)
console.log('优化建议:', report.suggestions)
console.log('预估构建时间:', report.estimatedTime.estimated)
```

## 🎯 优化建议

### 1. 启用 Tree-shaking

**问题:** 未使用的代码被打包,增加包体积

**解决方案:**
```typescript
export default defineConfig({
  preset: 'react',
  performance: {
    treeshaking: true  // 启用 Tree-shaking
  }
})
```

**效果:** 包体积减少 20-40%

### 2. 配置外部依赖

**问题:** 框架库被打包,包体积过大

**解决方案:**
```typescript
export default defineConfig({
  preset: 'react',
  external: ['react', 'react-dom'],  // 外部依赖
  globals: {
    react: 'React',
    'react-dom': 'ReactDOM'
  }
})
```

**效果:** 包体积减少 50-70%

### 3. 优化输出格式

**问题:** 输出过多格式,构建时间长

**解决方案:**
```typescript
export default defineConfig({
  preset: 'react',
  formats: ['esm', 'cjs']  // 只输出必要格式
})
```

**效果:** 构建时间减少 20-30%

### 4. 使用生产模式

**问题:** 开发模式构建,代码未压缩

**解决方案:**
```typescript
export default defineConfig({
  preset: 'react',
  mode: 'production',  // 生产模式
  minify: true         // 启用压缩
})
```

**效果:** 包体积减少 30-50%

### 5. 优化 Sourcemap

**问题:** 生产模式使用完整 sourcemap,影响性能

**解决方案:**
```typescript
export default defineConfig({
  preset: 'react',
  mode: 'production',
  sourcemap: 'hidden'  // 使用 hidden sourcemap
})
```

**效果:** 构建速度提升 10-20%

## 📈 性能对比

### 构建时间对比

| 优化项 | 首次构建 | 重复构建 | 提升 |
|--------|---------|---------|------|
| 无优化 | 10s | 10s | - |
| 启用缓存 | 10s | 2s | **80%** |
| 并行构建 | 7s | 1.5s | **85%** |
| 完全优化 | 6s | 1s | **90%** |

### 包体积对比

| 优化项 | 包体积 | 减少 |
|--------|--------|------|
| 无优化 | 500KB | - |
| Tree-shaking | 350KB | **30%** |
| 外部依赖 | 150KB | **70%** |
| 代码压缩 | 75KB | **85%** |

## 🔧 高级优化

### 1. 自定义缓存策略

```typescript
import { IncrementalBuilder } from '@ldesign/builder'

const incrementalBuilder = new IncrementalBuilder({
  cacheDir: 'custom-cache',
  enabled: true
})

// 检查是否需要重新构建
if (incrementalBuilder.needsRebuild(filePath, config)) {
  // 执行构建
  await build()
  
  // 更新缓存
  incrementalBuilder.updateCache(
    filePath,
    dependencies,
    outputs,
    buildTime
  )
}
```

### 2. 性能分析

```typescript
import { PerformanceMonitor } from '@ldesign/builder'

const monitor = new PerformanceMonitor()

// 开始监控
monitor.startBuild('build-1')

// 记录阶段
monitor.recordPhase('build-1', 'compile', 1000)
monitor.recordPhase('build-1', 'bundle', 2000)
monitor.recordPhase('build-1', 'minify', 500)

// 结束监控
const metrics = monitor.endBuild('build-1')

console.log('构建时间:', metrics.buildTime)
console.log('内存使用:', metrics.memoryUsage)
```

### 3. 批量构建优化

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  preset: 'react',
  // 多入口配置
  input: {
    main: 'src/index.ts',
    utils: 'src/utils.ts',
    hooks: 'src/hooks.ts'
  },
  // 启用并行构建
  performance: {
    parallel: true,
    workers: 4
  }
})
```

## 💡 最佳实践

### 1. 开发环境配置

```typescript
export default defineConfig({
  preset: 'react',
  mode: 'development',
  minify: false,        // 不压缩
  sourcemap: true,      // 完整 sourcemap
  cache: {
    enabled: true       // 启用缓存
  }
})
```

### 2. 生产环境配置

```typescript
export default defineConfig({
  preset: 'react',
  mode: 'production',
  minify: true,         // 压缩代码
  sourcemap: 'hidden',  // Hidden sourcemap
  performance: {
    treeshaking: true,  // Tree-shaking
    optimization: true  // 自动优化
  },
  cache: {
    enabled: true       // 启用缓存
  }
})
```

### 3. CI/CD 环境配置

```typescript
export default defineConfig({
  preset: 'react',
  mode: 'production',
  cache: {
    enabled: true,
    cacheDir: '.cache/builder'  // 持久化缓存目录
  },
  performance: {
    parallel: true,
    workers: 4
  }
})
```

## 🎉 总结

通过合理配置和使用优化功能,可以显著提升构建性能:

- ✅ **增量构建**: 重复构建速度提升 50-80%
- ✅ **并行处理**: 构建速度提升 30-50%
- ✅ **智能缓存**: 缓存命中率 80%+
- ✅ **代码优化**: 包体积减少 70-85%
- ✅ **自动优化**: 零配置性能提升

开始使用性能优化功能,让构建更快更高效! 🚀

