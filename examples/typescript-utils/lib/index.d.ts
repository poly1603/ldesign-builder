/**
 * @ldesign/typescript-utils-example
 *
 * TypeScript 工具库示例
 * 展示如何使用 @ldesign/builder 打包 TypeScript 工具库
 *
 * @author LDesign Team
 * @version 1.0.0
 */
export * as math from './math';
export * from './math';
export * as string from './string';
export * from './string';
export * as date from './date';
export * from './date';
/**
 * 工具库版本信息
 */
export declare const VERSION = "1.0.0";
/**
 * 工具库信息
 */
export declare const LIBRARY_INFO: {
    readonly name: "@ldesign/typescript-utils-example";
    readonly version: "1.0.0";
    readonly description: "TypeScript 工具库示例 - 展示如何使用 @ldesign/builder 打包 TypeScript 工具库";
    readonly author: "LDesign Team";
    readonly license: "MIT";
    readonly repository: "https://github.com/ldesign/ldesign";
    readonly homepage: "https://ldesign.dev";
};
/**
 * 获取库信息
 * @returns 库信息对象
 * @example
 * ```typescript
 * import { getLibraryInfo } from '@ldesign/typescript-utils-example'
 *
 * const info = getLibraryInfo()
 * console.log(info.name) // '@ldesign/typescript-utils-example'
 * ```
 */
export declare function getLibraryInfo(): {
    readonly name: "@ldesign/typescript-utils-example";
    readonly version: "1.0.0";
    readonly description: "TypeScript 工具库示例 - 展示如何使用 @ldesign/builder 打包 TypeScript 工具库";
    readonly author: "LDesign Team";
    readonly license: "MIT";
    readonly repository: "https://github.com/ldesign/ldesign";
    readonly homepage: "https://ldesign.dev";
};
/**
 * 打印库信息到控制台
 * @example
 * ```typescript
 * import { printLibraryInfo } from '@ldesign/typescript-utils-example'
 *
 * printLibraryInfo()
 * // 输出库的详细信息
 * ```
 */
export declare function printLibraryInfo(): void;
import * as mathModule from './math';
import * as stringModule from './string';
import * as dateModule from './date';
/**
 * 默认导出：包含所有工具模块的对象
 */
declare const _default: {
    math: typeof mathModule;
    string: typeof stringModule;
    date: typeof dateModule;
    VERSION: string;
    LIBRARY_INFO: {
        readonly name: "@ldesign/typescript-utils-example";
        readonly version: "1.0.0";
        readonly description: "TypeScript 工具库示例 - 展示如何使用 @ldesign/builder 打包 TypeScript 工具库";
        readonly author: "LDesign Team";
        readonly license: "MIT";
        readonly repository: "https://github.com/ldesign/ldesign";
        readonly homepage: "https://ldesign.dev";
    };
    getLibraryInfo: typeof getLibraryInfo;
    printLibraryInfo: typeof printLibraryInfo;
};
export default _default;
