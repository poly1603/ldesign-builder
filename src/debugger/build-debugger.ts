/**
 * 构建调试器
 * 
 * 提供断点、步进调试、变量查看等调试功能
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import { EventEmitter } from 'events'
import { Logger } from '../utils/logger'

/**
 * 调试器状态
 */
export enum DebuggerState {
  IDLE = 'idle',
  RUNNING = 'running',
  PAUSED = 'paused',
  STEPPING = 'stepping',
  STOPPED = 'stopped'
}

/**
 * 断点
 */
export interface Breakpoint {
  id: string
  file?: string
  phase?: string
  condition?: (context: any) => boolean
  enabled: boolean
  hitCount: number
}

/**
 * 调试上下文
 */
export interface DebugContext {
  phase: string
  file?: string
  variables: Record<string, any>
  stack: string[]
  timestamp: number
}

/**
 * 调试器选项
 */
export interface BuildDebuggerOptions {
  /** 是否启用 */
  enabled?: boolean
  /** 是否暂停在第一个断点 */
  pauseOnStart?: boolean
  /** 是否记录所有阶段 */
  logAllPhases?: boolean
  logger?: Logger
}

/**
 * 构建调试器
 */
export class BuildDebugger extends EventEmitter {
  private state: DebuggerState = DebuggerState.IDLE
  private breakpoints: Map<string, Breakpoint> = new Map()
  private watchedVariables: Set<string> = new Set()
  private contextHistory: DebugContext[] = []
  private currentContext?: DebugContext
  private options: Required<Omit<BuildDebuggerOptions, 'logger'>> & { logger: Logger }

  constructor(options: BuildDebuggerOptions = {}) {
    super()

    this.options = {
      enabled: options.enabled !== false,
      pauseOnStart: options.pauseOnStart || false,
      logAllPhases: options.logAllPhases || false,
      logger: options.logger || new Logger({ prefix: 'Debugger' })
    }
  }

  /**
   * 添加断点
   */
  addBreakpoint(breakpoint: Omit<Breakpoint, 'id' | 'hitCount'>): string {
    const id = `bp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    this.breakpoints.set(id, {
      id,
      ...breakpoint,
      enabled: breakpoint.enabled !== false,
      hitCount: 0
    })

    this.options.logger.debug(`添加断点: ${id}`)
    this.emit('breakpoint:added', id)

    return id
  }

  /**
   * 移除断点
   */
  removeBreakpoint(id: string): boolean {
    const removed = this.breakpoints.delete(id)
    if (removed) {
      this.emit('breakpoint:removed', id)
    }
    return removed
  }

  /**
   * 启用/禁用断点
   */
  toggleBreakpoint(id: string, enabled?: boolean): boolean {
    const bp = this.breakpoints.get(id)
    if (!bp) {
      return false
    }

    bp.enabled = enabled !== undefined ? enabled : !bp.enabled
    this.emit('breakpoint:toggled', { id, enabled: bp.enabled })
    return true
  }

  /**
   * 添加监视变量
   */
  watch(variable: string): void {
    this.watchedVariables.add(variable)
    this.emit('watch:added', variable)
  }

  /**
   * 移除监视变量
   */
  unwatch(variable: string): boolean {
    const removed = this.watchedVariables.delete(variable)
    if (removed) {
      this.emit('watch:removed', variable)
    }
    return removed
  }

  /**
   * 进入构建阶段（检查断点）
   */
  async enterPhase(phase: string, context: Record<string, any> = {}): Promise<void> {
    if (!this.options.enabled) {
      return
    }

    this.currentContext = {
      phase,
      file: context.file,
      variables: { ...context },
      stack: this.buildStack(phase),
      timestamp: Date.now()
    }

    this.contextHistory.push(this.currentContext)

    // 记录阶段
    if (this.options.logAllPhases) {
      this.options.logger.debug(`进入阶段: ${phase}`)
    }

    this.emit('phase:enter', this.currentContext)

    // 检查断点
    await this.checkBreakpoints(this.currentContext)
  }

  /**
   * 检查断点
   */
  private async checkBreakpoints(context: DebugContext): Promise<void> {
    for (const [id, bp] of this.breakpoints) {
      if (!bp.enabled) {
        continue
      }

      // 检查阶段匹配
      if (bp.phase && bp.phase !== context.phase) {
        continue
      }

      // 检查文件匹配
      if (bp.file && bp.file !== context.file) {
        continue
      }

      // 检查条件
      if (bp.condition && !bp.condition(context)) {
        continue
      }

      // 命中断点
      bp.hitCount++
      this.state = DebuggerState.PAUSED

      this.options.logger.warn(`🔴 命中断点: ${id} (${bp.phase || bp.file})`)
      this.emit('breakpoint:hit', { id, context })

      // 等待继续
      await this.waitForContinue()
    }
  }

  /**
   * 等待继续执行
   */
  private waitForContinue(): Promise<void> {
    return new Promise(resolve => {
      const listener = () => {
        this.off('debugger:continue', listener)
        resolve()
      }
      this.on('debugger:continue', listener)
    })
  }

  /**
   * 继续执行
   */
  continue(): void {
    if (this.state === DebuggerState.PAUSED) {
      this.state = DebuggerState.RUNNING
      this.emit('debugger:continue')
    }
  }

  /**
   * 步进（执行下一个阶段）
   */
  stepOver(): void {
    if (this.state === DebuggerState.PAUSED) {
      this.state = DebuggerState.STEPPING
      this.emit('debugger:continue')

      // 下一个阶段自动暂停
      this.once('phase:enter', () => {
        this.state = DebuggerState.PAUSED
      })
    }
  }

  /**
   * 获取当前上下文
   */
  getContext(): DebugContext | undefined {
    return this.currentContext
  }

  /**
   * 获取变量值
   */
  getVariable(name: string): any {
    return this.currentContext?.variables[name]
  }

  /**
   * 获取所有监视的变量
   */
  getWatchedVariables(): Record<string, any> {
    const watched: Record<string, any> = {}

    for (const varName of this.watchedVariables) {
      watched[varName] = this.getVariable(varName)
    }

    return watched
  }

  /**
   * 获取调用栈
   */
  getStack(): string[] {
    return this.currentContext?.stack || []
  }

  /**
   * 获取断点列表
   */
  getBreakpoints(): Breakpoint[] {
    return Array.from(this.breakpoints.values())
  }

  /**
   * 获取上下文历史
   */
  getHistory(): DebugContext[] {
    return [...this.contextHistory]
  }

  /**
   * 清除历史
   */
  clearHistory(): void {
    this.contextHistory = []
  }

  /**
   * 停止调试
   */
  stop(): void {
    this.state = DebuggerState.STOPPED
    this.emit('debugger:stopped')
  }

  /**
   * 构建调用栈
   */
  private buildStack(phase: string): string[] {
    const stack = this.contextHistory
      .map(ctx => ctx.phase)
      .slice(-10) // 最近 10 个

    stack.push(phase)
    return stack
  }

  /**
   * 获取状态
   */
  getState(): DebuggerState {
    return this.state
  }
}

/**
 * 创建构建调试器
 */
export function createBuildDebugger(options?: BuildDebuggerOptions): BuildDebugger {
  return new BuildDebugger(options)
}


