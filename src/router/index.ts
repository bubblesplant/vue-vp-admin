/**
 * @file 创建路由实例
 * -------------------------------------------------------
 * 注意：这里只注册【静态路由】！
 * 动态路由（asyncRoutes）在全局前置守卫中通过 router.addRoute() 按需注册，
 * 这就是「页面权限」的实现基础 —— 不同角色登录后看到/能访问的页面不同。
 */
import type { App } from 'vue'

import { createRouter, createWebHistory } from 'vue-router'

import { setupGuard } from './guard'
import { basicRoutes } from './modules'

export const router = createRouter({
  history: createWebHistory(),
  routes: basicRoutes,
  strict: true,
  // 每次路由切换后滚动到顶部
  scrollBehavior: () => ({ left: 0, top: 0 }),
})

export function setupRouter(app: App) {
  setupGuard(router)
  app.use(router)
}
