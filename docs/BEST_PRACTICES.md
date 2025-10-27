# @ldesign/builder 最佳实践指南

> **版本：** 1.0.0  
> **最后更新：** 2024-01-01

---

## 📚 目录

1. [项目配置最佳实践](#1-项目配置最佳实践)
2. [性能优化最佳实践](#2-性能优化最佳实践)
3. [缓存策略最佳实践](#3-缓存策略最佳实践)
4. [错误处理最佳实践](#4-错误处理最佳实践)
5. [插件开发最佳实践](#5-插件开发最佳实践)
6. [Monorepo 最佳实践](#6-monorepo-最佳实践)
7. [CI/CD 集成最佳实践](#7-cicd-集成最佳实践)
8. [生产环境最佳实践](#8-生产环境最佳实践)

---

## 1. 项目配置最佳实践

### 1.1 配置文件组织 ⭐⭐⭐⭐⭐

**✅ 推荐：使用 TypeScript 配置文件**
```typescript
// ldesign.config.ts
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: ['esm', 'cjs'],
    sourcemap: true
  },
  // 类型安全的配置，支持 IDE 智能提示
})
```

**❌ 不推荐：使用 JSON 配置文件**
```json
// ldesign.config.json
{
  "input": "src/index.ts",
  // 没有类型检查，容易出错
  // 不支持注释和函数
}
```

### 1.2 环境特定配置 ⭐⭐⭐⭐⭐

**✅ 推荐：使用 env 字段分离环境配置**
```typescript
export default defineConfig({
  input: 'src/index.ts',
  output: {
    dir: 'dist'
  },
  // 环境特定配置
  env: {
    development: {
      minify: false,
      sourcemap: 'inline',
      output: {
        format: ['esm']  // 开发环境只需要 ESM
      }
    },
    production: {
      minify: true,
      sourcemap: true,
      output: {
        format: ['esm', 'cjs', 'umd']  // 生产环境输出多种格式
      }
    }
  }
})
```

**❌ 不推荐：创建多个配置文件**
```typescript
// config.dev.ts
// config.prod.ts
// 维护成本高，容易不一致
```

### 1.3 配置模块化 ⭐⭐⭐⭐

**✅ 推荐：提取公共配置**
```typescript
// config/base.ts
export const baseConfig = {
  clean: true,
  treeshake: true,
  external: ['vue', 'react']
}

// config/output.ts
export const outputConfig = {
  dir: 'dist',
  preserveModules: true
}

// ldesign.config.ts
import { defineConfig } from '@ldesign/builder'
import { baseConfig } from './config/base'
import { outputConfig } from './config/output'

export default defineConfig({
  ...baseConfig,
  input: 'src/index.ts',
  output: outputConfig
})
```

---

## 2. 性能优化最佳实践

### 2.1 选择合适的打包器 ⭐⭐⭐⭐⭐

**决策树：**

```
项目类型？
├─ 开发环境构建
│  └─ 使用 esbuild（10-100x 速度）
│     配置：{ bundler: 'esbuild', minify: false }
│
├─ 生产环境构建（小型项目 <100个文件）
│  └─ 使用 swc（20x 速度，更好的优化）
│     配置：{ bundler: 'swc', minify: true }
│
├─ 生产环境构建（大型项目 >100个文件）
│  └─ 使用 rollup（稳定性最好，插件生态完善）
│     配置：{ bundler: 'rollup', minify: true }
│
└─ 需要最新特性
   └─ 使用 rolldown（现代化，性能优）
      配置：{ bundler: 'rolldown' }
```

**实际配置示例：**
```typescript
export default defineConfig({
  env: {
    development: {
      bundler: 'esbuild',  // 开发环境优先速度
      minify: false
    },
    production: {
      bundler: 'rollup',   // 生产环境优先稳定性
      minify: true,
      treeshake: true
    }
  }
})
```

### 2.2 启用并行构建 ⭐⭐⭐⭐⭐

**✅ 推荐：多格式并行输出**
```typescript
export default defineConfig({
  output: {
    format: ['esm', 'cjs', 'umd']  // 自动并行构建
  },
  parallel: true  // 启用并行构建（默认开启）
})
```

**效果：**
- 3种格式串行构建：约 30 秒
- 3种格式并行构建：约 12 秒（提速 2.5x）

### 2.3 优化 Tree-Shaking ⭐⭐⭐⭐⭐

**✅ 推荐：激进的 Tree-Shaking 配置**
```typescript
export default defineConfig({
  treeshake: {
    moduleSideEffects: false,          // 假设模块无副作用
    propertyReadSideEffects: false,    // 假设属性读取无副作用
    annotations: true,                  // 使用注释标记
    preset: 'safest' | 'recommended' | 'smallest'
  }
})
```

**注意事项：**
```typescript
// 如果你的代码有副作用，需要明确标记
export default defineConfig({
  treeshake: {
    moduleSideEffects: [
      'src/polyfills.ts',  // 这个文件有副作用
      '**/*.css'           // CSS 文件有副作用
    ]
  }
})
```

### 2.4 代码分割策略 ⭐⭐⭐⭐

**✅ 推荐：智能代码分割**
```typescript
export default defineConfig({
  output: {
    preserveModules: true,  // 保持模块结构
    chunkFileNames: 'chunks/[name]-[hash].js',
    manualChunks: {
      // 将第三方依赖分离到单独的 chunk
      vendor: ['lodash', 'axios'],
      // 将大型模块分离
      charts: ['src/charts/index.ts']
    }
  }
})
```

**效果：**
- 减少主 bundle 大小
- 提升缓存命中率
- 支持按需加载

---

## 3. 缓存策略最佳实践

### 3.1 启用构建缓存 ⭐⭐⭐⭐⭐

**✅ 推荐：全面启用缓存**
```typescript
export default defineConfig({
  cache: {
    enabled: true,
    dir: 'node_modules/.cache/@ldesign/builder',
    // 缓存策略
    strategy: {
      // 依赖文件变更时失效
      dependencies: true,
      // 配置变更时失效
      config: true,
      // 24小时后自动失效
      maxAge: 24 * 60 * 60 * 1000
    }
  }
})
```

**效果：**
- 首次构建：30 秒
- 缓存命中：2 秒（提速 15x）

### 3.2 增量构建配置 ⭐⭐⭐⭐⭐

**✅ 推荐：启用增量构建**
```typescript
export default defineConfig({
  incremental: true,  // 启用增量构建
  watch: {
    include: 'src/**',
    exclude: ['**/*.test.ts', '**/*.spec.ts']
  }
})
```

**监听模式最佳实践：**
```bash
# 启用监听模式
ldesign-builder build --watch

# 结合热重载
ldesign-builder build --watch --hmr
```

### 3.3 缓存预热 ⭐⭐⭐⭐

**✅ 推荐：CI/CD 中缓存预热**
```yaml
# .github/workflows/build.yml
- name: 恢复缓存
  uses: actions/cache@v3
  with:
    path: node_modules/.cache
    key: ${{ runner.os }}-builder-${{ hashFiles('**/package-lock.json') }}

- name: 构建（使用缓存）
  run: npm run build
```

---

## 4. 错误处理最佳实践

### 4.1 优雅的错误处理 ⭐⭐⭐⭐⭐

**✅ 推荐：使用 try-catch 和错误恢复**
```typescript
import { LibraryBuilder, BuilderError, ErrorCode } from '@ldesign/builder'

const builder = new LibraryBuilder()

try {
  const result = await builder.build(config)
} catch (error) {
  if (error instanceof BuilderError) {
    // 构建器错误，有详细的上下文信息
    console.error('构建失败:', error.getFullMessage())
    console.log('错误码:', error.code)
    console.log('建议:', error.suggestion)
    
    // 根据错误码采取不同的处理策略
    if (error.code === ErrorCode.OUT_OF_MEMORY) {
      // 增加内存后重试
      process.env.NODE_OPTIONS = '--max-old-space-size=4096'
      await builder.build(config)
    }
  } else {
    // 其他错误
    console.error('未知错误:', error)
  }
}
```

**❌ 不推荐：忽略错误**
```typescript
// 不要这样做
builder.build(config).catch(() => {})
```

### 4.2 错误监听和日志 ⭐⭐⭐⭐

**✅ 推荐：监听构建事件**
```typescript
const builder = new LibraryBuilder()

// 监听错误事件
builder.on('build:error', ({ error, phase }) => {
  logger.error(`构建在 ${phase} 阶段失败:`, error)
  
  // 发送错误报告
  sendErrorReport(error)
})

// 监听警告事件
builder.on('build:warning', ({ warning }) => {
  logger.warn('构建警告:', warning)
})

await builder.build(config)
```

### 4.3 自动错误恢复 ⭐⭐⭐⭐

**✅ 推荐：使用错误恢复机制**
```typescript
import { createErrorHandler } from '@ldesign/builder'

const errorHandler = createErrorHandler({
  showSuggestions: true
})

// 自动重试（最多3次）
const result = await errorHandler.recover(
  () => builder.build(config),
  defaultResult,  // 降级方案
  3               // 最大重试次数
)
```

---

## 5. 插件开发最佳实践

### 5.1 插件结构 ⭐⭐⭐⭐⭐

**✅ 推荐：标准插件结构**
```typescript
import type { UnifiedPlugin, PluginContext } from '@ldesign/builder'

export interface MyPluginOptions {
  // 插件选项
  enabled?: boolean
  config?: Record<string, any>
}

export function myPlugin(options: MyPluginOptions = {}): UnifiedPlugin {
  return {
    name: 'my-plugin',
    version: '1.0.0',
    
    // 初始化钩子
    async onInit(context: PluginContext) {
      console.log('插件初始化')
    },
    
    // 构建开始钩子
    async onBuildStart(context: PluginContext) {
      console.log('构建开始')
    },
    
    // 应用插件逻辑
    apply(config) {
      // 修改配置
      return {
        ...config,
        plugins: [
          ...config.plugins,
          customRollupPlugin(options)
        ]
      }
    },
    
    // 构建结束钩子
    async onBuildEnd(context: PluginContext, result) {
      console.log('构建完成:', result)
    },
    
    // 清理钩子
    async onDispose() {
      console.log('插件清理')
    }
  }
}
```

### 5.2 插件性能优化 ⭐⭐⭐⭐

**✅ 推荐：缓存插件结果**
```typescript
export function myPlugin(options): UnifiedPlugin {
  const cache = new Map()
  
  return {
    name: 'my-plugin',
    apply(config) {
      const cacheKey = generateKey(config)
      
      // 检查缓存
      if (cache.has(cacheKey)) {
        return cache.get(cacheKey)
      }
      
      // 执行插件逻辑
      const result = processConfig(config)
      
      // 缓存结果
      cache.set(cacheKey, result)
      
      return result
    }
  }
}
```

**❌ 不推荐：每次都重新计算**
```typescript
// 性能差，每次构建都重新计算
apply(config) {
  return expensiveOperation(config)
}
```

### 5.3 插件错误处理 ⭐⭐⭐⭐

**✅ 推荐：优雅的错误处理**
```typescript
export function myPlugin(): UnifiedPlugin {
  return {
    name: 'my-plugin',
    async onBuildStart(context) {
      try {
        await performTask()
      } catch (error) {
        // 记录错误但不中断构建
        context.logger.warn('插件执行失败:', error)
        
        // 或者抛出详细的错误
        throw new BuilderError(
          ErrorCode.PLUGIN_ERROR,
          '插件执行失败',
          {
            phase: 'onBuildStart',
            cause: error as Error,
            suggestion: '检查插件配置是否正确'
          }
        )
      }
    }
  }
}
```

---

## 6. Monorepo 最佳实践

### 6.1 依赖管理 ⭐⭐⭐⭐⭐

**✅ 推荐：使用 workspace 协议**
```json
// packages/ui/package.json
{
  "dependencies": {
    "@myorg/utils": "workspace:*",
    "@myorg/shared": "workspace:^1.0.0"
  }
}
```

### 6.2 构建顺序 ⭐⭐⭐⭐⭐

**✅ 推荐：使用拓扑排序**
```typescript
import { MonorepoBuilder } from '@ldesign/builder'

const builder = new MonorepoBuilder({
  // 自动分析依赖关系
  autoDetectDependencies: true,
  
  // 并行构建（遵循依赖顺序）
  parallel: true,
  
  // 增量构建
  incremental: true
})

await builder.buildAll()
```

**构建顺序：**
```
1. @myorg/shared（无依赖）
2. @myorg/utils（依赖 shared）
3. @myorg/ui（依赖 utils 和 shared）
   并行构建
```

### 6.3 共享配置 ⭐⭐⭐⭐

**✅ 推荐：使用基础配置**
```typescript
// configs/base.config.ts
export const baseConfig = {
  clean: true,
  sourcemap: true,
  minify: true
}

// packages/ui/ldesign.config.ts
import { defineConfig } from '@ldesign/builder'
import { baseConfig } from '../../configs/base.config'

export default defineConfig({
  ...baseConfig,
  input: 'src/index.ts',
  output: { dir: 'dist' }
})
```

---

## 7. CI/CD 集成最佳实践

### 7.1 GitHub Actions 配置 ⭐⭐⭐⭐⭐

**✅ 推荐：完整的 CI/CD 流程**
```yaml
# .github/workflows/build.yml
name: Build and Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      # 1. 检出代码
      - uses: actions/checkout@v3
      
      # 2. 设置 Node.js
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      # 3. 安装依赖
      - run: npm ci
      
      # 4. 恢复构建缓存
      - name: 恢复构建缓存
        uses: actions/cache@v3
        with:
          path: node_modules/.cache
          key: ${{ runner.os }}-builder-${{ hashFiles('**/package-lock.json') }}
      
      # 5. 运行构建
      - name: 构建
        run: npm run build
        env:
          NODE_OPTIONS: --max-old-space-size=4096
      
      # 6. 运行测试
      - name: 测试
        run: npm test
      
      # 7. 生成构建报告
      - name: 生成报告
        run: npm run build -- --report --analyze
      
      # 8. 上传构建产物
      - uses: actions/upload-artifact@v3
        with:
          name: build-output
          path: dist/
      
      # 9. 上传构建报告
      - uses: actions/upload-artifact@v3
        with:
          name: build-report
          path: dist/build-report.json
```

### 7.2 性能监控 ⭐⭐⭐⭐

**✅ 推荐：监控构建性能**
```yaml
# 添加性能监控步骤
- name: 性能监控
  run: |
    npm run build -- --report=dist/perf.json
    node scripts/check-performance.js dist/perf.json
```

**性能检查脚本：**
```javascript
// scripts/check-performance.js
const report = require(process.argv[2])

// 检查构建时间
if (report.meta.duration > 60000) {
  console.error('⚠️ 构建时间过长:', report.meta.duration)
  process.exit(1)
}

// 检查包体积
if (report.totals.gzip > 500 * 1024) {
  console.error('⚠️ 包体积过大:', report.totals.gzip)
  process.exit(1)
}

console.log('✅ 性能检查通过')
```

---

## 8. 生产环境最佳实践

### 8.1 代码压缩 ⭐⭐⭐⭐⭐

**✅ 推荐：使用高级压缩配置**
```typescript
export default defineConfig({
  minify: {
    enabled: true,
    // 使用 Terser 高级压缩
    terser: {
      compress: {
        drop_console: true,      // 移除 console
        drop_debugger: true,     // 移除 debugger
        pure_funcs: ['console.log']  // 移除特定函数调用
      },
      mangle: {
        toplevel: true,          // 混淆顶层作用域
        properties: {
          regex: /^_/            // 混淆下划线开头的属性
        }
      }
    }
  }
})
```

**效果：**
- 原始大小：500 KB
- 压缩后：150 KB
- Gzip 后：45 KB

### 8.2 外部依赖配置 ⭐⭐⭐⭐⭐

**✅ 推荐：正确配置外部依赖**
```typescript
export default defineConfig({
  // 方式1：使用数组
  external: ['vue', 'react', 'lodash'],
  
  // 方式2：使用函数（更灵活）
  external: (id) => {
    // 所有 node_modules 的依赖都外部化
    return /node_modules/.test(id)
  },
  
  // 方式3：使用正则（推荐）
  external: [
    /^vue(\/.*)?$/,      // vue 及其子包
    /^react(\/.*)?$/,    // react 及其子包
    /^lodash/            // lodash 系列
  ]
})
```

**注意事项：**
```typescript
// peerDependencies 应该外部化
// dependencies 根据情况决定
// devDependencies 通常外部化
```

### 8.3 发布前检查 ⭐⭐⭐⭐⭐

**✅ 推荐：完整的发布检查清单**
```bash
# 1. 清理构建产物
npm run clean

# 2. 重新安装依赖
rm -rf node_modules package-lock.json
npm install

# 3. 运行完整测试
npm test

# 4. 生产构建
npm run build

# 5. 验证构建产物
npm run verify:build

# 6. 检查包体积
npm run build -- --size-limit 200k

# 7. 本地测试包
npm pack
npm install ./ldesign-builder-1.0.0.tgz -g

# 8. 发布
npm publish
```

**自动化脚本：**
```json
{
  "scripts": {
    "prepublishOnly": "npm run clean && npm run build && npm test",
    "verify:build": "node scripts/verify-outputs.js"
  }
}
```

---

## 9. 常见问题和解决方案

### 9.1 内存溢出 🔥

**问题：**
```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

**解决方案：**
```bash
# 方案1：增加 Node.js 内存限制
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build

# 方案2：启用增量构建
# ldesign.config.ts
export default defineConfig({
  incremental: true
})

# 方案3：使用流式处理
export default defineConfig({
  output: {
    preserveModules: true  // 避免一次性加载所有模块
  }
})
```

### 9.2 构建速度慢 🐌

**问题：**
构建时间超过 1 分钟

**解决方案：**
```typescript
// 1. 使用更快的打包器
export default defineConfig({
  bundler: 'esbuild'  // 开发环境
})

// 2. 启用并行构建
export default defineConfig({
  parallel: true
})

// 3. 启用缓存
export default defineConfig({
  cache: { enabled: true }
})

// 4. 减少输出格式
export default defineConfig({
  output: {
    format: ['esm']  // 只输出 ESM
  }
})
```

### 9.3 循环依赖警告 ⚠️

**问题：**
```
⚠️ Circular dependency detected
```

**解决方案：**
```typescript
// 方案1：重构代码消除循环依赖（推荐）
// A.ts
export { b } from './B'  // ❌

// 改为
// index.ts
export * from './A'
export * from './B'

// 方案2：临时抑制警告
export default defineConfig({
  onwarn(warning) {
    if (warning.code === 'CIRCULAR_DEPENDENCY') {
      return  // 忽略循环依赖警告
    }
    console.warn(warning)
  }
})
```

---

## 10. 性能优化技巧

### 10.1 减少 Bundle 体积 📦

**技巧1：Tree-Shaking**
```typescript
// 确保使用 ES6 模块
export { foo, bar }  // ✅ 可以 tree-shake
module.exports = { foo, bar }  // ❌ 无法 tree-shake
```

**技巧2：代码分割**
```typescript
export default defineConfig({
  output: {
    preserveModules: true,
    // 或者使用手动分割
    manualChunks: {
      lodash: ['lodash'],
      react: ['react', 'react-dom']
    }
  }
})
```

**技巧3：移除未使用的代码**
```typescript
// 使用 rollup-plugin-terser 的高级选项
{
  compress: {
    unused: true,
    dead_code: true
  }
}
```

### 10.2 优化构建速度 ⚡

**技巧1：减少文件 I/O**
```typescript
export default defineConfig({
  output: {
    sourcemap: 'hidden'  // 不生成 .map 文件
  }
})
```

**技巧2：使用内存文件系统**
```typescript
import { createMemFs } from '@ldesign/builder'

export default defineConfig({
  plugins: [
    createMemFs()  // 使用内存文件系统
  ]
})
```

**技巧3：并行 + 缓存**
```typescript
export default defineConfig({
  parallel: true,
  cache: { enabled: true },
  incremental: true
})
```

---

## 11. 调试技巧

### 11.1 启用详细日志 🔍

```bash
# 设置日志级别为 debug
DEBUG=* ldesign-builder build

# 或在配置中设置
export default defineConfig({
  logLevel: 'debug'
})
```

### 11.2 生成构建报告 📊

```bash
# 生成详细报告
ldesign-builder build --report --analyze

# 查看报告
cat dist/build-report.json | jq .
```

### 11.3 性能分析 📈

```bash
# 生成性能火焰图
ldesign-builder build --flamegraph

# 性能基准测试
ldesign-builder benchmark
```

---

## 12. 代码质量检查

### 12.1 Lint 配置 ✅

```javascript
// eslint.config.js
export default {
  extends: ['@ldesign/eslint-config'],
  rules: {
    // 禁止使用 any
    '@typescript-eslint/no-explicit-any': 'error',
    // 要求函数返回类型
    '@typescript-eslint/explicit-function-return-type': 'warn'
  }
}
```

### 12.2 类型检查 ✅

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

---

## 💡 快速参考

### 常用命令

```bash
# 基础构建
ldesign-builder build

# 指定格式
ldesign-builder build -f esm,cjs,dts

# 监听模式
ldesign-builder build --watch

# 生产构建
ldesign-builder build --mode production --minify

# 分析报告
ldesign-builder build --analyze --report

# 体积限制
ldesign-builder build --size-limit 200k
```

### 常用配置

```typescript
// 最小配置
export default defineConfig({
  input: 'src/index.ts'
})

// 完整配置
export default defineConfig({
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: ['esm', 'cjs'],
    sourcemap: true,
    preserveModules: true
  },
  bundler: 'rollup',
  minify: true,
  treeshake: true,
  external: ['vue', 'react'],
  cache: { enabled: true },
  parallel: true
})
```

---

## 📚 参考资料

- [官方文档](https://github.com/ldesign/builder)
- [API 文档](https://ldesign.dev/builder/api)
- [示例项目](https://github.com/ldesign/builder/tree/main/examples)
- [常见问题](https://github.com/ldesign/builder/issues)

---

**持续更新中...**

有任何问题或建议，欢迎提交 Issue 或 PR！
