/**
 * 增强版库构建器主控制器类
 *
 * 这是 @ldesign/builder 的核心增强版类，提供更强大的构建功能和验证机制
 *
 * @author LDesign Team
 * @version 2.0.0
 */
import { EventEmitter } from 'events';
import { ILibraryBuilder, BuilderOptions, BuilderStatus, BuildResult, BuildWatcher } from '../types/builder';
import type { BuilderConfig } from '../types/config';
import type { ValidationResult } from '../types/common';
import type { LibraryType } from '../types/library';
/**
 * 增强版库构建器主控制器类
 */
export declare class EnhancedLibraryBuilder extends EventEmitter implements ILibraryBuilder {
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
    /** 构建缓存 */
    private buildCache;
    /** 依赖分析缓存 */
    private dependencyCache;
    /** 构建历史 */
    private buildHistory;
    /** 最大历史记录数 */
    private readonly maxHistorySize;
    constructor(options?: BuilderOptions);
    /**
     * 执行库构建（增强版）
     */
    build(config?: BuilderConfig): Promise<BuildResult>;
    /**
     * 验证构建配置
     */
    private validateBuildConfig;
    /**
     * 分析依赖
     */
    private analyzeDependencies;
    /**
     * 分析文件导入
     */
    private analyzeImports;
    /**
     * 检测循环依赖
     */
    private detectCircularDependencies;
    /**
     * 解析文件路径
     */
    private resolveFilePath;
    /**
     * 解析入口集合（支持字符串、数组、对象与 glob）
     */
    private resolveEntries;
    /**
     * 预处理源代码
     */
    private preprocessSources;
    /**
     * 后处理构建产物
     */
    private postprocessOutputs;
    /**
     * 检查代码质量
     */
    private checkCodeQuality;
    /**
     * 增强的打包后验证
     */
    private runEnhancedValidation;
    /**
     * 创建测试项目
     */
    private createTestProject;
    /**
     * 运行功能测试
     */
    private runFunctionalTests;
    /**
     * 运行性能测试
     */
    private runPerformanceTests;
    /**
     * 运行兼容性测试
     */
    private runCompatibilityTests;
    /**
     * 对比打包前后功能
     */
    private compareFunctionality;
    /**
     * 生成构建报告
     */
    private generateBuildReport;
    /**
     * 尝试错误恢复
     */
    private attemptErrorRecovery;
    /**
     * 生成缓存键
     */
    private generateCacheKey;
    /**
     * 获取缓存的构建结果
     */
    private getCachedBuild;
    /**
     * 缓存构建结果
     */
    private cacheBuildResult;
    /**
     * 加载构建缓存
     */
    private loadBuildCache;
    /**
     * 保存构建缓存
     */
    private saveBuildCache;
    /**
     * 添加到构建历史
     */
    private addToHistory;
    /**
     * 获取构建历史
     */
    getBuildHistory(): BuildResult[];
    /**
     * 清理构建缓存
     */
    clearCache(): Promise<void>;
    /**
     * 加载 package.json
     */
    private loadPackageJson;
    /**
     * 提取包名
     */
    private extractPackageName;
    /**
     * 检查是否是外部依赖
     */
    private isExternal;
    /**
     * 启动监听构建模式
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
     * - 传入的路径可能是文件路径或子目录，这里做归一化：
     *   1) 若为文件路径，取其所在目录
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
     * 处理构建错误
     */
    private handleBuildError;
}
