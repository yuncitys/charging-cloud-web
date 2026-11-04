import request from '@/utils/request'

function formBody(data) {
  var ret = ''
  for (var it in data) {
    if (data[it] === null || data[it] === undefined) continue
    ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
  }
  return ret.substring(0, ret.lastIndexOf('&'))
}

function postForm(url, data) {
  return request({
    url,
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    transformRequest: [formBody],
    data
  })
}

export function getUserPage(data) {
  return postForm('/api/web/wechatBillReconcile/userPage', data)
}

export function getUserDetail(data) {
  return postForm('/api/web/wechatBillReconcile/userDetail', data)
}

export function getLinePage(data) {
  return postForm('/api/web/wechatBillReconcile/linePage', data)
}
