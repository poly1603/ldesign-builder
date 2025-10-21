/*!
 * ********************************************
 * @ldesign/typescript-utils-example v1.0.0 *
 * Built with rollup                        *
 * Build time: 2024-09-29 15:03:11          *
 * Build mode: production                   *
 * Minified: No                             *
 * ********************************************
 */
export { addDays, addMonths, formatDate, getDateRange, getDaysInMonth, getRelativeTime, isLeapYear, isThisWeek, isToday, isYesterday } from './format.js';

const DATE_FORMATS = {
  /** 标准日期格式 YYYY-MM-DD */
  DATE: "YYYY-MM-DD",
  /** 标准时间格式 HH:mm:ss */
  TIME: "HH:mm:ss",
  /** 标准日期时间格式 YYYY-MM-DD HH:mm:ss */
  DATETIME: "YYYY-MM-DD HH:mm:ss",
  /** 中文日期格式 YYYY年MM月DD日 */
  DATE_CN: "YYYY\u5E74MM\u6708DD\u65E5",
  /** 中文日期时间格式 YYYY年MM月DD日 HH:mm:ss */
  DATETIME_CN: "YYYY\u5E74MM\u6708DD\u65E5 HH:mm:ss",
  /** 短日期格式 MM/DD */
  SHORT_DATE: "MM/DD",
  /** 月份格式 YYYY-MM */
  MONTH: "YYYY-MM",
  /** 年份格式 YYYY */
  YEAR: "YYYY"
};
const WEEKDAYS = {
  /** 中文星期 */
  CN: ["\u65E5", "\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D"],
  /** 英文星期缩写 */
  EN_SHORT: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  /** 英文星期全称 */
  EN_FULL: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
};
const MONTHS = {
  /** 中文月份 */
  CN: ["\u4E00\u6708", "\u4E8C\u6708", "\u4E09\u6708", "\u56DB\u6708", "\u4E94\u6708", "\u516D\u6708", "\u4E03\u6708", "\u516B\u6708", "\u4E5D\u6708", "\u5341\u6708", "\u5341\u4E00\u6708", "\u5341\u4E8C\u6708"],
  /** 英文月份缩写 */
  EN_SHORT: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  /** 英文月份全称 */
  EN_FULL: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
};

export { DATE_FORMATS, MONTHS, WEEKDAYS };
//# sourceMappingURL=index.js.map
