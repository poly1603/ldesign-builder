/**
 * 输出质量验证器
 *
 * 验证打包产物的功能完整性、source map 准确性、类型声明文件正确性
 *
 * @author LDesign Team
 * @version 1.0.0
 */
import { Logger } from '../utils/logger';
export interface QualityCheckResult {
    /** 检查名称 */
    name: string;
    /** 是否通过 */
    passed: boolean;
    /** 检查详情 */
    details: string[];
    /** 错误信息 */
    errors: string[];
    /** 警告信息 */
    warnings: string[];
    /** 评分 (0-100) */
    score: number;
}
export interface QualityReport {
    /** 总体评分 */
    overallScore: number;
    /** 检查结果 */
    checks: QualityCheckResult[];
    /** 通过的检查数 */
    passedChecks: number;
    /** 失败的检查数 */
    failedChecks: number;
    /** 建议 */
    recommendations: string[];
}
export declare class OutputQualityValidator {
    private logger;
    constructor(logger?: Logger);
    /**
     * 验证输出质量
     */
    validateOutput(outputDir: string): Promise<QualityReport>;
    /**
     * 检查文件完整性
     */
    private checkFileCompleteness;
    /**
     * 检查功能完整性
     */
    private checkFunctionalCompleteness;
    /**
     * 检查 Source Map
     */
    private checkSourceMaps;
    /**
     * 检查类型声明文件
     */
    private checkTypeDeclarations;
    /**
     * 检查代码质量
     */
    private checkCodeQuality;
    /**
     * 检查性能
     */
    private checkPerformance;
    /**
     * 检查兼容性
     */
    private checkCompatibility;
    /**
     * 检查安全性
     */
    private checkSecurity;
    /**
     * 生成建议
     */
    private generateRecommendations;
    /**
     * 格式化字节大小
     */
    private formatBytes;
    /**
     * 生成质量报告
     */
    generateReport(report: QualityReport): string;
}
/**
 * 创建输出质量验证器
 */
export declare function createOutputQualityValidator(logger?: Logger): OutputQualityValidator;
/**
 * 快速验证输出质量
 */
export declare function validateOutputQuality(outputDir: string, logger?: Logger): Promise<QualityReport>;
