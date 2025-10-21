/**
 * 数学工具模块
 * 导出所有数学相关的工具函数
 */
import { add, subtract, multiply, divide, modulo, power, sqrt } from './basic';
import { average, median, max, min, standardDeviation, factorial, fibonacci } from './advanced';
export { add, subtract, multiply, divide, modulo, power, sqrt };
export { average, median, max, min, standardDeviation, factorial, fibonacci };
export declare const MATH_CONSTANTS: {
    /** 圆周率 */
    readonly PI: number;
    /** 自然对数的底数 */
    readonly E: number;
    /** 2的自然对数 */
    readonly LN2: number;
    /** 10的自然对数 */
    readonly LN10: number;
    /** 以2为底的e的对数 */
    readonly LOG2E: number;
    /** 以10为底的e的对数 */
    readonly LOG10E: number;
    /** 2的平方根 */
    readonly SQRT2: number;
    /** 1/2的平方根 */
    readonly SQRT1_2: number;
};
/**
 * 数学工具类型定义
 */
export interface MathUtils {
    /** 基础运算 */
    basic: {
        add: typeof add;
        subtract: typeof subtract;
        multiply: typeof multiply;
        divide: typeof divide;
        modulo: typeof modulo;
        power: typeof power;
        sqrt: typeof sqrt;
    };
    /** 高级运算 */
    advanced: {
        average: typeof average;
        median: typeof median;
        max: typeof max;
        min: typeof min;
        standardDeviation: typeof standardDeviation;
        factorial: typeof factorial;
        fibonacci: typeof fibonacci;
    };
    /** 数学常量 */
    constants: typeof MATH_CONSTANTS;
}
