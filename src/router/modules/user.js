import Layout from '@/layout'

/**
 * Menu-aligned route module (scheme A).
 * URL prefixes keep historical paths; sidebar/menu tree comes from backend.
 */
// 用户管理

export default [
{
    path: '/user',
    component: Layout,
    redirect: '/user/wxuserList',
    alwaysShow: true, // will always show the root menu
    name: 'user',
    meta: {
      title: '用户管理',
      icon: 'peoples',
    },
    children: [{
      path: 'wxuserList',
      component: () => import('@/views/user/wxuserList'),
      name: 'wxuserList',
      meta: {
        title: '微信用户',
        icon: 'el-icon-s-check',
      }
    }, {
      path: 'monthuserList',
      component: () => import('@/views/user/monthuserList'),
      name: 'monthuserList',
      meta: {
        title: '月卡用户',
        icon: 'el-icon-s-check',
      }
    }]
  }
]
