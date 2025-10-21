/**
 * 库类型检测器
 *
 * 负责自动检测项目的库类型
 *
 * @author LDesign Team
 * @version 1.0.0
 */
import { LibraryDetectionResult } from '../types/library';
import { Logger } from '../utils/logger';
/**
 * 库类型检测器选项
 */
export interface LibraryDetectorOptions {
    logger?: Logger;
    confidence?: number;
    cache?: boolean;
}
/**
 * 库类型检测器类
 */
export declare class LibraryDetector {
    private logger;
    private errorHandler;
    private options;
    constructor(options?: LibraryDetectorOptions);
    /**
     * 检测库类型
     */
    detect(projectPath: string): Promise<LibraryDetectionResult>;
    /**
     * 检测文件模式
     */
    private detectFilePatterns;
    /**
     * 检测依赖
     */
    private detectDependencies;
    /**
     * 检测配置文件
     */
    private detectConfigFiles;
    /**
     * 检测 package.json 字段
     */
    private detectPackageJsonFields;
    /**
     * 计算最终分数
     */
    private calculateFinalScores;
    /**
     * 获取最佳匹配
     */
    private getBestMatch;
    /**
     * 匹配依赖
     */
    private matchDependency;
}
