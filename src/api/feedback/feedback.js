import request from '@/utils/request'

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

export function getFeedbackPage(data) {
  return formRequest('/api/web/feedback/page', data)
}

export function handleFeedback(data) {
  return formRequest('/api/web/feedback/handle', data)
}

export function getFeedbackTypeTree() {
  return request({ url: '/api/web/feedback/type/tree', method: 'get' })
}

export function saveFeedbackType(data) {
  return request({ url: '/api/web/feedback/type', method: 'post', data })
}

export function saveFeedbackSubType(data) {
  return request({ url: '/api/web/feedback/subType', method: 'post', data })
}

export function saveFeedbackTypeFields(typeId, fields) {
  return request({ url: `/api/web/feedback/typeField?typeId=${typeId}`, method: 'post', data: fields })
}

export function importFeedbackTemplate() {
  return request({ url: '/api/web/feedback/importTemplate', method: 'post' })
}

export function deleteFeedbackType(id) {
  return request({ url: `/api/web/feedback/type/${id}`, method: 'delete' })
}
