/**
 * 基础数学工具函数
 * 提供常用的数学计算功能
 */
/**
 * 加法运算
 * @param a 第一个数字
 * @param b 第二个数字
 * @returns 两数之和
 * @example
 * ```typescript
 * import { add } from '@ldesign/typescript-utils-example/math'
 *
 * const result = add(1, 2) // 3
 * ```
 */
export declare function add(a: number, b: number): number;
/**
 * 减法运算
 * @param a 被减数
 * @param b 减数
 * @returns 两数之差
 * @example
 * ```typescript
 * import { subtract } from '@ldesign/typescript-utils-example/math'
 *
 * const result = subtract(5, 3) // 2
 * ```
 */
export declare function subtract(a: number, b: number): number;
/**
 * 乘法运算
 * @param a 第一个数字
 * @param b 第二个数字
 * @returns 两数之积
 * @example
 * ```typescript
 * import { multiply } from '@ldesign/typescript-utils-example/math'
 *
 * const result = multiply(3, 4) // 12
 * ```
 */
export declare function multiply(a: number, b: number): number;
/**
 * 除法运算
 * @param a 被除数
 * @param b 除数
 * @returns 两数之商
 * @throws {Error} 当除数为0时抛出错误
 * @example
 * ```typescript
 * import { divide } from '@ldesign/typescript-utils-example/math'
 *
 * const result = divide(10, 2) // 5
 * ```
 */
export declare function divide(a: number, b: number): number;
/**
 * 求余运算
 * @param a 被除数
 * @param b 除数
 * @returns 余数
 * @throws {Error} 当除数为0时抛出错误
 * @example
 * ```typescript
 * import { modulo } from '@ldesign/typescript-utils-example/math'
 *
 * const result = modulo(10, 3) // 1
 * ```
 */
export declare function modulo(a: number, b: number): number;
/**
 * 幂运算
 * @param base 底数
 * @param exponent 指数
 * @returns 幂运算结果
 * @example
 * ```typescript
 * import { power } from '@ldesign/typescript-utils-example/math'
 *
 * const result = power(2, 3) // 8
 * ```
 */
export declare function power(base: number, exponent: number): number;
/**
 * 平方根
 * @param value 数值
 * @returns 平方根
 * @throws {Error} 当数值为负数时抛出错误
 * @example
 * ```typescript
 * import { sqrt } from '@ldesign/typescript-utils-example/math'
 *
 * const result = sqrt(9) // 3
 * ```
 */
export declare function sqrt(value: number): number;
