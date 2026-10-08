/** 站内消息 bizType → 业务页路由 */
const BIZ_ROUTES = {
  FAULT_WORK_ORDER: id => ({ path: '/device/faultWorkOrders', query: { id }})
}

export const ADMIN_MESSAGE_CHANGED = 'admin-message:changed'

export function adminMessageRoute(item) {
  const route = item && BIZ_ROUTES[item.bizType]
  return route && item.bizId ? route(item.bizId) : null
}
