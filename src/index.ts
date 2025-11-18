/**
 * @ldesign/builder - 主入口文件
 * 
 * 基于 rollup/rolldown 的通用库打包工具
 * 支持多种前端库类型的打包和双打包核心的灵活切换
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

// 核心类导出
export { LibraryBuilder, createLibraryBuilder } from './core/LibraryBuilder'
export { MonorepoBuilder, createMonorepoBuilder } from './core/MonorepoBuilder'
export { ConfigManager } from './core/ConfigManager'
export { StrategyManager } from './core/StrategyManager'
export { PluginManager } from './core/PluginManager'
export { LibraryDetector } from './core/LibraryDetector'
export { PerformanceMonitor } from './core/PerformanceMonitor'
export { PostBuildValidator } from './core/PostBuildValidator'
export { TestRunner } from './core/TestRunner'
export { ValidationReporter } from './core/ValidationReporter'
export { TemporaryEnvironment } from './core/TemporaryEnvironment'

// 适配器导出
export { BundlerAdapterFactory } from './adapters/base/AdapterFactory'
export { RollupAdapter } from './adapters/rollup/RollupAdapter'
export { RolldownAdapter } from './adapters/rolldown/RolldownAdapter'
export { EsbuildAdapter } from './adapters/esbuild/EsbuildAdapter'
export { SwcAdapter } from './adapters/swc/SwcAdapter'
export { UnifiedBundlerAdapter } from './adapters/UnifiedBundlerAdapter'
export type { UnifiedAdapterOptions, BundlerType } from './adapters/UnifiedBundlerAdapter'

// 策略导出
export { TypeScriptStrategy } from './strategies/typescript/TypeScriptStrategy'
export { StyleStrategy } from './strategies/style/StyleStrategy'
export { Vue2Strategy } from './strategies/vue2/Vue2Strategy'
export { Vue3Strategy } from './strategies/vue3/Vue3Strategy'
export { ReactStrategy } from './strategies/react/ReactStrategy'
export { SvelteStrategy } from './strategies/svelte/SvelteStrategy'
export { SolidStrategy } from './strategies/solid/SolidStrategy'
export { PreactStrategy } from './strategies/preact/PreactStrategy'
export { LitStrategy } from './strategies/lit/LitStrategy'
export { AngularStrategy } from './strategies/angular/AngularStrategy'
export { QwikStrategy } from './strategies/qwik/QwikStrategy'
export { MixedStrategy } from './strategies/mixed/MixedStrategy'

// 插件导出
export * from './plugins'

// 类型定义导出
export * from './types'

// 常量导出
export * from './constants'

// 工具函数导出
export * from './utils'
export { MemoryOptimizer, getGlobalMemoryOptimizer } from './utils/memory/MemoryOptimizer'
export type { MemoryStats, MemoryConfig } from './utils/memory/MemoryOptimizer'
export { createIncrementalBuildManager, IncrementalBuildManager } from './utils/build/IncrementalBuildManager'
export { createParallelProcessor, ParallelProcessor } from './utils/parallel/ParallelProcessor'
export { createBuildReportGenerator, BuildReportGenerator } from './utils/build/BuildReportGenerator'
export { createBundleAnalyzer, BundleAnalyzer } from './utils/optimization/BundleAnalyzer'
export { createSmartWatcher, SmartWatcher } from './utils/misc/SmartWatcher'
export { createOutputNormalizer, OutputNormalizer } from './utils/formatters/OutputNormalizer'
// 错误处理器已合并到 error-handler/ 目录
export { tailwindPlugin } from './plugins/tailwind'
export { cssInJSPlugin } from './plugins/css-in-js'
export { cssModulesAdvancedPlugin, cssScopeIsolationPlugin } from './plugins/css-modules-advanced'
export { createConfigSchemaValidator, ConfigSchemaValidator } from './config/schema-validator'
export { createInteractiveConfigGenerator, InteractiveConfigGenerator } from './cli/interactive-init'

// 便捷函数
export { defineAsyncConfig } from './utils/config'
export { createBuilder } from './utils/misc/factory'

// 极简配置系统
export { defineConfig, autoConfig, SmartConfigGenerator } from './config/minimal-config'
export type { MinimalConfig } from './config/minimal-config'
export { ProjectAnalyzer, createProjectAnalyzer } from './analyzers/project-analyzer'
export type { ProjectAnalysis } from './analyzers/project-analyzer'

// 配置导出已整合

// 配置预设导出
export { presets, monorepoPackage, libraryPackage, vueLibrary, reactLibrary, multiFrameworkLibrary, ldesignPackage } from './config/presets'

// 配置规范化工具导出
export { ConfigNormalizer, createConfigNormalizer, normalizeConfig } from './config/config-normalizer'
export type { NormalizationWarning, NormalizationResult } from './config/config-normalizer'

// 配置检查工具导出
export { ConfigLinter, createConfigLinter, lintConfigs } from './utils/misc/ConfigLinter'
export type { LintResult, LintSummary } from './utils/misc/ConfigLinter'

// Zod Schema 验证导出
export { BuilderConfigSchema, validateConfig, formatZodErrors, getConfigDefaults, mergeConfigWithValidation } from './config/zod-schema'
export type { InferredBuilderConfig } from './config/zod-schema'

// 缓存管理器导出
export { BuildCacheManager } from './utils/cache/BuildCacheManager'
export type { CacheEntry, CacheStats, CacheConfig, CacheOperationResult } from './utils/cache/BuildCacheManager'

// 内存泄漏检测器导出
export { MemoryLeakDetector, createMemoryLeakDetector } from './utils/memory/MemoryLeakDetector'
export type { MemorySnapshot, MemoryLeakDetection, MemoryLeakDetectorOptions } from './utils/memory/MemoryLeakDetector'

// 新框架策略导出
export { AstroStrategy } from './strategies/astro/AstroStrategy'
export { Nuxt3Strategy } from './strategies/nuxt3/Nuxt3Strategy'
export { RemixStrategy } from './strategies/remix/RemixStrategy'
export { SolidStartStrategy } from './strategies/solid-start/SolidStartStrategy'

// 官方插件导出
export { imageOptimizerPlugin } from './plugins/image-optimizer'
export type { ImageOptimizerOptions } from './plugins/image-optimizer'
export { svgOptimizerPlugin } from './plugins/svg-optimizer'
export type { SVGOptimizerOptions } from './plugins/svg-optimizer'
export { i18nExtractorPlugin } from './plugins/i18n-extractor'
export type { I18nExtractorOptions } from './plugins/i18n-extractor'

// 构建报告生成器已整合到 build-report-generator.ts

// ========== 高级功能增强导出 ==========

// 智能代码分割导出
export { SmartCodeSplitter, createSmartCodeSplitter } from './optimizers/code-splitting/code-splitter'
export type {
  CodeSplittingConfig,
  SplitPoint,
  SplitStrategy,
  AnalysisResult,
  RouteConfig,
  CacheGroupConfig
} from './optimizers/code-splitting/code-splitter'
export { SplitStrategy as CodeSplitStrategy } from './optimizers/code-splitting/code-splitter'

// 增强型 Tree Shaking 导出
export { EnhancedTreeShaker, createEnhancedTreeShaker } from './optimizers/tree-shaking/tree-shaker'
export type {
  TreeShakingConfig,
  TreeShakingResult,
  TreeShakingReport
} from './optimizers/tree-shaking/tree-shaker'

// 分布式缓存已移除 - 功能过于复杂且未被使用
// 如需分布式缓存，请使用 MultilayerCache 的 L3 层配置

// ========== 混合框架支持导出 ==========

// 框架检测器导出
export {
  FrameworkDetector,
  createFrameworkDetector
} from './detectors/FrameworkDetector'
export type {
  FrameworkInfo,
  DetectionConfig
} from './detectors/FrameworkDetector'

// 双JSX转换器导出
export {
  DualJSXTransformer,
  createDualJSXTransformer
} from './transformers/DualJSXTransformer'
export type {
  JSXTransformConfig,
  TransformResult as JSXTransformResult
} from './transformers/DualJSXTransformer'

// 插件编排器导出
export {
  PluginOrchestrator,
  createPluginOrchestrator
} from './optimizers/plugin-orchestrator/PluginOrchestrator'
export type {
  PluginMeta,
  EnhancedPlugin,
  OrchestrationConfig
} from './optimizers/plugin-orchestrator/PluginOrchestrator'

// 增强混合策略导出
export {
  EnhancedMixedStrategy,
  createEnhancedMixedStrategy
} from './strategies/mixed/EnhancedMixedStrategy'
export type {
  MixedFrameworkConfig
} from './strategies/mixed/EnhancedMixedStrategy'

/**
 * 默认导出 - LibraryBuilder 类
 */
export { LibraryBuilder as default } from './core/LibraryBuilder'
