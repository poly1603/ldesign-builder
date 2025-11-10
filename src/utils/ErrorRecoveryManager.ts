/**
 * 错误恢复管理器 (P1-3)
 * 
 * 提供智能错误恢复、自动重试和错误诊断功能
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import { Logger } from './logger'

/**
 * 错误类型
 */
export enum ErrorType {
  NETWORK = 'network',
  FILE_SYSTEM = 'file_system',
  COMPILATION = 'compilation',
  CONFIGURATION = 'configuration',
  DEPENDENCY = 'dependency',
  TIMEOUT = 'timeout',
  MEMORY = 'memory',
  UNKNOWN = 'unknown'
}

/**
 * 错误严重程度
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * 恢复策略
 */
export enum RecoveryStrategy {
  RETRY = 'retry',
  SKIP = 'skip',
  FALLBACK = 'fallback',
  ABORT = 'abort'
}

/**
 * 错误信息
 */
export interface ErrorInfo {
  type: ErrorType
  severity: ErrorSeverity
  message: string
  stack?: string
  context?: Record<string, unknown>
  timestamp: number
}

/**
 * 恢复选项
 */
export interface RecoveryOptions {
  maxRetries?: number
  retryDelay?: number
  backoffMultiplier?: number
  timeout?: number
  fallbackValue?: unknown
  onRetry?: (attempt: number, error: Error) => void
  onSuccess?: (result: unknown) => void
  onFailure?: (error: Error) => void
}

/**
 * 错误诊断结果
 */
export interface DiagnosisResult {
  type: ErrorType
  severity: ErrorSeverity
  possibleCauses: string[]
  suggestions: string[]
  recoveryStrategy: RecoveryStrategy
  canRecover: boolean
}

/**
 * 错误恢复管理器
 */
export class ErrorRecoveryManager {
  private logger: Logger
  private errorHistory: ErrorInfo[] = []
  private maxHistorySize: number = 100

  constructor(logger?: Logger) {
    this.logger = logger || new Logger({ prefix: 'ErrorRecovery' })
  }

  /**
   * 诊断错误
   */
  diagnose(error: Error): DiagnosisResult {
    const errorMessage = error.message.toLowerCase()
    const errorStack = error.stack?.toLowerCase() || ''

    // 网络错误
    if (this.isNetworkError(errorMessage, errorStack)) {
      return {
        type: ErrorType.NETWORK,
        severity: ErrorSeverity.MEDIUM,
        possibleCauses: [
          '网络连接不稳定',
          'DNS 解析失败',
          '代理配置错误',
          '防火墙阻止'
        ],
        suggestions: [
          '检查网络连接',
          '尝试使用代理或 VPN',
          '检查防火墙设置',
          '稍后重试'
        ],
        recoveryStrategy: RecoveryStrategy.RETRY,
        canRecover: true
      }
    }

    // 文件系统错误
    if (this.isFileSystemError(errorMessage, errorStack)) {
      return {
        type: ErrorType.FILE_SYSTEM,
        severity: ErrorSeverity.HIGH,
        possibleCauses: [
          '文件不存在',
          '权限不足',
          '磁盘空间不足',
          '文件被占用'
        ],
        suggestions: [
          '检查文件路径是否正确',
          '检查文件权限',
          '清理磁盘空间',
          '关闭占用文件的程序'
        ],
        recoveryStrategy: RecoveryStrategy.SKIP,
        canRecover: false
      }
    }

    // 编译错误
    if (this.isCompilationError(errorMessage, errorStack)) {
      return {
        type: ErrorType.COMPILATION,
        severity: ErrorSeverity.HIGH,
        possibleCauses: [
          '语法错误',
          '类型错误',
          '导入路径错误',
          '配置错误'
        ],
        suggestions: [
          '检查代码语法',
          '检查类型定义',
          '检查导入路径',
          '检查 tsconfig.json'
        ],
        recoveryStrategy: RecoveryStrategy.ABORT,
        canRecover: false
      }
    }

    // 依赖错误
    if (this.isDependencyError(errorMessage, errorStack)) {
      return {
        type: ErrorType.DEPENDENCY,
        severity: ErrorSeverity.MEDIUM,
        possibleCauses: [
          '依赖未安装',
          '版本不兼容',
          'node_modules 损坏'
        ],
        suggestions: [
          '运行 npm install 或 pnpm install',
          '检查依赖版本',
          '删除 node_modules 重新安装',
          '清理缓存'
        ],
        recoveryStrategy: RecoveryStrategy.RETRY,
        canRecover: true
      }
    }

    // 超时错误
    if (this.isTimeoutError(errorMessage, errorStack)) {
      return {
        type: ErrorType.TIMEOUT,
        severity: ErrorSeverity.MEDIUM,
        possibleCauses: [
          '操作耗时过长',
          '资源不足',
          '死锁'
        ],
        suggestions: [
          '增加超时时间',
          '优化代码性能',
          '检查是否有死锁',
          '重试操作'
        ],
        recoveryStrategy: RecoveryStrategy.RETRY,
        canRecover: true
      }
    }

    // 内存错误
    if (this.isMemoryError(errorMessage, errorStack)) {
      return {
        type: ErrorType.MEMORY,
        severity: ErrorSeverity.CRITICAL,
        possibleCauses: [
          '内存不足',
          '内存泄漏',
          '数据量过大'
        ],
        suggestions: [
          '增加 Node.js 内存限制 (--max-old-space-size)',
          '检查内存泄漏',
          '分批处理数据',
          '优化内存使用'
        ],
        recoveryStrategy: RecoveryStrategy.FALLBACK,
        canRecover: true
      }
    }

    // 未知错误
    return {
      type: ErrorType.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      possibleCauses: ['未知原因'],
      suggestions: [
        '查看完整错误堆栈',
        '搜索错误信息',
        '联系技术支持'
      ],
      recoveryStrategy: RecoveryStrategy.RETRY,
      canRecover: false
    }
  }

