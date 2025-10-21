/**
 * 代码质量分析器
 *
 * 提供深度的代码质量分析功能
 *
 * @author LDesign Team
 * @version 1.0.0
 */
import { Logger } from './logger';
/**
 * 代码质量问题
 */
export interface QualityIssue {
    type: 'error' | 'warning' | 'info';
    category: 'performance' | 'security' | 'maintainability' | 'reliability' | 'style';
    file: string;
    line?: number;
    column?: number;
    message: string;
    rule: string;
    severity: number;
    suggestion?: string;
}
/**
 * 代码质量指标
 */
export interface QualityMetrics {
    complexity: {
        cyclomatic: number;
        cognitive: number;
        halstead: {
            vocabulary: number;
            length: number;
            difficulty: number;
            effort: number;
        };
    };
    maintainability: {
        index: number;
        techDebt: number;
        duplications: number;
    };
    reliability: {
        bugProneness: number;
        testCoverage?: number;
    };
    security: {
        vulnerabilities: number;
        hotspots: number;
    };
    size: {
        lines: number;
        statements: number;
        functions: number;
        classes: number;
        files: number;
    };
}
/**
 * 分析结果
 */
export interface QualityAnalysisResult {
    issues: QualityIssue[];
    metrics: QualityMetrics;
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
    recommendations: string[];
}
/**
 * 代码质量分析器
 */
export declare class CodeQualityAnalyzer {
    private logger;
    constructor(logger?: Logger);
    /**
     * 分析代码质量
     */
    analyze(filePaths: string[]): Promise<QualityAnalysisResult>;
    /**
     * 分析单个文件
     */
    private analyzeFile;
    /**
     * 检查性能问题
     */
    private checkPerformanceIssues;
    /**
     * 检查安全问题
     */
    private checkSecurityIssues;
    /**
     * 检查可维护性问题
     */
    private checkMaintainabilityIssues;
    /**
     * 检查可靠性问题
     */
    private checkReliabilityIssues;
    /**
     * 更新指标
     */
    private updateMetrics;
    /**
     * 计算圈复杂度
     */
    private calculateCyclomaticComplexity;
    /**
     * 计算总体分数
     */
    private calculateScore;
    /**
     * 计算等级
     */
    private calculateGrade;
    /**
     * 生成建议
     */
    private generateRecommendations;
}
