/**
 * 扁平页面表（方案 B）。buildRoutes 按 URL 第一段自动包 Layout。
 * URL prefixes keep historical paths; sidebar/menu tree comes from backend.
 */
// 运营管理（菜单一级）
// - 计费策略: /charge/*（分账设置已登记在 finance.js，URL 仍为 /charge/stationSplitConfig）
// - 充值套餐: /recharge/*
// - 市场与渠道: /AD, /join
// - 平台配置: /configAdmin, /platform
// - 商品: /goods

export default [
{
      path: '/join/joinList',
      component: () => import('@/views/join/joinList'),
      name: 'joinList',
      meta: {
        title: '加盟合作',
        icon: 'el-icon-full-screen',
      }
    },
{
      path: '/AD/ADList',
      component: () => import('@/views/AD/ADList'),
      name: 'ADList',
      meta: {
        title: '广告轮播图',
        icon: 'el-icon-star-off',
      }
    },
{
        path: '/charge/timeCharge',
        component: () => import('@/views/charge/timeCharge'),
        name: 'timeCharge',
        meta: {
          title: '计时收费方案',
          icon: 'el-icon-pie-chart',
        }
      },
{
        path: '/charge/electricCharge',
        component: () => import('@/views/charge/electricCharge'),
        name: 'electricCharge',
        meta: {
          title: '电量收费方案',
          icon: 'el-icon-data-line',
        }
      },
{
        path: '/charge/powerCharge',
        component: () => import('@/views/charge/powerCharge'),
        name: 'powerCharge',
        meta: {
          title: '功率收费方案',
          icon: 'el-icon-s-finance',
        }
      },
      {
        path: '/charge/carCharge',
        component: () => import('@/views/charge/carCharge'),
        name: 'carCharge',
        meta: {
          title: '汽车收费方案',
          icon: 'el-icon-s-finance',
        }
      },
{
      path: '/recharge/balanceList',
      component: () => import('@/views/recharge/balanceList'),
      name: 'balanceList',
      meta: {
        title: '余额充值方案',
        icon: 'el-icon-wallet',
      }
    },
{
      path: '/recharge/ICCardList',
      component: () => import('@/views/recharge/ICCardList'),
      name: 'ICCardList',
      meta: {
        title: 'IC卡充值方案',
        icon: 'el-icon-wallet',
      }
    },
{
      path: '/recharge/monthCardList',
      component: () => import('@/views/recharge/monthCardList'),
      name: 'monthCardList',
      meta: {
        title: '月卡充值方案',
        icon: 'el-icon-wallet',
      }
    },
{
      path: '/goods/goodsList',
      component: () => import('@/views/goods/goodsList'),
      name: 'goodsList',
      meta: {
        title: '商品列表',
        icon: 'el-icon-shopping-cart-1',
      }
    },
{
      path: '/goods/goodsOnSale',
      component: () => import('@/views/goods/goodsOnSale'),
      name: 'goodsOnSale',
      meta: {
        title: '商品上架',
        icon: 'el-icon-sell',
      }
    },
{
      path: '/goods/orderList',
      component: () => import('@/views/goods/orderList'),
      name: 'orderList',
      meta: {
        title: '商品订单',
        icon: 'el-icon-collection',
      }
    },
{
      path: '/goods/goodsEdit',
      component: () => import('@/views/goods/goodsEdit'),
      name: 'goodsEdit',
      hidden: true,
      meta: {
        title: '编辑商品',
        icon: 'el-icon-shopping-cart-2',
      }
    },
{
      path: '/configAdmin/configAdminIndex',
      component: () => import('@/views/configAdmin/configAdminIndex'),
      name: 'configAdminIndex',
      meta: {
        title: '全局业务配置',
        icon: 'el-icon-s-custom',
      }
    },
{
      path: '/configAdmin/wxPublicConfig',
      component: () => import('@/views/configAdmin/wxPublicConfig'),
      name: 'wxPublicConfig',
      meta: {
        title: '小程序配置',
        icon: 'el-icon-s-custom',
      }
    },
{
      path: '/configAdmin/largeScreenMockConfig',
      component: () => import('@/views/configAdmin/largeScreenMockConfig'),
      name: 'largeScreenMockConfig',
      meta: {
        title: '大屏虚拟数据配置',
        icon: 'el-icon-s-data',
      }
    },
{
      path: '/platform/platformConfig',
      component: () => import('@/views/platformConfig/platformConfig'),
      name: 'platformConfig',
      meta: {
        title: '平台配置',
        icon: 'el-icon-s-custom',
      }
    }
]
