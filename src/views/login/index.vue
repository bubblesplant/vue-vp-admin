<script setup lang="ts">
/**
 * @file 登录页
 * -------------------------------------------------------
 * 无后端：调用 src/api/mock.ts 里的 loginApi（setTimeout 模拟接口）。
 * 三个演示账号，密码都是 123456：
 *   admin  → 角色 admin，所有页面 + 所有按钮权限
 *   editor → 角色 editor，部分页面 + 部分按钮权限（无删除/导出）
 *   guest  → 角色 guest，  只有基础页面，没有任何按钮权限
 */
import { message } from 'antdv-next'

import { useUserStore } from '@/store/modules/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const form = reactive({
  username: 'admin',
  password: '123456',
})

/** 快捷选择账号 */
function pick(username: string) {
  form.username = username
  form.password = '123456'
}

async function handleLogin() {
  loading.value = true
  try {
    await userStore.login(form.username, form.password)
    message.success(`登录成功，当前角色：${userStore.roles.join(', ')}`)
    // 登录成功后：跳回「登录前想去的页面」（全局前置守卫存在 query.redirect 里）
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  }
  catch (e: any) {
    message.error(e.message)
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page flex-center min-h-screen">
    <ACard class="w-[420px]" title="Vue Admin 学习版">
      <p class="mb-4 text-gray-400 text-sm">
        无后端纯前端演示 · 不同账号对应不同角色权限
      </p>

      <!-- 快捷账号选择 -->
      <div class="mb-4 flex gap-2">
        <AButton size="small" type="primary" @click="pick('admin')">
          admin（全权限）
        </AButton>
        <AButton size="small" @click="pick('editor')">
          editor（部分权限）
        </AButton>
        <AButton size="small" @click="pick('guest')">
          guest（只读）
        </AButton>
      </div>

      <AForm :model="form" layout="vertical" @finish="handleLogin">
        <AFormItem label="账号" name="username" :rules="[{ required: true, message: '请输入账号' }]">
          <AInput v-model:value="form.username" placeholder="admin / editor / guest" />
        </AFormItem>
        <AFormItem label="密码" name="password" :rules="[{ required: true, message: '请输入密码' }]">
          <AInputPassword v-model:value="form.password" placeholder="123456" />
        </AFormItem>
        <AButton type="primary" html-type="submit" block :loading="loading">
          登 录
        </AButton>
      </AForm>
    </ACard>
  </div>
</template>

<style lang="scss" scoped>
.login-page {
  background: linear-gradient(135deg, #1f1f3a 0%, #2d4a7a 100%);
}
</style>
