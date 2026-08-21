import request from '@/utils/request'

export function pageParallelCharge(params) {
  return request({ url: '/api/web/networkDot/parallelCharge/page', method: 'get', params })
}

export function getParallelChargeDetail(stationId) {
  return request({ url: '/api/web/networkDot/parallelCharge/detail', method: 'get', params: { stationId }})
}

export function saveParallelCharge(data) {
  return request({ url: '/api/web/networkDot/parallelCharge/save', method: 'post', data })
}
