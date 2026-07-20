import request from '@/utils/request'

const BASE = '/api/web/marketing'

function formRequest(url, data, method = 'post') {
  return request({
    url,
    method,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
    transformRequest: [function(obj) {
      let ret = ''
      for (const it in obj) {
        if (obj[it] != null) ret += encodeURIComponent(it) + '=' + encodeURIComponent(obj[it]) + '&'
      }
      return ret
    }],
    data
  })
}

// ---------- 卡券 ----------
export function cardCouponPage(params) {
  return request({ url: `${BASE}/cardCoupon/page`, method: 'get', params })
}

export function cardCouponRewardOptions(params) {
  return request({ url: `${BASE}/cardCoupon/rewardOptions`, method: 'get', params })
}

export function cardCouponDetail(cardCouponId) {
  return request({ url: `${BASE}/cardCoupon/${cardCouponId}`, method: 'get' })
}

export function createCardCoupon(data) {
  return request({ url: `${BASE}/cardCoupon`, method: 'post', data })
}

export function updateCardCoupon(data) {
  return request({ url: `${BASE}/cardCoupon`, method: 'put', data })
}

export function cancelCardCoupon(cardCouponId) {
  return formRequest(`${BASE}/cardCoupon/cancel`, { cardCouponId })
}

export function increaseCardCouponStock(cardCouponId, addCount) {
  return formRequest(`${BASE}/cardCoupon/increaseStock`, { cardCouponId, addCount })
}

// ---------- 电站分组 ----------
export function stationGroupPage(params) {
  return request({ url: `${BASE}/stationGroup/page`, method: 'get', params })
}

export function stationGroupOptions(params) {
  return request({ url: `${BASE}/stationGroup/options`, method: 'get', params })
}

export function stationGroupDetail(id) {
  return request({ url: `${BASE}/stationGroup/${id}`, method: 'get' })
}

export function saveStationGroup(data) {
  return request({ url: `${BASE}/stationGroup`, method: 'post', data })
}

export function updateStationGroup(data) {
  return request({ url: `${BASE}/stationGroup`, method: 'put', data })
}

export function deleteStationGroup(id) {
  return request({ url: `${BASE}/stationGroup/${id}`, method: 'delete' })
}

export function updateStationGroupLabelStatus(id, labelStatus) {
  return formRequest(`${BASE}/stationGroup/labelStatus`, { id, labelStatus })
}

// ---------- 用户分组 ----------
export function userGroupPage(params) {
  return request({ url: `${BASE}/userGroup/page`, method: 'get', params })
}

export function userGroupOptions(params) {
  return request({ url: `${BASE}/userGroup/options`, method: 'get', params })
}

export function userGroupDetail(id) {
  return request({ url: `${BASE}/userGroup/${id}`, method: 'get' })
}

export function saveUserGroup(data) {
  return request({ url: `${BASE}/userGroup`, method: 'post', data })
}

export function updateUserGroup(data) {
  return request({ url: `${BASE}/userGroup`, method: 'put', data })
}

export function deleteUserGroup(id) {
  return request({ url: `${BASE}/userGroup/${id}`, method: 'delete' })
}

export function moveInUserGroupMembers(data) {
  return request({ url: `${BASE}/userGroup/moveIn`, method: 'post', data })
}

export function moveOutUserGroupMembers(data) {
  return request({ url: `${BASE}/userGroup/moveOut`, method: 'post', data })
}

export function updateUserGroupLabelStatus(id, labelStatus) {
  return formRequest(`${BASE}/userGroup/labelStatus`, { id, labelStatus })
}

// ---------- 活动 ----------
export function activityPage(params) {
  return request({ url: `${BASE}/activity/page`, method: 'get', params })
}

export function activityDetail(activityId) {
  return request({ url: `${BASE}/activity/${activityId}`, method: 'get' })
}

export function saveActivity(data) {
  return request({ url: `${BASE}/activity`, method: 'post', data })
}

export function updateActivity(data) {
  return request({ url: `${BASE}/activity`, method: 'put', data })
}

export function stopActivity(activityId) {
  return formRequest(`${BASE}/activity/stop`, { activityId })
}

export function directionalSend(activityId) {
  return formRequest(`${BASE}/activity/directional/send`, { activityId })
}

export function activityQrcode(activityId, regenerate = false) {
  return request({ url: `${BASE}/activity/scan/qrcode`, method: 'get', params: { activityId, regenerate } })
}

export function generateCodes(activityId, count) {
  return formRequest(`${BASE}/activity/exchange/generateCodes`, { activityId, count })
}

export function listExchangeCodes(params) {
  return request({ url: `${BASE}/activity/exchange/listCodes`, method: 'get', params })
}

export function exportExchangeCodes(params) {
  return request({
    url: `${BASE}/activity/exchange/exportCodes`,
    method: 'get',
    params,
    responseType: 'blob'
  })
}

// ---------- 记录 ----------
export function receiveRecordPage(params) {
  return request({ url: `${BASE}/receiveRecord/page`, method: 'get', params })
}

export function useRecordPage(params) {
  return request({ url: `${BASE}/useRecord/page`, method: 'get', params })
}

export function userCouponPage(params) {
  return request({ url: `${BASE}/userCoupon/page`, method: 'get', params })
}

export function cancelUserCoupon(userCardCouponId) {
  return formRequest(`${BASE}/userCoupon/cancel`, { userCardCouponId })
}

// ---------- 营销补款 ----------
export function pageSubsidyLedger(params) {
  return request({ url: `${BASE}/subsidy/ledger/page`, method: 'get', params })
}

export function pageSubsidyBatch(params) {
  return request({ url: `${BASE}/subsidy/batch/page`, method: 'get', params })
}

export function confirmSubsidyBatch(batchId) {
  return formRequest(`${BASE}/subsidy/batch/confirmOffline`, { batchId })
}
