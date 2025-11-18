# @ldesign/builder 详细问题清单

> 生成时间: 2025-11-17  
> 基于代码审查和自动化分析

---

## 🔴 严重问题（立即修复）

### 1. 重复的导入解析逻辑

**位置**:
- `src/utils/incremental-build-manager.ts` (468-498 行)
- `src/optimizers/tree-shaking/tree-shaker.ts` (293-315 行)
- `src/utils/dependency-analyzer.ts` (302-311 行)

**问题描述**:
三个文件中都实现了相同的导入语句解析逻辑：
- ES6 import 解析: `/import\s+(?:[\w\s{},*]+\s+from\s+)?['"]([^'"]+)['"]/g`
- CommonJS require 解析: `/require\s*\(['"]([^'"]+)['"]\)/g`
- 动态 import 解析: `/import\s*\(['"]([^'"]+)['"]\)/g`

**影响**:
- 代码重复 ~150 行
- 维护成本高（修改需要同步 3 处）
- 可能导致行为不一致

**重构方案**:

创建统一的导入解析工具函数：

```typescript
// utils/import-parser.ts
export interface ImportInfo {
  source: string
  type: 'es6' | 'commonjs' | 'dynamic'
  specifiers: string[]
  isLocal: boolean
}

/**
 * 解析文件中的所有导入语句
 */
export async function parseImports(filePath: string): Promise<ImportInfo[]> {
  const content = await fs.readFile(filePath, 'utf-8')
  const imports: ImportInfo[] = []
  
  // ES6 import
  const importRegex = /import\s+(?:[\w\s{},*]+\s+from\s+)?['"]([^'"]+)['"]/g
  let match
  while ((match = importRegex.exec(content)) !== null) {
    imports.push({
      source: match[1],
      type: 'es6',
      specifiers: extractSpecifiers(match[0]),
      isLocal: isLocalImport(match[1])
    })
  }
  
  // CommonJS require
  const requireRegex = /require\s*\(['"]([^'"]+)['"]\)/g
  while ((match = requireRegex.exec(content)) !== null) {
    imports.push({
      source: match[1],
      type: 'commonjs',
      specifiers: [],
      isLocal: isLocalImport(match[1])
    })
  }
  
  // 动态 import
  const dynamicImportRegex = /import\s*\(['"]([^'"]+)['"]\)/g
  while ((match = dynamicImportRegex.exec(content)) !== null) {
    imports.push({
      source: match[1],
      type: 'dynamic',
      specifiers: [],
      isLocal: isLocalImport(match[1])
    })
  }
  
  return imports
}
```

**预期收益**:
- 减少代码 ~120 行
- 统一的导入解析逻辑
- 更容易扩展（如支持 TypeScript import type）

---

### 2. 重复的依赖检测逻辑

**位置**:
- `src/utils/dependency-analyzer.ts` (135-195 行)
- `src/adapters/rollup/RollupAdapter.ts` (1087-1115 行)

**问题描述**:
两个文件都实现了依赖检测和分析功能：
- 检测未使用的依赖
- 检测循环依赖
- 检测重复依赖
- 检测过期依赖

但是 `dependency-analyzer.ts` 中的部分方法是空实现（返回空数组）：

```typescript
// dependency-analyzer.ts
private async detectDuplicateDependencies(_rootDir: string): Promise<Array<{...}>> {
  // 实现重复依赖检测逻辑
  return []  // ❌ 空实现
}

private async detectOutdatedDependencies(_dependencies: DependencyInfo[]): Promise<Array<{...}>> {
  // 实现过期依赖检测逻辑
  return []  // ❌ 空实现
}

private async checkSecurityVulnerabilities(_dependencies: DependencyInfo[]): Promise<VulnerabilityInfo[]> {
  // 实现安全漏洞检查逻辑
  return []  // ❌ 空实现
}
```

**影响**:
- 功能不完整，误导用户
- 代码重复
- API 设计不合理

**重构方案**:

**方案 A: 完善 dependency-analyzer.ts 实现（推荐）**
```typescript
// 实现完整的依赖分析功能
private async detectDuplicateDependencies(rootDir: string): Promise<Array<{...}>> {
  // 使用 npm ls 或 pnpm list 获取依赖树
  const { execSync } = await import('child_process')
  const output = execSync('pnpm list --json --depth=Infinity', {
    cwd: rootDir,
    encoding: 'utf-8'
  })
  
  const tree = JSON.parse(output)
  return this.findDuplicatesInTree(tree)
}
```

