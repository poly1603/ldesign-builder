/*!
 * ********************************************
 * @ldesign/typescript-utils-example v1.0.0 *
 * Built with rollup                        *
 * Build time: 2024-09-29 15:03:11          *
 * Build mode: production                   *
 * Minified: No                             *
 * ********************************************
 */
import * as index$1 from './math/index.js';
export { MATH_CONSTANTS } from './math/index.js';
import * as index$2 from './string/index.js';
import * as index$3 from './date/index.js';
export { DATE_FORMATS, MONTHS, WEEKDAYS } from './date/index.js';
export { add, divide, modulo, multiply, power, sqrt, subtract } from './math/basic.js';
export { average, factorial, fibonacci, max, median, min, standardDeviation } from './math/advanced.js';
export { capitalize, capitalizeWords, pad, toCamelCase, toKebabCase, toPascalCase, toSnakeCase, trim, truncate } from './string/format.js';
export { isAlpha, isAlphanumeric, isNumeric, isValidEmail, isValidIdCard, isValidPhone, isValidUrl, validatePassword } from './string/validate.js';
export { addDays, addMonths, formatDate, getDateRange, getDaysInMonth, getRelativeTime, isLeapYear, isThisWeek, isToday, isYesterday } from './date/format.js';

const VERSION = "1.0.0";
const LIBRARY_INFO = {
  name: "@ldesign/typescript-utils-example",
  version: VERSION,
  description: "TypeScript \u5DE5\u5177\u5E93\u793A\u4F8B - \u5C55\u793A\u5982\u4F55\u4F7F\u7528 @ldesign/builder \u6253\u5305 TypeScript \u5DE5\u5177\u5E93",
  author: "LDesign Team",
  license: "MIT",
  repository: "https://github.com/ldesign/ldesign",
  homepage: "https://ldesign.dev"
};
function getLibraryInfo() {
  return LIBRARY_INFO;
}
function printLibraryInfo() {
  console.log(`
\u256D\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u256E
\u2502                    TypeScript Utils Example                 \u2502
\u251C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524
\u2502 Name:        ${LIBRARY_INFO.name.padEnd(43)} \u2502
\u2502 Version:     ${LIBRARY_INFO.version.padEnd(43)} \u2502
\u2502 Description: ${LIBRARY_INFO.description.slice(0, 43).padEnd(43)} \u2502
\u2502 Author:      ${LIBRARY_INFO.author.padEnd(43)} \u2502
\u2502 License:     ${LIBRARY_INFO.license.padEnd(43)} \u2502
\u2570\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u256F
  `);
}
var index = {
  // 模块
  math: index$1,
  string: index$2,
  date: index$3,
  // 信息
  VERSION,
  LIBRARY_INFO,
  getLibraryInfo,
  printLibraryInfo
};

export { LIBRARY_INFO, VERSION, index$3 as date, index as default, getLibraryInfo, index$1 as math, printLibraryInfo, index$2 as string };
//# sourceMappingURL=index.js.map
