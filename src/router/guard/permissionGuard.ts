/**
 * @file 全局路由守卫 ⭐⭐⭐
 * -------------------------------------------------------
 * vue-router 完整的导航解析流程（按执行顺序）：
 *
 *   1. 导航被触发（router.push / <RouterLink> 点击）
 *   2. 【组件内守卫】离开组件的 beforeRouteLeave
 *   3. 【全局前置守卫】router.beforeEach        ← 本文件（登录校验、动态路由注册）
 *   4. 【组件内守卫】复用组件的 beforeRouteUpdate（如 /user/1 → /user/2）
 *   5. 【路由独享守卫】路由配置里的 beforeEnter  ← 见 router/modules/async.ts
 *   6. 解析异步路由组件（() => import(...)）
 *   7. 【组件内守卫】进入组件的 beforeRouteEnter
 *   8. 【全局解析守卫】router.beforeResolve      ← 本文件
 *   9. 导航被确认
 *  10. 【全局后置钩子】router.afterEach          ← 本文件（进度条、标题）
 *  11. 触发 DOM 更新
 *  12. 执行 beforeRouteEnter 里传给 next 的回调（组件实例已创建）
 */
import type { Router } from 'vue-router'

import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

import { usePermissionStoreWithOut } from '@/store/modules/permission'
import { useUserStoreWithOut } from '@/store/modules/user'

// NProgress 配置：不显示右上角的小圆圈 spinner
NProgress.configure({ showSpinner: false })

/** 白名单：无需登录即可访问的页面 */
const WHITE_LIST = ['/login', '/403']

export function createPermissionGuard(router: Router) {
  /**
   * ⭐⭐⭐ 全局前置守卫（最常用、最重要）
   * 每次导航都会经过这里。两大职责：
   *   1. 登录校验：没登录 → 重定向 /login
   *   2. 动态路由注册：登录了但还没注册权限路由 → addRoute 后用 replace 重新触发导航
   */
  router.beforeEach(async (to) => {
    NProgress.start()
    // 设置页面标题
    document.title = to.meta.title ? `${to.meta.title} · Vue Admin` : 'Vue Admin 学习版'

    const userStore = useUserStoreWithOut()
    const permissionStore = usePermissionStoreWithOut()

    // ---- 情况 1：未登录 ----
    if (!userStore.isLogin) {
      if (WHITE_LIST.includes(to.path)) {
        return true // 白名单直接放行
      }
      // 重定向到登录页，并记录想去的地址（redirect），登录后跳回
      return { path: '/login', query: { redirect: to.fullPath } }
    }

    // ---- 情况 2：已登录但访问登录页 → 送回首页 ----
    if (to.path === '/login') {
      return { path: '/' }
    }

    // ---- 情况 3：已登录，但动态路由还没注册（首次进入/刷新页面）----
    if (!permissionStore.isRoutesBuilt) {
      // 核心：按角色过滤 asyncRoutes 并 addRoute 注册
      permissionStore.buildRoutes()

      // ⚠️ 关键细节：新路由是【本次导航已经开始后】才注册的，
      //    所以必须用 replace 重新触发一次相同的导航，
      //    让路由表重新匹配，否则会 404。
      return { ...to, replace: true }
    }

    // ---- 情况 4：已登录且路由已注册 → 放行 ----
    return true
  })

  /**
   * ⭐ 全局解析守卫 beforeResolve
   * 时机：所有组件内守卫、异步组件都解析完之后，导航被【确认】之前。
   * 适合：在进入页面前做最后的数据预取（真实项目里常在这里请求页面数据）。
   */
  router.beforeResolve(async (_to) => {
    // 演示：这里可以做页面级数据预加载，例如 await fetchPageData()
  })

  /**
   * ⭐⭐⭐ 全局后置钩子 afterEach
   * 时机：导航确认之后（无法取消导航，所以没有 next 参数）。
   * 适合：埋点上报、关闭进度条等「收尾」工作。
   */
  router.afterEach((to, from, failure) => {
    NProgress.done()
    if (failure) {
      // 导航失败/被取消（例如被路由独享守卫拦下）时也会走到这里
      console.warn(`[路由守卫] 导航被取消: ${from.fullPath} → ${to.fullPath}`)
    }
  })

  /**
   * 导航错误处理（例如异步组件加载失败）
   */
  router.onError((error) => {
    NProgress.done()
    console.error('[路由错误]', error)
  })
}
