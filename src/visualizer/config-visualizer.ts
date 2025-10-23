/**
 * 配置可视化工具
 * 
 * 提供交互式的配置生成和可视化预览
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import type { BuilderConfig } from '../types/config'
import path from 'path'
import fs from 'fs-extra'

/**
 * 配置模板
 */
export interface ConfigTemplate {
  id: string
  name: string
  description: string
  tags: string[]
  config: Partial<BuilderConfig>
  preview?: string
}

/**
 * 配置可视化器
 */
export class ConfigVisualizer {
  private templates: Map<string, ConfigTemplate> = new Map()

  constructor() {
    this.registerDefaultTemplates()
  }

  /**
   * 注册默认模板
   */
  private registerDefaultTemplates(): void {
    // Vue 3 组件库模板
    this.registerTemplate({
      id: 'vue3-component-library',
      name: 'Vue 3 组件库',
      description: '适用于 Vue 3 组件库开发',
      tags: ['vue', 'vue3', 'component-library'],
      config: {
        libraryType: 'vue3' as any,
        bundler: 'rollup' as any,
        output: {
          esm: { dir: 'es', format: 'esm', dts: true },
          cjs: { dir: 'lib', format: 'cjs', dts: true },
          umd: { dir: 'dist', format: 'umd', minify: true }
        },
        external: ['vue'],
        globals: { vue: 'Vue' }
      }
    })

    // React 组件库模板
    this.registerTemplate({
      id: 'react-component-library',
      name: 'React 组件库',
      description: '适用于 React 组件库开发',
      tags: ['react', 'component-library'],
      config: {
        libraryType: 'react' as any,
        bundler: 'rollup' as any,
        output: {
          esm: { dir: 'es', format: 'esm', dts: true },
          cjs: { dir: 'lib', format: 'cjs', dts: true }
        },
        external: ['react', 'react-dom'],
        globals: { react: 'React', 'react-dom': 'ReactDOM' }
      }
    })

    // TypeScript 工具库模板
    this.registerTemplate({
      id: 'typescript-utility-library',
      name: 'TypeScript 工具库',
      description: '适用于纯 TypeScript 工具库',
      tags: ['typescript', 'utility'],
      config: {
        libraryType: 'typescript' as any,
        bundler: 'esbuild' as any,
        output: {
          esm: { dir: 'dist', format: 'esm', dts: true }
        },
        minify: true
      }
    })

    // Monorepo 包模板
    this.registerTemplate({
      id: 'monorepo-package',
      name: 'Monorepo 包',
      description: '适用于 monorepo 中的标准包',
      tags: ['monorepo', 'workspace'],
      config: {
        bundler: 'rollup' as any,
        output: {
          esm: { dir: 'es', format: 'esm', preserveStructure: true, dts: true },
          cjs: { dir: 'lib', format: 'cjs', preserveStructure: true, dts: true },
          umd: { dir: 'dist', format: 'umd', minify: true }
        },
        clean: true
      }
    })

    // 快速开发模板
    this.registerTemplate({
      id: 'fast-development',
      name: '极速开发',
      description: '使用 esbuild 实现极速开发构建',
      tags: ['development', 'fast', 'esbuild'],
      config: {
        bundler: 'esbuild' as any,
        mode: 'development',
        sourcemap: true,
        minify: false,
        dts: false
      }
    })

    // 生产优化模板
    this.registerTemplate({
      id: 'production-optimized',
      name: '生产优化',
      description: '使用 swc 实现快速生产构建',
      tags: ['production', 'optimized', 'swc'],
      config: {
        bundler: 'swc' as any,
        mode: 'production',
        minify: true,
        sourcemap: true,
        dts: true,
        clean: true
      }
    })
  }

  /**
   * 注册模板
   */
  registerTemplate(template: ConfigTemplate): void {
    this.templates.set(template.id, template)
  }

  /**
   * 获取所有模板
   */
  getTemplates(tags?: string[]): ConfigTemplate[] {
    let templates = Array.from(this.templates.values())

    if (tags && tags.length > 0) {
      templates = templates.filter(t =>
        tags.some(tag => t.tags.includes(tag))
      )
    }

    return templates
  }

  /**
   * 获取模板
   */
  getTemplate(id: string): ConfigTemplate | undefined {
    return this.templates.get(id)
  }

  /**
   * 应用模板
   */
  applyTemplate(templateId: string, overrides?: Partial<BuilderConfig>): BuilderConfig {
    const template = this.templates.get(templateId)
    if (!template) {
      throw new Error(`模板不存在: ${templateId}`)
    }

    return {
      ...template.config,
      ...overrides
    } as BuilderConfig
  }

  /**
   * 可视化配置（生成配置树）
   */
  visualizeConfig(config: BuilderConfig): string {
    return this.buildConfigTree(config, 0)
  }

  /**
   * 构建配置树
   */
  private buildConfigTree(obj: any, indent: number): string {
    const spaces = '  '.repeat(indent)
    let result = ''

    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) {
        continue
      }

      if (typeof value === 'object' && !Array.isArray(value)) {
        result += `${spaces}${key}:\n`
        result += this.buildConfigTree(value, indent + 1)
      } else if (Array.isArray(value)) {
        result += `${spaces}${key}: [${value.length} items]\n`
      } else {
        result += `${spaces}${key}: ${JSON.stringify(value)}\n`
      }
    }

    return result
  }

  /**
   * 生成配置文件
   */
  async generateConfigFile(config: BuilderConfig, outputPath?: string): Promise<string> {
    const configPath = outputPath || path.join(process.cwd(), '.ldesign', 'builder.config.ts')

    const content = `/**
 * @ldesign/builder 配置
 * 
 * 自动生成于 ${new Date().toLocaleString()}
 */

export default ${JSON.stringify(config, null, 2)}
`

    await fs.ensureDir(path.dirname(configPath))
    await fs.writeFile(configPath, content)

    return configPath
  }

  /**
   * 启动可视化服务器（Web UI）
   */
  async startVisualServer(port: number = 3030): Promise<void> {
    // 这里应该启动一个 Vite 开发服务器
    // 提供 Vue 3 界面进行交互式配置
    console.log(`可视化配置服务器将在 http://localhost:${port} 启动`)
    console.log('（需要实现完整的 Web UI）')
  }

  /**
   * 导出为 Markdown
   */
  exportToMarkdown(config: BuilderConfig): string {
    return `# 构建配置

## 基础配置

- **打包器**: ${config.bundler || 'rollup'}
- **模式**: ${config.mode || 'production'}
- **库类型**: ${config.libraryType || '自动检测'}

## 输出配置

\`\`\`json
${JSON.stringify(config.output, null, 2)}
\`\`\`

## 外部依赖

${Array.isArray(config.external) ? config.external.map(e => `- ${e}`).join('\n') : '无'}

## 插件

${config.plugins && config.plugins.length > 0 ? `共 ${config.plugins.length} 个插件` : '无'}

---

生成时间: ${new Date().toLocaleString()}
`
  }
}

/**
 * 创建配置可视化器
 */
export function createConfigVisualizer(): ConfigVisualizer {
  return new ConfigVisualizer()
}


