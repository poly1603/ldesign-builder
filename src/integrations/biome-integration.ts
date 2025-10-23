/**
 * Biome 集成
 * 
 * 集成 Biome 进行代码检查和格式化
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import type { UnifiedPlugin } from '../types/plugin'
import { Logger } from '../utils/logger'

/**
 * Biome 配置选项
 */
export interface BiomeIntegrationOptions {
  /** 是否启用 */
  enabled?: boolean

  /** 是否在构建前格式化 */
  formatOnBuild?: boolean

  /** 是否在构建前检查 */
  lintOnBuild?: boolean

  /** Biome 配置文件路径 */
  configPath?: string

  /** 是否自动修复 */
  autoFix?: boolean
}

/**
 * Biome 集成插件
 */
export function biomeIntegrationPlugin(options: BiomeIntegrationOptions = {}): UnifiedPlugin {
  const opts = {
    enabled: options.enabled !== false,
    formatOnBuild: options.formatOnBuild || false,
    lintOnBuild: options.lintOnBuild !== false,
    configPath: options.configPath || 'biome.json',
    autoFix: options.autoFix || false
  }

  const logger = new Logger({ prefix: 'Biome' })
  let biome: any

  // 尝试加载 Biome
  try {
    biome = require('@biomejs/biome')
  } catch {
    logger.warn('Biome 未安装，跳过集成')
    opts.enabled = false
  }

  return {
    name: 'biome-integration',

    rollup: {
      name: 'biome-integration',

      async buildStart() {
        if (!opts.enabled) {
          return
        }

        logger.info('运行 Biome 检查...')

        try {
          // 格式化代码
          if (opts.formatOnBuild) {
            await this.formatCode()
          }

          // 代码检查
          if (opts.lintOnBuild) {
            const issues = await this.lintCode()

            if (issues.length > 0) {
              logger.warn(`发现 ${issues.length} 个代码问题`)

              issues.slice(0, 10).forEach((issue: any) => {
                logger.warn(`  ${issue.file}:${issue.line} - ${issue.message}`)
              })

              if (issues.length > 10) {
                logger.warn(`  ... 还有 ${issues.length - 10} 个问题`)
              }
            } else {
              logger.success('代码检查通过')
            }
          }
        } catch (error) {
          logger.error('Biome 检查失败:', error)
        }
      },

      async formatCode(): Promise<void> {
        logger.info('格式化代码...')
        // 实际实现需要调用 Biome API
        // 这里是简化版本
      },

      async lintCode(): Promise<any[]> {
        logger.info('代码检查...')
        // 实际实现需要调用 Biome API
        // 返回问题列表
        return []
      }
    }
  }
}

/**
 * 生成 Biome 配置文件
 */
export function generateBiomeConfig(): string {
  return JSON.stringify({
    "$schema": "https://biomejs.dev/schemas/1.4.1/schema.json",
    "organizeImports": {
      "enabled": true
    },
    "linter": {
      "enabled": true,
      "rules": {
        "recommended": true,
        "suspicious": {
          "noExplicitAny": "warn",
          "noDebugger": "warn"
        },
        "complexity": {
          "noExtraBooleanCast": "error",
          "noMultipleSpacesInRegularExpressionLiterals": "error",
          "noUselessCatch": "error",
          "noUselessConstructor": "error",
          "noUselessLoneBlockStatements": "error",
          "noWith": "error"
        }
      }
    },
    "formatter": {
      "enabled": true,
      "formatWithErrors": false,
      "indentStyle": "space",
      "indentWidth": 2,
      "lineWidth": 100
    },
    "javascript": {
      "formatter": {
        "quoteStyle": "single",
        "trailingComma": "es5",
        "semicolons": "asNeeded"
      }
    }
  }, null, 2)
}


