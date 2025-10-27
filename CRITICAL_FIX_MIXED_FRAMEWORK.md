# 🚨 混合框架 JSX 转换问题修复

## 问题描述

@ldesign/chart 使用极简配置构建后，React 组件被错误转换为 Vue 代码：

```javascript
// ❌ 错误：React 组件中出现了 Vue 的导入
import { createVNode, createTextVNode } from 'vue';
import { forwardRef, useRef } from 'react';
```

## 根本原因

虽然创建了以下新系统：
- ✅ `ProjectAnalyzer` - 智能项目分析器
- ✅ `SmartConfigGenerator` - 智能配置生成器  
- ✅ `EnhancedMixedStrategy` - 混合框架策略

**但是**，这些新系统没有被集成到 `LibraryBuilder` 的实际构建流程中！

当前构建流程：
```
用户配置 → ConfigManager → 旧的策略系统 → 构建
         ❌ SmartConfigGenerator 从未被调用
```

期望的构建流程：
```
用户配置 → ProjectAnalyzer → SmartConfigGenerator → 增强配置 → EnhancedMixedStrategy → 构建
```

## 解决方案

### 方案 1: 快速修复（临时）

在 chart 项目中使用显式配置：

```typescript
// libraries/chart/builder.config.ts
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  name: 'LDesignChart',
  
  // 显式指定混合框架配置
  override: {
    libraryType: 'enhanced-mixed',
    mixedFramework: {
      mode: 'separated',
      jsx: {
        autoDetect: true,
        fileAssociations: {
          '**/adapters/vue/**/*.ts': 'vue',
          '**/adapters/vue/**/*.vue': 'vue',
          '**/adapters/react/**/*.ts': 'react',
          '**/adapters/react/**/*.tsx': 'react',
          '**/adapters/lit/**/*.ts': 'auto'
        }
      },
      frameworks: {
        vue: { version: 3, external: ['vue'] },
        react: { jsx: 'automatic', external: ['react', 'react-dom'] }
      }
    }
  }
})
```

### 方案 2: 完整修复（推荐）

修改 `LibraryBuilder` 集成智能配置生成器。

#### 步骤 1: 修改 LibraryBuilder.ts

```typescript
import { SmartConfigGenerator } from '../config/minimal-config'
import { ProjectAnalyzer } from '../analyzers/project-analyzer'

export class LibraryBuilder extends EventEmitter {
  // 添加新的成员
  private smartConfigGenerator?: SmartConfigGenerator
  private projectAnalyzer?: ProjectAnalyzer
  
  constructor(options: BuilderOptions) {
    super()
    
    // 如果用户使用 MinimalConfig，启用智能生成
    if (this.isMinimalConfig(options.config)) {
      this.projectAnalyzer = new ProjectAnalyzer(this.logger)
      this.smartConfigGenerator = new SmartConfigGenerator(this.logger)
    }
    
    this.config = options.config
    // ...
  }
  
  private async enhanceConfig(): Promise<BuilderConfig> {
    // 如果有智能生成器，使用它增强配置
    if (this.smartConfigGenerator && this.isMinimalConfig(this.config)) {
      const analysis = await this.projectAnalyzer!.analyze()
      const smartConfig = await this.smartConfigGenerator.generate(
        this.config as any,
        process.cwd()
      )
      
      // 合并智能配置
      return {
        ...smartConfig,
        ...this.config.override // 用户覆盖优先
      }
    }
    
    return this.config
  }
  
  async build(): Promise<BuildResult> {
    // 首先增强配置
    const enhancedConfig = await this.enhanceConfig()
    
    // 使用增强后的配置构建
    this.config = enhancedConfig
    
    // 继续原有流程...
  }
}
```

#### 步骤 2: 修复 ProjectAnalyzer 的框架检测

当前的 `ProjectAnalyzer` 只检测框架存在，需要增强文件关联：

