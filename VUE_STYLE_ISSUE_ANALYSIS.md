# Vue 组件样式丢失问题分析报告

## 问题描述

当打包包含 `<style>` 标签（内嵌样式）的 Vue 组件时，在不同环境下样式表现不一致：

1. **开发环境（使用 alias 指向 src 目录）**：✅ 样式正常显示
2. **生产环境（使用打包后的 dist 产物）**：❌ Vue 组件的样式丢失

## 根本原因分析

### 1. 当前打包配置的问题

#### 问题 1：CSS 提取但未自动导入

查看 `Vue3Strategy.ts` 的配置（第 340-369 行）：

```typescript
// 样式处理插件（使用 rollup-plugin-styles，更好的 Vue SFC 支持）
try {
  const Styles = await import('rollup-plugin-styles')
  plugins.push(Styles.default({
    mode: 'extract',  // ❌ 提取 CSS 到单独文件
    modules: false,
    minimize: shouldMinify(config),
    namedExports: true,
    include: [
      '**/*.less',
      '**/*.css',
      '**/*.scss',
      '**/*.sass'
    ],
    url: {
      inline: false,
    },
    ...this.getStylesOptions(config)
  }))
}
```

**问题**：
- `mode: 'extract'` 会将 Vue SFC 中的 `<style>` 标签提取到单独的 CSS 文件
- 但是**没有在 JS 文件中自动添加 CSS 导入语句**
- 导致使用打包产物时，CSS 文件虽然存在，但不会被加载

#### 问题 2：package.json 的 sideEffects 配置不完整

查看 `@ldesign/i18n-vue` 的 package.json（第 18-21 行）：

```json
"sideEffects": [
  "*.css",
  "*.vue"
],
```

**问题**：
- 只标记了 `*.css` 和 `*.vue` 为副作用文件
- 但打包后的 CSS 文件路径是 `cjs/language-switcher/index.css`
- 这个路径模式**不匹配** `*.css`，因为它包含目录结构

### 2. TDesign Vue Next 的正确做法

查看 `tdesign-vue-next` 的 package.json：

```json
"sideEffects": [
  "*.vue",
  "dist/*",
  "site/*",
  "examples/*",
  "es/**/style/**",      // ✅ 匹配所有 style 目录下的文件
  "esm/**/style/**"      // ✅ 匹配所有 style 目录下的文件
],
```

**关键差异**：
1. 使用 `es/**/style/**` 和 `esm/**/style/**` 模式
2. 这样可以匹配任意深度的 style 目录
3. 确保 CSS 文件不会被 tree-shaking 移除

### 3. TDesign 的样式导入策略

TDesign 采用了**显式导入**策略：

```typescript
// 用户需要手动导入样式
import { Button } from 'tdesign-vue-next';
import 'tdesign-vue-next/es/style/index.css';  // ✅ 显式导入
```

或者按需导入：

```typescript
import { Button } from 'tdesign-vue-next/es/button';
import 'tdesign-vue-next/es/button/style';  // ✅ 按需导入样式
```

## 解决方案

### 方案 A：自动注入 CSS 导入（推荐）

修改 `Vue3Strategy.ts`，在打包时自动在 JS 文件中注入 CSS 导入：

```typescript
// 样式处理插件
plugins.push(Styles.default({
  mode: 'inject',  // ✅ 改为 inject 模式，自动注入到 JS
  modules: false,
  minimize: shouldMinify(config),
  // 或者使用 extract 但配置 autoModules
  autoModules: true,  // ✅ 自动处理 CSS Modules
}))
```

**优点**：
- 用户无需手动导入 CSS
- 开发和生产环境行为一致
- 符合现代组件库的最佳实践

**缺点**：
- CSS 会被打包到 JS 中，增加 JS 体积
- 无法单独缓存 CSS

### 方案 B：生成 style 入口文件（TDesign 方案）

为每个组件生成 `style/index.js` 文件：

```javascript
// cjs/language-switcher/style/index.js
import '../index.css';
```

然后更新 package.json：

```json
"sideEffects": [
  "*.css",
  "*.vue",
  "**/style/**",     // ✅ 匹配所有 style 目录
  "cjs/**/*.css",    // ✅ 匹配 cjs 目录下的所有 CSS
  "esm/**/*.css"     // ✅ 匹配 esm 目录下的所有 CSS
],
"exports": {
  "./language-switcher": {
    "types": "./esm/language-switcher/index.d.ts",
    "import": "./esm/language-switcher/index.js",
    "require": "./cjs/language-switcher/index.cjs"
  },
  "./language-switcher/style": {  // ✅ 导出样式入口
    "import": "./esm/language-switcher/style/index.js",
    "require": "./cjs/language-switcher/style/index.js"
  }
}
```

**优点**：
- CSS 和 JS 分离，可以单独缓存
- 支持按需加载
- 符合大型组件库的最佳实践

**缺点**：
- 需要用户手动导入样式
- 打包配置更复杂

### 方案 C：混合方案（最佳实践）

结合方案 A 和 B：

1. **默认行为**：CSS 注入到 JS（方案 A）
2. **可选行为**：提供独立的 CSS 文件和 style 入口（方案 B）

