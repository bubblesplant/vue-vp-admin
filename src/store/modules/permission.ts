/**
 * @file 权限 Store
 * -------------------------------------------------------
 * 负责两件事：
 *   1. 【页面权限】根据当前用户角色 roles，从「全量动态路由表 asyncRoutes」中
 *      过滤出该角色可见的路由，并通过 router.addRoute() 动态注册。
 *   2. 【按钮权限】保存当前用户的按钮权限码 perms，供 v-permission 指令和
 *      usePermission hook 使用。
 *
 * 整体流程（vue-admin 经典方案）：
 *   登录成功 → 拿到 roles → 全局前置守卫里调用 buildRoutes()
 *   → filterAsyncRoutes 按 meta.roles 过滤 → router.addRoute() 注册
 *   → 侧边栏菜单读取 store 里的 menuRoutes 渲染
 */
import type { RouteRecordRaw } from 'vue-router'

import { defineStore } from 'pinia'

import { asyncRoutes, basicRoutes } from '@/router/modules'
import { router } from '@/router'

import { store } from '..'
import { useUserStoreWithOut } from './user'

/** 判断某条路由是否对当前角色可见 */
function hasRole(route: RouteRecordRaw, roles: string[]): boolean {
  // 路由 meta 上没有配 roles → 公共页面，所有登录用户都可见
  if (!route.meta?.roles || (route.meta.roles as string[]).length === 0) {
    return true
  }
  // admin 是超级管理员，放行一切
  if (roles.includes('admin')) {
    return true
  }
  // 交集判断：用户角色里只要有一个在路由允许的角色里即可
  return (route.meta.roles as string[]).some(r => roles.includes(r))
}

/** 递归过滤动态路由表 */
export function filterAsyncRoutes(routes: RouteRecordRaw[], roles: string[]): RouteRecordRaw[] {
  const result: RouteRecordRaw[] = []
  routes.forEach((route) => {
    const tmp = { ...route }
    if (hasRole(tmp, roles)) {
      // 有子路由则递归过滤；过滤后没有子路由了，children 置空
      if (tmp.children?.length) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      result.push(tmp)
    }
  })
  return result
}

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    /** 动态路由是否已经注册过（防止重复 addRoute） */
    isRoutesBuilt: false,
    /** 当前用户「可见的动态路由」，侧边栏菜单用它渲染 */
    menuRoutes: [] as RouteRecordRaw[],
    /** 记录动态注册过的路由 name，登出时用于 removeRoute */
    addedRouteNames: [] as (string | symbol)[],
  }),

  actions: {
    /**
     * 核心方法：按角色生成并注册动态路由
     * 在全局前置守卫中调用（登录后首次进入受保护页面时）
     */
    buildRoutes() {
      const userStore = useUserStoreWithOut()

      // 1. 按角色过滤全量动态路由表
      const accessedRoutes = filterAsyncRoutes(asyncRoutes, userStore.roles)

      // 2. ⭐ addRoute 动态注册：这是 vue-router 4/5 的官方写法
      //    （vue-router 3 时代的 router.addRoutes() 已废弃，4 之后用循环 addRoute）
      accessedRoutes.forEach((route) => {
        // 注册为 layout 的子路由（这样页面才能显示在布局的 <RouterView> 里）
        router.addRoute('layout', route)
        if (route.name) {
          this.addedRouteNames.push(route.name)
        }
      })

      // 3. 兜底：所有未匹配路径 → 404（必须在动态路由注册完之后再注册，
      //    否则刷新时动态路由还没注册好就被 404 拦截了）
      router.addRoute({
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/views/error/404.vue'),
        meta: { title: '404' },
      })

      this.menuRoutes = accessedRoutes
      this.isRoutesBuilt = true
    },

    /** 登出/切换账号时：移除已注册的动态路由，重置状态 */
    resetRoutes() {
      this.addedRouteNames.forEach(name => router.hasRoute(name) && router.removeRoute(name))
      router.hasRoute('NotFound') && router.removeRoute('NotFound')
      this.addedRouteNames = []
      this.menuRoutes = []
      this.isRoutesBuilt = false
    },
  },
})

export function usePermissionStoreWithOut() {
  return usePermissionStore(store)
}

export { basicRoutes }
