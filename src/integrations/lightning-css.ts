/**
 * Lightning CSS 集成
 * 
 * 使用 Lightning CSS 进行超快速 CSS 处理
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import type { UnifiedPlugin } from '../types/plugin'
import { Logger } from '../utils/logger'

/**
 * Lightning CSS 配置选项
 */
export interface LightningCSSOptions {
  /** 是否启用 */
  enabled?: boolean

  /** 目标浏览器 */
  targets?: string | Record<string, string>

  /** 是否压缩 */
  minify?: boolean

  /** 是否启用 CSS 模块 */
  cssModules?: boolean | {
    pattern?: string
  }

  /** 是否添加浏览器前缀 */
  autoprefixer?: boolean

  /** 是否生成 source map */
  sourcemap?: boolean

  /** 草案语法支持 */
  drafts?: {
    nesting?: boolean
    customMedia?: boolean
  }
}

/**
 * Lightning CSS 集成插件
 */
export function lightningCSSPlugin(options: LightningCSSOptions = {}): UnifiedPlugin {
  const opts = {
    enabled: options.enabled !== false,
    targets: options.targets || 'defaults',
    minify: options.minify !== false,
    cssModules: options.cssModules || false,
    autoprefixer: options.autoprefixer !== false,
    sourcemap: options.sourcemap || false,
    drafts: {
      nesting: options.drafts?.nesting !== false,
      customMedia: options.drafts?.customMedia !== false
    }
  }

  const logger = new Logger({ prefix: 'LightningCSS' })
  let lightningcss: any

  // 尝试加载 Lightning CSS
  try {
    lightningcss = require('lightningcss')
  } catch {
    logger.warn('Lightning CSS 未安装，跳过集成')
    opts.enabled = false
  }

  return {
    name: 'lightning-css',

    rollup: {
      name: 'lightning-css',

      async transform(code: string, id: string) {
        if (!opts.enabled || !this.isCSSFile(id)) {
          return null
        }

        try {
          const result = await this.transformCSS(code, id)
          return result
        } catch (error) {
          logger.error(`CSS 处理失败: ${id}`, error)
          return null
        }
      },

      isCSSFile(filePath: string): boolean {
        return filePath.endsWith('.css')
      },

      async transformCSS(code: string, filePath: string): Promise<{ code: string; map?: any }> {
        if (!lightningcss) {
          return { code }
        }

        const result = lightningcss.transform({
          filename: filePath,
          code: Buffer.from(code),
          minify: opts.minify,
          sourceMap: opts.sourcemap,
          targets: this.parseTargets(opts.targets),
          drafts: opts.drafts,
          cssModules: opts.cssModules ? {} : undefined
        })

        return {
          code: result.code.toString(),
          map: result.map ? JSON.parse(result.map.toString()) : undefined
        }
      },

      parseTargets(targets: string | Record<string, string>): any {
        if (typeof targets === 'string') {
          // 解析 browserslist 查询
          return { browsers: targets }
        }
        return targets
      }
    }

    // esbuild 插件实现（可选）
    /*
    , esbuild: {
      name: 'lightning-css',
      setup(build: any) {
        if (!opts.enabled) {
          return
        }

        build.onLoad({ filter: /\.css$/ }, async (args: any) => {
          const fs = require('fs-extra')
          const code = await fs.readFile(args.path, 'utf-8')

          if (!lightningcss) {
            return { contents: code, loader: 'css' }
          }

          try {
            const result = lightningcss.transform({
              filename: args.path,
              code: Buffer.from(code),
              minify: opts.minify,
              targets: opts.targets
            })

            return {
              contents: result.code.toString(),
              loader: 'css'
            }
          } catch (error) {
            logger.error(`Lightning CSS 处理失败: ${args.path}`, error)
            return { contents: code, loader: 'css' }
          }
        })
      }
    }
    */
  }
}

/**
 * 生成 Lightning CSS 配置
 */
export function generateLightningCSSConfig(options: LightningCSSOptions = {}): string {
  return JSON.stringify({
    targets: options.targets || '>= 0.25%',
    minify: options.minify !== false,
    cssModules: options.cssModules || false,
    drafts: {
      nesting: true,
      customMedia: true,
      ...options.drafts
    }
  }, null, 2)
}


