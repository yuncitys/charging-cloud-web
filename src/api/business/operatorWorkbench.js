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

// V2：预警阈值 / 忽略
export function getAlertConfig(merchantId) {
  return request({
    url: '/api/web/operatorWorkbench/alertConfig',
    method: 'get',
    params: { merchantId }
  })
}

export function saveAlertConfig(data) {
  return request({
    url: '/api/web/operatorWorkbench/alertConfig',
    method: 'put',
    data
  })
}

export function dismissAlert(data) {
  return request({
    url: '/api/web/operatorWorkbench/alerts/dismiss',
    method: 'post',
    data
  })
}

// 批量忽略：{ days, items: [{ merchantId, stationId, alertType }] } → { successCount, failCount, failures }
export function batchDismissAlerts(data) {
  return request({
    url: '/api/web/operatorWorkbench/alerts/dismiss/batch',
    method: 'post',
    data
  })
}

export function listDismissed(merchantId) {
  return request({
    url: '/api/web/operatorWorkbench/alerts/dismissed',
    method: 'get',
    params: { merchantId }
  })
}

export function cancelDismiss(id, merchantId) {
  return request({
    url: `/api/web/operatorWorkbench/alerts/dismiss/${id}`,
    method: 'delete',
    params: { merchantId }
  })
}
