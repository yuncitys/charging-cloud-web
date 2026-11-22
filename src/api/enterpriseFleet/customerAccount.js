import request from '@/utils/request'

// 客户机构后台账号列表
export function listCustomerAdminAccount(orgId) {
  return request({
    url: `/api/web/chargingCustomer/${orgId}/adminAccount/list`,
    method: 'get'
  })
}

// 开通客户机构后台账号
export function createCustomerAdminAccount(orgId, params) {
  return request({
    url: `/api/web/chargingCustomer/${orgId}/adminAccount/create`,
    method: 'post',
    params
  })
}
