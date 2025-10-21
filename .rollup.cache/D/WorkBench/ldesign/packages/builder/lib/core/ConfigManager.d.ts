/**
 * 配置管理器
 *
 * 负责配置文件的加载、验证、合并和监听
 *
 * @author LDesign Team
 * @version 1.0.0
 */
import { EventEmitter } from 'events';
import type { BuilderConfig, ConfigManagerOptions, ConfigLoadOptions, ConfigMergeOptions, ConfigValidationOptions } from '../types/config';
import type { ValidationResult } from '../types/common';
/**
 * 配置管理器类
 *
 * 提供配置文件的完整生命周期管理
 */
export declare class ConfigManager extends EventEmitter {
    private logger;
    private errorHandler;
    private options;
    private currentConfig?;
    private configWatcher?;
    constructor(options?: ConfigManagerOptions);
    /**
     * 加载配置文件
     */
    loadConfig(options?: ConfigLoadOptions, userConfig?: Partial<BuilderConfig>): Promise<BuilderConfig>;
    /**
     * 验证配置
     */
    validateConfig(config: BuilderConfig, _options?: ConfigValidationOptions): ValidationResult;
    /**
     * 合并配置
     */
    mergeConfigs(base: BuilderConfig, override: BuilderConfig, options?: ConfigMergeOptions): BuilderConfig;
    /**
     * 获取当前配置
     */
    getCurrentConfig(): BuilderConfig | undefined;
    /**
     * 查找配置文件
     */
    private findConfigFile;
    /**
     * 标准化配置
     */
    normalizeConfig(config: Partial<BuilderConfig>): BuilderConfig;
    /**
     * 解析环境变量
     */
    private resolveEnvironmentVariables;
    /**
     * 获取环境特定配置
     */
    private getEnvConfig;
    /**
     * 启动配置文件监听
     */
    private startWatching;
    /**
     * 停止监听
     */
    dispose(): Promise<void>;
}
