import Layout from '@/layout'

/**
 * Menu-aligned route module (scheme A).
 * URL prefixes keep historical paths; sidebar/menu tree comes from backend.
 */
// 财务管理（菜单一级）
// - 分账与结算 / 资金流水 / 账单报表 / 支付与进件 / 发票 / 卡务
// - URL 可能跨 /finance /card /iotCard /tradeEntry /payment /agent


export default [
{
    path: '/tradeEntry',
    component: Layout,
    redirect: '/tradeEntry/list',
    name: 'TradeEntry',
    meta: {
      title: '交易商户',
      icon: 'money'
    },
    children: [
      {
        path: 'list',
        name: 'TradeEntryList',
        component: () => import('@/views/tradeEntry/index'),
        meta: {
          title: '进件列表',
          icon: 'list'
        }
      },
      {
        path: 'add',
        name: 'AddTradeEntry',
        component: () => import('@/views/tradeEntry/entry'),
        hidden: true,
        meta: {
          title: '商户进件',
          noCache: true,
          authFollow: '/tradeEntry/list'
        }
      },
      {
        path: 'edit/:id',
        name: 'EditTradeEntry',
        component: () => import('@/views/tradeEntry/entry'),
        hidden: true,
        meta: {
          title: '修改进件',
          noCache: true,
          authFollow: '/tradeEntry/list'
        }
      },
      {
        path: 'detail/:id',
        name: 'DetailTradeEntry',
        component: () => import('@/views/tradeEntry/detail'),
        hidden: true,
        meta: {
          title: '进件详情',
          noCache: true,
          authFollow: '/tradeEntry/list'
        }
      }
    ]
  },
{
    path: '/card',
    component: Layout,
    redirect: '/card/cardList',
    alwaysShow: true,
    name: 'card',
    meta: {
      title: '用户管理',
      icon: 'el-icon-wallet',
    },
    children: [{
      path: 'cardList',
      component: () => import('@/views/card/cardList'),
      name: 'cardList',
      meta: {
        title: '电卡用户',
        icon: 'el-icon-wallet',
      }
    }]
  },
{
    path: '/finance',
    component: Layout,
    redirect: '/finance/rechargeRecord',
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
      path: 'rechargeRecordDetail',
      component: () => import('@/views/finance/rechargeRecordDetail'),
      name: 'rechargeRecordDetail',
      hidden: true,
      meta: {
        title: '充值记录详情',
        icon: 'el-icon-document',
        authFollow: '/finance/rechargeRecord',
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
      path: 'orderSplitRecordDetail',
      component: () => import('@/views/finance/orderSplitRecordDetail'),
      name: 'orderSplitRecordDetail',
      hidden: true,
      meta: {
        title: '分成记录详情',
        icon: 'el-icon-document',
        authFollow: '/finance/orderSplitRecord',
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
    }, {
      path: 'customerInvoice',
      component: () => import('@/views/customerInvoice/index'),
      name: 'customerInvoice',
      meta: {
        title: '发票抬头',
        icon: 'el-icon-document',
      }
    }, {
      path: 'invoiceConfig',
      component: () => import('@/views/invoiceConf/index'),
      name: 'invoiceConfig',
      meta: {
        title: '发票配置',
        icon: 'el-icon-document',
      }
    }, {
      path: 'invoiceRecord',
      component: () => import('@/views/invoiceRecord/index'),
      name: 'invoiceRecord',
      meta: {
        title: '开票记录',
        icon: 'el-icon-document',
      }
    }, {
      path: 'commissionStrategy',
      component: () => import('@/views/finance/commissionStrategy/index'),
      name: 'commissionStrategy',
      meta: {
        title: '抽成费用策略',
        icon: 'el-icon-document',
      }
    }, {
      path: 'channelFeeRule',
      component: () => import('@/views/finance/channelFeeRule/index'),
      name: 'channelFeeRule',
      meta: {
        title: '通道费收费规则',
        icon: 'el-icon-document',
      }
    }, {
      path: 'stationSettlementRule',
      component: () => import('@/views/finance/stationSettlementRule/index'),
      name: 'stationSettlementRule',
      meta: {
        title: '站点结算规则',
        icon: 'el-icon-document',
      }
    }, {
      path: 'settlementLedger',
      component: () => import('@/views/finance/settlementLedger/index'),
      name: 'settlementLedger',
      meta: {
        title: '台账与分账',
        icon: 'el-icon-s-order',
      }
    }, {
      path: 'stationFinanceDayBill',
      component: () => import('@/views/finance/stationFinanceDayBill/index'),
      name: 'stationFinanceDayBill',
      meta: {
        title: '站点财务日账单',
        icon: 'el-icon-s-data',
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
      title: '财务管理',
      icon: 'el-icon-s-fold',
    },
    children: [{
        path: 'agentList',
        component: () => import('@/views/agent/agentList'),
        name: 'agentList',
        meta: {
          title: '账号管理',
          icon: 'el-icon-s-operation',
        }
      },
      {
        path: 'operatorList',
        component: () => import('@/views/agent/operatorList'),
        name: 'operatorList',
        meta: {
          title: '租户管理',
          icon: 'el-icon-s-operation',
        }
      },
      {
        path: 'merchantList',
        component: () => import('@/views/merchant/merchantList'),
        name: 'merchantList',
        meta: {
          title: '商户管理',
          icon: 'el-icon-s-operation',
        }
      },
      {
        path: 'merchantTradeEntryDetail',
        component: () => import('@/views/merchant/merchantTradeEntryDetail'),
        name: 'merchantTradeEntryDetail',
        hidden: true,
        meta: {
          title: '商户进件详情',
          icon: 'el-icon-document',
          authFollow: '/agent/merchantList'
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
    path: '/iotCard',
    component: Layout,
    redirect: '/iotCard/iotCardList',
    alwaysShow: true,
    name: 'iotcard',
    meta: {
      title: '财务管理',
      icon: 'lock',
    },
    children: [{
      path: 'iotCardList',
      component: () => import('@/views/iotCard/iotCardList'),
      name: 'iotCardList',
      meta: {
        title: '流量卡管理',
        icon: 'el-icon-s-custom',
      }
    }, ]
  },
{
    path: '/payment',
    component: Layout,
    redirect: '/billPaymentInfo',
    alwaysShow: true, // will always show the root menu
    name: 'payment',
    meta: {
      title: '支付中心',
      icon: 'peoples',
    },
    children: [{
      path: 'billPaymentInfo',
      component: () => import('@/views/payment/billPaymentInfo'),
      name: 'billPaymentInfo',
      meta: {
        title: '支付流水',
        icon: 'el-icon-s-check',
      }
    },{
      path: 'billPaymentLog',
      component: () => import('@/views/payment/billPaymentLog'),
      name: 'billPaymentLog',
      meta: {
        title: '支付日志',
        icon: 'el-icon-s-check',
      }
    },{
      path: 'billRefundInfo',
      component: () => import('@/views/payment/billRefundInfo'),
      name: 'billRefundInfo',
      meta: {
        title: '退款流水',
        icon: 'el-icon-s-check',
      }
    }]
  }
]
