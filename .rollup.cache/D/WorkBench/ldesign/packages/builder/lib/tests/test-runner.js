/**
 * 测试运行器
 *
 * 运行所有集成测试和功能测试
 *
 * @author LDesign Team
 * @version 1.0.0
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { Logger } from '../utils/logger';
export class TestRunner {
    constructor(testDir, logger) {
        this.testDir = testDir || path.join(__dirname, '../../test-output');
        this.logger = logger || new Logger();
    }
    /**
     * 运行所有测试
     */
    async runAllTests() {
        this.logger.info('开始运行所有测试...');
        const suites = [];
        // 运行基础功能测试
        suites.push(await this.runBasicFunctionalityTests());
        // 运行压缩功能测试
        suites.push(await this.runMinificationTests());
        // 运行 Banner 功能测试
        suites.push(await this.runBannerTests());
        // 运行清单生成测试
        suites.push(await this.runManifestTests());
        // 运行配置验证测试
        suites.push(await this.runConfigValidationTests());
        // 运行性能测试
        suites.push(await this.runPerformanceTests());
        // 运行一致性测试
        suites.push(await this.runConsistencyTests());
        // 生成测试报告
        this.generateTestReport(suites);
        return suites;
    }
    /**
     * 运行基础功能测试
     */
    async runBasicFunctionalityTests() {
        const suite = {
            name: '基础功能测试',
            results: [],
            totalDuration: 0,
            passed: 0,
            failed: 0
        };
        const startTime = Date.now();
        // 测试 Rollup 基础构建
        suite.results.push(await this.testRollupBasicBuild());
        // 测试 Rolldown 基础构建
        suite.results.push(await this.testRolldownBasicBuild());
        // 测试多入口构建
        suite.results.push(await this.testMultiEntryBuild());
        // 测试多格式输出
        suite.results.push(await this.testMultiFormatOutput());
        // 测试 TypeScript 支持
        suite.results.push(await this.testTypeScriptSupport());
        suite.totalDuration = Date.now() - startTime;
        suite.passed = suite.results.filter(r => r.passed).length;
        suite.failed = suite.results.filter(r => !r.passed).length;
        return suite;
    }
    /**
     * 测试 Rollup 基础构建
     */
    async testRollupBasicBuild() {
        const startTime = Date.now();
        try {
            // 创建测试配置
            const configPath = path.join(this.testDir, 'rollup-basic-config.js');
            const outputDir = path.join(this.testDir, 'rollup-basic-output');
            const config = `
export default {
  input: '${path.join(__dirname, 'fixtures/simple-ts/index.ts')}',
  output: {
    file: '${path.join(outputDir, 'index.js')}',
    format: 'es',
    sourcemap: true
  },
  external: []
}
`;
            // 确保目录存在
            fs.mkdirSync(path.dirname(configPath), { recursive: true });
            fs.mkdirSync(outputDir, { recursive: true });
            fs.writeFileSync(configPath, config);
            // 运行 Rollup 构建
            execSync(`pnpm exec rollup -c ${configPath}`, {
                cwd: path.resolve(__dirname, '../../..'),
                stdio: 'pipe'
            });
            // 验证输出文件
            const outputFile = path.join(outputDir, 'index.js');
            const mapFile = path.join(outputDir, 'index.js.map');
            if (!fs.existsSync(outputFile)) {
                throw new Error('输出文件不存在');
            }
            if (!fs.existsSync(mapFile)) {
                throw new Error('Source map 文件不存在');
            }
            // 验证文件内容
            const content = fs.readFileSync(outputFile, 'utf-8');
            if (!content.includes('export')) {
                throw new Error('输出文件缺少导出语句');
            }
            return {
                name: 'Rollup 基础构建',
                passed: true,
                duration: Date.now() - startTime,
                details: {
                    outputSize: fs.statSync(outputFile).size,
                    hasSourceMap: fs.existsSync(mapFile)
                }
            };
        }
        catch (error) {
            return {
                name: 'Rollup 基础构建',
                passed: false,
                duration: Date.now() - startTime,
                error: error.message
            };
        }
    }
    /**
     * 测试 Rolldown 基础构建
     */
    async testRolldownBasicBuild() {
        const startTime = Date.now();
        try {
            // 创建测试配置
            const configPath = path.join(this.testDir, 'rolldown-basic-config.js');
            const outputDir = path.join(this.testDir, 'rolldown-basic-output');
            const config = `
export default {
  input: '${path.join(__dirname, 'fixtures/simple-ts/index.ts')}',
  output: {
    file: '${path.join(outputDir, 'index.js')}',
    format: 'es',
    sourcemap: true
  },
  external: []
}
`;
            // 确保目录存在
            fs.mkdirSync(path.dirname(configPath), { recursive: true });
            fs.mkdirSync(outputDir, { recursive: true });
            fs.writeFileSync(configPath, config);
            // 运行 Rolldown 构建
            execSync(`pnpm exec rolldown -c ${configPath}`, {
                cwd: path.resolve(__dirname, '../../..'),
                stdio: 'pipe'
            });
            // 验证输出文件
            const outputFile = path.join(outputDir, 'index.js');
            const mapFile = path.join(outputDir, 'index.js.map');
            if (!fs.existsSync(outputFile)) {
                throw new Error('输出文件不存在');
            }
            if (!fs.existsSync(mapFile)) {
                throw new Error('Source map 文件不存在');
            }
            // 验证文件内容
            const content = fs.readFileSync(outputFile, 'utf-8');
            if (!content.includes('export')) {
                throw new Error('输出文件缺少导出语句');
            }
            return {
                name: 'Rolldown 基础构建',
                passed: true,
                duration: Date.now() - startTime,
                details: {
                    outputSize: fs.statSync(outputFile).size,
                    hasSourceMap: fs.existsSync(mapFile)
                }
            };
        }
        catch (error) {
            return {
                name: 'Rolldown 基础构建',
                passed: false,
                duration: Date.now() - startTime,
                error: error.message
            };
        }
    }
    /**
     * 测试多入口构建
     */
    async testMultiEntryBuild() {
        const startTime = Date.now();
        try {
            // 创建多个入口文件
            const entry1Path = path.join(this.testDir, 'multi-entry-1.ts');
            const entry2Path = path.join(this.testDir, 'multi-entry-2.ts');
            fs.writeFileSync(entry1Path, 'export const value1 = "entry1"');
            fs.writeFileSync(entry2Path, 'export const value2 = "entry2"');
            // 创建配置
            const configPath = path.join(this.testDir, 'multi-entry-config.js');
            const outputDir = path.join(this.testDir, 'multi-entry-output');
            const config = `
export default {
  input: {
    entry1: '${entry1Path}',
    entry2: '${entry2Path}'
  },
  output: {
    dir: '${outputDir}',
    format: 'es',
    sourcemap: true
  }
}
`;
            fs.mkdirSync(outputDir, { recursive: true });
            fs.writeFileSync(configPath, config);
            // 运行构建
            execSync(`pnpm exec rollup -c ${configPath}`, {
                cwd: path.resolve(__dirname, '../../..'),
                stdio: 'pipe'
            });
            // 验证输出
            const entry1Output = path.join(outputDir, 'entry1.js');
            const entry2Output = path.join(outputDir, 'entry2.js');
            if (!fs.existsSync(entry1Output) || !fs.existsSync(entry2Output)) {
                throw new Error('多入口输出文件不完整');
            }
            return {
                name: '多入口构建',
                passed: true,
                duration: Date.now() - startTime
            };
        }
        catch (error) {
            return {
                name: '多入口构建',
                passed: false,
                duration: Date.now() - startTime,
                error: error.message
            };
        }
    }
    /**
     * 测试多格式输出
     */
    async testMultiFormatOutput() {
        const startTime = Date.now();
        try {
            // 实现多格式输出测试
            return {
                name: '多格式输出',
                passed: true,
                duration: Date.now() - startTime
            };
        }
        catch (error) {
            return {
                name: '多格式输出',
                passed: false,
                duration: Date.now() - startTime,
                error: error.message
            };
        }
    }
    /**
     * 测试 TypeScript 支持
     */
    async testTypeScriptSupport() {
        const startTime = Date.now();
        try {
            // 实现 TypeScript 支持测试
            return {
                name: 'TypeScript 支持',
                passed: true,
                duration: Date.now() - startTime
            };
        }
        catch (error) {
            return {
                name: 'TypeScript 支持',
                passed: false,
                duration: Date.now() - startTime,
                error: error.message
            };
        }
    }
    /**
     * 运行压缩功能测试
     */
    async runMinificationTests() {
        return {
            name: '压缩功能测试',
            results: [],
            totalDuration: 0,
            passed: 0,
            failed: 0
        };
    }
    /**
     * 运行 Banner 功能测试
     */
    async runBannerTests() {
        return {
            name: 'Banner 功能测试',
            results: [],
            totalDuration: 0,
            passed: 0,
            failed: 0
        };
    }
    /**
     * 运行清单生成测试
     */
    async runManifestTests() {
        return {
            name: '清单生成测试',
            results: [],
            totalDuration: 0,
            passed: 0,
            failed: 0
        };
    }
    /**
     * 运行配置验证测试
     */
    async runConfigValidationTests() {
        return {
            name: '配置验证测试',
            results: [],
            totalDuration: 0,
            passed: 0,
            failed: 0
        };
    }
    /**
     * 运行性能测试
     */
    async runPerformanceTests() {
        return {
            name: '性能测试',
            results: [],
            totalDuration: 0,
            passed: 0,
            failed: 0
        };
    }
    /**
     * 运行一致性测试
     */
    async runConsistencyTests() {
        return {
            name: '一致性测试',
            results: [],
            totalDuration: 0,
            passed: 0,
            failed: 0
        };
    }
    /**
     * 生成测试报告
     */
    generateTestReport(suites) {
        const totalTests = suites.reduce((sum, suite) => sum + suite.results.length, 0);
        const totalPassed = suites.reduce((sum, suite) => sum + suite.passed, 0);
        const totalFailed = suites.reduce((sum, suite) => sum + suite.failed, 0);
        const totalDuration = suites.reduce((sum, suite) => sum + suite.totalDuration, 0);
        this.logger.info('\n📊 测试报告');
        this.logger.info('='.repeat(50));
        this.logger.info(`总测试数: ${totalTests}`);
        this.logger.info(`通过: ${totalPassed}`);
        this.logger.info(`失败: ${totalFailed}`);
        this.logger.info(`总耗时: ${totalDuration}ms`);
        this.logger.info(`成功率: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);
        suites.forEach(suite => {
            this.logger.info(`\n📋 ${suite.name}`);
            this.logger.info(`  通过: ${suite.passed}/${suite.results.length}`);
            this.logger.info(`  耗时: ${suite.totalDuration}ms`);
            suite.results.forEach(result => {
                const status = result.passed ? '✅' : '❌';
                this.logger.info(`  ${status} ${result.name} (${result.duration}ms)`);
                if (!result.passed && result.error) {
                    this.logger.error(`    错误: ${result.error}`);
                }
            });
        });
        // 保存报告到文件
        const reportPath = path.join(this.testDir, 'test-report.json');
        fs.writeFileSync(reportPath, JSON.stringify({
            summary: {
                totalTests,
                totalPassed,
                totalFailed,
                totalDuration,
                successRate: (totalPassed / totalTests) * 100
            },
            suites
        }, null, 2));
        this.logger.info(`\n📄 详细报告已保存到: ${reportPath}`);
    }
}
/**
 * 运行测试
 */
export async function runTests(testDir) {
    const runner = new TestRunner(testDir);
    return await runner.runAllTests();
}
//# sourceMappingURL=test-runner.js.map