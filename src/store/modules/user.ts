/**
 * @file 用户状态 Store
 * -------------------------------------------------------
 * 负责：登录 / 登出 / 存储 token / 用户信息 / 角色
 * 使用 pinia-plugin-persistedstate 持久化（刷新页面后 token 不丢失）
 */
import { defineStore } from 'pinia'

import { getUserInfoApi, loginApi } from '@/api/mock'

import { store } from '..'

export const useUserStore = defineStore('user', {
  state: () => ({
    /** 登录凭证（mock） */
    token: '' as string,
    /** 用户昵称 */
    nickname: '' as string,
    /** 头像 */
    avatar: '' as string,
    /** 角色列表，例如 ['admin']，页面权限（动态路由）按它过滤 */
    roles: [] as string[],
    /** 按钮权限码列表，例如 ['btn:add']，按钮权限按它判断 */
    perms: [] as string[],
  }),

  getters: {
    /** 是否已登录 */
    isLogin: state => !!state.token,
  },

  actions: {
    /** 登录：调 mock 接口拿 token → 再拿用户信息（角色/按钮权限） */
    async login(username: string, password: string) {
      const { token } = await loginApi(username, password)
      this.token = token
      await this.getUserInfo()
    },

    /** 根据 token 获取用户信息（角色、按钮权限码） */
    async getUserInfo() {
      const info = await getUserInfoApi(this.token)
      this.nickname = info.nickname
      this.avatar = info.avatar
      this.roles = info.roles
      this.perms = info.perms
    },

    /** 登出：清空状态（动态路由的移除在 layout 登出处理） */
    logout() {
      this.$reset()
    },
  },

  // 持久化到 localStorage：刷新页面后登录态保留
  persist: true,
})

/** 在 setup 外部使用（例如路由守卫里，守卫执行时 pinia 可能还未激活到组件） */
export function useUserStoreWithOut() {
  return useUserStore(store)
}
