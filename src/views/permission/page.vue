<script setup lang="ts">
/**
 * @file 页面权限演示 ⭐⭐⭐
 * -------------------------------------------------------
 * 核心原理（前端控制方案）：
 *   1. 路由分两类：
 *      - 静态路由 basicRoutes：login/403/home，创建 router 时就注册
 *      - 动态路由 asyncRoutes：带 meta.roles，登录后按角色过滤再 addRoute
 *   2. 全局前置守卫（router/guard/permissionGuard.ts）：
 *      登录后首次导航 → buildRoutes() → router.addRoute('layout', route)
 *      → return { ...to, replace: true } 重新触发导航
 *   3. 菜单数据源 = permissionStore.menuRoutes → 菜单随角色变化
 *
 * 关键点：没有权限的路由【根本没有被注册】，直接访问 URL 会落到 404。
 */
import { computed } from 'vue'

import { asyncRoutes } from '@/router/modules'
import { usePermissionStore } from '@/store/modules/permission'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()
const permissionStore = usePermissionStore()

/** 把路由树拍平成表格数据，展示「全量路由 vs 我的角色」 */
interface Row {
  path: string
  title: string
  roles: string[]
  visible: boolean
}

function flatten(routes: any[], prefix = ''): Row[] {
  return routes.flatMap((r) => {
    const path = `${prefix}/${r.path}`.replace('//', '/')
    const roles = (r.meta?.roles as string[]) ?? ['（登录即可见）']
    const row: Row = {
      path,
      title: r.meta?.title ?? String(r.name),
      roles,
      visible: r.meta?.roles
        ? r.meta.roles.some((role: string) => userStore.roles.includes(role)) || userStore.roles.includes('admin')
        : true,
    }
    const children = r.children?.length ? flatten(r.children, path) : []
    return [row, ...children]
  })
}

const rows = computed(() => flatten(asyncRoutes))

const columns = [
  { title: '路由路径', dataIndex: 'path' },
  { title: '页面', dataIndex: 'title' },
  { title: '允许的角色', dataIndex: 'roles' },
  { title: '我能否访问', dataIndex: 'visible' },
]
</script>

<template>
  <div>
    <ACard class="mb-4" title="页面权限原理">
      <ol class="text-gray-600 leading-7 list-decimal list-inside">
        <li>路由表分两部分：<code>basicRoutes</code>（静态，启动即注册）和 <code>asyncRoutes</code>（动态，带 <code>meta.roles</code>）。</li>
        <li>登录后，全局前置守卫调用 <code>permissionStore.buildRoutes()</code>：按角色过滤 asyncRoutes，再用 <code>router.addRoute('layout', route)</code> 注册。</li>
        <li>注册后 <code>return { ...to, replace: true }</code> 重新触发导航（否则本次导航匹配不到新路由）。</li>
        <li>菜单渲染的是过滤后的路由 → 没权限的页面【菜单看不到、URL 也访问不到】。</li>
      </ol>
      <div class="mt-2">
        当前角色：<ATag v-for="r in userStore.roles" :key="r" color="blue">{{ r }}</ATag>
        已注册动态路由数：<ATag color="green">{{ permissionStore.menuRoutes.length }} 组</ATag>
      </div>
    </ACard>

    <ACard title="全量动态路由表 vs 我的角色">
      <ATable :columns="columns" :data-source="rows" :pagination="false" row-key="path" size="small">
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'roles'">
            <ATag v-for="r in record.roles" :key="r" class="mr-1">{{ r }}</ATag>
          </template>
          <template v-if="column.dataIndex === 'visible'">
            <ATag :color="record.visible ? 'green' : 'red'">
              {{ record.visible ? '✓ 可见' : '✗ 路由未注册' }}
            </ATag>
          </template>
        </template>
      </ATable>
      <p class="mt-3 text-gray-400 text-sm">
        试试：退出登录，换 editor / guest 账号，回到本页看「我能否访问」一列的变化；guest 登录后左侧菜单会少很多项。
      </p>
    </ACard>
  </div>
</template>
