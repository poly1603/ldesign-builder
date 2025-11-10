# 官方插件

@ldesign/builder 提供了一系列官方插件，用于扩展构建功能。

## 图片优化插件

自动优化图片资源，减小体积。

### 安装

已内置，无需额外安装。

### 使用

```typescript
import { defineConfig, imageOptimizerPlugin } from '@ldesign/builder'

export default defineConfig({
  plugins: [
    imageOptimizerPlugin({
      // 支持的格式
      include: /\.(png|jpe?g|gif|svg|webp)$/,
      
      // 质量设置
      quality: 80,
      
      // 是否生成 WebP
      webp: true,
      
      // 最大宽度
      maxWidth: 1920
    })
  ]
})
```

### 功能

- ✅ 自动压缩 PNG/JPEG/GIF
- ✅ 生成 WebP 格式
- ✅ 响应式图片
- ✅ 保留元数据（可选）

### 示例

```typescript
// 构建前
import logo from './logo.png' // 500KB

// 构建后
import logo from './logo.png' // 150KB
import logoWebp from './logo.webp' // 100KB
```

## SVG 优化插件

优化 SVG 文件并生成 Sprite。

### 使用

```typescript
import { defineConfig, svgOptimizerPlugin } from '@ldesign/builder'

export default defineConfig({
  plugins: [
    svgOptimizerPlugin({
      // SVGO 配置
      svgo: {
        plugins: [
          'removeDoctype',
          'removeComments',
          'cleanupIDs'
        ]
      },
      
      // 生成 Sprite
      sprite: true,
      
      // Sprite 输出路径
      spriteOutput: 'dist/sprite.svg'
    })
  ]
})
```

### 功能

- ✅ 移除无用代码
- ✅ 优化路径
- ✅ 生成 SVG Sprite
- ✅ Symbol ID 管理

## i18n 提取插件

自动提取国际化文本。

### 使用

```typescript
import { defineConfig, i18nExtractorPlugin } from '@ldesign/builder'

export default defineConfig({
  plugins: [
    i18nExtractorPlugin({
      // 输出目录
      output: 'locales',
      
      // 支持的语言
      locales: ['zh-CN', 'en-US'],
      
      // 提取模式
      patterns: [
        /\$t\(['"](.+?)['"]\)/g,
        /t\(['"](.+?)['"]\)/g
      ]
    })
  ]
})
```

### 功能

- ✅ 自动提取文本
- ✅ 生成翻译文件
- ✅ 检测缺失翻译
- ✅ 支持多种格式

## CSS-in-JS 插件

支持 styled-components、emotion 等。

### 使用

```typescript
import { defineConfig, cssInJsPlugin } from '@ldesign/builder'

export default defineConfig({
  plugins: [
    cssInJsPlugin({
      // 库类型
      library: 'styled-components', // 'emotion' | 'styled-components'
      
      // 是否提取 CSS
      extract: true,
      
      // SSR 支持
      ssr: true
    })
  ]
})
```

## Tailwind CSS 插件

集成 Tailwind CSS。

### 使用

```typescript
import { defineConfig, tailwindPlugin } from '@ldesign/builder'

export default defineConfig({
  plugins: [
    tailwindPlugin({
      // Tailwind 配置
      config: './tailwind.config.js',
      
      // 是否压缩
      minify: true
    })
  ]
})
```

## 插件列表

| 插件 | 功能 | 状态 |
|------|------|------|
| **imageOptimizer** | 图片优化 | ✅ 稳定 |
| **svgOptimizer** | SVG 优化 | ✅ 稳定 |
| **i18nExtractor** | i18n 提取 | ✅ 稳定 |
| **cssInJs** | CSS-in-JS | ✅ 稳定 |
| **tailwind** | Tailwind CSS | ✅ 稳定 |
| **cssModules** | CSS Modules | ✅ 稳定 |
| **postcss** | PostCSS | ✅ 稳定 |
| **less** | Less | ✅ 稳定 |
| **sass** | Sass | ✅ 稳定 |
| **stylus** | Stylus | ✅ 稳定 |

## 组合使用

```typescript
import { defineConfig } from '@ldesign/builder'
import {
  imageOptimizerPlugin,
  svgOptimizerPlugin,
  i18nExtractorPlugin
} from '@ldesign/builder'

export default defineConfig({
  plugins: [
    imageOptimizerPlugin(),
    svgOptimizerPlugin(),
    i18nExtractorPlugin({
      output: 'locales'
    })
  ]
})
```

## 下一步

- 🌍 [社区插件](/plugins/community) - 查看社区插件
- 🛠️ [插件开发](/plugins/development) - 开发自己的插件
