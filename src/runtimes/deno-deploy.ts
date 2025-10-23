/**
 * Deno Deploy 运行时支持
 * 
 * 为 Deno Deploy 优化构建配置
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import type { BuilderConfig } from '../types/config'

/**
 * Deno Deploy 配置选项
 */
export interface DenoDeployOptions {
  /** 是否启用 */
  enabled?: boolean

  /** 是否生成 import map */
  generateImportMap?: boolean

  /** 环境变量 */
  env?: Record<string, string>
}

/**
 * 应用 Deno Deploy 配置
 */
export function applyDenoDeployConfig(
  config: BuilderConfig,
  options: DenoDeployOptions = {}
): BuilderConfig {
  const opts = {
    enabled: options.enabled !== false,
    generateImportMap: options.generateImportMap !== false,
    env: options.env || {}
  }

  return {
    ...config,

    // 输出配置 - Deno 使用 ESM
    output: {
      esm: {
        dir: 'dist',
        format: 'esm',
        dts: false
      },
      ...config.output
    },

    // 目标环境
    typescript: {
      ...config.typescript,
      target: 'ES2022',
      module: 'ESNext'
    },

    // Deno 不需要 node_modules
    external: [
      ...(Array.isArray(config.external) ? config.external : []),
      'https://*',
      'http://*',
      'npm:*',
      'jsr:*',
      'node:*'
    ],

    // 定义全局变量
    define: {
      ...config.define,
      ...Object.entries(opts.env).reduce((acc, [key, value]) => {
        acc[`Deno.env.get('${key}')`] = JSON.stringify(value)
        return acc
      }, {} as Record<string, string>)
    },

    minify: true,
    sourcemap: false
  }
}

/**
 * 生成 deno.json 配置
 */
export function generateDenoConfig(options: {
  tasks?: Record<string, string>
  imports?: Record<string, string>
}): string {
  const opts = {
    tasks: options.tasks || {
      dev: 'deno run --watch main.ts',
      build: 'deno task build:compile'
    },
    imports: options.imports || {}
  }

  return JSON.stringify({
    tasks: opts.tasks,
    imports: opts.imports,
    compilerOptions: {
      lib: ['deno.window', 'dom', 'esnext'],
      strict: true
    }
  }, null, 2)
}

/**
 * 生成 import map
 */
export function generateImportMap(dependencies: Record<string, string>): string {
  const imports: Record<string, string> = {}

  for (const [name, version] of Object.entries(dependencies)) {
    // 转换为 ESM CDN URL
    imports[name] = `https://esm.sh/${name}@${version}`
  }

  return JSON.stringify({ imports }, null, 2)
}


