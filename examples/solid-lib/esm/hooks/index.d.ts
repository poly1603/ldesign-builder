/**
 * Solid.js Custom Hooks
 */
import { Accessor } from 'solid-js';
/**
 * Toggle hook - 创建一个可切换的布尔值状态
 */
export declare function createToggle(initialValue?: boolean): [Accessor<boolean>, () => void, (value: boolean) => void];
/**
 * Counter hook - 创建一个计数器状态
 */
export declare function createCounter(initialValue?: number, step?: number): {
    count: Accessor<number>;
    increment: () => number;
    decrement: () => number;
    reset: () => number;
    set: (value: number) => number;
};
/**
 * LocalStorage hook - 持久化存储
 */
export declare function createLocalStorage<T>(key: string, initialValue: T): readonly [Accessor<T>, (newValue: T | ((prev: T) => T)) => void, () => void];
//# sourceMappingURL=index.d.ts.map