/**
 * @ldesign/builder - 类型定义统一导出
 * 
 * @description 提供所有公共类型定义的统一导出，包括：
 * - 构建器相关类型 (builder)
 * - 配置相关类型 (config)
 * - 适配器类型 (adapter)
 * - 策略类型 (strategy)
 * - 插件类型 (plugin)
 * - 库类型 (library)
 * - 打包器类型 (bundler)
 * - 输出类型 (output)
 * - 性能类型 (performance)
 * - 通用类型和工具函数 (common)
 * 
 * @author LDesign Team
 * @version 2.0.0
 */

// ==================== 核心类型 ====================
export * from './builder'
export * from './config'
export * from './adapter'
export * from './strategy'
export * from './plugin'
export * from './library'
export * from './bundler'
export * from './output'
export * from './performance'
export * from './common'
export * from './minify'

// 导出验证相关类型，但排除冲突的 ValidationResult
export type {
  PostBuildValidationConfig,
  ValidationEnvironmentConfig,
  ValidationReportingConfig,
  ValidationHooks,
  ValidationScopeConfig,
  ValidationContext,
  TestRunResult,
  TestError,
  CoverageInfo,
  CoverageMetric,
  FileCoverageInfo,
  TestPerformanceMetrics,
  ValidationReport,
  ValidationSummary,
  ValidationDetails,
  FileValidationResult,
  FormatValidationResult,
  TypeValidationResult,
  StyleValidationResult,
  TypeCheckResult,
  TypeDiagnostic,
  ValidationError,
  ValidationWarning,
  ValidationStats,
  ValidationRecommendation,
  IPostBuildValidator,
  ITestRunner,
  IValidationReporter
} from './validation'

// 重新导出 ValidationResult 为不同的名称以避免冲突
export type { ValidationResult as PostBuildValidationResult } from './validation'
