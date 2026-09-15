<script setup lang="ts">
/**
 * @file 自定义指令演示 ⭐⭐⭐
 * -------------------------------------------------------
 * Vue 自定义指令的本质：一组「元素生命周期钩子」
 *   created / beforeMount / mounted / beforeUpdate / updated / unmounted
 * 每个钩子收到 (el, binding, vnode)，可以直接操作 DOM。
 *
 * 什么时候用指令？
 *   → 需要「跨组件复用的底层 DOM 操作」时：权限移除、复制、防抖、拖拽、自动聚焦…
 */
import { message } from 'antdv-next'

const copyText = ref('这是一段可以修改的复制文本')

function handleSubmit() {
  message.success('提交成功（v-debounce 拦截了 1s 内的重复点击）')
}
</script>

<template>
  <div>
    <ACard class="mb-4" title="v-copy：点击复制">
      <div class="mb-3">
        <AInput v-model:value="copyText" class="w-80" />
      </div>
      <ASpace>
        <AButton v-copy="copyText" type="primary">
          点我复制输入框内容
        </AButton>
        <span class="text-gray-400 text-sm">指令值是响应式的，改输入框后复制的也是新值（updated 钩子）</span>
      </ASpace>
    </ACard>

    <ACard class="mb-4" title="v-debounce：按钮防抖">
      <ASpace>
        <AButton v-debounce="1000" type="primary" @click="handleSubmit">
          防抖提交（1s）
        </AButton>
        <span class="text-gray-400 text-sm">快速连点试试：1 秒内只会提交一次</span>
      </ASpace>
    </ACard>

    <ACard title="v-permission：按钮权限（详见「按钮权限」页）">
      <ASpace>
        <AButton v-permission="'btn:add'" type="primary">
          有权限才显示
        </AButton>
        <AButton v-permission="'btn:not-exist'" danger>
          我永远不显示（没有任何角色有 btn:not-exist）
        </AButton>
        <span class="text-gray-400 text-sm">第二个按钮已被指令从 DOM 移除，检查元素验证一下</span>
      </ASpace>
    </ACard>
  </div>
</template>
