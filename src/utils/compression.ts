/**
 * 压缩工具
 * 
 * 提供数据压缩和解压缩功能
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import * as zlib from 'zlib'
import { promisify } from 'util'

const gzip = promisify(zlib.gzip)
const gunzip = promisify(zlib.gunzip)
const brotliCompress = promisify(zlib.brotliCompress)
const brotliDecompress = promisify(zlib.brotliDecompress)

/**
 * 压缩算法类型
 */
export enum CompressionAlgorithm {
  GZIP = 'gzip',
  BROTLI = 'brotli',
  NONE = 'none'
}

/**
 * 压缩选项
 */
export interface CompressionOptions {
  /** 压缩算法 */
  algorithm?: CompressionAlgorithm
  /** 压缩级别 (1-9) */
  level?: number
  /** 阈值，小于此大小不压缩（字节） */
  threshold?: number
}

/**
 * 压缩数据
 */
export async function compress(
  data: string | Buffer,
  options: CompressionOptions = {}
): Promise<Buffer> {
  const {
    algorithm = CompressionAlgorithm.GZIP,
    level = 6,
    threshold = 1024 // 默认 1KB
  } = options

  // 转换为 Buffer
  const buffer = typeof data === 'string' ? Buffer.from(data, 'utf-8') : data

  // 检查阈值
  if (buffer.length < threshold) {
    return buffer
  }

  switch (algorithm) {
    case CompressionAlgorithm.GZIP:
      return gzip(buffer, { level })

    case CompressionAlgorithm.BROTLI:
      return brotliCompress(buffer, {
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: level
        }
      })

    case CompressionAlgorithm.NONE:
    default:
      return buffer
  }
}

/**
 * 解压缩数据
 */
export async function decompress(
  data: Buffer,
  algorithm: CompressionAlgorithm = CompressionAlgorithm.GZIP
): Promise<Buffer> {
  switch (algorithm) {
    case CompressionAlgorithm.GZIP:
      return gunzip(data)

    case CompressionAlgorithm.BROTLI:
      return brotliDecompress(data)

    case CompressionAlgorithm.NONE:
    default:
      return data
  }
}

/**
 * 检测压缩算法
 */
export function detectCompressionAlgorithm(data: Buffer): CompressionAlgorithm {
  // GZIP magic number: 1f 8b
  if (data[0] === 0x1f && data[1] === 0x8b) {
    return CompressionAlgorithm.GZIP
  }

  // Brotli 没有固定的 magic number，但通常以特定模式开始
  // 这里简化处理，实际项目中可能需要更复杂的检测逻辑

  return CompressionAlgorithm.NONE
}

/**
 * 计算压缩率
 */
export function calculateCompressionRatio(original: number, compressed: number): number {
  if (original === 0) return 0
  return ((original - compressed) / original) * 100
}

/**
 * 选择最佳压缩算法
 */
export async function selectBestCompression(
  data: string | Buffer,
  options: CompressionOptions = {}
): Promise<{
  algorithm: CompressionAlgorithm
  compressed: Buffer
  ratio: number
}> {
  const buffer = typeof data === 'string' ? Buffer.from(data, 'utf-8') : data
  const originalSize = buffer.length

  // 测试不同的算法
  const results = await Promise.all([
    compress(buffer, { ...options, algorithm: CompressionAlgorithm.GZIP }),
    compress(buffer, { ...options, algorithm: CompressionAlgorithm.BROTLI })
  ])

  const gzipSize = results[0].length
  const brotliSize = results[1].length

  const gzipRatio = calculateCompressionRatio(originalSize, gzipSize)
  const brotliRatio = calculateCompressionRatio(originalSize, brotliSize)

  // 选择压缩率更高的算法
  if (brotliRatio > gzipRatio && brotliSize < originalSize) {
    return {
      algorithm: CompressionAlgorithm.BROTLI,
      compressed: results[1],
      ratio: brotliRatio
    }
  } else if (gzipSize < originalSize) {
    return {
      algorithm: CompressionAlgorithm.GZIP,
      compressed: results[0],
      ratio: gzipRatio
    }
  } else {
    return {
      algorithm: CompressionAlgorithm.NONE,
      compressed: buffer,
      ratio: 0
    }
  }
}



