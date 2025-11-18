# @ldesign/builder API 文档

## 核心 API

### LibraryBuilder

主构建器类，负责协调整个构建过程。

```typescript
import { LibraryBuilder } from '@ldesign/builder'

const builder = new LibraryBuilder({
  logger: customLogger,
  autoDetect: true
})

await builder.initialize()
const result = await builder.build(config)
```

#### 方法

##### `build(config?: BuilderConfig): Promise<BuildResult>`

执行构建任务。

**参数**:
- `config` - 可选的配置覆盖

**返回**: 构建结果对象

**示例**:
```typescript
const result = await builder.build({
  bundler: 'esbuild',
  mode: 'development'
})

console.log(result.duration)  // 构建耗时
console.log(result.outputs)   // 输出文件
```

##### `buildWatch(config?: BuilderConfig): Promise<BuildWatcher>`

启动监听模式。

**参数**:
- `config` - 可选的配置覆盖

**返回**: 文件监听器

**示例**:
```typescript
const watcher = await builder.buildWatch()

watcher.on('change', (file) => {
  console.log('文件变化:', file)
})

await watcher.close()
```

##### `setBundler(bundler: BundlerType): void`

切换打包引擎。

**参数**:
- `bundler` - 打包器类型 ('rollup' | 'rolldown' | 'esbuild' | 'swc')

**示例**:
```typescript
builder.setBundler('esbuild')
```

---

## 适配器

### EsbuildAdapter

极速构建适配器（10-100x 提速）。

```typescript
import { EsbuildAdapter } from '@ldesign/builder'

const adapter = new EsbuildAdapter({
  logger: customLogger
})

const result = await adapter.build(config)
```

**特性**:
- ✅ 极速构建
- ✅ TypeScript/JSX 内置支持
- ✅ 代码分割
- ❌ 不支持装饰器
- ❌ 不支持 Vue SFC

### SwcAdapter

快速生产构建适配器（20x 提速）。

```typescript
import { SwcAdapter } from '@ldesign/builder'

const adapter = new SwcAdapter()
const result = await adapter.build(config)
```

**特性**:
- ✅ 快速构建
- ✅ 完整 TypeScript 支持
- ✅ 装饰器支持
- ✅ React 自动运行时
- ❌ 不支持 bundling（仅转译）

---

## 工具函数

### createEnhancedErrorHandler

创建增强的错误处理器。

```typescript
import { createEnhancedErrorHandler } from '@ldesign/builder'

const handler = createEnhancedErrorHandler({
  enabled: true,
  autoFix: true,
  backup: true
})

try {
  await build()
} catch (error) {
  handler.handle(error)
}
```

**选项**:
- `enabled` - 是否启用（默认: true）
- `autoFix` - 是否自动修复（默认: false）
- `backup` - 修复前是否备份（默认: true）
- `confirmBeforeFix` - 修复前是否确认（默认: true）

### createMultilayerCache

创建多层缓存系统。

```typescript
import { createMultilayerCache } from '@ldesign/builder'

const cache = createMultilayerCache({
  l1: { maxSize: 100 * 1024 * 1024 },  // 100MB 内存
  l2: { maxSize: 500 * 1024 * 1024 },  // 500MB 磁盘
  l3: { enabled: false }                // 可选分布式
})

await cache.set('key', data)
const result = await cache.get('key')
const stats = cache.getStats()
```

**配置**:
- `l1` - L1 内存缓存配置
- `l2` - L2 磁盘缓存配置
- `l3` - L3 分布式缓存配置

### validateConfig

使用 Zod 验证配置。

```typescript
import { validateConfig, formatZodErrors } from '@ldesign/builder'

const result = validateConfig(userConfig)

if (result.success) {
  const config = result.data
  // 使用配置...
} else {
  const errors = formatZodErrors(result.errors)
  console.error(errors)
}
```

---

## 调试工具

### BuildDebugger

构建调试器，支持断点、步进、变量查看。

