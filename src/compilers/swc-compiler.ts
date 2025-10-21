/**
 * SWC 编译器集成
 * 提供 10-20倍的编译速度提升
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import type { Plugin } from 'rollup'
import type { Logger } from '../utils/logger'

/**
 * SWC 编译器选项
 */
export interface SWCCompilerOptions {
  /** 是否启用 SWC */
  enabled?: boolean
  /** 目标环境 */
  target?: string
  /** 是否启用 JSX */
  jsx?: boolean
  /** JSX 运行时 */
  jsxImportSource?: string
  /** 是否压缩 */
  minify?: boolean
  /** 是否生成 source map */
  sourceMaps?: boolean
  /** 包含的文件 */
  include?: RegExp | string[]
  /** 排除的文件 */
  exclude?: RegExp | string[]
}

/**
 * 创建 SWC 编译器插件
 */
export function swcPlugin(options: SWCCompilerOptions = {}): Plugin {
  const {
    enabled = true,
    target = 'es2020',
    jsx = false,
    jsxImportSource,
    minify = false,
    sourceMaps = true,
    include = /\.(tsx?|jsx?)$/,
    exclude = /node_modules/
  } = options

  let swc: any

  return {
    name: 'swc-compiler',

    async buildStart() {
      if (!enabled) return

      try {
        // 动态导入 SWC (可选依赖)
        swc = await import('@swc/core')
      } catch (error) {
        this.warn('SWC 未安装，将回退到 TypeScript/esbuild 编译器')
        this.warn('安装 SWC: npm install @swc/core --save-dev')
      }
    },

    async transform(code, id) {
      if (!enabled || !swc) return null

      // 检查文件是否应该处理
      const shouldInclude = typeof include === 'object' && 'test' in include
        ? include.test(id)
        : Array.isArray(include)
        ? include.some(pattern => id.includes(pattern))
        : true

      const shouldExclude = typeof exclude === 'object' && 'test' in exclude
        ? exclude.test(id)
        : false

      if (!shouldInclude || shouldExclude) {
        return null
      }

      try {
        const result = await swc.transform(code, {
          filename: id,
          jsc: {
            target,
            parser: {
              syntax: id.endsWith('.ts') || id.endsWith('.tsx') ? 'typescript' : 'ecmascript',
              tsx: id.endsWith('.tsx') || id.endsWith('.jsx'),
              decorators: true,
              dynamicImport: true
            },
            transform: jsx ? {
              react: {
                runtime: 'automatic',
                importSource: jsxImportSource
              }
            } : undefined,
            minify: minify ? {
              compress: {
                unused: true
              },
              mangle: true
            } : undefined
          },
          sourceMaps: sourceMaps,
          minify
        })

        return {
          code: result.code,
          map: result.map || null
        }
      } catch (error) {
        this.error(`SWC 编译失败: ${(error as Error).message}`)
        return null
      }
    }
  }
}

/**
 * SWC 压缩插件
 */
export function swcMinifyPlugin(options: {
  compress?: boolean
  mangle?: boolean
} = {}): Plugin {
  const {
    compress = true,
    mangle = true
  } = options

  let swc: any

  return {
    name: 'swc-minify',

    async buildStart() {
      try {
        swc = await import('@swc/core')
      } catch (error) {
        this.warn('SWC 未安装，压缩功能将被跳过')
      }
    },

    async renderChunk(code, chunk) {
      if (!swc) return null

      try {
        const result = await swc.minify(code, {
          compress: compress ? {
            unused: true,
            dead_code: true,
            drop_console: false
          } : false,
          mangle: mangle ? {
            toplevel: false
          } : false
        })

        return {
          code: result.code,
          map: result.map || null
        }
      } catch (error) {
        this.warn(`SWC 压缩失败: ${(error as Error).message}`)
        return null
      }
    }
  }
}

