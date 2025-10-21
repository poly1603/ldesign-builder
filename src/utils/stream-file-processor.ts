/**
 * 流式文件处理器
 * 用于处理大文件，避免内存溢出
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import { createReadStream, createWriteStream } from 'fs'
import { pipeline } from 'stream/promises'
import { Transform } from 'stream'
import { createHash } from 'crypto'
import path from 'path'
import fs from 'fs-extra'
import { Logger } from './logger'

/**
 * 流式处理选项
 */
export interface StreamProcessorOptions {
  /** 缓冲区大小（字节） */
  bufferSize?: number
  /** 是否启用压缩 */
  enableCompression?: boolean
  /** 编码方式 */
  encoding?: BufferEncoding
  /** 最大文件大小（MB） */
  maxFileSize?: number
}

/**
 * 流式文件处理器
 */
export class StreamFileProcessor {
  private options: Required<StreamProcessorOptions>
  private logger: Logger

  constructor(options: StreamProcessorOptions = {}) {
    this.options = {
      bufferSize: options.bufferSize || 64 * 1024, // 64KB
      enableCompression: options.enableCompression ?? false,
      encoding: options.encoding || 'utf8',
      maxFileSize: options.maxFileSize || 100 // 100MB
    }
    this.logger = new Logger({ prefix: 'StreamProcessor' })
  }

  /**
   * 流式读取文件并计算哈希
   */
  async hashFile(filePath: string, algorithm: string = 'sha256'): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = createHash(algorithm)
      const stream = createReadStream(filePath, {
        highWaterMark: this.options.bufferSize
      })

      stream.on('data', (chunk) => {
        hash.update(chunk)
      })

      stream.on('end', () => {
        resolve(hash.digest('hex'))
      })

      stream.on('error', reject)
    })
  }

  /**
   * 流式复制文件
   */
  async copyFile(sourcePath: string, destPath: string): Promise<void> {
    await fs.ensureDir(path.dirname(destPath))

    const readStream = createReadStream(sourcePath, {
      highWaterMark: this.options.bufferSize
    })

    const writeStream = createWriteStream(destPath)

    await pipeline(readStream, writeStream)
  }

  /**
   * 流式转换文件
   */
  async transformFile(
    sourcePath: string,
    destPath: string,
    transformer: (chunk: string) => string
  ): Promise<void> {
    await fs.ensureDir(path.dirname(destPath))

    const transformStream = new Transform({
      highWaterMark: this.options.bufferSize,
      transform(chunk, encoding, callback) {
        try {
          const data = chunk.toString()
          const transformed = transformer(data)
          callback(null, Buffer.from(transformed))
        } catch (error) {
          callback(error as Error)
        }
      }
    })

    const readStream = createReadStream(sourcePath, {
      highWaterMark: this.options.bufferSize
    })

    const writeStream = createWriteStream(destPath)

    await pipeline(readStream, transformStream, writeStream)
  }

  /**
   * 流式读取文件行
   */
  async* readLines(filePath: string): AsyncGenerator<string> {
    const stream = createReadStream(filePath, {
      encoding: this.options.encoding,
      highWaterMark: this.options.bufferSize
    })

    let buffer = ''

    for await (const chunk of stream) {
      buffer += chunk
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        yield line
      }
    }

    // 处理最后一行
    if (buffer) {
      yield buffer
    }
  }

  /**
   * 流式压缩文件
   */
  async compressFile(sourcePath: string, destPath: string): Promise<number> {
    const { createGzip } = await import('zlib')

    await fs.ensureDir(path.dirname(destPath))

    const readStream = createReadStream(sourcePath, {
      highWaterMark: this.options.bufferSize
    })

    const gzip = createGzip({ level: 9 })
    const writeStream = createWriteStream(destPath)

    await pipeline(readStream, gzip, writeStream)

    // 返回压缩后的大小
    const stats = await fs.stat(destPath)
    return stats.size
  }

  /**
   * 流式解压文件
   */
  async decompressFile(sourcePath: string, destPath: string): Promise<void> {
    const { createGunzip } = await import('zlib')

    await fs.ensureDir(path.dirname(destPath))

    const readStream = createReadStream(sourcePath)
    const gunzip = createGunzip()
    const writeStream = createWriteStream(destPath)

    await pipeline(readStream, gunzip, writeStream)
  }

  /**
   * 批量流式处理文件
   */
  async processFiles(
    files: string[],
    processor: (filePath: string) => Promise<void>,
    options: {
      concurrent?: number
      onProgress?: (current: number, total: number) => void
    } = {}
  ): Promise<void> {
    const { concurrent = 3, onProgress } = options
    let current = 0

    // 分批处理，避免同时打开过多文件
    for (let i = 0; i < files.length; i += concurrent) {
      const batch = files.slice(i, i + concurrent)

      await Promise.all(
        batch.map(async (file) => {
          await processor(file)
          current++
          if (onProgress) {
            onProgress(current, files.length)
          }
        })
      )
    }
  }

  /**
   * 检查文件大小是否超过限制
   */
  async checkFileSize(filePath: string): Promise<boolean> {
    try {
      const stats = await fs.stat(filePath)
      const sizeMB = stats.size / 1024 / 1024

      if (sizeMB > this.options.maxFileSize) {
        this.logger.warn(`文件 ${filePath} 大小 ${sizeMB.toFixed(2)}MB 超过限制 ${this.options.maxFileSize}MB`)
        return false
      }

      return true
    } catch {
      return false
    }
  }

  /**
   * 估算处理内存需求
   */
  estimateMemoryUsage(fileSize: number): number {
    // 估算：文件大小 * 2（读取和写入缓冲） + 缓冲区大小
    return fileSize * 2 + this.options.bufferSize
  }
}

/**
 * 创建流式文件处理器
 */
export function createStreamFileProcessor(options?: StreamProcessorOptions): StreamFileProcessor {
  return new StreamFileProcessor(options)
}

