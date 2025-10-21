/**
 * 通用模式和工具函数
 *
 * 提供常用的代码模式和工具函数，减少代码重复
 */
/**
 * 重试配置
 */
export interface RetryOptions {
    /** 最大重试次数 */
    maxRetries?: number;
    /** 重试延迟基数 (ms) */
    delayBase?: number;
    /** 最大延迟时间 (ms) */
    maxDelay?: number;
    /** 是否使用指数退避 */
    exponentialBackoff?: boolean;
}
/**
 * 带重试的异步函数执行器
 */
export declare function withRetry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T>;
/**
 * 安全的异步操作包装器
 */
export declare function safeAsync<T>(fn: () => Promise<T>, fallback?: T, onError?: (error: Error) => void): Promise<T | undefined>;
/**
 * 批量处理数组元素
 */
export declare function batchProcess<T, R>(items: T[], processor: (item: T, index: number) => Promise<R>, batchSize?: number): Promise<R[]>;
/**
 * 防抖函数
 */
export declare function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void;
/**
 * 节流函数
 */
export declare function throttle<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void;
/**
 * 缓存装饰器
 */
export declare function memoize<T extends (...args: any[]) => any>(fn: T, keyGenerator?: (...args: Parameters<T>) => string): T;
/**
 * 格式化文件大小
 */
export declare function formatFileSize(bytes: number): string;
/**
 * 格式化持续时间
 */
export declare function formatDuration(ms: number): string;
/**
 * 深度合并对象
 */
export declare function deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T;
/**
 * 检查是否为空值
 */
export declare function isEmpty(value: any): boolean;
/**
 * 确保值为数组
 */
export declare function ensureArray<T>(value: T | T[]): T[];
/**
 * 安全的JSON解析
 */
export declare function safeJsonParse<T = any>(json: string, fallback?: T): T | undefined;
/**
 * 创建计时器
 */
export declare function createTimer(label?: string): {
    end: () => number;
    elapsed: () => number;
};
/**
 * 并发限制器
 */
export declare class ConcurrencyLimiter {
    private limit;
    private running;
    private queue;
    constructor(limit: number);
    run<T>(fn: () => Promise<T>): Promise<T>;
    private processQueue;
}