```typescript
import { createBuildDebugger } from '@ldesign/builder'

const debugger = createBuildDebugger({
  enabled: true,
  pauseOnStart: false
})

// 添加断点
debugger.addBreakpoint({
  phase: 'transform',
  condition: (ctx) => ctx.file?.includes('index.ts')
})

// 监听断点
debugger.on('breakpoint:hit', ({ id, context }) => {
  console.log('命中断点:', id)
  console.log('变量:', context.variables)
  
  // 继续执行
  debugger.continue()
})
```

### PerformanceProfiler

性能分析器，生成火焰图和时间轴。

```typescript
import { createPerformanceProfiler } from '@ldesign/builder'

const profiler = createPerformanceProfiler({
  enabled: true,
  generateFlameGraph: true,
  generateTimeline: true
})

profiler.start()

// 标记事件
const id = profiler.markStart('transform-files')
// ... 执行操作 ...
profiler.markEnd(id)

profiler.stop()

// 生成报告
const report = profiler.generateReport()
console.log(report.flameGraph)
console.log(report.timeline)

// 导出为 Chrome DevTools 格式
const trace = profiler.exportToChromeTrace()
```

---

## 策略系统

### 新框架支持

#### AstroStrategy

```typescript
import { AstroStrategy } from '@ldesign/builder'

const strategy = new AstroStrategy()
const config = await strategy.applyStrategy(baseConfig, context)
```

#### Nuxt3Strategy

```typescript
import { Nuxt3Strategy } from '@ldesign/builder'

const strategy = new Nuxt3Strategy()
const config = await strategy.applyStrategy(baseConfig, context)
```

#### RemixStrategy

```typescript
import { RemixStrategy } from '@ldesign/builder'

const strategy = new RemixStrategy()
const config = await strategy.applyStrategy(baseConfig, context)
```

#### SolidStartStrategy

```typescript
import { SolidStartStrategy } from '@ldesign/builder'

const strategy = new SolidStartStrategy()
const config = await strategy.applyStrategy(baseConfig, context)
```

---

## 插件

### 官方插件

#### imageOptimizerPlugin

图片自动优化插件。

```typescript
import { imageOptimizerPlugin } from '@ldesign/builder'

export default {
  plugins: [
    imageOptimizerPlugin({
      quality: 80,
      formats: ['webp', 'avif'],
      responsive: true,
      inlineLimit: 8192
    })
  ]
}
```

#### svgOptimizerPlugin

SVG 优化和组件生成插件。

```typescript
import { svgOptimizerPlugin } from '@ldesign/builder'

export default {
  plugins: [
    svgOptimizerPlugin({
      svgo: true,
      sprite: true,
      reactComponent: true,
      vueComponent: false
    })
  ]
}
```

#### i18nExtractorPlugin

国际化资源提取插件。

```typescript
import { i18nExtractorPlugin } from '@ldesign/builder'

export default {
  plugins: [
    i18nExtractorPlugin({
      functionNames: ['t', '$t'],
      locales: ['en', 'zh', 'ja'],
      defaultLocale: 'en',
      generateTypes: true
    })
  ]
}
```

---

## 集成

### Biome 集成

```typescript
import { biomeIntegrationPlugin } from '@ldesign/builder'

export default {
  plugins: [
    biomeIntegrationPlugin({
      formatOnBuild: true,
      lintOnBuild: true,
      autoFix: true
    })
  ]
}
```

### Oxc 集成

```typescript
import { oxcIntegrationPlugin } from '@ldesign/builder'

export default {
  plugins: [
    oxcIntegrationPlugin({
      target: 'es2020',
      jsx: true,
      jsxRuntime: 'automatic'
    })
  ]
}
```

### Lightning CSS

```typescript
import { lightningCSSPlugin } from '@ldesign/builder'

export default {
  plugins: [
    lightningCSSPlugin({
      targets: '>= 0.25%',
      minify: true,
      cssModules: true
    })
  ]
}
```

---

## 运行时支持

### Cloudflare Workers

