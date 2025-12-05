/**
 * 存储工具函数
 */

export interface StorageOptions {
  prefix?: string
  expires?: number // 毫秒
  storage?: Storage
}

/** 创建存储实例 */
export function createStorage(options: StorageOptions = {}) {
  const { prefix = '', expires, storage = localStorage } = options

  const getKey = (key: string) => prefix + key

  return {
    /** 获取值 */
    get<T = any>(key: string, defaultValue?: T): T | undefined {
      try {
        const raw = storage.getItem(getKey(key))
        if (!raw) return defaultValue
        const { value, expires: exp } = JSON.parse(raw)
        if (exp && Date.now() > exp) {
          storage.removeItem(getKey(key))
          return defaultValue
        }
        return value as T
      } catch {
        return defaultValue
      }
    },

    /** 设置值 */
    set<T>(key: string, value: T, ttl?: number): void {
      const exp = ttl ?? expires
      const data = {
        value,
        expires: exp ? Date.now() + exp : null
      }
      storage.setItem(getKey(key), JSON.stringify(data))
    },

    /** 删除值 */
    remove(key: string): void {
      storage.removeItem(getKey(key))
    },

    /** 清空所有值 */
    clear(): void {
      if (prefix) {
        const keysToRemove: string[] = []
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i)
          if (key?.startsWith(prefix)) keysToRemove.push(key)
        }
        keysToRemove.forEach(k => storage.removeItem(k))
      } else {
        storage.clear()
      }
    },

    /** 检查是否存在 */
    has(key: string): boolean {
      return storage.getItem(getKey(key)) !== null
    },

    /** 获取所有键 */
    keys(): string[] {
      const result: string[] = []
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i)
        if (key && (!prefix || key.startsWith(prefix))) {
          result.push(prefix ? key.slice(prefix.length) : key)
        }
      }
      return result
    }
  }
}

/** 默认 localStorage 实例 */
export const local = createStorage({ storage: localStorage })

/** 默认 sessionStorage 实例 */
export const session = createStorage({ storage: sessionStorage })
