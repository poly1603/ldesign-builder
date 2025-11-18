# @ldesign/builder 重构行动计划

> 生成时间: 2025-11-17  
> 基于全面代码审查结果

---

## 📋 执行摘要

### 审查结果

经过全面的代码审查和自动化分析，发现 `@ldesign/builder` 包存在以下主要问题：

#### 🔴 严重问题（5 个）
1. **重复的导入解析逻辑** - 3 个文件中重复实现，~150 行重复代码
2. **重复的依赖检测逻辑** - 功能重叠且部分未实现
3. **重复的文件工具函数** - 应移到 `@ldesign/shared`
4. **未使用的导入** - RollupAdapter.ts 中存在未使用的导入
5. **过度使用 any 类型** - 多个核心类使用 any，失去类型安全

#### 🟡 中等问题（4 个）
6. **utils 目录结构混乱** - 30+ 个文件平铺，难以维护
7. **重复的并行处理器** - 2 个文件实现相同功能，~200 行重复
8. **重复的内存管理器** - 2 个文件功能重叠 ~40%
9. **日志系统分散** - logger.ts 和 logger/ 目录重复

#### 🟢 轻微问题（2 个）
10. **配置文件重复** - config.ts 和 config/ 目录重复
11. **未完成的功能实现** - dependency-analyzer.ts 中多个空实现

### 预期收益

| 指标 | 当前 | 目标 | 改进 |
|------|------|------|------|
| 代码总行数 | ~45,000 | ~35,000 | -22% |
| 重复代码 | ~15% | <5% | -67% |
| 类型覆盖率 | ~85% | >95% | +12% |
| 超大文件数 | 15+ | <5 | -67% |

---

## 🎯 重构计划

### 阶段 1: 快速修复（1 周）⚡

**目标**: 解决严重问题，快速见效

#### 任务 1.1: 删除未使用的导入 ⏱️ 0.5 天

**文件**: `src/adapters/rollup/RollupAdapter.ts`

**操作**:
```typescript
// 删除这两行
- import { execSync } from 'child_process'
- import { promises as fsPromises } from 'fs'
```

**验证**:
```bash
pnpm lint:fix
pnpm type-check
```

---

#### 任务 1.2: 创建统一的导入解析工具 ⏱️ 1 天

**新建文件**: `src/utils/import-parser.ts`

**实现**:
```typescript
export interface ImportInfo {
  source: string
  type: 'es6' | 'commonjs' | 'dynamic'
  specifiers: string[]
  isLocal: boolean
}

export async function parseImports(filePath: string): Promise<ImportInfo[]> {
  // 统一的导入解析逻辑
}
```

**迁移文件**:
- `src/utils/incremental-build-manager.ts`
- `src/optimizers/tree-shaking/tree-shaker.ts`
- `src/utils/dependency-analyzer.ts`

**验证**:
```bash
pnpm test utils/import-parser
pnpm test utils/incremental-build-manager
pnpm test optimizers/tree-shaking
```

---

#### 任务 1.3: 修复 any 类型问题 ⏱️ 1.5 天

**文件**:
- `src/core/LibraryBuilder.ts`
- `src/adapters/rollup/RollupAdapter.ts`

**操作**:

1. 定义明确的类型（`src/types/builder.ts`）:
```typescript
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
```

2. 替换 any 类型:
```typescript
// LibraryBuilder.ts
- protected currentStats: any = null
+ protected currentStats: BuildStats | null = null

- protected currentMetrics: any = null
+ protected currentMetrics: BuildMetrics | null = null

// RollupAdapter.ts
- private multiConfigs?: any[]
+ private multiConfigs?: RollupOptions[]

- const rollupConfig: any = {
+ const rollupConfig: RollupOptions = {
```

**验证**:
```bash
pnpm type-check
pnpm test
```

---

#### 任务 1.4: 删除重复的日志和配置文件 ⏱️ 0.5 天

**操作**:
```bash
# 删除重复文件
rm src/utils/logger.ts
rm src/utils/config.ts

# 更新导入
# 使用 logger/index.ts 和 config/index.ts
```

**验证**:
```bash
pnpm lint:fix
pnpm test
```

---

### 阶段 2: 结构优化（2 周）🏗️

**目标**: 重组目录结构，合并重复代码

#### 任务 2.1: 重组 utils 目录 ⏱️ 3 天

**新目录结构**:
```
utils/
├── cache/
├── parallel/
├── memory/
├── logger/
├── file-system/
├── config/
├── error-handler/
├── analysis/
├── build/
├── optimization/
└── misc/
```

**执行步骤**:
1. 创建新目录结构
2. 移动文件到对应目录
3. 更新所有导入路径
4. 运行测试验证

