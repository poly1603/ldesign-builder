/**
 * 构建性能分析器
 *
 * 提供详细的构建性能分析、瓶颈识别和优化建议
 */
import { Logger } from './logger';
/**
 * 构建阶段
 */
export type BuildPhase = 'initialization' | 'dependency-resolution' | 'file-scanning' | 'compilation' | 'bundling' | 'optimization' | 'output-generation' | 'validation';
/**
 * 性能指标
 */
export interface PerformanceMetrics {
    duration: number;
    memoryUsage: {
        peak: number;
        average: number;
        final: number;
    };
    cpuUsage?: {
        user: number;
        system: number;
    };
    fileOperations: {
        reads: number;
        writes: number;
        totalSize: number;
    };
    cacheHits: number;
    cacheMisses: number;
}
/**
 * 阶段性能数据
 */
export interface PhasePerformance {
    phase: BuildPhase;
    startTime: number;
    endTime: number;
    duration: number;
    memoryUsage: {
        heapUsed: number;
        heapTotal: number;
        peak: number;
        average: number;
        final: number;
    };
    metrics: PerformanceMetrics;
    subPhases?: PhasePerformance[];
    warnings: string[];
    bottlenecks: string[];
}
/**
 * 性能瓶颈
 */
export interface PerformanceBottleneck {
    type: 'memory' | 'cpu' | 'io' | 'cache' | 'dependency';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    impact: string;
    suggestion: string;
    phase: BuildPhase;
    metrics: {
        value: number;
        threshold: number;
        unit: string;
    };
}
/**
 * 性能分析结果
 */
export interface BuildPerformanceAnalysis {
    totalDuration: number;
    phases: PhasePerformance[];
    bottlenecks: {
        slowestPhase: string | null;
        slowestDuration: number;
        memoryPeak: number;
        issues: string[];
    };
    recommendations: string[];
    comparison?: {
        previousBuild?: BuildPerformanceAnalysis;
        baseline?: BuildPerformanceAnalysis;
        improvement: number;
    };
    summary: {
        averagePhaseTime: number;
        memoryEfficiency: number;
        cacheHitRate: number;
        parallelizationOpportunities: string[];
    };
    detailedMetrics?: {
        cpuUsage: {
            user: number;
            system: number;
        };
        memoryPeak: number;
        diskIO: {
            reads: number;
            writes: number;
        };
        networkRequests: number;
    };
}
/**
 * 分析选项
 */
export interface AnalysisOptions {
    /** 是否启用详细分析 */
    detailed?: boolean;
    /** 是否包含详细指标 */
    includeDetailedMetrics?: boolean;
    /** 是否包含建议 */
    includeRecommendations?: boolean;
    /** 性能阈值配置 */
    thresholds?: {
        slowPhase: number;
        highMemory: number;
        lowCacheHit: number;
    };
    /** 是否与历史数据比较 */
    compareWithHistory?: boolean;
    /** 历史数据保留数量 */
    historyLimit?: number;
}
/**
 * 构建性能分析器
 */
export declare class BuildPerformanceAnalyzer {
    private logger;
    private performanceMonitor;
    private currentAnalysis;
    private phaseStack;
    private history;
    constructor(logger?: Logger);
    /**
     * 开始性能分析
     */
    startAnalysis(): void;
    /**
     * 开始阶段
     */
    startPhase(phase: BuildPhase): void;
    /**
     * 结束阶段
     */
    endPhase(phase: BuildPhase): PhasePerformance | null;
    /**
     * 记录文件操作
     */
    recordFileOperation(type: 'read' | 'write', size: number): void;
    /**
     * 记录缓存操作
     */
    recordCacheOperation(hit: boolean): void;
    /**
     * 完成分析
     */
    finishAnalysis(options?: AnalysisOptions): BuildPerformanceAnalysis;
    /**
     * 检测阶段瓶颈
     */
    private detectPhaseBottlenecks;
    /**
     * 检测全局瓶颈
     */
    private detectGlobalBottlenecks;
    /**
     * 生成建议
     */
    private generateRecommendations;
    /**
     * 生成摘要
     */
    private generateSummary;
    /**
     * 获取慢阶段的建议
     */
    private getSuggestionForSlowPhase;
    /**
     * 获取高内存使用的建议
     */
    private getSuggestionForHighMemory;
    /**
     * 获取历史分析数据
     */
    getHistory(): BuildPerformanceAnalysis[];
    /**
     * 清除历史数据
     */
    clearHistory(): void;
    /**
     * 计算内存效率
     */
    private calculateMemoryEfficiency;
}
