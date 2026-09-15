/**
 * @file Mock 数据层（无后端模拟）
 * -------------------------------------------------------
 * 本项目是纯前端学习项目，没有真实后端。
 * 这里用「本地写死的数据 + setTimeout 模拟网络延迟」来模拟接口返回。
 *
 * 真实项目中，这些数据应该由后端接口返回：
 *   1. 登录接口     → 返回 token
 *   2. 用户信息接口 → 返回 用户基本信息 + 角色(roles) + 按钮权限码(perms)
 *   3. 动态路由表   → 也可以由后端返回，本项目为了演示「前端控制路由」写在本地
 */

/** 模拟的账号表：三个角色，用于演示不同权限 */
export interface MockUser {
  username: string
  password: string
  /** 角色编码：admin 超级管理员 / editor 运营 / guest 访客 */
  roles: string[]
  /** 按钮级权限码（真实项目由后端按角色下发） */
  perms: string[]
  avatar: string
  nickname: string
}

export const mockUsers: MockUser[] = [
  {
    username: 'admin',
    password: '123456',
    roles: ['admin'],
    // admin 拥有所有按钮权限
    perms: ['btn:add', 'btn:edit', 'btn:delete', 'btn:export'],
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    nickname: '超级管理员',
  },
  {
    username: 'editor',
    password: '123456',
    roles: ['editor'],
    // editor 只有 新增/编辑，没有删除、导出
    perms: ['btn:add', 'btn:edit'],
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=editor',
    nickname: '运营同学',
  },
  {
    username: 'guest',
    password: '123456',
    roles: ['guest'],
    // guest 没有任何按钮权限（只读）
    perms: [],
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest',
    nickname: '访客',
  },
]

/** 模拟网络请求的工具函数：delay 毫秒后返回 data */
function mockResolve<T>(data: T, delay = 300): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(data), delay))
}

function mockReject(msg: string, delay = 300): Promise<never> {
  return new Promise((_, reject) => setTimeout(() => reject(new Error(msg)), delay))
}

/** 模拟登录接口：校验账号密码，成功返回 token */
export function loginApi(username: string, password: string) {
  const user = mockUsers.find(u => u.username === username && u.password === password)
  if (!user) {
    return mockReject('账号或密码错误（试试 admin/editor/guest，密码 123456）')
  }
  // 真实项目：后端签发 JWT；这里用 用户名+时间戳 简单模拟
  return mockResolve({ token: `mock-token-${username}-${Date.now()}` })
}

/** 模拟获取用户信息接口：根据 token 反查用户（真实项目由后端解析 token） */
export function getUserInfoApi(token: string) {
  // 从 token 中把 username 解析出来（mock-token-admin-xxx → admin）
  const username = token.replace('mock-token-', '').split('-')[0]
  const user = mockUsers.find(u => u.username === username)
  if (!user) {
    return mockReject('token 无效，请重新登录')
  }
  const { password: _, ...info } = user
  return mockResolve(info)
}
