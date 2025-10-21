/**
 * 日志系统工具
 *
 * TODO: 后期可以移到 @ldesign/kit 中统一管理
 */
import chalk from 'chalk';
/**
 * 日志级别枚举
 */
export var LogLevelEnum;
(function (LogLevelEnum) {
    LogLevelEnum[LogLevelEnum["SILENT"] = 0] = "SILENT";
    LogLevelEnum[LogLevelEnum["ERROR"] = 1] = "ERROR";
    LogLevelEnum[LogLevelEnum["WARN"] = 2] = "WARN";
    LogLevelEnum[LogLevelEnum["INFO"] = 3] = "INFO";
    LogLevelEnum[LogLevelEnum["DEBUG"] = 4] = "DEBUG";
    LogLevelEnum[LogLevelEnum["VERBOSE"] = 5] = "VERBOSE";
})(LogLevelEnum || (LogLevelEnum = {}));
/**
 * 日志级别映射
 */
const LOG_LEVEL_MAP = {
    silent: LogLevelEnum.SILENT,
    error: LogLevelEnum.ERROR,
    warn: LogLevelEnum.WARN,
    info: LogLevelEnum.INFO,
    debug: LogLevelEnum.DEBUG,
    verbose: LogLevelEnum.VERBOSE
};
/**
 * 日志记录器类
 */
export class Logger {
    constructor(options = {}) {
        this.level = LOG_LEVEL_MAP[options.level || 'info'];
        this.colors = options.colors ?? true;
        this.timestamp = options.timestamp ?? false;
        this.prefix = options.prefix || '@ldesign/builder';
        this.silent = options.silent ?? false;
    }
    /**
     * 设置日志级别
     */
    setLevel(level) {
        this.level = LOG_LEVEL_MAP[level];
    }
    /**
     * 获取当前日志级别
     */
    getLevel() {
        const entries = Object.entries(LOG_LEVEL_MAP);
        const entry = entries.find(([, value]) => value === this.level);
        return entry?.[0] || 'info';
    }
    /**
     * 设置静默模式
     */
    setSilent(silent) {
        this.silent = silent;
    }
    /**
     * 错误日志
     */
    error(message, ...args) {
        if (this.shouldLog(LogLevelEnum.ERROR)) {
            this.log('ERROR', message, chalk.red, ...args);
        }
    }
    /**
     * 警告日志
     */
    warn(message, ...args) {
        if (this.shouldLog(LogLevelEnum.WARN)) {
            this.log('WARN', message, chalk.yellow, ...args);
        }
    }
    /**
     * 信息日志
     */
    info(message, ...args) {
        if (this.shouldLog(LogLevelEnum.INFO)) {
            this.log('INFO', message, chalk.blue, ...args);
        }
    }
    /**
     * 调试日志
     */
    debug(message, ...args) {
        if (this.shouldLog(LogLevelEnum.DEBUG)) {
            this.log('DEBUG', message, chalk.gray, ...args);
        }
    }
    /**
     * 详细日志
     */
    verbose(message, ...args) {
        if (this.shouldLog(LogLevelEnum.VERBOSE)) {
            this.log('VERBOSE', message, chalk.gray, ...args);
        }
    }
    /**
     * 成功日志
     */
    success(message, ...args) {
        if (this.shouldLog(LogLevelEnum.INFO)) {
            this.log('SUCCESS', message, chalk.green, ...args);
        }
    }
    /**
     * 开始日志（带缩进）
     */
    start(message, ...args) {
        if (this.shouldLog(LogLevelEnum.INFO)) {
            this.log('START', `▶ ${message}`, chalk.cyan, ...args);
        }
    }
    /**
     * 完成日志（带缩进）
     */
    complete(message, ...args) {
        if (this.shouldLog(LogLevelEnum.INFO)) {
            this.log('COMPLETE', `✓ ${message}`, chalk.green, ...args);
        }
    }
    /**
     * 失败日志（带缩进）
     */
    fail(message, ...args) {
        if (this.shouldLog(LogLevelEnum.ERROR)) {
            this.log('FAIL', `✗ ${message}`, chalk.red, ...args);
        }
    }
    /**
     * 进度日志
     */
    progress(current, total, message) {
        if (this.shouldLog(LogLevelEnum.INFO)) {
            const percent = Math.round((current / total) * 100);
            const progressBar = this.createProgressBar(percent);
            const progressMessage = message ? ` ${message}` : '';
            this.log('PROGRESS', `${progressBar} ${percent}%${progressMessage}`, chalk.cyan);
        }
    }
    /**
     * 表格日志
     */
    table(data) {
        if (this.shouldLog(LogLevelEnum.INFO) && data.length > 0) {
            console.table(data);
        }
    }
    /**
     * 分组开始
     */
    group(label) {
        if (this.shouldLog(LogLevelEnum.INFO)) {
            console.group(this.formatMessage('GROUP', label, chalk.cyan));
        }
    }
    /**
     * 分组结束
     */
    groupEnd() {
        if (this.shouldLog(LogLevelEnum.INFO)) {
            console.groupEnd();
        }
    }
    /**
     * 清屏
     */
    clear() {
        if (!this.silent) {
            console.clear();
        }
    }
    /**
     * 换行
     */
    newLine() {
        if (this.shouldLog(LogLevelEnum.INFO)) {
            console.log();
        }
    }
    /**
     * 分隔线
     */
    divider(char = '-', length = 50) {
        if (this.shouldLog(LogLevelEnum.INFO)) {
            console.log(chalk.gray(char.repeat(length)));
        }
    }
    /**
     * 创建子日志记录器
     */
    child(prefix, options = {}) {
        return new Logger({
            level: this.getLevel(),
            colors: this.colors,
            timestamp: this.timestamp,
            prefix: `${this.prefix}:${prefix}`,
            silent: this.silent,
            ...options
        });
    }
    /**
     * 判断是否应该记录日志
     */
    shouldLog(level) {
        return !this.silent && this.level >= level;
    }
    /**
     * 记录日志
     */
    log(type, message, colorFn, ...args) {
        const formattedMessage = this.formatMessage(type, message, colorFn);
        console.log(formattedMessage, ...args);
    }
    /**
     * 格式化消息
     */
    formatMessage(type, message, colorFn) {
        let formatted = '';
        // 添加时间戳
        if (this.timestamp) {
            const timestamp = new Date().toISOString();
            formatted += chalk.gray(`[${timestamp}] `);
        }
        // 添加前缀
        if (this.prefix) {
            formatted += chalk.gray(`[${this.prefix}] `);
        }
        // 添加类型
        if (this.colors) {
            formatted += colorFn(`[${type}] `);
        }
        else {
            formatted += `[${type}] `;
        }
        // 添加消息
        if (this.colors) {
            formatted += colorFn(message);
        }
        else {
            formatted += message;
        }
        return formatted;
    }
    /**
     * 创建进度条
     */
    createProgressBar(percent, width = 20) {
        const filled = Math.round((percent / 100) * width);
        const empty = width - filled;
        const bar = '█'.repeat(filled) + '░'.repeat(empty);
        return this.colors ? chalk.cyan(bar) : bar;
    }
}
/**
 * 默认日志记录器实例
 */
export const logger = new Logger();
/**
 * 创建日志记录器
 */
export function createLogger(options = {}) {
    return new Logger(options);
}
/**
 * 设置全局日志级别
 */
export function setLogLevel(level) {
    logger.setLevel(level);
}
/**
 * 设置全局静默模式
 */
export function setSilent(silent) {
    logger.setSilent(silent);
}
//# sourceMappingURL=logger.js.map