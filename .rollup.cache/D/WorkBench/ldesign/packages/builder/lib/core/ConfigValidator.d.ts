/**
 * 配置验证器
 *
 * 验证和规范化构建配置
 *
 * @author LDesign Team
 * @version 1.0.0
 */
import type { BuilderConfig } from '../types/config';
import { Logger } from '../utils/logger';
export interface ValidationResult {
    /** 是否有效 */
    valid: boolean;
    /** 错误信息 */
    errors: string[];
    /** 警告信息 */
    warnings: string[];
    /** 规范化后的配置 */
    normalizedConfig?: BuilderConfig;
}
export interface ConfigValidationOptions {
    /** 是否严格模式 */
    strict?: boolean;
    /** 是否检查文件存在性 */
    checkFiles?: boolean;
    /** 工作目录 */
    cwd?: string;
}
export declare class ConfigValidator {
    private logger;
    private options;
    constructor(options?: ConfigValidationOptions, logger?: Logger);
    /**
     * 验证配置
     */
    validate(config: Partial<BuilderConfig>): ValidationResult;
    /**
     * 验证基础配置
     */
    private validateBasicConfig;
    /**
     * 验证输入配置
     */
    private validateInput;
    /**
     * 验证输出配置
     */
    private validateOutput;
    /**
     * 验证打包器配置
     */
    private validateBundler;
    /**
     * 验证压缩配置
     */
    private validateMinifyConfig;
    /**
     * 验证外部依赖配置
     */
    private validateExternal;
    /**
     * 验证插件配置
     */
    private validatePlugins;
    /**
     * 验证性能配置
     */
    private validatePerformance;
    /**
     * 验证文件存在性
     */
    private validateFileExistence;
    /**
     * 规范化配置
     */
    private normalizeConfig;
    /**
     * 获取配置建议
     */
    getSuggestions(config: Partial<BuilderConfig>): string[];
}
/**
 * 创建配置验证器
 */
export declare function createConfigValidator(options?: ConfigValidationOptions, logger?: Logger): ConfigValidator;
/**
 * 快速验证配置
 */
export declare function validateConfig(config: Partial<BuilderConfig>, options?: ConfigValidationOptions): ValidationResult;
