/**
 * 日志工具
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';
export declare class Logger {
    private level;
    setLevel(level: LogLevel): void;
    debug(...args: any[]): void;
    info(...args: any[]): void;
    success(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
    private shouldLog;
}
export declare const logger: Logger;
//# sourceMappingURL=index.d.ts.map