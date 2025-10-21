/**
 * Rollup 缓存管理器
 * 负责构建缓存的管理和验证
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import type { Logger } from '../../utils/logger'
import { RollupCache } from '../../utils/cache'
import path from 'path'

/**
 * Rollup 缓存管理器
 */
export class RollupCacheManager {
  private logger: Logger
  private cache: RollupCache

  constructor(logger: Logger, cacheOptions?: { cacheDir?: string; ttl?: number; maxSize?: number }) {
    this.logger = logger
    this.cache = new RollupCache(cacheOptions)
  }

  /**
   * 获取缓存
   */
  getCache(): RollupCache {
    return this.cache
  }

  /**
   * 检查缓存是否启用
   */
  isCacheEnabled(config: any): boolean {
    const c = (config as any)?.cache
    if (c === false) return false
    if (typeof c === 'object' && c) {
      if ('enabled' in c) return (c as any).enabled !== false
    }
    return true
  }

  /**
   * 解析缓存选项
   */
  resolveCacheOptions(config: any): { cacheDir?: string; ttl?: number; maxSize?: number } {
    const c = (config as any)?.cache
    const opts: { cacheDir?: string; ttl?: number; maxSize?: number } = {}

    if (typeof c === 'object' && c) {
      if (typeof c.dir === 'string' && c.dir.trim()) {
        opts.cacheDir = path.isAbsolute(c.dir) ? c.dir : path.resolve(process.cwd(), c.dir)
      }
      if (typeof c.maxAge === 'number' && isFinite(c.maxAge) && c.maxAge > 0) {
        opts.ttl = Math.floor(c.maxAge)
      }
      if (typeof c.maxSize === 'number' && isFinite(c.maxSize) && c.maxSize > 0) {
        opts.maxSize = Math.floor(c.maxSize)
      }
    }

    return opts
  }

  /**
   * 验证输出产物是否存在
   */
  async validateOutputArtifacts(config: any): Promise<boolean> {
    try {
      const outputConfig = config.output || {}
      const outputDir = config.outDir || 'dist'
      const mainOutputFiles: string[] = []

      // ESM 输出
      if (outputConfig.esm) {
        const esmDir = typeof outputConfig.esm === 'object' && outputConfig.esm.dir
          ? outputConfig.esm.dir
          : (outputConfig.esm === true ? 'es' : outputDir)
        mainOutputFiles.push(path.join(esmDir, 'index.js'))
      }

      // CJS 输出
      if (outputConfig.cjs) {
        const cjsDir = typeof outputConfig.cjs === 'object' && outputConfig.cjs.dir
          ? outputConfig.cjs.dir
          : (outputConfig.cjs === true ? 'lib' : outputDir)
        mainOutputFiles.push(path.join(cjsDir, 'index.cjs'))
      }

      // UMD 输出
      if (outputConfig.umd) {
        const umdDir = typeof outputConfig.umd === 'object' && outputConfig.umd.dir
          ? outputConfig.umd.dir
          : outputDir
        mainOutputFiles.push(path.join(umdDir, 'index.umd.js'))
      }

      // 检查通用格式配置
      if (outputConfig.format) {
        const formats = Array.isArray(outputConfig.format) ? outputConfig.format : [outputConfig.format]
        for (const format of formats) {
          if (format === 'esm' && !outputConfig.esm) {
            mainOutputFiles.push(path.join(outputDir, 'index.js'))
          } else if (format === 'cjs' && !outputConfig.cjs) {
            mainOutputFiles.push(path.join(outputDir, 'index.cjs'))
          } else if (format === 'umd' && !outputConfig.umd) {
            mainOutputFiles.push(path.join(outputDir, 'index.js'))
          }
        }
      }

      if (mainOutputFiles.length === 0) {
        mainOutputFiles.push(path.join(outputDir, 'index.js'))
      }

      // 检查至少一个主要输出文件是否存在
      for (const outputFile of mainOutputFiles) {
        const fullPath = path.isAbsolute(outputFile)
          ? outputFile
          : path.resolve(process.cwd(), outputFile)

        if (await fs.pathExists(fullPath)) {
          this.logger.debug(`输出产物验证通过: ${fullPath}`)
          return true
        }
      }

      this.logger.debug(`输出产物验证失败，未找到任何主要输出文件`)
      return false
    } catch (error) {
      this.logger.warn(`验证输出产物时出错: ${(error as Error).message}`)
      return false
    }
  }

  /**
   * 缓存构建结果
   */
  async cacheBuildResult(cacheKey: any, buildResult: BuildResult): Promise<void> {
    try {
      await this.cache.cacheBuildResult(cacheKey, buildResult)
      this.logger.debug('构建结果已缓存')
    } catch (error) {
      this.logger.warn('缓存构建结果失败:', (error as Error).message)
    }
  }

  /**
   * 获取缓存的构建结果
   */
  async getCachedBuildResult(cacheKey: any): Promise<any> {
    try {
      return await this.cache.getBuildResult(cacheKey)
    } catch (error) {
      this.logger.debug('获取缓存失败:', (error as Error).message)
      return null
    }
  }
}

