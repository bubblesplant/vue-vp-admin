<script setup lang="ts">
/**
 * @file 演示子组件 B：一个计数器
 */
defineOptions({ name: 'TabCounter' })

const count = ref(0)
</script>

<template>
  <ACard title="组件B：计数器（切 Tab 再回来，数字不清零）" size="small">
    <div class="flex-center flex-col gap-4 py-6">
      <span class="text-5xl font-bold text-blue-500">{{ count }}</span>
      <ASpace>
        <AButton @click="count--">-1</AButton>
        <AButton type="primary" @click="count++">+1</AButton>
      </ASpace>
    </div>
  </ACard>
</template>
