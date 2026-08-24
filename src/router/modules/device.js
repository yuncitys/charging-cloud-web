import Layout from '@/layout'

/**
 * Menu-aligned route module (scheme A).
 * URL prefixes keep historical paths; sidebar/menu tree comes from backend.
 */
// 站点设备（含站点管理 netWorkDot）

export default [
{
    path: '/device',
    component: Layout,
    redirect: '/device/deviceList',
    alwaysShow: true, // will always show the root menu
    name: 'device',
    meta: {
      title: '站点设备',
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
        title: '安装设备',
        icon: 'el-icon-goods',
      }
    }, {
      path: 'upgrade',
      component: () => import('@/views/device/upgrade'),
      name: 'upgrade',
      meta: {
        title: '远程OTA升级',
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
    path: '/netWorkDot',
    component: Layout,
    redirect: '/netWorkDot/netWorkDotList',
    alwaysShow: true,
    name: 'netWorkDot',
    meta: {
      title: '站点设备',
      icon: 'el-icon-s-help',
    },
    children: [{
      path: 'netWorkDotList',
      component: () => import('@/views/netWorkDot/netWorkDotList'),
      name: 'netWorkDotList',
      meta: {
        title: '站点管理',
        icon: 'el-icon-help',
      }
    }, {
      path: 'stationPricingList',
      component: () => import('@/views/netWorkDot/stationPricingList'),
      name: 'stationPricingList',
      meta: {
        title: '电价管理',
        icon: 'el-icon-coin',
      }
    }, {
      path: 'stationPricingScheduleList',
      component: () => import('@/views/netWorkDot/stationPricingScheduleList'),
      name: 'stationPricingScheduleList',
      meta: {
        title: '调价任务',
        icon: 'el-icon-time',
      }
    }, {
      path: 'stationPricingCarAdd',
      component: () => import('@/views/netWorkDot/stationPricingCarAdd'),
      name: 'stationPricingCarAdd',
      hidden: true,
      meta: {
        title: '电价设置',
        noCache: true,
        activeMenu: '/netWorkDot/stationPricingList'
      }
    }, {
      path: 'stationPricingDetail',
      component: () => import('@/views/netWorkDot/stationPricingDetail'),
      name: 'stationPricingDetail',
      hidden: true,
      meta: {
        title: '电价详情',
        noCache: true,
        activeMenu: '/netWorkDot/stationPricingList'
      }
    }, {
      path: 'setting/:id',
      component: () => import('@/views/netWorkDot/netWorkDotSetting'),
      name: 'netWorkDotSetting',
      hidden: true,
      meta: {
        title: '站点设置',
        noCache: true
      }
    }, {
      path: 'chargeStationForm',
      component: () => import('@/views/netWorkDot/components/chargeStationForm.vue'),
      name: 'chargeStationForm',
      hidden: true,
      meta: {
        title: '添加站点',
        noCache: true,
        activeMenu: '/netWorkDot/netWorkDotList'
      }
    }, ]
  }
]
