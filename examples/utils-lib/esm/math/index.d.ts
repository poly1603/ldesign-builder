/**
 * 数学工具函数
 */
/** 限制数值范围 */
export declare function clamp(value: number, min: number, max: number): number;
/** 四舍五入到指定小数位 */
export declare function round(value: number, decimals?: number): number;
/** 随机整数 */
export declare function randomInt(min: number, max: number): number;
/** 随机浮点数 */
export declare function randomFloat(min: number, max: number): number;
/** 线性插值 */
export declare function lerp(start: number, end: number, t: number): number;
/** 角度转弧度 */
export declare function degToRad(deg: number): number;
/** 弧度转角度 */
export declare function radToDeg(rad: number): number;
/** 百分比 */
export declare function percentage(value: number, total: number): number;
/** 精确除法 */
export declare function divide(a: number, b: number, defaultValue?: number): number;
//# sourceMappingURL=index.d.ts.map