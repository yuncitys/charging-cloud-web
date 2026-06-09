import request from '@/utils/request'

export function summary(data) {
  return request({
    url: '/api/web/stationFinanceDayBill/summary',
    method: 'post',
    data
  })
}

export function page(data) {
  return request({
    url: '/api/web/stationFinanceDayBill/page',
    method: 'post',
    data
  })
}

export function exportBill(data) {
  return request({
    url: '/api/web/stationFinanceDayBill/export',
    method: 'post',
    data
  })
}
