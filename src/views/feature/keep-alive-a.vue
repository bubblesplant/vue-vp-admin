<script setup lang="ts">
/**
 * @file KeepAlive 演示页 A（被缓存）⭐⭐⭐
 * -------------------------------------------------------
 * 本页路由 meta.keepAlive = true，且组件有 name → 会被 layout 的
 * <KeepAlive :include="cachedViews"> 缓存。
 *
 * 验证方法：
 *   1. 在下面输入内容、点几下计数器
 *   2. 切到「KeepAlive 页面B」或任意其他页面
 *   3. 切回来 → 输入内容和计数都还在！
 *   （对比：页面B 没开缓存，切走再回来会被重置）
 *
 * ⭐ 关键坑点：KeepAlive 的 include 匹配的是【组件 name】不是路由 name！
 *    <script setup> 组件必须用 defineOptions({ name: 'xxx' }) 显式声明。
 *
 * 生命周期变化：
 *   普通组件：created → mounted → unmounted
 *   缓存组件：created → mounted → deactivated（休眠）→ activated（唤醒）
 */
import { onActivated, onDeactivated, onMounted, onUnmounted } from 'vue'

// ⭐ 这个名字必须和路由 name、layout 收集的 cachedViews 一致
defineOptions({ name: 'KeepAliveA' })

const form = reactive({ username: '', remark: '' })
const count = ref(0)
const logs = ref<string[]>([])

function log(msg: string) {
  logs.value.unshift(`[${new Date().toLocaleTimeString()}] ${msg}`)
}

onMounted(() => log('onMounted：组件首次挂载（只有第一次进入才执行）'))
onUnmounted(() => log('onUnmounted：组件销毁（被缓存时不会执行）'))
onActivated(() => log('onActivated：从缓存中被唤醒'))
onDeactivated(() => log('onDeactivated：进入缓存休眠（状态保留）'))
</script>

<template>
  <div class="gap-4 grid grid-cols-1 lg:grid-cols-2">
    <ACard title="✅ 本页被 KeepAlive 缓存">
      <AForm layout="vertical">
        <AFormItem label="输入点什么，切走再切回来">
          <AInput v-model:value="form.username" placeholder="内容不会丢" />
        </AFormItem>
        <AFormItem label="备注">
          <ATextarea v-model:value="form.remark" />
        </AFormItem>
      </AForm>
      <div class="flex items-center gap-4">
        <span class="text-3xl font-bold text-blue-500">{{ count }}</span>
        <AButton type="primary" @click="count++">
          计数 +1
        </AButton>
      </div>
    </ACard>

    <ACard title="生命周期日志（观察缓存组件的特殊钩子）">
      <div class="log-box">
        <div v-for="(l, i) in logs" :key="i" class="text-sm leading-6">
          {{ l }}
        </div>
        <p v-if="!logs.length" class="text-gray-400 text-sm">
          暂无日志，切换页面再回来观察 onActivated / onDeactivated
        </p>
      </div>
    </ACard>
  </div>
</template>

<style lang="scss" scoped>
.log-box {
  min-height: 200px;
  max-height: 320px;
  overflow: auto;
  background: #fafafa;
  border-radius: 8px;
  padding: 12px;
}
</style>
