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
export { MemoryOptimizer, getGlobalMemoryOptimizer } from './utils/memory-optimizer'
export type { MemoryStats, MemoryConfig } from './utils/memory-optimizer'
export { createIncrementalBuildManager, IncrementalBuildManager } from './utils/incremental-build-manager'
export { createParallelProcessor, ParallelProcessor } from './utils/parallel-processor'
export { createStreamFileProcessor, StreamFileProcessor } from './utils/stream-file-processor'
export { createBuildReportGenerator, BuildReportGenerator } from './utils/build-report-generator'
export { createBundleAnalyzer, BundleAnalyzer } from './utils/bundle-analyzer'
export { createSmartWatcher, SmartWatcher } from './utils/smart-watcher'
export { createAutoConfigEnhancer, AutoConfigEnhancer } from './utils/auto-config-enhancer'
export { createOutputNormalizer, OutputNormalizer } from './utils/output-normalizer'
export { createParallelBuildExecutor, ParallelBuildExecutor, buildParallel } from './utils/parallel-build-executor'
// 错误处理器已合并到 error-handler.ts
export { tailwindPlugin } from './plugins/tailwind'
export { cssInJSPlugin } from './plugins/css-in-js'
export { cssModulesAdvancedPlugin, cssScopeIsolationPlugin } from './plugins/css-modules-advanced'
export { swcPlugin, swcMinifyPlugin } from './compilers/swc-compiler'
export { createConfigSchemaValidator, ConfigSchemaValidator } from './config/schema-validator'
export { createInteractiveConfigGenerator, InteractiveConfigGenerator } from './cli/interactive-init'
export { createOptimizationAdvisor, OptimizationAdvisor } from './advisor/optimization-advisor'
export { createDependencyGraphVisualizer, DependencyGraphVisualizer } from './visualize/dependency-graph-visualizer'

// 便捷函数
export { defineAsyncConfig } from './utils/config'
export { createBuilder } from './utils/factory'

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
export { ConfigLinter, createConfigLinter, lintConfigs } from './utils/config-linter'
export type { LintResult, LintSummary } from './utils/config-linter'

// Zod Schema 验证导出
export { BuilderConfigSchema, validateConfig, formatZodErrors, getConfigDefaults, mergeConfigWithValidation } from './config/zod-schema'
export type { InferredBuilderConfig } from './config/zod-schema'

// 缓存管理器导出
export { MultilayerCache, createMultilayerCache } from './utils/cache-manager'
export type { CacheEntry, CacheStats, MultilayerCacheOptions } from './utils/cache-manager'

// 并行执行器导出
export { AdvancedParallelExecutor as ParallelExecutor, createAdvancedParallelExecutor as createParallelExecutor } from './utils/parallel-executor'
export type { TaskNode, TaskExecutionResult, SchedulingStrategy, AdvancedParallelExecutorOptions as ParallelExecutorOptions } from './utils/parallel-executor'

// 内存泄漏检测器导出
export { MemoryLeakDetector, createMemoryLeakDetector } from './utils/memory-leak-detector'
export type { MemorySnapshot, MemoryLeakDetection, MemoryLeakDetectorOptions } from './utils/memory-leak-detector'

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

// 现代工具链集成导出
export { biomeIntegrationPlugin, generateBiomeConfig } from './integrations/biome-integration'
export type { BiomeIntegrationOptions } from './integrations/biome-integration'
export { oxcIntegrationPlugin, generateOxcConfig } from './integrations/oxc-integration'
export type { OxcIntegrationOptions } from './integrations/oxc-integration'
export { lightningCSSPlugin, generateLightningCSSConfig } from './integrations/lightning-css'
export type { LightningCSSOptions } from './integrations/lightning-css'

// 调试工具导出
export { BuildDebugger, createBuildDebugger } from './debugger/build-debugger'
export type { Breakpoint, DebugContext, BuildDebuggerOptions } from './debugger/build-debugger'
export { PerformanceProfiler, createPerformanceProfiler } from './debugger/performance-profiler'
export type { PerformanceEvent, FlameGraphNode, TimelineEvent, PerformanceProfilerOptions } from './debugger/performance-profiler'

// 构建报告生成器已整合到 build-report-generator.ts

