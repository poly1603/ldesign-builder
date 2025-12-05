/**
 * Preact Custom Hooks
 */
import { useState, useCallback, useEffect } from 'preact/hooks'

/**
 * Toggle hook
 */
export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => setValue(v => !v), [])
  const setTrue = useCallback(() => setValue(true), [])
  const setFalse = useCallback(() => setValue(false), [])

  return { value, toggle, setTrue, setFalse, setValue }
}

/**
 * Counter hook
 */
export function useCounter(initialValue = 0, step = 1) {
  const [count, setCount] = useState(initialValue)

  const increment = useCallback(() => setCount(c => c + step), [step])
  const decrement = useCallback(() => setCount(c => c - step), [step])
  const reset = useCallback(() => setCount(initialValue), [initialValue])

  return { count, increment, decrement, reset, setCount }
}

/**
 * LocalStorage hook
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error('Error reading localStorage:', error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error('Error setting localStorage:', error)
    }
  }, [key, storedValue])

  const removeValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
      setStoredValue(initialValue)
    } catch (error) {
      console.error('Error removing localStorage:', error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue] as const
}

/**
 * 防抖 hook
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
