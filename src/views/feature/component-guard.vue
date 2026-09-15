<script lang="ts">
/**
 * @file 组件内守卫演示 ⭐⭐⭐
 * -------------------------------------------------------
 * 组件内守卫写在组件自身上，三种：
 *   beforeRouteEnter  → 进入本组件前（拿不到 this，组件还没创建）
 *   beforeRouteUpdate → 路由变化但复用本组件时（如 /user/1 → /user/2）
 *   beforeRouteLeave  → 离开本组件前（最常用：表单未保存提醒）
 *
 * 在 <script setup> 里使用：从 vue-router 导入 onBeforeRouteLeave / onBeforeRouteUpdate
 * 但 beforeRouteEnter 不支持组合式写法（组件还没创建），需要用普通 export default。
 *
 * 所以本组件特意不用 <script setup>，演示 Options API 风格写守卫。
 */
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ComponentGuard',
  data() {
    return {
      formDirty: false,
      text: '',
      logs: [] as string[],
    }
  },
  methods: {
    log(msg: string) {
      this.logs.unshift(`[${new Date().toLocaleTimeString()}] ${msg}`)
    },
  },

  /**
   * beforeRouteEnter：进入组件【之前】调用
   * ⚠️ 此时组件实例还没创建，访问不到 this！
   *    如果确实需要实例，next(vm => { ... }) 回调里拿（导航确认后执行）
   */
  beforeRouteEnter(to, from, next) {
    console.log(`[beforeRouteEnter] ${from.fullPath} → ${to.fullPath}`)
    next((vm: any) => {
      // 回调里可以拿到组件实例
      vm.log('beforeRouteEnter：进入本组件（next 回调中拿到实例）')
    })
  },

  /**
   * beforeRouteUpdate：路由参数变化但复用本组件时调用
   * （本页没做参数路由，写出来供参考；可以用 this）
   */
  beforeRouteUpdate(to, from) {
    this.log(`beforeRouteUpdate：${from.fullPath} → ${to.fullPath}`)
  },

  /**
   * beforeRouteLeave：离开组件【之前】调用 ⭐ 最常用
   * 经典场景：表单填写了一半，防止误触导航丢失数据
   */
  beforeRouteLeave() {
    if (this.formDirty) {
      const pass = window.confirm(
        '【组件内守卫 beforeRouteLeave】\n表单有未保存的内容，确定要离开吗？\n「取消」将阻止本次导航。',
      )
      if (!pass) {
        this.log('beforeRouteLeave：阻止了离开（表单未保存）')
        return false // 返回 false → 取消导航，留在本页
      }
    }
    this.log('beforeRouteLeave：放行离开')
    return true
  },
})
</script>

<template>
  <div class="gap-4 grid grid-cols-1 lg:grid-cols-2">
    <ACard title="编辑区（输入内容后不保存就离开试试）">
      <AForm layout="vertical">
        <AFormItem label="随便输入点什么（会标记表单为「未保存」）">
          <AInput
            v-model:value="text"
            placeholder="输入后点左侧菜单切换页面，会弹出离开确认"
            @change="formDirty = true"
          />
        </AFormItem>
      </AForm>
      <ASpace>
        <ATag :color="formDirty ? 'orange' : 'green'">
          {{ formDirty ? '未保存（离开会被拦截）' : '已保存/未修改（可自由离开）' }}
        </ATag>
        <AButton type="primary" @click="formDirty = false; log('保存成功，formDirty 置为 false')">
          保存（清除拦截）
        </AButton>
      </ASpace>
    </ACard>

    <ACard title="守卫触发日志">
      <div class="log-box">
        <div v-for="(l, i) in logs" :key="i" class="text-sm leading-6">
          {{ l }}
        </div>
      </div>
      <p class="mt-3 text-gray-400 text-sm">
        守卫完整顺序（同时打开 Console 看 beforeRouteEnter 的日志）：
        beforeRouteLeave(本组件) → beforeEach(全局) → beforeEnter(独享) → 组件解析 → beforeRouteEnter(目标组件) → beforeResolve(全局) → afterEach(全局)
      </p>
    </ACard>
  </div>
</template>

<style lang="scss" scoped>
.log-box {
  min-height: 160px;
  background: #fafafa;
  border-radius: 8px;
  padding: 12px;
}
</style>
