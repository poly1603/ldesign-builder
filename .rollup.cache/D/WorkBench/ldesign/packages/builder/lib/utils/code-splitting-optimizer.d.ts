/**
 * 代码分割优化器
 *
 * 智能分析代码依赖关系，提供最优的代码分割策略
 */
import { Logger } from './logger';
/**
 * 模块信息
 */
export interface ModuleInfo {
    id: string;
    path: string;
    size: number;
    imports: string[];
    exports: string[];
    dependencies: string[];
    dependents: string[];
    isEntry: boolean;
    isVendor: boolean;
    frequency: number;
    category: 'core' | 'feature' | 'vendor' | 'utility' | 'asset';
}
/**
 * 代码块信息
 */
export interface ChunkInfo {
    name: string;
    modules: string[];
    size: number;
    priority: number;
    type: 'entry' | 'vendor' | 'common' | 'async' | 'runtime';
    loadStrategy: 'eager' | 'lazy' | 'prefetch' | 'preload';
    dependencies: string[];
    consumers: string[];
}
/**
 * 分割策略
 */
export interface SplittingStrategy {
    name: string;
    description: string;
    chunks: ChunkInfo[];
    benefits: {
        cacheEfficiency: number;
        parallelLoading: number;
        bundleSize: number;
        loadTime: number;
    };
    tradeoffs: string[];
    recommendations: string[];
}
/**
 * 优化选项
 */
export interface OptimizationOptions {
    /** 项目根目录 */
    rootDir: string;
    /** 入口文件 */
    entries: string[];
    /** 最小块大小 (bytes) */
    minChunkSize?: number;
    /** 最大块大小 (bytes) */
    maxChunkSize?: number;
    /** 最大并行加载数 */
    maxParallelRequests?: number;
    /** 最大初始请求数 */
    maxInitialRequests?: number;
    /** 缓存组配置 */
    cacheGroups?: Record<string, CacheGroupConfig>;
    /** 是否启用预取 */
    enablePrefetch?: boolean;
    /** 是否启用预加载 */
    enablePreload?: boolean;
    /** 优化策略 */
    strategy?: string;
}
/**
 * 缓存组配置
 */
export interface CacheGroupConfig {
    test?: RegExp | string;
    priority: number;
    minSize: number;
    maxSize?: number;
    minChunks: number;
    maxAsyncRequests?: number;
    maxInitialRequests?: number;
    name?: string | false;
    chunks?: 'all' | 'async' | 'initial';
    enforce?: boolean;
}
/**
 * 分析结果
 */
export interface SplittingAnalysisResult {
    modules: ModuleInfo[];
    currentStrategy: SplittingStrategy;
    recommendedStrategies: SplittingStrategy[];
    optimizations: {
        duplicateCode: Array<{
            modules: string[];
            size: number;
            suggestion: string;
        }>;
        unusedExports: Array<{
            module: string;
            exports: string[];
            potentialSavings: number;
        }>;
        circularDependencies: Array<{
            cycle: string[];
            impact: string;
        }>;
    };
    metrics: {
        totalSize: number;
        chunkCount: number;
        averageChunkSize: number;
        cacheEfficiency: number;
        loadingPerformance: number;
    };
}
/**
 * 代码分割优化器
 */
export declare class CodeSplittingOptimizer {
    private logger;
    private moduleGraph;
    private dependencyGraph;
    constructor(logger?: Logger);
    /**
     * 优化代码分割（analyze方法的别名）
     */
    optimize(options: OptimizationOptions): Promise<SplittingAnalysisResult>;
    /**
     * 分析并优化代码分割
     */
    analyze(options: OptimizationOptions): Promise<SplittingAnalysisResult>;
    /**
     * 构建模块图
     */
    private buildModuleGraph;
    /**
     * 查找模块文件
     */
    private findModuleFiles;
    /**
     * 分析单个模块
     */
    private analyzeModule;
    /**
     * 提取导入语句
     */
    private extractImports;
    /**
     * 提取导出语句
     */
    private extractExports;
    /**
     * 模块分类
     */
    private categorizeModule;
    /**
     * 构建依赖关系图
     */
    private buildDependencyGraph;
    /**
     * 解析导入路径
     */
    private resolveImportPath;
    /**
     * 计算模块指标
     */
    private calculateModuleMetrics;
    /**
     * 构建依赖边
     */
    private buildDependencyEdges;
    /**
     * 分析当前分割策略
     */
    private analyzeCurrentStrategy;
    /**
     * 生成推荐策略
     */
    private generateRecommendedStrategies;
    /**
     * 生成基于频率的分割策略
     */
    private generateFrequencyBasedStrategy;
    /**
     * 生成基于功能的分割策略
     */
    private generateFeatureBasedStrategy;
    /**
     * 生成混合策略
     */
    private generateHybridStrategy;
    /**
     * 提取功能名称
     */
    private extractFeatureName;
    /**
     * 检测优化机会
     */
    private detectOptimizations;
    /**
     * 检测重复代码
     */
    private detectDuplicateCode;
    /**
     * 检测未使用的导出
     */
    private detectUnusedExports;
    /**
     * 检测循环依赖
     */
    private detectCircularDependencies;
    /**
     * 计算指标
     */
    private calculateMetrics;
}
