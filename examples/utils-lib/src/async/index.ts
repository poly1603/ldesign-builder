/**
 * 异步工具函数
 */

/** 延迟执行 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/** 防抖函数 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  return function (this: any, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), wait)
  }
}

/** 节流函数 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastTime = 0
  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now()
    if (now - lastTime >= wait) {
      lastTime = now
      fn.apply(this, args)
    }
  }
}

/** 重试函数 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: { times?: number; delay?: number } = {}
): Promise<T> {
  const { times = 3, delay: delayMs = 1000 } = options
  let lastError: Error
  for (let i = 0; i < times; i++) {
    try {
      return await fn()
    } catch (e) {
      lastError = e as Error
      if (i < times - 1) await delay(delayMs)
    }
  }
  throw lastError!
}

/** 并发控制 */
export async function pLimit<T>(
  tasks: (() => Promise<T>)[],
  limit: number
): Promise<T[]> {
  const results: T[] = []
  const executing: Promise<void>[] = []

  for (const task of tasks) {
    const p = task().then(r => { results.push(r) })
    executing.push(p)

    if (executing.length >= limit) {
      await Promise.race(executing)
      executing.splice(executing.findIndex(e => e === p), 1)
    }
  }

  await Promise.all(executing)
  return results
}

/** 超时包装 */
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), ms)
    )
  ])
}
