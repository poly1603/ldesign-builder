/**
 * 构建缓存管理器
 *
 * 提供高级缓存管理功能，包括智能缓存策略、缓存分析和优化
 */
import { Logger } from './logger';
/**
 * 缓存条目
 */
export interface CacheEntry {
    key: string;
    hash: string;
    data: any;
    metadata: {
        size: number;
        createdAt: Date;
        lastAccessed: Date;
        accessCount: number;
        tags: string[];
        dependencies: string[];
        ttl?: number;
        expiresAt?: Date;
    };
}
/**
 * 缓存统计
 */
export interface CacheStats {
    totalEntries: number;
    totalSize: number;
    hitRate: number;
    missRate: number;
    evictionCount: number;
    oldestEntry: Date;
    newestEntry: Date;
    averageAccessCount: number;
    sizeDistribution: {
        small: number;
        medium: number;
        large: number;
        huge: number;
    };
    tagDistribution: Record<string, number>;
}
/**
 * 缓存策略
 */
export type CacheStrategy = 'lru' | 'lfu' | 'ttl' | 'size-based' | 'dependency-based';
/**
 * 缓存配置
 */
export interface CacheConfig {
    /** 缓存目录 */
    cacheDir: string;
    /** 最大缓存大小 (bytes) */
    maxSize: number;
    /** 最大条目数 */
    maxEntries: number;
    /** 默认TTL (秒) */
    defaultTtl?: number;
    /** 缓存策略 */
    strategy: CacheStrategy;
    /** 是否启用压缩 */
    compression: boolean;
    /** 是否启用加密 */
    encryption: boolean;
    /** 清理间隔 (秒) */
    cleanupInterval: number;
}
/**
 * 缓存操作结果
 */
export interface CacheOperationResult {
    success: boolean;
    key: string;
    hit?: boolean;
    size?: number;
    error?: string;
    fromCache?: boolean;
    executionTime: number;
}
/**
 * 依赖变更检测器
 */
export interface DependencyTracker {
    /** 文件路径到哈希的映射 */
    fileHashes: Map<string, string>;
    /** 依赖关系图 */
    dependencyGraph: Map<string, Set<string>>;
}
/**
 * 构建缓存管理器
 */
export declare class BuildCacheManager {
    private logger;
    private config;
    private cache;
    private stats;
    private dependencyTracker;
    private cleanupTimer?;
    constructor(config?: Partial<CacheConfig>, logger?: Logger);
    /**
     * 初始化缓存
     */
    initialize(): Promise<void>;
    /**
     * 获取缓存
     */
    get<T = any>(key: string, dependencies?: string[]): Promise<T | null>;
    /**
     * 设置缓存
     */
    set<T = any>(key: string, data: T, options?: {
        tags?: string[];
        dependencies?: string[];
        ttl?: number;
    }): Promise<CacheOperationResult>;
    /**
     * 检查缓存是否存在
     */
    has(key: string): Promise<boolean>;
    /**
     * 删除缓存
     */
    delete(key: string): Promise<boolean>;
    /**
     * 设置缓存（带依赖跟踪）
     */
    setWithDependencies(key: string, data: any, dependencies: string[], options?: {
        ttl?: number;
        tags?: string[];
    }): Promise<CacheOperationResult>;
    /**
     * 清空缓存
     */
    clear(tags?: string[]): Promise<number>;
    /**
     * 获取缓存大小
     */
    getSize(): Promise<number>;
    /**
     * 获取缓存统计
     */
    getStats(): CacheStats;
    /**
     * 清理缓存
     */
    cleanup(): Promise<number>;
    /**
     * 优化缓存
     */
    optimize(): Promise<{
        beforeStats: CacheStats;
        afterStats: CacheStats;
        optimizations: string[];
    }>;
    /**
     * 生成哈希
     */
    private generateHash;
    /**
     * 检查是否过期
     */
    private isExpired;
    /**
     * 检查依赖是否变更
     */
    private hasDependencyChanged;
    /**
     * 更新依赖跟踪
     */
    private updateDependencyTracking;
    /**
     * 确保有足够空间
     */
    private ensureSpace;
    /**
     * 驱逐条目
     */
    private evictEntries;
    /**
     * 根据策略排序条目
     */
    private sortEntriesForEviction;
    /**
     * 获取缓存文件路径
     */
    private getCacheFilePath;
    /**
     * 从磁盘加载缓存条目
     */
    private loadFromDisk;
    /**
     * 持久化条目
     */
    private persistEntry;
    /**
     * 加载缓存索引
     */
    private loadCacheIndex;
    /**
     * 清理过期条目
     */
    private cleanupExpired;
    /**
     * 清理未使用条目
     */
    private cleanupUnused;
    /**
     * 压缩大条目
     */
    private compressLargeEntries;
    /**
     * 启动清理定时器
     */
    private startCleanupTimer;
    /**
     * 销毁缓存管理器
     */
    destroy(): Promise<void>;
}
