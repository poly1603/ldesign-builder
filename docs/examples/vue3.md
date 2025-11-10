# Vue 3 组件库示例

本文展示如何使用 @ldesign/builder 构建 Vue 3 组件库。

## 项目结构

```
my-vue-library/
├── src/
│   ├── components/
│   │   ├── Button/
│   │   │   ├── Button.vue
│   │   │   └── index.ts
│   │   ├── Input/
│   │   │   ├── Input.vue
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── styles/
│   │   └── index.css
│   └── index.ts
├── package.json
└── tsconfig.json
```

## 安装

```bash
pnpm add @ldesign/builder -D
pnpm add vue@^3.0.0
```

## 零配置构建

### 1. 创建入口文件

```typescript
// src/index.ts
export { default as Button } from './components/Button'
export { default as Input } from './components/Input'

export * from './types'
```

### 2. 组件文件

```vue
<!-- src/components/Button/Button.vue -->
<template>
  <button :class="classes" @click="handleClick">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'primary' | 'default'
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  size: 'medium'
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const classes = computed(() => [
  'btn',
  `btn-${props.type}`,
  `btn-${props.size}`
])

const handleClick = (event: MouseEvent) => {
  emit('click', event)
}
</script>

<style scoped>
.btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary {
  background: #1890ff;
  color: white;
}

.btn-default {
  background: white;
  color: #333;
  border: 1px solid #d9d9d9;
}
</style>
```

```typescript
// src/components/Button/index.ts
import Button from './Button.vue'

export default Button
export type { Props as ButtonProps } from './Button.vue'
```

### 3. 构建

```bash
# 零配置构建
npx ldesign-builder build
```

自动生成：
- ✅ ESM 格式（es/）
- ✅ CJS 格式（lib/）
- ✅ 类型声明（.d.ts）
- ✅ CSS 文件

## 使用配置文件

如果需要自定义：

```typescript
// .ldesign/builder.config.ts
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 入口
  entry: 'src/index.ts',
  
  // 自动检测为 Vue 3
  libraryType: 'vue3',
  
  // 输出配置
  output: {
    formats: ['esm', 'cjs'],
    dir: {
      esm: 'es',
      cjs: 'lib'
    },
    preserveModules: true // 保留模块结构，支持按需加载
  },
  
  // 外部依赖
  external: ['vue']
})
```

## package.json 配置

```json
{
  "name": "my-vue-library",
  "version": "1.0.0",
  "main": "./lib/index.js",
  "module": "./es/index.js",
  "types": "./es/index.d.ts",
  "exports": {
    ".": {
      "types": "./es/index.d.ts",
      "import": "./es/index.js",
      "require": "./lib/index.js"
    },
    "./es/*": "./es/*",
    "./lib/*": "./lib/*",
    "./*": "./*"
  },
  "files": ["es", "lib", "README.md"],
  "scripts": {
    "build": "ldesign-builder build",
    "dev": "ldesign-builder watch"
  },
  "peerDependencies": {
    "vue": "^3.0.0"
  },
  "devDependencies": {
    "@ldesign/builder": "^1.0.0",
    "vue": "^3.0.0"
  }
}
```

## 使用库

### 完整导入

```typescript
import { Button, Input } from 'my-vue-library'
import 'my-vue-library/es/styles/index.css'
```

### 按需导入

```typescript
import Button from 'my-vue-library/es/components/Button'
import 'my-vue-library/es/components/Button/style.css'
```

## 样式处理

### CSS 变量

```css
/* src/styles/variables.css */
:root {
  --color-primary: #1890ff;
  --color-success: #52c41a;
  --color-error: #ff4d4f;
}
```

### Less/Sass

```typescript
export default defineConfig({
  css: {
    preprocessor: 'less',
    extract: true
  }
})
```

## 开发模式

```bash
# 监听模式
pnpm dev

# 使用 esbuild 更快
pnpm dev --bundler esbuild
```

## 完整示例

查看完整示例：

```bash
# 创建示例项目
npx ldesign-builder examples --create vue3

# 或查看在线示例
# https://github.com/ldesign/builder/tree/main/examples/vue3
```

## 最佳实践

### 1. 组件导出

```typescript
// src/index.ts
export { default as Button } from './components/Button'
export { default as Input } from './components/Input'

// 类型导出
export type { ButtonProps } from './components/Button'
export type { InputProps } from './components/Input'

// 批量导出
export * from './components'
```

### 2. 样式组织

```
src/
├── styles/
│   ├── variables.css
│   ├── mixins.less
│   └── index.css
└── components/
    └── Button/
        ├── Button.vue
        ├── style.css
        └── index.ts
```

### 3. 类型定义

```typescript
// src/types/index.ts
export interface ComponentProps {
  size?: 'small' | 'medium' | 'large'
}

export type Theme = 'light' | 'dark'
```

## 下一步

- 📖 [React 示例](/examples/react) - React 组件库
- 🎨 [Svelte 示例](/examples/svelte) - Svelte 组件库
- 📦 [Monorepo 示例](/examples/monorepo) - Monorepo 项目
