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
