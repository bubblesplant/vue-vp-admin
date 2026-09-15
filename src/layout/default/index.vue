<script lang="ts" setup>
/**
 * @file 主布局：侧边栏菜单 + 顶栏 + 内容区
 * -------------------------------------------------------
 * 三个核心演示点：
 *  1.【页面权限】菜单数据源 = 静态首页 + permissionStore.menuRoutes（动态路由），
 *     不同角色登录后菜单不同。
 *  2.【Transition】<RouterView v-slot> 拿到 Component，包一层 <Transition>，
 *     name 读取当前路由的 meta.transition，实现「每个页面不同的切换动画」。
 *  3.【KeepAlive】<KeepAlive :include="cachedViews"> 按组件 name 缓存页面，
 *     路由 meta.keepAlive = true 的页面切走再切回，状态（表单、计数器）不丢失。
 */
import type { MenuItemType } from 'antdv-next'
import type { RouteRecordRaw } from 'vue-router'

import SvgIcon from '@/components/Icon/svg-icon.vue'
import { usePermissionStore } from '@/store/modules/permission'

import Header from './header/index.vue'

const route = useRoute()
const router = useRouter()
const permissionStore = usePermissionStore()

const collapsed = ref(false)

/** 当前激活的菜单项：取路由匹配链上的 name */
const selectedKeys = computed(() => {
  const matched = route.matched.map(item => item.name)
  return matched.filter(Boolean) as string[]
})

/** 展开的子菜单 */
const openKeys = ref<string[]>([])
watchEffect(() => {
  const matched = route.matched.map(item => item.name).filter(Boolean) as string[]
  if (matched.length > 1) {
    openKeys.value = [matched[0]]
  }
})

function handleMenuClick({ key }: { key: string }) {
  router.push({ name: key })
}

/** 渲染菜单图标 */
function renderIcon(icon?: string) {
  if (!icon)
    return null
  const isSvgIcon = icon.startsWith('svg-')
  if (isSvgIcon) {
    return h(SvgIcon, {
      icon: icon.replace('svg-', ''),
      style: { fontSize: '18px' },
    })
  }
  return null
}

/** 递归把路由表转成 a-menu 的 items */
function getMenuItems(routes: RouteRecordRaw[]): MenuItemType[] {
  return routes
    .filter(item => !item.meta?.hideInMenu)
    .map((item) => {
      const hasChildren = item.children && item.children.length > 0
      if (hasChildren) {
        return {
          key: item.name as string,
          label: item.meta?.title ?? String(item.name ?? ''),
          icon: renderIcon(item.meta?.icon as string),
          children: getMenuItems(item.children!),
        }
      }
      return {
        key: item.name as string,
        label: item.meta?.title ?? String(item.name ?? ''),
        icon: renderIcon(item.meta?.icon as string),
      }
    })
}

/**
 * 菜单数据源：
 *   静态部分（首页） + 动态部分（permissionStore.menuRoutes，登录后按角色过滤）
 */
const menuItems = computed(() => {
  // 静态首页菜单
  const homeMenu: MenuItemType = {
    key: 'Home',
    label: '首页',
    icon: renderIcon('svg-home'),
  }
  return [homeMenu, ...getMenuItems(permissionStore.menuRoutes)]
})

/**
 * ⭐⭐⭐ KeepAlive 缓存列表
 * 遍历所有已注册路由，收集 meta.keepAlive = true 的【组件 name】。
 *
 * ⚠️ 关键坑点：include 匹配的是「组件的 name 选项」而不是路由 name！
 *    使用 <script setup> 的组件默认没有 name，
 *    必须在页面里用 defineOptions({ name: 'KeepAliveA' }) 显式声明，
 *    且要和这里收集的名字一致，缓存才会生效。
 */
const cachedViews = computed(() => {
  const names: string[] = []
  router.getRoutes().forEach((r) => {
    if (r.meta?.keepAlive && r.name) {
      names.push(String(r.name))
    }
  })
  return names
})
</script>

<template>
  <ALayout class="h-screen">
    <ALayoutSider
      v-model:collapsed="collapsed"
      :trigger="null"
      collapsible
      :width="220"
      class="layout-sider"
    >
      <div class="logo flex-center gap-2 h-[var(--header-height)]">
        <SvgIcon icon="logo" class="text-2xl" />
        <span v-show="!collapsed" class="text-lg text-white font-bold">
          Vue Admin 学习版
        </span>
      </div>
      <AMenu
        v-model:selected-keys="selectedKeys"
        v-model:open-keys="openKeys"
        :items="menuItems"
        theme="dark"
        mode="inline"
        @click="handleMenuClick"
      />
    </ALayoutSider>

    <ALayout>
      <ALayoutHeader class="layout-header px-4 flex items-center justify-between">
        <div class="flex gap-3 items-center">
          <AButton
            type="text"
            class="flex-center"
            @click="collapsed = !collapsed"
          >
            <SvgIcon
              :icon="collapsed ? 'menu-unfold' : 'menu-fold'"
              style="font-size: 18px"
            />
          </AButton>
          <!-- 面包屑：展示当前路由的匹配链 -->
          <ABreadcrumb>
            <ABreadcrumbItem v-for="item in route.matched.filter(r => r.meta?.title)" :key="item.path">
              {{ item.meta?.title }}
            </ABreadcrumbItem>
          </ABreadcrumb>
        </div>
        <Header />
      </ALayoutHeader>

      <ALayoutContent class="layout-content p-4 overflow-auto">
        <!--
          ⭐⭐⭐ RouterView 的 v-slot 用法：
          默认 <RouterView /> 直接渲染匹配组件；
          用 v-slot 拿到 { Component, route } 后，
          就可以在外面包 <Transition> 和 <KeepAlive>。
        -->
        <RouterView v-slot="{ Component, route: currentRoute }">
          <!--
            Transition：name 读取路由 meta.transition（fade/slide-left/zoom...），
            mode="out-in" = 旧页面先离开，新页面再进入（避免两个页面同时占位）
          -->
          <Transition :name="currentRoute.meta?.transition || 'fade'" mode="out-in">
            <!--
              KeepAlive：include 里的组件 name 会被缓存。
              key 用 fullPath，保证同一路由不同参数时是不同缓存实例。
            -->
            <KeepAlive :include="cachedViews">
              <component :is="Component" :key="currentRoute.fullPath" />
            </KeepAlive>
          </Transition>
        </RouterView>
      </ALayoutContent>
    </ALayout>
  </ALayout>
</template>

<style lang="scss" scoped>
.layout-sider {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: auto;
}

.layout-header {
  height: var(--header-height);
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  padding: 0;
}

.layout-content {
  min-height: calc(100vh - var(--header-height));
  background: #f5f5f5;
}

.logo {
  justify-content: center;
}
</style>
