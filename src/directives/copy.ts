/**
 * @file v-copy 点击复制指令
 * -------------------------------------------------------
 * 用法：<AButton v-copy="'要复制的文本'">点我复制</AButton>
 *
 * 演示指令的几个知识点：
 *   1. mounted 里给元素绑定事件监听
 *   2. updated 里响应 binding.value 的变化（文本变了要更新）
 *   3. unmounted 里移除监听，防止内存泄漏
 */
import type { Directive, DirectiveBinding } from 'vue'

import { message } from 'antdv-next'

// 在元素上挂载一个自定义属性，保存事件处理函数，方便卸载时移除
interface CopyEl extends HTMLElement {
  __copyHandler__?: () => void
  __copyValue__?: string
}

function bindCopy(el: CopyEl, binding: DirectiveBinding<string>) {
  el.__copyValue__ = binding.value
  el.__copyHandler__ = async () => {
    if (!el.__copyValue__) {
      return
    }
    try {
      // 现代浏览器 API：navigator.clipboard（需要 https 或 localhost 环境）
      await navigator.clipboard.writeText(el.__copyValue__)
      message.success(`已复制：${el.__copyValue__}`)
    }
    catch {
      message.error('复制失败（浏览器不支持或未授权）')
    }
  }
  el.addEventListener('click', el.__copyHandler__)
}

export const copy: Directive<CopyEl, string> = {
  mounted(el, binding) {
    bindCopy(el, binding)
  },
  /** 绑定的值更新时：先移除旧监听，再按新值重新绑定 */
  updated(el, binding) {
    if (el.__copyHandler__) {
      el.removeEventListener('click', el.__copyHandler__)
    }
    bindCopy(el, binding)
  },
  /** 元素卸载时清理监听，防止内存泄漏 */
  unmounted(el) {
    if (el.__copyHandler__) {
      el.removeEventListener('click', el.__copyHandler__)
    }
  },
}
