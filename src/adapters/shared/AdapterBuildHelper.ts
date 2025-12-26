/**
 * 适配器构建辅助类
 * 
 * 提供通用的构建辅助功能
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import path from 'path'
import fs from 'fs-extra'
import fastGlob from 'fast-glob'
import { gzipSize } from 'gzip-size'
import type { UnifiedConfig } from '../../types/adapter'
import type { BuildResult } from '../../types/builder'
import type { PerformanceMetrics } from '../../types/performance'
import { Logger } from '../../utils/logger'

/**
 * 输出文件信息
 */
export interface OutputFile {
  fileName: string
  size: number
  gzipSize?: number
  type: 'chunk' | 'asset' | 'entry'
  format: string
  code?: string
  map?: string
}

/**
 * 适配器构建辅助类
 */
export class AdapterBuildHelper {
  private logger: Logger

  constructor(logger?: Logger) {
    this.logger = logger || new Logger()
  }

  /**
   * 解析输入文件
   */
  async resolveInputFiles(
    input: string | string[] | Record<string, string> | undefined,
    defaultPattern: string = 'src/**/*.{ts,tsx,js,jsx}'
  ): Promise<string[]> {
    if (!input) {
      input = defaultPattern
    }

    if (typeof input === 'string') {
      // 如果是 glob 模式
      if (input.includes('*')) {
        return await fastGlob(input, { absolute: true })
      }
      return [path.resolve(process.cwd(), input)]
    }

    if (Array.isArray(input)) {
      const files: string[] = []
      for (const pattern of input) {
        if (pattern.includes('*')) {
          files.push(...await fastGlob(pattern, { absolute: true }))
        } else {
          files.push(path.resolve(process.cwd(), pattern))
        }
      }
      return files
    }

    // Record 格式
    return Object.values(input).map(f => path.resolve(process.cwd(), f))
  }

  /**
   * 获取入口点
   */
  getEntryPoint(input: string | string[] | Record<string, string> | undefined): string {
    if (!input) {
      return 'src/index.ts'
    }

    if (typeof input === 'string') {
      return input
    }

    if (Array.isArray(input)) {
      return input[0] || 'src/index.ts'
    }

    // Record 格式取第一个值
    return Object.values(input)[0] || 'src/index.ts'
  }

  /**
   * 计算文件大小信息
   */
  async calculateSizeInfo(code: string): Promise<{ raw: number; gzip: number }> {
    const raw = Buffer.byteLength(code, 'utf-8')
    const gzip = await gzipSize(code)
    return { raw, gzip }
  }

  /**
   * 计算输出文件大小
   */
  async processOutputFiles(outputs: OutputFile[]): Promise<{
    totalRaw: number
    totalGzip: number
    largest: { file: string; size: number }
    files: OutputFile[]
  }> {
    let totalRaw = 0
    let totalGzip = 0
    let largest = { file: '', size: 0 }

    for (const output of outputs) {
      totalRaw += output.size
      
      if (output.code && !output.gzipSize) {
        output.gzipSize = await gzipSize(output.code)
      }
      totalGzip += output.gzipSize || 0

      if (output.size > largest.size) {
        largest = { file: output.fileName, size: output.size }
      }
    }

    return { totalRaw, totalGzip, largest, files: outputs }
  }

  /**
   * 创建构建结果
   */
  createBuildResult(options: {
    success: boolean
    outputs: OutputFile[]
    duration: number
    bundler: string
    mode?: string
    libraryType?: string
    warnings?: any[]
    errors?: any[]
  }): BuildResult {
    const { 
      success, 
      outputs, 
      duration, 
      bundler, 
      mode = 'production',
      libraryType,
      warnings = [],
      errors = []
    } = options

    const totalRawSize = outputs.reduce((sum, o) => sum + o.size, 0)
    const totalGzipSize = outputs.reduce((sum, o) => sum + (o.gzipSize || 0), 0)
    const largestOutput = outputs.reduce(
      (max, o) => o.size > max.size ? o : max,
      { fileName: '', size: 0 } as OutputFile
    )

    return {
      success,
      outputs: outputs.map(o => ({
        fileName: o.fileName,
        size: o.size,
        type: o.type === 'entry' ? 'chunk' : o.type,
        format: o.format,
        source: o.code || '',
        gzipSize: o.gzipSize
      })) as any[],
      duration,
      stats: {
        buildTime: duration,
        fileCount: outputs.length,
        totalSize: {
          raw: totalRawSize,
          gzip: totalGzipSize,
          brotli: 0,
          byType: {},
          byFormat: {} as any,
          largest: {
            file: largestOutput.fileName,
            size: largestOutput.size
          },
          fileCount: outputs.length
        },
        byFormat: {
          esm: { fileCount: outputs.filter(o => o.format === 'esm' || o.format === 'es').length, size: { raw: 0, gzip: 0, brotli: 0, byType: {}, byFormat: {} as any, largest: { file: '', size: 0 }, fileCount: 0 } },
          cjs: { fileCount: outputs.filter(o => o.format === 'cjs').length, size: { raw: 0, gzip: 0, brotli: 0, byType: {}, byFormat: {} as any, largest: { file: '', size: 0 }, fileCount: 0 } },
          umd: { fileCount: outputs.filter(o => o.format === 'umd').length, size: { raw: 0, gzip: 0, brotli: 0, byType: {}, byFormat: {} as any, largest: { file: '', size: 0 }, fileCount: 0 } },
          iife: { fileCount: outputs.filter(o => o.format === 'iife').length, size: { raw: 0, gzip: 0, brotli: 0, byType: {}, byFormat: {} as any, largest: { file: '', size: 0 }, fileCount: 0 } },
          css: { fileCount: outputs.filter(o => o.format === 'css').length, size: { raw: 0, gzip: 0, brotli: 0, byType: {}, byFormat: {} as any, largest: { file: '', size: 0 }, fileCount: 0 } },
          dts: { fileCount: 0, size: { raw: 0, gzip: 0, brotli: 0, byType: {}, byFormat: {} as any, largest: { file: '', size: 0 }, fileCount: 0 } }
        },
        modules: {
          total: 0,
          external: 0,
          internal: 0,
          largest: {
            id: '',
            size: 0,
            renderedLength: 0,
            originalLength: 0,
            isEntry: false,
            isExternal: false,
            importedIds: [],
            dynamicallyImportedIds: [],
            importers: [],
            dynamicImporters: []
          }
        },
        dependencies: {
          total: 0,
          external: [],
          bundled: [],
          circular: []
        }
      },
      performance: this.getDefaultPerformanceMetrics(),
      warnings: warnings.map(w => typeof w === 'string' ? { message: w } : w),
      errors: errors.map(e => typeof e === 'string' ? { message: e } : e),
      buildId: `${bundler}-${Date.now()}`,
      timestamp: Date.now(),
      bundler,
      mode,
      libraryType
    }
  }

