/**
 * 字符串工具函数
 */
/** 首字母大写 */
export declare function capitalize(str: string): string;
/** 驼峰转短横线 */
export declare function kebabCase(str: string): string;
/** 短横线转驼峰 */
export declare function camelCase(str: string): string;
/** 短横线转帕斯卡 */
export declare function pascalCase(str: string): string;
/** 截断字符串 */
export declare function truncate(str: string, length: number, suffix?: string): string;
/** 移除 HTML 标签 */
export declare function stripHtml(html: string): string;
/** 转义 HTML */
export declare function escapeHtml(str: string): string;
/** 生成随机字符串 */
export declare function randomString(length?: number): string;
/** 模板字符串替换 */
export declare function template(str: string, data: Record<string, any>): string;
/** 字符串填充 */
export declare function padStart(str: string, length: number, char?: string): string;
export declare function padEnd(str: string, length: number, char?: string): string;
//# sourceMappingURL=index.d.ts.map