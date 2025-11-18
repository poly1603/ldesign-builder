# tools/builder 重构剩余待办

> 本文件聚焦 **后续要做什么**，不再重复已完成的 20+ 批次删除/合并工作。

---

## 一、当前状态简要结论

- ✅ 第一阶段「删除未使用代码 / 合并重复实现」基本完成
- ✅ 缓存系统已收敛为两套：**BuildCacheManager（构建缓存） + RollupCache（Rollup 专用缓存）**
- ✅ 构建（`pnpm build`）通过，产物完整
- ⚠️ 测试整体可跑，但存在一批 **既有失败用例**，与本轮重构无直接关系

---

## 二、P0 优先级：保证基础稳定性

> 目标：让「核心流程 + 测试信号」尽量干净，方便后续继续大规模重构。

- [ ] **梳理并修复现有失败测试（不涉及新功能设计）**
  - `mixed-framework.test.ts` 中 `PluginOrchestrator` 相关用例
    - 任务：确认实际期望行为（插件冲突/条件插件），修正实现或更新断言
  - `adapters/esbuild.test.ts` / `adapters/swc.test.ts` 的 `getFeatureSupport`
    - 任务：对齐「适配器实际支持能力」与「测试期望」
  - `cli/commands/examples.test.ts`
    - 任务：按当前 `examples/` 目录真实结构重写期望，不再假设只有 `project1`
  - `integration/build-flow.test.ts`
    - 任务：更新对 `builder.bundlerAdapter` 的 mock 方式，适配当前 `UnifiedBundlerAdapter` / 工厂逻辑
  - `adapters/rollup/transform-config.test.ts`
    - 任务：确认 UMD 输出文件命名（`dist/index.js` vs `dist/index.min.js`）的真实约定，并同步实现或断言

- [ ] **重新统计代码规模并校准文档中的数字**
  - 使用统一脚本统计：TS 文件数、总行数、体积（含/不含测试）
  - 更新 `REFACTORING_PROGRESS.md` 中的统计表，使其与当前仓库状态一致

---

## 三、P1 优先级：子系统统一与简化

> 目标：把「功能相同但分散/重复」的模块统一起来，减小心智负担。

### 1. 内存 & 性能子系统

- [ ] 统一内存相关实现
  - 主要文件：`utils/memory-manager.ts`、`utils/memory-optimizer.ts`、`utils/memory-leak-detector.ts`
  - 任务：
    - 明确三者的职责边界（管理 / 优化 / 检测）
    - 尽量收敛为一个核心入口 + 若干内部工具，避免角色重叠
    - 检查对外导出是否需要全部暴露

- [ ] 梳理性能相关工具
  - 主要文件：`utils/build-performance-analyzer.ts`、`utils/performance-utils.ts`
  - 任务：
    - 确认哪些是「构建内部自用」，哪些需要对外暴露
    - 避免与 `PerformanceMonitor` 产生职责重复

- [ ] 梳理并行执行工具
  - 主要文件：`utils/parallel-executor.ts`、`utils/parallel-processor.ts`
  - 任务：
    - 定义「推荐使用哪一个」作为统一并行入口
    - 合并/删除语义重叠的工具函数

### 2. 配置系统

- [ ] 收敛配置相关模块
  - 主要文件：
    - `config/config-normalizer.ts`
    - `config/simple-config.ts`
    - `config/minimal-config.ts`
    - `config/schema-validator.ts`
    - `config/zod-schema.ts`
    - `utils/config.ts`
    - `utils/config/config-loader.ts`
  - 任务：
    - 明确「官方推荐的配置加载流程」（ConfigLoader → Schema 校验 → Normalizer）
    - 评估 `simple-config.ts` / `minimal-config.ts` 是否可以合并为一套「预设生成器」
    - 减少重复的类型定义和工具函数，对外只暴露一条清晰 API

### 3. 日志 & 错误处理

- [ ] 审查 `utils/logger/*` 与 `utils/error-handler/*` 导出
  - 任务：
    - 确认对外 API：哪些是给业务方用的，哪些仅供内部
    - 保证 `src/index.ts` 导出的是一组稳定、可长期维护的接口

---

## 四、P2 优先级：拆分特大文件（结构重构）

> 目标：将超大文件拆解为职责单一的模块，提升可维护性。

- [ ] 拆分 `src/adapters/rollup/RollupAdapter.ts`
  - 建议拆分维度：
    - 配置转换（input/output/options）
    - 插件组装（与 `RollupPluginManager`、`RollupConfigBuilder` 协作）
    - 日志 / 诊断 / banner 相关逻辑

- [ ] 拆分 `src/core/LibraryBuilder.ts`
  - 任务建议：
    - 把「构建流程编排」与「状态管理 / 事件」分离
    - 将与 Bundler 选择、策略选择（strategy）相关的逻辑下沉到更合适的模块

- [ ] 拆分 `src/core/MonorepoBuilder.ts`
  - 任务建议：
    - 单独抽出「包发现 / 依赖顺序解析」模块
    - 将每个 package 的构建流程复用 LibraryBuilder，而不是在 MonorepoBuilder 内部写复杂分支

- [ ] 拆分 `src/core/StrategyManager.ts`、`src/core/LibraryDetector.ts`
  - 任务建议：
    - 根据「框架检测」、「策略选择」、「策略组合」几个维度拆文件
    - 保持对外 API 不变，仅内部重组

- [ ] 拆分 `src/optimizers/tree-shaking/tree-shaker.ts`
  - 任务建议：
    - 将规则集合（白名单/黑名单/特殊处理）与执行逻辑分离
    - 为后续增加规则集预留扩展点

---

## 五、P3 优先级：API 规范化 & 文档/发布

> 目标：把这次大规模收缩后的「新世界」写清楚，方便团队和使用者。

- [ ] 审核 `src/index.ts` / `src/utils/index.ts` 的对外导出
  - 标记/移除不再推荐的实验性导出
  - 为必要但「危险」的高级 API 补充注释（中文说明 + 示例）

- [ ] 编写/更新架构说明
  - 更新已有的 `ARCHITECTURE_ANALYSIS_REPORT.md` / `REFACTORING_ROADMAP.md`（如存在
  - 补充：
    - 缓存体系最终形态
    - 配置加载/校验流程
    - 适配器与策略的分层关系

- [ ] 编写迁移说明 & 更新版本
  - 说明已移除的 API：如 `MultilayerCache`、`DistributedCache`、`EnhancedRollupAdapter` 等
  - 给出从旧 API 迁移到新 API 的示例
  - 根据团队策略决定是否需要 minor/major version bump

---

> 说明：以上待办按照「先稳定基础 → 再统一子系统 → 最后重构结构」排序，你可以按实际人力和风险从 P0 开始逐步推进。
