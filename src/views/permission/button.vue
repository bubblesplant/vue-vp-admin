<script setup lang="ts">
/**
 * @file 按钮权限演示 ⭐⭐⭐
 * -------------------------------------------------------
 * 两种实现方式（本页都演示）：
 *   1. v-permission 指令：没权限直接从 DOM 移除（见 src/directives/permission.ts）
 *      <AButton v-permission="'btn:add'">新增</AButton>
 *   2. usePermission hook：返回响应式状态，配合 v-if / disabled（见 src/hooks/usePermission.ts）
 *      const { can } = usePermission()
 *      <AButton v-if="can('btn:add')">新增</AButton>
 *
 * 对比：
 *   - 指令：声明式、侵入小，适合「整个按钮有没有」
 *   - hook：能拿到布尔值做更多事（禁用、置灰、逻辑分支）
 *
 * ⚠️ 前端权限只是体验优化，真正的校验必须在后端接口做！
 */
import { message } from 'antdv-next'

import { usePermission } from '@/hooks/usePermission'
import { useUserStore } from '@/store/modules/user'

// keepAlive 演示需要：组件 name 必须和路由 name 一致（见 layout 的 KeepAlive include）
defineOptions({ name: 'PermissionButton' })

const userStore = useUserStore()
const { can, hasPerm } = usePermission()

/** 模拟的业务操作（无后端，只弹消息） */
function doAction(action: string) {
  message.success(`执行了「${action}」操作`)
}

/** 事件里的一次性权限判断（非响应式） */
function handleDelete() {
  if (!hasPerm('btn:delete')) {
    message.error('没有删除权限（btn:delete）')
    return
  }
  message.success('删除成功')
}
</script>

<template>
  <div>
    <ACard class="mb-4" title="当前账号的按钮权限">
      <p class="mb-2 text-gray-500">
        权限码来自登录接口（mock）返回的 perms 字段：
      </p>
      <ATag v-if="!userStore.perms.length" color="red">
        空数组 → 所有按钮都不显示（guest 只读）
      </ATag>
      <ATag v-for="p in userStore.perms" :key="p" color="green" class="mr-1">
        {{ p }}
      </ATag>
      <p class="mt-2 text-gray-400 text-sm">
        换账号对比：admin 4 个按钮全有；editor 没有「删除/导出」；guest 一个都没有。
      </p>
    </ACard>

    <ACard class="mb-4" title="方式一：v-permission 指令（没权限 → 从 DOM 移除）">
      <ASpace>
        <AButton v-permission="'btn:add'" type="primary" @click="doAction('新增')">
          新增（btn:add）
        </AButton>
        <AButton v-permission="'btn:edit'" @click="doAction('编辑')">
          编辑（btn:edit）
        </AButton>
        <AButton v-permission="'btn:delete'" danger @click="doAction('删除')">
          删除（btn:delete）
        </AButton>
        <AButton v-permission="'btn:export'" @click="doAction('导出')">
          导出（btn:export）
        </AButton>
      </ASpace>
      <p class="mt-3 text-gray-400 text-sm">
        打开 DevTools 检查 DOM：没权限的按钮根本不在文档里（而不是 display:none）。
      </p>
    </ACard>

    <ACard class="mb-4" title="方式二：usePermission hook（v-if / disabled 灵活控制）">
      <ASpace>
        <AButton v-if="can('btn:add')" type="primary" @click="doAction('新增')">
          新增（v-if）
        </AButton>
        <!-- 权限不足时「置灰」而不是「移除」的场景 -->
        <AButton :disabled="!can('btn:export').value" @click="doAction('导出')">
          导出（disabled 置灰）
        </AButton>
        <AButton danger @click="handleDelete">
          删除（事件里判断）
        </AButton>
      </ASpace>
    </ACard>
  </div>
</template>
