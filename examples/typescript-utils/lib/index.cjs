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

Object.defineProperty(exports, '__esModule', { value: true });

var index$1 = require('./math/index.cjs');
var index$2 = require('./string/index.cjs');
var index$3 = require('./date/index.cjs');
var basic = require('./math/basic.cjs');
var advanced = require('./math/advanced.cjs');
var format = require('./string/format.cjs');
var validate = require('./string/validate.cjs');
var format$1 = require('./date/format.cjs');

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

exports.MATH_CONSTANTS = index$1.MATH_CONSTANTS;
exports.math = index$1;
exports.string = index$2;
exports.DATE_FORMATS = index$3.DATE_FORMATS;
exports.MONTHS = index$3.MONTHS;
exports.WEEKDAYS = index$3.WEEKDAYS;
exports.date = index$3;
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
exports.capitalize = format.capitalize;
exports.capitalizeWords = format.capitalizeWords;
exports.pad = format.pad;
exports.toCamelCase = format.toCamelCase;
exports.toKebabCase = format.toKebabCase;
exports.toPascalCase = format.toPascalCase;
exports.toSnakeCase = format.toSnakeCase;
exports.trim = format.trim;
exports.truncate = format.truncate;
exports.isAlpha = validate.isAlpha;
exports.isAlphanumeric = validate.isAlphanumeric;
exports.isNumeric = validate.isNumeric;
exports.isValidEmail = validate.isValidEmail;
exports.isValidIdCard = validate.isValidIdCard;
exports.isValidPhone = validate.isValidPhone;
exports.isValidUrl = validate.isValidUrl;
exports.validatePassword = validate.validatePassword;
exports.addDays = format$1.addDays;
exports.addMonths = format$1.addMonths;
exports.formatDate = format$1.formatDate;
exports.getDateRange = format$1.getDateRange;
exports.getDaysInMonth = format$1.getDaysInMonth;
exports.getRelativeTime = format$1.getRelativeTime;
exports.isLeapYear = format$1.isLeapYear;
exports.isThisWeek = format$1.isThisWeek;
exports.isToday = format$1.isToday;
exports.isYesterday = format$1.isYesterday;
exports.LIBRARY_INFO = LIBRARY_INFO;
exports.VERSION = VERSION;
exports.default = index;
exports.getLibraryInfo = getLibraryInfo;
exports.printLibraryInfo = printLibraryInfo;
//# sourceMappingURL=index.cjs.map
