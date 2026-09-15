/**
 * @file usePermission Hook ⭐⭐⭐
 * -------------------------------------------------------
 * 按钮权限的另一种写法（对比 v-permission 指令）：
 *   - 指令：直接操作 DOM，没权限就移除元素（适合静态渲染）
 *   - Hook：返回响应式计算属性，配合 v-if 使用（适合逻辑判断、动态控制）
 *
 * 用法：
 *   const { hasPerm } = usePermission()
 *   hasPerm('btn:add')        // boolean
 *   const canEdit = usePermission().can('btn:edit') // ComputedRef<boolean>
 */
import { computed } from 'vue'

import { useUserStore } from '@/store/modules/user'

export function usePermission() {
  const userStore = useUserStore()

  /** 响应式判断：权限变化时自动更新 */
  const can = (perm: string | string[]) =>
    computed(() => {
      if (userStore.roles.includes('admin')) {
        return true
      }
      const need = Array.isArray(perm) ? perm : [perm]
      return need.some(p => userStore.perms.includes(p))
    })

  /** 一次性判断（非响应式，适合事件处理里用） */
  const hasPerm = (perm: string | string[]) => can(perm).value

  return { can, hasPerm }
}