  /**
   * 自动恢复
   */
  async recover<T>(
    fn: () => Promise<T>,
    options: RecoveryOptions = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      retryDelay = 1000,
      backoffMultiplier = 2,
      timeout = 30000,
      fallbackValue,
      onRetry,
      onSuccess,
      onFailure
    } = options

    let lastError: Error | null = null
    let currentDelay = retryDelay

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // 执行函数 (带超时)
        const result = await this.executeWithTimeout(fn, timeout)
        
        // 成功回调
        if (onSuccess) {
          onSuccess(result)
        }

        this.logger.success(`操作成功 (尝试 ${attempt}/${maxRetries})`)
        return result
      } catch (error) {
        lastError = error as Error
        
        // 诊断错误
        const diagnosis = this.diagnose(lastError)
        
        // 记录错误
        this.recordError({
          type: diagnosis.type,
          severity: diagnosis.severity,
          message: lastError.message,
          stack: lastError.stack,
          timestamp: Date.now()
        })

        // 判断是否可以恢复
        if (!diagnosis.canRecover || attempt === maxRetries) {
          this.logger.error(`操作失败,无法恢复 (尝试 ${attempt}/${maxRetries})`)
          this.logger.error(`错误类型: ${diagnosis.type}`)
          this.logger.error(`建议: ${diagnosis.suggestions.join(', ')}`)
          
          if (onFailure) {
            onFailure(lastError)
          }

          // 如果有 fallback 值,返回它
          if (fallbackValue !== undefined) {
            this.logger.info('使用 fallback 值')
            return fallbackValue as T
          }

          throw lastError
        }

        // 重试回调
        if (onRetry) {
          onRetry(attempt, lastError)
        }

        this.logger.warn(`操作失败,将在 ${currentDelay}ms 后重试 (尝试 ${attempt}/${maxRetries})`)
        this.logger.warn(`错误: ${lastError.message}`)

        // 等待后重试
        await this.delay(currentDelay)
        currentDelay *= backoffMultiplier
      }
    }

    throw lastError
  }

  /**
   * 带超时执行
   */
  private async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeout: number
  ): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('操作超时')), timeout)
      )
    ])
  }

  /**
   * 延迟
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 记录错误
   */
  private recordError(error: ErrorInfo): void {
    this.errorHistory.push(error)
    
    // 限制历史记录大小
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.shift()
    }
  }

  /**
   * 获取错误历史
   */
  getErrorHistory(): ErrorInfo[] {
    return [...this.errorHistory]
  }

  /**
   * 清空错误历史
   */
  clearErrorHistory(): void {
    this.errorHistory = []
  }

  // 错误类型判断方法
  private isNetworkError(message: string, stack: string): boolean {
    return /network|econnrefused|enotfound|etimedout|fetch|request/.test(message + stack)
  }

  private isFileSystemError(message: string, stack: string): boolean {
    return /enoent|eacces|eperm|eexist|eisdir|enotdir/.test(message + stack)
  }

  private isCompilationError(message: string, stack: string): boolean {
    return /syntax|parse|compile|typescript|babel/.test(message + stack)
  }

  private isDependencyError(message: string, stack: string): boolean {
    return /cannot find module|module not found|dependency/.test(message + stack)
  }

  private isTimeoutError(message: string, stack: string): boolean {
    return /timeout|timed out/.test(message + stack)
  }

  private isMemoryError(message: string, stack: string): boolean {
    return /out of memory|heap|allocation failed/.test(message + stack)
  }
}

/**
 * 创建错误恢复管理器
 */
export function createErrorRecoveryManager(logger?: Logger): ErrorRecoveryManager {
  return new ErrorRecoveryManager(logger)
}

