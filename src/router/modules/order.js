/**
 * 扁平页面表（方案 B）。buildRoutes 按 URL 第一段自动包 Layout。
 * URL prefixes keep historical paths; sidebar/menu tree comes from backend.
 */
// 订单管理

export default [
{
      path: '/order/scanOrderList',
      component: () => import('@/views/order/scanOrderList'),
      name: 'scanOrderList',
      meta: {
        title: '扫码订单',
        icon: 'el-icon-full-screen',
      }
    },
{
      path: '/order/cardOrderList',
      component: () => import('@/views/order/cardOrderList'),
      name: 'cardOrderList',
      meta: {
        title: '刷卡订单',
        icon: 'el-icon-postcard',
      }
    },
{
      path: '/order/freeOrderList',
      component: () => import('@/views/order/freeOrderList'),
      name: 'freeOrderList',
      meta: {
        title: '免费订单',
        icon: 'el-icon-connection',
      }
    },
{
      path: '/order/monthOrderList',
      component: () => import('@/views/order/monthOrderList'),
      name: 'monthOrderList',
      meta: {
        title: '包月订单',
        icon: 'el-icon-connection',
      }
    },
{
      path: '/order/orderDetail',
      component: () => import('@/views/order/components/orderDetail.vue'),
      name: 'orderDetail',
      hidden: true,
      meta: {
        title: '订单详情',
        noCache: true,
        activeMenu: '/order/scanOrderList',
        authFollow: '/order/scanOrderList'
      }
    }
]
