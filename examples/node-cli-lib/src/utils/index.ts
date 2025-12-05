/**
 * 工具函数
 */
import { createHash } from 'crypto'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs'
import { dirname, join, resolve } from 'path'

/**
 * 确保目录存在
 */
export function ensureDir(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}

/**
 * 写入文件（自动创建目录）
 */
export function writeFile(filePath: string, content: string): void {
  ensureDir(dirname(filePath))
  writeFileSync(filePath, content, 'utf-8')
}

/**
 * 读取 JSON 文件
 */
export function readJSON<T = any>(filePath: string): T {
  const content = readFileSync(filePath, 'utf-8')
  return JSON.parse(content)
}

/**
 * 写入 JSON 文件
 */
export function writeJSON(filePath: string, data: any, pretty = true): void {
  const content = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data)
  writeFile(filePath, content)
}

/**
 * 计算文件哈希
 */
export function hashContent(content: string, algorithm = 'md5'): string {
  return createHash(algorithm).update(content).digest('hex')
}

/**
 * 解析路径别名
 */
export function resolvePath(base: string, ...paths: string[]): string {
  return resolve(base, ...paths)
}

/**
 * 格式化字节大小
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

/**
 * 延迟执行
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
