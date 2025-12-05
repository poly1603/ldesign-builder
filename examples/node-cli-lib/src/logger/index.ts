/**
 * 日志工具
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent'

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
}

export class Logger {
  private level: LogLevel = 'info'

  setLevel(level: LogLevel): void {
    this.level = level
  }

  debug(...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.log(COLORS.gray + '[DEBUG]', ...args, COLORS.reset)
    }
  }

  info(...args: any[]): void {
    if (this.shouldLog('info')) {
      console.log(COLORS.blue + '[INFO]', ...args, COLORS.reset)
    }
  }

  success(...args: any[]): void {
    if (this.shouldLog('info')) {
      console.log(COLORS.green + '[SUCCESS]', ...args, COLORS.reset)
    }
  }

  warn(...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(COLORS.yellow + '[WARN]', ...args, COLORS.reset)
    }
  }

  error(...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(COLORS.red + '[ERROR]', ...args, COLORS.reset)
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'silent']
    return levels.indexOf(level) >= levels.indexOf(this.level)
  }
}

export const logger = new Logger()
