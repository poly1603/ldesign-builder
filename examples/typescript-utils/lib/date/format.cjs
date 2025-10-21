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

function formatDate(date, format) {
  const d = typeof date === "number" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const seconds = d.getSeconds();
  const formatMap = {
    "YYYY": year.toString(),
    "YY": year.toString().slice(-2),
    "MM": month.toString().padStart(2, "0"),
    "M": month.toString(),
    "DD": day.toString().padStart(2, "0"),
    "D": day.toString(),
    "HH": hours.toString().padStart(2, "0"),
    "H": hours.toString(),
    "mm": minutes.toString().padStart(2, "0"),
    "m": minutes.toString(),
    "ss": seconds.toString().padStart(2, "0"),
    "s": seconds.toString()
  };
  let result = format;
  Object.entries(formatMap).forEach(([key, value]) => {
    result = result.replace(new RegExp(key, "g"), value);
  });
  return result;
}
function getRelativeTime(date, baseDate = /* @__PURE__ */ new Date()) {
  const targetDate = typeof date === "number" ? new Date(date) : date;
  const diffMs = baseDate.getTime() - targetDate.getTime();
  const diffSeconds = Math.floor(diffMs / 1e3);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);
  if (diffSeconds < 60) {
    return diffSeconds <= 0 ? "\u521A\u521A" : `${diffSeconds}\u79D2\u524D`;
  } else if (diffMinutes < 60) {
    return `${diffMinutes}\u5206\u949F\u524D`;
  } else if (diffHours < 24) {
    return `${diffHours}\u5C0F\u65F6\u524D`;
  } else if (diffDays < 30) {
    return `${diffDays}\u5929\u524D`;
  } else if (diffMonths < 12) {
    return `${diffMonths}\u4E2A\u6708\u524D`;
  } else {
    return `${diffYears}\u5E74\u524D`;
  }
}
function isToday(date) {
  const targetDate = typeof date === "number" ? new Date(date) : date;
  const today = /* @__PURE__ */ new Date();
  return targetDate.getFullYear() === today.getFullYear() && targetDate.getMonth() === today.getMonth() && targetDate.getDate() === today.getDate();
}
function isYesterday(date) {
  const targetDate = typeof date === "number" ? new Date(date) : date;
  const yesterday = /* @__PURE__ */ new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return targetDate.getFullYear() === yesterday.getFullYear() && targetDate.getMonth() === yesterday.getMonth() && targetDate.getDate() === yesterday.getDate();
}
function isThisWeek(date) {
  const targetDate = typeof date === "number" ? new Date(date) : date;
  const today = /* @__PURE__ */ new Date();
  const monday = new Date(today);
  const dayOfWeek = today.getDay() || 7;
  monday.setDate(today.getDate() - dayOfWeek + 1);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return targetDate >= monday && targetDate <= sunday;
}
function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}
function isLeapYear(year) {
  return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
}
function getDateRange(startDate, endDate) {
  const dates = [];
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
}
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
function addMonths(date, months) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

exports.addDays = addDays;
exports.addMonths = addMonths;
exports.formatDate = formatDate;
exports.getDateRange = getDateRange;
exports.getDaysInMonth = getDaysInMonth;
exports.getRelativeTime = getRelativeTime;
exports.isLeapYear = isLeapYear;
exports.isThisWeek = isThisWeek;
exports.isToday = isToday;
exports.isYesterday = isYesterday;
//# sourceMappingURL=format.cjs.map
