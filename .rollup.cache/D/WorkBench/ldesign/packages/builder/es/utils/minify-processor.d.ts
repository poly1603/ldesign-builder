/**
 * 压缩处理器
 *
 * 提供统一的代码压缩功能
 *
 * @author LDesign Team
 * @version 1.0.0
 */
import type { MinifyOptions, CSSMinifyOptions } from '../types/minify';
import { Logger } from './logger';
export declare class MinifyProcessor {
    private logger;
    constructor(logger?: Logger);
    /**
     * 创建 Rollup 压缩插件
     */
    createRollupMinifyPlugin(options: boolean | MinifyOptions): any[];
    /**
     * 创建 Rolldown 压缩配置
     */
    createRolldownMinifyConfig(options: boolean | MinifyOptions): any;
    /**
     * 解析压缩配置
     */
    private resolveMinifyConfig;
    /**
     * 创建 Terser 选项
     */
    private createTerserOptions;
    /**
     * 创建 CSS 压缩插件
     */
    createCSSMinifyPlugin(options: boolean | CSSMinifyOptions): any | null;
    /**
     * 获取压缩统计信息
     */
    getCompressionStats(originalSize: number, compressedSize: number): {
        originalSize: number;
        compressedSize: number;
        savedBytes: number;
        compressionRatio: number;
        formattedRatio: string;
        formattedOriginalSize: string;
        formattedCompressedSize: string;
        formattedSavedBytes: string;
    };
    /**
     * 格式化字节大小
     */
    private formatBytes;
}
/**
 * 创建压缩处理器实例
 */
export declare function createMinifyProcessor(logger?: Logger): MinifyProcessor;
/**
 * 获取默认压缩配置
 */
export declare function getDefaultMinifyConfig(): MinifyOptions;
/**
 * 检查是否需要压缩
 */
export declare function shouldMinify(config: any): boolean;
