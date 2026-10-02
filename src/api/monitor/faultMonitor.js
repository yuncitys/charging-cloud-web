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

export function getFaultWorkOrderStatusCounts(params) {
  return request({
    url: '/api/web/monitor/fault/work-orders/status-counts',
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

export function listFaultStationDevices(stationId) {
  return request({
    url: `/api/web/monitor/fault/stations/${stationId}/devices`,
    method: 'get'
  })
}

export function checkOpenWorkOrders(params) {
  return request({
    url: '/api/web/monitor/fault/work-orders/open-check',
    method: 'get',
    params
  })
}

export function getAssigneeCandidates(id) {
  return request({
    url: `/api/web/monitor/fault/work-orders/${id}/assignee-candidates`,
    method: 'get'
  })
}

export function exportFaultWorkOrders(params) {
  return request({
    url: '/api/web/monitor/fault/work-orders/export',
    method: 'post',
    params
  })
}

export function reopenFaultWorkOrder(id, data) {
  return request({
    url: `/api/web/monitor/fault/work-orders/${id}/reopen`,
    method: 'post',
    data
  })
}

export function batchAssignFaultWorkOrders(data) {
  return request({
    url: '/api/web/monitor/fault/work-orders/batch/assign',
    method: 'post',
    data
  })
}

export function batchCloseFaultWorkOrders(data) {
  return request({
    url: '/api/web/monitor/fault/work-orders/batch/close',
    method: 'post',
    data
  })
}

export function batchCancelFaultWorkOrders(data) {
  return request({
    url: '/api/web/monitor/fault/work-orders/batch/cancel',
    method: 'post',
    data
  })
}
