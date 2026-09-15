/**
 * @file useLocalStorage Hook
 * -------------------------------------------------------
 * 演示「封装浏览器 API 为响应式状态」：
 *   - 读取 localStorage 初始化 ref
 *   - watch 状态变化自动写回 localStorage
 *   - 跨组件共享同一份响应式数据
 */
import { ref, watch } from 'vue'

export function useLocalStorage<T>(key: string, defaultValue: T) {
  // 1. 初始化：优先读 localStorage，读不到/解析失败用默认值
  const read = (): T => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : defaultValue
    }
    catch {
      return defaultValue
    }
  }

  const state = ref<T>(read())

  // 2. 状态变化 → 自动持久化（deep: true 支持对象/数组）
  watch(
    state,
    val => localStorage.setItem(key, JSON.stringify(val)),
    { deep: true },
  )

  function remove() {
    localStorage.removeItem(key)
    state.value = defaultValue
  }

  return { state, remove }
}