这样既方便用户使用，又提供了优化选项。

## 推荐实施步骤

### 第一步：修复 sideEffects 配置

立即修复所有 `@ldesign/*` 包的 package.json：

```json
"sideEffects": [
  "*.css",
  "*.vue",
  "**/*.css",      // ✅ 匹配所有 CSS 文件
  "**/style/**"    // ✅ 匹配所有 style 目录
],
```

### 第二步：修改 Vue3Strategy

修改 `tools/builder/src/strategies/vue3/Vue3Strategy.ts`：

```typescript
// 根据配置决定样式处理方式
const styleMode = config.style?.inject !== false ? 'inject' : 'extract'

plugins.push(Styles.default({
  mode: styleMode,  // ✅ 支持配置
  modules: false,
  minimize: shouldMinify(config),
  autoModules: true,
}))
```

### 第三步：更新 builder.config.ts

在各个包的 `builder.config.ts` 中添加配置：

```typescript
export default defineConfig({
  // ...
  style: {
    inject: true,  // ✅ 默认注入到 JS
    extract: false, // 不提取到单独文件
  },
})
```

## 实际问题验证

### 当前打包产物分析

查看 `packages/i18n/packages/vue/cjs/language-switcher/language-switcher.js`：

```javascript
// ❌ 没有 CSS 导入语句！
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var vue = require('vue');
var useI18n = require('../composables/useI18n.js');

var languageSwitcher = vue.defineComponent({
  name: "LanguageSwitcher",
  // ... 组件代码
});

exports.default = languageSwitcher;
```

查看 `packages/i18n/packages/vue/cjs/language-switcher/style/index.js`：

```javascript
// ❌ 空文件！没有导入 CSS
'use strict';

/*! End of @ldesign/i18n-vue | Powered by @ldesign/builder */
```

**结论**：
1. 组件 JS 文件中没有导入 CSS
2. style/index.js 文件是空的，没有实际作用
3. 虽然 CSS 文件存在（`cjs/language-switcher/index.css`），但永远不会被加载

## 立即修复方案（最简单）

### 方案 1：使用 inject 模式（推荐）

修改 `tools/builder/src/strategies/vue3/Vue3Strategy.ts` 第 340-369 行：

```typescript
// 样式处理插件（使用 rollup-plugin-styles）
try {
  const Styles = await import('rollup-plugin-styles')
  plugins.push(Styles.default({
    mode: 'inject',  // ✅ 改为 inject，自动注入到 JS
    modules: false,
    minimize: shouldMinify(config),
    // 移除 namedExports，inject 模式不需要
    include: [
      '**/*.less',
      '**/*.css',
      '**/*.scss',
      '**/*.sass'
    ],
    url: {
      inline: false,
    },
    ...this.getStylesOptions(config)
  }))
} catch (e) {
  // fallback...
}
```

**效果**：
- CSS 会被转换为 JS 代码，在运行时注入到 `<style>` 标签
- 组件导入时自动加载样式
- 开发和生产环境行为完全一致

**优点**：
- ✅ 最简单，只需修改一行代码
- ✅ 用户无需手动导入样式
- ✅ 与开发环境行为一致

**缺点**：
- ❌ CSS 打包到 JS 中，增加 JS 体积（通常增加 10-20%）
- ❌ 无法单独缓存 CSS

### 方案 2：生成正确的 style 入口文件

需要在打包后生成正确的 style/index.js：

```javascript
// cjs/language-switcher/style/index.js
require('../index.css');  // ✅ 导入 CSS

// esm/language-switcher/style/index.js
import '../index.css';  // ✅ 导入 CSS
```

这需要添加一个自定义 Rollup 插件来生成这些文件。

## 验证方法

### 使用方案 1 后的验证

1. 修改 `Vue3Strategy.ts`，将 `mode: 'extract'` 改为 `mode: 'inject'`
2. 重新打包所有 `@ldesign/*` 包：
   ```bash
   pnpm --filter "@ldesign/i18n-vue" build
   pnpm --filter "@ldesign/color-vue" build
   pnpm --filter "@ldesign/size-vue" build
   ```
3. 在 `app-vue` 中关闭 alias（注释掉 launcher.config.ts 中的 alias 配置）
4. 重启开发服务器
5. 检查右上角组件样式是否正常显示

### 预期结果

打包后的 JS 文件应该包含类似这样的代码：

```javascript
// language-switcher.js
'use strict';

// ✅ 自动注入的样式代码
(function() {
  var style = document.createElement('style');
  style.textContent = '.ld-lang-switcher { display: inline-block; } ...';
  document.head.appendChild(style);
})();

// 组件代码
var languageSwitcher = vue.defineComponent({
  // ...
});
```

## 参考资料

- [TDesign Vue Next Package.json](https://github.com/Tencent/tdesign-vue-next/blob/develop/packages/tdesign-vue-next/package.json)
- [Rollup Plugin Styles - Inject Mode](https://github.com/Anidetrix/rollup-plugin-styles#inject)
- [Webpack sideEffects](https://webpack.js.org/guides/tree-shaking/#mark-the-file-as-side-effect-free)
- [Vue SFC Style Handling](https://vuejs.org/api/sfc-css-features.html)

