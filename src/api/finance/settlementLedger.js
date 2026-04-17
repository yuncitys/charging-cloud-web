import request from '@/utils/request'

export function periodPage(data) {
  return request({
    url: '/api/web/settlementLedger/period/page',
    method: 'post',
    data
  })
}

export function periodDetail(periodId) {
  return request({
    url: `/api/web/settlementLedger/period/${periodId}`,
    method: 'get'
  })
}

export function linePage(data) {
  return request({
    url: '/api/web/settlementLedger/period/lines',
    method: 'post',
    data
  })
}

export function rebuildOpenPeriod(periodId) {
  return request({
    url: '/api/web/settlementLedger/rebuildOpenPeriod',
    method: 'post',
    params: { periodId }
  })
}

export function syncDailyCycle(statDate) {
  return request({
    url: '/api/web/settlementLedger/syncDailyCycle',
    method: 'post',
    params: { statDate }
  })
}

export function syncWeeklyLastWeek() {
  return request({
    url: '/api/web/settlementLedger/syncWeeklyLastWeek',
    method: 'post'
  })
}

export function syncMonthlyLastMonth() {
  return request({
    url: '/api/web/settlementLedger/syncMonthlyLastMonth',
    method: 'post'
  })
}

export function submitPayout(data) {
  return request({
    url: '/api/web/settlementLedger/submitPayout',
    method: 'post',
    data
  })
}

export function ingestTaskStats() {
  return request({
    url: '/api/web/settlementLedger/ingestTask/stats',
    method: 'get'
  })
}
