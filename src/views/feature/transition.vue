<script setup lang="ts">
/**
 * @file <Transition> 动画过渡演示 ⭐⭐⭐
 * -------------------------------------------------------
 * Vue 提供两个内置过渡组件：
 *   <Transition>      → 单个元素/组件的 进入&离开（v-if / v-show / 动态组件）
 *   <TransitionGroup> → 列表的 进入&离开&移动（v-for）
 *
 * 触发过渡的条件（元素在 Transition 内部）：
 *   1. v-if 条件渲染
 *   2. v-show 条件显示
 *   3. <component :is> 动态组件切换
 *   4. 路由切换（RouterView 插槽，见 layout）
 *
 * CSS 类名规则见 src/styles/transition.scss 顶部注释。
 */
const show = ref(true)
const mode = ref<'fade' | 'zoom' | 'slide-left'>('fade')

/** TransitionGroup 演示数据 */
let id = 9
const list = ref([1, 2, 3, 4, 5, 6, 7, 8, 9])
function addItem() {
  const i = Math.floor(Math.random() * list.value.length)
  list.value.splice(i, 0, ++id)
}
function removeItem() {
  const i = Math.floor(Math.random() * list.value.length)
  list.value.splice(i, 1)
}
function shuffle() {
  list.value = [...list.value].sort(() => Math.random() - 0.5)
}
</script>

<template>
  <div>
    <ACard class="mb-4" title="演示一：单元素 Transition（v-if 切换）">
      <ASpace class="mb-4">
        <AButton type="primary" @click="show = !show">
          切换显示
        </AButton>
        <ARadioGroup v-model:value="mode">
          <ARadioButton value="fade">
            fade
          </ARadioButton>
          <ARadioButton value="zoom">
            zoom
          </ARadioButton>
          <ARadioButton value="slide-left">
            slide-left
          </ARadioButton>
        </ARadioGroup>
      </ASpace>

      <div class="h-24 flex-center">
        <!-- mode 绑定 name：同一元素可换不同动画 -->
        <Transition :name="mode" mode="out-in">
          <div v-if="show" key="a" class="demo-box bg-blue-400">
            元素 A
          </div>
          <div v-else key="b" class="demo-box bg-green-400">
            元素 B
          </div>
        </Transition>
      </div>
      <p class="mt-2 text-gray-400 text-sm">
        关键点：两个元素要有不同的 key，Vue 才会认为它们是两个元素（从而触发过渡）；
        mode="out-in" 表示旧元素先离开、新元素再进入。
      </p>
    </ACard>

    <ACard class="mb-4" title="演示二：TransitionGroup（列表过渡）">
      <ASpace class="mb-4">
        <AButton @click="addItem">
          随机插入
        </AButton>
        <AButton @click="removeItem">
          随机删除
        </AButton>
        <AButton @click="shuffle">
          随机洗牌
        </AButton>
      </ASpace>
      <!--
        TransitionGroup：渲染一个真实容器标签（tag="div"），
        子元素必须是 v-for 且有唯一 key；
        move-class 让「位置移动」也带上过渡（内部用 FLIP 技术）。
      -->
      <TransitionGroup name="list" tag="div" class="flex flex-wrap gap-2">
        <div v-for="n in list" :key="n" class="list-item">
          {{ n }}
        </div>
      </TransitionGroup>
    </ACard>

    <ACard title="演示三：路由级过渡">
      <p class="text-gray-600 leading-7">
        本项目每次路由切换都有动画：layout 里 <code>&lt;Transition :name="route.meta.transition"&gt;</code>，
        每个页面在路由 meta 里配自己的动画（fade / slide-left / slide-right / zoom）。
        点左侧菜单切换页面时注意看效果。
      </p>
    </ACard>
  </div>
</template>

<style lang="scss" scoped>
.demo-box {
  width: 160px;
  height: 64px;
  border-radius: 8px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.list-item {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: #1677ff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

/* TransitionGroup 的过渡类：list-enter-from / list-leave-to / list-move */
.list-enter-active,
.list-leave-active,
.list-move {
  transition: all 0.4s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: scale(0.5);
}
/* 离开的元素设为绝对定位，其余元素才能平滑地「补位移动」 */
.list-leave-active {
  position: absolute;
}
</style>
