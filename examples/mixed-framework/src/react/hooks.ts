/**
 * React Hooks
 */

import { useState, useCallback, useEffect, useRef } from 'react'

/**
 * 计数器 hook
 */
export function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue)

  const increment = useCallback(() => {
    setCount(c => c + 1)
  }, [])

  const decrement = useCallback(() => {
    setCount(c => c - 1)
  }, [])

  const reset = useCallback(() => {
    setCount(initialValue)
  }, [initialValue])

  const doubled = count * 2

  return {
    count,
    doubled,
    increment,
    decrement,
    reset
  }
}

/**
 * 本地存储 hook
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  })

  const setStoredValue = useCallback((newValue: T) => {
    setValue(newValue)
    localStorage.setItem(key, JSON.stringify(newValue))
  }, [key])

  return [value, setStoredValue]
}

/**
 * 防抖 hook
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

