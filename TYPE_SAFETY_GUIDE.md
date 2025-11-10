# 类型安全改进指南

> **版本**: v1.0.1  
> **日期**: 2025-11-03  
> **状态**: 🔄 进行中

---

## 📊 当前状态

### 问题概况
- ❌ **600+ 处 any 类型使用**
- ❌ 类型安全率约 60%
- ❌ 缺少严格的类型守卫
- ❌ 插件系统类型不完善

### 改进目标
- ✅ 类型安全率提升到 **90%+**
- ✅ 消除关键路径上的 any 使用
- ✅ 建立完善的类型体系
- ✅ 提供类型守卫和工具函数

---

## 🎯 改进策略

### 第一阶段：建立类型基础 ✅

#### 1. 创建严格类型系统
```typescript
// src/types/strict-types.ts
export type JSONValue = string | number | boolean | null | JSONValue[] | {...}
export type PlainObject<T = unknown> = Record<string, T>
export type TransformResult = { code: string; map?: SourceMap | null; ... }
```

**完成情况**:
- ✅ 创建 `strict-types.ts` (532 行)
- ✅ 定义 50+ 个通用类型
- ✅ 提供 13 个类型守卫函数

#### 2. 更新插件类型 ✅
```typescript
// 修复前
export type PluginBuilder<T> = (config: any) => Promise<T> | T

// 修复后  
export type PluginBuilder<T> = (config: PlainObject) => Promise<T> | T
```

**完成情况**:
- ✅ 更新 `plugin.ts` 中的 any 使用
- ✅ 添加 PluginOptions 类型
- ✅ 改进钩子函数类型定义

---

## 📁 待改进文件清单

### P0 - 核心文件（高优先级）

#### 1. src/adapters/rollup/RollupAdapter.ts
- **any 使用**: 80+ 处
- **重点区域**: 
  - 插件转换逻辑
  - 配置合并
  - 输出处理

```typescript
// 需要改进的示例
transform?: (code: string, id: string) => any | Promise<any>
// 改进为
transform?: (code: string, id: string) => TransformResult | Promise<TransformResult>
```

#### 2. src/types/adapter.ts
- **any 使用**: 30+ 处
- **重点区域**:
  - BundlerSpecificConfig
  - BundlerSpecificPlugin

```typescript
// 当前定义
export type BundlerSpecificConfig = any

// 改进为
export interface BundlerSpecificConfig {
  rollup?: RollupOptions
  rolldown?: RolldownOptions  
  esbuild?: ESBuildOptions
  swc?: SwcOptions
}
```

#### 3. src/utils/logger.ts
- **any 使用**: 10 处
- **重点区域**:
  - 日志参数类型
  - 格式化函数

```typescript
// 当前
log(...args: any[]): void

// 改进
log(...args: LogArgument[]): void

type LogArgument = string | number | boolean | Error | PlainObject
```

### P1 - 策略文件（中优先级）

#### 4. src/strategies/\*\*/\*.ts
- **any 使用**: 150+ 处（分布在多个文件）
- **模式**: 重复的插件构建逻辑

**改进方案**: 创建通用泛型基类
```typescript
export abstract class BaseStrategy<TOptions = PluginOptions> {
  protected abstract buildPlugins(
    config: BuilderConfig
  ): Promise<BuilderPlugin[]>
  
  protected abstract transformConfig(
    config: BuilderConfig
  ): Promise<TransformedConfig<TOptions>>
}
```

#### 5. src/core/BuildOrchestrator.ts
- **any 使用**: 10 处
- **重点区域**:
  - 构建结果处理
  - 事件数据

### P2 - 工具文件（低优先级）

#### 6. src/utils/\*.ts
- **any 使用**: 200+ 处（分散在多个文件）
- **策略**: 逐步迁移

---

## 🔧 改进模式

### 模式 1: 配置对象
```typescript
// ❌ 不好
function processConfig(config: any): void

// ✅ 好
function processConfig(config: PlainObject): void
function processConfig<T extends ConfigObject>(config: T): void
```

### 模式 2: 插件参数
```typescript
// ❌ 不好
function buildPlugin(opts: any): Plugin

// ✅ 好
function buildPlugin(opts: PluginOptions): Plugin
function buildPlugin<T extends PluginOptions>(opts: T): Plugin
```

### 模式 3: 转换结果
```typescript
// ❌ 不好
transform(code: string): any

// ✅ 好
transform(code: string): TransformResult
transform(code: string): Promise<TransformResult>
```

### 模式 4: 事件数据
```typescript
// ❌ 不好
emit(event: string, data: any): void

// ✅ 好
emit<T = unknown>(event: string, data: T): void
emit(event: BuilderEvent, data: EventData): void
```