```typescript
class ProjectAnalyzer {
  async analyze(root: string): Promise<ProjectAnalysis> {
    // ... 现有代码
    
    // 🆕 生成文件关联映射
    const fileAssociations = this.generateFileAssociations(
      sourceFiles,
      frameworks
    )
    
    return {
      // ... 现有字段
      fileAssociations // 新增
    }
  }
  
  private generateFileAssociations(
    files: string[],
    frameworks: ProjectAnalysis['frameworks']
  ): Record<string, 'vue' | 'react' | 'auto'> {
    const associations: Record<string, 'vue' | 'react' | 'auto'> = {}
    
    for (const file of files) {
      // Vue 文件
      if (file.endsWith('.vue') || file.includes('/vue/')) {
        associations[`**/${file.replace(/\\/g, '/')}`] = 'vue'
      }
      // React 文件
      else if (file.includes('/react/') && file.match(/\.[jt]sx?$/)) {
        associations[`**/${file.replace(/\\/g, '/')}`] = 'react'
      }
      // Lit 文件
      else if (file.includes('/lit/')) {
        associations[`**/${file.replace(/\\/g, '/')}`] = 'auto'
      }
    }
    
    return associations
  }
}
```

#### 步骤 3: 修复 SmartConfigGenerator

确保混合框架配置被正确生成：

```typescript
class SmartConfigGenerator {
  private generateFrameworkConfig(analysis: ProjectAnalysis) {
    const config: Partial<BuilderConfig> = {}
    
    const frameworkCount = Object.keys(analysis.frameworks).length
    
    // 🔥 关键：检测到多框架时，自动使用混合策略
    if (frameworkCount > 1) {
      config.libraryType = 'enhanced-mixed'
      config.mixedFramework = {
        mode: 'separated',
        jsx: {
          autoDetect: true,
          fileAssociations: analysis.fileAssociations || {}
        },
        frameworks: {
          ...(analysis.frameworks.vue && {
            vue: {
              version: analysis.frameworks.vue.version,
              external: ['vue', '@vue/composition-api']
            }
          }),
          ...(analysis.frameworks.react && {
            react: {
              jsx: analysis.frameworks.react.jsx,
              external: ['react', 'react-dom']
            }
          }),
          ...(analysis.frameworks.lit && {
            lit: {
              external: ['lit', '@lit/reactive-element']
            }
          })
        }
      }
    }
    // 单框架配置
    else if (analysis.frameworks.vue) {
      config.vue = analysis.frameworks.vue
    }
    else if (analysis.frameworks.react) {
      config.react = analysis.frameworks.react
    }
    
    return config
  }
}
```

## 立即行动方案

### 选择 A: 快速修复（5分钟）
使用方案 1，给 chart 项目添加显式配置。

**优点**: 
- ✅ 立即可用
- ✅ 不需要修改 builder 代码

**缺点**:
- ❌ 违背了零配置的初衷
- ❌ 其他项目还会遇到同样问题

### 选择 B: 完整修复（30分钟）
实施方案 2，真正集成智能配置系统。

**优点**:
- ✅ 真正实现零配置
- ✅ 一劳永逸
- ✅ 所有混合框架项目都受益

**缺点**:
- ❌ 需要更多时间
- ❌ 需要测试验证

## 建议

**立即执行**: 方案 1（快速修复）让 chart 项目能正常工作  
**后续完善**: 方案 2（完整修复）实现真正的智能零配置

## 测试验证

修复后验证：

```bash
cd libraries/chart
pnpm build:builder
```

检查产物：
```javascript
// es/adapters/react/components/Chart.js
// ✅ 应该只导入 react
import { forwardRef, useRef } from 'react';

// ❌ 不应该导入 vue
// import { createVNode } from 'vue';
```

```javascript
// es/adapters/vue/components/Chart.js  
// ✅ 应该只导入 vue
import { defineComponent } from 'vue';

// ❌ 不应该导入 react
// import { forwardRef } from 'react';
```

---

**状态**: 🚨 待修复  
**优先级**: P0 - 关键问题  
**影响范围**: 所有混合框架项目