**方案 B: 删除空实现，标记为 TODO**
```typescript
private async detectDuplicateDependencies(_rootDir: string): Promise<Array<{...}>> {
  throw new Error('detectDuplicateDependencies is not implemented yet')
}
```

**预期收益**:
- 功能完整或明确标记未实现
- 避免误导用户
- 减少维护负担

---

### 3. 重复的文件工具函数

**位置**:
- `tools/builder/src/utils/file-system.ts`
- `packages/icons/scripts/utils/file-utils.ts`

**问题描述**:
两个包中都实现了相同的文件工具函数：
- `ensureDir()` - 确保目录存在
- `writeFile()` - 写入文件
- `formatCode()` - 格式化代码

**影响**:
- 代码重复
- 不符合 DRY 原则
- 应该使用 `@ldesign/shared` 共享

**重构方案**:

将通用文件工具函数移到 `@ldesign/shared`:

```typescript
// packages/shared/src/utils/file.ts
export { ensureDir, writeFile, formatCode } from './file-utils'

// tools/builder/src/utils/file-system.ts
import { ensureDir, writeFile } from '@ldesign/shared'
export { ensureDir, writeFile }

// packages/icons/scripts/utils/file-utils.ts
import { ensureDir, writeFile, formatCode } from '@ldesign/shared'
export { ensureDir, writeFile, formatCode }
```

**预期收益**:
- 减少代码重复
- 统一的文件操作 API
- 更好的代码复用

---

### 4. 未使用的导入

**位置**: `src/adapters/rollup/RollupAdapter.ts`

**问题描述**:

```typescript
import { execSync } from 'child_process'  // ❌ 未使用
import { promises as fsPromises } from 'fs'  // ❌ 未使用
```

通过代码分析，这两个导入在文件中从未被使用。

**重构方案**:

删除未使用的导入：

```typescript
// 删除这两行
- import { execSync } from 'child_process'
- import { promises as fsPromises } from 'fs'
```

**预期收益**:
- 减少打包体积
- 提高代码可读性
- 符合 ESLint 规范

---

### 5. 过度使用 any 类型

**位置**: 多个文件

**问题描述**:

```typescript
// LibraryBuilder.ts
protected currentStats: any = null  // ❌ 使用 any
protected currentMetrics: any = null  // ❌ 使用 any

// RollupAdapter.ts
private multiConfigs?: any[]  // ❌ 使用 any
const rollupConfig: any = {  // ❌ 使用 any
```

**影响**:
- 失去类型安全
- 难以发现潜在错误
- 降低代码质量

**重构方案**:

定义明确的类型：

```typescript
// types/builder.ts
export interface BuildStats {
  startTime: number
  endTime: number
  duration: number
  files: number
  size: number
}

export interface BuildMetrics {
  memory: MemoryMetrics
  cpu: CPUMetrics
  io: IOMetrics
}

// LibraryBuilder.ts
protected currentStats: BuildStats | null = null
protected currentMetrics: BuildMetrics | null = null

// RollupAdapter.ts
import type { RollupOptions } from 'rollup'
private multiConfigs?: RollupOptions[]
const rollupConfig: RollupOptions = {
```

**预期收益**:
- 类型安全
- 更好的 IDE 支持
- 减少运行时错误

---

## 🟡 中等问题（建议优化）

### 6. utils 目录结构混乱

**当前结构**:
```
utils/
├── banner-generator.ts
├── build-cache-manager.ts
├── build-performance-analyzer.ts
├── build-report-generator.ts
├── bundle-analyzer.ts
├── cache.ts
├── config/
├── config-linter.ts
├── config.ts
├── dependency-analyzer.ts
├── error-handler/
├── factory.ts
├── file-system.ts
├── format-utils.ts
├── glob.ts
├── incremental-build-manager.ts
├── index.ts
├── logger/
├── logger.ts
├── memory-leak-detector.ts
├── memory-manager.ts
├── memory-optimizer.ts
├── minify-processor.ts
├── output-normalizer.ts
├── package-updater.ts
├── parallel-executor.ts
├── parallel-processor.ts
├── path-utils.ts
├── performance-utils.ts
├── smart-watcher.ts
└── typescript-silent-plugin.ts
```

**问题**:
- 30+ 个文件平铺在一个目录
- 职责不清晰
- 难以查找和维护
- 存在重复功能（logger.ts 和 logger/）

**重构方案**:

按功能分类重组：

