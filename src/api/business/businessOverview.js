import request from '@/utils/request'

// 表单提交（x-www-form-urlencoded），空值不提交
function postForm(url, data) {
  return request({
    url,
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    transformRequest: [
      function(data) {
        var ret = ''
        for (var it in data) {
          if (data[it] === undefined || data[it] === null || data[it] === '') continue
          ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
        }
        return ret.substring(0, ret.lastIndexOf('&'))
      }
    ],
    data
  })
}

export function businessOverviewCoreTrend(data) {
  return postForm('/api/web/home/businessOverview/coreTrend', data)
}

export function businessOverviewStationList(data) {
  return postForm('/api/web/home/businessOverview/stationList', data)
}

export function businessOverviewStationExport(data) {
  return postForm('/api/web/home/businessOverview/stationExport', data)
}
