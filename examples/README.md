# @ldesign/builder 示例项目

展示如何使用 `@ldesign/builder` 打包各种类型的前端库。

## 示例项目

### 1. tdesign-like - Vue3 组件库

类似 TDesign Vue Next 的组件库结构：
- Vue 3 SFC 组件 (Button, Input, Select, Modal, Table)
- Less 样式文件
- TypeScript 类型定义
- Vue 指令和 Hooks

```bash
cd examples/tdesign-like
pnpm install
pnpm build
```

### 2. utils-lib - TypeScript 工具库

纯 TypeScript 工具函数库：
- 类型工具、字符串处理、数组操作
- 对象工具、日期工具、异步工具
- DOM 工具、验证工具、存储工具

```bash
cd examples/utils-lib
pnpm install
pnpm build
```

## 支持的资源类型

| 资源类型 | 扩展名 | 
|----------|--------|
| TypeScript | `.ts`, `.tsx` |
| Vue SFC | `.vue` |
| Less/SCSS | `.less`, `.scss` |
| CSS | `.css` |

## TDesign 结构特点

1. **多入口构建** - 每个组件独立入口
2. **样式分离** - JS 和 CSS 独立打包
3. **多格式输出** - ESM/CJS/UMD