**脚本**:
```bash
# 创建目录
mkdir -p src/utils/{cache,parallel,memory,file-system,analysis,build,optimization,misc}

# 移动文件（示例）
mv src/utils/cache.ts src/utils/cache/Cache.ts
mv src/utils/build-cache-manager.ts src/utils/cache/BuildCache.ts
mv src/utils/parallel-executor.ts src/utils/parallel/
mv src/utils/parallel-processor.ts src/utils/parallel/
# ... 更多移动操作
```

---

#### 任务 2.2: 合并并行处理器 ⏱️ 2 天

**操作**:
1. 创建 `src/utils/parallel/ParallelExecutor.ts`
2. 合并 parallel-executor.ts 和 parallel-processor.ts 的功能
3. 添加超时、重试、进度回调等增强功能
4. 更新所有使用处
5. 删除旧文件

**验证**:
```bash
pnpm test utils/parallel
```

---

#### 任务 2.3: 合并内存管理器 ⏱️ 2 天

**操作**:
1. 创建 `src/utils/memory/` 目录结构
2. 合并 memory-manager.ts 和 memory-optimizer.ts
3. 重构为清晰的职责划分
4. 更新所有使用处

---

#### 任务 2.4: 完善依赖分析器 ⏱️ 2 天

**操作**:
1. 实现或删除空方法
2. 添加明确的错误提示
3. 更新文档

---

### 阶段 3: 超大文件拆分（2 周）📦

**目标**: 拆分 15+ 个超大文件

#### 优先级列表

| 文件 | 行数 | 优先级 | 预计时间 |
|------|------|--------|---------|
| RollupAdapter.ts | 1833 | 🔴 高 | 3 天 |
| Vue3Strategy.ts | 757 | 🔴 高 | 2 天 |
| LibraryBuilder.ts | 711 | 🔴 高 | 2.5 天 |
| tree-shaker.ts | 707 | 🟡 中 | 2 天 |
| LibraryDetector.ts | 704 | 🟡 中 | 2 天 |

**拆分策略**: 参考 CODE_REVIEW_REPORT.md 中的详细方案

---

### 阶段 4: 性能优化（1 周）🚀

**目标**: 提升构建性能和内存效率

#### 任务列表

1. **实现多级缓存** ⏱️ 2 天
2. **优化懒加载** ⏱️ 1.5 天
3. **优化并行构建** ⏱️ 2 天
4. **优化内存管理** ⏱️ 1.5 天

---

### 阶段 5: 质量提升（1 周）✨

**目标**: 完善测试、文档和类型定义

#### 任务列表

1. **完善类型定义** ⏱️ 2 天
2. **添加 JSDoc 注释** ⏱️ 3 天
3. **提升测试覆盖率** ⏱️ 2 天

---

## 📅 时间表

| 阶段 | 时间 | 主要任务 |
|------|------|---------|
| 阶段 1 | 第 1 周 | 快速修复严重问题 |
| 阶段 2 | 第 2-3 周 | 结构优化和代码合并 |
| 阶段 3 | 第 4-5 周 | 拆分超大文件 |
| 阶段 4 | 第 6 周 | 性能优化 |
| 阶段 5 | 第 7 周 | 质量提升 |
| **总计** | **7 周** | **完整重构** |

---

## ✅ 验收标准

### 代码质量

- [ ] 所有文件 <500 行
- [ ] 重复代码率 <5%
- [ ] 类型覆盖率 >95%
- [ ] 无 ESLint 错误
- [ ] 无 TypeScript 错误

### 性能指标

- [ ] 构建速度提升 >30%
- [ ] 启动时间 <1s
- [ ] 内存占用减少 >30%
- [ ] 缓存命中率 >60%

### 测试覆盖

- [ ] 单元测试覆盖率 >85%
- [ ] 集成测试完整
- [ ] 性能测试通过

### 文档完整性

- [ ] 所有导出函数有 JSDoc
- [ ] API 文档完整
- [ ] 迁移指南完整
- [ ] 示例代码完整

---

## 🚀 立即开始

### 第一步：清理未使用的导入

```bash
cd tools/builder
```

编辑 `src/adapters/rollup/RollupAdapter.ts`:
```typescript
// 删除第 23 行
- import { execSync } from 'child_process'

// 删除第 22 行
- import { promises as fsPromises } from 'fs'
```

运行验证:
```bash
pnpm lint:fix
pnpm type-check
```

### 第二步：创建导入解析工具

创建 `src/utils/import-parser.ts`，实现统一的导入解析逻辑。

### 第三步：修复 any 类型

定义明确的类型，替换所有 any 类型。

---

**准备好开始了吗？** 让我们从阶段 1 的任务 1.1 开始！


