/**
 * 扁平页面表（方案 B）。buildRoutes 按 URL 第一段自动包 Layout。
 * URL prefixes keep historical paths; sidebar/menu tree comes from backend.
 */
// 充电客户

export default [
{
        path: '/chargingCustomer/index',
        component: () => import('@/views/chargingCustomer/index'),
        name: 'chargingCustomer',
        meta: {
          title: '充电客户管理',
          icon: 'el-icon-s-check',
        }
      },
{
        path: '/chargingCustomerCar/index',
        component: () => import('@/views/chargingCustomerCar/index'),
        name: 'chargingCustomerCar',
        meta: {
          title: '客户车辆',
          icon: 'el-icon-s-check',
        }
      },
{
        path: '/chargingCustomerDriver/index',
        component: () => import('@/views/chargingCustomerDriver/index'),
        name: 'chargingCustomerDriver',
        meta: {
          title: '客户司机',
          icon: 'peoples',
        }
      }
]
