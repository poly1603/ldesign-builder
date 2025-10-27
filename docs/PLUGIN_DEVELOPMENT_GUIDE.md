# @ldesign/builder 插件开发指南

> **从零开始，开发你的第一个构建插件！** 🔌

---

## 📚 目录

1. [插件基础](#1-插件基础)
2. [创建你的第一个插件](#2-创建你的第一个插件)
3. [插件生命周期](#3-插件生命周期)
4. [插件 API 参考](#4-插件-api-参考)
5. [高级功能](#5-高级功能)
6. [最佳实践](#6-最佳实践)
7. [调试和测试](#7-调试和测试)
8. [发布插件](#8-发布插件)

---

## 1. 插件基础

### 1.1 什么是插件？

插件是扩展 @ldesign/builder 功能的模块，可以：
- 修改构建配置
- 添加自定义构建步骤
- 处理特定类型的文件
- 集成第三方工具
- 优化构建产物

### 1.2 插件类型

**按功能分类：**
- **转换插件**：转换源代码（如 Babel、TypeScript）
- **优化插件**：优化构建产物（如压缩、Tree-shaking）
- **分析插件**：分析构建结果（如 Bundle Analyzer）
- **集成插件**：集成第三方工具（如 PostCSS、Tailwind）

**按作用范围：**
- **通用插件**：适用于所有项目类型
- **框架插件**：特定框架专用（如 Vue、React）

---

## 2. 创建你的第一个插件

### 2.1 基础插件结构

```typescript
// src/plugins/my-first-plugin.ts
import type { UnifiedPlugin, PluginContext } from '@ldesign/builder'

/**
 * 我的第一个插件选项
 */
export interface MyFirstPluginOptions {
  /** 是否启用 */
  enabled?: boolean
  /** 自定义消息 */
  message?: string
}

/**
 * 我的第一个插件
 * 
 * @param options - 插件选项
 * @returns 插件实例
 */
export function myFirstPlugin(options: MyFirstPluginOptions = {}): UnifiedPlugin {
  const { enabled = true, message = 'Hello from plugin!' } = options
  
  return {
    // ========== 插件元信息 ==========
    name: 'my-first-plugin',
    version: '1.0.0',
    
    // ========== 初始化钩子 ==========
    async onInit(context: PluginContext) {
      if (!enabled) return
      
      context.logger.info(`🔌 ${message}`)
    },
    
    // ========== 构建开始钩子 ==========
    async onBuildStart(context: PluginContext) {
      if (!enabled) return
      
      context.logger.info('构建开始！')
    },
    
    // ========== 应用插件逻辑 ==========
    apply(config) {
      if (!enabled) return config
      
      // 修改配置
      return {
        ...config,
        // 添加你的配置修改
      }
    },
    
    // ========== 构建结束钩子 ==========
    async onBuildEnd(context: PluginContext, result) {
      if (!enabled) return
      
      context.logger.success(`✅ 构建完成！共 ${result.outputs.length} 个文件`)
    }
  }
}

// ========== 默认导出 ==========
export default myFirstPlugin
```

### 2.2 使用插件

```typescript
// ldesign.config.ts
import { defineConfig } from '@ldesign/builder'
import { myFirstPlugin } from './src/plugins/my-first-plugin'

export default defineConfig({
  input: 'src/index.ts',
  
  plugins: [
    myFirstPlugin({
      enabled: true,
      message: '欢迎使用我的插件！'
    })
  ]
})
```

### 2.3 运行构建

```bash
npm run build
```

**输出：**
```
🔌 欢迎使用我的插件！
构建开始！
... (构建过程)
✅ 构建完成！共 4 个文件
```

---

## 3. 插件生命周期

### 3.1 生命周期钩子

```typescript
export interface UnifiedPlugin {
  // 1️⃣ 初始化（构建器启动时）
  onInit?(context: PluginContext): void | Promise<void>
  
  // 2️⃣ 构建开始前
  onBuildStart?(context: PluginContext): void | Promise<void>
  
  // 3️⃣ 配置转换阶段
  apply(config: BuilderConfig): BuilderConfig
  
  // 4️⃣ 模块解析时
  onResolveId?(
    source: string,
    importer: string | undefined
  ): string | null | Promise<string | null>
  
  // 5️⃣ 模块加载时
  onLoad?(
    id: string
  ): string | { code: string; map?: any } | null | Promise<any>
  
  // 6️⃣ 模块转换时
  onTransform?(
    code: string,
    id: string
  ): string | { code: string; map?: any } | null | Promise<any>
  
  // 7️⃣ 构建结束后
  onBuildEnd?(
    context: PluginContext,
    result: BuildResult
  ): void | Promise<void>
  
  // 8️⃣ 插件卸载时
  onDispose?(): void | Promise<void>
}
```

### 3.2 生命周期示例

```typescript
export function fullLifecyclePlugin(): UnifiedPlugin {
  let buildCount = 0
  
  return {
    name: 'full-lifecycle-plugin',
    
    // 1. 插件初始化
    async onInit(context) {
      context.logger.info('插件初始化')
      // 可以在这里：
      // - 读取配置
      // - 初始化资源
      // - 建立连接
    },
    
    // 2. 构建开始
    async onBuildStart(context) {
      buildCount++
      context.logger.info(`开始第 ${buildCount} 次构建`)
      // 可以在这里：
      // - 清理临时文件
      // - 准备构建资源
      // - 记录开始时间
    },
    
    // 3. 配置应用
    apply(config) {
      console.log('应用插件配置')
      // 可以在这里：
      // - 修改构建配置
      // - 添加 Rollup 插件
      // - 设置外部依赖
      return config
    },
    
    // 4. 模块解析
    onResolveId(source, importer) {
      console.log(`解析: ${source}`)
      // 可以在这里：
      // - 重定向模块路径
      // - 处理别名
      return null  // 返回 null 继续默认处理
    },
    
    // 5. 模块加载
    onLoad(id) {
      console.log(`加载: ${id}`)
      // 可以在这里：
      // - 加载虚拟模块
      // - 处理特殊文件
      return null
    },
    
    // 6. 模块转换
    onTransform(code, id) {
      console.log(`转换: ${id}`)
      // 可以在这里：
      // - 转换源代码
      // - 添加 polyfill
      // - 注入代码
      return null
    },
    
    // 7. 构建结束
    async onBuildEnd(context, result) {
      context.logger.success('构建完成')
      // 可以在这里：
      // - 生成报告
      // - 上传文件
      // - 发送通知
    },
    
    // 8. 插件清理
    async onDispose() {
      console.log('插件清理')
      // 可以在这里：
      // - 释放资源
      // - 关闭连接
      // - 保存状态
    }
  }
}
```

---

## 4. 插件 API 参考

### 4.1 PluginContext（插件上下文）

```typescript
interface PluginContext {
  // 构建信息
  buildId: string
  pluginName: string
  cwd: string
  mode: 'development' | 'production'
  platform: 'browser' | 'node'
  env: Record<string, string>
  
  // 配置信息
  config: BuilderConfig
  cacheDir: string
  tempDir: string
  
  // 工具
  logger: Logger
  performanceMonitor: PerformanceMonitor
  
  // 方法
  emitFile(fileName: string, content: string): void
  getModuleInfo(id: string): ModuleInfo | null
}
```

### 4.2 常用工具方法

```typescript
export function myPlugin(): UnifiedPlugin {
  return {
    name: 'my-plugin',
    
    async onBuildStart(context) {
      // ========== 日志记录 ==========
      context.logger.info('信息日志')
      context.logger.warn('警告日志')
      context.logger.error('错误日志')
      context.logger.debug('调试日志')
      
      // ========== 性能监控 ==========
      context.performanceMonitor.startSession('my-task')
      await doSomething()
      context.performanceMonitor.endSession('my-task')
      
      // ========== 生成文件 ==========
      context.emitFile('custom.txt', 'Generated content')
      
      // ========== 获取模块信息 ==========
      const info = context.getModuleInfo('./module.ts')
      if (info) {
        console.log('模块依赖:', info.dependencies)
      }
    }
  }
}
```

---

## 5. 高级功能

### 5.1 虚拟模块

```typescript
/**
 * 虚拟模块插件
 * 
 * 功能：在构建时注入虚拟模块
 */
export function virtualModulePlugin(modules: Record<string, string>): UnifiedPlugin {
  // 虚拟模块 ID 前缀
  const VIRTUAL_PREFIX = '\0virtual:'
  
  return {
    name: 'virtual-module-plugin',
    
    onResolveId(source) {
      // 如果请求虚拟模块，返回虚拟 ID
      if (source in modules) {
        return VIRTUAL_PREFIX + source
      }
      return null
    },
    
    onLoad(id) {
      // 如果是虚拟模块，返回其内容
      if (id.startsWith(VIRTUAL_PREFIX)) {
        const name = id.slice(VIRTUAL_PREFIX.length)
        return modules[name] || null
      }
      return null
    }
  }
}

// 使用示例
export default defineConfig({
  plugins: [
    virtualModulePlugin({
      'virtual:config': `
        export const API_URL = '${process.env.API_URL}'
        export const VERSION = '${pkg.version}'
      `
    })
  ]
})

// 在源代码中导入虚拟模块
import { API_URL, VERSION } from 'virtual:config'
```

### 5.2 代码转换插件

```typescript
/**
 * 自定义代码转换插件
 */
export function codeTransformPlugin(): UnifiedPlugin {
  return {
    name: 'code-transform-plugin',
    
    onTransform(code, id) {
      // 只处理 .ts 文件
      if (!id.endsWith('.ts')) {
        return null
      }
      
      // 执行代码转换
      let transformedCode = code
      
      // 示例：移除所有 console.log
      transformedCode = transformedCode.replace(
        /console\.log\([^)]*\);?/g,
        ''
      )
      
      // 示例：添加版本号注释
      transformedCode = `// Version: 1.0.0\n${transformedCode}`
      
      return {
        code: transformedCode,
        map: null  // 如果需要 source map，在这里生成
      }
    }
  }
}
```

### 5.3 文件处理插件

```typescript
/**
 * 自定义文件处理插件
 */
export function fileProcessorPlugin(options: {
  pattern: RegExp
  transform: (content: string) => string
}): UnifiedPlugin {
  return {
    name: 'file-processor-plugin',
    
    onLoad(id) {
      // 匹配文件模式
      if (!options.pattern.test(id)) {
        return null
      }
      
      // 读取文件内容
      const content = fs.readFileSync(id, 'utf-8')
      
      // 转换内容
      const transformed = options.transform(content)
      
      return {
        code: transformed,
        map: null
      }
    }
  }
}

// 使用示例：处理 .txt 文件
export default defineConfig({
  plugins: [
    fileProcessorPlugin({
      pattern: /\.txt$/,
      transform: (content) => {
        // 将 .txt 文件转换为 ES 模块
        return `export default ${JSON.stringify(content)}`
      }
    })
  ]
})
```

### 5.4 缓存插件

```typescript
/**
 * 带缓存的插件
 */
export function cachedPlugin(): UnifiedPlugin {
  const cache = new Map<string, any>()
  
  return {
    name: 'cached-plugin',
    
    onTransform(code, id) {
      // 检查缓存
      const cacheKey = `${id}:${hashCode(code)}`
      if (cache.has(cacheKey)) {
        return cache.get(cacheKey)
      }
      
      // 执行转换（耗时操作）
      const result = expensiveTransform(code)
      
      // 保存缓存
      cache.set(cacheKey, result)
      
      return result
    },
    
    async onDispose() {
      // 清理缓存
      cache.clear()
    }
  }
}
```

---

## 6. 最佳实践

### 6.1 性能优化 ⭐⭐⭐⭐⭐

**✅ 使用缓存**
```typescript
export function optimizedPlugin(): UnifiedPlugin {
  const cache = new Map()
  
  return {
    name: 'optimized-plugin',
    onTransform(code, id) {
      const key = generateKey(id, code)
      
      if (cache.has(key)) {
        return cache.get(key)  // 直接返回缓存
      }
      
      const result = transform(code)
      cache.set(key, result)
      return result
    }
  }
}
```

**✅ 避免同步 I/O**
```typescript
// ❌ 不好：同步读取文件
onLoad(id) {
  return fs.readFileSync(id, 'utf-8')  // 阻塞
}

// ✅ 好：异步读取文件
async onLoad(id) {
  return await fs.readFile(id, 'utf-8')  // 非阻塞
}
```

**✅ 使用流式处理**
```typescript
export function streamPlugin(): UnifiedPlugin {
  return {
    name: 'stream-plugin',
    async onLoad(id) {
      if (isLargeFile(id)) {
        // 大文件使用流式处理
        return await processStream(
          fs.createReadStream(id)
        )
      }
      return null
    }
  }
}
```

### 6.2 错误处理 ⭐⭐⭐⭐⭐

**✅ 优雅的错误处理**
```typescript
export function safePlugin(): UnifiedPlugin {
  return {
    name: 'safe-plugin',
    
    async onBuildStart(context) {
      try {
        await performTask()
      } catch (error) {
        // 记录错误但不中断构建
        context.logger.warn('插件执行失败:', error)
        
        // 或者抛出详细的错误
        throw new BuilderError(
          ErrorCode.PLUGIN_ERROR,
          '插件执行失败',
          {
            phase: 'onBuildStart',
            cause: error as Error,
            suggestion: '检查插件配置'
          }
        )
      }
    }
  }
}
```

**✅ 提供降级方案**
```typescript
export function resilientPlugin(): UnifiedPlugin {
  return {
    name: 'resilient-plugin',
    
    onTransform(code, id) {
      try {
        return optimizedTransform(code)
      } catch (error) {
        // 降级到基础转换
        return basicTransform(code)
      }
    }
  }
}
```

### 6.3 配置验证 ⭐⭐⭐⭐

**✅ 验证插件选项**
```typescript
import { z } from 'zod'

// 定义选项 schema
const optionsSchema = z.object({
  enabled: z.boolean().default(true),
  output: z.string().min(1),
  quality: z.number().min(0).max(100).default(80)
})

export function validatedPlugin(
  options: z.infer<typeof optionsSchema>
): UnifiedPlugin {
  // 验证选项
  const validated = optionsSchema.parse(options)
  
  return {
    name: 'validated-plugin',
    apply(config) {
      // 使用验证后的选项
      return enhanceConfig(config, validated)
    }
  }
}
```

---

## 7. 调试和测试

### 7.1 调试插件

**方法1：使用日志**
```typescript
export function debugPlugin(): UnifiedPlugin {
  return {
    name: 'debug-plugin',
    
    apply(config) {
      console.log('配置before:', config)
      const result = modifyConfig(config)
      console.log('配置after:', result)
      return result
    },
    
    onTransform(code, id) {
      console.log(`转换文件: ${id}`)
      console.log(`代码长度: ${code.length}`)
      return null
    }
  }
}
```

**方法2：使用调试器**
```bash
# 启用 Node.js 调试器
node --inspect-brk ./node_modules/.bin/ldesign-builder build
```

**方法3：使用性能分析**
```typescript
export function profiledPlugin(): UnifiedPlugin {
  return {
    name: 'profiled-plugin',
    
    async onTransform(code, id) {
      const start = performance.now()
      
      const result = await transform(code)
      
      const duration = performance.now() - start
      console.log(`转换 ${id} 耗时: ${duration}ms`)
      
      return result
    }
  }
}
```

### 7.2 测试插件

**单元测试示例：**
```typescript
// __tests__/my-plugin.test.ts
import { describe, it, expect } from 'vitest'
import { myPlugin } from '../src/plugins/my-plugin'

describe('myPlugin', () => {
  it('应该正确修改配置', () => {
    const plugin = myPlugin({ enabled: true })
    
    const inputConfig = {
      input: 'src/index.ts',
      output: { dir: 'dist' }
    }
    
    const outputConfig = plugin.apply(inputConfig)
    
    expect(outputConfig).toHaveProperty('plugins')
    expect(outputConfig.plugins).toHaveLength(1)
  })
  
  it('应该处理 onBuildStart 钩子', async () => {
    const plugin = myPlugin()
    
    const context = createMockContext()
    
    await plugin.onBuildStart?.(context)
    
    // 验证钩子执行了预期的操作
  })
})
```

**集成测试示例：**
```typescript
// __tests__/integration/plugin-integration.test.ts
import { LibraryBuilder } from '@ldesign/builder'
import { myPlugin } from '../src/plugins/my-plugin'

describe('Plugin Integration', () => {
  it('应该与构建器正确集成', async () => {
    const builder = new LibraryBuilder()
    
    const result = await builder.build({
      input: 'test-fixtures/index.ts',
      output: { dir: 'test-output' },
      plugins: [myPlugin()]
    })
    
    expect(result.success).toBe(true)
    expect(result.outputs.length).toBeGreaterThan(0)
  })
})
```

---

## 8. 发布插件

### 8.1 准备发布

**package.json 配置：**
```json
{
  "name": "@myorg/builder-plugin-xxx",
  "version": "1.0.0",
  "description": "A plugin for @ldesign/builder",
  "keywords": [
    "ldesign",
    "builder",
    "plugin",
    "bundler"
  ],
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "files": [
    "dist",
    "README.md"
  ],
  "peerDependencies": {
    "@ldesign/builder": "^1.0.0"
  }
}
```

### 8.2 README 模板

```markdown
# @myorg/builder-plugin-xxx

> 简短的插件描述

## 安装

\`\`\`bash
npm install @myorg/builder-plugin-xxx --save-dev
\`\`\`

## 使用

\`\`\`typescript
import { defineConfig } from '@ldesign/builder'
import { xxxPlugin } from '@myorg/builder-plugin-xxx'

export default defineConfig({
  plugins: [
    xxxPlugin({
      // 选项
    })
  ]
})
\`\`\`

## 选项

### option1

- Type: `boolean`
- Default: `true`

说明...

## License

MIT
```

### 8.3 发布检查清单

- [ ] ✅ 完整的 README 文档
- [ ] ✅ 完整的 TypeScript 类型定义
- [ ] ✅ 单元测试覆盖率 >80%
- [ ] ✅ 集成测试通过
- [ ] ✅ 示例代码可运行
- [ ] ✅ LICENSE 文件
- [ ] ✅ CHANGELOG 文档
- [ ] ✅ 语义化版本

**发布命令：**
```bash
# 1. 测试
npm test

# 2. 构建
npm run build

# 3. 发布
npm publish --access public
```

---

## 🎯 实战示例

### 示例1：CSS 压缩插件

```typescript
/**
 * CSS 压缩插件
 */
import CleanCSS from 'clean-css'

export interface CSSMinifyOptions {
  level?: 0 | 1 | 2
}

export function cssMinifyPlugin(
  options: CSSMinifyOptions = {}
): UnifiedPlugin {
  const cleaner = new CleanCSS({
    level: options.level || 2
  })
  
  return {
    name: 'css-minify-plugin',
    
    onTransform(code, id) {
      // 只处理 CSS 文件
      if (!id.endsWith('.css')) {
        return null
      }
      
      // 压缩 CSS
      const output = cleaner.minify(code)
      
      if (output.errors.length > 0) {
        throw new Error(`CSS 压缩失败: ${output.errors.join(', ')}`)
      }
      
      return {
        code: output.styles,
        map: output.sourceMap
      }
    }
  }
}
```

### 示例2：环境变量注入插件

```typescript
/**
 * 环境变量注入插件
 */
export function envPlugin(vars: Record<string, string>): UnifiedPlugin {
  return {
    name: 'env-plugin',
    
    apply(config) {
      return {
        ...config,
        define: {
          ...config.define,
          // 注入环境变量
          ...Object.fromEntries(
            Object.entries(vars).map(([key, value]) => [
              `process.env.${key}`,
              JSON.stringify(value)
            ])
          )
        }
      }
    }
  }
}

// 使用
export default defineConfig({
  plugins: [
    envPlugin({
      API_URL: 'https://api.example.com',
      VERSION: '1.0.0'
    })
  ]
})
```

### 示例3：构建通知插件

```typescript
/**
 * 构建通知插件
 */
import notifier from 'node-notifier'

export function notificationPlugin(): UnifiedPlugin {
  return {
    name: 'notification-plugin',
    
    async onBuildEnd(context, result) {
      if (result.success) {
        notifier.notify({
          title: '✅ 构建成功',
          message: `耗时: ${result.duration}ms`,
          sound: 'Ping'
        })
      } else {
        notifier.notify({
          title: '❌ 构建失败',
          message: result.errors[0]?.message || '未知错误',
          sound: 'Basso'
        })
      }
    }
  }
}
```

### 示例4：代码分析插件

```typescript
/**
 * 代码质量分析插件
 */
export function codeQualityPlugin(): UnifiedPlugin {
  const issues: any[] = []
  
  return {
    name: 'code-quality-plugin',
    
    onTransform(code, id) {
      // 检查代码质量
      if (code.includes('eval(')) {
        issues.push({
          file: id,
          message: '不建议使用 eval()',
          severity: 'warning'
        })
      }
      
      if (code.length > 10000) {
        issues.push({
          file: id,
          message: '文件过大，建议拆分',
          severity: 'info'
        })
      }
      
      return null
    },
    
    async onBuildEnd(context) {
      if (issues.length > 0) {
        context.logger.warn(`发现 ${issues.length} 个代码质量问题`)
        issues.forEach(issue => {
          context.logger.warn(`  ${issue.file}: ${issue.message}`)
        })
      }
    }
  }
}
```

---

## 💡 插件开发技巧

### 技巧1：使用 TypeScript

```typescript
// ✅ 使用 TypeScript 获得类型安全和智能提示
import type { UnifiedPlugin } from '@ldesign/builder'

export function myPlugin(): UnifiedPlugin {
  return {
    name: 'my-plugin',
    apply(config) {
      // IDE 会提供智能提示
      return config
    }
  }
}
```

### 技巧2：提供选项默认值

```typescript
export interface PluginOptions {
  enabled?: boolean
  quality?: number
}

export function myPlugin(userOptions: PluginOptions = {}): UnifiedPlugin {
  // 合并默认选项
  const options = {
    enabled: true,
    quality: 80,
    ...userOptions
  }
  
  return { /* ... */ }
}
```

### 技巧3：支持插件组合

```typescript
export function compositePlugin(
  ...plugins: UnifiedPlugin[]
): UnifiedPlugin {
  return {
    name: 'composite-plugin',
    
    apply(config) {
      // 依次应用所有插件
      return plugins.reduce(
        (cfg, plugin) => plugin.apply(cfg),
        config
      )
    },
    
    async onBuildStart(context) {
      // 依次调用所有插件的钩子
      for (const plugin of plugins) {
        await plugin.onBuildStart?.(context)
      }
    }
  }
}

// 使用
export default defineConfig({
  plugins: [
    compositePlugin(
      plugin1(),
      plugin2(),
      plugin3()
    )
  ]
})
```

---

## 📚 插件示例库

### 官方插件

- `@ldesign/builder/plugins/tailwind` - Tailwind CSS 支持
- `@ldesign/builder/plugins/css-in-js` - CSS-in-JS 支持
- `@ldesign/builder/plugins/image-optimizer` - 图片优化
- `@ldesign/builder/plugins/svg-optimizer` - SVG 优化
- `@ldesign/builder/plugins/i18n-extractor` - 国际化提取

### 社区插件

- `@myorg/builder-plugin-analyze` - 构建分析
- `@myorg/builder-plugin-compress` - 高级压缩
- `@myorg/builder-plugin-cdn` - CDN 上传

---

## 🎓 学习资源

- [Rollup 插件开发](https://rollupjs.org/guide/en/#plugin-development)
- [Vite 插件开发](https://vitejs.dev/guide/api-plugin.html)
- [官方插件源码](https://github.com/ldesign/builder/tree/main/src/plugins)

---

## 💬 获取帮助

- 💬 [GitHub Discussions](https://github.com/ldesign/builder/discussions)
- 🐛 [提交 Issue](https://github.com/ldesign/builder/issues)
- 📧 邮件：plugin-dev@ldesign.dev

---

**祝你开发愉快！** 🎉

如果你开发了有用的插件，欢迎提交到[插件市场](https://ldesign.dev/plugins)！

