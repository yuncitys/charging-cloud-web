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
      },
{
        path: '/business/operatorWorkbench',
        component: () => import('@/views/business/operatorWorkbench/index'),
        name: 'operatorWorkbench',
        meta: {
          title: '运营商工作台',
          icon: 'el-icon-s-home',
        }
      },
{
        path: '/business/gunChargeDayStatistics',
        component: () => import('@/views/business/gunChargeDayStatistics'),
        name: 'gunChargeDayStatistics',
        meta: {
          title: '枪口统计',
          icon: 'el-icon-s-check',
        }
      },
{
        path: '/business/stationChargeHourStatistics',
        component: () => import('@/views/business/stationChargeHourStatistics'),
        name: 'stationChargeHourStatistics',
        meta: {
          title: '小时统计',
          icon: 'el-icon-s-check',
        }
      },
      {
        path: '/business/orgPeriodStatistics',
        component: () => import('@/views/business/orgPeriodStatistics'),
        name: 'orgPeriodStatistics',
        meta: {
          title: '时期统计',
          icon: 'el-icon-s-check',
        }
      },
      {
        path: '/business/orgStatistics',
        component: () => import('@/views/business/orgStatistics'),
        name: 'orgStatistics',
        meta: {
          title: '机构统计',
          icon: 'el-icon-s-check',
        }
      },
      {
        path: '/business/orgCompareStatistics',
        component: () => import('@/views/business/orgCompareStatistics'),
        name: 'orgCompareStatistics',
        meta: {
          title: '机构比对',
          icon: 'el-icon-s-check',
        }
      },
      {
        path: '/business/orgUserStatistics',
        component: () => import('@/views/business/orgUserStatistics'),
        name: 'orgUserStatistics',
        meta: {
          title: '用户统计',
          icon: 'el-icon-s-check',
        }
      }
]
