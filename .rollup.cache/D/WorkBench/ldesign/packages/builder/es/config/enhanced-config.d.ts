/**
 * 增强的配置定义
 *
 * 提供更强大的配置定义和验证功能
 *
 * @author LDesign Team
 * @version 1.0.0
 */
import type { BuilderConfig } from '../types/config';
import type { MinifyLevel } from '../types/minify';
import type { OutputFormat } from '../types/adapter';
import { type ValidationResult } from '../core/ConfigValidator';
/**
 * 增强的配置选项
 */
export interface EnhancedConfigOptions extends Partial<BuilderConfig> {
    /** 配置验证选项 */
    validation?: {
        /** 是否启用验证 */
        enabled?: boolean;
        /** 是否严格模式 */
        strict?: boolean;
        /** 是否检查文件存在性 */
        checkFiles?: boolean;
        /** 验证失败时是否抛出错误 */
        throwOnError?: boolean;
    };
    /** 构建清单选项 */
    manifest?: {
        /** 是否生成构建清单 */
        enabled?: boolean;
        /** 清单格式 */
        formats?: ('json' | 'markdown' | 'html')[];
        /** 清单输出路径 */
        outputPath?: string;
    };
    /** Banner 閫夐」 */
    bannerOptions?: {
        /** 鏄惁鍚敤 banner */
        enabled?: boolean;
        /** Banner 鏍峰紡 */
        style?: 'default' | 'compact' | 'detailed';
        /** 鑷畾涔変俊鎭?*/
        customInfo?: Record<string, string>;
    };
    /** 文件命名规则 */
    naming?: {
        /** 输出文件名模板 */
        template?: string;
        /** 是否包含哈希 */
        hash?: boolean;
        /** 哈希长度 */
        hashLength?: number;
    };
    /** 高级输出选项 */
    advancedOutput?: {
        /** 是否分离 vendor */
        splitVendor?: boolean;
        /** vendor 包含的模块 */
        vendorModules?: string[];
        /** 是否生成 polyfill */
        polyfill?: boolean;
        /** 目标浏览器 */
        targets?: string | string[];
    };
    /** 开发服务器选项 */
    devServer?: {
        /** 端口号 */
        port?: number;
        /** 主机名 */
        host?: string;
        /** 是否自动打开浏览器 */
        open?: boolean;
        /** 热重载 */
        hmr?: boolean;
    };
    /** 构建钩子 */
    hooks?: {
        /** 构建前钩子 */
        beforeBuild?: (config: BuilderConfig) => void | Promise<void>;
        /** 构建后钩子 */
        afterBuild?: (result: any) => void | Promise<void>;
        /** 错误处理钩子 */
        onError?: (error: Error) => void | Promise<void>;
    };
}
/**
 * 预设配置
 */
export declare const CONFIG_PRESETS: {
    /** 库开发预设 */
    library: {
        output: {
            format: OutputFormat[];
            sourcemap: boolean;
        };
        minify: boolean;
        performance: {
            treeshaking: boolean;
            bundleAnalyzer: boolean;
        };
        clean: boolean;
    };
    /** 应用开发预设 */
    application: {
        output: {
            format: OutputFormat;
            sourcemap: boolean;
        };
        minify: boolean;
        performance: {
            treeshaking: boolean;
            bundleAnalyzer: boolean;
        };
        clean: boolean;
        advancedOutput: {
            splitVendor: boolean;
            polyfill: boolean;
        };
    };
    /** 组件库预设 */
    components: {
        output: {
            format: OutputFormat[];
            sourcemap: boolean;
        };
        minify: {
            level: MinifyLevel;
            js: boolean;
            css: boolean;
        };
        performance: {
            treeshaking: boolean;
            bundleAnalyzer: boolean;
        };
        clean: boolean;
    };
    /** 工具库预设 */
    utils: {
        output: {
            format: OutputFormat[];
            sourcemap: boolean;
        };
        minify: {
            level: MinifyLevel;
        };
        performance: {
            treeshaking: boolean;
            bundleAnalyzer: boolean;
        };
        clean: boolean;
    };
};
/**
 * 增强的配置定义函数
 */
export declare function defineEnhancedConfig(options: EnhancedConfigOptions): BuilderConfig;
/**
 * 创建配置模板
 */
export declare function createConfigTemplate(type: keyof typeof CONFIG_PRESETS): string;
/**
 * 验证配置文件
 */
export declare function validateConfigFile(configPath: string): ValidationResult;
/**
 * 生成配置文档
 */
export declare function generateConfigDocs(): string;
