import request from '@/utils/request'

export function getList(data) {
	return request({
		url: '/api/payment/paymentLog/page',
		method: 'POST',
		headers: {
			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
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
    url: `/api/payment/paymentLog/${id}`,
    method: 'get'
  })
}

export function del(id, data) {
  return request({
    url: `/api/payment/paymentLog/${id}`,
    method: 'delete',
    data: data
  })
}




