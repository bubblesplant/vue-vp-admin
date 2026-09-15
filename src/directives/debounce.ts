/**
 * @file v-debounce 按钮防抖指令
 * -------------------------------------------------------
 * 用法：<AButton v-debounce="500">防抖提交</AButton>
 * 原理：拦截 click 事件，delay 毫秒内重复点击只生效第一次。
 * 典型场景：防止用户连点「提交」按钮造成重复表单提交。
 */
import type { Directive } from 'vue'

import { message } from 'antdv-next'

interface DebounceEl extends HTMLElement {
  __debounceHandler__?: (e: Event) => void
}

export const debounce: Directive<DebounceEl, number> = {
  mounted(el, binding) {
    const delay = binding.value || 500
    let locked = false

    el.__debounceHandler__ = () => {
      if (locked) {
        // 冷却期内的点击被吞掉
        message.warning(`点击太快了，${delay}ms 内只能触发一次`)
        return
      }
      locked = true
      setTimeout(() => {
        locked = false
      }, delay)
    }
    // capture: true 在捕获阶段拦截，先于元素自身的 click 处理
    el.addEventListener('click', el.__debounceHandler__, true)
  },
  unmounted(el) {
    if (el.__debounceHandler__) {
      el.removeEventListener('click', el.__debounceHandler__, true)
    }
  },
}
