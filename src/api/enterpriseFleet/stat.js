import request from '@/utils/request'

// 车队汇总（区间，分页）
export function getFleetStatPage(data) {
  return request({
    url: '/api/web/chargingCustomer/fleet/stat/page',
    method: 'post',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    data
  })
}

// 日趋势
export function getFleetStatTrend(params) {
  return request({
    url: '/api/web/chargingCustomer/fleet/stat/trend',
    method: 'get',
    params
  })
}

// 车辆明细（区间，分页）
export function getFleetCarStatPage(data) {
  return request({
    url: '/api/web/chargingCustomer/fleet/stat/carPage',
    method: 'post',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    data
  })
}

// 车辆 TOP
export function getFleetCarStatRank(data) {
  return request({
    url: '/api/web/chargingCustomer/fleet/stat/carRank',
    method: 'post',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    data
  })
}
