import request from '@/utils/request'

// 车队分页
export function getFleetPage(data) {
  return request({
    url: '/api/web/chargingCustomer/fleet/page',
    method: 'post',
    data
  })
}

// 机构下车队下拉
export function getFleetOptions(orgId) {
  return request({
    url: '/api/web/chargingCustomer/fleet/listByOrgId',
    method: 'get',
    params: { orgId }
  })
}

export function addFleet(data) {
  return request({
    url: '/api/web/chargingCustomer/fleet/add',
    method: 'post',
    data
  })
}

export function updateFleet(data) {
  return request({
    url: '/api/web/chargingCustomer/fleet/update',
    method: 'post',
    data
  })
}

export function updateFleetStatus(id, status) {
  return request({
    url: '/api/web/chargingCustomer/fleet/updateStatus',
    method: 'post',
    params: { id, status }
  })
}

export function deleteFleet(id) {
  return request({
    url: '/api/web/chargingCustomer/fleet/delete',
    method: 'post',
    params: { id }
  })
}
