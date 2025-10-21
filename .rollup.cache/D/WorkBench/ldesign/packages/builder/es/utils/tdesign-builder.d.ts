/**
 * TDesign 风格的构建工具函数
 *
 * 提供便捷的 TDesign 风格构建函数
 *
 * @author LDesign Team
 * @version 1.0.0
 */
import type { BuilderConfig, MultiFormatBuildConfig, CSSBuildStrategy } from '../types/config';
/**
 * 创建 TDesign 风格的构建配置
 */
export declare function createTDesignConfig(options: {
    /** 入口文件 */
    input?: string | string[] | Record<string, string>;
    /** 输出目录 */
    outDir?: string;
    /** 库名称（用于 UMD 构建） */
    name?: string;
    /** 是否启用多格式构建 */
    multiFormat?: boolean | MultiFormatBuildConfig;
    /** CSS 处理策略 */
    cssStrategy?: CSSBuildStrategy;
    /** 外部依赖 */
    external?: string[];
    /** 全局变量映射 */
    globals?: Record<string, string>;
    /** 是否生成 sourcemap */
    sourcemap?: boolean;
    /** 是否压缩代码 */
    minify?: boolean;
}): BuilderConfig;
/**
 * 构建 ES 模块（支持 tree-shaking）
 */
export declare function buildEs(config?: Partial<BuilderConfig>): Promise<void>;
/**
 * 构建 ESM 模块（保留源码样式引用）
 */
export declare function buildEsm(config?: Partial<BuilderConfig>): Promise<void>;
/**
 * 构建 Lib 格式
 */
export declare function buildLib(config?: Partial<BuilderConfig>): Promise<void>;
/**
 * 构建 CJS 格式
 */
export declare function buildCjs(config?: Partial<BuilderConfig>): Promise<void>;
/**
 * 构建 UMD 格式
 */
export declare function buildUmd(config?: Partial<BuilderConfig>, isMin?: boolean): Promise<void>;
/**
 * 构建所有格式（TDesign 风格）
 */
export declare function buildComponents(config?: Partial<BuilderConfig>): Promise<void>;
/**
 * 删除输出目录
 */
export declare function deleteOutput(): Promise<void>;
/**
 * 构建重置样式 CSS
 */
export declare function buildResetCss(config?: Partial<BuilderConfig>): Promise<void>;
/**
 * 构建插件样式 CSS
 */
export declare function buildPluginCss(config?: Partial<BuilderConfig>): Promise<void>;
/**
 * 完整的 TDesign 风格构建流程
 */
export declare function buildAll(config?: Partial<BuilderConfig>): Promise<void>;
