/*!
 * ********************************************
 * @ldesign/typescript-utils-example v1.0.0 *
 * Built with rollup                        *
 * Build time: 2024-09-29 15:03:11          *
 * Build mode: production                   *
 * Minified: No                             *
 * ********************************************
 */
function add(a, b) {
  return a + b;
}
function subtract(a, b) {
  return a - b;
}
function multiply(a, b) {
  return a * b;
}
function divide(a, b) {
  if (b === 0) {
    throw new Error("\u9664\u6570\u4E0D\u80FD\u4E3A\u96F6");
  }
  return a / b;
}
function modulo(a, b) {
  if (b === 0) {
    throw new Error("\u9664\u6570\u4E0D\u80FD\u4E3A\u96F6");
  }
  return a % b;
}
function power(base, exponent) {
  return Math.pow(base, exponent);
}
function sqrt(value) {
  if (value < 0) {
    throw new Error("\u4E0D\u80FD\u8BA1\u7B97\u8D1F\u6570\u7684\u5E73\u65B9\u6839");
  }
  return Math.sqrt(value);
}

export { add, divide, modulo, multiply, power, sqrt, subtract };
//# sourceMappingURL=basic.js.map
