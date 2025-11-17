# ✅ tools/builder 重构检查清单

> **使用说明**: 按顺序执行每个阶段的任务，完成后打勾 ✅

---

## 📋 第一阶段：快速清理（1 周）

### 删除未使用的目录

- [ ] 删除 `src/ai/` 目录
  ```bash
  rm -rf src/ai/
  git add -A
  git commit -m "refactor: remove unused AI optimizer"
  ```

- [ ] 删除 `src/cdn/` 目录
  ```bash
  rm -rf src/cdn/
  git add -A
  git commit -m "refactor: remove unused CDN optimizer"
  ```

- [ ] 删除 `src/ci/` 目录
  ```bash
  rm -rf src/ci/
  git add -A
  git commit -m "refactor: remove unused CI integration"
  ```

- [ ] 删除 `src/plugin-market/` 目录
  ```bash
  rm -rf src/plugin-market/
  git add -A
  git commit -m "refactor: remove unimplemented plugin market"
  ```

- [ ] 删除 `src/runtimes/` 目录
  ```bash
  rm -rf src/runtimes/
  git add -A
  git commit -m "refactor: remove runtime support"
  ```

- [ ] 删除 `src/debugger/` 目录
  ```bash
  rm -rf src/debugger/
  git add -A
  git commit -m "refactor: remove unused debugger"
  ```

- [ ] 删除重复的可视化目录
  ```bash
  rm -rf src/visualize/
  rm -rf src/visualizer/
  # 保留 src/visualizers/
  git add -A
  git commit -m "refactor: remove duplicate visualization directories"
  ```

- [ ] 删除重复的监控目录
  ```bash
  rm -rf src/monitor/
  rm -rf src/monitoring/
  # 保留 core/PerformanceMonitor.ts
  git add -A
  git commit -m "refactor: remove duplicate monitoring directories"
  ```

### 清理测试代码

- [ ] 移动测试代码到正确位置
  ```bash
  # 确保所有测试在 __tests__/ 或 tests/ 外部
  # 检查 src/ 下是否有测试文件
  find src -name "*.test.ts" -o -name "*.spec.ts"
  ```

### 清理未使用的依赖

- [ ] 运行 depcheck
  ```bash
  npx depcheck
  ```

- [ ] 删除未使用的依赖
  ```bash
  # 根据 depcheck 结果删除
  pnpm remove <unused-package>
  ```

### 验证

- [ ] 运行构建
  ```bash
  pnpm build
  ```

- [ ] 运行测试
  ```bash
  pnpm test
  ```

- [ ] 检查打包体积
  ```bash
  du -sh dist/
  ```

- [ ] 提交 PR
  ```bash
  git push origin refactor/phase-1-cleanup
  # 创建 PR: "refactor: Phase 1 - Remove unused features"
  ```

---

## 📋 第二阶段：合并重复功能（2-3 周）

### 2.1 统一缓存系统

- [ ] 创建 `src/cache/UnifiedCacheManager.ts`
- [ ] 实现统一的缓存接口
- [ ] 迁移现有缓存功能
- [ ] 删除 `utils/cache-manager.ts`
- [ ] 删除 `utils/build-cache-manager.ts`
- [ ] 删除 `core/builder/BuildCache.ts`
- [ ] 删除 `cache/DistributedCache.ts`
- [ ] 更新所有引用
- [ ] 运行测试验证
- [ ] 提交: `refactor: unify cache system`

### 2.2 统一内存管理

- [ ] 创建 `src/memory/MemoryManager.ts`
- [ ] 合并 `memory-manager.ts` 功能
- [ ] 合并 `memory-optimizer.ts` (utils) 功能
- [ ] 删除 `optimizers/memory-optimizer.ts`
- [ ] 整合 `memory-leak-detector.ts`
- [ ] 更新所有引用
- [ ] 运行测试验证
- [ ] 提交: `refactor: unify memory management`

### 2.3 统一配置系统

- [ ] 创建 `src/config/ConfigSystem.ts`
- [ ] 实现统一的配置接口
- [ ] 合并 `config-normalizer.ts` 功能
- [ ] 合并 `schema-validator.ts` 功能
- [ ] 删除 `config/simple-config.ts`
- [ ] 删除 `config/enhanced-config.ts`
- [ ] 合并 `utils/config.ts` 工具函数
- [ ] 整合 `config-linter.ts`
- [ ] 更新所有引用
- [ ] 运行测试验证
- [ ] 提交: `refactor: unify config system`

### 2.4 合并性能工具

- [ ] 创建 `src/performance/` 目录
- [ ] 合并 `performance.ts`
- [ ] 合并 `performance-utils.ts`
- [ ] 合并 `performance-optimizer.ts`
- [ ] 保留 `build-performance-analyzer.ts`
- [ ] 更新所有引用
- [ ] 运行测试验证
- [ ] 提交: `refactor: merge performance utilities`

### 2.5 合并并行处理

