/**
 * 工具函数
 */
export function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function createEventDispatcher<T extends Record<string, any>>() {
  const callbacks = new Map<keyof T, Set<(detail: any) => void>>()

  return {
    on<K extends keyof T>(event: K, callback: (detail: T[K]) => void) {
      if (!callbacks.has(event)) {
        callbacks.set(event, new Set())
      }
      callbacks.get(event)!.add(callback)
      return () => callbacks.get(event)?.delete(callback)
    },
    dispatch<K extends keyof T>(event: K, detail: T[K]) {
      callbacks.get(event)?.forEach(cb => cb(detail))
    }
  }
}
