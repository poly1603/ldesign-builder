# 核心 API

@ldesign/builder 的核心 API 参考。

## defineConfig

定义配置的类型安全辅助函数。

### 类型签名

```typescript
function defineConfig(
  config: BuilderConfig | ((options: ConfigOptions) => BuilderConfig)
): BuilderConfig
```

### 基础用法

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  entry: 'src/index.ts',
  output: {
    formats: ['esm', 'cjs']
  }
})
```

### 函数式配置

```typescript
export default defineConfig(({ mode, command }) => {
  return {
    entry: 'src/index.ts',
    optimization: {
      minify: mode === 'production'
    }
  }
})
```

### 参数

- `config` - 配置对象或返回配置的函数
  - `mode` - `'development'` | `'production'`
  - `command` - `'build'` | `'watch'`

## build

执行构建。

### 类型签名

```typescript
function build(options?: BuildOptions): Promise<BuildResult>
```

### 用法

```typescript
import { build } from '@ldesign/builder'

// 使用默认配置
await build()

// 自定义配置
await build({
  entry: 'src/index.ts',
  output: {
    formats: ['esm']
  }
})

// 获取构建结果
const result = await build()
console.log(result.duration) // 构建耗时
console.log(result.outputs)  // 输出文件
```

### 返回值

```typescript
interface BuildResult {
  success: boolean
  duration: number
  outputs: OutputFile[]
  errors: Error[]
  warnings: Warning[]
}
```

## watch

监听模式。

### 类型签名

```typescript
function watch(options?: WatchOptions): Promise<Watcher>
```

### 用法

```typescript
import { watch } from '@ldesign/builder'

const watcher = await watch({
  entry: 'src/index.ts'
})

// 监听事件
watcher.on('change', (file) => {
  console.log('Changed:', file)
})

watcher.on('rebuild', (result) => {
  console.log('Rebuilt:', result.duration)
})

// 停止监听
watcher.close()
```

### 事件

- `change` - 文件变化
- `rebuild` - 重新构建完成
- `error` - 构建错误

## loadConfig

加载配置文件。

### 类型签名

```typescript
function loadConfig(options?: LoadConfigOptions): Promise<BuilderConfig>
```

### 用法

```typescript
import { loadConfig } from '@ldesign/builder'

// 自动查找配置文件
const config = await loadConfig()

// 指定配置文件
const config = await loadConfig({
  configFile: './my-config.ts'
})

// 指定根目录
const config = await loadConfig({
  cwd: '/path/to/project'
})
```

## resolveConfig

解析最终配置。

### 类型签名

```typescript
function resolveConfig(
  userConfig: BuilderConfig,
  options?: ResolveOptions
): Promise<ResolvedConfig>
```

### 用法

```typescript
import { resolveConfig, defineConfig } from '@ldesign/builder'

const userConfig = defineConfig({
  entry: 'src/index.ts'
})

const resolved = await resolveConfig(userConfig, {
  mode: 'production'
})

console.log(resolved.entry)  // 解析后的入口
console.log(resolved.output) // 解析后的输出配置
```

## mergeConfig

合并多个配置。

### 类型签名

```typescript
function mergeConfig(
  ...configs: BuilderConfig[]
): BuilderConfig
```

### 用法

```typescript
import { mergeConfig, defineConfig } from '@ldesign/builder'

const baseConfig = defineConfig({
  entry: 'src/index.ts'
})

const prodConfig = defineConfig({
  optimization: {
    minify: true
  }
})

export default mergeConfig(baseConfig, prodConfig)
```

## createBuilder

创建构建器实例。

### 类型签名

```typescript
function createBuilder(config: BuilderConfig): Builder
```

### 用法

```typescript
import { createBuilder } from '@ldesign/builder'

const builder = createBuilder({
  entry: 'src/index.ts',
  output: {
    formats: ['esm', 'cjs']
  }
})

// 构建
await builder.build()

// 监听
await builder.watch()

// 清理
await builder.clean()

// 分析
await builder.analyze()
```

### Builder 方法

```typescript
interface Builder {
  build(): Promise<BuildResult>
  watch(): Promise<Watcher>
  clean(): Promise<void>
  analyze(): Promise<AnalyzeResult>
  dispose(): Promise<void>
}
```

## 类型定义

### BuilderConfig

```typescript
interface BuilderConfig {
  // 入口
  entry?: string | string[] | Record<string, string>
  
  // 输出
  output?: OutputOptions
  
  // 打包器
  bundler?: 'rollup' | 'esbuild' | 'swc' | 'rolldown'
  
  // 插件
  plugins?: Plugin[]
  
  // 优化
  optimization?: OptimizationOptions
  
  // 外部依赖
  external?: string[] | ((id: string) => boolean)
  
  // 更多选项...
}
```

### OutputOptions

```typescript
interface OutputOptions {
  formats?: OutputFormat[]
  dir?: string | Record<OutputFormat, string>
  filename?: string | Record<OutputFormat, string>
  name?: string
  globals?: Record<string, string>
  sourcemap?: boolean | 'inline' | 'hidden'
  banner?: string
  footer?: string
}
```

### Plugin

```typescript
interface Plugin {
  name: string
  setup?: (build: PluginBuild) => void | Promise<void>
}
```

## 示例

### 完整示例

```typescript
import { 
  defineConfig, 
  build, 
  watch,
  createBuilder 
} from '@ldesign/builder'

// 1. 定义配置
const config = defineConfig({
  entry: 'src/index.ts',
  output: {
    formats: ['esm', 'cjs'],
    dir: {
      esm: 'es',
      cjs: 'lib'
    }
  }
})

// 2. 直接构建
await build(config)

// 3. 或创建构建器实例
const builder = createBuilder(config)

// 构建
const result = await builder.build()
console.log(`Build completed in ${result.duration}ms`)

// 监听
if (process.env.WATCH) {
  const watcher = await builder.watch()
  watcher.on('rebuild', (result) => {
    console.log(`Rebuilt in ${result.duration}ms`)
  })
}

// 清理
await builder.clean()
```

### 编程式使用

```typescript
import { build } from '@ldesign/builder'

async function buildLibrary() {
  try {
    const result = await build({
      entry: 'src/index.ts',
      output: {
        formats: ['esm', 'cjs', 'umd'],
        name: 'MyLibrary'
      },
      optimization: {
        minify: true
      }
    })
    
    if (result.success) {
      console.log('✓ Build successful')
      console.log(`  Duration: ${result.duration}ms`)
      console.log(`  Outputs: ${result.outputs.length} files`)
    } else {
      console.error('✗ Build failed')
      result.errors.forEach(error => {
        console.error(error.message)
      })
    }
  } catch (error) {
    console.error('Build error:', error)
    process.exit(1)
  }
}

buildLibrary()
```

## 下一步

- 📦 [构建器 API](/api/builder) - Builder 类的详细 API
- 🔌 [插件 API](/api/plugins) - 插件开发 API
- 🛠️ [工具函数](/api/utils) - 实用工具函数
