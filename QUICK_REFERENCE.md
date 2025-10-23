# @ldesign/builder 快速参考

## 🚀 一行命令开始

```bash
npx ldesign-builder build
```

---

## 🎯 打包器选择

```typescript
// 开发: esbuild (极速)
{ bundler: 'esbuild', mode: 'development' }

// 生产: swc (快速+质量)
{ bundler: 'swc', mode: 'production' }

// 稳定: rollup (默认)
{ bundler: 'rollup' }

// 现代: rolldown
{ bundler: 'rolldown' }
```

---

## 📦 框架支持 (13个)

```
Vue 2/3 | React | Svelte | Solid | Angular
Lit | Preact | Qwik | Astro | Nuxt3 | Remix | SolidStart
```

---

## 🔌 核心 API

### 构建
```typescript
import { LibraryBuilder } from '@ldesign/builder'

const builder = new LibraryBuilder()
await builder.build(config)
```

### 错误处理
```typescript
import { createEnhancedErrorHandler } from '@ldesign/builder'

const handler = createEnhancedErrorHandler({ autoFix: true })
handler.handle(error)
```

### 缓存
```typescript
import { createMultilayerCache } from '@ldesign/builder'

const cache = createMultilayerCache()
await cache.set('key', data)
```

### 调试
```typescript
import { createBuildDebugger } from '@ldesign/builder'

const debugger = createBuildDebugger()
debugger.addBreakpoint({ phase: 'transform' })
```

### 性能分析
```typescript
import { createPerformanceProfiler } from '@ldesign/builder'

const profiler = createPerformanceProfiler()
const report = profiler.generateReport()
```

---

## 🎨 插件

### 官方插件

```typescript
import {
  imageOptimizerPlugin,
  svgOptimizerPlugin,
  i18nExtractorPlugin
} from '@ldesign/builder'

export default {
  plugins: [
    imageOptimizerPlugin({ quality: 80 }),
    svgOptimizerPlugin({ sprite: true }),
    i18nExtractorPlugin({ locales: ['en', 'zh'] })
  ]
}
```

### 工具链集成

```typescript
import {
  biomeIntegrationPlugin,
  oxcIntegrationPlugin,
  lightningCSSPlugin
} from '@ldesign/builder'

export default {
  plugins: [
    biomeIntegrationPlugin({ autoFix: true }),
    oxcIntegrationPlugin(),
    lightningCSSPlugin({ minify: true })
  ]
}
```

---

## 🌐 运行时支持

### Cloudflare Workers
```typescript
import { applyCloudflareWorkersConfig } from '@ldesign/builder'

const config = applyCloudflareWorkersConfig(baseConfig)
```

### Deno Deploy
```typescript
import { applyDenoDeployConfig } from '@ldesign/builder'

const config = applyDenoDeployConfig(baseConfig)
```

---

## 🔧 配置预设

```typescript
import { presets } from '@ldesign/builder'

// Vue 组件库
export default presets.vueLibrary()

// React 组件库
export default presets.reactLibrary()

// Monorepo 包
export default presets.monorepoPackage()

// TypeScript 库
export default presets.libraryPackage()
```

---

## 📊 命令行

```bash
# 构建
npx ldesign-builder build

# 监听模式
npx ldesign-builder build --watch

# 指定打包器
npx ldesign-builder build --bundler esbuild

# 分析打包结果
npx ldesign-builder build --analyze

# 生成报告
npx ldesign-builder build --report

# 清理
npx ldesign-builder clean
```

---

## 🎯 性能优化

```typescript
export default {
  cache: true,                    // 启用缓存
  performance: {
    incremental: true,            // 增量构建
    parallel: true,               // 并行构建
    streamProcessing: true        // 流式处理
  }
}
```

---

## 📚 文档链接

- [API 文档](./docs/API.md)
- [最佳实践](./docs/BEST_PRACTICES.md)
- [迁移指南](./docs/MIGRATION_GUIDE.md)
- [完整 README](./README.md)

---

## 💡 常用代码片段

### 配置验证
```typescript
import { validateConfig } from '@ldesign/builder'

const result = validateConfig(config)
if (!result.success) {
  console.error(formatZodErrors(result.errors))
}
```

### 插件搜索
```typescript
import { createPluginRegistry } from '@ldesign/builder'

const registry = createPluginRegistry()
const plugins = registry.search('image')
```

### 实时监控
```typescript
import { createRealTimeMonitor } from '@ldesign/builder'

const monitor = createRealTimeMonitor({ port: 3031 })
await monitor.start(buildId)
```

---

**版本**: 1.0.0+
**更新**: 2025-01-23

