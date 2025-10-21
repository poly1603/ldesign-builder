/**
 * 策略管理器
 *
 * 负责管理不同库类型的构建策略
 *
 * @author LDesign Team
 * @version 1.0.0
 */
import type { ILibraryStrategy, StrategyManagerOptions, StrategyDetectionResult, StrategyApplicationResult } from '../types/strategy';
import { LibraryType } from '../types/library';
import type { BuilderConfig } from '../types/config';
/**
 * 策略管理器类
 */
export declare class StrategyManager {
    private logger;
    private errorHandler;
    private strategies;
    constructor(_options?: StrategyManagerOptions);
    /**
     * 注册策略
     */
    registerStrategy(strategy: ILibraryStrategy): void;
    /**
     * 获取策略
     */
    getStrategy(libraryType: LibraryType): ILibraryStrategy;
    /**
     * 检测最佳策略
     */
    detectStrategy(_projectPath: string): Promise<StrategyDetectionResult>;
    /**
     * 应用策略
     */
    applyStrategy(libraryType: LibraryType, config: BuilderConfig): Promise<StrategyApplicationResult>;
    /**
     * 获取所有已注册的策略
     */
    getAllStrategies(): ILibraryStrategy[];
    /**
     * 获取支持的库类型
     */
    getSupportedTypes(): LibraryType[];
    /**
     * 注册默认策略
     */
    private registerDefaultStrategies;
}