```typescript
import { applyCloudflareWorkersConfig } from '@ldesign/builder'

const config = applyCloudflareWorkersConfig(baseConfig, {
  compatibilityDate: '2024-01-01',
  moduleWorker: true
})
```

### Deno Deploy

```typescript
import { applyDenoDeployConfig } from '@ldesign/builder'

const config = applyDenoDeployConfig(baseConfig, {
  generateImportMap: true
})
```

---

## CI/CD

### GitHub Actions

```typescript
import { generateGitHubActionsWorkflow } from '@ldesign/builder'

const workflow = generateGitHubActionsWorkflow({
  name: 'Build and Test',
  nodeVersions: ['18.x', '20.x'],
  enableCache: true,
  runTests: true,
  publishNPM: true
})

// 保存到 .github/workflows/build.yml
```

### Docker

```typescript
import { generateDockerfile, generateDockerCompose } from '@ldesign/builder'

const dockerfile = generateDockerfile({
  nodeVersion: '20-alpine',
  packageManager: 'pnpm'
})

const compose = generateDockerCompose({
  serviceName: 'my-lib',
  port: 3000
})
```

---

## 插件市场

### PluginRegistry

```typescript
import { createPluginRegistry } from '@ldesign/builder'

const registry = createPluginRegistry()

// 搜索插件
const plugins = registry.search('image', {
  tags: ['optimization'],
  frameworks: ['vue', 'react']
})

// 安装插件
await registry.installPlugin('image-optimizer')

// 获取推荐
const recommended = registry.getRecommendedPlugins(config)
```

### PluginSDK

```typescript
import { createPluginSDK } from '@ldesign/builder'

const sdk = createPluginSDK()

// 创建新插件
const pluginDir = await sdk.createPlugin({
  name: 'my-awesome-plugin',
  type: 'transform',
  framework: 'universal'
})
```

---

## 监控工具

### RealTimeMonitor

```typescript
import { createRealTimeMonitor } from '@ldesign/builder'

const monitor = createRealTimeMonitor({
  port: 3031,
  enableDashboard: true
})

await monitor.start(buildId)

monitor.updatePhase('transforming', '正在转换文件...')
monitor.updateProgress(50, 100)

monitor.stop()
```

### MemoryLeakDetector

```typescript
import { createMemoryLeakDetector } from '@ldesign/builder'

const detector = createMemoryLeakDetector({
  sampleInterval: 1000,
  growthThreshold: 1 // 1MB/s
})

detector.start()

detector.on('leak:detected', (detection) => {
  console.log('检测到内存泄漏:', detection)
  console.log('建议:', detection.recommendations)
})

// 生成报告
const report = detector.generateReport()

detector.stop()
```

---

## 配置 Schema

### BuilderConfigSchema

完整的 Zod Schema 定义。

```typescript
import { BuilderConfigSchema, type InferredBuilderConfig } from '@ldesign/builder'

// 类型推断
type Config = InferredBuilderConfig

// 验证配置
const result = BuilderConfigSchema.safeParse(userConfig)
```

---

## 事件系统

### LibraryBuilder 事件

```typescript
builder.on('build:start', ({ config, buildId }) => {
  console.log('构建开始:', buildId)
})

builder.on('build:end', ({ result, duration }) => {
  console.log('构建完成，耗时:', duration)
})

builder.on('build:error', ({ error, phase }) => {
  console.log('构建错误:', error)
})

builder.on('status:change', ({ status, oldStatus }) => {
  console.log('状态变化:', oldStatus, '->', status)
})
```

### RealTimeMonitor 事件

```typescript
monitor.on('phase:change', ({ phase, message }) => {
  console.log('阶段:', phase, message)
})

monitor.on('progress:update', (progress) => {
  console.log('进度:', progress.percentage, '%')
})

monitor.on('error', (message) => {
  console.error('错误:', message)
})
```

---

## 类型定义

### BuilderConfig

主配置接口。

