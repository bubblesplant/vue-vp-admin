<script setup lang="ts">
/**
 * @file 顶栏右侧：用户信息 + 登出
 * 登出流程：清空用户态 → 移除动态路由（resetRoutes）→ 跳登录页
 */
import { usePermissionStoreWithOut } from '@/store/modules/permission'
import { useUserStoreWithOut } from '@/store/modules/user'

const userStore = useUserStoreWithOut()
const permissionStore = usePermissionStoreWithOut()
const router = useRouter()

function handleMenuClick({ key }: { key: string }) {
  if (key === 'logout') {
    // 1. 清空 token / 角色 / 权限码
    userStore.logout()
    // 2. ⭐ 移除动态注册的路由：否则切换账号后，上一个账号的页面还能访问
    permissionStore.resetRoutes()
    // 3. 回登录页
    router.push('/login')
  }
}

const dropdownItems = [
  { key: 'logout', label: '退出登录' },
]
</script>

<template>
  <div class="flex gap-3 items-center">
    <!-- 角色标签，方便演示时确认当前身份 -->
    <ATag v-for="role in userStore.roles" :key="role" color="blue">
      {{ role }}
    </ATag>
    <ADropdown :menu="{ items: dropdownItems, onClick: handleMenuClick }">
      <div class="flex-center gap-2 cursor-pointer">
        <AAvatar :size="32" :src="userStore.avatar">
          {{ userStore.nickname?.charAt(0).toUpperCase() }}
        </AAvatar>
        <span class="text-sm">{{ userStore.nickname }}</span>
      </div>
    </ADropdown>
  </div>
</template>
