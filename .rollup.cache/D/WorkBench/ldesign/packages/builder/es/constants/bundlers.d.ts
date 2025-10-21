/**
 * 打包器相关常量
 */
import type { BundlerType } from '../types/bundler';
import { BundlerFeature } from '../types/bundler';
/**
 * 支持的打包器列表
 */
export declare const SUPPORTED_BUNDLERS: BundlerType[];
/**
 * 默认打包器
 */
export declare const DEFAULT_BUNDLER: BundlerType;
/**
 * 打包器信息
 */
export declare const BUNDLER_INFO: {
    readonly rollup: {
        readonly name: "Rollup";
        readonly description: "成熟稳定的 JavaScript 模块打包器，专注于 ES 模块";
        readonly homepage: "https://rollupjs.org";
        readonly repository: "https://github.com/rollup/rollup";
        readonly minNodeVersion: "14.18.0";
        readonly stableVersion: "^4.0.0";
        readonly features: readonly [BundlerFeature.TREE_SHAKING, BundlerFeature.CODE_SPLITTING, BundlerFeature.DYNAMIC_IMPORT, BundlerFeature.SOURCEMAP, BundlerFeature.PLUGIN_SYSTEM, BundlerFeature.CONFIG_FILE, BundlerFeature.CACHE_SUPPORT];
    };
    readonly rolldown: {
        readonly name: "Rolldown";
        readonly description: "基于 Rust 的高性能 JavaScript 打包器，兼容 Rollup API";
        readonly homepage: "https://rolldown.rs";
        readonly repository: "https://github.com/rolldown/rolldown";
        readonly minNodeVersion: "16.0.0";
        readonly stableVersion: "^0.1.0";
        readonly features: readonly [BundlerFeature.TREE_SHAKING, BundlerFeature.CODE_SPLITTING, BundlerFeature.DYNAMIC_IMPORT, BundlerFeature.SOURCEMAP, BundlerFeature.MINIFICATION, BundlerFeature.PLUGIN_SYSTEM, BundlerFeature.CONFIG_FILE, BundlerFeature.CACHE_SUPPORT, BundlerFeature.PARALLEL_BUILD, BundlerFeature.INCREMENTAL_BUILD];
    };
};
/**
 * 打包器性能特征
 */
export declare const BUNDLER_PERFORMANCE: {
    readonly rollup: {
        readonly buildSpeed: "medium";
        readonly memoryUsage: "medium";
        readonly startupTime: "fast";
        readonly incrementalBuild: "fair";
        readonly largeProjectSupport: "good";
        readonly parallelProcessing: "poor";
    };
    readonly rolldown: {
        readonly buildSpeed: "very-fast";
        readonly memoryUsage: "low";
        readonly startupTime: "fast";
        readonly incrementalBuild: "excellent";
        readonly largeProjectSupport: "excellent";
        readonly parallelProcessing: "excellent";
    };
};
/**
 * 打包器兼容性
 */
export declare const BUNDLER_COMPATIBILITY: {
    readonly rollup: {
        readonly nodeVersion: ">=14.18.0";
        readonly platforms: readonly ["win32", "darwin", "linux"];
        readonly architectures: readonly ["x64", "arm64"];
        readonly pluginCompatibility: {
            readonly rollup: "full";
            readonly webpack: "none";
            readonly vite: "partial";
        };
        readonly configCompatibility: {
            readonly rollup: true;
            readonly webpack: false;
            readonly vite: true;
        };
    };
    readonly rolldown: {
        readonly nodeVersion: ">=16.0.0";
        readonly platforms: readonly ["win32", "darwin", "linux"];
        readonly architectures: readonly ["x64", "arm64"];
        readonly pluginCompatibility: {
            readonly rollup: "partial";
            readonly webpack: "none";
            readonly vite: "partial";
        };
        readonly configCompatibility: {
            readonly rollup: true;
            readonly webpack: false;
            readonly vite: false;
        };
    };
};
/**
 * 打包器推荐使用场景
 */
export declare const BUNDLER_USE_CASES: {
    readonly rollup: readonly ["成熟的库项目", "需要稳定性的生产环境", "复杂的插件需求", "对构建速度要求不高的项目", "需要丰富插件生态的项目"];
    readonly rolldown: readonly ["大型项目", "对构建速度有高要求的项目", "需要增量构建的项目", "内存敏感的环境", "现代化的新项目"];
};
/**
 * 打包器优缺点
 */
