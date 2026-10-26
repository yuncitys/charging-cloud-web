import request from '@/utils/request'

export function workbenchOverview(data) {
  return request({
    url: '/api/web/operatorWorkbench/overview',
    method: 'post',
    data
  })
}

export function workbenchAlerts(data) {
  return request({
    url: '/api/web/operatorWorkbench/alerts',
    method: 'post',
    data
  })
}

export function workbenchFinance(data) {
  return request({
    url: '/api/web/operatorWorkbench/finance',
    method: 'post',
    data
  })
}

export function workbenchMarketing(data) {
  return request({
    url: '/api/web/operatorWorkbench/marketing',
    method: 'post',
    data
  })
}
