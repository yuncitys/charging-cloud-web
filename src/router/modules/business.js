/**
 * 扁平页面表（方案 B）。buildRoutes 按 URL 第一段自动包 Layout。
 * URL prefixes keep historical paths; sidebar/menu tree comes from backend.
 */
// 数据统计

export default [
{
        path: '/business/businessStatistics',
        component: () => import('@/views/business/businessStatistics'),
        name: 'businessStatistics',
        meta: {
          title: '经营报表',
          icon: 'el-icon-s-check',
        }
      },
{
        path: '/business/businessStatisticsTwo',
        component: () => import('@/views/business/businessStatisticsTwo'),
        name: 'businessStatisticsTwo',
        meta: {
          title: '充电趋势',
          icon: 'el-icon-s-check',
        }
      },
{
        path: '/business/businessStatisticsThree',
        component: () => import('@/views/business/businessStatisticsThree'),
        name: 'businessStatisticsThree',
        meta: {
          title: '电站趋势',
          icon: 'el-icon-s-check',
        }
      },
{
        path: '/business/businessStatisticsFour',
        component: () => import('@/views/business/businessStatisticsFour'),
        name: 'businessStatisticsFour',
        meta: {
          title: '交易趋势',
          icon: 'el-icon-s-check',
        }
      },
{
        path: '/business/businessStatisticsFive',
        component: () => import('@/views/business/businessStatisticsFive'),
        name: 'businessStatisticsFive',
        meta: {
          title: '用户趋势',
          icon: 'el-icon-s-check',
        }
      },
{
        path: '/business/businessStatisticsSix',
        component: () => import('@/views/business/businessStatisticsSix'),
        name: 'businessStatisticsSix',
        meta: {
          title: '分账汇总',
          icon: 'el-icon-s-check',
        }
      }
]
