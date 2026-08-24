import Layout from '@/layout'

/**
 * Menu-aligned route module (scheme A).
 * URL prefixes keep historical paths; sidebar/menu tree comes from backend.
 */
// 运营管理（菜单一级）
// - 计费策略: /charge/*（除 stationSplitConfig 菜单挂财务）
// - 充值套餐: /recharge/*
// - 市场与渠道: /AD, /join
// - 平台配置: /configAdmin, /platform
// - 商品: /goods
// 注意: /charge/stationSplitConfig 菜单在「财务管理 > 分账与结算」

export default [
{
    path: '/join',
    component: Layout,
    redirect: '/join/joinList',
    alwaysShow: true,
    name: 'join',
    meta: {
      title: '运营管理',
      icon: 'el-icon-wallet',
    },
    children: [{
      path: 'joinList',
      component: () => import('@/views/join/joinList'),
      name: 'joinList',
      meta: {
        title: '加盟合作',
        icon: 'el-icon-full-screen',
      }
    }]
  },
{
    path: '/AD',
    component: Layout,
    redirect: '/AD/ADList',
    alwaysShow: true,
    name: 'AD',
    meta: {
      title: '运营管理',
      icon: 'el-icon-star-on',
    },
    children: [{
      path: 'ADList',
      component: () => import('@/views/AD/ADList'),
      name: 'ADList',
      meta: {
        title: '广告轮播图',
        icon: 'el-icon-star-off',
      }
    }, ]
  },
{
    path: '/charge',
    component: Layout,
    redirect: '/charge/timeCharge',
    name: 'charge',
    meta: {
      title: '运营管理',
      icon: 'el-icon-reading',
    },
    children: [{
        path: 'timeCharge',
        component: () => import('@/views/charge/timeCharge'),
        name: 'timeCharge',
        meta: {
          title: '计时收费方案',
          icon: 'el-icon-pie-chart',
        }
      },
      {
        path: 'electricCharge',
        component: () => import('@/views/charge/electricCharge'),
        name: 'electricCharge',
        meta: {
          title: '电量收费方案',
          icon: 'el-icon-data-line',
        }
      },
      {
        path: 'powerCharge',
        component: () => import('@/views/charge/powerCharge'),
        name: 'powerCharge',
        meta: {
          title: '功率收费方案',
          icon: 'el-icon-s-finance',
        }
      },
      {
        path: 'carCharge',
        component: () => import('@/views/charge/carCharge'),
        name: 'carCharge',
        meta: {
          title: '汽车收费方案',
          icon: 'el-icon-s-finance',
        }
      },
      {
        path: 'stationSplitConfig',
        component: () => import('@/views/operations/stationSplitConfig/index'),
        name: 'stationSplitConfig',
        meta: {
          title: '分账设置',
          icon: 'el-icon-s-finance',
        }
      },
    ]
  },
{
    path: '/recharge',
    component: Layout,
    redirect: '/recharge/balanceList',
    alwaysShow: true,
    name: 'recharge',
    meta: {
      title: '运营管理',
      icon: 'el-icon-wallet',
    },
    children: [{
      path: 'balanceList',
      component: () => import('@/views/recharge/balanceList'),
      name: 'balanceList',
      meta: {
        title: '余额充值方案',
        icon: 'el-icon-wallet',
      }
    }, {
      path: 'ICCardList',
      component: () => import('@/views/recharge/ICCardList'),
      name: 'ICCardList',
      meta: {
        title: 'IC卡充值方案',
        icon: 'el-icon-wallet',
      }
    }, {
      path: 'monthCardList',
      component: () => import('@/views/recharge/monthCardList'),
      name: 'monthCardList',
      meta: {
        title: '月卡充值方案',
        icon: 'el-icon-wallet',
      }
    }]
  },
{
    path: '/goods',
    component: Layout,
    redirect: '/goods/goodsList',
    alwaysShow: true,
    name: 'goods',
    meta: {
      title: '商品管理',
      icon: 'el-icon-shopping-cart-full',
    },
    children: [{
      path: 'goodsList',
      component: () => import('@/views/goods/goodsList'),
      name: 'goodsList',
      meta: {
        title: '商品列表',
        icon: 'el-icon-shopping-cart-1',
      }
    }, {
      path: 'goodsOnSale',
      component: () => import('@/views/goods/goodsOnSale'),
      name: 'goodsOnSale',
      meta: {
        title: '商品上架',
        icon: 'el-icon-sell',
      }
    }, {
      path: 'orderList',
      component: () => import('@/views/goods/orderList'),
      name: 'orderList',
      meta: {
        title: '商品订单',
        icon: 'el-icon-collection',
      }
    }, {
      path: 'goodsEdit',
      component: () => import('@/views/goods/goodsEdit'),
      name: 'goodsEdit',
      hidden: true,
      meta: {
        title: '编辑商品',
        icon: 'el-icon-shopping-cart-2',
      }
    }]
  },
{
    path: '/configAdmin',
    component: Layout,
    redirect: '/configAdmin/configAdminIndex',
    alwaysShow: true,
    name: 'ConfigAdmin',
    meta: {
      title: '运营管理',
      icon: 'lock',
    },
    children: [{
      path: 'configAdminIndex',
      component: () => import('@/views/configAdmin/configAdminIndex'),
      name: 'configAdminIndex',
      meta: {
        title: '全局业务配置',
        icon: 'el-icon-s-custom',
      }
    }, {
      path: 'wxPublicConfig',
      component: () => import('@/views/configAdmin/wxPublicConfig'),
      name: 'wxPublicConfig',
      meta: {
        title: '小程序配置',
        icon: 'el-icon-s-custom',
      }
    }, {
      path: 'largeScreenMockConfig',
      component: () => import('@/views/configAdmin/largeScreenMockConfig'),
      name: 'largeScreenMockConfig',
      meta: {
        title: '大屏虚拟数据配置',
        icon: 'el-icon-s-data',
      }
    }, ]
  },
{
    path: '/platform',
    component: Layout,
    redirect: '/platformConfig/platformConfig',
    alwaysShow: true,
    name: 'platform',
    meta: {
      title: '系统管理',
      icon: 'lock',
    },
    children: [{
      path: 'platformConfig',
      component: () => import('@/views/platformConfig/platformConfig'),
      name: 'platformConfig',
      meta: {
        title: '平台配置',
        icon: 'el-icon-s-custom',
      }
    }, ]
  }
]
