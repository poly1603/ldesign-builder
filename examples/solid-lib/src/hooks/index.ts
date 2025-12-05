/**
 * Solid.js Custom Hooks
 */
import { createSignal, Accessor } from 'solid-js'

/**
 * Toggle hook - 创建一个可切换的布尔值状态
 */
export function createToggle(initialValue = false): [Accessor<boolean>, () => void, (value: boolean) => void] {
  const [value, setValue] = createSignal(initialValue)

  const toggle = () => setValue(v => !v)
  const set = (newValue: boolean) => setValue(newValue)

  return [value, toggle, set]
}

/**
 * Counter hook - 创建一个计数器状态
 */
export function createCounter(initialValue = 0, step = 1) {
  const [count, setCount] = createSignal(initialValue)

  const increment = () => setCount(c => c + step)
  const decrement = () => setCount(c => c - step)
  const reset = () => setCount(initialValue)
  const set = (value: number) => setCount(value)

  return {
    count,
    increment,
    decrement,
    reset,
    set
  }
}

/**
 * LocalStorage hook - 持久化存储
 */
export function createLocalStorage<T>(key: string, initialValue: T) {
  const stored = localStorage.getItem(key)
  const initial = stored ? JSON.parse(stored) : initialValue

  const [value, setValue] = createSignal<T>(initial)

  const set = (newValue: T | ((prev: T) => T)) => {
    const resolvedValue = typeof newValue === 'function'
      ? (newValue as (prev: T) => T)(value())
      : newValue
    setValue(() => resolvedValue)
    localStorage.setItem(key, JSON.stringify(resolvedValue))
  }

  const remove = () => {
    localStorage.removeItem(key)
    setValue(() => initialValue)
  }

  return [value, set, remove] as const
}
