import Layout from '@/layout'

/**
 * Menu-aligned route module (scheme A).
 * URL prefixes keep historical paths; sidebar/menu tree comes from backend.
 */
// 系统管理 + 互联互通

export default [
{
    path: '/permission',
    component: Layout,
    redirect: '/permission/role',
    alwaysShow: true,
    name: 'Permission',
    meta: {
      title: '系统管理',
      icon: 'lock',
    },
    children: [{
        path: 'role',
        component: () => import('@/views/permission/role'),
        name: 'role',
        meta: {
          title: '角色管理',
          icon: 'el-icon-s-custom',
        }
      },
      {
        path: 'menu',
        component: () => import('@/views/permission/menu'),
        name: 'menu',
        meta: {
          title: '菜单管理',
          icon: 'el-icon-s-custom',
        }
      },
    ]
  },
{
    path: '/interconnection',
    component: Layout,
    redirect: '/organizationList',
    alwaysShow: true, // will always show the root menu
    name: 'organization',
    meta: {
      title: '互联互通',
      icon: 'peoples',
    },
    children: [{
      path: 'organizationList',
      component: () => import('@/views/interconnection/organizationList'),
      name: 'organizationList',
      meta: {
        title: '互联客户管理',
        icon: 'el-icon-s-check',
      }
    }, {
      path: 'organizationSecretKeyList',
      component: () => import('@/views/interconnection/organizationSecretKeyList'),
      name: 'organizationSecretKeyList',
      meta: {
        title: '互联推送管理',
        icon: 'el-icon-s-check',
      }
    }, {
      path: 'merchantList',
      component: () => import('@/views/interconnection/merchantList'),
      name: 'merchantList',
      meta: {
        title: '互联商户管理',
        icon: 'el-icon-s-check',
      }
    }, {
      path: 'chargeStationList',
      component: () => import('@/views/interconnection/chargeStationList'),
      name: 'chargeStationList',
      hidden: true,
      meta: {
        title: '互联电站管理',
        icon: 'el-icon-setting',
      }
    }, {
      path: 'chargePileList',
      component: () => import('@/views/interconnection/chargePileList'),
      name: 'chargePileList',
      hidden: true,
      meta: {
        title: '互联电桩管理',
        icon: 'el-icon-setting',
      }
    }]
  }
]
