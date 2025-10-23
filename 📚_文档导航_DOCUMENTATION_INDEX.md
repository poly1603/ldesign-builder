# 📚 @ldesign/builder 文档导航索引

## 🚀 快速开始

### 新用户必读
1. [README](./README.md) - 项目介绍和快速开始
2. [快速参考](./QUICK_REFERENCE.md) - 命令和 API 速查
3. [最佳实践](./docs/BEST_PRACTICES.md) - 推荐用法和技巧

### 5 分钟上手
```bash
# 1. 安装
pnpm add @ldesign/builder -D

# 2. 构建
npx ldesign-builder build

# 3. 极速开发
npx ldesign-builder build --bundler esbuild --watch
```

---

## 📖 核心文档

### 1. [API 文档](./docs/API.md) ⭐⭐⭐⭐⭐
**长度**: 847 行
**内容**:
- 完整 API 参考
- 所有类和方法
- 代码示例
- 类型定义

**适合**:
- 深度使用
- 编程式调用
- 插件开发

### 2. [最佳实践](./docs/BEST_PRACTICES.md) ⭐⭐⭐⭐⭐
**长度**: 615 行
**内容**:
- 打包器选择指南
- 性能优化建议
- 框架特定配置
- 故障排除方案

**适合**:
- 性能优化
- 生产部署
- 问题解决

### 3. [迁移指南](./docs/MIGRATION_GUIDE.md) ⭐⭐⭐⭐⭐
**长度**: 488 行
**内容**:
- v0.x 升级指南
- 从其他工具迁移
- 配置对比
- 常见问题

**适合**:
- 版本升级
- 工具迁移
- 配置更新

### 4. [快速参考](./QUICK_REFERENCE.md) ⭐⭐⭐⭐⭐
**长度**: 简洁
**内容**:
- 命令速查
- API 速查
- 配置速查
- 代码片段

**适合**:
- 日常查阅
- 快速查找
- 代码复制

---

## 📊 实施报告

### 主报告
1. [最终实施报告](./FINAL_IMPLEMENTATION_REPORT.md) ⭐⭐⭐⭐⭐
   - 完整的任务清单
   - 技术实现细节
   - 性能对比分析
   - 质量认证

2. [成果展示](./ACHIEVEMENT_SHOWCASE.md) ⭐⭐⭐⭐⭐
   - 核心成就
   - 创新亮点
   - 对标竞品
   - 用户价值

3. [执行摘要](./⚡_执行摘要_EXECUTIVE_SUMMARY.md) ⭐⭐⭐⭐⭐
   - 项目概览
   - 核心成果
   - 商业价值
   - 推荐指数

### 详细报告
4. [实施进度](./IMPLEMENTATION_PROGRESS.md)
   - P0/P1/P2/P3 任务详情
   - 进度追踪
   - 技术栈说明

5. [会话总结](./SESSION_SUMMARY.md)
   - 实施流程
   - 关键决策
   - 技术亮点

6. [P0 完成报告](./P0_IMPLEMENTATION_COMPLETE.md)
   - P0 任务详细说明
   - 技术实现
   - 验证方法

---

## 🎓 学习路径

### 初学者路径
```
1. README (了解项目)
   ↓
2. QUICK_REFERENCE (快速上手)
   ↓
3. 示例项目 (实践练习)
   ↓
4. BEST_PRACTICES (深入学习)
```

### 进阶路径
```
1. API 文档 (系统学习)
   ↓
2. 最佳实践 (优化技巧)
   ↓
3. 插件开发 (扩展功能)
   ↓
4. 源码阅读 (深入理解)
```

### 迁移路径
```
1. MIGRATION_GUIDE (迁移指南)
   ↓
2. 配置对比 (理解差异)
   ↓
3. 逐步迁移 (平稳过渡)
   ↓
4. 功能验证 (确保正确)
```

---

## 💼 使用场景文档

