/**
 * 错误处理工具
 *
 * TODO: 后期可以移到 @ldesign/kit 中统一管理
 */
import { ErrorCode } from '../constants/errors';
import type { Logger } from './logger';
/**
 * 构建器错误类
 */
export declare class BuilderError extends Error {
    readonly code: ErrorCode;
    readonly suggestion?: string;
    readonly details?: any;
    readonly phase?: string;
    readonly file?: string;
    readonly cause?: Error;
    constructor(code: ErrorCode, message?: string, options?: {
        suggestion?: string;
        details?: any;
        phase?: string;
        file?: string;
        cause?: Error;
    });
    /**
     * 获取完整的错误信息
     */
    getFullMessage(): string;
    /**
     * 转换为 JSON 格式
     */
    toJSON(): Record<string, any>;
}
/**
 * 错误处理器选项
 */
export interface ErrorHandlerOptions {
    /** 日志记录器 */
    logger?: Logger;
    /** 是否显示堆栈跟踪 */
    showStack?: boolean;
    /** 是否显示建议 */
    showSuggestions?: boolean;
    /** 错误回调 */
    onError?: (error: Error) => void;
    /** 是否退出进程 */
    exitOnError?: boolean;
    /** 退出码 */
    exitCode?: number;
}
/**
 * 错误处理器类
 */
export declare class ErrorHandler {
    private logger?;
    private showStack;
    private showSuggestions;
    private onError?;
    private exitOnError;
    private exitCode;
    constructor(options?: ErrorHandlerOptions);
    /**
     * 处理错误
     */
    handle(error: Error, context?: string): void;
    /**
     * 处理异步错误 - 优化性能，避免不必要的Promise包装
     */
    handleAsync(error: Error, context?: string): Promise<void>;
    /**
     * 批量处理错误
     */
    handleBatch(errors: Array<{
        error: Error;
        context?: string;
    }>): void;
    /**
     * 错误恢复机制
     */
    recover<T>(fn: () => T | Promise<T>, fallback?: T | (() => T | Promise<T>), maxRetries?: number): Promise<T>;
    /**
     * 包装函数以处理错误
     */
    wrap<TArgs extends readonly unknown[], TReturn>(fn: (...args: TArgs) => TReturn, context?: string): (...args: TArgs) => TReturn;
    /**
     * 包装异步函数以处理错误
     */
    wrapAsync<TArgs extends readonly unknown[], TReturn>(fn: (...args: TArgs) => Promise<TReturn>, context?: string): (...args: TArgs) => Promise<TReturn>;
    /**
     * 创建构建器错误
     */
    createError(code: ErrorCode, message?: string, options?: {
        suggestion?: string;
        details?: any;
        phase?: string;
        file?: string;
        cause?: Error;
    }): BuilderError;
    /**
     * 抛出构建器错误
     */
    throwError(code: ErrorCode, message?: string, options?: {
        suggestion?: string;
        details?: any;
        phase?: string;
        file?: string;
        cause?: Error;
    }): never;
    /**
     * 格式化错误信息
     */
    formatError(error: Error, includeStack?: boolean): string;
    /**
     * 获取错误建议
     */
    getSuggestions(error: Error): string[];
    /**
     * 记录错误日志
     */
    private logError;
}
/**
 * 默认错误处理器实例
 */
export declare const errorHandler: ErrorHandler;
/**
 * 创建错误处理器
 */
export declare function createErrorHandler(options?: ErrorHandlerOptions): ErrorHandler;
/**
 * 处理未捕获的异常
 */
export declare function setupGlobalErrorHandling(handler?: ErrorHandler): void;
/**
 * 判断是否为构建器错误
 */
export declare function isBuilderError(error: any): error is BuilderError;
/**
 * 从错误中提取错误码
 */
export declare function getErrorCode(error: Error): ErrorCode | undefined;
/**
 * 格式化错误信息
 */
export declare function formatError(error: Error, includeStack?: boolean): string;
