import Layout from '@/layout'

/**
 * Menu-aligned route module (scheme A).
 * URL prefixes keep historical paths; sidebar/menu tree comes from backend.
 */
// 营销中心

export default [
{
    path: '/marketing',
    component: Layout,
    redirect: '/marketing/activityHub',
    alwaysShow: true,
    name: 'marketing',
    meta: {
      title: '营销中心',
      icon: 'el-icon-present',
    },
    children: [{
      path: 'activityHub',
      component: () => import('@/views/marketing/activityHub'),
      name: 'activityHub',
      meta: {
        title: '营销活动',
      }
    }, {
      path: 'cardCouponList',
      component: () => import('@/views/marketing/cardCouponList'),
      name: 'cardCouponList',
      meta: {
        title: '卡券管理',
      }
    }, {
      path: 'cardCouponEdit',
      component: () => import('@/views/marketing/cardCouponEdit'),
      name: 'cardCouponEdit',
      hidden: true,
      meta: {
        title: '编辑卡券',
        authFollow: '/marketing/cardCouponList',
      }
    }, {
      path: 'cardCouponIssueList',
      component: () => import('@/views/marketing/cardCouponIssueList'),
      name: 'cardCouponIssueList',
      hidden: true,
      meta: {
        title: '卡券发放明细',
        authFollow: '/marketing/cardCouponList',
      }
    }, {
      path: 'stationGroupList',
      component: () => import('@/views/marketing/stationGroupList'),
      name: 'stationGroupList',
      meta: {
        title: '电站分组',
      }
    }, {
      path: 'userGroupList',
      component: () => import('@/views/marketing/userGroupList'),
      name: 'userGroupList',
      meta: {
        title: '用户分组',
      }
    }, {
      path: 'activityList',
      component: () => import('@/views/marketing/activityList'),
      name: 'activityList',
      hidden: true,
      meta: {
        title: '活动列表',
        authFollow: '/marketing/activityHub',
      }
    }, {
      path: 'activityEdit',
      component: () => import('@/views/marketing/activityEdit'),
      name: 'activityEdit',
      hidden: true,
      meta: {
        title: '编辑活动',
        authFollow: '/marketing/activityHub',
      }
    }, {
      path: 'receiveRecordList',
      component: () => import('@/views/marketing/receiveRecordList'),
      name: 'receiveRecordList',
      hidden: true,
      meta: {
        title: '领取记录',
        authFollow: '/marketing/cardCouponList',
      }
    }, {
      path: 'activityReceiveRecordList',
      component: () => import('@/views/marketing/activityReceiveRecordList'),
      name: 'activityReceiveRecordList',
      hidden: true,
      meta: {
        title: '活动领取记录',
        authFollow: '/marketing/activityHub',
      }
    }, {
      path: 'useRecordList',
      component: () => import('@/views/marketing/useRecordList'),
      name: 'useRecordList',
      hidden: true,
      meta: {
        title: '使用记录',
        authFollow: '/marketing/cardCouponList',
      }
    }, {
      path: 'exchangeCodeList',
      component: () => import('@/views/marketing/exchangeCodeList'),
      name: 'exchangeCodeList',
      hidden: true,
      meta: {
        title: '兑换码管理',
        authFollow: '/marketing/cardCouponList',
      }
    }]
  }
]