  /**
   * 获取默认性能指标
   */
  getDefaultPerformanceMetrics(): PerformanceMetrics {
    const memUsage = process.memoryUsage()

    return {
      buildTime: 0,
      memoryUsage: {
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external,
        rss: memUsage.rss,
        peak: memUsage.heapUsed,
        trend: []
      },
      cacheStats: {
        hits: 0,
        misses: 0,
        hitRate: 0,
        size: 0,
        entries: 0,
        timeSaved: 0
      },
      fileStats: {
        totalFiles: 0,
        filesByType: {},
        averageProcessingTime: 0,
        slowestFiles: [],
        processingRate: 0
      },
      pluginPerformance: [],
      systemResources: {
        cpuUsage: 0,
        availableMemory: 0,
        diskUsage: {
          total: 0,
          used: 0,
          available: 0,
          usagePercent: 0
        }
      }
    }
  }

  /**
   * 映射 ES Target
   */
  mapTarget(target: string | undefined): string {
    if (!target) return 'es2020'

    const targetMap: Record<string, string> = {
      'ES3': 'es3',
      'ES5': 'es5',
      'ES2015': 'es2015',
      'ES6': 'es2015',
      'ES2016': 'es2016',
      'ES2017': 'es2017',
      'ES2018': 'es2018',
      'ES2019': 'es2019',
      'ES2020': 'es2020',
      'ES2021': 'es2021',
      'ES2022': 'es2022',
      'ESNext': 'esnext'
    }

    return targetMap[target.toUpperCase()] || target.toLowerCase()
  }

  /**
   * 获取外部依赖
   */
  async getExternalDependencies(config: UnifiedConfig): Promise<string[]> {
    const external = config.external

    if (Array.isArray(external)) {
      const result: string[] = []
      for (const e of external) {
        if (typeof e === 'string') {
          result.push(e)
        }
      }
      return result
    }

    // 如果没有指定，从 package.json 读取
    try {
      const pkgPath = path.join(process.cwd(), 'package.json')
      if (await fs.pathExists(pkgPath)) {
        const pkg = await fs.readJSON(pkgPath)
        const deps = Object.keys(pkg.dependencies || {})
        const peerDeps = Object.keys(pkg.peerDependencies || {})
        return [...new Set([...deps, ...peerDeps])]
      }
    } catch {
      // 忽略错误
    }

    return []
  }

  /**
   * 检查是否为多入口构建
   */
  isMultiEntryBuild(input: string | string[] | Record<string, string> | undefined): boolean {
    if (!input) return false
    if (typeof input === 'string') return input.includes('*')
    if (Array.isArray(input)) return input.length > 1 || input.some(i => i.includes('*'))
    return Object.keys(input).length > 1
  }

  /**
   * 写入输出文件
   */
  async writeOutputFile(
    outputPath: string,
    content: string,
    map?: string
  ): Promise<void> {
    await fs.ensureDir(path.dirname(outputPath))
    await fs.writeFile(outputPath, content)

    if (map) {
      await fs.writeFile(`${outputPath}.map`, map)
    }
  }

  /**
   * 格式化构建时间
   */
  formatBuildTime(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`
    }
    return `${(ms / 1000).toFixed(2)}s`
  }

  /**
   * 格式化文件大小
   */
  formatFileSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }
}
