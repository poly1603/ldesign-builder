/**
 * Cloudflare Workers 运行时支持
 * 
 * 为 Cloudflare Workers 优化构建配置
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import type { BuilderConfig } from '../types/config'

/**
 * Cloudflare Workers 配置选项
 */
export interface CloudflareWorkersOptions {
  /** 是否启用 */
  enabled?: boolean

  /** 兼容性日期 */
  compatibilityDate?: string

  /** 兼容性标志 */
  compatibilityFlags?: string[]

  /** 是否使用模块语法 */
  moduleWorker?: boolean

  /** 环境变量 */
  env?: Record<string, string>
}

/**
 * 应用 Cloudflare Workers 配置
 */
export function applyCloudflareWorkersConfig(
  config: BuilderConfig,
  options: CloudflareWorkersOptions = {}
): BuilderConfig {
  const opts = {
    enabled: options.enabled !== false,
    compatibilityDate: options.compatibilityDate || '2024-01-01',
    compatibilityFlags: options.compatibilityFlags || [],
    moduleWorker: options.moduleWorker !== false,
    env: options.env || {}
  }

  return {
    ...config,

    // 输出配置 - Workers 使用 ESM
    output: {
      esm: {
        dir: 'dist',
        format: 'esm',
        dts: false // Workers 不需要类型定义
      },
      ...config.output
    },

    // 外部依赖 - Workers 环境内置模块
    external: [
      ...(Array.isArray(config.external) ? config.external : []),
      // Workers 运行时 API
      'cloudflare:*'
    ],

    // 目标环境
    typescript: {
      ...config.typescript,
      target: 'ES2022', // Workers 支持现代 JS
      module: 'ESNext'
    },

    // 定义全局变量
    define: {
      ...config.define,
      'process.env.NODE_ENV': JSON.stringify('production'),
      ...Object.entries(opts.env).reduce((acc, [key, value]) => {
        acc[`process.env.${key}`] = JSON.stringify(value)
        return acc
      }, {} as Record<string, string>)
    },

    // 压缩以减小大小（Workers 有大小限制）
    minify: true,

    // 不生成 sourcemap（Workers 不支持）
    sourcemap: false
  }
}

/**
 * 生成 wrangler.toml 配置
 */
export function generateWranglerConfig(options: {
  name?: string
  main?: string
  compatibilityDate?: string
  vars?: Record<string, string>
}): string {
  const opts = {
    name: options.name || 'my-worker',
    main: options.main || 'dist/index.js',
    compatibilityDate: options.compatibilityDate || '2024-01-01',
    vars: options.vars || {}
  }

  const varsSection = Object.entries(opts.vars).length > 0
    ? `\n[vars]\n${Object.entries(opts.vars).map(([k, v]) => `${k} = "${v}"`).join('\n')}`
    : ''

  return `name = "${opts.name}"
main = "${opts.main}"
compatibility_date = "${opts.compatibilityDate}"
${varsSection}

# Learn more at https://developers.cloudflare.com/workers/
`
}


