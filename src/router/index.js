import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * 路由模块拆分（方案 A — 仅代码组织，不改变运行时行为）
 *
 * 解决的问题：菜单按业务重组（运营/财务 + 二级目录），但 URL 仍按历史前缀
 *             （/charge、/finance、/configAdmin…）分散在多个 Layout 里，单文件难维护。
 * 做法：按菜单一级模块拆到 router/modules/*.js，注释标明菜单归属；href/组件/权限不变。
 *
 * 面包屑不一致 → 见方案 C：components/Breadcrumb + menuNav.findMenuTrailByHref
 * 长期扁平注册 → 方案 B（未做）：pages/*.js + buildRoutes，稳定后再考虑
 */
import baseRoutes from './modules/base'
import userRoutes from './modules/user'
import businessRoutes from './modules/business'
import deviceRoutes from './modules/device'
import operationsRoutes from './modules/operations'
import financeRoutes from './modules/finance'
import orderRoutes from './modules/order'
import marketingRoutes from './modules/marketing'
import opsRoutes from './modules/ops'
import systemRoutes from './modules/system'
import customerRoutes from './modules/customer'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true
 * alwaysShow: true
 * redirect: noRedirect
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
export const asyncRoutes = [
  ...userRoutes,
  ...businessRoutes,
  ...deviceRoutes,
  ...operationsRoutes,
  ...financeRoutes,
  ...orderRoutes,
  ...marketingRoutes,
  ...opsRoutes,
  ...systemRoutes,
  ...customerRoutes
]

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