```
utils/
├── cache/                      # 缓存相关
│   ├── Cache.ts               # 基础缓存
│   ├── BuildCache.ts          # 构建缓存
│   └── index.ts
├── parallel/                   # 并行处理
│   ├── ParallelExecutor.ts    # 合并 parallel-executor 和 parallel-processor
│   └── index.ts
├── memory/                     # 内存管理
│   ├── MemoryManager.ts       # 合并 memory-manager 和 memory-optimizer
│   ├── MemoryLeakDetector.ts
│   └── index.ts
├── logger/                     # 日志系统（已存在）
│   ├── Logger.ts
│   ├── formatters.ts
│   └── index.ts
├── file-system/                # 文件系统
│   ├── glob.ts
│   ├── file-utils.ts
│   └── index.ts
├── config/                     # 配置相关（已存在）
│   ├── config-loader.ts
│   ├── config-linter.ts
│   └── index.ts
├── error-handler/              # 错误处理（已存在）
│   ├── BuilderError.ts
│   ├── ErrorHandler.ts
│   ├── recovery.ts
│   └── index.ts
├── analysis/                   # 分析工具
│   ├── DependencyAnalyzer.ts
│   ├── BundleAnalyzer.ts
│   ├── PerformanceAnalyzer.ts
│   └── index.ts
├── build/                      # 构建相关
│   ├── IncrementalBuildManager.ts
│   ├── BuildReportGenerator.ts
│   └── index.ts
├── optimization/               # 优化工具
│   ├── MinifyProcessor.ts
│   ├── OutputNormalizer.ts
│   └── index.ts
└── misc/                       # 其他工具
    ├── banner-generator.ts
    ├── package-updater.ts
    ├── smart-watcher.ts
    ├── typescript-silent-plugin.ts
    ├── path-utils.ts
    ├── format-utils.ts
    └── index.ts
```

**迁移步骤**:

1. 创建新的目录结构
2. 移动文件到对应目录
3. 更新所有导入路径
4. 删除旧的 `logger.ts` 和 `config.ts`（使用目录版本）
5. 运行测试确保功能正常

**预期收益**:
- 更清晰的代码组织
- 易于查找和维护
- 减少认知负担
- 更好的模块化

---

### 7. 重复的并行处理器

**位置**:
- `src/utils/parallel-executor.ts` (287 行)
- `src/utils/parallel-processor.ts` (245 行)

**问题描述**:

两个文件实现了几乎相同的并行任务执行功能：

**parallel-executor.ts**:
```typescript
export class ParallelExecutor<T, R> {
  async execute(tasks: T[], handler: (task: T) => Promise<R>): Promise<R[]> {
    const concurrency = this.options.concurrency || os.cpus().length
    const results: R[] = []
    const executing: Promise<void>[] = []

    for (const task of tasks) {
      const promise = handler(task).then(result => {
        results.push(result)
      })
      executing.push(promise)

      if (executing.length >= concurrency) {
        await Promise.race(executing)
      }
    }

    await Promise.all(executing)
    return results
  }
}
```

**parallel-processor.ts**:
```typescript
export class ParallelProcessor<T, R> {
  async process(items: T[], processor: (item: T) => Promise<R>): Promise<R[]> {
    const maxConcurrency = this.options.maxConcurrency || os.cpus().length
    const results: R[] = []
    const queue: Promise<void>[] = []

    for (const item of items) {
      const task = processor(item).then(result => {
        results.push(result)
      })
      queue.push(task)

      if (queue.length >= maxConcurrency) {
        await Promise.race(queue)
      }
    }

    await Promise.all(queue)
    return results
  }
}
```

**影响**:
- 代码重复 ~80%
- 功能几乎完全相同
- 用户困惑：不知道使用哪个

**重构方案**:

合并为统一的并行执行器：

