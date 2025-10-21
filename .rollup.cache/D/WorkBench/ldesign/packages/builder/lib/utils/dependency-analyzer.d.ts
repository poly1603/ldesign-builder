/**
 * 智能依赖分析器
 *
 * 提供深度依赖分析、循环依赖检测、未使用依赖识别等功能
 */
import { Logger } from './logger';
/**
 * 依赖类型
 */
export type DependencyType = 'production' | 'development' | 'peer' | 'optional' | 'bundled';
/**
 * 依赖信息
 */
export interface DependencyInfo {
    name: string;
    version: string;
    type: DependencyType;
    size?: number;
    license?: string;
    description?: string;
    homepage?: string;
    repository?: string;
    lastUpdated?: Date;
    vulnerabilities?: VulnerabilityInfo[];
    usageCount: number;
    importPaths: string[];
}
/**
 * 漏洞信息
 */
export interface VulnerabilityInfo {
    id: string;
    severity: 'low' | 'moderate' | 'high' | 'critical';
    title: string;
    description: string;
    patchedVersions?: string;
    recommendation?: string;
}
/**
 * 循环依赖信息
 */
export interface CircularDependency {
    cycle: string[];
    files: string[];
    severity: 'warning' | 'error';
}
/**
 * 依赖分析结果
 */
export interface DependencyAnalysisResult {
    dependencies: DependencyInfo[];
    summary: {
        total: number;
        production: number;
        development: number;
        peer: number;
        optional: number;
    };
    circularDependencies: CircularDependency[];
    unusedDependencies: string[];
    duplicateDependencies: Array<{
        name: string;
        versions: string[];
        locations: string[];
    }>;
    outdatedDependencies: Array<{
        name: string;
        current: string;
        latest: string;
        wanted: string;
    }>;
    securityIssues: VulnerabilityInfo[];
    bundleSizeAnalysis?: {
        totalSize: number;
        largestDependencies: Array<{
            name: string;
            size: number;
            percentage: number;
        }>;
        treeShakeable: string[];
        nonTreeShakeable: string[];
    };
    recommendations: string[];
}
/**
 * 分析选项
 */
export interface AnalysisOptions {
    /** 项目根目录 */
    rootDir: string;
    /** 是否检查安全漏洞 */
    checkSecurity?: boolean;
    /** 是否分析包大小 */
    analyzeBundleSize?: boolean;
    /** 是否检查过期依赖 */
    checkOutdated?: boolean;
    /** 忽略的依赖模式 */
    ignorePatterns?: string[];
    /** 最大分析深度 */
    maxDepth?: number;
}
/**
 * 智能依赖分析器
 */
export declare class DependencyAnalyzer {
    private logger;
    private packageJsonCache;
    constructor(logger?: Logger);
    /**
     * 分析项目依赖
     */
    analyze(options: AnalysisOptions): Promise<DependencyAnalysisResult>;
    /**
     * 加载 package.json
     */
    private loadPackageJson;
    /**
     * 收集依赖信息
     */
    private collectDependencies;
    /**
     * 分析单个依赖
     */
    private analyzeDependency;
    /**
     * 获取依赖类型
     */
    private getDependencyType;
    /**
     * 分析依赖使用情况
     */
    private analyzeUsage;
    /**
     * 计算包大小
     */
    private calculatePackageSize;
    /**
     * 检测循环依赖
     */
    private detectCircularDependencies;
    /**
     * 检测未使用的依赖
     */
    private detectUnusedDependencies;
    /**
     * 检测重复依赖
     */
    private detectDuplicateDependencies;
    /**
     * 检测过期依赖
     */
    private detectOutdatedDependencies;
    /**
     * 检查安全漏洞
     */
    private checkSecurityVulnerabilities;
    /**
     * 分析包大小
     */
    private analyzeBundleSize;
    /**
     * 生成建议
     */
    private generateRecommendations;
    /**
     * 检查是否应该忽略依赖
     */
    private shouldIgnoreDependency;
}
