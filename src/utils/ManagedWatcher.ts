/**
 * 文件监视器包装器
 * 
 * 包装 chokidar 文件监视器,提供自动资源清理功能:
 * - 自动跟踪所有事件监听器
 * - 自动清理监听器和监视器
 * - 防止内存泄漏
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import type { FSWatcher, WatchOptions } from 'chokidar'
import type { Disposable } from './ResourceManager'

/**
 * 文件监视器包装器类
 */
export class ManagedWatcher implements Disposable {
  /** chokidar 监视器实例 */
  private watcher: FSWatcher
  
  /** 事件监听器映射 */
  private listeners: Map<string, Function[]> = new Map()
  
  /** 是否已释放 */
  private disposed: boolean = false

  /**
   * 创建文件监视器
   * 
   * @param paths - 要监视的路径或路径数组
   * @param options - chokidar 监视选项
   */
  constructor(paths: string | string[], options?: WatchOptions) {
    const chokidar = require('chokidar')
    this.watcher = chokidar.watch(paths, {
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 50
      },
      ...options
    })
  }

  /**
   * 添加事件监听器
   * 
   * @param event - 事件名称
   * @param listener - 监听器函数
   * @returns this (支持链式调用)
   */
  on(event: string, listener: Function): this {
    if (this.disposed) {
      throw new Error('ManagedWatcher 已被释放,无法添加监听器')
    }

    // 记录监听器
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(listener)

    // 添加到 watcher
    this.watcher.on(event, listener as any)

    return this
  }

  /**
   * 添加一次性事件监听器
   * 
   * @param event - 事件名称
   * @param listener - 监听器函数
   * @returns this (支持链式调用)
   */
  once(event: string, listener: Function): this {
    if (this.disposed) {
      throw new Error('ManagedWatcher 已被释放,无法添加监听器')
    }

    // 包装监听器,在执行后自动移除
    const wrappedListener = (...args: any[]) => {
      this.removeListener(event, wrappedListener)
      listener(...args)
    }

    return this.on(event, wrappedListener)
  }

  /**
   * 移除事件监听器
   * 
   * @param event - 事件名称
   * @param listener - 监听器函数
   * @returns this (支持链式调用)
   */
  removeListener(event: string, listener: Function): this {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      const index = eventListeners.indexOf(listener)
      if (index !== -1) {
        eventListeners.splice(index, 1)
      }
      
      // 如果该事件没有监听器了,删除映射
      if (eventListeners.length === 0) {
        this.listeners.delete(event)
      }
    }

    // 从 watcher 移除
    this.watcher.removeListener(event, listener as any)

    return this
  }

  /**
   * 移除所有事件监听器
   * 
   * @param event - 可选的事件名称,如果不提供则移除所有事件的监听器
   * @returns this (支持链式调用)
   */
  removeAllListeners(event?: string): this {
    if (event) {
      // 移除特定事件的所有监听器
      const eventListeners = this.listeners.get(event)
      if (eventListeners) {
        for (const listener of eventListeners) {
          this.watcher.removeListener(event, listener as any)
        }
        this.listeners.delete(event)
      }
    } else {
      // 移除所有事件的监听器
      for (const [eventName, eventListeners] of this.listeners) {
        for (const listener of eventListeners) {
          this.watcher.removeListener(eventName, listener as any)
        }
      }
      this.listeners.clear()
    }

    return this
  }

  /**
   * 获取事件监听器数量
   * 
   * @param event - 可选的事件名称
   * @returns 监听器数量
   */
  listenerCount(event?: string): number {
    if (event) {
      return this.listeners.get(event)?.length || 0
    } else {
      let count = 0
      for (const eventListeners of this.listeners.values()) {
        count += eventListeners.length
      }
      return count
    }
  }

  /**
   * 获取所有事件名称
   * 
   * @returns 事件名称数组
   */
  eventNames(): string[] {
    return Array.from(this.listeners.keys())
  }

  /**
   * 添加监视路径
   * 
   * @param paths - 要添加的路径或路径数组
   */
  add(paths: string | string[]): void {
    if (this.disposed) {
      throw new Error('ManagedWatcher 已被释放,无法添加路径')
    }
    this.watcher.add(paths)
  }

  /**
   * 移除监视路径
   * 
   * @param paths - 要移除的路径或路径数组
   */
  unwatch(paths: string | string[]): void {
    if (this.disposed) {
      throw new Error('ManagedWatcher 已被释放,无法移除路径')
    }
    this.watcher.unwatch(paths)
  }

  /**
   * 获取所有监视的路径
   * 
   * @returns 监视的路径数组
   */
  getWatched(): Record<string, string[]> {
    return this.watcher.getWatched()
  }

  /**
   * 释放资源
   * 
   * 清理所有监听器并关闭监视器
   */
  async dispose(): Promise<void> {
    if (this.disposed) {
      return
    }

    this.disposed = true

    try {
      // 1. 移除所有监听器
      this.removeAllListeners()

      // 2. 关闭监视器
      await this.watcher.close()
    } catch (error) {
      console.error('[ManagedWatcher] 释放资源失败:', error)
      throw error
    }
  }

  /**
   * 检查是否已释放
   */
  isDisposed(): boolean {
    return this.disposed
  }

  /**
   * 获取底层 chokidar 监视器实例
   * 
   * 注意: 直接操作底层实例可能导致资源泄漏,请谨慎使用
   */
  getUnderlyingWatcher(): FSWatcher {
    return this.watcher
  }
}

/**
 * 创建文件监视器
 * 
 * @param paths - 要监视的路径或路径数组
 * @param options - chokidar 监视选项
 * @returns 文件监视器实例
 * 
 * @example
 * ```typescript
 * const watcher = createManagedWatcher('src/**\/*.ts', {
 *   ignoreInitial: true
 * })
 * 
 * watcher.on('change', (path) => {
 *   console.log('文件变化:', path)
 * })
 * 
 * // 使用完毕后释放
 * await watcher.dispose()
 * ```
 */
export function createManagedWatcher(
  paths: string | string[],
  options?: WatchOptions
): ManagedWatcher {
  return new ManagedWatcher(paths, options)
}

