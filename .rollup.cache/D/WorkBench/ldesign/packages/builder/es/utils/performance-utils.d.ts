/**
 * 性能优化工具函数
 *
 * 提供各种性能优化相关的实用工具
 *
 * @author LDesign Team
 * @version 1.0.0
 */
/**
 * 防抖函数
 */
export declare function debounce<T extends (...args: unknown[]) => unknown>(func: T, wait: number, immediate?: boolean): (...args: Parameters<T>) => void;
/**
 * 节流函数
 */
export declare function throttle<T extends (...args: unknown[]) => unknown>(func: T, limit: number): (...args: Parameters<T>) => void;
/**
 * 内存使用监控
 */
export declare class MemoryMonitor {
    private samples;
    private maxSamples;
    constructor(maxSamples?: number);
    /**
     * 记录当前内存使用情况
     */
    sample(): NodeJS.MemoryUsage;
    /**
     * 获取内存使用趋势
     */
    getTrend(): {
        current: NodeJS.MemoryUsage;
        peak: NodeJS.MemoryUsage;
        average: NodeJS.MemoryUsage;
        trend: 'increasing' | 'decreasing' | 'stable';
    };
    /**
     * 清除所有样本
     */
    clear(): void;
}
/**
 * 批处理工具
 */
export declare class BatchProcessor<T, R> {
    private batchSize;
    private processor;
    constructor(batchSize: number, processor: (batch: T[]) => Promise<R[]>);
    /**
     * 处理数据批次
     */
    process(items: T[]): Promise<R[]>;
    /**
     * 并行处理数据批次
     */
    processParallel(items: T[], maxConcurrency?: number): Promise<R[]>;
}
/**
 * 缓存装饰器
 */
export declare function memoize<TArgs extends unknown[], TReturn>(fn: (...args: TArgs) => TReturn, keyGenerator?: (...args: TArgs) => string): (...args: TArgs) => TReturn;
/**
 * 异步缓存装饰器
 */
export declare function memoizeAsync<TArgs extends unknown[], TReturn>(fn: (...args: TArgs) => Promise<TReturn>, keyGenerator?: (...args: TArgs) => string, ttl?: number): (...args: TArgs) => Promise<TReturn>;
/**
 * 格式化字节大小
 */
export declare function formatBytes(bytes: number, decimals?: number): string;
/**
 * 格式化持续时间
 */
export declare function formatDuration(ms: number): string;
