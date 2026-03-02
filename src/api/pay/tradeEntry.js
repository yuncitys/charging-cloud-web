import request from '@/utils/request'

// 查询交易商户列表
export function listTradeEntry(query) {
  return request({
    url: '/api/pay/tradeMerchant/list',
    method: 'get',
    params: query
  })
}

// 查询交易商户详细
export function getTradeEntry(id) {
  return request({
    url: '/api/pay/tradeMerchant/' + id,
    method: 'get'
  })
}

// 新增交易商户
export function addTradeEntry(data) {
  return request({
    url: '/api/pay/tradeMerchant/saveTradeMerchant',
    method: 'post',
    data: data
  })
}

// 修改交易商户
export function updateTradeEntry(data) {
  return request({
    url: '/api/pay/tradeMerchant/updateTradeMerchant/' + data.id,
    method: 'put',
    data: data
  })
}

// 删除交易商户
export function delTradeEntry(id) {
  return request({
    url: '/api/pay/tradeMerchant/' + id,
    method: 'delete'
  })
}

// 交易商户图片识别
export function imgInfoDiscern(data) {
  return request({
    url: '/api/pay/merchantFile/imgInfoDiscern',
    method: 'post',
    data: data
    // request.js might not automatically set headers for FormData if not explicitly handled or if using a library like axios it usually does.
    // However, usually axios handles FormData automatically setting 'Content-Type': 'multipart/form-data'
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
    url: `/api/pay/tradeMerchant/queryTradeEntry/${id}`,
    method: 'get'
  })
}
