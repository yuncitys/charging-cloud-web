/**
 * 扁平页面表（方案 B）。buildRoutes 按 URL 第一段自动包 Layout。
 * URL prefixes keep historical paths; sidebar/menu tree comes from backend.
 */
// 充电客户

export default [
  {
    path: '/chargingCustomer/index',
    component: () => import('@/views/chargingCustomer/index'),
    name: 'ChargingCustomer',
    meta: {
      title: '充电客户管理',
      icon: 'el-icon-s-check'
    }
  },
  {
    path: '/chargingCustomerCar/index',
    component: () => import('@/views/chargingCustomerCar/index'),
    name: 'ChargingCustomerCar',
    meta: {
      title: '客户车辆',
      icon: 'el-icon-s-check'
    }
  },
  {
    path: '/chargingFleet/hitLog',
    component: () => import('@/views/chargingFleet/hitLog'),
    name: 'ChargingFleetHitLog',
    meta: {
      title: '车队限额命中日志',
      icon: 'el-icon-warning-outline'
    }
  },
  {
    path: '/chargingFleet/reconcile',
    component: () => import('@/views/chargingFleet/reconcile'),
    name: 'ChargingFleetReconcile',
    meta: {
      title: '车队对账',
      icon: 'el-icon-s-check'
    }
  },
  {
    path: '/chargingFleet/bill',
    component: () => import('@/views/chargingFleet/bill'),
    name: 'ChargingFleetBill',
    meta: {
      title: '车队账单',
      icon: 'el-icon-document'
    }
  },
  {
    path: '/chargingFleet/stat',
    component: () => import('@/views/chargingFleet/stat'),
    name: 'ChargingFleetStat',
    meta: {
      title: '车队报表',
      icon: 'el-icon-data-line'
    }
  },
  {
    path: '/chargingFleet/index',
    component: () => import('@/views/chargingFleet/index'),
    name: 'ChargingFleet',
    meta: {
      title: '车队管理',
      icon: 'el-icon-truck'
    }
  },
  {
    path: '/chargingCustomerDriver/index',
    component: () => import('@/views/chargingCustomerDriver/index'),
    name: 'ChargingCustomerDriver',
    meta: {
      title: '客户司机',
      icon: 'peoples'
    }
  }
]
