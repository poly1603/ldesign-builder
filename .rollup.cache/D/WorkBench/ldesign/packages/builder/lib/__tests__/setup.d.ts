/**
 * 测试环境设置
 */
export declare const TEST_CONFIG: {
    timeout: number;
    tempDirPrefix: string;
    mockBundlers: boolean;
    enableCoverage: boolean;
};
declare global {
    var __TEST_TEMP_DIR__: string;
    var __TEST_CLEANUP_FUNCTIONS__: Array<() => Promise<void>>;
}
/**
 * 测试工具函数
 */
/**
 * 创建临时测试目录
 */
export declare function createTempDir(prefix?: string): Promise<string>;
/**
 * 创建测试项目结构
 */
export declare function createTestProject(dir: string, type?: 'typescript' | 'vue3' | 'style'): Promise<void>;
/**
 * 等待指定时间
 */
export declare function wait(ms: number): Promise<void>;
/**
 * 模拟构建器适配器
 */
export declare function createMockAdapter(name?: 'rollup' | 'rolldown'): {
    name: "rollup" | "rolldown";
    version: string;
    available: boolean;
    build: () => Promise<{
        success: boolean;
        outputs: {
            fileName: string;
            size: number;
            source: string;
            type: "chunk";
            format: "esm";
        }[];
        duration: number;
        stats: {
            buildTime: number;
            fileCount: number;
            totalSize: {
                raw: number;
                gzip: number;
                brotli: number;
                byType: {};
                byFormat: {
                    esm: number;
                    cjs: number;
                    umd: number;
                    iife: number;
                };
                largest: {
                    file: string;
                    size: number;
                };
                fileCount: number;
            };
            byFormat: {
                esm: {
                    fileCount: number;
                    size: {
                        raw: number;
                        gzip: number;
                        brotli: number;
                        byType: {};
                        byFormat: {
                            esm: number;
                            cjs: number;
                            umd: number;
                            iife: number;
                        };
                        largest: {
                            file: string;
                            size: number;
                        };
                        fileCount: number;
                    };
                };
                cjs: {
                    fileCount: number;
                    size: {
                        raw: number;
                        gzip: number;
                        brotli: number;
                        byType: {};
                        byFormat: {
                            esm: number;
                            cjs: number;
                            umd: number;
                            iife: number;
                        };
                        largest: {
                            file: string;
                            size: number;
                        };
                        fileCount: number;
                    };
                };
                umd: {
                    fileCount: number;
                    size: {
                        raw: number;
                        gzip: number;
                        brotli: number;
                        byType: {};
                        byFormat: {
                            esm: number;
                            cjs: number;
                            umd: number;
                            iife: number;
                        };
                        largest: {
                            file: string;
                            size: number;
                        };
                        fileCount: number;
                    };
                };
                iife: {
                    fileCount: number;
                    size: {
                        raw: number;
                        gzip: number;
                        brotli: number;
                        byType: {};
                        byFormat: {
                            esm: number;
                            cjs: number;
                            umd: number;
                            iife: number;
                        };
                        largest: {
                            file: string;
                            size: number;
                        };
                        fileCount: number;
                    };
                };
            };
            modules: {
                total: number;
                external: number;
                internal: number;
                largest: {
                    id: string;
                    size: number;
                    renderedLength: number;
                    originalLength: number;
                    isEntry: boolean;
                    isExternal: boolean;
                    importedIds: never[];
                    dynamicallyImportedIds: never[];
                    importers: never[];
                    dynamicImporters: never[];
                };
            };
            dependencies: {
                total: number;
                external: never[];
                bundled: never[];
                circular: never[];
            };
        };
    }>;
    watch: () => Promise<{
        patterns: string[];
        watching: boolean;
        close: () => Promise<void>;
        on: () => void;
        off: () => void;
        emit: () => boolean;
    }>;
    getPerformanceMetrics: () => Promise<{
        buildTime: number;
        bundleSize: number;
        memoryUsage: {
            heapUsed: number;
            heapTotal: number;
            external: number;
            arrayBuffers: number;
        };
        cpuUsage: number;
    }>;
    dispose: () => Promise<void>;
};
/**
 * 断言工具
 */
export declare const assertions: {
    /**
     * 断言文件存在
     */
    fileExists(filePath: string): Promise<void>;
    /**
     * 断言目录存在
     */
    directoryExists(dirPath: string): Promise<void>;
    /**
     * 断言文件内容包含指定文本
     */
    fileContains(filePath: string, content: string): Promise<void>;
};
