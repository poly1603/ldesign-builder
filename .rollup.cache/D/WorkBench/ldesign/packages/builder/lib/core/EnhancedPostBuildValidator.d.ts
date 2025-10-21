/**
 * 增强版打包后验证器
 *
 * 提供全面的打包产物验证，确保打包前后功能完全一致
 *
 * @author LDesign Team
 * @version 2.0.0
 */
import { EventEmitter } from 'events';
import type { IPostBuildValidator, PostBuildValidationConfig, ValidationContext, ValidationResult } from '../types/validation';
import { Logger } from '../utils/logger';
import { ErrorHandler } from '../utils/error-handler';
/**
 * 增强的验证配置
 */
interface EnhancedValidationConfig extends PostBuildValidationConfig {
    strict?: boolean;
    compareExports?: boolean;
    compareImports?: boolean;
    compareBehavior?: boolean;
    comparePerformance?: boolean;
    runtimeValidation?: boolean;
    apiCompatibility?: boolean;
    integrationTests?: boolean;
    benchmarks?: boolean;
    snapshotTesting?: boolean;
}
/**
 * 增强版打包后验证器实现
 */
export declare class EnhancedPostBuildValidator extends EventEmitter implements IPostBuildValidator {
    /** 验证配置 */
    private config;
    /** 临时环境管理器 */
    private tempEnvironment;
    /** 日志记录器 */
    private logger;
    /** 错误处理器 */
    private errorHandler;
    /** 验证缓存 */
    private validationCache;
    /** 快照存储 */
    private snapshots;
    constructor(config?: EnhancedValidationConfig, options?: {
        logger?: Logger;
        errorHandler?: ErrorHandler;
    });
    /**
     * 执行增强验证
     */
    validate(context: ValidationContext): Promise<ValidationResult>;
    /**
     * 比较导出
     */
    private compareExports;
    /**
     * 比较导入
     */
    private compareImports;
    /**
     * 比较行为
     */
    private compareBehavior;
    /**
     * 执行运行时验证
     */
    private performRuntimeValidation;
    /**
     * 检查 API 兼容性
     */
    private checkAPICompatibility;
    /**
     * 比较性能
     */
    private comparePerformance;
    /**
     * 运行集成测试
     */
    private runIntegrationTests;
    /**
     * 运行快照测试
     */
    private runSnapshotTests;
    /**
     * 设置增强的验证环境
     */
    private setupEnhancedEnvironment;
    /**
     * 创建测试项目
     */
    private createTestProject;
    /**
     * 创建运行时测试文件
     */
    private createRuntimeTestFile;
    /**
     * 生成功能测试
     */
    private generateFunctionalityTests;
    /**
     * 生成边缘情况测试
     */
    private generateEdgeCaseTests;
    /**
     * 生成兼容性测试
     */
    private generateCompatibilityTests;
    /**
     * 提取源代码导出
     */
    private extractSourceExports;
    /**
     * 提取打包后导出
     */
    private extractBundleExports;
    /**
     * 提取源代码导入
     */
    private extractSourceImports;
    /**
     * 提取打包后导入
     */
    private extractBundleImports;
    /**
     * 创建行为测试套件
     */
    private createBehaviorTestSuite;
    /**
     * 运行测试套件
     */
    private runTestSuite;
    /**
     * 提取 API
     */
    private extractAPI;
    /**
     * 查找废弃的 API
     */
    private findDeprecatedAPIs;
    /**
     * 运行基准测试
     */
    private runBenchmark;
    /**
     * 检查环境支持
     */
    private isEnvironmentSupported;
    /**
     * 在特定环境中测试
     */
    private testInEnvironment;
    /**
     * 生成快照
     */
    private generateSnapshot;
    /**
     * 比较快照
     */
    private compareSnapshots;
    /**
     * 安装依赖
     */
    private installDependencies;
    /**
     * 执行命令
     */
    private executeCommand;
    /**
     * 获取测试命令
     */
    private getTestCommand;
    /**
     * 解析测试结果
     */
    private parseTestResults;
    /**
     * 获取覆盖率
     */
    private getCoverage;
    /**
     * 判断整体成功
     */
    private determineOverallSuccess;
    /**
     * 收集错误
     */
    private collectErrors;
    /**
     * 收集警告
     */
    private collectWarnings;
    /**
     * 生成增强报告
     */
    private generateEnhancedReport;
    /**
     * 生成建议
     */
    private generateSuggestions;
    /**
     * 输出增强报告
     */
    private outputEnhancedReport;
    /**
     * 输出到控制台
     */
    private outputToConsole;
    /**
     * 输出到 JSON
     */
    private outputToJSON;
    /**
     * 输出到 HTML
     */
    private outputToHTML;
    /**
     * 生成 HTML 报告
     */
    private generateHTMLReport;
    /**
     * 清理增强环境
     */
    private cleanupEnhancedEnvironment;
    /**
     * 生成缓存键
     */
    private generateCacheKey;
    /**
     * 获取快照键
     */
    private getSnapshotKey;
    /**
     * 加载快照
     */
    private loadSnapshots;
    /**
     * 保存快照
     */
    private saveSnapshots;
    /**
     * 合并配置
     */
    private mergeConfig;
    /**
     * 设置配置
     */
    setConfig(config: PostBuildValidationConfig): void;
    getConfig(): PostBuildValidationConfig;
    /**
     * 销毁资源
     */
    dispose(): Promise<void>;
}
export {};
