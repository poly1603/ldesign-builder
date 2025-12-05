/**
 * 类型工具
 */
/** 深度只读类型 */
export type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};
/** 深度可选类型 */
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
/** 可空类型 */
export type Nullable<T> = T | null;
/** 可能未定义类型 */
export type Maybe<T> = T | undefined;
/** 数组元素类型 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never;
/** 函数类型 */
export type Fn<T = void> = () => T;
export type AnyFn = (...args: any[]) => any;
/** Promise 解包类型 */
export type Awaitable<T> = T | Promise<T>;
export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
/** 对象键类型 */
export type ObjectKeys<T> = keyof T;
export type ObjectValues<T> = T[keyof T];
/** 排除 undefined */
export type NonUndefined<T> = T extends undefined ? never : T;
/** 构造函数类型 */
export type Constructor<T = any> = new (...args: any[]) => T;
/** 类型断言函数 */
export declare function isString(val: unknown): val is string;
export declare function isNumber(val: unknown): val is number;
export declare function isBoolean(val: unknown): val is boolean;
export declare function isArray<T = any>(val: unknown): val is T[];
export declare function isObject(val: unknown): val is Record<string, any>;
export declare function isFunction(val: unknown): val is AnyFn;
export declare function isNull(val: unknown): val is null;
export declare function isUndefined(val: unknown): val is undefined;
export declare function isNullOrUndefined(val: unknown): val is null | undefined;
export declare function isDefined<T>(val: T): val is NonNullable<T>;
//# sourceMappingURL=index.d.ts.map