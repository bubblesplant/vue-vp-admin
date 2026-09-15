<script setup lang="ts">
/**
 * @file 路由独享守卫的「落地页」
 * -------------------------------------------------------
 * 你能看到这个页面，说明已经在 beforeEnter 弹窗里点了「确定」。
 * 守卫代码在 src/router/modules/async.ts 里本路由的 beforeEnter 字段。
 */
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <ACard title="🛡️ 路由独享守卫页面">
    <p class="text-lg mb-4">
      你通过了 <code>beforeEnter</code> 的校验，才进得来本页。
    </p>
    <pre class="text-sm bg-gray-50 p-4 rounded" style="overflow:auto">{
  path: 'route-guard',
  component: () => import('@/views/feature/route-guard.vue'),
  // 路由独享守卫：只在这一条路由生效
  beforeEnter: (to, from) => {
    const pass = window.confirm('确定进入吗？')
    return pass  // false → 取消导航；也可以 return { path: '/403' }
  }
}</pre>
    <div class="mt-4 text-gray-600 leading-7">
      <p>当前路由信息（useRoute 获取）：</p>
      <p>path：<ATag>{{ route.path }}</ATag></p>
      <p>name：<ATag>{{ String(route.name) }}</ATag></p>
    </div>
  </ACard>
</template>
