/**
 * Vue Composables
 */

import { ref, computed, type Ref } from 'vue'

/**
 * 计数器 composable
 */
export function useCounter(initialValue = 0) {
  const count = ref(initialValue)

  const increment = () => {
    count.value++
  }

  const decrement = () => {
    count.value--
  }

  const reset = () => {
    count.value = initialValue
  }

  const doubled = computed(() => count.value * 2)

  return {
    count: count as Ref<number>,
    doubled,
    increment,
    decrement,
    reset
  }
}

/**
 * 本地存储 composable
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [Ref<T>, (value: T) => void] {
  const data = ref<T>(defaultValue)

  // 初始化时读取
  const stored = localStorage.getItem(key)
  if (stored) {
    try {
      data.value = JSON.parse(stored)
    } catch {
      data.value = stored as unknown as T
    }
  }

  // 保存函数
  const setData = (value: T) => {
    data.value = value
    localStorage.setItem(key, JSON.stringify(value))
  }

  return [data, setData]
}

