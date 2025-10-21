/**
 * Qwik 框架策略
 * 
 * 为 Qwik 组件库提供完整的构建策略
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import type { ILibraryStrategy } from '../../types/strategy'
import { LibraryType } from '../../types/library'
import type { BuilderConfig } from '../../types/config'
import type { UnifiedConfig } from '../../types/adapter'

/**
 * Qwik 库构建策略
 */
export class QwikStrategy implements ILibraryStrategy {
  readonly name = 'qwik'
  readonly supportedTypes: LibraryType[] = [LibraryType.QWIK as any]
  readonly priority = 15

  /**
   * 应用 Qwik 策略
   */
  async applyStrategy(config: BuilderConfig): Promise<UnifiedConfig> {
    return {
      input: config.input || 'src/index.ts',
      output: {
        format: ['esm'], // Qwik 主要使用 ESM
        dir: config.output?.dir || 'dist',
        sourcemap: config.output?.sourcemap ?? true,
        esm: {
          dir: 'dist',
          preserveStructure: true
        }
      },
      plugins: this.buildPlugins(config),
      external: this.getExternalDeps(config),
      treeshake: true
    }
  }

  /**
   * 检查策略是否适用
   */
  isApplicable(config: BuilderConfig): boolean {
    return config.libraryType === ('qwik' as any)
  }

  /**
   * 获取默认配置
   */
  getDefaultConfig(): Partial<BuilderConfig> {
    return {
      libraryType: 'qwik' as any,
      output: {
        format: ['esm'],
        sourcemap: true
      },
      performance: {
        treeshaking: true
      }
    }
  }

  /**
   * 构建插件配置
   */
  private buildPlugins(config: BuilderConfig): any[] {
    const plugins: any[] = []

    // Qwik 插件
    plugins.push({
      name: 'qwik',
      plugin: async () => {
        try {
          const qwikVite = await import('@builder.io/qwik/optimizer')
          return qwikVite.qwikRollup({
            target: 'lib',
            buildMode: config.mode === 'development' ? 'development' : 'production'
          })
        } catch (error) {
          throw new Error('Qwik 插件加载失败，请确保已安装 @builder.io/qwik')
        }
      }
    })

    // TypeScript 插件
    plugins.push({
      name: 'typescript',
      plugin: async () => {
        const typescript = await import('@rollup/plugin-typescript')
        return typescript.default({
          tsconfig: config.typescript?.tsconfig || 'tsconfig.json',
          declaration: true,
          declarationDir: 'dist',
          compilerOptions: {
            target: 'ES2020',
            module: 'ESNext',
            jsx: 'react-jsx',
            jsxImportSource: '@builder.io/qwik'
          }
        })
      }
    })

    // 样式处理
    plugins.push({
      name: 'postcss',
      plugin: async () => {
        const postcss = await import('rollup-plugin-postcss')
        return postcss.default({
          extract: true,
          minimize: config.mode === 'production',
          modules: true
        })
      }
    })

    return plugins
  }

  /**
   * 获取外部依赖
   */
  private getExternalDeps(config: BuilderConfig): string[] {
    const defaults = [
      '@builder.io/qwik',
      '@builder.io/qwik/jsx-runtime',
      '@builder.io/qwik/jsx-dev-runtime'
    ]

    if (config.external) {
      if (Array.isArray(config.external)) {
        return [...defaults, ...config.external]
      }
    }

    return defaults
  }

  /**
   * 获取推荐插件
   */
  getRecommendedPlugins(config: BuilderConfig): any[] {
    return this.buildPlugins(config)
  }

  /**
   * 验证配置
   */
  validateConfig(config: BuilderConfig): any {
    const errors: string[] = []
    const warnings: string[] = []

    if (!config.input) {
      errors.push('未指定入口文件')
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }
}

