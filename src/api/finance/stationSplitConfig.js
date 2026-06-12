import request from '@/utils/request'

function formRequest(data) {
  return {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    transformRequest: [
      function(payload) {
        var ret = ''
        for (var it in payload) {
          if (payload[it] === undefined || payload[it] === null || payload[it] === '') continue
          ret += encodeURIComponent(it) + '=' + encodeURIComponent(payload[it]) + '&'
        }
        ret = ret.substring(0, ret.lastIndexOf('&'))
        return ret
      }
    ],
    data
  }
}

export function getList(data) {
  return request({
    url: '/api/web/stationCommissionSettlementAccount/page',
    method: 'post',
    ...formRequest(data)
  })
}

export function getByStationId(stationId) {
  return request({
    url: `/api/web/stationCommissionSettlementAccount/getByStationId/${stationId}`,
    method: 'get'
  })
}

export function batchSave(stationId, data) {
  return request({
    url: `/api/web/stationCommissionSettlementAccount/batchSave/${stationId}`,
    method: 'post',
    data
  })
}

export function batchSaveStations(data) {
  return request({
    url: '/api/web/stationCommissionSettlementAccount/batchSaveStations',
    method: 'post',
    data
  })
}
