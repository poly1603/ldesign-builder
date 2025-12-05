/**
 * 异步工具函数
 */
/** 延迟执行 */
export declare function delay(ms: number): Promise<void>;
/** 防抖函数 */
export declare function debounce<T extends (...args: any[]) => any>(fn: T, wait: number): (...args: Parameters<T>) => void;
/** 节流函数 */
export declare function throttle<T extends (...args: any[]) => any>(fn: T, wait: number): (...args: Parameters<T>) => void;
/** 重试函数 */
export declare function retry<T>(fn: () => Promise<T>, options?: {
    times?: number;
    delay?: number;
}): Promise<T>;
/** 并发控制 */
export declare function pLimit<T>(tasks: (() => Promise<T>)[], limit: number): Promise<T[]>;
/** 超时包装 */
export declare function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T>;
//# sourceMappingURL=index.d.ts.map