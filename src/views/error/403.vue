<script setup lang="ts">
/**
 * @file 403 无权限页
 */
const router = useRouter()
</script>

<template>
  <div class="flex-center flex-col gap-4 h-screen">
    <div class="text-7xl font-bold text-gray-300">
      403
    </div>
    <p class="text-gray-500">
      抱歉，你没有权限访问这个页面
    </p>
    <ASpace>
      <AButton type="primary" @click="router.push('/')">
        回首页
      </AButton>
      <AButton @click="router.back()">
        返回上一页
      </AButton>
    </ASpace>
  </div>
</template>
