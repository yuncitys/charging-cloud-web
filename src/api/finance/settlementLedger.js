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
