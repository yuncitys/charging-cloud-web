import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * 路由组织（方案 A + B）
 *
 * A：按菜单一级拆到 router/modules/*.js，对照菜单管理。
 * B：模块内登记扁平页面（完整 path + component），buildLayoutRoutes 按 URL 第一段包 Layout。
 *    例如财务菜单的「分账设置」写在 finance.js，运行时仍挂到 /charge Layout。
 *
 * 面包屑 / 顶栏搜索读 menuList → 见 Breadcrumb、HeaderSearch、menuNav.findMenuTrailByHref
 */
import { buildLayoutRoutes } from './buildRoutes'
import baseRoutes from './modules/base'
import userPages from './modules/user'
import businessPages from './modules/business'
import devicePages from './modules/device'
import operationsPages from './modules/operations'
import financePages from './modules/finance'
import orderPages from './modules/order'
import marketingPages from './modules/marketing'
import opsPages from './modules/ops'
import systemPages from './modules/system'
import customerPages from './modules/customer'

/**
 * hidden: true
 * name: 'router-name'  // keep-alive
 * meta.authFollow: '/parent/list/href'
 *   - 权限：routePermission 对 hidden 页放行（同列表页授权即可访问）
 *   - 面包屑：无菜单项时，沿 authFollow 找父页菜单链，末尾加 meta.title
 */

/** 独立全屏页：不走 Layout，由按钮权限 :web:largeScreen:openWatch 控制访问 */
export const largeScreenRoute = {
  path: '/largeScreen',
  component: () => import('@/views/largeScreen/largeScreen'),
  name: 'largeScreen',
  hidden: true,
  meta: {
    title: '',
    authPerm: ':web:largeScreen:openWatch'
  }
}

/** 修改密码：顶部用户菜单入口，所有登录用户可访问 */
export const setPwdRoute = {
  path: '/permission/setPwd',
  component: Layout,
  hidden: true,
  children: [{
    path: '',
    component: () => import('@/views/permission/setPwd'),
    name: 'setPwd',
    hidden: true,
    meta: {
      title: '修改密码'
    }
  }]
}

/** 无需鉴权的基础路由 */
export const constantRoutes = baseRoutes.concat([largeScreenRoute, setPwdRoute])

/** 需按菜单 href 过滤的业务路由（不含兜底 *，* 在 addRoutes 时最后追加） */
export const asyncRoutes = buildLayoutRoutes([
  ...userPages,
  ...businessPages,
  ...devicePages,
  ...operationsPages,
  ...financePages,
  ...orderPages,
  ...marketingPages,
  ...opsPages,
  ...systemPages,
  ...customerPages
])

export const catchAllRoute = {
  path: '*',
  redirect: '/404',
  hidden: true
}

const createRouter = () => new Router({
  mode: 'history',
  scrollBehavior: () => ({
    y: 0
  }),
  routes: constantRoutes
})

const router = createRouter()

export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher
}

export default router
