/*!
 * ********************************************
 * @ldesign/typescript-utils-example v1.0.0 *
 * Built with rollup                        *
 * Build time: 2024-09-29 15:03:11          *
 * Build mode: production                   *
 * Minified: No                             *
 * ********************************************
 */
'use strict';

var basic = require('./basic.cjs');
var advanced = require('./advanced.cjs');

const MATH_CONSTANTS = {
  /** 圆周率 */
  PI: Math.PI,
  /** 自然对数的底数 */
  E: Math.E,
  /** 2的自然对数 */
  LN2: Math.LN2,
  /** 10的自然对数 */
  LN10: Math.LN10,
  /** 以2为底的e的对数 */
  LOG2E: Math.LOG2E,
  /** 以10为底的e的对数 */
  LOG10E: Math.LOG10E,
  /** 2的平方根 */
  SQRT2: Math.SQRT2,
  /** 1/2的平方根 */
  SQRT1_2: Math.SQRT1_2
};

exports.add = basic.add;
exports.divide = basic.divide;
exports.modulo = basic.modulo;
exports.multiply = basic.multiply;
exports.power = basic.power;
exports.sqrt = basic.sqrt;
exports.subtract = basic.subtract;
exports.average = advanced.average;
exports.factorial = advanced.factorial;
exports.fibonacci = advanced.fibonacci;
exports.max = advanced.max;
exports.median = advanced.median;
exports.min = advanced.min;
exports.standardDeviation = advanced.standardDeviation;
exports.MATH_CONSTANTS = MATH_CONSTANTS;
//# sourceMappingURL=index.cjs.map
