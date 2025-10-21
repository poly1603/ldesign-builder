/**
 * 打包后验证器
 *
 * 负责在构建完成后验证打包产物的正确性
 * 通过运行测试用例确保打包前后功能一致性
 *
 * @author LDesign Team
 * @version 1.0.0
 */
import { EventEmitter } from 'events';
import type { IPostBuildValidator, PostBuildValidationConfig, ValidationContext, ValidationResult } from '../types/validation';
import { Logger } from '../utils/logger';
import { ErrorHandler } from '../utils/error-handler';
/**
 * 打包后验证器实现
 */
export declare class PostBuildValidator extends EventEmitter implements IPostBuildValidator {
    /** 验证配置 */
    private config;
    /** 测试运行器 */
    private testRunner;
    /** 验证报告生成器 */
    private reporter;
    /** 临时环境管理器 */
    private tempEnvironment;
    /** 日志记录器 */
    private logger;
    /** 错误处理器 */
    private errorHandler;
    /**
     * 构造函数
     */
    constructor(config?: PostBuildValidationConfig, options?: {
        logger?: Logger;
        errorHandler?: ErrorHandler;
    });
    /**
     * 执行验证
     */
    validate(context: ValidationContext): Promise<ValidationResult>;
    /**
     * 设置配置
     */
    setConfig(config: PostBuildValidationConfig): void;
    /**
     * 获取配置
     */
    getConfig(): PostBuildValidationConfig;
    /**
     * 清理资源
     */
    dispose(): Promise<void>;
    /**
     * 准备验证环境
     */
    private setupValidationEnvironment;
    /**
     * 运行验证测试
     */
    private runValidationTests;
    /**
     * 生成验证报告
     */
    private generateValidationReport;
    /**
     * 输出验证报告
     */
    private outputValidationReport;
    /**
     * 清理验证环境
     */
    private cleanupValidationEnvironment;
    /**
     * 合并配置
     */
    private mergeConfig;
}
