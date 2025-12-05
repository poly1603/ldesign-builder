/**
 * 数组工具函数
 */
/** 数组去重 */
export declare function unique<T>(arr: T[]): T[];
/** 按属性去重 */
export declare function uniqueBy<T>(arr: T[], key: keyof T): T[];
/** 数组分组 */
export declare function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]>;
/** 数组分块 */
export declare function chunk<T>(arr: T[], size: number): T[][];
/** 数组扁平化 */
export declare function flatten<T>(arr: (T | T[])[]): T[];
/** 深度扁平化 */
export declare function flattenDeep<T>(arr: any[]): T[];
/** 数组差集 */
export declare function difference<T>(arr1: T[], arr2: T[]): T[];
/** 数组交集 */
export declare function intersection<T>(arr1: T[], arr2: T[]): T[];
/** 数组并集 */
export declare function union<T>(...arrays: T[][]): T[];
/** 随机打乱数组 */
export declare function shuffle<T>(arr: T[]): T[];
/** 获取随机元素 */
export declare function sample<T>(arr: T[]): T | undefined;
/** 获取多个随机元素 */
export declare function sampleSize<T>(arr: T[], size: number): T[];
/** 数组求和 */
export declare function sum(arr: number[]): number;
/** 数组平均值 */
export declare function average(arr: number[]): number;
/** 获取最大值 */
export declare function max(arr: number[]): number;
/** 获取最小值 */
export declare function min(arr: number[]): number;
/** 范围数组 */
export declare function range(start: number, end: number, step?: number): number[];
//# sourceMappingURL=index.d.ts.map