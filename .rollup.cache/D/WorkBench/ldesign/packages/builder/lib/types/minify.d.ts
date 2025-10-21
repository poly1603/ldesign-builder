/**
 * 压缩配置类型定义
 *
 * @author LDesign Team
 * @version 1.0.0
 */
/**
 * 压缩级别
 */
export type MinifyLevel = 'none' | 'whitespace' | 'basic' | 'advanced';
/**
 * 压缩选项
 */
export interface MinifyOptions {
    /** 压缩级别 */
    level?: MinifyLevel;
    /** 是否压缩 JavaScript */
    js?: boolean | JSMinifyOptions;
    /** 是否压缩 CSS */
    css?: boolean | CSSMinifyOptions;
    /** 是否压缩 HTML */
    html?: boolean | HTMLMinifyOptions;
    /** 是否保留注释 */
    comments?: boolean | 'some' | RegExp;
    /** 是否保留许可证注释 */
    legal?: boolean;
    /** 是否生成 source map */
    sourcemap?: boolean;
    /** 自定义压缩器 */
    customMinifier?: {
        js?: (code: string, options?: any) => string | Promise<string>;
        css?: (code: string, options?: any) => string | Promise<string>;
    };
}
/**
 * JavaScript 压缩选项
 */
export interface JSMinifyOptions {
    /** 压缩器类型 */
    minifier?: 'terser' | 'esbuild' | 'swc';
    /** 是否混淆变量名 */
    mangle?: boolean | {
        /** 保留的变量名 */
        reserved?: string[];
        /** 是否混淆属性名 */
        properties?: boolean;
    };
    /** 是否压缩代码 */
    compress?: boolean | {
        /** 是否移除 console */
        drop_console?: boolean;
        /** 是否移除 debugger */
        drop_debugger?: boolean;
        /** 是否移除未使用的代码 */
        dead_code?: boolean;
        /** 是否内联函数 */
        inline?: boolean;
    };
    /** 输出格式选项 */
    format?: {
        /** 是否保留注释 */
        comments?: boolean | 'some' | RegExp;
        /** 是否美化输出 */
        beautify?: boolean;
        /** 缩进大小 */
        indent_size?: number;
    };
    /** 是否保留函数名 */
    keep_fnames?: boolean;
    /** 是否保留类名 */
    keep_classnames?: boolean;
    /** 目标环境 */
    target?: string | string[];
}
/**
 * CSS 压缩选项
 */
export interface CSSMinifyOptions {
    /** 压缩器类型 */
    minifier?: 'cssnano' | 'clean-css' | 'lightningcss';
    /** 是否移除未使用的 CSS */
    removeUnused?: boolean;
    /** 是否合并相同的规则 */
    mergeRules?: boolean;
    /** 是否压缩颜色值 */
    colormin?: boolean;
    /** 是否压缩字体 */
    minifyFontValues?: boolean;
    /** 是否压缩选择器 */
    minifySelectors?: boolean;
    /** 是否移除注释 */
    discardComments?: boolean;
    /** 是否移除空规则 */
    discardEmpty?: boolean;
    /** 浏览器兼容性 */
    browsers?: string | string[];
}
/**
 * HTML 压缩选项
 */
export interface HTMLMinifyOptions {
    /** 是否移除注释 */
    removeComments?: boolean;
    /** 是否移除空白符 */
    collapseWhitespace?: boolean;
    /** 是否移除空属性 */
    removeEmptyAttributes?: boolean;
    /** 是否移除冗余属性 */
    removeRedundantAttributes?: boolean;
    /** 是否压缩内联 CSS */
    minifyCSS?: boolean;
    /** 是否压缩内联 JS */
    minifyJS?: boolean;
}
/**
 * 预设压缩配置
 */
export declare const MINIFY_PRESETS: Record<MinifyLevel, MinifyOptions>;
/**
 * 获取压缩配置
 */
export declare function getMinifyConfig(options: boolean | MinifyLevel | MinifyOptions): MinifyOptions;
/**
 * 合并压缩配置
 */
export declare function mergeMinifyConfig(base: MinifyOptions, override: Partial<MinifyOptions>): MinifyOptions;
