/**
 * 默认配置常量
 */
import type { BuilderConfig } from '../types/config';
import type { LibraryBuildOptions } from '../types/library';
import { LibraryType } from '../types/library';
/**
 * 性能相关常量
 */
export declare const PERFORMANCE_CONSTANTS: {
    /** 默认文件大小限制 (500KB) */
    readonly DEFAULT_FILE_SIZE_LIMIT: number;
    /** 文件大小警告阈值比例 */
    readonly FILE_SIZE_WARNING_RATIO: 0.8;
    /** 默认内存阈值 (MB) */
    readonly DEFAULT_MEMORY_THRESHOLD: 500;
    /** 默认清理间隔 (ms) */
    readonly DEFAULT_CLEANUP_INTERVAL: 60000;
    /** 默认监控间隔 (ms) */
    readonly DEFAULT_MONITORING_INTERVAL: 10000;
    /** 最大并行任务数 */
    readonly MAX_PARALLEL_TASKS: 4;
    /** 缓存大小 (MB) */
    readonly DEFAULT_CACHE_SIZE: 100;
};
/**
 * 构建相关常量
 */
export declare const BUILD_CONSTANTS: {
    /** 默认构建超时时间 (ms) */
    readonly DEFAULT_BUILD_TIMEOUT: 300000;
    /** 默认测试超时时间 (ms) */
    readonly DEFAULT_TEST_TIMEOUT: 60000;
    /** 最大重试次数 */
    readonly MAX_RETRY_COUNT: 3;
    /** 重试延迟基数 (ms) */
    readonly RETRY_DELAY_BASE: 1000;
};
/**
 * 默认构建器配置
 */
export declare const DEFAULT_BUILDER_CONFIG: Omit<Required<Omit<BuilderConfig, 'env' | 'library' | 'libraryType'>>, never> & {
    env: Record<string, Partial<BuilderConfig>>;
    library: Required<LibraryBuildOptions>;
    libraryType: LibraryType;
};
/**
 * 预设配置
 */
export declare const PRESET_CONFIGS: {
    readonly typescript: {
        readonly libraryType: LibraryType.TYPESCRIPT;
        readonly typescript: {
            readonly declaration: true;
            readonly isolatedDeclarations: true;
        };
        readonly output: {
            readonly format: readonly ["esm", "cjs"];
        };
        readonly library: {
            readonly generateTypes: true;
            readonly formats: readonly ["esm", "cjs"];
        };
    };
    readonly vue3: {
        readonly libraryType: LibraryType.VUE3;
        readonly vue: {
            readonly version: 3;
            readonly onDemand: true;
        };
        readonly external: readonly ["vue"];
        readonly globals: {
            readonly vue: "Vue";
        };
        readonly library: {
            readonly formats: readonly ["esm", "cjs", "umd"];
        };
    };
    readonly vue2: {
        readonly libraryType: LibraryType.VUE2;
        readonly vue: {
            readonly version: 2;
            readonly onDemand: true;
        };
        readonly external: readonly ["vue"];
        readonly globals: {
            readonly vue: "Vue";
        };
        readonly library: {
            readonly formats: readonly ["esm", "cjs", "umd"];
        };
    };
    readonly style: {
        readonly libraryType: LibraryType.STYLE;
        readonly style: {
            readonly extract: true;
            readonly minimize: true;
        };
        readonly output: {
            readonly format: readonly ["esm"];
        };
        readonly library: {
            readonly formats: readonly ["esm"];
        };
    };
    readonly mixed: {
        readonly libraryType: LibraryType.MIXED;
        readonly typescript: {
            readonly declaration: true;
        };
        readonly style: {
            readonly extract: true;
        };
        readonly output: {
            readonly format: readonly ["esm", "cjs"];
        };
        readonly library: {
            readonly formats: readonly ["esm", "cjs"];
        };
    };
};
/**
 * 支持的配置文件名称
 */
export declare const CONFIG_FILE_NAMES: readonly [".ldesign/builder.config.ts", ".ldesign/builder.config.js", ".ldesign/builder.config.mjs", ".ldesign/builder.config.json", "ldesign.config.ts", "ldesign.config.js", "ldesign.config.mjs", "ldesign.config.json", "builder.config.ts", "builder.config.js", "builder.config.mjs", "builder.config.json", ".builderrc.ts", ".builderrc.js", ".builderrc.json"];
/**
 * 默认外部依赖
 */
export declare const DEFAULT_EXTERNAL_DEPS: readonly ["fs", "path", "url", "util", "events", "stream", "crypto", "os", "http", "https", "react", "react-dom", "vue", "@vue/runtime-core", "@vue/runtime-dom", "angular", "@angular/core", "@angular/common", "lodash", "moment", "dayjs", "axios"];
/**
 * 默认全局变量映射
 */
export declare const DEFAULT_GLOBALS: {
    readonly react: "React";
    readonly 'react-dom': "ReactDOM";
    readonly vue: "Vue";
    readonly lodash: "_";
    readonly moment: "moment";
    readonly dayjs: "dayjs";
    readonly axios: "axios";
};
/**
 * 默认文件名模式
 */
export declare const DEFAULT_FILE_PATTERNS: {
    readonly entry: "[name].[format].js";
    readonly chunk: "[name]-[hash].js";
    readonly asset: "[name]-[hash][extname]";
    readonly types: "[name].d.ts";
};
/**
 * 默认缓存配置
 */
export declare const DEFAULT_CACHE_CONFIG: {
    readonly enabled: true;
    readonly dir: "node_modules/.cache/@ldesign/builder";
    readonly ttl: number;
    readonly maxSize: number;
    readonly compress: true;
    readonly version: "1.0.0";
};
/**
 * 默认性能配置
 */
export declare const DEFAULT_PERFORMANCE_CONFIG: {
    readonly bundleAnalyzer: false;
    readonly sizeLimit: undefined;
    readonly treeshaking: true;
    readonly cache: true;
    readonly parallel: true;
    readonly memoryLimit: "2GB";
    readonly timeout: 300000;
    readonly monitoring: false;
};
/**
 * 默认监听配置
 */
export declare const DEFAULT_WATCH_CONFIG: {
    readonly include: readonly ["src/**/*"];
    readonly exclude: readonly ["node_modules/**/*", "dist/**/*", "**/*.test.*", "**/*.spec.*"];
    readonly persistent: true;
    readonly ignoreInitial: true;
    readonly followSymlinks: true;
    readonly usePolling: false;
    readonly interval: 100;
    readonly binaryInterval: 300;
    readonly alwaysStat: false;
    readonly depth: 99;
    readonly awaitWriteFinish: {
        readonly stabilityThreshold: 2000;
        readonly pollInterval: 100;
    };
};
