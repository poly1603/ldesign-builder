/**
 * 测试运行器
 *
 * 负责检测测试框架、安装依赖和运行测试用例
 * 支持多种测试框架的自动检测和运行
 *
 * @author LDesign Team
 * @version 1.0.0
 */
import type { ITestRunner, ValidationContext, TestRunResult } from '../types/validation';
import { Logger } from '../utils/logger';
import { ErrorHandler } from '../utils/error-handler';
/**
 * 测试运行器实现
 */
export declare class TestRunner implements ITestRunner {
    /** 日志记录器 */
    private logger;
    /** 错误处理器 */
    private errorHandler;
    /**
     * 构造函数
     */
    constructor(options?: {
        logger?: Logger;
        errorHandler?: ErrorHandler;
    });
    /**
     * 运行测试
     */
    runTests(context: ValidationContext): Promise<TestRunResult>;
    /**
     * 检测测试框架
     */
    detectFramework(projectRoot: string): Promise<string>;
    /**
     * 安装依赖
     */
    installDependencies(context: ValidationContext): Promise<void>;
    /**
     * 清理资源
     */
    dispose(): Promise<void>;
    /**
     * 检测包管理器
     */
    private detectPackageManager;
    /**
     * 执行测试命令
     */
    private executeTests;
    /**
     * 执行命令
     */
    private executeCommand;
    /**
     * 解析测试输出
     */
    private parseTestOutput;
    /**
     * 解析 Vitest 输出
     */
    private parseVitestOutput;
    /**
     * 解析 Jest 输出
     */
    private parseJestOutput;
    /**
     * 解析 Mocha 输出
     */
    private parseMochaOutput;
    /**
     * 解析通用输出
     */
    private parseGenericOutput;
    /**
     * 提取 Vitest 错误
     */
    private extractVitestErrors;
    /**
     * 提取 Jest 错误
     */
    private extractJestErrors;
    /**
     * 提取 Mocha 错误
     */
    private extractMochaErrors;
}
