/**
 * 日期格式化工具函数
 * 提供各种日期格式化和处理功能
 */
/**
 * 格式化日期为指定格式
 * @param date 日期对象或时间戳
 * @param format 格式字符串
 * @returns 格式化后的日期字符串
 * @example
 * ```typescript
 * import { formatDate } from '@ldesign/typescript-utils-example/date'
 *
 * const result = formatDate(new Date(), 'YYYY-MM-DD') // '2023-12-25'
 * const result2 = formatDate(new Date(), 'YYYY年MM月DD日') // '2023年12月25日'
 * ```
 */
export declare function formatDate(date: Date | number, format: string): string;
/**
 * 获取相对时间描述
 * @param date 日期对象或时间戳
 * @param baseDate 基准日期（默认为当前时间）
 * @returns 相对时间描述
 * @example
 * ```typescript
 * import { getRelativeTime } from '@ldesign/typescript-utils-example/date'
 *
 * const result = getRelativeTime(new Date(Date.now() - 60000)) // '1分钟前'
 * ```
 */
export declare function getRelativeTime(date: Date | number, baseDate?: Date): string;
/**
 * 判断是否为今天
 * @param date 日期对象或时间戳
 * @returns 是否为今天
 * @example
 * ```typescript
 * import { isToday } from '@ldesign/typescript-utils-example/date'
 *
 * const result = isToday(new Date()) // true
 * ```
 */
export declare function isToday(date: Date | number): boolean;
/**
 * 判断是否为昨天
 * @param date 日期对象或时间戳
 * @returns 是否为昨天
 * @example
 * ```typescript
 * import { isYesterday } from '@ldesign/typescript-utils-example/date'
 *
 * const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
 * const result = isYesterday(yesterday) // true
 * ```
 */
export declare function isYesterday(date: Date | number): boolean;
/**
 * 判断是否为本周
 * @param date 日期对象或时间戳
 * @returns 是否为本周
 * @example
 * ```typescript
 * import { isThisWeek } from '@ldesign/typescript-utils-example/date'
 *
 * const result = isThisWeek(new Date()) // true
 * ```
 */
export declare function isThisWeek(date: Date | number): boolean;
/**
 * 获取月份的天数
 * @param year 年份
 * @param month 月份（1-12）
 * @returns 该月的天数
 * @example
 * ```typescript
 * import { getDaysInMonth } from '@ldesign/typescript-utils-example/date'
 *
 * const result = getDaysInMonth(2023, 2) // 28
 * const result2 = getDaysInMonth(2024, 2) // 29 (闰年)
 * ```
 */
export declare function getDaysInMonth(year: number, month: number): number;
/**
 * 判断是否为闰年
 * @param year 年份
 * @returns 是否为闰年
 * @example
 * ```typescript
 * import { isLeapYear } from '@ldesign/typescript-utils-example/date'
 *
 * const result = isLeapYear(2024) // true
 * const result2 = isLeapYear(2023) // false
 * ```
 */
export declare function isLeapYear(year: number): boolean;
/**
 * 获取日期范围内的所有日期
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @returns 日期数组
 * @example
 * ```typescript
 * import { getDateRange } from '@ldesign/typescript-utils-example/date'
 *
 * const start = new Date('2023-12-01')
 * const end = new Date('2023-12-03')
 * const result = getDateRange(start, end) // [Date('2023-12-01'), Date('2023-12-02'), Date('2023-12-03')]
 * ```
 */
export declare function getDateRange(startDate: Date, endDate: Date): Date[];
/**
 * 添加指定天数到日期
 * @param date 原始日期
 * @param days 要添加的天数
 * @returns 新的日期对象
 * @example
 * ```typescript
 * import { addDays } from '@ldesign/typescript-utils-example/date'
 *
 * const result = addDays(new Date('2023-12-01'), 7) // Date('2023-12-08')
 * ```
 */
export declare function addDays(date: Date, days: number): Date;
/**
 * 添加指定月数到日期
 * @param date 原始日期
 * @param months 要添加的月数
 * @returns 新的日期对象
 * @example
 * ```typescript
 * import { addMonths } from '@ldesign/typescript-utils-example/date'
 *
 * const result = addMonths(new Date('2023-12-01'), 2) // Date('2024-02-01')
 * ```
 */
export declare function addMonths(date: Date, months: number): Date;
