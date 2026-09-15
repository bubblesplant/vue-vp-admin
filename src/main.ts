/**
 * @file 应用入口
 * -------------------------------------------------------
 * 初始化顺序：
 *   createApp → setupStore(pinia) → setupDirectives(自定义指令) → setupRouter(路由+守卫) → mount
 */
import { createApp } from 'vue'

import App from './App.vue'
import { setupDirectives } from './directives'
import { setupRouter } from './router'
import { setupStore } from './store'

import 'virtual:svg-icons-register'

import '@/styles/index.scss'
import 'virtual:uno.css'

const app = createApp(App)

// pinia 必须先于路由守卫可用（守卫里用了 userStore/permissionStore）
setupStore(app)
// 注册全局自定义指令：v-permission / v-copy / v-debounce
setupDirectives(app)
// 路由（内部会挂上全局守卫）
setupRouter(app)

app.mount('#app')
