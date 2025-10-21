/**
 * 日期工具模块
 * 导出所有日期相关的工具函数
 */
import { formatDate, getRelativeTime, isToday, isYesterday, isThisWeek, getDaysInMonth, isLeapYear, getDateRange, addDays, addMonths } from './format';
export { formatDate, getRelativeTime, isToday, isYesterday, isThisWeek, getDaysInMonth, isLeapYear, getDateRange, addDays, addMonths };
/**
 * 日期工具类型定义
 */
export interface DateUtils {
    /** 格式化工具 */
    format: {
        formatDate: typeof formatDate;
        getRelativeTime: typeof getRelativeTime;
    };
    /** 判断工具 */
    check: {
        isToday: typeof isToday;
        isYesterday: typeof isYesterday;
        isThisWeek: typeof isThisWeek;
        isLeapYear: typeof isLeapYear;
    };
    /** 计算工具 */
    calculate: {
        getDaysInMonth: typeof getDaysInMonth;
        getDateRange: typeof getDateRange;
        addDays: typeof addDays;
        addMonths: typeof addMonths;
    };
}
/**
 * 常用日期格式常量
 */
export declare const DATE_FORMATS: {
    /** 标准日期格式 YYYY-MM-DD */
    readonly DATE: "YYYY-MM-DD";
    /** 标准时间格式 HH:mm:ss */
    readonly TIME: "HH:mm:ss";
    /** 标准日期时间格式 YYYY-MM-DD HH:mm:ss */
    readonly DATETIME: "YYYY-MM-DD HH:mm:ss";
    /** 中文日期格式 YYYY年MM月DD日 */
    readonly DATE_CN: "YYYY年MM月DD日";
    /** 中文日期时间格式 YYYY年MM月DD日 HH:mm:ss */
    readonly DATETIME_CN: "YYYY年MM月DD日 HH:mm:ss";
    /** 短日期格式 MM/DD */
    readonly SHORT_DATE: "MM/DD";
    /** 月份格式 YYYY-MM */
    readonly MONTH: "YYYY-MM";
    /** 年份格式 YYYY */
    readonly YEAR: "YYYY";
};
/**
 * 星期常量
 */
export declare const WEEKDAYS: {
    /** 中文星期 */
    readonly CN: readonly ["日", "一", "二", "三", "四", "五", "六"];
    /** 英文星期缩写 */
    readonly EN_SHORT: readonly ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    /** 英文星期全称 */
    readonly EN_FULL: readonly ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
};
/**
 * 月份常量
 */
export declare const MONTHS: {
    /** 中文月份 */
    readonly CN: readonly ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
    /** 英文月份缩写 */
    readonly EN_SHORT: readonly ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    /** 英文月份全称 */
    readonly EN_FULL: readonly ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
};
