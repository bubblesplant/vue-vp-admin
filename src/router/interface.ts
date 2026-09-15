/**
 * @file 路由类型扩展
 * -------------------------------------------------------
 * 通过 TypeScript 的「模块增强（module augmentation）」
 * 给 vue-router 的 RouteMeta 补充我们项目需要的字段，
 * 这样 meta.roles / meta.keepAlive 等都有类型提示。
 */
import type { RouteRecordRaw } from 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** 页面标题（后置守卫会把它写到 document.title） */
    title?: string
    /** 菜单图标（svg- 前缀走本地 svg sprite） */
    icon?: string
    /** 是否在侧边栏菜单中隐藏 */
    hideInMenu?: boolean
    /**
     * 【页面权限】允许访问该路由的角色列表
     * - 不设置或空数组 → 登录即可访问
     * - 设置了 → 只有拥有对应角色的用户才能访问（动态路由过滤依据）
     */
    roles?: string[]
    /** 【keep-alive】设置为 true 时，该页面组件会被缓存（切换标签不丢失状态） */
    keepAlive?: boolean
    /** 【Transition】路由切换时的过渡动画名称（fade / slide / zoom...） */
    transition?: string
    /** 路由独享守卫的演示标记 */
    needConfirm?: boolean
  }
}

export type MenuRouteRecordRawType = RouteRecordRaw & {
  meta?: {
    title?: string
    icon?: string
    hideInMenu?: boolean
    roles?: string[]
    keepAlive?: boolean
    transition?: string
  }
}
