import request from '@/utils/request'

export function getFaultKpi(params) {
  return request({
    url: '/api/web/monitor/fault/kpi',
    method: 'get',
    params
  })
}

export function pageFaultWorkOrders(params) {
  return request({
    url: '/api/web/monitor/fault/work-orders',
    method: 'get',
    params
  })
}

export function getFaultWorkOrder(id, params) {
  return request({
    url: `/api/web/monitor/fault/work-orders/${id}`,
    method: 'get',
    params
  })
}

export function createFaultWorkOrder(data) {
  return request({
    url: '/api/web/monitor/fault/work-orders',
    method: 'post',
    data
  })
}

export function assignFaultWorkOrder(id, data) {
  return request({
    url: `/api/web/monitor/fault/work-orders/${id}/assign`,
    method: 'post',
    data
  })
}

export function startFaultWorkOrder(id) {
  return request({
    url: `/api/web/monitor/fault/work-orders/${id}/start`,
    method: 'post'
  })
}

export function remarkFaultWorkOrder(id, data) {
  return request({
    url: `/api/web/monitor/fault/work-orders/${id}/remark`,
    method: 'post',
    data
  })
}

export function closeFaultWorkOrder(id, data) {
  return request({
    url: `/api/web/monitor/fault/work-orders/${id}/close`,
    method: 'post',
    data
  })
}

export function cancelFaultWorkOrder(id, data) {
  return request({
    url: `/api/web/monitor/fault/work-orders/${id}/cancel`,
    method: 'post',
    data
  })
}

export function findOpenWorkOrderByAlarm(params) {
  return request({
    url: '/api/web/monitor/fault/work-orders/by-alarm',
    method: 'get',
    params
  })
}
