/**
 * 构建器模块统一导出
 * 
 * 【功能描述】
 * 提供构建器相关模块的统一导出入口
 * 
 * 【模块结构】
 * - BuildCache: 构建缓存管理
 * - DependencyAnalyzer: 依赖分析
 * - BuildValidator: 构建验证
 * 
 * 【使用示例】
 * ```typescript
 * import {
 *   BuildCacheManager,
 *   DependencyAnalyzer,
 *   BuildValidator
 * } from '@ldesign/builder/core/builder'
 * 
 * const cacheManager = new BuildCacheManager()
 * const analyzer = new DependencyAnalyzer()
 * const validator = new BuildValidator()
 * ```
 * 
 * @module core/builder
 * @author LDesign Team
 * @version 1.0.0
 * @since 2024-01-01
 */

// ========== 导出构建缓存管理 ==========
// 重新导出 utils/build-cache-manager 中的实现（功能更完整，有测试）
export {
  BuildCacheManager,
  type CacheEntry as BuildCache,
  type CacheConfig as BuildCacheManagerOptions
} from '../../utils/build-cache-manager'

/**
 * 创建构建缓存管理器实例
 * @param options - 缓存配置选项
 * @returns 缓存管理器实例
 */
export function createBuildCacheManager(options?: Partial<import('../../utils/build-cache-manager').CacheConfig>): import('../../utils/build-cache-manager').BuildCacheManager {
  const { BuildCacheManager } = require('../../utils/build-cache-manager')
  return new BuildCacheManager(options)
}

// ========== 导出依赖分析 ==========
export {
  DependencyAnalyzer,
  createDependencyAnalyzer,
  type DependencyAnalysis,
  type DependencyAnalyzerOptions
} from './DependencyAnalyzer'

// ========== 导出构建验证 ==========
export {
  BuildValidator,
  createBuildValidator,
  type BuildValidatorOptions
} from './BuildValidator'

