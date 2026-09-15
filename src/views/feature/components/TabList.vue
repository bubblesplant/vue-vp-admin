<script setup lang="ts">
/**
 * @file 演示子组件 C：列表（配合 KeepAlive 缓存滚动/选中状态）
 */
defineOptions({ name: 'TabList' })

const list = ref(Array.from({ length: 20 }, (_, i) => ({ id: i + 1, checked: false })))
const checkedCount = computed(() => list.value.filter(i => i.checked).length)
</script>

<template>
  <ACard :title="`组件C：勾选列表（已选 ${checkedCount} 项，切 Tab 再回来勾选还在）`" size="small">
    <div class="gap-2 grid grid-cols-4">
      <ACheckbox
        v-for="item in list"
        :key="item.id"
        v-model:checked="item.checked"
      >
        选项 {{ item.id }}
      </ACheckbox>
    </div>
  </ACard>
</template>
