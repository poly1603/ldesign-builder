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
export { LibraryBuilder } from './core/LibraryBuilder'
export { EnhancedLibraryBuilder } from './core/EnhancedLibraryBuilder'
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
export { createFriendlyErrorHandler, FriendlyErrorHandler, handleError } from './utils/friendly-error-handler'
export { createEnhancedErrorHandler, EnhancedErrorHandler } from './utils/enhanced-error-handler'
export { tailwindPlugin } from './plugins/tailwind'
export { cssInJSPlugin } from './plugins/css-in-js'
export { cssModulesAdvancedPlugin, cssScopeIsolationPlugin } from './plugins/css-modules-advanced'
export { swcPlugin, swcMinifyPlugin } from './compilers/swc-compiler'
export { createConfigSchemaValidator, ConfigSchemaValidator } from './config/schema-validator'
export { createInteractiveConfigGenerator, InteractiveConfigGenerator } from './cli/interactive-init'
export { createOptimizationAdvisor, OptimizationAdvisor } from './advisor/optimization-advisor'
export { createDependencyGraphVisualizer, DependencyGraphVisualizer } from './visualize/dependency-graph-visualizer'

// 便捷函数
export { defineConfig, defineAsyncConfig } from './utils/config'
export { createBuilder } from './utils/factory'

// 增强配置导出
export * from './config/enhanced-config'

// 配置预设导出
export { presets, monorepoPackage, libraryPackage, vueLibrary, reactLibrary, multiFrameworkLibrary } from './config/presets'

// Zod Schema 验证导出
export { BuilderConfigSchema, validateConfig, formatZodErrors, getConfigDefaults, mergeConfigWithValidation } from './config/zod-schema'
export type { InferredBuilderConfig } from './config/zod-schema'

// 多层缓存导出
export { MultilayerCache, createMultilayerCache } from './utils/multilayer-cache'
export type { CacheEntry, CacheStats, MultilayerCacheOptions } from './utils/multilayer-cache'

// 高级并行执行器导出
export { AdvancedParallelExecutor, createAdvancedParallelExecutor } from './utils/advanced-parallel-executor'
export type { TaskNode, TaskExecutionResult, SchedulingStrategy, AdvancedParallelExecutorOptions } from './utils/advanced-parallel-executor'

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

// 增强构建报告导出
export { EnhancedBuildReportGenerator, createEnhancedBuildReportGenerator } from './utils/enhanced-build-report'
export type { EnhancedBuildReportData } from './utils/enhanced-build-report'

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

// 插件市场导出
export { PluginRegistry, createPluginRegistry } from './plugin-market/plugin-registry'
export type { PluginMetadata } from './plugin-market/plugin-registry'
export { PluginSDK, createPluginSDK } from './plugin-market/plugin-sdk'
export type { PluginTemplate } from './plugin-market/plugin-sdk'

// 配置可视化导出
export { ConfigVisualizer, createConfigVisualizer } from './visualizer/config-visualizer'
export type { ConfigTemplate } from './visualizer/config-visualizer'

/**
 * 默认导出 - LibraryBuilder 类
 */
export { LibraryBuilder as default } from './core/LibraryBuilder'
