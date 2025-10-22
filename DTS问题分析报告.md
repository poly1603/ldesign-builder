# DTS 生成问题分析报告

## 问题现象

部分包能生成 dts，部分包不能：

### 能生成 DTS 的包
- api ✅
- color ✅  
- device ✅
- i18n ✅
- router ✅
- size ✅
- template ✅

### 不能生成 DTS 的包
- cache ❌
- crypto ❌
- engine ❌
- http ❌
- shared ❌
- store ❌

## 根本原因分析

通过逐个测试包的构建过程，发现了根本原因：

### 1. 项目类型误判

**能生成 DTS 的包被正确识别：**
- api → 识别为 `React 项目`
- color → 识别为 `TypeScript 项目`

**不能生成 DTS 的包被误判：**
- **shared → 被误判为 `样式库项目`** ⚠️

### 2. StyleStrategy 不生成 DTS

`StyleStrategy`（样式库策略）默认不配置 TypeScript 插件，因为它假设样式库只处理 CSS/Less/Sass 文件，不需要类型声明。

### 3. DTS 是 Rollup 插件生成的

当前 **api 包的 dts 文件是 `@rollup/plugin-typescript` 在构建时自动生成的**，不是我新写的 `DtsGenerator`。

#### 证据：
```
api 构建输出：
[15:05:28] [INFO] 检测到 React 项目
[15:05:37] [INFO]   DTS 文件: 118 个

shared 构建输出：
[15:05:56] [INFO] 检测到样式库项目  ← 误判！
[15:05:57] [INFO]   DTS 文件: 0 个
```

## 为什么我的 DtsGenerator 没有被调用？

检查代码逻辑发现：

```typescript
// tools/builder/src/cli/commands/build.ts
const originalFormats = options.format ? options.format.split(',').map(f => f.trim()) : []
const hasDts = originalFormats.includes('dts') || ...
```

**问题**：当使用 `ldesign-builder build`（不指定 `-f` 参数）时，`options.format` 是 undefined，所以 `originalFormats` 是空数组，`hasDts` 是 false，DtsGenerator 不会被调用！

## 需要修复的问题

### 优先级 1：修复 LibraryDetector 的误判

**shared 包不应该被识别为样式库**，它是一个纯 TypeScript 工具库。

需要检查 `LibraryDetector` 的检测逻辑，可能是因为：
1. shared 包含了一些样式文件
2. 检测优先级有问题

### 优先级 2：StyleStrategy 也应该支持 TypeScript

即使是样式库，如果包含 TypeScript 文件，也应该生成 dts。需要：

1. 在 `StyleStrategy` 中添加 TypeScript 插件配置
2. 检测是否有 .ts 文件，如果有则启用 declaration

### 优先级 3：让 DtsGenerator 成为默认行为

修改逻辑，使得：
- 当检测到 TypeScript 项目时，**自动**生成 dts（不需要显式指定 `-f dts`）
- 或者将 `dts` 添加到默认的 formats 中

## 临时解决方案

### 方案 1：手动指定 format（立即可用）

```bash
# 在每个包的 package.json 中
"build": "ldesign-builder build -f esm,cjs,dts"
```

### 方案 2：修复 LibraryDetector（推荐）

找出为什么 shared 被误判为样式库，修正检测逻辑。

## 下一步行动

1. ✅ 分析完成，找到根本原因
2. ⏭️ 检查 `LibraryDetector` 的检测逻辑
3. ⏭️ 修复 shared 被误判为样式库的问题
4. ⏭️ 让 StyleStrategy 支持 TypeScript
5. ⏭️ 让 dts 生成成为默认行为

## 测试验证

为了验证这个分析，可以：

1. 手动修改 shared 的 build 脚本：`ldesign-builder build -f esm,cjs,dts`
2. 应该能生成 dts 文件

或者：

1. 创建一个 builder.config.ts，强制指定 libraryType 为 TypeScript
2. 重新构建，应该能生成 dts