```typescript
// utils/parallel/ParallelExecutor.ts
export interface ParallelExecutorOptions {
  concurrency?: number
  timeout?: number
  retries?: number
  onProgress?: (completed: number, total: number) => void
  onError?: (error: Error, task: any) => void
}

/**
 * 并行任务执行器
 *
 * 支持并发控制、超时、重试、进度回调等功能
 */
export class ParallelExecutor<T, R> {
  constructor(private options: ParallelExecutorOptions = {}) {}

  /**
   * 执行并行任务
   */
  async execute(tasks: T[], handler: (task: T) => Promise<R>): Promise<R[]> {
    const concurrency = this.options.concurrency || os.cpus().length
    const results: R[] = new Array(tasks.length)
    const executing: Map<number, Promise<void>> = new Map()
    let completed = 0

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i]

      // 创建任务 Promise
      const promise = this.executeTask(task, handler, i)
        .then(result => {
          results[i] = result
          completed++
          this.options.onProgress?.(completed, tasks.length)
        })
        .catch(error => {
          this.options.onError?.(error, task)
          throw error
        })
        .finally(() => {
          executing.delete(i)
        })

      executing.set(i, promise)

      // 控制并发数
      if (executing.size >= concurrency) {
        await Promise.race(executing.values())
      }
    }

    // 等待所有任务完成
    await Promise.all(executing.values())
    return results
  }

  /**
   * 执行单个任务（支持超时和重试）
   */
  private async executeTask(
    task: T,
    handler: (task: T) => Promise<R>,
    index: number
  ): Promise<R> {
    const { timeout, retries = 0 } = this.options
    let lastError: Error | undefined

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        if (timeout) {
          return await this.withTimeout(handler(task), timeout)
        }
        return await handler(task)
      } catch (error) {
        lastError = error as Error
        if (attempt < retries) {
          // 重试前等待一段时间（指数退避）
          await this.delay(Math.pow(2, attempt) * 100)
        }
      }
    }

    throw lastError
  }

  /**
   * 添加超时控制
   */
  private async withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Task timeout after ${ms}ms`)), ms)
      )
    ])
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

/**
 * 创建并行执行器
 */
export function createParallelExecutor<T, R>(
  options?: ParallelExecutorOptions
): ParallelExecutor<T, R> {
  return new ParallelExecutor<T, R>(options)
}
```

**使用示例**:

```typescript
// 基本使用
const executor = new ParallelExecutor({ concurrency: 4 })
const results = await executor.execute(files, async (file) => {
  return await processFile(file)
})

// 带进度回调
const executor = new ParallelExecutor({
  concurrency: 4,
  onProgress: (completed, total) => {
    console.log(`进度: ${completed}/${total}`)
  }
})

// 带超时和重试
const executor = new ParallelExecutor({
  concurrency: 4,
  timeout: 5000,
  retries: 3
})
```

**预期收益**:
- 减少代码 ~200 行
- 功能更强大（超时、重试、进度）
- 统一的 API
- 更好的错误处理

---

### 8. 重复的内存管理器

**位置**:
- `src/utils/memory-manager.ts` (627 行)
- `src/utils/memory-optimizer.ts` (312 行)

**问题描述**:

两个文件都实现了内存管理功能，部分功能重叠：

**memory-manager.ts**:
- 全局内存管理器
- 内存监控
- 垃圾回收触发
- 内存泄漏检测

**memory-optimizer.ts**:
- 内存优化
- 缓存清理
- 对象池管理

**影响**:
- 功能重叠 ~40%
- 职责不清晰
- 维护成本高

**重构方案**:

**方案 A: 合并为统一的内存管理系统（推荐）**

```
utils/memory/
├── MemoryManager.ts          # 核心内存管理器
├── MemoryMonitor.ts          # 内存监控
├── MemoryOptimizer.ts        # 内存优化策略
├── MemoryLeakDetector.ts     # 内存泄漏检测（已存在）
├── ObjectPool.ts             # 对象池
└── index.ts
```

**MemoryManager.ts**:
```typescript
/**
 * 全局内存管理器
 */
export class MemoryManager {
  private monitor: MemoryMonitor
  private optimizer: MemoryOptimizer
  private leakDetector: MemoryLeakDetector

  constructor(options: MemoryManagerOptions = {}) {
    this.monitor = new MemoryMonitor(options.monitor)
    this.optimizer = new MemoryOptimizer(options.optimizer)
    this.leakDetector = new MemoryLeakDetector(options.leakDetector)
  }

  /**
   * 启动内存管理
   */
  start(): void {
    this.monitor.start()
    this.optimizer.start()
    this.leakDetector.start()
  }

  /**
   * 停止内存管理
   */
  stop(): void {
    this.monitor.stop()
    this.optimizer.stop()
    this.leakDetector.stop()
  }

  /**
   * 获取内存使用情况
   */
  getMemoryUsage(): MemoryUsage {
    return this.monitor.getUsage()
  }

