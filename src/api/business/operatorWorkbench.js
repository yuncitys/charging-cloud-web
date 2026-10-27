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

// 营销分析：body = OperatorWorkbenchQuery + analysisDays(默认 30，最大 90)；statDate 为窗口末日（服务端夹取到今天）
// → { trend: [{ date, issueCount, redeemCount, discountCost, activityOrderKwh }],
//     activityTop: [{ activityId, activityName, issueCount, redeemCount, activityOrderKwh, discountCost }] }
// 趋势仅返回有日表行的日期，前端补 0
export function workbenchMarketingAnalysis(data) {
  return request({
    url: '/api/web/operatorWorkbench/marketingAnalysis',
    method: 'post',
    data
  })
}

// V3：终端状态（实时，不随周期）→ { dc: {fault,offline,occupy,charging,idle,other}, ac: {...} }
export function getTerminalStatus(data) {
  return request({
    url: '/api/web/operatorWorkbench/terminalStatus',
    method: 'post',
    data
  })
}

// V3：电站电量 Top10 → [{ rank, stationId, stationName, totalKwh, avgDailyKwh, avgDailyKwhPerGun, gunCount, utilizationRate, ratedPowerKw }]
export function getStationPowerTop(data) {
  return request({
    url: '/api/web/operatorWorkbench/stationPowerTop',
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
