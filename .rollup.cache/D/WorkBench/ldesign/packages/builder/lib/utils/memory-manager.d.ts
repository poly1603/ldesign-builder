/**
 * 内存管理器 - 防止内存泄漏和优化内存使用
 *
 * @author LDesign Team
 * @version 1.0.0
 */
import { EventEmitter } from 'events';
/**
 * 资源清理接口
 */
export interface ICleanupable {
    cleanup(): void | Promise<void>;
    isCleanedUp?: boolean;
}
/**
 * 内存管理器选项
 */
export interface MemoryManagerOptions {
    /** 是否启用内存监控 */
    enableMonitoring?: boolean;
    /** 内存使用警告阈值(MB) */
    memoryThreshold?: number;
    /** 清理间隔(ms) */
    cleanupInterval?: number;
    /** 监控间隔(ms) */
    monitoringInterval?: number;
    /** 是否自动清理 */
    autoCleanup?: boolean;
}
/**
 * 资源管理器类
 */
export declare class ResourceManager implements ICleanupable {
    private resources;
    private timers;
    private watchers;
    private listeners;
    private isDestroyed;
    /**
     * 注册资源
     */
    register(id: string, resource: ICleanupable): void;
    /**
     * 注销资源
     */
    unregister(id: string): void;
    /**
     * 添加定时器
     */
    addTimer(timer: NodeJS.Timeout): void;
    /**
     * 清除定时器
     */
    clearTimer(timer: NodeJS.Timeout): void;
    /**
     * 添加文件监听器
     */
    addWatcher(watcher: any): void;
    /**
     * 添加事件监听器追踪
     */
    trackListener(emitter: EventEmitter, event: string | symbol, listener: Function): void;
    /**
     * 移除事件监听器追踪
     */
    untrackListener(emitter: EventEmitter, event: string | symbol, listener: Function): void;
    /**
     * 清理单个资源
     */
    private cleanupResource;
    /**
     * 清理所有资源
     */
    cleanup(): Promise<void>;
    /**
     * 获取资源统计
     */
    getStats(): {
        resources: number;
        timers: number;
        watchers: number;
        listeners: number;
    };
}
/**
 * 内存管理器类
 */
export declare class MemoryManager extends EventEmitter {
    private options;
    private resourceManager;
    private monitoringInterval?;
    private cleanupInterval?;
    private memorySnapshots;
    private maxSnapshots;
    constructor(options?: MemoryManagerOptions);
    /**
     * 初始化内存管理器
     */
    private initialize;
    /**
     * 开始内存监控
     */
    private startMonitoring;
    /**
     * 检查内存使用
     */
    private checkMemoryUsage;
    /**
     * 检测内存泄漏
     */
    private detectMemoryLeak;
    /**
     * 执行清理
     */
    private performCleanup;
    /**
     * 获取资源管理器
     */
    getResourceManager(): ResourceManager;
    /**
     * 获取内存使用统计
     */
    getMemoryStats(): {
        current: NodeJS.MemoryUsage;
        history: Array<{
            timestamp: number;
            heapUsed: number;
        }>;
        trend: 'stable' | 'increasing' | 'decreasing';
    };
    /**
     * 手动触发清理
     */
    cleanup(): Promise<void>;
    /**
     * 销毁内存管理器
     */
    destroy(): Promise<void>;
}
export declare function getGlobalMemoryManager(): MemoryManager;
/**
 * 重置全局内存管理器（主要用于测试）
 */
export declare function resetGlobalMemoryManager(): void;
/**
 * 创建可清理的资源包装器
 */
export declare function createCleanupable<T extends object>(resource: T, cleanupFn: (resource: T) => void | Promise<void>): T & ICleanupable;
/**
 * 装饰器：自动管理资源生命周期
 */
export declare function managedResource(target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor;
