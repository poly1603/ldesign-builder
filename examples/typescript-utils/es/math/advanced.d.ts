/**
 * 高级数学工具函数
 * 提供复杂的数学计算功能
 */
/**
 * 计算数组的平均值
 * @param numbers 数字数组
 * @returns 平均值
 * @throws {Error} 当数组为空时抛出错误
 * @example
 * ```typescript
 * import { average } from '@ldesign/typescript-utils-example/math'
 *
 * const result = average([1, 2, 3, 4, 5]) // 3
 * ```
 */
export declare function average(numbers: number[]): number;
/**
 * 计算数组的中位数
 * @param numbers 数字数组
 * @returns 中位数
 * @throws {Error} 当数组为空时抛出错误
 * @example
 * ```typescript
 * import { median } from '@ldesign/typescript-utils-example/math'
 *
 * const result = median([1, 2, 3, 4, 5]) // 3
 * ```
 */
export declare function median(numbers: number[]): number;
/**
 * 计算数组的最大值
 * @param numbers 数字数组
 * @returns 最大值
 * @throws {Error} 当数组为空时抛出错误
 * @example
 * ```typescript
 * import { max } from '@ldesign/typescript-utils-example/math'
 *
 * const result = max([1, 5, 3, 9, 2]) // 9
 * ```
 */
export declare function max(numbers: number[]): number;
/**
 * 计算数组的最小值
 * @param numbers 数字数组
 * @returns 最小值
 * @throws {Error} 当数组为空时抛出错误
 * @example
 * ```typescript
 * import { min } from '@ldesign/typescript-utils-example/math'
 *
 * const result = min([1, 5, 3, 9, 2]) // 1
 * ```
 */
export declare function min(numbers: number[]): number;
/**
 * 计算数组的标准差
 * @param numbers 数字数组
 * @returns 标准差
 * @throws {Error} 当数组为空时抛出错误
 * @example
 * ```typescript
 * import { standardDeviation } from '@ldesign/typescript-utils-example/math'
 *
 * const result = standardDeviation([1, 2, 3, 4, 5]) // 约 1.58
 * ```
 */
export declare function standardDeviation(numbers: number[]): number;
/**
 * 计算阶乘
 * @param n 非负整数
 * @returns 阶乘结果
 * @throws {Error} 当输入为负数或非整数时抛出错误
 * @example
 * ```typescript
 * import { factorial } from '@ldesign/typescript-utils-example/math'
 *
 * const result = factorial(5) // 120
 * ```
 */
export declare function factorial(n: number): number;
/**
 * 计算斐波那契数列的第n项
 * @param n 项数（从0开始）
 * @returns 斐波那契数
 * @throws {Error} 当输入为负数时抛出错误
 * @example
 * ```typescript
 * import { fibonacci } from '@ldesign/typescript-utils-example/math'
 *
 * const result = fibonacci(10) // 55
 * ```
 */
export declare function fibonacci(n: number): number;
