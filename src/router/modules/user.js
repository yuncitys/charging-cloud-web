/**
 * 扁平页面表（方案 B）。buildRoutes 按 URL 第一段自动包 Layout。
 * URL prefixes keep historical paths; sidebar/menu tree comes from backend.
 */
// 用户管理

export default [
{
      path: '/user/wxuserList',
      component: () => import('@/views/user/wxuserList'),
      name: 'wxuserList',
      meta: {
        title: '微信用户',
        icon: 'el-icon-s-check',
      }
    },
{
      path: '/user/monthuserList',
      component: () => import('@/views/user/monthuserList'),
      name: 'monthuserList',
      meta: {
        title: '月卡用户',
        icon: 'el-icon-s-check',
      }
    }
]
