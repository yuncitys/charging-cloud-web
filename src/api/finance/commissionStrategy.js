import request from '@/utils/request'

export function getList(data) {
  return request({
    url: '/api/web/stationCommissionPriceStrategy/page',
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    transformRequest: [
      function(data) {
        var ret = ''
        for (var it in data) {
          ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
        }
        ret = ret.substring(0, ret.lastIndexOf('&'))
        return ret
      }
    ],
    data
  })
}

export function getInfo(id) {
  return request({
    url: `/api/web/stationCommissionPriceStrategy/${id}`,
    method: 'get'
  })
}

export function saveOrUpdate(data) {
  return request({
    url: '/api/web/stationCommissionPriceStrategy/saveOrUpdate',
    method: 'post',
    data: data
  })
}

export function batchSaveOrUpdate(data) {
  return request({
    url: '/api/web/stationCommissionPriceStrategy/batchSaveOrUpdate',
    method: 'post',
    data: data
  })
}
