/**
 * 扁平页面表（方案 B）。buildRoutes 按 URL 第一段自动包 Layout。
 * URL prefixes keep historical paths; sidebar/menu tree comes from backend.
 */
// 站点设备（含站点管理 netWorkDot）

export default [
{
      path: '/device/undeviceList',
      component: () => import('@/views/device/undeviceList'),
      name: 'undeviceList',
      meta: {
        title: '生成设备',
        icon: 'el-icon-goods',
      }
    },
{
      path: '/device/deviceList',
      component: () => import('@/views/device/deviceList'),
      name: 'deviceList',
      meta: {
        title: '设备列表',
        icon: 'el-icon-goods',
      }
    },
{
      path: '/device/warehousing',
      component: () => import('@/views/device/warehousing'),
      name: 'warehousing',
      meta: {
        title: '分配设备',
        icon: 'el-icon-goods',
      }
    },
{
      path: '/device/delivery',
      component: () => import('@/views/device/delivery'),
      name: 'delivery',
      meta: {
        title: '安装设备',
        icon: 'el-icon-goods',
      }
    },
{
      path: '/device/upgrade',
      component: () => import('@/views/device/upgrade'),
      name: 'upgrade',
      meta: {
        title: '远程OTA升级',
        icon: 'el-icon-goods',
      }
    },
{
      path: '/device/setDevice',
      component: () => import('@/views/device/setDevice'),
      name: 'setDevice',
      hidden: true,
      meta: {
        title: '设备控制',
        icon: 'el-icon-goods',
      }
    },
{
      path: '/device/setCarDevice',
      component: () => import('@/views/device/setCarDevice'),
      name: 'setCarDevice',
      hidden: true,
      meta: {
        title: '设备控制',
        icon: 'el-icon-goods',
      }
    },
{
      path: '/device/deliveryType',
      component: () => import('@/views/device/deliveryType'),
      name: 'deliveryType',
      hidden: true,
      meta: {
        title: '设备类型',
        icon: 'el-icon-setting',
      }
    },
{
      path: '/device/deviceQrcode',
      component: () => import('@/views/device/deviceQrcode'),
      name: 'deviceQrcode',
      hidden: true,
      meta: {
        title: '设备二维码',
        icon: 'el-icon-setting',
      }
    },
{
      path: '/device/chargingPileSimulator',
      component: () => import('@/views/device/chargingPileSimulator'),
      name: 'chargingPileSimulator',
      hidden: true,
      meta: {
        title: '充电桩模拟器',
        icon: 'el-icon-setting',
      }
    },
{
      path: '/device/virtualDeviceList',
      component: () => import('@/views/device/virtualDeviceList'),
      name: 'virtualDeviceList',
      hidden: true,
      meta: {
        title: '虚拟设备',
        icon: 'el-icon-setting',
      }
    },
{
      path: '/netWorkDot/netWorkDotList',
      component: () => import('@/views/netWorkDot/netWorkDotList'),
      name: 'netWorkDotList',
      meta: {
        title: '站点管理',
        icon: 'el-icon-help',
      }
    },
{
      path: '/netWorkDot/stationPricingList',
      component: () => import('@/views/netWorkDot/stationPricingList'),
      name: 'stationPricingList',
      meta: {
        title: '电价管理',
        icon: 'el-icon-coin',
      }
    },
{
      path: '/netWorkDot/stationPricingScheduleList',
      component: () => import('@/views/netWorkDot/stationPricingScheduleList'),
      name: 'stationPricingScheduleList',
      meta: {
        title: '调价任务',
        icon: 'el-icon-time',
      }
    },
{
      path: '/netWorkDot/stationPricingCarAdd',
      component: () => import('@/views/netWorkDot/stationPricingCarAdd'),
      name: 'stationPricingCarAdd',
      hidden: true,
      meta: {
        title: '电价设置',
        noCache: true,
        activeMenu: '/netWorkDot/stationPricingList',
        authFollow: '/netWorkDot/stationPricingList'
      }
    },
{
      path: '/netWorkDot/stationPricingDetail',
      component: () => import('@/views/netWorkDot/stationPricingDetail'),
      name: 'stationPricingDetail',
      hidden: true,
      meta: {
        title: '电价详情',
        noCache: true,
        activeMenu: '/netWorkDot/stationPricingList',
        authFollow: '/netWorkDot/stationPricingList'
      }
    },
{
      path: '/netWorkDot/setting/:id',
      component: () => import('@/views/netWorkDot/netWorkDotSetting'),
      name: 'netWorkDotSetting',
      hidden: true,
      meta: {
        title: '站点设置',
        noCache: true,
        authFollow: '/netWorkDot/netWorkDotList'
      }
    },
{
      path: '/netWorkDot/chargeStationForm',
      component: () => import('@/views/netWorkDot/components/chargeStationForm.vue'),
      name: 'chargeStationForm',
      hidden: true,
      meta: {
        title: '添加站点',
        noCache: true,
        activeMenu: '/netWorkDot/netWorkDotList',
        authFollow: '/netWorkDot/netWorkDotList'
      }
    }
]
