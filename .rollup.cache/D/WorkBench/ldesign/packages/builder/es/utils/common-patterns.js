/**
 * 通用模式和工具函数
 *
 * 提供常用的代码模式和工具函数，减少代码重复
 */
import { BUILD_CONSTANTS } from '../constants/defaults';
/**
 * 带重试的异步函数执行器
 */
export async function withRetry(fn, options = {}) {
    const { maxRetries = BUILD_CONSTANTS.MAX_RETRY_COUNT, delayBase = BUILD_CONSTANTS.RETRY_DELAY_BASE, maxDelay = 10000, exponentialBackoff = true } = options;
    let lastError = null;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            if (attempt === maxRetries) {
                break;
            }
            // 计算延迟时间
            const delay = exponentialBackoff
                ? Math.min(delayBase * Math.pow(2, attempt), maxDelay)
                : delayBase;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw lastError;
}
/**
 * 安全的异步操作包装器
 */
export async function safeAsync(fn, fallback, onError) {
    try {
        return await fn();
    }
    catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        onError?.(err);
        return fallback;
    }
}
/**
 * 批量处理数组元素
 */
export async function batchProcess(items, processor, batchSize = 10) {
    const results = [];
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch.map((item, index) => processor(item, i + index)));
        results.push(...batchResults);
    }
    return results;
}
/**
 * 防抖函数
 */
export function debounce(fn, delay) {
    let timeoutId;
    return (...args) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            fn(...args);
        }, delay);
    };
}
/**
 * 节流函数
 */
export function throttle(fn, delay) {
    let lastCall = 0;
    return (...args) => {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            fn(...args);
        }
    };
}
/**
 * 缓存装饰器
 */
export function memoize(fn, keyGenerator) {
    const cache = new Map();
    return ((...args) => {
        const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = fn(...args);
        cache.set(key, result);
        return result;
    });
}
/**
 * 格式化文件大小
 */
export function formatFileSize(bytes) {
    if (bytes === 0)
        return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
/**
 * 格式化持续时间
 */
export function formatDuration(ms) {
    if (ms < 1000)
        return `${ms}ms`;
    if (ms < 60000)
        return `${(ms / 1000).toFixed(2)}s`;
    if (ms < 3600000)
        return `${(ms / 60000).toFixed(2)}m`;
    return `${(ms / 3600000).toFixed(2)}h`;
}
/**
 * 深度合并对象
 */
export function deepMerge(target, ...sources) {
    if (!sources.length)
        return target;
    const source = sources.shift();
    if (!source)
        return target;
    for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            if (!target[key] || typeof target[key] !== 'object') {
                target[key] = {};
            }
            deepMerge(target[key], source[key]);
        }
        else {
            target[key] = source[key];
        }
    }
    return deepMerge(target, ...sources);
}
/**
 * 检查是否为空值
 */
export function isEmpty(value) {
    if (value == null)
        return true;
    if (typeof value === 'string')
        return value.trim().length === 0;
    if (Array.isArray(value))
        return value.length === 0;
    if (typeof value === 'object')
        return Object.keys(value).length === 0;
    return false;
}
/**
 * 确保值为数组
 */
export function ensureArray(value) {
    return Array.isArray(value) ? value : [value];
}
/**
 * 安全的JSON解析
 */
export function safeJsonParse(json, fallback) {
    try {
        return JSON.parse(json);
    }
    catch {
        return fallback;
    }
}
/**
 * 创建计时器
 */
export function createTimer(label) {
    const startTime = performance.now();
    return {
        end: () => {
            const duration = performance.now() - startTime;
            if (label) {
                console.log(`${label}: ${formatDuration(duration)}`);
            }
            return duration;
        },
        elapsed: () => performance.now() - startTime
    };
}
/**
 * 并发限制器
 */
export class ConcurrencyLimiter {
    constructor(limit) {
        this.limit = limit;
        this.running = 0;
        this.queue = [];
    }
    async run(fn) {
        return new Promise((resolve, reject) => {
            const execute = async () => {
                this.running++;
                try {
                    const result = await fn();
                    resolve(result);
                }
                catch (error) {
                    reject(error);
                }
                finally {
                    this.running--;
                    this.processQueue();
                }
            };
            if (this.running < this.limit) {
                execute();
            }
            else {
                this.queue.push(execute);
            }
        });
    }
    processQueue() {
        if (this.queue.length > 0 && this.running < this.limit) {
            const next = this.queue.shift();
            if (next)
                next();
        }
    }
}
//# sourceMappingURL=common-patterns.js.map