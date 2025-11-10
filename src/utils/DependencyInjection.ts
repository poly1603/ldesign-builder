/**
 * 依赖注入容器 (P1-4)
 * 
 * 提供轻量级的依赖注入功能,支持单例、工厂和作用域
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

/**
 * 服务生命周期
 */
export enum ServiceLifetime {
  /** 单例 - 整个应用生命周期内只创建一次 */
  SINGLETON = 'singleton',
  /** 瞬态 - 每次请求都创建新实例 */
  TRANSIENT = 'transient',
  /** 作用域 - 在同一作用域内共享实例 */
  SCOPED = 'scoped'
}

/**
 * 服务标识符
 */
export type ServiceIdentifier<T = any> = string | symbol | { new(...args: any[]): T }

/**
 * 服务工厂函数
 */
export type ServiceFactory<T = any> = (container: Container) => T | Promise<T>

/**
 * 服务描述符
 */
interface ServiceDescriptor<T = any> {
  identifier: ServiceIdentifier<T>
  factory: ServiceFactory<T>
  lifetime: ServiceLifetime
  instance?: T
}

/**
 * 依赖注入容器
 */
export class Container {
  private services = new Map<ServiceIdentifier, ServiceDescriptor>()
  private scopedInstances = new Map<ServiceIdentifier, any>()
  private parent?: Container

  constructor(parent?: Container) {
    this.parent = parent
  }

  /**
   * 注册单例服务
   */
  registerSingleton<T>(
    identifier: ServiceIdentifier<T>,
    factory: ServiceFactory<T>
  ): this {
    this.services.set(identifier, {
      identifier,
      factory,
      lifetime: ServiceLifetime.SINGLETON
    })
    return this
  }

  /**
   * 注册瞬态服务
   */
  registerTransient<T>(
    identifier: ServiceIdentifier<T>,
    factory: ServiceFactory<T>
  ): this {
    this.services.set(identifier, {
      identifier,
      factory,
      lifetime: ServiceLifetime.TRANSIENT
    })
    return this
  }

  /**
   * 注册作用域服务
   */
  registerScoped<T>(
    identifier: ServiceIdentifier<T>,
    factory: ServiceFactory<T>
  ): this {
    this.services.set(identifier, {
      identifier,
      factory,
      lifetime: ServiceLifetime.SCOPED
    })
    return this
  }

  /**
   * 注册实例
   */
  registerInstance<T>(
    identifier: ServiceIdentifier<T>,
    instance: T
  ): this {
    this.services.set(identifier, {
      identifier,
      factory: () => instance,
      lifetime: ServiceLifetime.SINGLETON,
      instance
    })
    return this
  }

  /**
   * 解析服务
   */
  async resolve<T>(identifier: ServiceIdentifier<T>): Promise<T> {
    let descriptor = this.services.get(identifier)

    // 如果当前容器没有,尝试从父容器获取描述符
    if (!descriptor && this.parent) {
      descriptor = this.parent.services.get(identifier)

      // 如果父容器也没有,递归查找
      if (!descriptor) {
        return this.parent.resolve(identifier)
      }
    }

    if (!descriptor) {
      throw new Error(`服务未注册: ${String(identifier)}`)
    }

    switch (descriptor.lifetime) {
      case ServiceLifetime.SINGLETON:
        return this.resolveSingleton(descriptor)

      case ServiceLifetime.TRANSIENT:
        return this.resolveTransient(descriptor)

      case ServiceLifetime.SCOPED:
        return this.resolveScoped(descriptor)

      default:
        throw new Error(`未知的服务生命周期: ${descriptor.lifetime}`)
    }
  }

  /**
   * 同步解析服务 (仅支持同步工厂)
   */
  resolveSync<T>(identifier: ServiceIdentifier<T>): T {
    const descriptor = this.services.get(identifier)

    if (!descriptor) {
      if (this.parent) {
        return this.parent.resolveSync(identifier)
      }
      throw new Error(`服务未注册: ${String(identifier)}`)
    }

    const result = descriptor.factory(this)
    
    if (result instanceof Promise) {
      throw new Error(`服务 ${String(identifier)} 的工厂函数是异步的,请使用 resolve() 方法`)
    }

    return result as T
  }

  /**
   * 创建子容器 (作用域)
   */
  createScope(): Container {
    return new Container(this)
  }

  /**
   * 检查服务是否已注册
   */
  has(identifier: ServiceIdentifier): boolean {
    return this.services.has(identifier) || (this.parent?.has(identifier) ?? false)
  }

