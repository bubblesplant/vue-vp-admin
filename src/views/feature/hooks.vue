<script setup lang="ts">
/**
 * @file Hooks（组合式函数）演示 ⭐⭐⭐
 * -------------------------------------------------------
 * Hook = 以 use 开头、利用 Vue 组合式 API 封装「可复用逻辑」的函数。
 * 解决的问题：
 *   - Vue2 mixins 的痛点：数据来源不清晰、命名冲突、互相覆盖
 *   - 把「响应式状态 + 副作用 + 生命周期清理」打包复用
 *
 * 本项目已有的 hooks：
 *   - usePermission    按钮权限判断（src/hooks/usePermission.ts）
 *   - useCountdown     倒计时（src/hooks/useCountdown.ts）
 *   - useLocalStorage  响应式 localStorage（src/hooks/useLocalStorage.ts）
 *   - useEcharts       图表（src/hooks/chart/useEcharts.ts）
 */
import { useCountdown } from '@/hooks/useCountdown'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { usePermission } from '@/hooks/usePermission'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()

/* ---- 1. useCountdown ---- */
const { current, isRunning, start, stop } = useCountdown(10)

/* ---- 2. useLocalStorage：刷新页面数据还在 ---- */
const { state: draft, remove } = useLocalStorage('hooks-demo-draft', { text: '' })

/* ---- 3. usePermission ---- */
const { can } = usePermission()
const permList = ['btn:add', 'btn:edit', 'btn:delete', 'btn:export']
</script>

<template>
  <div class="gap-4 grid grid-cols-1 lg:grid-cols-2">
    <ACard title="useCountdown：倒计时">
      <div class="flex items-center gap-4">
        <span class="text-4xl font-bold" :class="current > 0 ? 'text-red-500' : 'text-gray-300'">
          {{ current }}
        </span>
        <ASpace>
          <AButton type="primary" :disabled="isRunning" @click="start">
            开始 10s 倒计时
          </AButton>
          <AButton :disabled="!isRunning" @click="stop">
            停止
          </AButton>
        </ASpace>
      </div>
      <p class="mt-3 text-gray-400 text-sm">
        定时器在组件卸载时自动清理（hook 内部用了 onUnmounted），不怕内存泄漏。
      </p>
    </ACard>

    <ACard title="useLocalStorage：响应式本地存储">
      <AInput v-model:value="draft.text" placeholder="输入内容 → 自动写入 localStorage，刷新页面还在" />
      <div class="mt-3 flex items-center gap-3">
        <AButton size="small" @click="remove">
          清除存储
        </AButton>
        <span class="text-gray-400 text-sm">打开 DevTools → Application → Local Storage 查看 key: hooks-demo-draft</span>
      </div>
    </ACard>

    <ACard title="usePermission：响应式权限判断">
      <p class="mb-2 text-gray-500 text-sm">
        当前角色：{{ userStore.roles.join() }}，各权限码判断结果：
      </p>
      <div class="flex flex-wrap gap-2">
        <ATag v-for="p in permList" :key="p" :color="can(p).value ? 'green' : 'red'">
          {{ p }}：{{ can(p).value ? '有权限' : '无权限' }}
        </ATag>
      </div>
    </ACard>

    <ACard title="Hook 编写规范速查">
      <ul class="text-gray-600 leading-7 list-disc list-inside text-sm">
        <li>以 <code>use</code> 开头命名，放 <code>src/hooks</code> 目录</li>
        <li>内部用 ref/computed/watch 管理状态，返回对象供解构</li>
        <li>有副作用（定时器/事件监听）必须 onUnmounted 清理</li>
        <li>hook 里可以调用其他 hook 和 store（组合复用）</li>
      </ul>
    </ACard>
  </div>
</template>
