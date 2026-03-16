import request from '@/utils/request'

// 查询交易商户列表
export function listTradeEntry(query) {
  return request({
    url: '/api/payment/tradeMerchant/page',
    method: 'get',
    params: query
  })
}

export function listCompleted(params) {
  return request({
    url: '/api/payment/tradeMerchant/listCompleted',
    method: 'get',
    params
  })
}

// 查询交易商户详细
export function getTradeEntry(id) {
  return request({
    url: '/api/payment/tradeMerchant/' + id,
    method: 'get'
  })
}

// 新增交易商户
export function addTradeEntry(data) {
  return request({
    url: '/api/payment/tradeMerchant/saveTradeMerchant',
    method: 'post',
    data: data
  })
}

// 修改交易商户
export function updateTradeEntry(data) {
  return request({
    url: '/api/payment/tradeMerchant/updateTradeMerchant/' + data.id,
    method: 'put',
    data: data
  })
}

// 删除交易商户
export function delTradeEntry(id) {
  return request({
    url: '/api/payment/tradeMerchant/' + id,
    method: 'delete'
  })
}

export function removeTradeEntry(id) {
  return request({
    url: '/api/payment/tradeMerchant/removeTradeEntry/' + id,
    method: 'delete'
  })
}

// 交易商户图片识别
export function imgInfoDiscern(data) {
  return request({
    url: '/api/payment/merchantFile/imgInfoDiscern',
    method: 'post',
    data: data
    // request.js might not automatically set headers for FormData if not explicitly handled or if using a library like axios it usually does.
    // However, usually axios handles FormData automatically setting 'Content-Type': 'multipart/form-data'
  })
}

// 交易商户详情（含附件）
export function getTradeEntryDetail(id) {
  return request({
    url: '/api/payment/tradeMerchant/detailTradeEntry/' + id,
    method: 'get'
  })
}

export function detailTradeEntryByMerchantId(params) {
  return request({
    url: '/api/payment/tradeMerchant/detailTradeEntryByMerchantId',
    method: 'get',
    params
  })
}

// 地区选择器查询
export function getAreaSelector(id) {
  return request({
    url: `/api/permission/area/${id}/Selector`,
    method: 'get'
  })
}

// 交易商户状态查询
export function queryTradeEntryStatus(id) {
  return request({
    url: `/api/payment/tradeMerchant/queryTradeEntry/${id}`,
    method: 'get'
  })
}

export function submitTradeEntry(busTradeMerNo) {
  return request({
    url: `/api/payment/tradeMerchant/submitTradeEntry`,
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
    data: { busTradeMerNo }
  })
}