// 实时监控导出
export { RealTimeMonitor, createRealTimeMonitor } from './monitor/real-time-monitor'
export type { ProgressInfo, MonitorData, RealTimeMonitorOptions } from './monitor/real-time-monitor'

// 边缘运行时支持导出
export { applyCloudflareWorkersConfig, generateWranglerConfig } from './runtimes/cloudflare-workers'
export type { CloudflareWorkersOptions } from './runtimes/cloudflare-workers'
export { applyDenoDeployConfig, generateDenoConfig, generateImportMap } from './runtimes/deno-deploy'
export type { DenoDeployOptions } from './runtimes/deno-deploy'

// CI/CD 模板导出
export { generateGitHubActionsWorkflow, generatePerformanceWorkflow } from './ci/github-actions-template'
export { generateDockerfile, generateDockerCompose, generateDockerIgnore } from './ci/docker-template'

// 插件市场导出（registry）
export { PluginRegistry, createPluginRegistry } from './plugin-market/plugin-registry'
export type { PluginMetadata as PluginRegistryMetadata } from './plugin-market/plugin-registry'
export { PluginSDK, createPluginSDK } from './plugin-market/plugin-sdk'
export type { PluginTemplate } from './plugin-market/plugin-sdk'

// 配置可视化导出
export { ConfigVisualizer, createConfigVisualizer } from './visualizer/config-visualizer'
export type { ConfigTemplate } from './visualizer/config-visualizer'

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

// 分布式缓存导出
export { DistributedCache, createDistributedCache, CacheBackend } from './cache/DistributedCache'
export type {
  DistributedCacheConfig,
  CacheBackend as CacheBackendType,
  CacheEntry as DistributedCacheEntry,
  CacheMetadata,
  CacheStats as DistributedCacheStats,
  RedisConfig,
  S3Config,
  MongoDBConfig,
  CacheBackendInterface
} from './cache/DistributedCache'

// 性能分析器导出
export { PerformanceProfiler as BuildPerformanceProfiler, createPerformanceProfiler as createBuildPerformanceProfiler } from './monitoring/profiler'
export type {
  PerformanceMetrics,
  PhaseMetrics,
  CPUUsage,
  MemoryUsage,
  FileIOMetrics,
  Bottleneck,
  FlameGraphData,
  PerformanceProfilerConfig as BuildPerformanceProfilerConfig
} from './monitoring/profiler'

// 压缩工具导出
export {
  compress,
  decompress,
  detectCompressionAlgorithm,
  calculateCompressionRatio,
  selectBestCompression,
  CompressionAlgorithm
} from './utils/compression'
export type { CompressionOptions } from './utils/compression'

// 3D Bundle 分析器导出
export { Bundle3DAnalyzer, createBundle3DAnalyzer } from './visualizers/bundle-analyzer'
export type {
  Bundle3DAnalyzerConfig,
  Bundle3DAnalysis,
  Node3D,
  Edge3D,
  Scene3DConfig
} from './visualizers/bundle-analyzer'

// AI 配置优化器导出
export { AIConfigOptimizer, createAIConfigOptimizer } from './ai/config-optimizer'
export type {
  AIModelConfig,
  OptimizationSuggestion,
  ProjectFeatures,
  DiagnosticResult
} from './ai/config-optimizer'

// 插件市场导出（marketplace）
export { PluginMarketplace, createPluginMarketplace } from './plugin-market/PluginMarketplace'
export type {
  PluginMetadata as PluginMarketMetadata,
  PluginSearchOptions,
  PluginInstallOptions,
  PluginReview,
  PluginConfigTemplate
} from './plugin-market/PluginMarketplace'

// Monorepo 增强导出
export { MonorepoEnhancer, createMonorepoEnhancer } from './monorepo/MonorepoEnhancer'
export type {
  WorkspacePackage,
  BuildTask,
  DependencyGraph,
  BuildStrategy,
  MonorepoBuildResult
} from './monorepo/MonorepoEnhancer'

// CDN 优化器导出
export { CDNOptimizer, createCDNOptimizer } from './cdn/CDNOptimizer'
export type {
  CDNConfig,
  CDNProvider,
  UploadResult,
  VersionInfo,
  EdgeWorkerScript
} from './cdn/CDNOptimizer'
export { CDNProvider as CDNProviderType } from './cdn/CDNOptimizer'

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
