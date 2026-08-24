import Layout from '@/layout'

/**
 * Menu-aligned route module (scheme A).
 * URL prefixes keep historical paths; sidebar/menu tree comes from backend.
 */
// 充电客户

export default [
{
    path: '/chargingCustomer',
    component: Layout,
    redirect: '/chargingCustomer/index',
    name: 'chargingCustomer',
    meta: {
      title: '充电客户管理',
      icon: 'el-icon-s-check',
    },
    children: [
      {
        path: 'index',
        component: () => import('@/views/chargingCustomer/index'),
        name: 'chargingCustomer',
        meta: {
          title: '充电客户管理',
          icon: 'el-icon-s-check',
        }
      }
    ]
  },
{
    path: '/chargingCustomerCar',
    component: Layout,
    redirect: '/chargingCustomerCar/index',
    name: 'chargingCustomerCar',
    meta: {
      title: '客户车辆',
      icon: 'el-icon-s-check',
    },
    children: [
      {
        path: 'index',
        component: () => import('@/views/chargingCustomerCar/index'),
        name: 'chargingCustomerCar',
        meta: {
          title: '客户车辆',
          icon: 'el-icon-s-check',
        }
      }
    ]
  },
{
    path: '/chargingCustomerDriver',
    component: Layout,
    redirect: '/chargingCustomerDriver/index',
    name: 'chargingCustomerDriver',
    meta: {
      title: '客户司机',
      icon: 'peoples',
    },
    children: [
      {
        path: 'index',
        component: () => import('@/views/chargingCustomerDriver/index'),
        name: 'chargingCustomerDriver',
        meta: {
          title: '客户司机',
          icon: 'peoples',
        }
      }
    ]
  }
]
