import Layout from '@/layout'

/**
 * Menu-aligned route module (scheme A).
 * URL prefixes keep historical paths; sidebar/menu tree comes from backend.
 */
// 订单管理

export default [
{
    path: '/order',
    component: Layout,
    redirect: '/order/scanOrderList',
    alwaysShow: true,
    name: 'order',
    meta: {
      title: '订单管理',
      icon: 'el-icon-wallet',
    },
    children: [{
      path: 'scanOrderList',
      component: () => import('@/views/order/scanOrderList'),
      name: 'scanOrderList',
      meta: {
        title: '扫码订单',
        icon: 'el-icon-full-screen',
      }
    }, {
      path: 'cardOrderList',
      component: () => import('@/views/order/cardOrderList'),
      name: 'cardOrderList',
      meta: {
        title: '刷卡订单',
        icon: 'el-icon-postcard',
      }
    }, {
      path: 'freeOrderList',
      component: () => import('@/views/order/freeOrderList'),
      name: 'freeOrderList',
      meta: {
        title: '免费订单',
        icon: 'el-icon-connection',
      }
    }, {
      path: 'monthOrderList',
      component: () => import('@/views/order/monthOrderList'),
      name: 'monthOrderList',
      meta: {
        title: '包月订单',
        icon: 'el-icon-connection',
      }
    }, {
      path: 'orderDetail',
      component: () => import('@/views/order/components/orderDetail.vue'),
      name: 'orderDetail',
      hidden: true,
      meta: {
        title: '订单详情',
        noCache: true,
        activeMenu: '/order/scanOrderList',
        authFollow: '/order/scanOrderList'
      }
    }, ]
  }
]