  /**
   * 清空作用域实例
   */
  clearScope(): void {
    this.scopedInstances.clear()
  }

  /**
   * 解析单例服务
   */
  private async resolveSingleton<T>(descriptor: ServiceDescriptor<T>): Promise<T> {
    if (descriptor.instance) {
      return descriptor.instance
    }

    const instance = await descriptor.factory(this)
    descriptor.instance = instance
    return instance
  }

  /**
   * 解析瞬态服务
   */
  private async resolveTransient<T>(descriptor: ServiceDescriptor<T>): Promise<T> {
    return descriptor.factory(this)
  }

  /**
   * 解析作用域服务
   */
  private async resolveScoped<T>(descriptor: ServiceDescriptor<T>): Promise<T> {
    const existing = this.scopedInstances.get(descriptor.identifier)
    if (existing) {
      return existing
    }

    const instance = await descriptor.factory(this)
    this.scopedInstances.set(descriptor.identifier, instance)
    return instance
  }
}

/**
 * 全局容器
 */
let globalContainer: Container | null = null

/**
 * 获取全局容器
 */
export function getGlobalContainer(): Container {
  if (!globalContainer) {
    globalContainer = new Container()
  }
  return globalContainer
}

/**
 * 重置全局容器
 */
export function resetGlobalContainer(): void {
  globalContainer = null
}

/**
 * 创建容器
 */
export function createContainer(parent?: Container): Container {
  return new Container(parent)
}

/**
 * 服务装饰器 (用于类)
 */
export function Injectable(lifetime: ServiceLifetime = ServiceLifetime.TRANSIENT) {
  return function <T extends { new(...args: any[]): {} }>(constructor: T) {
    // 这里可以添加元数据,用于自动注册
    return constructor
  }
}

/**
 * 注入装饰器 (用于属性)
 */
export function Inject(identifier: ServiceIdentifier) {
  return function (target: any, propertyKey: string) {
    // 这里可以添加元数据,用于自动注入
  }
}

/**
 * 构建器模式的容器配置
 */
export class ContainerBuilder {
  private container: Container

  constructor() {
    this.container = new Container()
  }

  /**
   * 添加单例
   */
  addSingleton<T>(
    identifier: ServiceIdentifier<T>,
    factory: ServiceFactory<T>
  ): this {
    this.container.registerSingleton(identifier, factory)
    return this
  }

  /**
   * 添加瞬态
   */
  addTransient<T>(
    identifier: ServiceIdentifier<T>,
    factory: ServiceFactory<T>
  ): this {
    this.container.registerTransient(identifier, factory)
    return this
  }

  /**
   * 添加作用域
   */
  addScoped<T>(
    identifier: ServiceIdentifier<T>,
    factory: ServiceFactory<T>
  ): this {
    this.container.registerScoped(identifier, factory)
    return this
  }

  /**
   * 添加实例
   */
  addInstance<T>(
    identifier: ServiceIdentifier<T>,
    instance: T
  ): this {
    this.container.registerInstance(identifier, instance)
    return this
  }

  /**
   * 构建容器
   */
  build(): Container {
    return this.container
  }
}

/**
 * 创建容器构建器
 */
export function createContainerBuilder(): ContainerBuilder {
  return new ContainerBuilder()
}

/**
 * 服务定位器模式 (简化版)
 */
export class ServiceLocator {
  private static container: Container = new Container()

  /**
   * 注册服务
   */
  static register<T>(
    identifier: ServiceIdentifier<T>,
    factory: ServiceFactory<T>,
    lifetime: ServiceLifetime = ServiceLifetime.TRANSIENT
  ): void {
    switch (lifetime) {
      case ServiceLifetime.SINGLETON:
        this.container.registerSingleton(identifier, factory)
        break
      case ServiceLifetime.TRANSIENT:
        this.container.registerTransient(identifier, factory)
        break
      case ServiceLifetime.SCOPED:
        this.container.registerScoped(identifier, factory)
        break
    }
  }

  /**
   * 解析服务
   */
  static async resolve<T>(identifier: ServiceIdentifier<T>): Promise<T> {
    return this.container.resolve(identifier)
  }

  /**
   * 同步解析服务
   */
  static resolveSync<T>(identifier: ServiceIdentifier<T>): T {
    return this.container.resolveSync(identifier)
  }

  /**
   * 重置容器
   */
  static reset(): void {
    this.container = new Container()
  }
}

