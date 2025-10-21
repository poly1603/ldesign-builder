/**
 * 构建性能优化器
 *
 * @author LDesign Team
 * @version 1.0.0
 */
import { EventEmitter } from 'events';
/**
 * 性能优化选项
 */
export interface PerformanceOptimizerOptions {
    /** 是否启用多线程 */
    enableWorkers?: boolean;
    /** 工作线程数量 */
    workerCount?: number;
    /** 是否启用缓存 */
    enableCache?: boolean;
    /** 缓存大小限制(MB) */
    cacheSize?: number;
    /** 是否启用代码分割优化 */
    enableCodeSplitting?: boolean;
    /** 是否启用树摇优化 */
    enableTreeShaking?: boolean;
    /** 是否启用压缩优化 */
    enableCompression?: boolean;
    /** 并行任务限制 */
    maxParallelTasks?: number;
}
/**
 * 性能优化器
 */
export declare class PerformanceOptimizer extends EventEmitter {
    private options;
    private cache;
    private taskQueue;
    private workers;
    private metrics;
    constructor(options?: PerformanceOptimizerOptions);
    /**
     * 初始化工作线程池
     */
    private initializeWorkerPool;
    /**
     * 缓存函数结果
     */
    memoize<T extends (...args: any[]) => any>(fn: T, keyGenerator?: (...args: Parameters<T>) => string): T;
    /**
     * 并行执行任务
     */
    parallel<T>(tasks: Array<() => T | Promise<T>>, options?: {
        maxConcurrent?: number;
        timeout?: number;
    }): Promise<T[]>;
    /**
     * 批处理任务
     */
    batch<T, R>(items: T[], processor: (batch: T[]) => R | Promise<R>, batchSize?: number): Promise<R[]>;
    /**
     * 节流函数
     */
    throttle<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void;
    /**
     * 防抖函数
     */
    debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void;
    /**
     * 优化构建配置
     */
    optimizeBuildConfig(config: any): any;
    /**
     * 创建手动代码块配置
     */
    private createManualChunks;
    /**
     * 获取性能指标
     */
    getMetrics(): typeof this.metrics & {
        cacheSize: number;
    };
    /**
     * 重置优化器
     */
    reset(): void;
    /**
     * 销毁优化器
     */
    destroy(): Promise<void>;
}
export declare function getGlobalOptimizer(): PerformanceOptimizer;
/**
 * 性能测量装饰器
 */
export declare function measure(target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor;
