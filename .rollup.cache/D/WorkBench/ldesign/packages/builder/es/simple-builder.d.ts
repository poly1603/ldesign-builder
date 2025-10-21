/**
 * 简化版构建器 - 参考 TDesign 的构建思路
 *
 * 专门用于构建 TypeScript 库和 Vue 组件库
 * 支持多种构建格式和样式处理策略
 *
 * @author LDesign Team
 * @version 1.0.0
 */
/**
 * 构建配置接口
 */
export interface BuildConfig {
    /** 项目名称 */
    name: string;
    /** 版本号 */
    version: string;
    /** 作者 */
    author?: string;
    /** 许可证 */
    license?: string;
    /** 入口文件 */
    input?: string | string[];
    /** 输出目录 */
    outDir?: string;
    /** 外部依赖 */
    external?: string[];
    /** 全局变量映射 */
    globals?: Record<string, string>;
    /** 是否为 Vue 组件库 */
    isVueLibrary?: boolean;
    /** 组件根目录 */
    componentsRoot?: string;
}
/**
 * CSS 构建策略
 */
export type CSSBuildType = 'single' | 'multi' | 'source' | 'ignore';
/**
 * 构建 ES 模块（支持 tree-shaking）
 */
export declare const buildEs: (config: BuildConfig) => Promise<void>;
/**
 * 构建 ESM 模块（保留源码样式引用）
 */
export declare const buildEsm: (config: BuildConfig) => Promise<void>;
/**
 * 构建 Lib 格式
 */
export declare const buildLib: (config: BuildConfig) => Promise<void>;
/**
 * 构建 CJS 格式
 */
export declare const buildCjs: (config: BuildConfig) => Promise<void>;
/**
 * 构建 UMD 格式
 */
export declare const buildUmd: (config: BuildConfig, isMin?: boolean) => Promise<void>;
/**
 * 构建重置样式 CSS
 */
export declare const buildResetCss: (config: BuildConfig) => Promise<void>;
/**
 * 构建插件样式 CSS
 */
export declare const buildPluginCss: (config: BuildConfig) => Promise<void>;
/**
 * 删除输出目录
 */
export declare const deleteOutput: (config: BuildConfig) => Promise<void>;
/**
 * 构建所有格式（TDesign 风格）
 */
export declare const buildComponents: (config: BuildConfig) => Promise<void>;
