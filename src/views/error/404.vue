<script setup lang="ts">
/**
 * @file 404 页面不存在
 * -------------------------------------------------------
 * 本页路由（/:pathMatch(.*)*）是在【动态路由注册完之后】才 addRoute 的，
 * 保证刷新页面时动态路由先注册，404 只做兜底，不会误伤。
 */
const router = useRouter()
</script>

<template>
  <div class="flex-center flex-col gap-4 h-screen">
    <div class="text-7xl font-bold text-gray-300">
      404
    </div>
    <p class="text-gray-500">
      页面不存在（或者你的角色没有该页面的路由权限，路由根本未注册）
    </p>
    <AButton type="primary" @click="router.push('/')">
      回首页
    </AButton>
  </div>
</template>
