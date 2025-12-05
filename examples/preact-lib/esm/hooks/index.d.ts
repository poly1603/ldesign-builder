/**
 * Toggle hook
 */
export declare function useToggle(initialValue?: boolean): {
    value: boolean;
    toggle: () => void;
    setTrue: () => void;
    setFalse: () => void;
    setValue: import("preact/hooks").Dispatch<import("preact/hooks").StateUpdater<boolean>>;
};
/**
 * Counter hook
 */
export declare function useCounter(initialValue?: number, step?: number): {
    count: number;
    increment: () => void;
    decrement: () => void;
    reset: () => void;
    setCount: import("preact/hooks").Dispatch<import("preact/hooks").StateUpdater<number>>;
};
/**
 * LocalStorage hook
 */
export declare function useLocalStorage<T>(key: string, initialValue: T): readonly [T, (value: T | ((val: T) => T)) => void, () => void];
/**
 * 防抖 hook
 */
export declare function useDebounce<T>(value: T, delay: number): T;
//# sourceMappingURL=index.d.ts.map