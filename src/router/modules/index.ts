/**
 * @file 路由模块入口
 * -------------------------------------------------------
 * basicRoutes  → 静态路由，创建 router 实例时立即注册（无需登录）
 * asyncRoutes  → 动态路由，登录后按角色过滤 + router.addRoute 注册
 */
export { asyncRoutes } from './async'
export { basicRoutes } from './basic'
