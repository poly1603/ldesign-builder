/**
 * 构建性能优化器
 *
 * @author LDesign Team
 * @version 1.0.0
 */
import * as os from 'os';
import { EventEmitter } from 'events';
/**
 * LRU缓存实现
 */
class LRUCache {
    constructor(maxSize = 100, maxAge = 60000) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.maxAge = maxAge;
    }
    get(key) {
        const item = this.cache.get(key);
        if (!item)
            return undefined;
        const age = Date.now() - item.timestamp;
        if (age > this.maxAge) {
            this.cache.delete(key);
            return undefined;
        }
        // 更新访问时间（LRU）
        this.cache.delete(key);
        this.cache.set(key, { value: item.value, timestamp: Date.now() });
        return item.value;
    }
    set(key, value) {
        // 检查大小限制
        if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
            // 删除最旧的项
            const firstKey = this.cache.keys().next().value;
            if (firstKey !== undefined) {
                this.cache.delete(firstKey);
            }
        }
        this.cache.set(key, { value, timestamp: Date.now() });
    }
    has(key) {
        const item = this.cache.get(key);
        if (!item)
            return false;
        const age = Date.now() - item.timestamp;
        if (age > this.maxAge) {
            this.cache.delete(key);
            return false;
        }
        return true;
    }
    clear() {
        this.cache.clear();
    }
    size() {
        return this.cache.size;
    }
}
/**
 * 任务队列
 */
class TaskQueue {
    constructor(maxConcurrent = 4) {
        this.queue = [];
        this.running = 0;
        this.results = new Map();
        this.emitter = new EventEmitter();
        this.maxConcurrent = maxConcurrent;
    }
    async add(task) {
        return new Promise((resolve, reject) => {
            // 添加到队列
            this.queue.push(task);
            this.queue.sort((a, b) => (b.priority || 0) - (a.priority || 0));
            // 监听完成事件
            this.emitter.once(task.id, (result) => {
                if (result.error) {
                    reject(result.error);
                }
                else {
                    resolve(result.result);
                }
            });
            // 尝试运行任务
            this.runNext();
        });
    }
    async runNext() {
        if (this.running >= this.maxConcurrent || this.queue.length === 0) {
            return;
        }
        const task = this.queue.shift();
        this.running++;
        const startTime = Date.now();
        try {
            // 设置超时
            const timeoutPromise = task.timeout
                ? new Promise((_, reject) => setTimeout(() => reject(new Error('Task timeout')), task.timeout))
                : null;
            // 执行任务
            const resultPromise = Promise.resolve(task.fn(...task.args));
            const result = timeoutPromise
                ? await Promise.race([resultPromise, timeoutPromise])
                : await resultPromise;
            const taskResult = {
                id: task.id,
                result,
                duration: Date.now() - startTime
            };
            this.results.set(task.id, taskResult);
            this.emitter.emit(task.id, taskResult);
        }
        catch (error) {
            const taskResult = {
                id: task.id,
                error: error,
                duration: Date.now() - startTime
            };
            this.results.set(task.id, taskResult);
            this.emitter.emit(task.id, taskResult);
        }
        finally {
            this.running--;
            // 继续运行下一个任务
            this.runNext();
        }
    }
    getResult(taskId) {
        return this.results.get(taskId);
    }
    clear() {
        this.queue = [];
        this.results.clear();
        this.emitter.removeAllListeners();
    }
}
/**
 * 性能优化器
 */
