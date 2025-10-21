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

function average(numbers) {
  if (numbers.length === 0) {
    throw new Error("\u6570\u7EC4\u4E0D\u80FD\u4E3A\u7A7A");
  }
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return sum / numbers.length;
}
function median(numbers) {
  if (numbers.length === 0) {
    throw new Error("\u6570\u7EC4\u4E0D\u80FD\u4E3A\u7A7A");
  }
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  } else {
    return sorted[middle];
  }
}
function max(numbers) {
  if (numbers.length === 0) {
    throw new Error("\u6570\u7EC4\u4E0D\u80FD\u4E3A\u7A7A");
  }
  return Math.max(...numbers);
}
function min(numbers) {
  if (numbers.length === 0) {
    throw new Error("\u6570\u7EC4\u4E0D\u80FD\u4E3A\u7A7A");
  }
  return Math.min(...numbers);
}
function standardDeviation(numbers) {
  if (numbers.length === 0) {
    throw new Error("\u6570\u7EC4\u4E0D\u80FD\u4E3A\u7A7A");
  }
  const avg = average(numbers);
  const squaredDifferences = numbers.map((num) => Math.pow(num - avg, 2));
  const avgSquaredDiff = average(squaredDifferences);
  return Math.sqrt(avgSquaredDiff);
}
function factorial(n) {
  if (n < 0 || !Number.isInteger(n)) {
    throw new Error("\u8F93\u5165\u5FC5\u987B\u662F\u975E\u8D1F\u6574\u6570");
  }
  if (n === 0 || n === 1) {
    return 1;
  }
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}
function fibonacci(n) {
  if (n < 0) {
    throw new Error("\u8F93\u5165\u5FC5\u987B\u662F\u975E\u8D1F\u6570");
  }
  if (n === 0)
    return 0;
  if (n === 1)
    return 1;
  let a = 0;
  let b = 1;
  for (let i = 2; i <= n; i++) {
    const temp = a + b;
    a = b;
    b = temp;
  }
  return b;
}

exports.average = average;
exports.factorial = factorial;
exports.fibonacci = fibonacci;
exports.max = max;
exports.median = median;
exports.min = min;
exports.standardDeviation = standardDeviation;
//# sourceMappingURL=advanced.cjs.map
