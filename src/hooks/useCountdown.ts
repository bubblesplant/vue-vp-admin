/**
 * @file useCountdown Hook
 * -------------------------------------------------------
 * 演示「组合式函数」的核心价值：把「响应式状态 + 定时器副作用 + 清理逻辑」
 * 封装成一个可复用的函数。
 *
 * 要点：
 *   1. 返回 ref 状态供模板使用
 *   2. onUnmounted 时自动清理定时器，防止内存泄漏
 */
import { onUnmounted, ref } from 'vue'

export function useCountdown(seconds = 60) {
  const current = ref(0)
  let timer: ReturnType<typeof setInterval> | null = null

  const isRunning = ref(false)

  function start() {
    if (isRunning.value) {
      return
    }
    current.value = seconds
    isRunning.value = true
    timer = setInterval(() => {
      current.value--
      if (current.value <= 0) {
        stop()
      }
    }, 1000)
  }

  function stop() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    isRunning.value = false
    current.value = 0
  }

  // 组件卸载时自动清理定时器 —— 这是 hook 封装副作用的标准姿势
  onUnmounted(stop)

  return { current, isRunning, start, stop }
}
