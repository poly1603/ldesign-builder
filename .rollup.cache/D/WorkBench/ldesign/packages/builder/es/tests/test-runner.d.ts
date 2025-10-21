/**
 * 测试运行器
 *
 * 运行所有集成测试和功能测试
 *
 * @author LDesign Team
 * @version 1.0.0
 */
import { Logger } from '../utils/logger';
export interface TestResult {
    /** 测试名称 */
    name: string;
    /** 是否通过 */
    passed: boolean;
    /** 执行时间（毫秒） */
    duration: number;
    /** 错误信息 */
    error?: string;
    /** 详细信息 */
    details?: any;
}
export interface TestSuite {
    /** 套件名称 */
    name: string;
    /** 测试结果 */
    results: TestResult[];
    /** 总执行时间 */
    totalDuration: number;
    /** 通过的测试数 */
    passed: number;
    /** 失败的测试数 */
    failed: number;
}
export declare class TestRunner {
    private logger;
    private testDir;
    constructor(testDir?: string, logger?: Logger);
    /**
     * 运行所有测试
     */
    runAllTests(): Promise<TestSuite[]>;
    /**
     * 运行基础功能测试
     */
    private runBasicFunctionalityTests;
    /**
     * 测试 Rollup 基础构建
     */
    private testRollupBasicBuild;
    /**
     * 测试 Rolldown 基础构建
     */
    private testRolldownBasicBuild;
    /**
     * 测试多入口构建
     */
    private testMultiEntryBuild;
    /**
     * 测试多格式输出
     */
    private testMultiFormatOutput;
    /**
     * 测试 TypeScript 支持
     */
    private testTypeScriptSupport;
    /**
     * 运行压缩功能测试
     */
    private runMinificationTests;
    /**
     * 运行 Banner 功能测试
     */
    private runBannerTests;
    /**
     * 运行清单生成测试
     */
    private runManifestTests;
    /**
     * 运行配置验证测试
     */
    private runConfigValidationTests;
    /**
     * 运行性能测试
     */
    private runPerformanceTests;
    /**
     * 运行一致性测试
     */
    private runConsistencyTests;
    /**
     * 生成测试报告
     */
    private generateTestReport;
}
/**
 * 运行测试
 */
export declare function runTests(testDir?: string): Promise<TestSuite[]>;
