/**
 * 精确的缓存键计算器
 * 
 * 用于生成准确的构建缓存键,考虑:
 * - 配置变化(排除函数和不稳定字段)
 * - 文件内容变化
 * - 依赖版本变化
 * - 环境信息变化
 * - Builder 版本变化
 */

import { createHash } from 'crypto'
import fs from 'fs-extra'
import path from 'path'
import { glob } from 'glob'
import type { BuilderConfig } from '../types/config'

/**
 * 缓存键计算器
 */
export class CacheKeyCalculator {
  private builderVersion: string

  constructor() {
    this.builderVersion = this.getBuilderVersion()
  }

  /**
   * 计算构建缓存键 (优化版 - 使用分层缓存)
   */
  async calculateBuildCacheKey(config: BuilderConfig): Promise<string> {
    // 优化：并行计算所有部分
    const [configHash, filesHash, depsHash] = await Promise.all([
      this.hashConfig(config),
      this.hashInputFiles(config.input),
      this.hashDependencies()
    ])

    const parts: string[] = [
      configHash,
      filesHash,
      depsHash,
      this.hashEnvironment(),
      this.builderVersion
    ]

    return createHash('sha256')
      .update(parts.join(':'))
      .digest('hex')
  }

  /**
   * 哈希配置(排除函数和不稳定字段)
   */
  private async hashConfig(config: BuilderConfig): Promise<string> {
    // 深拷贝并移除函数
    const cleanConfig = this.removeNonSerializable(config)

    // 排序键以确保一致性
    const sorted = this.sortObjectKeys(cleanConfig)

    return createHash('md5')
      .update(JSON.stringify(sorted))
      .digest('hex')
  }

  /**
   * 哈希输入文件 (优化版 - 使用文件统计信息而非内容)
   */
  private async hashInputFiles(input: BuilderConfig['input']): Promise<string> {
    const files = await this.resolveInputFiles(input)
    
    // 优化：并行读取文件统计信息
    const hashPromises = files.map(async (file) => {
      try {
        // 优化：使用 mtime 和文件大小而非内容，大大加快速度
        const stats = await fs.stat(file)
        const hash = createHash('md5')
          .update(`${file}:${stats.mtimeMs}:${stats.size}`)
          .digest('hex')
        return `${file}:${hash}`
      } catch (error) {
        // 文件不存在或无法读取
        return `${file}:missing`
      }
    })

    const hashes = await Promise.all(hashPromises)

    return createHash('md5')
      .update(hashes.sort().join('|'))
      .digest('hex')
  }

  /**
   * 哈希依赖版本
   */
  private async hashDependencies(): Promise<string> {
    try {
      const packageJson = await this.readPackageJson()
      const deps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      }

      // 只包含相关依赖
      const relevantDeps = this.filterRelevantDependencies(deps)

      return createHash('md5')
        .update(JSON.stringify(relevantDeps))
        .digest('hex')
    } catch (error) {
      // 无法读取 package.json,返回默认哈希
      return 'no-package-json'
    }
  }

  /**
   * 哈希环境信息
   */
  private hashEnvironment(): string {
    const env = {
      node: process.version,
      platform: process.platform,
      arch: process.arch
    }

    return createHash('md5')
      .update(JSON.stringify(env))
      .digest('hex')
  }

  /**
   * 获取 Builder 版本
   */
  private getBuilderVersion(): string {
    try {
      const packageJsonPath = path.join(__dirname, '../../package.json')
      const packageJson = require(packageJsonPath)
      return packageJson.version || '0.0.0'
    } catch (error) {
      return '0.0.0'
    }
  }

  /**
   * 移除不可序列化的字段
   */
  private removeNonSerializable(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.removeNonSerializable(item))
    }

    const result: any = {}
    for (const [key, value] of Object.entries(obj)) {
      // 跳过函数
      if (typeof value === 'function') {
        continue
      }
      // 跳过不稳定字段
      if (['timestamp', 'buildId', 'cache', 'onwarn'].includes(key)) {
        continue
      }
      // 递归处理对象
      result[key] = this.removeNonSerializable(value)
    }

    return result
  }

  /**
   * 排序对象键
   */
  private sortObjectKeys(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sortObjectKeys(item))
    }

    const sorted: any = {}
    const keys = Object.keys(obj).sort()
    for (const key of keys) {
      sorted[key] = this.sortObjectKeys(obj[key])
    }

    return sorted
  }

  /**
   * 解析输入文件
   */
  private async resolveInputFiles(input: BuilderConfig['input']): Promise<string[]> {
    const files: string[] = []

    if (typeof input === 'string') {
      // 单个文件或 glob 模式
      if (input.includes('*')) {
        const matches = await glob(input, { absolute: true })
        files.push(...matches)
      } else {
        files.push(path.resolve(input))
      }
    } else if (Array.isArray(input)) {
      // 文件数组
      for (const item of input) {
        if (typeof item === 'string') {
          if (item.includes('*')) {
            const matches = await glob(item, { absolute: true })
            files.push(...matches)
          } else {
            files.push(path.resolve(item))
          }
        }
      }
    } else if (typeof input === 'object' && input !== null) {
      // 对象形式 { main: 'src/index.ts', ... }
      for (const value of Object.values(input)) {
        if (typeof value === 'string') {
          if (value.includes('*')) {
            const matches = await glob(value, { absolute: true })
            files.push(...matches)
          } else {
            files.push(path.resolve(value))
          }
        }
      }
    }

    return files
  }

  /**
   * 读取 package.json
   */
  private async readPackageJson(): Promise<any> {
    const packageJsonPath = path.join(process.cwd(), 'package.json')
    const content = await fs.readFile(packageJsonPath, 'utf-8')
    return JSON.parse(content)
  }

  /**
   * 过滤相关依赖
   */
  private filterRelevantDependencies(deps: Record<string, string>): Record<string, string> {
    const relevantPrefixes = [
      '@rollup/',
      'rollup',
      '@vitejs/',
      'vite',
      'esbuild',
      'typescript',
      '@babel/',
      'babel',
      'vue',
      'react',
      'preact',
      'svelte',
      'solid',
      'lit',
      'qwik',
      '@ldesign/'
    ]

    const filtered: Record<string, string> = {}
    for (const [name, version] of Object.entries(deps)) {
      if (relevantPrefixes.some(prefix => name.startsWith(prefix))) {
        filtered[name] = version
      }
    }

    return filtered
  }
}

/**
 * 创建缓存键计算器实例
 */
export function createCacheKeyCalculator(): CacheKeyCalculator {
  return new CacheKeyCalculator()
}

