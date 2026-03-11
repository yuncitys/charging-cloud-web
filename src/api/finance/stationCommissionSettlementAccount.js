import request from '@/utils/request'

export function getByStationId(stationId) {
  return request({
    url: `/api/web/stationCommissionSettlementAccount/getByStationId/${stationId}`,
    method: 'get'
  })
}

export function saveOrUpdate(data) {
  return request({
    url: '/api/web/stationCommissionSettlementAccount/saveOrUpdate',
    method: 'post',
    data
  })
}

