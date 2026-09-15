<script setup lang="ts">
/**
 * @file defineComponent 动态组件 ⭐⭐
 * -------------------------------------------------------
 * defineComponent 的三个用途：
 *   1. 用「渲染函数 / JSX」写组件（不依赖 .vue 单文件和模板编译）
 *      → 适合在纯 .ts 文件里写组件（路由表、工具函数里生成组件）
 *   2. 给 TS 提供更好的类型推导（props 类型自动推断）
 *   3. 在代码里「动态创建组件」并配合 h() / <component :is> 使用
 *
 * 本页演示：不用 .vue 文件，直接用 defineComponent + h 渲染函数
 * 定义三个组件，并动态渲染。
 */
import type { Component } from 'vue'

import { defineComponent, h, markRaw, ref, shallowRef } from 'vue'

/* ---------- 组件 1：纯渲染函数组件 ---------- */
const RenderCard = markRaw(defineComponent({
  name: 'RenderCard',
  // props 声明：TS 会自动推导类型
  props: {
    title: { type: String, default: '渲染函数卡片' },
  },
  // setup 返回「渲染函数」：直接描述虚拟 DOM，替代 template
  setup(props) {
    return () => h(
      'div',
      { style: 'border: 1px solid #91caff; border-radius: 8px; padding: 16px; background: #e6f4ff;' },
      [
        h('h4', { style: 'margin: 0 0 8px; color: #0958d9;' }, props.title),
        h('p', { style: 'margin: 0; color: #666;' }, '我没有 .vue 文件，没有 template，完全用 h() 渲染函数描述界面。'),
      ],
    )
  },
}))

/* ---------- 组件 2：带状态 + 事件的渲染函数组件 ---------- */
const RenderCounter = markRaw(defineComponent({
  name: 'RenderCounter',
  setup(_, { expose }) {
    const count = ref(0)
    // expose：允许父组件通过 ref 调用本组件的方法
    expose({ add: () => count.value++ })
    return () => h('div', { style: 'display: flex; align-items: center; gap: 12px;' }, [
      h('span', { style: 'font-size: 24px; font-weight: bold;' }, String(count.value)),
      h('button', {
        style: 'padding: 4px 16px; cursor: pointer;',
        onClick: () => count.value++,
      }, '+1'),
    ])
  },
}))

/* ---------- 组件 3：带插槽的渲染函数组件 ---------- */
const RenderPanel = markRaw(defineComponent({
  name: 'RenderPanel',
  setup(_, { slots }) {
    return () => h('div', { style: 'border: 1px dashed #d9d9d9; border-radius: 8px; padding: 16px;' }, [
      h('div', { style: 'font-weight: bold; margin-bottom: 8px;' }, '带插槽的面板（渲染函数版）'),
      // 渲染默认插槽内容
      slots.default?.(),
    ])
  },
}))

/** 用 <component :is> 动态渲染上面定义的组件 */
const compList = [
  { key: 'card', label: 'RenderCard', comp: RenderCard },
  { key: 'counter', label: 'RenderCounter', comp: RenderCounter },
  { key: 'panel', label: 'RenderPanel', comp: RenderPanel },
]
// 显式标注为 Component 类型：否则 shallowRef 会把类型收窄为第一个组件的类型
const current = shallowRef<Component>(RenderCard)
const activeKey = ref('card')

function switchComp(key: string) {
  activeKey.value = key
  current.value = compList.find(c => c.key === key)!.comp
}

/** 通过组件 ref 调用 expose 出来的方法 */
const counterRef = ref()
function callExposedMethod() {
  counterRef.value?.add()
}
</script>

<template>
  <div>
    <ACard class="mb-4" title="什么时候需要 defineComponent？">
      <ul class="text-gray-600 leading-7 list-disc list-inside">
        <li>在纯 <code>.ts</code> 文件里写组件（例如路由分组占位组件，见 <code>router/modules/async.ts</code>）</li>
        <li>低代码场景：根据 JSON Schema 在代码里动态拼装组件</li>
        <li>写高阶组件（HOC）：包装已有组件、注入逻辑</li>
        <li>JSX 语法组件：<code>defineComponent(() => &lt;div /&gt;)</code></li>
      </ul>
    </ACard>

    <ACard class="mb-4" title="动态渲染三个「渲染函数组件」">
      <ASpace class="mb-4">
        <AButton
          v-for="c in compList"
          :key="c.key"
          :type="activeKey === c.key ? 'primary' : 'default'"
          @click="switchComp(c.key)"
        >
          {{ c.label }}
        </AButton>
      </ASpace>

      <!-- 动态渲染 defineComponent 创建的组件 -->
      <component :is="current" ref="counterRef">
        <!-- 只有 RenderPanel 会用到这个默认插槽 -->
        <p class="text-gray-500">
          这段内容通过「默认插槽」传给了渲染函数组件 → slots.default()
        </p>
      </component>

      <div v-if="activeKey === 'counter'" class="mt-4">
        <AButton size="small" @click="callExposedMethod">
          父组件通过 ref 调用子组件 expose 的 add()
        </AButton>
      </div>
    </ACard>

    <ACard title="关键 API 速查">
      <pre class="text-sm bg-gray-50 p-3 rounded" style="overflow:auto">// 定义组件（渲染函数风格）
const MyComp = defineComponent({
  name: 'MyComp',
  props: { msg: String },
  setup(props, { slots, expose, emit }) {
    return () => h('div', null, props.msg)   // 返回渲染函数
  }
})

// 使用：模板里
&lt;component :is="MyComp" msg="hello" /&gt;
// 或者代码里直接生成 vnode
const vnode = h(MyComp, { msg: 'hello' })</pre>
    </ACard>
  </div>
</template>
