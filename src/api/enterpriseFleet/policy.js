import request from '@/utils/request'

// 车队策略详情（含今日/本月用量）
export function getFleetPolicy(fleetId) {
  return request({
    url: `/api/web/chargingCustomer/fleet/policy/${fleetId}`,
    method: 'get'
  })
}

// 保存策略（含站点白名单）
export function saveFleetPolicy(data) {
  return request({
    url: '/api/web/chargingCustomer/fleet/policy/save',
    method: 'post',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    data
  })
}

// 启停策略
export function updateFleetPolicyStatus(fleetId, enabled) {
  return request({
    url: '/api/web/chargingCustomer/fleet/policy/status',
    method: 'post',
    params: { fleetId, enabled }
  })
}

// 复制策略（同机构车队）
export function copyFleetPolicy(fromFleetId, toFleetId) {
  return request({
    url: '/api/web/chargingCustomer/fleet/policy/copy',
    method: 'post',
    params: { fromFleetId, toFleetId }
  })
}

// 车队站点白名单
export function getFleetPolicyStations(fleetId) {
  return request({
    url: `/api/web/chargingCustomer/fleet/policy/stations/${fleetId}`,
    method: 'get'
  })
}

// 今日/本月用量
export function getFleetPolicyUsage(fleetId) {
  return request({
    url: `/api/web/chargingCustomer/fleet/policy/usage/${fleetId}`,
    method: 'get'
  })
}

// 命中日志
export function getFleetPolicyHitPage(data) {
  return request({
    url: '/api/web/chargingCustomer/fleet/policy/hit/page',
    method: 'post',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    data
  })
}