- [ ] 创建 `src/parallel/ParallelExecutor.ts`
- [ ] 合并 `parallel-processor.ts` 功能
- [ ] 合并 `parallel-executor.ts` 功能
- [ ] 合并 `ParallelBuildManager.ts` 功能
- [ ] 删除重复文件
- [ ] 更新所有引用
- [ ] 运行测试验证
- [ ] 提交: `refactor: unify parallel processing`

### 2.6 合并输出处理

- [ ] 创建 `src/output/OutputNormalizer.ts`
- [ ] 合并 `output-normalizer.ts` 功能
- [ ] 合并 `OutputConfigNormalizer.ts` 功能
- [ ] 合并 `OutputConfigMerger.ts` 功能
- [ ] 删除重复文件
- [ ] 更新所有引用
- [ ] 运行测试验证
- [ ] 提交: `refactor: unify output processing`

### 2.7 合并依赖分析

- [ ] 创建 `src/analyzers/DependencyAnalyzer.ts`
- [ ] 合并 `utils/dependency-analyzer.ts` 功能
- [ ] 合并 `core/builder/DependencyAnalyzer.ts` 功能
- [ ] 删除重复文件
- [ ] 更新所有引用
- [ ] 运行测试验证
- [ ] 提交: `refactor: unify dependency analysis`

### 验证第二阶段

- [ ] 运行完整测试套件
- [ ] 验证 API 兼容性
- [ ] 性能基准测试
- [ ] 构建所有示例项目
- [ ] 提交 PR: "refactor: Phase 2 - Merge duplicate features"

---

## 📋 第三阶段：重构核心模块（3-4 周）

### 3.1 重构 RollupAdapter

- [ ] 创建 `adapters/rollup/ConfigBuilder.ts`
- [ ] 创建 `adapters/rollup/PluginResolver.ts`
- [ ] 创建 `adapters/rollup/OutputGenerator.ts`
- [ ] 拆分 `RollupAdapter.ts` 功能到新模块
- [ ] 简化 `RollupAdapter.ts` 到 ~500 行
- [ ] 删除 `EnhancedRollupAdapter.ts`
- [ ] 更新所有引用
- [ ] 运行测试验证
- [ ] 提交: `refactor: split RollupAdapter into modules`

### 3.2 合并验证器

- [ ] 合并 `EnhancedPostBuildValidator` 到 `PostBuildValidator`
- [ ] 删除 `EnhancedPostBuildValidator.ts`
- [ ] 更新所有引用
- [ ] 运行测试验证
- [ ] 提交: `refactor: merge post-build validators`

### 3.3 优化 LibraryBuilder

- [ ] 提取配置处理到 ConfigManager
- [ ] 提取插件管理到 PluginManager
- [ ] 提取性能监控到 PerformanceMonitor
- [ ] 简化主类到 ~500 行
- [ ] 运行测试验证
- [ ] 提交: `refactor: optimize LibraryBuilder`

### 3.4 优化 LibraryDetector

- [ ] 提取框架检测规则到配置文件
- [ ] 使用策略模式替代 if-else
- [ ] 简化到 ~400 行
- [ ] 运行测试验证
- [ ] 提交: `refactor: optimize LibraryDetector`

### 验证第三阶段

- [ ] 完整的集成测试
- [ ] 所有框架的构建测试
- [ ] 性能回归测试
- [ ] 用户验收测试
- [ ] 提交 PR: "refactor: Phase 3 - Refactor core modules"

---

## 📋 第四阶段：优化和完善（2 周）

### 4.1 简化导出系统

- [ ] 创建 `src/advanced.ts` (高级 API)
- [ ] 创建 `src/plugins.ts` (插件 API)
- [ ] 简化 `src/index.ts` (核心 API)
- [ ] 更新文档
- [ ] 验证 Tree-shaking
- [ ] 提交: `refactor: simplify export system`

### 4.2 优化类型系统

- [ ] 解决类型冲突
- [ ] 统一类型定义到 `types/`
- [ ] 删除重复类型
- [ ] 运行类型检查
- [ ] 提交: `refactor: optimize type system`

### 4.3 完善文档

- [ ] 更新 API 文档
- [ ] 添加迁移指南
- [ ] 添加使用示例
- [ ] 完善 JSDoc 注释
- [ ] 提交: `docs: update documentation`

### 验证第四阶段

- [ ] 类型检查通过
- [ ] 文档完整性检查
- [ ] Tree-shaking 效果验证
- [ ] 打包体积最终验证
- [ ] 提交 PR: "refactor: Phase 4 - Optimize and polish"

---

## 🎉 最终验证

- [ ] 所有测试通过
- [ ] 代码量减少 40-50%
- [ ] 文件数减少 45%
- [ ] 打包体积减少 40%
- [ ] 构建速度提升 20%
- [ ] 测试覆盖率 > 80%
- [ ] 零 TypeScript 错误
- [ ] 零 ESLint 错误
- [ ] 文档覆盖率 > 95%

---

**开始日期**: ___________  
**完成日期**: ___________  
**执行人**: ___________

