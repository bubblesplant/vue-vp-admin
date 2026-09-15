<script setup lang="ts">
/**
 * @file 仅管理员可见页面
 * 本路由 meta.roles = ['admin']，editor/guest 登录后：
 *   - 菜单里看不到本页入口
 *   - 直接访问 URL /permission/admin-only 会落到 404（路由根本没注册）
 */
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()
</script>

<template>
  <ACard title="🔐 仅 admin 可见的秘密页面">
    <p class="text-lg">
      能看到这个页面，说明你是 <ATag color="blue">{{ userStore.roles.join() }}</ATag>。
    </p>
    <p class="mt-2 text-gray-500">
      editor / guest 登录时，本页路由不会被 addRoute 注册——菜单隐藏 + 直接输 URL 也会 404。
    </p>
  </ACard>
</template>
