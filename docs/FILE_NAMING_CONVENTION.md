# 文件命名规范

> **@ldesign/builder 项目文件命名标准**

---

## 📐 命名规则总览

### 基本原则

1. **一致性**：整个项目使用统一的命名规范
2. **可读性**：文件名应清晰表达文件内容
3. **可搜索性**：便于在编辑器中快速搜索
4. **语义化**：名称应有明确的语义

---

## 📁 文件命名规范

### 1. TypeScript 类文件

**规则：** PascalCase（大驼峰命名）

**示例：**
```
✅ Logger.ts
✅ ErrorHandler.ts
✅ LibraryBuilder.ts
✅ ConfigManager.ts
✅ UnifiedBundlerAdapter.ts

❌ logger.ts          （应该用 Logger.ts）
❌ error_handler.ts   （应该用 ErrorHandler.ts）
❌ library-builder.ts （应该用 LibraryBuilder.ts）
```

**原因：**
- 与类名一致（class Logger → Logger.ts）
- 更容易识别类文件
- IDE 自动导入时更准确

### 2. 工具函数文件

**规则：** camelCase（小驼峰命名）

**示例：**
```
✅ formatUtils.ts
✅ pathUtils.ts
✅ fileSystem.ts
✅ cacheManager.ts

❌ format-utils.ts    （应该用 formatUtils.ts）
❌ format_utils.ts    （应该用 formatUtils.ts）
❌ FormatUtils.ts     （应该用 formatUtils.ts）
```

### 3. 常量文件

**规则：** camelCase

**示例：**
```
✅ defaults.ts
✅ errors.ts
✅ formats.ts
✅ extensions.ts

❌ DEFAULTS.ts
❌ defaults.constant.ts
```

### 4. 类型定义文件

**规则：** camelCase

**示例：**
```
✅ builder.ts
✅ config.ts
✅ adapter.ts
✅ strategy.ts

❌ Builder.types.ts
❌ IBuilder.ts
❌ builder-types.ts
```

### 5. 索引文件

**规则：** 统一使用 `index.ts`

**示例：**
```
✅ index.ts
❌ main.ts
❌ entry.ts
❌ module.ts
```

### 6. 测试文件

**规则：** 与源文件同名 + `.test.ts` 或 `.spec.ts`

**示例：**
```
✅ Logger.test.ts         （测试 Logger.ts）
✅ errorHandler.test.ts   （测试 errorHandler.ts）
✅ build.spec.ts          （测试 build.ts）

❌ test-logger.ts
❌ logger.tests.ts
```

---

## 📂 目录命名规范

### 规则：kebab-case（短横线命名）

**示例：**
```
✅ error-handler/
✅ code-splitting/
✅ plugin-market/

❌ errorHandler/
❌ error_handler/
❌ ErrorHandler/
```

**例外：**
- `__tests__/` - 测试目录（约定俗成）
- `node_modules/` - npm 标准

---

## 🔧 当前项目文件命名审查

### ✅ 符合规范的文件

**类文件：**
- `Logger.ts`
- `ErrorHandler.ts`
- `BuilderError.ts`
- `LibraryBuilder.ts`
- `ConfigManager.ts`
- `StrategyManager.ts`
- `PluginManager.ts`

**工具文件：**
- `formatUtils.ts`
- `pathUtils.ts`
- `performanceUtils.ts`

**常量文件：**
- `defaults.ts`
- `errors.ts`
- `formats.ts`

### ⚠️ 需要规范化的文件

**建议重命名：**

| 当前名称 | 建议名称 | 原因 |
|---------|---------|------|
| `memory-leak-detector.ts` | `MemoryLeakDetector.ts` | 类文件应用 PascalCase |
| `build-cache-manager.ts` | `BuildCacheManager.ts` | 类文件应用 PascalCase |
| `code-splitting-optimizer.ts` | `CodeSplittingOptimizer.ts` | 类文件应用 PascalCase |
| `parallel-build-executor.ts` | `ParallelBuildExecutor.ts` | 类文件应用 PascalCase |
| `auto-config-enhancer.ts` | `AutoConfigEnhancer.ts` | 类文件应用 PascalCase |

