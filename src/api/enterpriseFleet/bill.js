import request from '@/utils/request'

// 账单列表
export function getFleetBillPage(data) {
  return request({
    url: '/api/web/chargingCustomer/fleet/bill/page',
    method: 'post',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    data
  })
}

// 账单详情（含日明细）
export function getFleetBillDetail(id) {
  return request({
    url: `/api/web/chargingCustomer/fleet/bill/${id}`,
    method: 'get'
  })
}

// 生成/重算账单
export function generateFleetBill(params) {
  return request({
    url: '/api/web/chargingCustomer/fleet/bill/generate',
    method: 'post',
    params
  })
}

// 锁定账单
export function lockFleetBill(id) {
  return request({
    url: '/api/web/chargingCustomer/fleet/bill/lock',
    method: 'post',
    params: { id }
  })
}

// 对账差异列表
export function getFleetReconcilePage(data) {
  return request({
    url: '/api/web/chargingCustomer/fleet/reconcile/page',
    method: 'post',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    data
  })
}

// 生成/重算对账
export function runFleetReconcile(params) {
  return request({
    url: '/api/web/chargingCustomer/fleet/reconcile/run',
    method: 'post',
    params
  })
}

// 处理对账差异
export function handleFleetReconcile(params) {
  return request({
    url: '/api/web/chargingCustomer/fleet/reconcile/handle',
    method: 'post',
    params
  })
}

// 解锁账单（已锁定 → 未锁定）
export function unlockFleetBill(params) {
  return request({
    url: '/api/web/chargingCustomer/fleet/bill/unlock',
    method: 'post',
    params
  })
}

// 导出车队账单
export function exportFleetBill(params) {
  return request({
    url: '/api/web/chargingCustomer/fleet/bill/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

// 导出车队对账差异
export function exportFleetReconcile(params) {
  return request({
    url: '/api/web/chargingCustomer/fleet/reconcile/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
