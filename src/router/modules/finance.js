/**
 * 扁平页面表（方案 B）。buildRoutes 按 URL 第一段自动包 Layout。
 * URL prefixes keep historical paths; sidebar/menu tree comes from backend.
 */
// 财务管理（菜单一级）
// - 分账与结算 / 资金流水 / 账单报表 / 支付与进件 / 发票 / 卡务
// - URL 可能跨 /finance /charge /card /iotCard /tradeEntry /payment /agent


export default [
{
      path: '/charge/stationSplitConfig',
      component: () => import('@/views/operations/stationSplitConfig/index'),
      name: 'stationSplitConfig',
      meta: {
        title: '分账设置',
        icon: 'el-icon-s-finance',
      }
    },
{
        path: '/tradeEntry/list',
        name: 'TradeEntryList',
        component: () => import('@/views/tradeEntry/index'),
        meta: {
          title: '进件列表',
          icon: 'list'
        }
      },
{
        path: '/tradeEntry/add',
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
        path: '/tradeEntry/edit/:id',
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
        path: '/tradeEntry/detail/:id',
        name: 'DetailTradeEntry',
        component: () => import('@/views/tradeEntry/detail'),
        hidden: true,
        meta: {
          title: '进件详情',
          noCache: true,
          authFollow: '/tradeEntry/list'
        }
      },
{
      path: '/card/cardList',
      component: () => import('@/views/card/cardList'),
      name: 'cardList',
      meta: {
        title: '电卡用户',
        icon: 'el-icon-wallet',
      }
    },
{
      path: '/finance/record',
      component: () => import('@/views/finance/record'),
      name: 'record',
      meta: {
        title: '提现管理',
        icon: 'el-icon-document',
      }
    },
{
      path: '/finance/rechargeRecord',
      component: () => import('@/views/finance/rechargeRecord'),
      name: 'rechargeRecord',
      meta: {
        title: '充值记录',
        icon: 'el-icon-document',
      }
    },
{
      path: '/finance/rechargeRecordDetail',
      component: () => import('@/views/finance/rechargeRecordDetail'),
      name: 'rechargeRecordDetail',
      hidden: true,
      meta: {
        title: '充值记录详情',
        icon: 'el-icon-document',
        authFollow: '/finance/rechargeRecord',
      }
    },
{
      path: '/finance/refundRecord',
      component: () => import('@/views/finance/refundRecord'),
      name: 'refundRecord',
      meta: {
        title: '退款记录',
        icon: 'el-icon-document',
      }
    },
{
      path: '/finance/monthUserOperRecord',
      component: () => import('@/views/finance/monthUserOperRecord'),
      name: 'monthUserOperRecord',
      meta: {
        title: '月卡操作记录',
        icon: 'el-icon-document',
      }
    },
{
      path: '/finance/orderSplitRecord',
      component: () => import('@/views/finance/orderSplitRecord'),
      name: 'orderSplitRecord',
      meta: {
        title: '分成记录',
        icon: 'el-icon-document',
      }
    },
{
      path: '/finance/orderSplitRecordDetail',
      component: () => import('@/views/finance/orderSplitRecordDetail'),
      name: 'orderSplitRecordDetail',
      hidden: true,
      meta: {
        title: '分成记录详情',
        icon: 'el-icon-document',
        authFollow: '/finance/orderSplitRecord',
      }
    },
{
      path: '/finance/refundCenter',
      component: () => import('@/views/finance/refundCenter'),
      name: 'refundCenter',
      meta: {
        title: '退款中心',
        icon: 'el-icon-document',
      }
    },
{
      path: '/finance/paymentChannel',
      component: () => import('@/views/paymentChannel/index'),
      name: 'paymentChannel',
      meta: {
        title: '支付渠道',
        icon: 'el-icon-document',
      }
    },
{
      path: '/finance/paymentInfo',
      component: () => import('@/views/paymentChannelInfo/index'),
      name: 'paymentInfo',
      meta: {
        title: '支付方式',
        icon: 'el-icon-document',
      }
    },
{
      path: '/finance/customerInvoice',
      component: () => import('@/views/customerInvoice/index'),
      name: 'customerInvoice',
      meta: {
        title: '发票抬头',
        icon: 'el-icon-document',
      }
    },
{
      path: '/finance/invoiceConfig',
      component: () => import('@/views/invoiceConf/index'),
      name: 'invoiceConfig',
      meta: {
        title: '发票配置',
        icon: 'el-icon-document',
      }
    },
{
      path: '/finance/invoiceRecord',
      component: () => import('@/views/invoiceRecord/index'),
      name: 'invoiceRecord',
      meta: {
        title: '开票记录',
        icon: 'el-icon-document',
      }
    },
{
      path: '/finance/commissionStrategy',
      component: () => import('@/views/finance/commissionStrategy/index'),
      name: 'commissionStrategy',
      meta: {
        title: '抽成费用策略',
        icon: 'el-icon-document',
      }
    },
{
      path: '/finance/channelFeeRule',
      component: () => import('@/views/finance/channelFeeRule/index'),
      name: 'channelFeeRule',
      meta: {
        title: '通道费收费规则',
        icon: 'el-icon-document',
      }
    },
{
      path: '/finance/stationSettlementRule',
      component: () => import('@/views/finance/stationSettlementRule/index'),
      name: 'stationSettlementRule',
      meta: {
        title: '站点结算规则',
        icon: 'el-icon-document',
      }
    },
{
      path: '/finance/settlementLedger',
      component: () => import('@/views/finance/settlementLedger/index'),
      name: 'settlementLedger',
      meta: {
        title: '台账与分账',
        icon: 'el-icon-s-order',
      }
    },
{
      path: '/finance/stationFinanceDayBill',
      component: () => import('@/views/finance/stationFinanceDayBill/index'),
      name: 'stationFinanceDayBill',
      meta: {
        title: '站点财务日账单',
        icon: 'el-icon-s-data',
      }
    },
{
        path: '/agent/agentList',
        component: () => import('@/views/agent/agentList'),
        name: 'agentList',
        meta: {
          title: '账号管理',
          icon: 'el-icon-s-operation',
        }
      },
{
        path: '/agent/operatorList',
        component: () => import('@/views/agent/operatorList'),
        name: 'operatorList',
        meta: {
          title: '租户管理',
          icon: 'el-icon-s-operation',
        }
      },
{
        path: '/agent/merchantList',
        component: () => import('@/views/merchant/merchantList'),
        name: 'merchantList',
        meta: {
          title: '商户管理',
          icon: 'el-icon-s-operation',
        }
      },
{
        path: '/agent/merchantTradeEntryDetail',
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
        path: '/agent/individual',
        component: () => import('@/views/agent/components/addIndividual'),
        name: 'addIndividual',
        meta: {
          title: '个体开户',
          icon: 'el-icon-s-operation',
        }
      },
{
      path: '/iotCard/iotCardList',
      component: () => import('@/views/iotCard/iotCardList'),
      name: 'iotCardList',
      meta: {
        title: '流量卡管理',
        icon: 'el-icon-s-custom',
      }
    },
{
      path: '/payment/billPaymentInfo',
      component: () => import('@/views/payment/billPaymentInfo'),
      name: 'billPaymentInfo',
      meta: {
        title: '支付流水',
        icon: 'el-icon-s-check',
      }
    },
{
      path: '/payment/billPaymentLog',
      component: () => import('@/views/payment/billPaymentLog'),
      name: 'billPaymentLog',
      meta: {
        title: '支付日志',
        icon: 'el-icon-s-check',
      }
    },
{
      path: '/payment/billRefundInfo',
      component: () => import('@/views/payment/billRefundInfo'),
      name: 'billRefundInfo',
      meta: {
        title: '退款流水',
        icon: 'el-icon-s-check',
      }
    }
]
