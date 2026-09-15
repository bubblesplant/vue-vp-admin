<script setup lang="ts">
/**
 * @file 演示子组件 A：一个带状态的表单
 * 用于演示 <component :is> 切换时，配合 KeepAlive 状态不丢失。
 */
defineOptions({ name: 'TabForm' })

const form = reactive({ name: '', remark: '' })
</script>

<template>
  <ACard title="组件A：用户表单（切 Tab 再回来，输入内容还在）" size="small">
    <AForm layout="vertical">
      <AFormItem label="姓名">
        <AInput v-model:value="form.name" placeholder="输入点什么，然后切换到别的 Tab 再回来" />
      </AFormItem>
      <AFormItem label="备注">
        <ATextarea v-model:value="form.remark" />
      </AFormItem>
    </AForm>
  </ACard>
</template>