export declare const BUNDLER_PROS_CONS: {
    readonly rollup: {
        readonly pros: readonly ["成熟稳定，生产环境验证", "丰富的插件生态系统", "优秀的 Tree Shaking 支持", "良好的文档和社区支持", "配置简单直观"];
        readonly cons: readonly ["构建速度相对较慢", "大型项目性能有限", "内存使用较高", "缺乏内置的并行处理"];
    };
    readonly rolldown: {
        readonly pros: readonly ["极快的构建速度", "低内存使用", "优秀的增量构建", "内置并行处理", "兼容 Rollup API"];
        readonly cons: readonly ["相对较新，生态系统有限", "插件兼容性不完整", "文档和社区支持有限", "可能存在稳定性问题"];
    };
};
/**
 * 打包器选择建议
 */
export declare const BUNDLER_SELECTION_CRITERIA: {
    readonly projectSize: {
        readonly small: "rollup";
        readonly medium: "rollup";
        readonly large: "rolldown";
        readonly enterprise: "rolldown";
    };
    readonly buildSpeed: {
        readonly low: "rollup";
        readonly medium: "rollup";
        readonly high: "rolldown";
        readonly critical: "rolldown";
    };
    readonly stability: {
        readonly low: "rolldown";
        readonly medium: "rollup";
        readonly high: "rollup";
        readonly critical: "rollup";
    };
    readonly pluginNeeds: {
        readonly minimal: "rolldown";
        readonly moderate: "rollup";
        readonly extensive: "rollup";
        readonly custom: "rollup";
    };
};
/**
 * 打包器迁移难度
 */
export declare const MIGRATION_DIFFICULTY: {
    readonly 'rollup-to-rolldown': "easy";
    readonly 'rolldown-to-rollup': "easy";
};
/**
 * 打包器配置映射
 */
export declare const CONFIG_MAPPING: {
    readonly 'rollup-to-rolldown': {
        readonly input: "input";
        readonly output: "output";
        readonly external: "external";
        readonly plugins: "plugins";
        readonly treeshake: "treeshake";
        readonly platform: "browser";
    };
    readonly 'rolldown-to-rollup': {
        readonly input: "input";
        readonly output: "output";
        readonly external: "external";
        readonly plugins: "plugins";
        readonly treeshake: "treeshake";
    };
};
/**
 * 打包器检测命令
 */
export declare const BUNDLER_DETECTION_COMMANDS: {
    readonly rollup: {
        readonly check: "rollup --version";
        readonly install: "npm install rollup --save-dev";
    };
    readonly rolldown: {
        readonly check: "rolldown --version";
        readonly install: "npm install rolldown --save-dev";
    };
};
/**
 * 打包器默认配置
 */
export declare const BUNDLER_DEFAULT_CONFIG: {
    readonly rollup: {
        readonly treeshake: true;
        readonly output: {
            readonly format: "esm";
            readonly sourcemap: true;
        };
    };
    readonly rolldown: {
        readonly treeshake: true;
        readonly platform: "browser";
        readonly output: {
            readonly format: "esm";
            readonly sourcemap: true;
        };
    };
};
/**
 * 打包器错误处理
 */
export declare const BUNDLER_ERROR_PATTERNS: {
    readonly rollup: {
        readonly notFound: RegExp;
        readonly versionMismatch: RegExp;
        readonly configError: RegExp;
        readonly buildError: RegExp;
    };
    readonly rolldown: {
        readonly notFound: RegExp;
        readonly versionMismatch: RegExp;
        readonly configError: RegExp;
        readonly buildError: RegExp;
    };
};
/**
 * 打包器性能基准
 */
export declare const PERFORMANCE_BENCHMARKS: {
    readonly small: {
        readonly rollup: {
            readonly buildTime: "2-5s";
            readonly memoryUsage: "100-200MB";
        };
        readonly rolldown: {
            readonly buildTime: "0.5-1s";
            readonly memoryUsage: "50-100MB";
        };
    };
    readonly medium: {
        readonly rollup: {
            readonly buildTime: "10-30s";
            readonly memoryUsage: "300-500MB";
        };
        readonly rolldown: {
            readonly buildTime: "2-5s";
            readonly memoryUsage: "100-200MB";
        };
    };
    readonly large: {
        readonly rollup: {
            readonly buildTime: "60-180s";
            readonly memoryUsage: "500MB-1GB";
        };
        readonly rolldown: {
            readonly buildTime: "5-15s";
            readonly memoryUsage: "200-400MB";
        };
    };
};
