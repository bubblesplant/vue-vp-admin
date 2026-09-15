/**
 * @file 静态路由（basicRoutes）
 * -------------------------------------------------------
 * 不需要权限、无需登录即可访问的路由，在创建 router 实例时直接注册：
 *   - /login  登录页
 *   - /403    无权限页
 *   - layout  主布局（/home 等公共页面挂在这里）
 *
 * ⚠️ 404 路由不在这里注册！必须在动态路由 addRoute 完成之后再注册，
 *    否则刷新页面时动态路由还没注册好，会被 404 抢先匹配。
 */
import type { RouteRecordRaw } from 'vue-router'

export const basicRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', hideInMenu: true },
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/error/403.vue'),
    meta: { title: '无权限', hideInMenu: true },
  },
  {
    // 主布局：所有需要「侧边栏 + 顶栏」的页面都是它的 children
    path: '/',
    name: 'layout',
    component: () => import('@/layout/default/index.vue'),
    redirect: '/home',
    children: [
      {
        // 首页属于公共页面：所有登录用户都可见，所以放静态路由
        path: '/home',
        name: 'Home',
        component: () => import('@/views/home/index.vue'),
        meta: { title: '首页', icon: 'svg-home', keepAlive: true, transition: 'fade' },
      },
    ],
  },
]
