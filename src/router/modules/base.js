import Layout from '@/layout'

/**
 * Menu-aligned route module (scheme A).
 * URL prefixes keep historical paths; sidebar/menu tree comes from backend.
 */
// 基础页：登录 / 错误页 / 首页

export default [
{
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true,
    meta: {
      title: '登录',
    },
  },
{
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
{
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
{
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
{
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      component: () => import('@/views/dashboard/index'),
      name: 'Dashboard',
      meta: {
        title: '首页',
        icon: 'dashboard',
      }
    }]
  }
]