```typescript
interface BuilderConfig {
  input?: string | string[] | Record<string, string>
  output?: OutputConfig
  bundler?: 'rollup' | 'rolldown' | 'esbuild' | 'swc'
  mode?: 'development' | 'production'
  libraryType?: LibraryType
  external?: string[] | ((id: string) => boolean)
  plugins?: UnifiedPlugin[]
  // ... 更多配置
}
```

### BuildResult

构建结果接口。

```typescript
interface BuildResult {
  success: boolean
  outputs: OutputFile[]
  duration: number
  stats: BuildStats
  performance: PerformanceMetrics
  warnings: Warning[]
  errors: Error[]
  buildId: string
  bundler: BundlerType
  mode: BuildMode
}
```

---

## 工具函数

### defineConfig

定义配置（带类型提示）。

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  bundler: 'rollup',
  output: {
    esm: { dir: 'es', format: 'esm' }
  }
})
```

### createBuilder

快速创建构建器实例。

```typescript
import { createBuilder } from '@ldesign/builder'

const builder = createBuilder({
  bundler: 'esbuild',
  mode: 'development'
})

await builder.build()
```

---

## 高级功能

### 增量构建

```typescript
import { createIncrementalBuildManager } from '@ldesign/builder'

const manager = createIncrementalBuildManager({
  enabled: true,
  stateFile: '.build-state.json'
})

await manager.loadState()

const { changed, unchanged } = await manager.getChangedFiles(files)
console.log(`需要构建 ${changed.length} 个文件`)

// 获取循环依赖建议
const advice = manager.getCircularDependencyAdvice()

// 获取构建顺序
const buildOrder = manager.getBuildOrder()

// 获取关键路径
const criticalPath = manager.getCriticalPath()

await manager.saveState()
```

### 并行构建

```typescript
import { createParallelProcessor } from '@ldesign/builder'

const processor = createParallelProcessor({
  maxConcurrency: 4,
  enablePriority: true,
  autoAdjustConcurrency: true
})

processor.addTask({
  id: 'task-1',
  fn: async (data) => buildFile(data.file),
  data: { file: 'file1.ts' },
  priority: 10,
  timeout: 30000,
  retries: 2
})

await processor.waitAll()

// 获取性能指标
const metrics = processor.getPerformanceMetrics()
console.log(`完成任务: ${metrics.successfulTasks}/${metrics.totalTasks}`)
```

---

## 配置预设

### presets.vueLibrary

Vue 组件库预设。

```typescript
import { presets } from '@ldesign/builder'

export default presets.vueLibrary({
  external: ['vue', 'vue-router']
})
```

### presets.reactLibrary

React 组件库预设。

```typescript
import { presets } from '@ldesign/builder'

export default presets.reactLibrary({
  external: ['react', 'react-dom']
})
```

### presets.monorepoPackage

Monorepo 包预设。

```typescript
import { presets } from '@ldesign/builder'

export default presets.monorepoPackage({
  libraryType: 'typescript'
})
```

---

## 最佳实践

### 1. 选择合适的打包器

```typescript
// 开发模式 - 使用 esbuild
export default {
  bundler: 'esbuild',
  mode: 'development'
}

// 生产模式 - 使用 swc 或 rollup
export default {
  bundler: 'swc',  // 快速
  // 或
  bundler: 'rollup', // 稳定
  mode: 'production'
}
```

### 2. 启用缓存

```typescript
export default {
  cache: {
    enabled: true,
    cacheDir: 'node_modules/.cache/@ldesign/builder'
  },
  performance: {
    incremental: true
  }
}
```

### 3. 优化性能

```typescript
export default {
  performance: {
    parallel: {
      enabled: true,
      maxConcurrency: 4
    },
    incremental: true,
    cache: true,
    streamProcessing: true
  }
}
```

---

## 参考链接

- [快速开始](./QUICK_START.md)
- [配置参考](./CONFIGURATION.md)
- [迁移指南](./MIGRATION.md)
- [故障排除](./TROUBLESHOOTING.md)
- [性能优化](./PERFORMANCE.md)
- [插件开发](./PLUGIN_DEVELOPMENT.md)
