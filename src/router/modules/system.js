/**
 * 扁平页面表（方案 B）。buildRoutes 按 URL 第一段自动包 Layout。
 * URL prefixes keep historical paths; sidebar/menu tree comes from backend.
 */
// 系统管理 + 互联互通

export default [
{
        path: '/permission/role',
        component: () => import('@/views/permission/role'),
        name: 'role',
        meta: {
          title: '角色管理',
          icon: 'el-icon-s-custom',
        }
      },
{
        path: '/permission/menu',
        component: () => import('@/views/permission/menu'),
        name: 'menu',
        meta: {
          title: '菜单管理',
          icon: 'el-icon-s-custom',
        }
      },
{
        path: '/permission/dictionary',
        component: () => import('@/views/permission/dictionary/index'),
        name: 'dictionary',
        meta: {
          title: '字典管理',
          icon: 'el-icon-notebook-2',
        }
      },
{
      path: '/interconnection/organizationList',
      component: () => import('@/views/interconnection/organizationList'),
      name: 'organizationList',
      meta: {
        title: '互联客户管理',
        icon: 'el-icon-s-check',
      }
    },
{
      path: '/interconnection/organizationSecretKeyList',
      component: () => import('@/views/interconnection/organizationSecretKeyList'),
      name: 'organizationSecretKeyList',
      meta: {
        title: '互联推送管理',
        icon: 'el-icon-s-check',
      }
    },
{
      path: '/interconnection/merchantList',
      component: () => import('@/views/interconnection/merchantList'),
      name: 'merchantList',
      meta: {
        title: '互联商户管理',
        icon: 'el-icon-s-check',
      }
    },
{
      path: '/interconnection/chargeStationList',
      component: () => import('@/views/interconnection/chargeStationList'),
      name: 'chargeStationList',
      hidden: true,
      meta: {
        title: '互联电站管理',
        icon: 'el-icon-setting',
      }
    },
{
      path: '/interconnection/chargePileList',
      component: () => import('@/views/interconnection/chargePileList'),
      name: 'chargePileList',
      hidden: true,
      meta: {
        title: '互联电桩管理',
        icon: 'el-icon-setting',
      }
    }
]
