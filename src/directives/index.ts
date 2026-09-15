/**
 * @file 自定义指令统一注册入口
 * -------------------------------------------------------
 * 在 main.ts 中调用 setupDirectives(app) 完成全局注册。
 * 注册后，模板里用 v-permission / v-copy / v-debounce 即可。
 */
import type { App } from 'vue'

import { copy } from './copy'
import { debounce } from './debounce'
import { permission } from './permission'

export function setupDirectives(app: App) {
  // app.directive('名字', 指令对象) → 模板中用 v-名字
  app.directive('permission', permission)
  app.directive('copy', copy)
  app.directive('debounce', debounce)
}
