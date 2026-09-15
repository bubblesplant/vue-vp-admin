<script setup lang="ts">
/**
 * @file <component :is> 动态组件渲染 ⭐⭐⭐
 * -------------------------------------------------------
 * Vue 内置组件 <component> 的 is 属性可以接收：
 *   1. 已注册的组件名字符串：  :is="'AButton'"
 *   2. 组件对象本身：          :is="TabForm"
 *   3. 异步组件：              :is="defineAsyncComponent(() => import(...))"
 *
 * 典型应用：低代码/表单渲染器、Tab 切换、动态表单、工作流节点渲染。
 *
 * 本页演示：
 *   - Tab 切换三个子组件
 *   - <KeepAlive> 包裹动态组件 → 切换时保留各组件内部状态
 *   - markRaw：避免 Vue 把组件对象包成响应式（性能 + 警告）
 */
import { defineAsyncComponent, h, markRaw, shallowRef } from 'vue'

import TabCounter from './components/TabCounter.vue'
import TabForm from './components/TabForm.vue'
import TabList from './components/TabList.vue'

defineOptions({ name: 'DynamicComponent' })

/**
 * Tab 配置：component 存「组件对象」
 * markRaw 的作用：组件对象不需要响应式（不会被替换修改时），
 * 避免 Vue 给它包一层 Proxy（性能损耗 + 控制台警告）。
 */
const tabs = [
  { key: 'form', label: '表单组件', component: markRaw(TabForm) },
  { key: 'counter', label: '计数器组件', component: markRaw(TabCounter) },
  { key: 'list', label: '列表组件', component: markRaw(TabList) },
]

const activeKey = ref('form')

/** 当前要渲染的组件（shallowRef：只跟踪 .value 替换，不深度代理组件对象） */
const currentComponent = shallowRef(TabForm)

function handleTabChange(key: string) {
  activeKey.value = key
  currentComponent.value = tabs.find(t => t.key === key)!.component
}

/**
 * 另一种玩法：is 传「异步组件」defineAsyncComponent
 * 组件代码会被拆成单独的 chunk，第一次渲染时才从服务器加载（按需加载）。
 * 真实项目用途：把不常用的大组件（富文本编辑器、图表库）延迟加载，减小首屏体积。
 */
const showAsync = ref(false)
const AsyncDemo = defineAsyncComponent({
  // 模拟一个「加载较慢」的异步组件：延迟 1s 才 resolve
  loader: () => new Promise<any>((resolve) => {
    setTimeout(() => resolve(import('./components/TabCounter.vue')), 1000)
  }),
  // 加载中的占位组件（用渲染函数，不用 template 字符串——打包的 Vue 是 runtime-only 版本）
  loadingComponent: { render: () => h('div', { style: 'padding: 24px; color: #999' }, '异步组件加载中…') },
})
</script>

<template>
  <div>
    <ACard class="mb-4" title="核心语法">
      <pre class="text-sm bg-gray-50 p-3 rounded">&lt;component :is="currentComponent" /&gt;
&lt;!-- is 可以传：组件对象 / 组件名字符串 / defineAsyncComponent(...) --&gt;</pre>
    </ACard>

    <ACard class="mb-4" title="演示一：Tab 切换 + KeepAlive 保活">
      <ATabs v-model:active-key="activeKey" @change="handleTabChange">
        <ATabPane v-for="t in tabs" :key="t.key" :tab="t.label" />
      </ATabs>
      <!--
        KeepAlive 包在 <component> 外面：
        切换 Tab 时旧组件被「缓存」而不是「销毁」，再切回来状态还在。
        试试：在表单里输入内容 → 切到计数器点几下 → 切回来，内容还在。
      -->
      <KeepAlive>
        <component :is="currentComponent" />
      </KeepAlive>
    </ACard>

    <ACard title="演示二：is 传异步组件 defineAsyncComponent（按需加载）">
      <ASpace class="mb-3">
        <AButton type="primary" @click="showAsync = true">
          点击加载异步组件
        </AButton>
        <span class="text-gray-400 text-sm">模拟 1s 网络延迟，加载时显示 loading 占位</span>
      </ASpace>
      <component :is="AsyncDemo" v-if="showAsync" />
    </ACard>
  </div>
</template>
