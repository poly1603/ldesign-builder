/**
 * @ldesign/builder - 类型定义统一导出
 *
 * 提供所有公共类型定义的统一导出
 *
 * @author LDesign Team
 * @version 1.0.0
 */
export * from './builder';
export * from './config';
export * from './adapter';
export * from './strategy';
export * from './plugin';
export * from './library';
export * from './bundler';
export * from './output';
export * from './performance';
export * from './common';
export * from './minify';
export type { PostBuildValidationConfig, ValidationEnvironmentConfig, ValidationReportingConfig, ValidationHooks, ValidationScopeConfig, ValidationContext, TestRunResult, TestError, CoverageInfo, CoverageMetric, FileCoverageInfo, TestPerformanceMetrics, ValidationReport, ValidationSummary, ValidationDetails, FileValidationResult, FormatValidationResult, TypeValidationResult, StyleValidationResult, TypeCheckResult, TypeDiagnostic, ValidationError, ValidationWarning, ValidationStats, ValidationRecommendation, IPostBuildValidator, ITestRunner, IValidationReporter } from './validation';
export type { ValidationResult as PostBuildValidationResult } from './validation';
