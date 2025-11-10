/**
 * 资源管理器
 * 
 * 统一管理和清理资源,防止内存泄漏:
 * - 事件监听器
 * - 文件监视器
 * - 定时器
 * - 缓存
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

/**
 * 可释放资源接口
 */
export interface Disposable {
  /** 释放资源 */
  dispose(): Promise<void> | void
}

/**
 * 资源管理器类
 */
export class ResourceManager implements Disposable {
  /** 已注册的资源 */
  private resources: Set<Disposable> = new Set()
  
  /** 是否已释放 */
  private disposed: boolean = false
  
  /** 清理回调函数 */
  private cleanupCallbacks: Array<() => Promise<void> | void> = []

  /**
   * 注册资源
   * 
   * @param resource - 可释放的资源
   */
  register(resource: Disposable): void {
    if (this.disposed) {
      throw new Error('ResourceManager 已被释放,无法注册新资源')
    }
    this.resources.add(resource)
  }

  /**
   * 注销资源
   * 
   * @param resource - 要注销的资源
   */
  unregister(resource: Disposable): void {
    this.resources.delete(resource)
  }

  /**
   * 注册清理回调
   * 
   * @param callback - 清理回调函数
   */
  registerCleanup(callback: () => Promise<void> | void): void {
    if (this.disposed) {
      throw new Error('ResourceManager 已被释放,无法注册清理回调')
    }
    this.cleanupCallbacks.push(callback)
  }

  /**
   * 释放所有资源
   * 
   * 按注册顺序依次释放资源,即使某个资源释放失败也会继续释放其他资源
   */
  async dispose(): Promise<void> {
    if (this.disposed) {
      return
    }

    this.disposed = true

    const errors: Error[] = []

    // 1. 执行清理回调
    for (const callback of this.cleanupCallbacks) {
      try {
        await callback()
      } catch (error) {
        errors.push(error as Error)
        console.error('[ResourceManager] 清理回调执行失败:', error)
      }
    }
    this.cleanupCallbacks = []

    // 2. 释放所有资源
    for (const resource of this.resources) {
      try {
        await resource.dispose()
      } catch (error) {
        errors.push(error as Error)
        console.error('[ResourceManager] 资源释放失败:', error)
      }
    }
    this.resources.clear()

    // 如果有错误,抛出第一个错误
    if (errors.length > 0) {
      console.error(`[ResourceManager] 共 ${errors.length} 个资源释放失败`)
      throw errors[0]
    }
  }

  /**
   * 检查是否已释放
   */
  isDisposed(): boolean {
    return this.disposed
  }

  /**
   * 获取已注册资源数量
   */
  getResourceCount(): number {
    return this.resources.size
  }

  /**
   * 获取清理回调数量
   */
  getCleanupCallbackCount(): number {
    return this.cleanupCallbacks.length
  }
}

/**
 * 创建资源管理器
 * 
 * @returns 资源管理器实例
 */
export function createResourceManager(): ResourceManager {
  return new ResourceManager()
}

/**
 * 使用 with 模式自动清理资源
 * 
 * @template T - 资源类型
 * @param resource - 可释放的资源
 * @param callback - 使用资源的回调函数
 * @returns 回调函数的返回值
 * 
 * @example
 * ```typescript
 * const result = await using(createResourceManager(), async (manager) => {
 *   manager.register(someResource)
 *   return await doSomething()
 * })
 * // manager 自动释放
 * ```
 */
export async function using<T extends Disposable, R>(
  resource: T,
  callback: (resource: T) => R | Promise<R>
): Promise<R> {
  try {
    return await callback(resource)
  } finally {
    try {
      await resource.dispose()
    } catch (error) {
      console.error('[using] 清理资源失败:', error)
    }
  }
}

/**
 * 同步版本的 using
 * 
 * @template T - 资源类型
 * @param resource - 可释放的资源
 * @param callback - 使用资源的回调函数
 * @returns 回调函数的返回值
 */
export function usingSync<T extends Disposable, R>(
  resource: T,
  callback: (resource: T) => R
): R {
  try {
    return callback(resource)
  } finally {
    try {
      const result = resource.dispose()
      if (result instanceof Promise) {
        result.catch(error => {
          console.error('[usingSync] 清理资源失败:', error)
        })
      }
    } catch (error) {
      console.error('[usingSync] 清理资源失败:', error)
    }
  }
}

/**
 * 资源组
 * 
 * 管理一组相关的资源
 */
export class ResourceGroup implements Disposable {
  private resources: Disposable[] = []
  private disposed: boolean = false

  /**
   * 添加资源
   * 
   * @param resource - 要添加的资源
   */
  add(resource: Disposable): void {
    if (this.disposed) {
      throw new Error('ResourceGroup 已被释放,无法添加新资源')
    }
    this.resources.push(resource)
  }

  /**
   * 移除资源
   * 
   * @param resource - 要移除的资源
   */
  remove(resource: Disposable): void {
    const index = this.resources.indexOf(resource)
    if (index !== -1) {
      this.resources.splice(index, 1)
    }
  }

  /**
   * 释放所有资源
   */
  async dispose(): Promise<void> {
    if (this.disposed) {
      return
    }

    this.disposed = true

    const errors: Error[] = []

    // 按添加顺序释放资源
    for (const resource of this.resources) {
      try {
        await resource.dispose()
      } catch (error) {
        errors.push(error as Error)
        console.error('[ResourceGroup] 资源释放失败:', error)
      }
    }

    this.resources = []

    if (errors.length > 0) {
      console.error(`[ResourceGroup] 共 ${errors.length} 个资源释放失败`)
      throw errors[0]
    }
  }

  /**
   * 检查是否已释放
   */
  isDisposed(): boolean {
    return this.disposed
  }

  /**
   * 获取资源数量
   */
  getResourceCount(): number {
    return this.resources.length
  }
}

/**
 * 创建资源组
 * 
 * @returns 资源组实例
 */
export function createResourceGroup(): ResourceGroup {
  return new ResourceGroup()
}

