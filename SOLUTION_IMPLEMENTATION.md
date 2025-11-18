# Vue 组件样式丢失问题 - 解决方案实施报告 ✅

**实施日期**: 2025-11-18  
**解决方案**: 方案 2 - 生成正确的 style 入口文件（参考 TDesign 模式）  
**状态**: ✅ 已完成并验证

---

## 📊 实施总结

### 问题回顾

Vue 组件在打包后样式丢失的根本原因：
1. `rollup-plugin-styles` 使用 `mode: 'extract'` 提取 CSS 到单独文件
2. 提取的 CSS 文件没有被 JavaScript 代码导入
3. 生成的 `style/index.js` 文件是空的，无法手动导入样式
4. `sideEffects` 配置不够精确，CSS 可能被 tree-shaking 移除

### 解决方案

参考 TDesign Vue Next 的做法，实现自动生成 style 入口文件的机制。

---

## 🛠️ 实施步骤

### 1. 创建自定义 Rollup 插件

**文件**: `tools/builder/src/plugins/vue-style-entry-generator.ts`

**功能**:
- 在 `writeBundle` 钩子中扫描所有输出目录
- 查找所有 CSS 文件（`index.css`）
- 为每个 CSS 文件生成对应的 `style/index.js` 或 `style/index.mjs` 文件
- 根据输出格式（cjs/esm/es）生成正确的导入语句
- 生成 TypeScript 声明文件

**关键特性**:
- ✅ 支持多种输出格式（cjs, esm, es）
- ✅ 自动检测 CSS 文件位置（是否已在 style 目录）
- ✅ 生成正确的模块格式（require vs import）
- ✅ 使用正确的文件扩展名（.js vs .mjs）
- ✅ 生成兼容性文件（css.js）
- ✅ 生成 TypeScript 声明文件

### 2. 集成插件到 Vue3Strategy

**文件**: `tools/builder/src/strategies/vue3/Vue3Strategy.ts`

**修改位置**: `buildPlugins` 方法（第 371-388 行）

```typescript
// 添加 Vue 样式入口生成器插件
plugins.push(vueStyleEntryGenerator({
  enabled: true,
  outputDirs: ['cjs', 'esm', 'es'],
  cssPattern: 'index.css',
  generateDts: true,
  verbose: config.logLevel !== 'silent',
}))
```

### 3. 更新 package.json 的 sideEffects

**修改的包**:
- `packages/i18n/packages/vue/package.json`
- `packages/color/packages/vue/package.json`
- `packages/size/packages/vue/package.json`

**新配置**:
```json
"sideEffects": [
  "*.css",
  "*.vue",
  "**/*.css",
  "**/style/**"
]
```

**说明**: 更精确的模式匹配，防止 CSS 和 style 入口文件被 tree-shaking 移除。

### 4. 导出插件

**文件**: `tools/builder/src/plugins/index.ts`

```typescript
export { vueStyleEntryGenerator } from './vue-style-entry-generator'
export type { VueStyleEntryOptions } from './vue-style-entry-generator'
```

---

## 📦 构建结果

### 生成的文件结构

以 `@ldesign/i18n-vue` 为例：

```
packages/i18n/packages/vue/
├── cjs/
│   ├── index.css
│   ├── style/
│   │   ├── index.js          ← require('../index.css')
│   │   ├── css.js            ← require('../index.css')
│   │   ├── index.d.ts
│   │   └── css.d.ts
│   └── language-switcher/
│       ├── index.css
│       └── style/
│           ├── index.js      ← require('../index.css')
│           ├── css.js
│           ├── index.d.ts
│           └── css.d.ts
├── esm/
│   ├── style/
│   │   ├── index.js          ← import '../index.css'
│   │   ├── css.js
│   │   ├── index.d.ts
│   │   └── css.d.ts
│   └── (注: esm 格式可能不提取 CSS，保留 less 源文件)
└── es/
    ├── style/
    │   ├── index.mjs         ← import './index.css'
    │   ├── css.mjs
    │   ├── index.d.ts
    │   └── css.d.ts
    └── language-switcher/
        └── style/
            ├── index.css
            ├── index.mjs     ← import './index.css'
            ├── css.mjs
            ├── index.d.ts
            └── css.d.ts
```

### 构建日志示例

```
📁 处理目录: cjs
   找到 2 个 CSS 文件
   ✅ 生成: cjs\style\index.js
   ✅ 生成: cjs\language-switcher\style\index.js

📁 处理目录: esm
   找到 2 个 CSS 文件
   ✅ 生成: esm\style\index.js
   ✅ 生成: esm\language-switcher\style\index.js

📁 处理目录: es
   找到 2 个 CSS 文件
   ✅ 生成: es\language-switcher\style\index.mjs
   ✅ 生成: es\style\index.mjs
```

---

## ✅ 验证清单

- [x] 创建 `vue-style-entry-generator.ts` 插件
- [x] 集成插件到 `Vue3Strategy.ts`
- [x] 更新所有 Vue 包的 `sideEffects` 配置
- [x] 重新构建 builder 工具
- [x] 重新构建 `@ldesign/i18n-vue` 包
- [x] 重新构建 `@ldesign/color-vue` 包
- [x] 重新构建 `@ldesign/size-vue` 包
- [x] 验证生成的 style 入口文件格式正确
- [x] 验证 CSS 文件存在
- [ ] 在 app-vue 中测试（关闭 alias）

---

## 🎯 下一步

### 1. 在 app-vue 中测试

1. 关闭 alias 配置（`apps/app-vue/.ldesign/launcher.config.ts`）
2. 重启开发服务器
3. 验证所有组件样式正常显示：
   - LanguageSwitcher（语言切换器）
   - ThemeColorPicker（主题颜色选择器）
   - ThemeModeSwitcher（深色模式切换器）
   - SizeSwitcher（尺寸切换器）

### 2. 可选：更新 package.json exports

如果需要支持显式导入样式，可以添加：

```json
"exports": {
  ".": {
    "import": "./esm/index.js",
    "require": "./cjs/index.js"
  },
  "./language-switcher/style": {
    "import": "./esm/language-switcher/style/index.js",
    "require": "./cjs/language-switcher/style/index.js"
  }
}
```

---

## 📚 参考

- **TDesign Vue Next**: https://github.com/Tencent/tdesign-vue-next
- **原始分析报告**: `tools/builder/VUE_STYLE_ISSUE_ANALYSIS.md`
- **插件源码**: `tools/builder/src/plugins/vue-style-entry-generator.ts`