### 模式 5: 类型守卫
```typescript
// ❌ 不好
if (typeof value === 'object') { ... }

// ✅ 好
import { isObject, isArray } from './strict-types'

if (isObject(value)) {
  // TypeScript 知道 value 是 PlainObject
}
```

---

## 📝 类型替换映射

| 原类型 | 新类型 | 使用场景 |
|--------|--------|----------|
| `any` | `unknown` | 不确定类型时 |
| `any` | `PlainObject` | 配置对象 |
| `any` | `JSONValue` | 可序列化数据 |
| `any` | `PluginOptions` | 插件选项 |
| `any` | `TransformResult` | 代码转换结果 |
| `any[]` | `T[]` | 已知元素类型的数组 |
| `any[]` | `unknown[]` | 不确定元素类型的数组 |
| `Record<string, any>` | `PlainObject` | 对象映射 |
| `Record<string, any>` | `PlainObject<T>` | 泛型对象映射 |

---

## 🚀 实施计划

### 第一周：核心类型 ✅
- [x] 创建 strict-types.ts
- [x] 更新 plugin.ts
- [x] 编写改进指南

### 第二周：适配器层
- [ ] 重构 RollupAdapter
- [ ] 定义 BundlerSpecificConfig
- [ ] 更新 adapter.ts 类型

### 第三周：策略层
- [ ] 创建 BaseStrategy 泛型基类
- [ ] 重构 Vue3Strategy
- [ ] 重构 ReactStrategy
- [ ] 重构 TypeScriptStrategy

### 第四周：工具层
- [ ] 更新 logger.ts
- [ ] 更新配置工具
- [ ] 更新错误处理

---

## 🧪 验证方法

### 1. TypeScript 严格模式
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

### 2. ESLint 规则
```json
// .eslintrc.json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn"
  }
}
```

### 3. 类型覆盖率
```bash
# 统计 any 使用
grep -r ": any" src/ | wc -l

# 目标：从 600+ 降至 < 50
```

---

## 💡 最佳实践

### 1. 优先使用 unknown
```typescript
// ❌ 避免
function parse(data: any): any

// ✅ 推荐
function parse(data: unknown): ParsedData {
  if (isObject(data)) {
    // 类型守卫后可安全使用
  }
}
```

### 2. 使用泛型
```typescript
// ❌ 避免
function transform(input: any): any

// ✅ 推荐
function transform<T, R>(input: T, transformer: (v: T) => R): R
```

### 3. 严格的返回类型
```typescript
// ❌ 避免
async function build(config) {
  // ...
}

// ✅ 推荐
async function build(config: BuilderConfig): Promise<BuildResult>
```

### 4. 类型导入
```typescript
// ❌ 避免
import { PlainObject } from './strict-types'
function foo(obj: PlainObject): any

// ✅ 推荐
import type { PlainObject, TransformResult } from './strict-types'
function foo(obj: PlainObject): TransformResult
```

---

## 📈 进度跟踪

### 整体进度: 10%

| 模块 | any 数量 | 已修复 | 进度 |
|------|----------|--------|------|
| types/ | 50 | 15 | 30% ✅ |
| adapters/ | 150 | 0 | 0% |
| strategies/ | 200 | 0 | 0% |
| core/ | 100 | 0 | 0% |
| utils/ | 100 | 0 | 0% |
| **总计** | **600** | **15** | **2.5%** |

---

## 🎓 学习资源

### TypeScript 官方文档
- [Type Guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [Generic Types](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

### 推荐阅读
- 《Effective TypeScript》
- 《TypeScript Deep Dive》
- TypeScript FAQ

---

## 🤝 贡献指南

### 提交改进 PR

1. **选择文件**: 从待改进清单中选择
2. **创建分支**: `git checkout -b fix/type-safety-xxx`
3. **进行改进**: 遵循改进模式
4. **运行检查**: `npm run type-check`
5. **提交 PR**: 包含改进说明

### PR 模板
```markdown
## 类型安全改进

**文件**: src/xxx/yyy.ts  
**any 使用**: 10 处 → 0 处  

### 改进内容
- 将 config: any 改为 config: PlainObject
- 添加返回类型注解
- 使用类型守卫

### 测试
- [x] 通过 type-check
- [x] 通过单元测试
- [x] 无破坏性变更
```

---

## 📚 相关文档

- [strict-types.ts](./src/types/strict-types.ts) - 严格类型定义
- [IMPROVEMENT_SUMMARY.md](./IMPROVEMENT_SUMMARY.md) - 改进总结
- [OPTIMIZATION_REPORT.md](./OPTIMIZATION_REPORT.md) - 性能优化报告

---

**最后更新**: 2025-11-03  
**维护者**: LDesign Team  
**状态**: 🔄 持续改进中
