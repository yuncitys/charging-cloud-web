import request from '@/utils/request'

export function getChargingCustomerPage(data) {
  return request({
    url: '/api/web/chargingCustomer/page',
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    transformRequest: [
      function(data) {
        let ret = ''
        for (const it in data) {
          ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
        }
        return ret.substring(0, ret.lastIndexOf('&'))
      }
    ],
    data
  })
}

export function getChargingCustomerDetail(id) {
  return request({
    url: `/api/web/chargingCustomer/detail/${id}`,
    method: 'get'
  })
}

export function addChargingCustomer(data) {
  return request({
    url: '/api/web/chargingCustomer/add',
    method: 'post',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    data
  })
}

export function updateChargingCustomer(data) {
  return request({
    url: '/api/web/chargingCustomer/update',
    method: 'post',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    data
  })
}

export function getChargingCustomerFinanceWallet(organizationId) {
  return request({
    url: `/api/web/chargingCustomer/finance/wallet/${organizationId}`,
    method: 'get'
  })
}

export function getChargingCustomerFinanceFlowPage(data) {
  return request({
    url: '/api/web/chargingCustomer/finance/flow/page',
    method: 'post',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    data
  })
}

export function downloadChargingCustomerFinanceFlow(data) {
  return request({
    url: '/api/web/chargingCustomer/finance/flow/download',
    method: 'post',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    data
  })
}

export function adjustChargingCustomerWallet(data) {
  return request({
    url: '/api/web/chargingCustomer/finance/wallet/adjust',
    method: 'post',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    data
  })
}

export function adjustChargingCustomerAllocation(data) {
  return request({
    url: '/api/web/chargingCustomer/finance/allocation/adjust',
    method: 'post',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    data
  })
}

export function getChargingCustomerAllocationUsers(organizationId) {
  return request({
    url: `/api/web/chargingCustomer/finance/allocation/users/${organizationId}`,
    method: 'get'
  })
}
