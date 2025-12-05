/**
 * 存储工具函数
 */
export interface StorageOptions {
    prefix?: string;
    expires?: number;
    storage?: Storage;
}
/** 创建存储实例 */
export declare function createStorage(options?: StorageOptions): {
    /** 获取值 */
    get<T = any>(key: string, defaultValue?: T): T | undefined;
    /** 设置值 */
    set<T>(key: string, value: T, ttl?: number): void;
    /** 删除值 */
    remove(key: string): void;
    /** 清空所有值 */
    clear(): void;
    /** 检查是否存在 */
    has(key: string): boolean;
    /** 获取所有键 */
    keys(): string[];
};
/** 默认 localStorage 实例 */
export declare const local: {
    /** 获取值 */
    get<T = any>(key: string, defaultValue?: T): T | undefined;
    /** 设置值 */
    set<T>(key: string, value: T, ttl?: number): void;
    /** 删除值 */
    remove(key: string): void;
    /** 清空所有值 */
    clear(): void;
    /** 检查是否存在 */
    has(key: string): boolean;
    /** 获取所有键 */
    keys(): string[];
};
/** 默认 sessionStorage 实例 */
export declare const session: {
    /** 获取值 */
    get<T = any>(key: string, defaultValue?: T): T | undefined;
    /** 设置值 */
    set<T>(key: string, value: T, ttl?: number): void;
    /** 删除值 */
    remove(key: string): void;
    /** 清空所有值 */
    clear(): void;
    /** 检查是否存在 */
    has(key: string): boolean;
    /** 获取所有键 */
    keys(): string[];
};
//# sourceMappingURL=index.d.ts.map