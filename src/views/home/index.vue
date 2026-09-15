<script setup lang="ts">
/**
 * @file 首页：知识点导航总览
 * 列出本项目的所有学习点，点击卡片直接跳转对应演示页。
 */
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()

/** 知识点清单 */
const features = [
  { title: '页面权限', desc: '动态路由 addRoute + meta.roles 按角色过滤', path: '/permission/page', star: '⭐⭐⭐' },
  { title: '按钮权限', desc: 'v-permission 指令 + usePermission hook', path: '/permission/button', star: '⭐⭐⭐' },
  { title: '自定义指令', desc: 'v-permission / v-copy / v-debounce', path: '/feature/directive', star: '⭐⭐⭐' },
  { title: 'component 动态渲染', desc: '<component :is> 动态切换组件', path: '/feature/dynamic-component', star: '⭐⭐⭐' },
  { title: 'defineComponent', desc: 'JSX/渲染函数风格的动态组件', path: '/feature/define-component', star: '⭐⭐' },
  { title: 'Transition 过渡', desc: '路由切换动画 + 元素显隐动画', path: '/feature/transition', star: '⭐⭐⭐' },
  { title: 'KeepAlive 缓存', desc: '页面状态缓存（表单/计数器）', path: '/feature/keep-alive-a', star: '⭐⭐⭐' },
  { title: 'Hooks 组合式函数', desc: 'useCountdown / useLocalStorage / usePermission', path: '/feature/hooks', star: '⭐⭐⭐' },
  { title: '组件内守卫', desc: 'beforeRouteLeave 表单离开拦截', path: '/feature/component-guard', star: '⭐⭐⭐' },
  { title: '路由独享守卫', desc: 'beforeEnter 单路由校验', path: '/feature/route-guard', star: '⭐⭐⭐' },
]
</script>

<template>
  <div>
    <ACard class="mb-4">
      <h1 class="text-xl font-bold">
        你好，{{ userStore.nickname }}（角色：{{ userStore.roles.join(' / ') }}）
      </h1>
      <p class="mt-2 text-gray-500">
        这是一个纯前端的 Admin 学习项目（无后端，mock 模拟接口）。左侧菜单是【动态路由】按角色生成的——切换账号登录可以看到菜单和权限的变化。
      </p>
      <div class="mt-3">
        <span class="mr-2 text-gray-500">当前按钮权限码：</span>
        <ATag v-if="!userStore.perms.length" color="default">
          （无，guest 为只读）
        </ATag>
        <ATag v-for="p in userStore.perms" :key="p" color="green">
          {{ p }}
        </ATag>
      </div>
    </ACard>

    <div class="gap-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      <ACard
        v-for="f in features"
        :key="f.path"
        hoverable
        class="cursor-pointer"
        @click="$router.push(f.path)"
      >
        <div class="flex items-center justify-between">
          <span class="font-bold">{{ f.title }}</span>
          <span class="text-xs">{{ f.star }}</span>
        </div>
        <p class="mt-2 text-gray-500 text-sm">
          {{ f.desc }}
        </p>
      </ACard>
    </div>
  </div>
</template>
