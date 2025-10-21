/**
 * 性能监控器
 *
 * 负责监控构建过程的性能指标
 *
 * @author LDesign Team
 * @version 1.0.0
 */
import { EventEmitter } from 'events';
import type { PerformanceMetrics, PerformanceReport, CacheStats } from '../types/performance';
import { Logger } from '../utils/logger';
/**
 * 性能监控器选项
 */
export interface PerformanceMonitorOptions {
    logger?: Logger;
    enabled?: boolean;
    sampleInterval?: number;
    maxSamples?: number;
}
/**
 * 性能监控器类
 */
export declare class PerformanceMonitor extends EventEmitter {
    private logger;
    private options;
    private sessions;
    private globalStats;
    constructor(options?: PerformanceMonitorOptions);
    /**
     * 开始会话监控（别名）
     */
    startSession(sessionId: string): string;
    /**
     * 结束会话监控（别名）
     */
    endSession(sessionId: string): PerformanceMetrics & {
        duration: number;
        cpuUsage?: number;
    };
    /**
     * 获取全局统计信息
     */
    getGlobalStats(): {
        totalBuilds: number;
        totalTime: number;
        averageTime: number;
        cacheStats: CacheStats;
    };
    /**
     * 开始构建监控
     */
    startBuild(buildId: string): void;
    /**
     * 结束构建监控
     */
    endBuild(buildId: string): PerformanceMetrics;
    /**
     * 记录错误
     */
    recordError(buildId: string, error: Error): void;
    /**
     * 记录文件处理
     */
    recordFileProcessing(buildId: string, filePath: string, processingTime: number): void;
    /**
     * 记录缓存命中
     */
    recordCacheHit(saved: boolean, timeSaved?: number): void;
    /**
     * 获取性能报告
     */
    getPerformanceReport(): PerformanceReport;
    /**
     * 开始内存监控
     */
    private startMemoryMonitoring;
    /**
     * 获取当前内存使用情况
     */
    private getCurrentMemoryUsage;
    /**
     * 生成性能指标
     */
    private generateMetrics;
    /**
     * 计算内存使用情况
     */
    private calculateMemoryUsage;
    /**
     * 获取系统资源使用情况
     */
    private getSystemResources;
    /**
     * 获取文件扩展名
     */
    private getFileExtension;
    /**
     * 创建空的性能指标
     */
    private createEmptyMetrics;
}
