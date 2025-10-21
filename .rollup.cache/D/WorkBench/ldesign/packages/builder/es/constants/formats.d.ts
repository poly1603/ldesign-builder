/**
 * 输出格式相关常量
 */
import type { OutputFormat } from '../types/output';
/**
 * 支持的输出格式
 */
export declare const OUTPUT_FORMATS: OutputFormat[];
/**
 * 格式别名映射
 */
export declare const FORMAT_ALIASES: Record<string, OutputFormat>;
/**
 * 格式描述
 */
export declare const FORMAT_DESCRIPTIONS: Record<OutputFormat, string>;
/**
 * 格式文件扩展名
 */
export declare const FORMAT_EXTENSIONS: Record<OutputFormat, string>;
/**
 * 格式默认文件名模式
 */
export declare const FORMAT_FILE_PATTERNS: Record<OutputFormat, string>;
/**
 * 格式兼容性
 */
export declare const FORMAT_COMPATIBILITY: Record<OutputFormat, {
    browser: boolean;
    node: boolean;
    requiresGlobals: boolean;
    supportsTreeShaking: boolean;
    supportsCodeSplitting: boolean;
}>;
/**
 * 格式推荐用途
 */
export declare const FORMAT_USE_CASES: Record<OutputFormat, string[]>;
/**
 * 格式优先级（用于自动选择）
 */
export declare const FORMAT_PRIORITY: Record<OutputFormat, number>;
/**
 * 格式组合建议
 */
export declare const FORMAT_COMBINATIONS: {
    modern: OutputFormat[];
    universal: OutputFormat[];
    browser: OutputFormat[];
    node: OutputFormat[];
    minimal: OutputFormat[];
    complete: OutputFormat[];
};
/**
 * 根据库类型推荐的格式
 */
export declare const LIBRARY_TYPE_FORMATS: {
    readonly typescript: readonly ["esm", "cjs"];
    readonly style: readonly ["esm"];
    readonly vue2: readonly ["esm", "cjs", "umd"];
    readonly vue3: readonly ["esm", "cjs", "umd"];
    readonly mixed: readonly ["esm", "cjs"];
};
/**
 * 格式特定的配置选项
 */
export declare const FORMAT_SPECIFIC_OPTIONS: {
    readonly esm: {
        readonly exports: "named";
        readonly interop: "auto";
        readonly strict: true;
    };
    readonly cjs: {
        readonly exports: "auto";
        readonly interop: "auto";
        readonly strict: false;
    };
    readonly umd: {
        readonly exports: "auto";
        readonly interop: "auto";
        readonly strict: false;
        readonly requiresName: true;
    };
    readonly iife: {
        readonly exports: "none";
        readonly interop: false;
        readonly strict: false;
        readonly requiresName: true;
    };
};
/**
 * 格式验证规则
 */
export declare const FORMAT_VALIDATION_RULES: {
    readonly esm: {
        readonly allowedExports: readonly ["named", "default"];
        readonly requiresModernNode: true;
        readonly supportsTopLevelAwait: true;
    };
    readonly cjs: {
        readonly allowedExports: readonly ["auto", "default", "named"];
        readonly requiresModernNode: false;
        readonly supportsTopLevelAwait: false;
    };
    readonly umd: {
        readonly allowedExports: readonly ["auto", "default"];
        readonly requiresGlobalName: true;
        readonly requiresGlobalsMapping: true;
    };
    readonly iife: {
        readonly allowedExports: readonly ["none"];
        readonly requiresGlobalName: true;
        readonly requiresGlobalsMapping: true;
    };
};
/**
 * 格式性能特征
 */
export declare const FORMAT_PERFORMANCE: {
    readonly esm: {
        readonly bundleSize: "small";
        readonly loadTime: "fast";
        readonly treeShaking: "excellent";
        readonly caching: "excellent";
    };
    readonly cjs: {
        readonly bundleSize: "medium";
        readonly loadTime: "medium";
        readonly treeShaking: "none";
        readonly caching: "good";
    };
    readonly umd: {
        readonly bundleSize: "large";
        readonly loadTime: "slow";
        readonly treeShaking: "none";
        readonly caching: "fair";
    };
    readonly iife: {
        readonly bundleSize: "large";
        readonly loadTime: "slow";
        readonly treeShaking: "none";
        readonly caching: "poor";
    };
};