  /**
   * 触发内存优化
   */
  async optimize(): Promise<void> {
    await this.optimizer.optimize()
  }
}
```

**预期收益**:
- 减少代码 ~150 行
- 更清晰的职责划分
- 统一的内存管理 API

---

## 🟢 轻微问题（可选优化）

### 9. 日志系统分散

**位置**:
- `src/utils/logger.ts` (基础日志)
- `src/utils/logger/Logger.ts` (高级日志)
- `src/utils/logger/formatters.ts` (格式化器)

**问题描述**:

存在两个 logger 实现：
- `logger.ts` - 简单的日志类
- `logger/Logger.ts` - 完整的日志系统

**影响**:
- 用户困惑：不知道使用哪个
- 代码重复

**重构方案**:

删除 `logger.ts`，统一使用 `logger/` 目录下的实现：

```typescript
// 删除 src/utils/logger.ts

// 更新所有导入
- import { Logger } from './utils/logger'
+ import { Logger } from './utils/logger/Logger'

// 或者在 logger/index.ts 中导出
export { Logger } from './Logger'
export * from './formatters'
```

**预期收益**:
- 统一的日志系统
- 减少代码重复
- 更清晰的 API

---

### 10. 配置文件重复

**位置**:
- `src/utils/config.ts`
- `src/utils/config/` 目录

**问题描述**:

与日志系统类似，存在两个配置实现。

**重构方案**:

删除 `config.ts`，统一使用 `config/` 目录。

---

### 11. 未完成的功能实现

**位置**: `src/utils/dependency-analyzer.ts`

**问题描述**:

多个方法返回空数组或空实现：

```typescript
private async detectDuplicateDependencies(_rootDir: string): Promise<Array<{...}>> {
  // 实现重复依赖检测逻辑
  return []  // ❌ 未实现
}

private async detectOutdatedDependencies(_dependencies: DependencyInfo[]): Promise<Array<{...}>> {
  // 实现过期依赖检测逻辑
  return []  // ❌ 未实现
}

private async checkSecurityVulnerabilities(_dependencies: DependencyInfo[]): Promise<VulnerabilityInfo[]> {
  // 实现安全漏洞检查逻辑
  return []  // ❌ 未实现
}

private async analyzeUsage(_dependencyName: string, _rootDir: string): Promise<{...}> {
  // 这里实现代码扫描逻辑，查找 import/require 语句
  // 简化实现，实际应该扫描所有源文件
  return {
    usageCount: 1,  // ❌ 硬编码
    importPaths: []
  }
}
```

**影响**:
- 功能不完整
- 误导用户（API 存在但不工作）
- 降低代码质量

**重构方案**:

**方案 A: 完善实现**
- 实现所有功能
- 添加测试

**方案 B: 明确标记未实现**
```typescript
private async detectDuplicateDependencies(_rootDir: string): Promise<Array<{...}>> {
  throw new Error('detectDuplicateDependencies is not implemented yet. Please use a dedicated tool like npm-check-duplicates.')
}
```

**方案 C: 删除未实现的功能**
- 从 API 中移除
- 更新文档

**推荐**: 方案 B（明确标记），然后在后续版本中实现或删除。

---

## 📊 问题统计

### 按严重程度

| 严重程度 | 数量 | 占比 |
|---------|------|------|
| 🔴 严重 | 5 | 45% |
| 🟡 中等 | 4 | 36% |
| 🟢 轻微 | 2 | 18% |
| **总计** | **11** | **100%** |

### 按类型

| 类型 | 数量 |
|------|------|
| 代码重复 | 6 |
| 类型问题 | 1 |
| 结构问题 | 2 |
| 功能不完整 | 2 |

### 预期收益

| 指标 | 改进 |
|------|------|
| 代码减少 | ~1000 行 |
| 重复代码率 | -10% |
| 类型覆盖率 | +10% |
| 可维护性 | +40% |

---

## 🎯 优先级建议

### 立即修复（本周）

1. ✅ 删除未使用的导入 (#4)
2. ✅ 合并重复的导入解析逻辑 (#1)
3. ✅ 修复 any 类型问题 (#5)

### 短期优化（2 周内）

4. ✅ 合并并行处理器 (#7)
5. ✅ 重组 utils 目录 (#6)
6. ✅ 合并内存管理器 (#8)

### 中期优化（1 个月内）

7. ✅ 完善依赖检测逻辑 (#2)
8. ✅ 统一日志系统 (#9)
9. ✅ 统一配置系统 (#10)

### 长期优化（按需）

10. ✅ 移动文件工具到 shared (#3)
11. ✅ 完善或删除未实现功能 (#11)

---

**下一步**: 开始执行重构计划，从优先级最高的问题开始。


