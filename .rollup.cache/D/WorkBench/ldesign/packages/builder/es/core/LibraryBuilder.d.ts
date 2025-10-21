/**
 * 库构建器主控制器类
 *
 * 这是 @ldesign/builder 的核心类，负责协调各个组件完成库的构建工作
 *
 * @author LDesign Team
 * @version 1.0.0
 */
import { EventEmitter } from 'events';
import { ILibraryBuilder, BuilderOptions, BuilderStatus, BuildResult, BuildWatcher } from '../types/builder';
import type { BuilderConfig } from '../types/config';
import type { ValidationResult } from '../types/common';
import type { LibraryType } from '../types/library';
/**
 * 库构建器主控制器类
 *
 * 采用依赖注入模式，统一管理各种服务组件
 * 继承 EventEmitter，支持事件驱动的构建流程
 */
export declare class LibraryBuilder extends EventEmitter implements ILibraryBuilder {
    /** 当前状态 */
    private status;
    /** 当前配置 */
    private config;
    /** 打包核心适配器 */
    private bundlerAdapter;
    /** 策略管理器 */
    private strategyManager;
    /** 配置管理器 */
    private configManager;
    /** 插件管理器 */
    private pluginManager;
    /** 日志记录器 */
    private logger;
    /** 错误处理器 */
    private errorHandler;
    /** 性能监控器 */
    private performanceMonitor;
    /** 库类型检测器 */
    private libraryDetector;
    /** 打包后验证器 */
    private postBuildValidator;
    /** 当前构建统计 */
    private currentStats;
    /** 当前性能指标 */
    private currentMetrics;
    /** 内存管理器 */
    private memoryManager;
    /** 文件监听器 */
    private fileWatchers;
    /** 清理函数列表 */
    private cleanupFunctions;
    constructor(options?: BuilderOptions);
    /**
     * 执行库构建
     *
     * @param config 可选的配置覆盖
     * @returns 构建结果
     */
    build(config?: BuilderConfig): Promise<BuildResult>;
    /**
     * 启动监听构建模式
     *
     * @param config 可选的配置覆盖
     * @returns 构建监听器
     */
    buildWatch(config?: BuilderConfig): Promise<BuildWatcher>;
    /**
     * 合并配置
     */
    mergeConfig(base: BuilderConfig, override: BuilderConfig): BuilderConfig;
    /**
     * 验证配置
     */
    validateConfig(config: BuilderConfig): ValidationResult;
    /**
     * 加载配置文件
     */
    loadConfig(configPath?: string): Promise<BuilderConfig>;
    /**
     * 注册清理函数
     */
    private registerCleanup;
    /**
     * 清理资源
     */
    cleanup(): Promise<void>;
    /**
     * 切换打包核心
     */
    setBundler(bundler: 'rollup' | 'rolldown'): void;
    /**
     * 获取当前打包核心
     */
    getBundler(): 'rollup' | 'rolldown';
    /**
     * 设置库类型
     */
    setLibraryType(type: LibraryType): void;
    /**
     * 检测库类型
     * - 传入路径可能为文件路径或子目录，这里做归一化：
     *   1) 若为文件，取其所在目录
     *   2) 自下而上查找最近的 package.json 作为项目根
     *   3) 若未找到，回退到当前工作目录
     */
    detectLibraryType(projectPath: string): Promise<LibraryType>;
    /**
     * 获取当前状态
     */
    getStatus(): BuilderStatus;
    /**
     * 是否正在构建
     */
    isBuilding(): boolean;
    /**
     * 是否正在监听
     */
    isWatching(): boolean;
    /**
     * 初始化
     */
    initialize(): Promise<void>;
    /**
     * 销毁资源
     */
    dispose(): Promise<void>;
    /**
     * 获取构建统计信息
     */
    getStats(): any;
    /**
     * 获取性能指标
     */
    getPerformanceMetrics(): any;
    /**
     * 初始化各种服务
     */
    private initializeServices;
    /**
     * 设置事件监听器
     */
    private setupEventListeners;
    /**
     * 设置错误处理
     */
    private setupErrorHandling;
    /**
     * 设置状态
     */
    private setStatus;
    /**
     * 生成构建 ID
     */
    private generateBuildId;
    /**
     * 清理输出目录
     *
     * @param config - 构建配置
     */
    private cleanOutputDirs;
    /**
     * 处理构建错误
     */
    private handleBuildError;
    /**
     * 运行打包后验证
     */
    private runPostBuildValidation;
    /**
     * 自动更新 package.json（如果启用）
     */
    private updatePackageJsonIfEnabled;
    /**
     * 从配置中获取输出目录配置
     */
    private getOutputDirsFromConfig;
}