**工具函数文件保持现状（已符合规范）：**
- ✅ `glob.ts`
- ✅ `cache.ts`
- ✅ `performance.ts`

---

## 🔄 重命名迁移计划

### Phase 1：准备阶段
1. 记录所有需要重命名的文件
2. 分析影响范围（导入引用）
3. 准备自动化重构脚本

### Phase 2：执行阶段
```bash
# 使用 git mv 保留历史
git mv src/utils/memory-leak-detector.ts src/utils/MemoryLeakDetector.ts
git mv src/utils/build-cache-manager.ts src/utils/BuildCacheManager.ts
# ... 其他文件

# 更新所有导入引用
# 使用 IDE 的重构功能或自动化脚本
```

### Phase 3：验证阶段
1. 运行 TypeScript 编译检查
2. 运行 Lint 检查
3. 运行所有测试
4. 验证构建产物

---

## 📝 命名检查清单

在创建新文件时，请检查：

- [ ] ✅ 文件名是否符合规范？
- [ ] ✅ 目录名是否符合规范？
- [ ] ✅ 导出的符号名称是否与文件名一致？
- [ ] ✅ 是否与现有文件命名风格一致？

---

## 🎯 推荐的 IDE 配置

### VS Code 设置

```json
{
  "files.exclude": {
    "**/*.js": { "when": "$(basename).ts" },
    "**/*.js.map": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/*.min.js": true
  }
}
```

### ESLint 配置

```javascript
// eslint.config.js
export default {
  rules: {
    // 强制文件名与导出名称一致
    'filenames/match-exported': 'error',
    // 强制文件名使用特定格式
    'filenames/match-regex': ['error', '^[A-Z][a-zA-Z]+$', true]
  }
}
```

---

## 💡 最佳实践

### 1. 文件名应反映内容

```
✅ UserAuthentication.ts  （包含 UserAuthentication 类）
✅ formatDate.ts          （包含 formatDate 函数）
✅ constants.ts           （包含常量定义）

❌ utils.ts               （太通用）
❌ helpers.ts             （太通用）
❌ misc.ts                （无意义）
```

### 2. 避免缩写

```
✅ Configuration.ts
✅ Application.ts
✅ Performance.ts

❌ Config.ts              （除非是约定俗成的缩写）
❌ App.ts
❌ Perf.ts
```

**例外：约定俗成的缩写可以使用：**
- `utils` (utilities)
- `config` (configuration)
- `props` (properties)
- `params` (parameters)

### 3. 单复数规则

```
✅ User.ts                （单个类）
✅ userUtils.ts           （工具函数集合）
✅ constants/errors.ts    （多个错误常量）

❌ Users.ts               （如果只导出一个 User 类）
```

---

## 🔍 自动化检查

### Git Pre-commit Hook

```bash
#!/bin/sh
# .git/hooks/pre-commit

# 检查文件命名
for file in $(git diff --cached --name-only --diff-filter=A | grep '\.ts$'); do
  filename=$(basename "$file" .ts)
  
  # 检查类文件是否使用 PascalCase
  if grep -q "^export class $filename" "$file"; then
    if ! echo "$filename" | grep -qE '^[A-Z][a-zA-Z0-9]*$'; then
      echo "错误: 类文件应使用 PascalCase: $file"
      exit 1
    fi
  fi
done
```

---

## 📚 参考资料

- [Google TypeScript 风格指南](https://google.github.io/styleguide/tsguide.html)
- [Airbnb JavaScript 风格指南](https://github.com/airbnb/javascript)
- [Microsoft TypeScript 编码规范](https://github.com/microsoft/TypeScript/wiki/Coding-guidelines)

---

**维护者：** LDesign Team  
**最后更新：** 2024-01-01

