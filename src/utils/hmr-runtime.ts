/**
 * HMR (Hot Module Replacement) 运行时
 * 提供热模块替换支持
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import { EventEmitter } from 'events'
import type { Logger } from './logger'

/**
 * HMR 更新事件
 */
export interface HMRUpdate {
  type: 'update' | 'full-reload'
  path: string
  timestamp: number
}

/**
 * HMR 运行时
 */
export class HMRRuntime extends EventEmitter {
  private modules = new Map<string, any>()
  private acceptCallbacks = new Map<string, Function[]>()
  private logger: Logger

  constructor(logger?: Logger) {
    super()
    this.logger = logger || new (require('./logger').Logger)()
  }

  /**
   * 注册模块
   */
  registerModule(id: string, module: any): void {
    this.modules.set(id, module)
  }

  /**
   * 接受热更新
   */
  accept(id: string, callback: Function): void {
    if (!this.acceptCallbacks.has(id)) {
      this.acceptCallbacks.set(id, [])
    }
    this.acceptCallbacks.get(id)!.push(callback)
  }

  /**
   * 应用更新
   */
  async applyUpdate(update: HMRUpdate): Promise<void> {
    const { path: modulePath, type } = update

    if (type === 'full-reload') {
      this.emit('full-reload')
      return
    }

    // 获取接受回调
    const callbacks = this.acceptCallbacks.get(modulePath)
    
    if (!callbacks || callbacks.length === 0) {
      // 没有回调，需要完全重载
      this.emit('full-reload')
      return
    }

    try {
      // 执行所有回调
      for (const callback of callbacks) {
        await callback()
      }

      this.emit('updated', { path: modulePath })
      this.logger.debug(`模块已热更新: ${modulePath}`)
    } catch (error) {
      this.logger.error(`热更新失败: ${(error as Error).message}`)
      this.emit('full-reload')
    }
  }

  /**
   * 清理
   */
  dispose(): void {
    this.modules.clear()
    this.acceptCallbacks.clear()
    this.removeAllListeners()
  }
}

/**
 * 创建 HMR 运行时
 */
export function createHMRRuntime(logger?: Logger): HMRRuntime {
  return new HMRRuntime(logger)
}

