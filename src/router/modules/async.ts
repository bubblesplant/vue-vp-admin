/**
 * @file 动态路由表（asyncRoutes）—— 页面权限的核心
 * -------------------------------------------------------
 * 这些是「需要按角色过滤」的路由。它们【不会】在创建 router 时注册，
 * 而是等用户登录后，在全局前置守卫里：
 *   filterAsyncRoutes(asyncRoutes, roles) → router.addRoute('layout', route)
 *
 * meta.roles 说明：
 *   - ['admin']            → 仅 admin 可见（菜单和路由都会隐藏）
 *   - ['admin','editor']   → admin / editor 可见，guest 不可见
 *   - 不写                 → 登录即可见
 *
 * 真实项目里这张表常由后端接口返回，前端只负责 addRoute 注册。
 */
import type { RouteRecordRaw } from 'vue-router'

import { h, resolveComponent } from 'vue'

/** 分组路由的占位组件：父路由自身没有页面，只渲染子路由出口 <RouterView> */
const RouterViewWrapper = { render: () => h(resolveComponent('RouterView')) }

export const asyncRoutes: RouteRecordRaw[] = [
  // ============ 权限演示分组 ============
  {
    path: '/permission',
    name: 'Permission',
    // 分组路由自身不需要 component，它只是一个菜单分组 + 路由前缀，
    // 渲染出口用 <RouterView>（二级路由的出口）
    component: RouterViewWrapper,
    meta: { title: '权限演示', icon: 'svg-lock' },
    children: [
      {
        path: 'page',
        name: 'PermissionPage',
        component: () => import('@/views/permission/page.vue'),
        meta: { title: '页面权限', roles: ['admin', 'editor', 'guest'], transition: 'slide-left' },
      },
      {
        path: 'button',
        name: 'PermissionButton',
        component: () => import('@/views/permission/button.vue'),
        meta: { title: '按钮权限', roles: ['admin', 'editor', 'guest'], keepAlive: true, transition: 'slide-left' },
      },
      {
        // ⭐ 只有 admin 才能看到这条路由（菜单 + 路由双隐藏）
        path: 'admin-only',
        name: 'AdminOnly',
        component: () => import('@/views/permission/admin-only.vue'),
        meta: { title: '仅管理员可见', roles: ['admin'], transition: 'slide-left' },
      },
    ],
  },

  // ============ 功能演示分组 ============
  {
    path: '/feature',
    name: 'Feature',
    component: RouterViewWrapper,
    meta: { title: '功能演示', icon: 'svg-star' },
    children: [
      {
        path: 'directive',
        name: 'DirectiveDemo',
        component: () => import('@/views/feature/directive.vue'),
        meta: { title: '自定义指令', transition: 'fade' },
      },
      {
        path: 'dynamic-component',
        name: 'DynamicComponent',
        component: () => import('@/views/feature/dynamic-component.vue'),
        meta: { title: 'component 动态渲染', keepAlive: true, transition: 'fade' },
      },
      {
        path: 'define-component',
        name: 'DefineComponent',
        component: () => import('@/views/feature/define-component.vue'),
        meta: { title: 'defineComponent', transition: 'fade' },
      },
      {
        path: 'transition',
        name: 'TransitionDemo',
        component: () => import('@/views/feature/transition.vue'),
        meta: { title: 'Transition 过渡', transition: 'zoom' },
      },
      {
        path: 'keep-alive-a',
        name: 'KeepAliveA',
        component: () => import('@/views/feature/keep-alive-a.vue'),
        // ⭐ keepAlive: true → layout 的 <KeepAlive include> 会缓存它
        meta: { title: 'KeepAlive 页面A', keepAlive: true, transition: 'slide-right' },
      },
      {
        path: 'keep-alive-b',
        name: 'KeepAliveB',
        component: () => import('@/views/feature/keep-alive-b.vue'),
        // 不加 keepAlive → 对比组，切走再切回状态会丢失
        meta: { title: 'KeepAlive 页面B(不缓存)', transition: 'slide-right' },
      },
      {
        path: 'hooks',
        name: 'HooksDemo',
        component: () => import('@/views/feature/hooks.vue'),
        meta: { title: 'Hooks 组合式函数', transition: 'fade' },
      },
      {
        path: 'component-guard',
        name: 'ComponentGuard',
        component: () => import('@/views/feature/component-guard.vue'),
        meta: { title: '组件内守卫', transition: 'fade' },
      },
      {
        path: 'route-guard',
        name: 'RouteGuard',
        component: () => import('@/views/feature/route-guard.vue'),
        meta: { title: '路由独享守卫', transition: 'fade' },
        // ⭐⭐⭐ 路由独享守卫 beforeEnter：只在这一条路由生效
        // 常见用途：进入某个重要页面前的二次校验（如短信验证、付费校验）
        beforeEnter: (_to, _from) => {
          // 演示：弹窗询问是否进入（真实项目里是权限/风控校验）
          const pass = window.confirm(
            '【路由独享守卫 beforeEnter】\n该守卫只配置在「路由独享守卫」这一条路由上。\n点击「确定」放行，点击「取消」留在当前页。',
          )
          // 返回 false 或抛错 → 取消本次导航；返回 true/undefined → 放行
          // 也可以 return { path: '/403' } 重定向
          return pass
        },
      },
    ],
  },
]
