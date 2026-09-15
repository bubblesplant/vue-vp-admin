<script setup lang="ts">
/**
 * @file KeepAlive 演示页 B（不缓存，对照组）
 * -------------------------------------------------------
 * 本页路由 meta 没有 keepAlive → 切走时组件直接 unmount，
 * 所有状态（输入、计数）全部丢失。
 * 和页面A 对比，直观感受 KeepAlive 的作用。
 */
import { onMounted, onUnmounted } from 'vue'

defineOptions({ name: 'KeepAliveB' })

const form = reactive({ username: '' })
const count = ref(0)
const logs = ref<string[]>([])

function log(msg: string) {
  logs.value.unshift(`[${new Date().toLocaleTimeString()}] ${msg}`)
}

onMounted(() => log('onMounted：每次进入都会执行（因为没有缓存）'))
onUnmounted(() => log('onUnmounted：每次切走都会执行，状态随之销毁'))
</script>

<template>
  <div class="gap-4 grid grid-cols-1 lg:grid-cols-2">
    <ACard title="❌ 本页未被缓存（对照组）">
      <AForm layout="vertical">
        <AFormItem label="输入内容，切走再切回来 → 内容会丢失">
          <AInput v-model:value="form.username" placeholder="我会被重置" />
        </AFormItem>
      </AForm>
      <div class="flex items-center gap-4">
        <span class="text-3xl font-bold text-red-400">{{ count }}</span>
        <AButton type="primary" @click="count++">
          计数 +1
        </AButton>
      </div>
    </ACard>

    <ACard title="生命周期日志">
      <div class="log-box">
        <div v-for="(l, i) in logs" :key="i" class="text-sm leading-6">
          {{ l }}
        </div>
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
