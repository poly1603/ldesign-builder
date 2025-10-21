/**
 * 临时环境管理器
 *
 * 负责创建、管理和清理验证过程中的临时环境
 * 包括临时目录创建、文件复制、依赖替换等功能
 *
 * @author LDesign Team
 * @version 1.0.0
 */
import type { ValidationContext } from '../types/validation';
import { Logger } from '../utils/logger';
import { ErrorHandler } from '../utils/error-handler';
/**
 * 临时环境管理器实现
 */
export declare class TemporaryEnvironment {
    /** 日志记录器 */
    private logger;
    /** 错误处理器 */
    private errorHandler;
    /** 创建的临时目录列表 */
    private tempDirs;
    /**
     * 构造函数
     */
    constructor(options?: {
        logger?: Logger;
        errorHandler?: ErrorHandler;
    });
    /**
     * 创建临时环境
     */
    create(context: ValidationContext): Promise<void>;
    /**
     * 复制构建产物到临时环境
     */
    copyBuildOutputs(context: ValidationContext): Promise<void>;
    /**
     * 清理临时环境
     */
    cleanup(context: ValidationContext): Promise<void>;
    /**
     * 清理所有临时环境
     */
    dispose(): Promise<void>;
    /**
     * 创建临时目录
     */
    private createTempDirectory;
    /**
     * 复制项目文件到临时目录
     */
    private copyProjectFiles;
    /**
     * 复制测试文件
     */
    private copyTestFiles;
    /**
     * 复制源码文件
     */
    private copySourceFiles;
    /**
     * 更新 package.json 以使用构建产物
     */
    private updatePackageJson;
    /**
     * 获取临时目录列表
     */
    getTempDirectories(): string[];
    /**
     * 检查临时目录是否存在
     */
    exists(tempDir: string): Promise<boolean>;
    /**
     * 获取临时目录大小
     */
    getSize(tempDir: string): Promise<number>;
    /**
     * 获取目录统计信息
     */
    private getDirectoryStats;
}
