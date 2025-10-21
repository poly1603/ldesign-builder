/**
 * 缓存相关工具函数
 */
interface CacheOptions {
    cacheDir?: string;
    ttl?: number;
    namespace?: string;
    maxSize?: number;
}
/**
 * 构建缓存管理器
 */
export declare class BuildCache {
    private cacheDir;
    private ttl;
    private namespace;
    private maxSize?;
    private memoryCache;
    private initialized;
    constructor(options?: CacheOptions);
    /**
     * 初始化缓存目录
     */
    private ensureCacheDir;
    /**
     * 生成缓存键的哈希值
     */
    private generateHash;
    /**
     * 获取缓存文件路径
     */
    private getCachePath;
    /**
     * 设置缓存
     */
    set(key: string, value: any, _options?: {
        ttl?: number;
    }): Promise<void>;
    /**
     * 获取缓存
     */
    get<T = any>(key: string): Promise<T | null>;
    /** 获取缓存目录 */
    getDirectory(): string;
    /** 获取 TTL */
    getTTL(): number;
    /** 获取最大体积限制 */
    getMaxSize(): number | undefined;
    /**
     * 检查缓存是否有效
     */
    private isValid;
    /**
     * 若设置了 maxSize，则在超过阈值时按旧到新淘汰文件
     */
    private enforceMaxSize;
    /**
     * 删除缓存
     */
    delete(key: string): Promise<void>;
    /**
     * 清空所有缓存
     */
    clear(): Promise<void>;
    /**
     * 获取缓存统计信息
     */
    getStats(): Promise<{
        memoryEntries: number;
        fileEntries: number;
        totalSize: number;
    }>;
}
/**
 * TypeScript 编译缓存
 */
export declare class TypeScriptCache extends BuildCache {
    constructor();
    /**
     * 生成 TypeScript 文件的缓存键
     */
    generateFileKey(filePath: string, content?: string): Promise<string>;
    /**
     * 缓存编译结果
     */
    cacheCompiled(filePath: string, content: string, compiled: {
        code: string;
        map?: string;
        dts?: string;
    }): Promise<void>;
    /**
     * 获取编译缓存
     */
    getCompiled(filePath: string, content?: string): Promise<{
        code: string;
        map?: string;
        dts?: string;
    } | null>;
}
/**
 * Rollup 插件缓存
 */
export declare class RollupCache extends BuildCache {
    constructor(options?: CacheOptions);
    /**
     * 缓存 Rollup 构建结果（包含文件内容）
     */
    cacheBuildResult(config: any, result: any): Promise<void>;
    /**
     * 获取 Rollup 构建缓存
     */
    getBuildResult(config: any): Promise<any>;
    /**
     * 从缓存结果恢复文件
     */
    restoreFilesFromCache(cachedResult: any): Promise<boolean>;
}
/**
 * 创建默认缓存实例
 */
export declare const buildCache: BuildCache;
export declare const tsCache: TypeScriptCache;
export declare const rollupCache: RollupCache;
/**
 * 缓存装饰器
 */
export declare function cached<T extends (...args: any[]) => Promise<any>>(fn: T, options?: {
    key?: (...args: Parameters<T>) => string;
    ttl?: number;
}): T;
export {};
