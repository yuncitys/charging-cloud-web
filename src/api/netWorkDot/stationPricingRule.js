import request from '@/utils/request'

/** 电价管理站点列表 */
export function getStationPricingManagePage(data) {
  return request({
    url: '/api/web/stationPricingRule/managePage',
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

/** 保存或更新站点汽车时段计费（JSON） */
export function saveCarPricing(data) {
  return request({
    url: '/api/web/stationPricingRule/saveCarPricing',
    method: 'post',
    data
  })
}

/** 按站点查询汽车计费详情 */
export function getStationCarPricingDetail(params) {
  return request({
    url: '/api/web/stationPricingRule/carDetail',
    method: 'get',
    params
  })
}

/** 按站点查询历史计费策略列表（归档记录） */
export function getStationChargePriceHistoryList(params) {
  return request({
    url: '/api/web/stationPricingRule/stationChargePriceHistory/list',
    method: 'get',
    params
  })
}

/** 历史计费策略详情（主表 + 时段明细） */
export function getStationChargePriceHistoryDetail(params) {
  return request({
    url: '/api/web/stationPricingRule/stationChargePriceHistory/detail',
    method: 'get',
    params
  })
}
