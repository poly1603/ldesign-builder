/**
 * 日志系统工具
 *
 * TODO: 后期可以移到 @ldesign/kit 中统一管理
 */
import type { LogLevel } from '../types/common';
/**
 * 日志级别枚举
 */
export declare enum LogLevelEnum {
    SILENT = 0,
    ERROR = 1,
    WARN = 2,
    INFO = 3,
    DEBUG = 4,
    VERBOSE = 5
}
/**
 * 日志选项
 */
export interface LoggerOptions {
    /** 日志级别 */
    level?: LogLevel;
    /** 是否启用颜色 */
    colors?: boolean;
    /** 是否显示时间戳 */
    timestamp?: boolean;
    /** 日志前缀 */
    prefix?: string;
    /** 是否静默模式 */
    silent?: boolean;
}
/**
 * 日志记录器类
 */
export declare class Logger {
    private level;
    private colors;
    private timestamp;
    private prefix;
    private silent;
    constructor(options?: LoggerOptions);
    /**
     * 设置日志级别
     */
    setLevel(level: LogLevel): void;
    /**
     * 获取当前日志级别
     */
    getLevel(): LogLevel;
    /**
     * 设置静默模式
     */
    setSilent(silent: boolean): void;
    /**
     * 错误日志
     */
    error(message: string, ...args: any[]): void;
    /**
     * 警告日志
     */
    warn(message: string, ...args: any[]): void;
    /**
     * 信息日志
     */
    info(message: string, ...args: any[]): void;
    /**
     * 调试日志
     */
    debug(message: string, ...args: any[]): void;
    /**
     * 详细日志
     */
    verbose(message: string, ...args: any[]): void;
    /**
     * 成功日志
     */
    success(message: string, ...args: any[]): void;
    /**
     * 开始日志（带缩进）
     */
    start(message: string, ...args: any[]): void;
    /**
     * 完成日志（带缩进）
     */
    complete(message: string, ...args: any[]): void;
    /**
     * 失败日志（带缩进）
     */
    fail(message: string, ...args: any[]): void;
    /**
     * 进度日志
     */
    progress(current: number, total: number, message?: string): void;
    /**
     * 表格日志
     */
    table(data: Record<string, any>[]): void;
    /**
     * 分组开始
     */
    group(label: string): void;
    /**
     * 分组结束
     */
    groupEnd(): void;
    /**
     * 清屏
     */
    clear(): void;
    /**
     * 换行
     */
    newLine(): void;
    /**
     * 分隔线
     */
    divider(char?: string, length?: number): void;
    /**
     * 创建子日志记录器
     */
    child(prefix: string, options?: Partial<LoggerOptions>): Logger;
    /**
     * 判断是否应该记录日志
     */
    private shouldLog;
    /**
     * 记录日志
     */
    private log;
    /**
     * 格式化消息
     */
    private formatMessage;
    /**
     * 创建进度条
     */
    private createProgressBar;
}
/**
 * 默认日志记录器实例
 */
export declare const logger: Logger;
/**
 * 创建日志记录器
 */
export declare function createLogger(options?: LoggerOptions): Logger;
/**
 * 设置全局日志级别
 */
export declare function setLogLevel(level: LogLevel): void;
/**
 * 设置全局静默模式
 */
export declare function setSilent(silent: boolean): void;
