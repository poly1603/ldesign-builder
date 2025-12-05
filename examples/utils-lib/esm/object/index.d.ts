/**
 * 对象工具函数
 */
/** 深拷贝 */
export declare function deepClone<T>(obj: T): T;
/** 深度合并 */
export declare function deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T;
/** 是否为纯对象 */
export declare function isPlainObject(val: unknown): val is Record<string, any>;
/** 选取对象属性 */
export declare function pick<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>;
/** 排除对象属性 */
export declare function omit<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>;
/** 获取嵌套属性 */
export declare function get<T = any>(obj: Record<string, any>, path: string, defaultValue?: T): T;
/** 设置嵌套属性 */
export declare function set(obj: Record<string, any>, path: string, value: any): void;
/** 对象转查询字符串 */
export declare function toQueryString(obj: Record<string, any>): string;
/** 查询字符串转对象 */
export declare function parseQueryString(str: string): Record<string, string>;
/** 检查对象是否为空 */
export declare function isEmpty(obj: Record<string, any>): boolean;
//# sourceMappingURL=index.d.ts.map