export class PerformanceOptimizer extends EventEmitter {
    constructor(options = {}) {
        super();
        this.workers = [];
        this.metrics = {
            cacheHits: 0,
            cacheMisses: 0,
            tasksCompleted: 0,
            tasksFailed: 0,
            totalDuration: 0
        };
        this.options = {
            enableWorkers: false, // 默认不启用，因为需要额外配置
            workerCount: Math.max(1, os.cpus().length - 1),
            enableCache: true,
            cacheSize: 100, // MB
            enableCodeSplitting: true,
            enableTreeShaking: true,
            enableCompression: true,
            maxParallelTasks: 4,
            ...options
        };
        // 初始化缓存
        const cacheSizeInItems = Math.floor((this.options.cacheSize * 1024 * 1024) / 10000); // 假设每项10KB
        this.cache = new LRUCache(cacheSizeInItems);
        // 初始化任务队列
        this.taskQueue = new TaskQueue(this.options.maxParallelTasks);
        // 初始化工作线程池（如果启用）
        if (this.options.enableWorkers) {
            this.initializeWorkerPool();
        }
    }
    /**
     * 初始化工作线程池
     */
    initializeWorkerPool() {
        // 这里仅作示例，实际使用需要创建worker文件
        // for (let i = 0; i < this.options.workerCount; i++) {
        //   const worker = new Worker('./worker.js')
        //   this.workers.push(worker)
        // }
    }
    /**
     * 缓存函数结果
     */
    memoize(fn, keyGenerator) {
        const self = this;
        return ((...args) => {
            const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
            // 检查缓存
            if (this.cache.has(key)) {
                self.metrics.cacheHits++;
                self.emit('cacheHit', { key, hits: self.metrics.cacheHits });
                return this.cache.get(key);
            }
            // 计算结果
            self.metrics.cacheMisses++;
            const result = fn(...args);
            // 处理Promise
            if (result instanceof Promise) {
                return result.then(value => {
                    self.cache.set(key, value);
                    return value;
                });
            }
            // 缓存结果
            self.cache.set(key, result);
            return result;
        });
    }
    /**
     * 并行执行任务
     */
    async parallel(tasks, options = {}) {
        const { timeout = 30000 } = options;
        const taskPromises = tasks.map((fn, index) => {
            const task = {
                id: `parallel_${Date.now()}_${index}`,
                fn,
                args: [],
                timeout
            };
            return this.taskQueue.add(task);
        });
        const results = await Promise.all(taskPromises);
        this.metrics.tasksCompleted += results.length;
        this.emit('parallelCompleted', {
            count: results.length,
            total: this.metrics.tasksCompleted
        });
        return results;
    }
    /**
     * 批处理任务
     */
    async batch(items, processor, batchSize = 10) {
        const batches = [];
        for (let i = 0; i < items.length; i += batchSize) {
            batches.push(items.slice(i, i + batchSize));
        }
        const results = await this.parallel(batches.map(batch => () => processor(batch)));
        return results;
    }
    /**
     * 节流函数
     */
    throttle(fn, delay) {
        let lastCall = 0;
        let timeout = null;
        return (...args) => {
            const now = Date.now();
            const timeSinceLastCall = now - lastCall;
            if (timeSinceLastCall >= delay) {
                lastCall = now;
                fn(...args);
            }
            else if (!timeout) {
                timeout = setTimeout(() => {
                    lastCall = Date.now();
                    fn(...args);
                    timeout = null;
                }, delay - timeSinceLastCall);
            }
        };
    }
    /**
     * 防抖函数
     */
    debounce(fn, delay) {
        let timeout = null;
        return (...args) => {
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(() => {
                fn(...args);
                timeout = null;
            }, delay);
        };
    }
    /**
     * 优化构建配置
     */
    optimizeBuildConfig(config) {
        const optimized = { ...config };
        // 启用代码分割
        if (this.options.enableCodeSplitting) {
            optimized.output = {
                ...optimized.output,
                manualChunks: this.createManualChunks()
            };
        }
        // 启用树摇
        if (this.options.enableTreeShaking) {
            optimized.treeshake = {
                moduleSideEffects: false,
                propertyReadSideEffects: false,
                tryCatchDeoptimization: false
            };
        }
        // 启用压缩
        if (this.options.enableCompression) {
            optimized.plugins = optimized.plugins || [];
            // 这里应该添加压缩插件，但避免重复添加
        }
        return optimized;
    }
    /**
     * 创建手动代码块配置
     */
    createManualChunks() {
        return (id) => {
            // 将node_modules分离到vendor chunk
            if (id.includes('node_modules')) {
                // 大型库单独分块
                if (id.includes('lodash'))
                    return 'lodash';
                if (id.includes('moment'))
                    return 'moment';
                if (id.includes('react'))
                    return 'react';
                if (id.includes('vue'))
                    return 'vue';
                return 'vendor';
            }
            // 工具函数分离
            if (id.includes('utils/') || id.includes('helpers/')) {
                return 'utils';
            }
            return undefined;
        };
    }
    /**
     * 获取性能指标
     */
    getMetrics() {
        return {
            ...this.metrics,
            cacheSize: this.cache.size()
        };
    }
    /**
     * 重置优化器
     */
    reset() {
        this.cache.clear();
        this.taskQueue.clear();
        this.metrics = {
            cacheHits: 0,
            cacheMisses: 0,
            tasksCompleted: 0,
            tasksFailed: 0,
            totalDuration: 0
        };
    }
    /**
     * 销毁优化器
     */
    async destroy() {
        // 终止工作线程
        for (const worker of this.workers) {
            await worker.terminate();
        }
        this.workers = [];
        // 清理资源
        this.reset();
        this.removeAllListeners();
    }
}
/**
 * 创建全局性能优化器实例
 */
let globalOptimizer = null;
export function getGlobalOptimizer() {
    if (!globalOptimizer) {
        globalOptimizer = new PerformanceOptimizer({
            enableCache: true,
            cacheSize: 100,
            maxParallelTasks: os.cpus().length,
            enableCodeSplitting: true,
            enableTreeShaking: true,
            enableCompression: true
        });
    }
    return globalOptimizer;
}
/**
 * 性能测量装饰器
 */
export function measure(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args) {
        const startTime = performance.now();
        const startMem = process.memoryUsage();
        try {
            const result = await originalMethod.apply(this, args);
            const duration = performance.now() - startTime;
            const memDiff = process.memoryUsage().heapUsed - startMem.heapUsed;
            console.log(`[Performance] ${target.constructor.name}.${propertyKey}:`);
            console.log(`  Duration: ${duration.toFixed(2)}ms`);
            console.log(`  Memory: ${(memDiff / 1024 / 1024).toFixed(2)}MB`);
            return result;
        }
        catch (error) {
            const duration = performance.now() - startTime;
            console.error(`[Performance] ${target.constructor.name}.${propertyKey} failed after ${duration.toFixed(2)}ms`);
            throw error;
        }
    };
    return descriptor;
}
//# sourceMappingURL=performance-optimizer.js.map