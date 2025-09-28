import request from '@/utils/request'

export function del(id) {
  return request({
    url: '/api/web/invoiceCustomer/' + id,
    method: 'delete'
  })
}

export function get(id) {
  return request({
    url: '/api/web/invoiceCustomer/' + id,
    method: 'get'
  })
}

export function page(data) {
  return request({
    url: '/api/web/invoiceCustomer/page',
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

export function saveOrUpdate(data) {
	return request({
		url: '/api/web/invoiceCustomer/addOrUpdate',
		method: 'post',
		headers: {
			"Content-Type": "application/json; charset=UTF-8",
		},
		data
	})
}
