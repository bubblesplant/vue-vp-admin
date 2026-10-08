<script setup lang="ts">
/**
 * @file defineAsyncComponent 异步组件（组件级按需加载）⭐⭐⭐
 * -------------------------------------------------------
 * 作用：把组件拆成独立 chunk，第一次【真正渲染】时才发请求下载。
 *
 * 和路由懒加载的分工：
 *   - 页面级：路由配置 component: () => import('xxx.vue') —— vue-router 负责等待
 *   - 组件级：页面内部的大组件（弹窗、低频 Tab、条件渲染区块）—— defineAsyncComponent 负责
 *
 * 本页演示：
 *   演示一：最简写法 + v-if 按需触发（看 Network 验证 chunk 只下载一次）
 *   演示二：生产环境完整配置（loading 占位 / delay / timeout / error 兜底 / 失败自动重试）
 */
import type { Component } from 'vue'

import { defineAsyncComponent, h, ref, shallowRef } from 'vue'

defineOptions({ name: 'AsyncComponent' })

/* ==================== 演示一：最简写法 ==================== */
/**
 * 只传一个 loader：() => import('./HeavyReport.vue')
 * Vite/Rollup 识别动态 import()，构建时把 HeavyReport.vue 拆为独立 chunk。
 */
const SimpleHeavyReport = defineAsyncComponent(() => import('./components/HeavyReport.vue'))

const showSimple = ref(false)

/* ==================== 演示二：弹窗 + 完整生产配置 ==================== */
const modalOpen = ref(false)

/** 开关：下一次打开弹窗时，是否模拟首次加载失败（弱网抖动） */
const failMode = ref(true)

/** onError 回调里的尝试次数，仅用于页面展示「第 n 次重试中」 */
const retryCount = ref(0)

/** 异步组件包装器（shallowRef：组件对象不需要深度响应式代理） */
const AsyncReport = shallowRef<Component | null>(null)

/**
 * 每次打开弹窗都构建一个【全新】的异步组件包装器。
 * 真实项目不需要这样做（组件加载成功后 Promise 会被缓存，直接定义一次即可）；
 * 这里重建只是为了让「加载失败 → 自动重试 → 成功」的完整生命周期可以反复观察。
 */
function openReportModal() {
  retryCount.value = 0

  // 本次加载生命周期内的「是否先失败一次」标记，不直接改 failMode（保持开关 UI 不变）
  let shouldFail = failMode.value

  AsyncReport.value = defineAsyncComponent({
    // ① loader：返回 Promise。这里先等 900ms 模拟网络耗时，再真正 import 组件 chunk
    loader: () =>
      new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          if (shouldFail) {
            shouldFail = false // 只失败一次，随后 retry() 重新进来会成功
            reject(new Error('模拟网络抖动：chunk 下载失败'))
          }
          else {
            resolve()
          }
        }, 900)
      }).then(() => import('./components/HeavyReport.vue')),

    // ② 加载中占位组件（项目用的是 runtime-only Vue，没有模板编译器，用 h 渲染函数）
    loadingComponent: {
      render: () =>
        h(
          'div',
          { style: 'padding:48px 0;text-align:center;color:#1677ff' },
          retryCount.value > 0 ? `第 ${retryCount.value} 次自动重试中，请稍候…` : '报表 chunk 加载中…（约 0.9s）',
        ),
    },

    // ③ delay：200ms 内就加载完则不显示 loading，避免快网下 loading 闪烁
    delay: 200,

    // ④ timeout：超过 10s 仍未加载完成 → 走 errorComponent
    timeout: 10_000,

    // ⑤ 加载失败（或重试用尽）后的兜底 UI
    errorComponent: {
      render: () =>
        h(
          'div',
          { style: 'padding:48px 0;text-align:center;color:#ff4d4f' },
          '报表加载失败，请关闭弹窗后重试',
        ),
    },

    // ⑥ onError：加载失败回调，attempts = 当前是第几次尝试
    onError(error: Error, retry: () => void, fail: (e: Error) => void, attempts: number) {
      retryCount.value = attempts
      console.warn('[defineAsyncComponent] onError:', error.message, 'attempts =', attempts)
      // 最多自动重试 2 次；仍失败则 fail()，渲染 errorComponent
      if (attempts <= 2)
        retry()
      else
        fail(error)
    },
  })

  modalOpen.value = true
}
</script>

<template>
  <div>
    <ACard class="mb-4" title="核心语法">
      <pre class="rounded bg-gray-50 p-3 text-sm">// ① 最简：定义一个异步组件
const Heavy = defineAsyncComponent(() => import('./Heavy.vue'))

// ② 完整：loader + 加载中/失败占位 + 超时 + 失败重试
const Heavy = defineAsyncComponent({
  loader: () => import('./Heavy.vue'),
  loadingComponent: Loading,   // 加载中显示什么
  delay: 200,                  // 200ms 内加载完不显示 loading
  timeout: 10000,              // 超时走 errorComponent
  errorComponent: ErrorTip,    // 加载失败显示什么
  onError(err, retry, fail, attempts) {
    attempts &lt;= 2 ? retry() : fail(err)
  },
})</pre>
      <p class="mt-2 text-sm text-gray-500">
        适用场景：<b>体积大 + 非首屏必需 + 触发概率低</b>
        的组件（弹窗报表、富文本编辑器、图表大屏、低频 Tab）；小而美的高频基础组件不要异步。
      </p>
    </ACard>

    <!-- ==================== 演示一 ==================== -->
    <ACard class="mb-4" title="演示一：最简写法 + v-if 按需触发">
      <ASpace class="mb-3">
        <AButton type="primary" @click="showSimple = !showSimple">
          {{ showSimple ? '移除组件（v-if = false）' : '点击加载重型报表' }}
        </AButton>
      </ASpace>
      <p class="mb-3 text-sm text-gray-400">
        验证步骤：打开 DevTools → Network → 筛选 JS。
        <b>第一次</b>点击才会下载 HeavyReport-xxxx.js；移除后再次点击不再发请求（import() 的 Promise 已缓存，秒开）。
      </p>
      <!-- v-if 是关键：不渲染就不加载。v-show 不行（组件仍会挂载、仍会下载 chunk） -->
      <SimpleHeavyReport v-if="showSimple" />
    </ACard>

    <!-- ==================== 演示二 ==================== -->
    <ACard title="演示二：弹窗场景完整配置（loading 占位 / 超时 / 错误兜底 / 自动重试）">
      <ASpace class="mb-3">
        <AButton type="primary" @click="openReportModal">
          打开弹窗加载报表
        </AButton>
        <ASwitch v-model:checked="failMode" />
        <span class="text-sm">模拟弱网：首次加载失败一次（观察自动重试）</span>
        <ATag v-if="retryCount > 0" color="orange">
          onError 已触发，当前第 {{ retryCount }} 次尝试
        </ATag>
      </ASpace>
      <p class="text-sm text-gray-400">
        点击后约 200ms 出现 loading 占位（delay 的作用）；开关打开时会先失败一次，
        onError 自动 retry()，随后加载成功；每次打开弹窗都会重建异步包装器，方便重复观察。
      </p>

      <!--
        v-if 同时绑定 modalOpen：弹窗关闭即卸载组件，不依赖 destroy-on-close。
        antdv-next 的 Modal 没有 destroyOnClose，用 v-if 手动控制最稳妥。
      -->
      <AModal
        v-model:open="modalOpen"
        title="重型销售报表（异步组件）"
        :width="760"
        :footer="null"
      >
        <component :is="AsyncReport" v-if="modalOpen && AsyncReport" />
      </AModal>
    </ACard>
  </div>
</template>
