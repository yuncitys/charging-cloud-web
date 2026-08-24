import Layout from '@/layout'

/**
 * Menu-aligned route module (scheme A).
 * URL prefixes keep historical paths; sidebar/menu tree comes from backend.
 */
// 数据统计

export default [
{
    path: '/business',
    component: Layout,
    redirect: '/business/businessStatistics',
    alwaysShow: true, // will always show the root menu
    name: 'business',
    meta: {
      title: '数据统计',
      icon: 'peoples',
    },
    children: [{
        path: 'businessStatistics',
        component: () => import('@/views/business/businessStatistics'),
        name: 'businessStatistics',
        meta: {
          title: '经营报表',
          icon: 'el-icon-s-check',
        }
      },
      {
        path: 'businessStatisticsTwo',
        component: () => import('@/views/business/businessStatisticsTwo'),
        name: 'businessStatisticsTwo',
        meta: {
          title: '充电趋势',
          icon: 'el-icon-s-check',
        }
      },
      {
        path: 'businessStatisticsThree',
        component: () => import('@/views/business/businessStatisticsThree'),
        name: 'businessStatisticsThree',
        meta: {
          title: '电站趋势',
          icon: 'el-icon-s-check',
        }
      },
      {
        path: 'businessStatisticsFour',
        component: () => import('@/views/business/businessStatisticsFour'),
        name: 'businessStatisticsFour',
        meta: {
          title: '交易趋势',
          icon: 'el-icon-s-check',
        }
      },
      {
        path: 'businessStatisticsFive',
        component: () => import('@/views/business/businessStatisticsFive'),
        name: 'businessStatisticsFive',
        meta: {
          title: '用户趋势',
          icon: 'el-icon-s-check',
        }
      },
      {
        path: 'businessStatisticsSix',
        component: () => import('@/views/business/businessStatisticsSix'),
        name: 'businessStatisticsSix',
        meta: {
          title: '分账汇总',
          icon: 'el-icon-s-check',
        }
      }
    ]
  }
]
