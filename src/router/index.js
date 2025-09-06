import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/* Router Modules */

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [{
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true,
    meta: {
      title: '登录',
    },
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      component: () => import('@/views/dashboard/index'),
      name: 'Dashboard',
      meta: {
        title: '首页',
        icon: 'dashboard',
      }
    }]
  },
  {
    path: '/user',
    component: Layout,
    redirect: '/user/wxuserList',
    alwaysShow: true, // will always show the root menu
    name: 'user',
    meta: {
      title: '用户管理',
      icon: 'peoples',
    },
    children: [{
      path: 'wxuserList',
      component: () => import('@/views/user/wxuserList'),
      name: 'wxuserList',
      meta: {
        title: '微信用户列表',
        icon: 'el-icon-s-check',
      }
    }, {
      path: 'monthuserList',
      component: () => import('@/views/user/monthuserList'),
      name: 'monthuserList',
      meta: {
        title: '月卡用户列表',
        icon: 'el-icon-s-check',
      }
    }]
  },
  {
    path: '/business',
    component: Layout,
    redirect: '/business/businessStatistics',
    alwaysShow: true, // will always show the root menu
    name: 'business',
    meta: {
      title: '经营统计',
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
  },
  // 大数据
  {
    path: '/largeScreen',
    component: () => import('@/views/largeScreen/largeScreen'),
    name:'largeScreen',
    hidden: true,
    meta: {
      title: '',
    },
  },
  // {
  // 	path: '/businesstwo',
  // 	component: Layout,
  // 	redirect: '/business/businessStatisticstwo',
  // 	alwaysShow: true, // will always show the root menu
  // 	name: 'business',
  // 	meta: {
  // 		title: '经营统计',
  // 		icon: 'peoples',
  // 	},
  // 	children: [{
  // 		path: 'businessStatistics',
  // 		component: () => import('@/views/business/businessStatisticstwo'),
  // 		name: 'businessStatistics',
  // 		meta: {
  // 			title: '经营报表',
  // 			icon: 'el-icon-s-check',
  // 		}
  // 	}]
  // },
  {
    path: '/device',
    component: Layout,
    redirect: '/device/deviceList',
    alwaysShow: true, // will always show the root menu
    name: 'device',
    meta: {
      title: '设备管理',
      icon: 'el-icon-s-goods',
    },
    children: [{
      path: 'undeviceList',
      component: () => import('@/views/device/undeviceList'),
      name: 'undeviceList',
      meta: {
        title: '生成设备',
        icon: 'el-icon-goods',
      }
    }, {
      path: 'deviceList',
      component: () => import('@/views/device/deviceList'),
      name: 'deviceList',
      meta: {
        title: '设备列表',
        icon: 'el-icon-goods',
      }
    }, {
      path: 'warehousing',
      component: () => import('@/views/device/warehousing'),
      name: 'warehousing',
      meta: {
        title: '分配设备',
        icon: 'el-icon-goods',
      }
    }, {
      path: 'delivery',
      component: () => import('@/views/device/delivery'),
      name: 'delivery',
      meta: {
        title: '未安装设备',
        icon: 'el-icon-goods',
      }
    }, {
      path: 'upgrade',
      component: () => import('@/views/device/upgrade'),
      name: 'upgrade',
      meta: {
        title: '升级软件列表',
        icon: 'el-icon-goods',
      }
    }, {
      path: 'setDevice',
      component: () => import('@/views/device/setDevice'),
      name: 'setDevice',
      hidden: true,
      meta: {
        title: '设备控制',
        icon: 'el-icon-goods',
      }
    }, {
      path: 'setCarDevice',
      component: () => import('@/views/device/setCarDevice'),
      name: 'setCarDevice',
      hidden: true,
      meta: {
        title: '设备控制',
        icon: 'el-icon-goods',
      }
    }, {
      path: 'deliveryType',
      component: () => import('@/views/device/deliveryType'),
      name: 'deliveryType',
      hidden: true,
      meta: {
        title: '设备类型',
        icon: 'el-icon-setting',
      }
    }, {
      path: 'deviceQrcode',
      component: () => import('@/views/device/deviceQrcode'),
      name: 'deviceQrcode',
      hidden: true,
      meta: {
        title: '设备二维码',
        icon: 'el-icon-setting',
      }
    }, {
      path: 'chargingPileSimulator',
      component: () => import('@/views/device/chargingPileSimulator'),
      name: 'chargingPileSimulator',
      hidden: true,
      meta: {
        title: '充电桩模拟器',
        icon: 'el-icon-setting',
      }
    }, {
      path: 'virtualDeviceList',
      component: () => import('@/views/device/virtualDeviceList'),
      name: 'virtualDeviceList',
      hidden: true,
      meta: {
        title: '虚拟设备',
        icon: 'el-icon-setting',
      }
    }]
  },
  {
    path: '/log',
    component: Layout,
    redirect: '/log',
    alwaysShow: true,
    name: 'log',
    meta: {
      title: '日志管理',
      icon: 'el-icon-wallet',
    },
    children: [{
        path: 'upDownRecordList',
        component: () => import('@/views/log/upDownRecordList'),
        name: 'upDownRecordList',
        meta: {
          title: '设备上下线记录',
          icon: 'el-icon-full-screen',
        }
      },
      {
        path: 'logininfor',
        component: () => import('@/views/log/logininfor'),
        name: 'logininfor',
        meta: {
          title: '登录日志',
          icon: 'el-icon-full-screen',
        }
      },
      {
        path: 'system',
        component: () => import('@/views/log/system'),
        name: 'system',
        meta: {
          title: '系统日志',
          icon: 'el-icon-full-screen',
        }
      },
      {
        path: 'job',
        component: () => import('@/views/log/job'),
        name: 'jobLog',
        meta: {
          title: '任务日志',
          icon: 'el-icon-full-screen',
        }
      }
    ]
  },
  {
    path: '/join',
    component: Layout,
    redirect: '/join/joinList',
    alwaysShow: true,
    name: 'join',
    meta: {
      title: '加盟合作',
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
        title: '扫码订单列表',
        icon: 'el-icon-full-screen',
      }
    }, {
      path: 'cardOrderList',
      component: () => import('@/views/order/cardOrderList'),
      name: 'cardOrderList',
      meta: {
        title: '刷卡订单列表',
        icon: 'el-icon-postcard',
      }
    }, {
      path: 'freeOrderList',
      component: () => import('@/views/order/freeOrderList'),
      name: 'freeOrderList',
      meta: {
        title: '免费订单列表',
        icon: 'el-icon-connection',
      }
    }, {
      path: 'monthOrderList',
      component: () => import('@/views/order/monthOrderList'),
      name: 'monthOrderList',
      meta: {
        title: '包月订单列表',
        icon: 'el-icon-connection',
      }
    }, ]
  },
  {
    path: '/command',
    component: Layout,
    redirect: '/command/commandList',
    alwaysShow: true, // will always show the root menu
    name: 'command',
    meta: {
      title: '指令管理',
      icon: 'el-icon-notebook-1',
    },
    children: [{
      path: 'commandList',
      component: () => import('@/views/command/commandList'),
      name: 'commandList',
      meta: {
        title: '指令列表',
        icon: 'el-icon-notebook-2',
      }
    }, ]
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
        title: '广告列表',
        icon: 'el-icon-star-off',
      }
    }, ]
  },
  {
    path: '/netWorkDot',
    component: Layout,
    redirect: '/netWorkDot/netWorkDotList',
    alwaysShow: true,
    name: 'netWorkDot',
    meta: {
      title: '行政区域管理',
      icon: 'el-icon-s-help',
    },
    children: [{
      path: 'netWorkDotList',
      component: () => import('@/views/netWorkDot/netWorkDotList'),
      name: 'netWorkDotList',
      meta: {
        title: '区域管理',
        icon: 'el-icon-help',
      }
    }, ]
  },
  {
    path: '/charge',
    component: Layout,
    redirect: '/charge/timeCharge',
    name: 'charge',
    meta: {
      title: '收费方案',
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
    ]
  },
  {
    path: '/recharge',
    component: Layout,
    redirect: '/recharge/balanceList',
    alwaysShow: true,
    name: 'recharge',
    meta: {
      title: '充值方案管理',
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
    path: '/card',
    component: Layout,
    redirect: '/card/cardList',
    alwaysShow: true,
    name: 'card',
    meta: {
      title: '充电卡管理',
      icon: 'el-icon-wallet',
    },
    children: [{
      path: 'cardList',
      component: () => import('@/views/card/cardList'),
      name: 'cardList',
      meta: {
        title: '充电卡列表',
        icon: 'el-icon-wallet',
      }
    }]
  },
  {
    path: '/finance',
    component: Layout,
    redirect: '/finance/record',
    alwaysShow: true,
    name: 'finance',
    meta: {
      title: '财务管理',
      icon: 'el-icon-coin',
    },
    children: [{
      path: 'record',
      component: () => import('@/views/finance/record'),
      name: 'record',
      meta: {
        title: '提现管理',
        icon: 'el-icon-document',
      }
    }, {
      path: 'rechargeRecord',
      component: () => import('@/views/finance/rechargeRecord'),
      name: 'rechargeRecord',
      meta: {
        title: '充值记录',
        icon: 'el-icon-document',
      }
    }, {
      path: 'refundRecord',
      component: () => import('@/views/finance/refundRecord'),
      name: 'refundRecord',
      meta: {
        title: '退款记录',
        icon: 'el-icon-document',
      }
    }, {
      path: 'monthUserOperRecord',
      component: () => import('@/views/finance/monthUserOperRecord'),
      name: 'monthUserOperRecord',
      meta: {
        title: '月卡操作记录',
        icon: 'el-icon-document',
      }
    }, {
      path: 'orderSplitRecord',
      component: () => import('@/views/finance/orderSplitRecord'),
      name: 'orderSplitRecord',
      meta: {
        title: '分成记录',
        icon: 'el-icon-document',
      }
    }, {
      path: 'refundCenter',
      component: () => import('@/views/finance/refundCenter'),
      name: 'refundCenter',
      meta: {
        title: '退款中心',
        icon: 'el-icon-document',
      }
    }, {
      path: 'paymentChannel',
      component: () => import('@/views/paymentChannel/index'),
      name: 'paymentChannel',
      meta: {
        title: '支付渠道',
        icon: 'el-icon-document',
      }
    }, {
      path: 'paymentInfo',
      component: () => import('@/views/paymentChannelInfo/index'),
      name: 'paymentInfo',
      meta: {
        title: '支付方式',
        icon: 'el-icon-document',
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
    path: '/report',
    component: Layout,
    redirect: '/report/reportList',
    alwaysShow: true,
    name: 'report',
    meta: {
      title: '故障管理',
      icon: 'el-icon-copy-document',
    },
    children: [{
      path: 'reportList',
      component: () => import('@/views/report/reportList'),
      name: 'reportList',
      meta: {
        title: '故障列表',
        icon: 'el-icon-set-up',
      }
    }]
  },
  {
    path: '/agent',
    component: Layout,
    redirect: '/agent/agentList',
    alwaysShow: true,
    name: 'agent',
    meta: {
      title: '运营商管理',
      icon: 'el-icon-s-fold',
    },
    children: [{
        path: 'agentList',
        component: () => import('@/views/agent/agentList'),
        name: 'agentList',
        meta: {
          title: '代理商列表',
          icon: 'el-icon-s-operation',
        }
      },
      {
        path: 'operatorList',
        component: () => import('@/views/agent/operatorList'),
        name: 'operatorList',
        meta: {
          title: '运营商列表',
          icon: 'el-icon-s-operation',
        }
      },
      {
        path: 'individual',
        component: () => import('@/views/agent/components/addIndividual'),
        name: 'addIndividual',
        meta: {
          title: '个体开户',
          icon: 'el-icon-s-operation',
        }
      }
    ]
  },
  {
    path: '/permission',
    component: Layout,
    redirect: '/permission/role',
    alwaysShow: true,
    name: 'Permission',
    meta: {
      title: '权限管理',
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
      {
        path: 'setPwd',
        component: () => import('@/views/permission/setPwd'),
        name: 'setPwd',
        meta: {
          title: '修改密码',
          icon: 'el-icon-s-management',
        }
      },
    ]
  },
  {
    path: '/configAdmin',
    component: Layout,
    redirect: '/configAdmin/configAdminIndex',
    alwaysShow: true,
    name: 'ConfigAdmin',
    meta: {
      title: '配置管理',
      icon: 'lock',
    },
    children: [{
      path: 'configAdminIndex',
      component: () => import('@/views/configAdmin/configAdminIndex'),
      name: 'configAdminIndex',
      meta: {
        title: '配置权限',
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
    }, ]
  },
  {
    path: '/platform',
    component: Layout,
    redirect: '/platformConfig/platformConfig',
    alwaysShow: true,
    name: 'platform',
    meta: {
      title: '平台logo',
      icon: 'lock',
    },
    children: [{
      path: 'platformConfig',
      component: () => import('@/views/platformConfig/platformConfig'),
      name: 'platformConfig',
      meta: {
        title: '平台logo',
        icon: 'el-icon-s-custom',
      }
    }, ]
  },
  {
    path: '/iotCard',
    component: Layout,
    redirect: '/iotCard/iotCardList',
    alwaysShow: true,
    name: 'iotcard',
    meta: {
      title: '流量卡管理',
      icon: 'lock',
    },
    children: [{
      path: 'iotCardList',
      component: () => import('@/views/iotCard/iotCardList'),
      name: 'iotCardList',
      meta: {
        title: '流量卡列表',
        icon: 'el-icon-s-custom',
      }
    }, ]
  },
  {
    path: '/monitor',
    component: Layout,
    redirect: '/monitor/job',
    alwaysShow: true,
    name: 'monitor',
    meta: {
      title: '系统监控',
      icon: 'lock',
    },
    children: [{
      path: 'job',
      component: () => import('@/views/monitor/job/index'),
      name: 'jobList',
      meta: {
        title: '定时任务',
        icon: 'el-icon-s-custom',
      }
    }, {
      path: 'task',
      component: () => import('@/views/monitor/task/index'),
      name: 'taskList',
      meta: {
        title: '下载中心',
        icon: 'el-icon-s-custom',
      }
    }, ]
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
  },
  {
    path: '*',
    redirect: '/404',
    hidden: true
  }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [{
  path: '*',
  redirect: '/404',
  hidden: true
}]

// 创建一个router对象
const createRouter = () => new Router({
  //  mode分为 Hash模式 和 history模式

  // Hash模式 链接自带 # 号
  // 地址链接为 ：http://localhost:9528/order/scanOrderList#/dashboard
  // vue-router默认为hash模式,即使用url的hash来模拟一个完整的url
  // 于是当url改变时,页面不会重新加载.
  // hash模式的#是URl的锚点，代表的是网页中的一个位置，
  // 单单改变#后的部分，浏览器只会滚动到响应位置，不会重新加载网页，
  // 也就是说#来指导浏览器动作的，对服务器完全无用，HTTP请求中也不会不包括#，
  // 同时每一次改变#后的部分，都会在浏览器的访问历史中增加一个记录，
  // 使用 “后退”按钮就可以回到上一个位置

  // history模式
  // 去除了hash模式的#号
  // 地址链接为：http://localhost:9528/order/scanOrderList/dashboard
  // 由于hash模式会在url中自带#号，如果不想要很丑的hash，
  // 就可以使用history模式，使用history对象函数
  // history.back() 载入历史列表中前一个网址，相当于按下“后退”按钮
  // history.go(x)  x为正数时历史列表前进x页面
  // x为负数时历史列表后退x页面
  mode: 'history', // require service support
  scrollBehavior: () => ({
    y: 0
  }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