### Vue 开发者
- [最佳实践 - Vue 组件库](./docs/BEST_PRACTICES.md#vue-组件库最佳实践)
- [预设配置 - vueLibrary](./docs/API.md#presetsvuelibrary)
- [示例 - vue3-components](./examples/vue3-components/)

### React 开发者
- [最佳实践 - React 组件库](./docs/BEST_PRACTICES.md#react-组件库最佳实践)
- [预设配置 - reactLibrary](./docs/API.md#presetsreactlibrary)
- [策略 - ReactStrategy](./docs/API.md#reactstrategy)

### TypeScript 库开发者
- [最佳实践 - TypeScript 库](./docs/BEST_PRACTICES.md#typescript-库最佳实践)
- [示例 - typescript-utils](./examples/typescript-utils/)
- [配置参考](./docs/API.md#builderconfigschema)

### Monorepo 维护者
- [最佳实践 - Monorepo](./docs/BEST_PRACTICES.md#monorepo-最佳实践)
- [预设配置 - monorepoPackage](./docs/API.md#presetsmonorepopackage)
- [批量构建](./README.md#批量构建示例项目)

---

## 🔧 工具文档

### 调试工具
- [构建调试器](./docs/API.md#builddebugger)
- [性能分析器](./docs/API.md#performanceprofiler)
- [内存检测器](./docs/API.md#memoryleakdetector)

### 优化工具
- [多层缓存](./docs/API.md#createmultilayercache)
- [增量构建](./docs/API.md#增量构建)
- [并行执行](./docs/API.md#并行构建)

### 监控工具
- [实时监控](./docs/API.md#realtimemonitor)
- [性能监控](./docs/API.md#performancemonitor)
- [构建报告](./docs/API.md#enhancedbuildreportgenerator)

---

## 🔌 插件文档

### 官方插件
- [图片优化插件](./docs/API.md#imageoptimizerplugin)
- [SVG 优化插件](./docs/API.md#svgoptimizerplugin)
- [i18n 提取插件](./docs/API.md#i18nextractorplugin)

### 工具链集成
- [Biome 集成](./docs/API.md#biome-集成)
- [Oxc 集成](./docs/API.md#oxc-集成)
- [Lightning CSS](./docs/API.md#lightning-css)

### 插件开发
- [插件 SDK](./docs/API.md#pluginsdk)
- [插件市场](./docs/API.md#pluginregistry)
- [开发最佳实践](./docs/BEST_PRACTICES.md#插件开发最佳实践)

---

## 🌐 部署文档

### 边缘运行时
- [Cloudflare Workers](./docs/API.md#cloudflare-workers)
- [Deno Deploy](./docs/API.md#deno-deploy)

### CI/CD
- [GitHub Actions](./docs/API.md#github-actions)
- [Docker](./docs/API.md#docker)
- [最佳实践](./docs/BEST_PRACTICES.md#cicd-最佳实践)

---

## 📦 示例项目

### 基础示例
- [vue3-components](./examples/vue3-components/) - Vue 3 组件库
- [vue2-components](./examples/vue2-components/) - Vue 2 组件库
- [typescript-utils](./examples/typescript-utils/) - TypeScript 工具库
- [less-styles](./examples/less-styles/) - Less 样式库

### 新增示例
- [esbuild-example](./examples/esbuild-example/) - esbuild 极速构建
- [enhanced-features](./examples/enhanced-features/) - 增强功能演示

---

## 🆘 获取帮助

### 文档索引
- 入门: [README](./README.md)
- 速查: [QUICK_REFERENCE](./QUICK_REFERENCE.md)
- API: [docs/API.md](./docs/API.md)
- 实践: [docs/BEST_PRACTICES.md](./docs/BEST_PRACTICES.md)
- 迁移: [docs/MIGRATION_GUIDE.md](./docs/MIGRATION_GUIDE.md)

### 问题排查
1. 查看 [最佳实践 - 故障排除](./docs/BEST_PRACTICES.md#故障排除)
2. 搜索 [API 文档](./docs/API.md)
3. 查看 [示例项目](./examples/)
4. 提交 GitHub Issue

### 社区资源
- GitHub: https://github.com/ldesign/builder
- 讨论: GitHub Discussions
- 问题: GitHub Issues
- 贡献: Pull Requests

---

## 📑 文档清单

### 用户文档 ✅
- [x] README.md (906+ 行)
- [x] QUICK_REFERENCE.md (新增)
- [x] docs/API.md (847 行)
- [x] docs/BEST_PRACTICES.md (615 行)
- [x] docs/MIGRATION_GUIDE.md (488 行)

### 开发文档 ✅
- [x] 多个策略 README
- [x] 插件开发指南
- [x] 架构说明

### 报告文档 ✅
- [x] FINAL_IMPLEMENTATION_REPORT.md
- [x] ACHIEVEMENT_SHOWCASE.md
- [x] ⚡_执行摘要_EXECUTIVE_SUMMARY.md
- [x] IMPLEMENTATION_PROGRESS.md
- [x] SESSION_SUMMARY.md
- [x] P0_IMPLEMENTATION_COMPLETE.md

### 示例文档 ✅
- [x] 各示例项目 README
- [x] 使用说明
- [x] 配置示例

---

## 🎯 文档使用建议

### 根据角色选择

**开发者**:
1. README → QUICK_REFERENCE → 示例
2. 遇到问题 → BEST_PRACTICES
3. 深入使用 → API 文档

**架构师**:
1. 执行摘要 → 最终报告 → 成果展示
2. 技术评估 → API 文档
3. 架构设计 → 源码阅读

**团队负责人**:
1. 执行摘要 → 成果展示
2. ROI 分析 → 商业价值
3. 推广使用 → 最佳实践

**贡献者**:
1. API 文档 → 源码
2. 实施报告 → 了解架构
3. 最佳实践 → 代码规范

---

## 📈 持续更新

本文档随项目持续更新，确保信息的准确性和时效性。

**最后更新**: 2025-01-23
**文档版本**: 1.0.0
**项目版本**: 1.0.0+

---

**导航提示**: 建议从 [README](./README.md) 或 [快速参考](./QUICK_REFERENCE.md) 开始 🚀

