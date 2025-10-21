/**
 * 验证报告生成器
 *
 * 负责生成和输出验证报告
 * 支持多种格式的报告输出
 *
 * @author LDesign Team
 * @version 1.0.0
 */
import type { IValidationReporter, ValidationReport, ValidationReportingConfig, ValidationResult } from '../types/validation';
import { Logger } from '../utils/logger';
/**
 * 验证报告生成器实现
 */
export declare class ValidationReporter implements IValidationReporter {
    /** 日志记录器 */
    private logger;
    /**
     * 构造函数
     */
    constructor(options?: {
        logger?: Logger;
    });
    /**
     * 生成报告
     */
    generateReport(result: ValidationResult, _config: ValidationReportingConfig): Promise<ValidationReport>;
    /**
     * 输出报告
     */
    outputReport(report: ValidationReport, config: ValidationReportingConfig): Promise<void>;
    /**
     * 生成摘要
     */
    private generateSummary;
    /**
     * 生成建议
     */
    private generateRecommendations;
    /**
     * 输出控制台报告
     */
    private outputConsoleReport;
    /**
     * 输出 JSON 报告
     */
    private outputJsonReport;
    /**
     * 输出 HTML 报告
     */
    private outputHtmlReport;
    /**
     * 输出 Markdown 报告
     */
    private outputMarkdownReport;
    /**
     * 生成 HTML 报告
     */
    private generateHtmlReport;
    /**
     * 生成 Markdown 报告
     */
    private generateMarkdownReport;
    /**
     * 获取建议图标
     */
    private getRecommendationIcon;
}
