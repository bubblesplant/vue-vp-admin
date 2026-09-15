/**
 * @file v-permission 按钮权限指令 ⭐⭐⭐
 * -------------------------------------------------------
 * 用法：
 *   <AButton v-permission="'btn:add'">新增</AButton>
 *   <AButton v-permission="['btn:add', 'btn:edit']">多个权限之一</AButton>
 *
 * 原理：指令钩子 mounted 时检查当前用户是否拥有该权限码，
 *       没有权限 → 直接把元素从 DOM 中移除（el.parentNode.removeChild）。
 *
 * 为什么「移除」而不是「隐藏（display:none）」？
 *   → 隐藏只是把 CSS 改了，懂技术的用户在 DevTools 里还能点出来；
 *     移除后 DOM 里根本没有这个节点，更安全。
 *   → 当然，前端权限只是体验层，真正的权限校验必须由后端做。
 */
import type { Directive } from 'vue'

import { useUserStoreWithOut } from '@/store/modules/user'

/** 核心判断逻辑，抽出来供 usePermission hook 复用 */
export function checkPermission(value: string | string[]): boolean {
  const userStore = useUserStoreWithOut()
  const { perms, roles } = userStore

  // admin 超级管理员拥有所有按钮权限
  if (roles.includes('admin')) {
    return true
  }
  // 支持传单个权限码或数组（数组：满足其一即可）
  const need = Array.isArray(value) ? value : [value]
  return need.some(p => perms.includes(p))
}

export const permission: Directive<HTMLElement, string | string[]> = {
  /**
   * mounted：元素插入 DOM 后调用
   * 注意必须在 mounted（而非 beforeMount）里操作父节点，
   * 因为 beforeMount 时 el 还没被插入，parentNode 是 null。
   */
  mounted(el, binding) {
    if (!checkPermission(binding.value)) {
      el.parentNode?.removeChild(el)
    }
  },
}
