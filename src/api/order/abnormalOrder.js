import request from '@/utils/request'

const formHeaders = {
  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
}

function postForm(url, data) {
  return request({
    url,
    method: 'post',
    headers: formHeaders,
    transformRequest: [
      function(payload) {
        let ret = ''
        for (const it in payload) {
          if (payload[it] === undefined || payload[it] === null) continue
          ret += encodeURIComponent(it) + '=' + encodeURIComponent(payload[it]) + '&'
        }
        return ret.substring(0, ret.lastIndexOf('&'))
      }
    ],
    data: data || {}
  })
}

export function getAbnormalPage(data) {
  return postForm('/api/web/order/abnormal/page', data)
}

export function getAbnormalSummary(data) {
  return postForm('/api/web/order/abnormal/summary', data)
}

export function getAbnormalDetail(data) {
  return postForm('/api/web/order/abnormal/detail', data)
}

export function markAbnormal(data) {
  return postForm('/api/web/order/abnormal/mark', data)
}

export function voidAbnormal(data) {
  return postForm('/api/web/order/abnormal/void', data)
}

export function previewAbnormalSettle(data) {
  return postForm('/api/web/order/abnormal/settle/preview', data)
}

export function settleAbnormal(data) {
  return postForm('/api/web/order/abnormal/settle', data)
}

export function retryAbnormal(data) {
  return postForm('/api/web/order/abnormal/retry', data)
}

export function getAbnormalLogs(data) {
  return postForm('/api/web/order/abnormal/log/page', data)
}

export function exportAbnormal(data) {
  return postForm('/api/web/order/abnormal/export', data)
}
