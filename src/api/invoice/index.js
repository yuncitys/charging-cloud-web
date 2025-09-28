import request from '@/utils/request'

/**
 * 发票冲红接口
 * @param data
 * @returns {*}
 * @constructor
 */
export function RedApplyInvoice(data) {
  return request({
    url: '/api/web/invoice/applyRedInvoice',
    method: 'post',
    data: data
  })
}

/**
 * 查询预览接口
 * @param data
 * @returns {*}
 * @constructor
 */
export function getInvoiceByApi(data) {
  return request({
    url: `/api/web/invoice/getInvoiceByApi`,
    method: 'post',
    data: data
  })
}

export function electronInvoiceById(data) {
  return request({
    url: `/api/web/invoice/electronInvoiceById`,
    method: 'post',
    data: data
  })
}

export function updateElectron(id) {
  return request({
    url: `/api/web/invoice/updateElectron/${id}`,
    method: 'POST'
  })
}

export function updateRedApplyElectron(id) {
  return request({
    url: `/api/web/invoice/updateApplyRedElectron/${id}`,
    method: 'POST'
  })
}

export function resendPush(data) {
  return request({
    url: `/api/web/invoice/resendPushFormat`,
    method: 'POST',
    data: data
  })
}




export function isLogin() {
  return request({
    url: `/api/web/invoiceLoginConfig/isLogin`,
    method: 'post'
  })
}

export function getMobilePhone() {
  return request({
    url: `/api/web/invoiceLoginConfig/getMobilePhone`,
    method: 'get'
  })
}

export function getVerificationCode(account) {
  return request({
    url: `/api/web/invoiceLoginConfig/getVerificationCode/${account}`,
    method: 'get'
  })
}

export function validateLogin(data) {
  return request({
    url: `/api/web/invoiceLoginConfig/validateLogin`,
    method: 'post',
    data: data
  })
}

export function queryFaceRecognitionResult() {
  return request({
    url: `/api/web/invoiceLoginConfig/queryFaceRecognitionResult`,
    method: 'get'
  })
}

export function queryFaceRecognitionCode(type) {
  return request({
    url: `/api/web/invoiceLoginConfig/queryFaceRecognitionCode/${type}`,
    method: 'get'
  })
}




export function page(data) {
  return request({
    url: '/api/web/invoiceRecord/page',
    headers: {
		  "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
	  },
    method: 'post',
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
