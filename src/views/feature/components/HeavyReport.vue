<script setup lang="ts">
/**
 * @file 模拟「重型业务组件」—— 配合 async-component.vue 做异步加载演示
 * -------------------------------------------------------
 * 它代表真实项目中的：富文本编辑器、复杂数据大屏/图表、Excel 预览、低代码设计器……
 * 特点：体积大、不是首屏必需、用户只有特定操作（点按钮/开弹窗）才需要。
 *
 * 注意：组件本身不关心自己是不是被异步加载的——
 * 「怎么加载」完全由父组件用 defineAsyncComponent 决定。
 */
defineOptions({ name: 'HeavyReport' })

/** 组件真正挂载的时刻（用来观察：只有异步 chunk 下载并解析完成后才会挂载） */
const mountedAt = ref('')
onMounted(() => {
  mountedAt.value = new Date().toLocaleTimeString('zh-CN', { hour12: false })
})

const stats = [
  { label: '今日销售额', value: '¥ 128,430', trend: '+12.5%', color: 'text-blue-500' },
  { label: '订单数', value: '3,286', trend: '+8.2%', color: 'text-green-500' },
  { label: '客单价', value: '¥ 390', trend: '-2.1%', color: 'text-red-500' },
  { label: '退款率', value: '0.8%', trend: '-0.3%', color: 'text-green-500' },
]

const bars = [
  { label: '周一', value: 62 },
  { label: '周二', value: 45 },
  { label: '周三', value: 78 },
  { label: '周四', value: 90 },
  { label: '周五', value: 70 },
  { label: '周六', value: 55 },
  { label: '周日', value: 83 },
]

const columns = [
  { title: '订单号', dataIndex: 'id' },
  { title: '客户', dataIndex: 'customer' },
  { title: '金额', dataIndex: 'amount' },
  { title: '状态', dataIndex: 'status' },
]

const rows = Array.from({ length: 6 }, (_, i) => ({
  id: 10001 + i,
  customer: `客户 ${i + 1}`,
  amount: `¥ ${(Math.round((88 - i * 7) * 123.4)).toLocaleString()}`,
  status: i % 3 === 0 ? '已完成' : i % 3 === 1 ? '配送中' : '待付款',
}))
</script>

<template>
  <div class="heavy-report">
    <AAlert
      class="mb-4"
      type="info"
      show-icon
      message="我是被 defineAsyncComponent 异步加载的独立 chunk"
      description="打开 DevTools → Network 筛选 JS：第一次显示我时才会出现 HeavyReport-xxxx.js；关掉再打开不再请求（Promise 缓存）。"
    />

    <p class="text-sm text-gray-500 mb-3">
      组件挂载时间（chunk 下载完成才会执行到这里）：<b class="text-blue-500">{{ mountedAt }}</b>
    </p>

    <!-- 指标卡 -->
    <div class="mb-4 gap-3 grid grid-cols-4">
      <div
        v-for="s in stats"
        :key="s.label"
        class="p-3 border border-gray-200 rounded"
      >
        <div class="text-xs text-gray-400">
          {{ s.label }}
        </div>
        <div class="text-xl font-bold mt-1">
          {{ s.value }}
        </div>
        <div class="text-xs mt-1" :class="s.color">
          {{ s.trend }}
        </div>
      </div>
    </div>

    <!-- 纯 CSS 柱状图（避免引入 echarts，让这个演示组件保持轻量、无外部依赖） -->
    <ACard title="本周销售趋势（组件内部复杂 UI，仅作示意）" size="small" class="mb-4">
      <!--
        高度链路必须闭合，否则子元素的 height: % 会解析为 0：
        外层 h-40（确定高度）→ 列 h-full flex-col（满高）
        → 绘图区 flex-1（拿到「减去标签后」的确定高度）→ 柱子 height: x% 才有参照
        注意：外层若用 items-end，列不会被拉伸，柱子百分比会因父高度 auto 而塌成 0。
      -->
      <div class="px-2 flex gap-4 h-40">
        <div v-for="b in bars" :key="b.label" class="flex flex-1 flex-col gap-1 h-full items-center">
          <div class="flex flex-1 w-full items-end">
            <div
              class="rounded-t bg-blue-400 w-full transition-all"
              :style="{ height: `${b.value}%` }"
            />
          </div>
          <span class="text-xs text-gray-500">{{ b.label }}</span>
        </div>
      </div>
    </ACard>

    <!-- 数据表格（antdv-next 的 Table 只支持 columns 配置式写法，没有列子组件） -->
    <ATable
      size="small"
      :columns="columns"
      :data-source="rows"
      :pagination="false"
      row-key="id"
    />
  </div>
</template>
