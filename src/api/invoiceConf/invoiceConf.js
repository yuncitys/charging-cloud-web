import request from '@/utils/request'

export function del(id) {
	return request({
		url: '/api/web/invoiceConfig/' + id,
		method: 'delete'
	})
}

export function get(id) {
	return request({
		url: '/api/web/invoiceConfig/info/' + id,
		method: 'get'
	})
}

export function page(data) {
  	return request({
		url: '/api/web/invoiceConfig/page',
		method: 'post',
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

export function save(data) {
	return request({
		url: '/api/web/invoiceConfig/save',
		method: 'post',
		headers: {
			"Content-Type": "application/json; charset=UTF-8",
		},
		data
	})
}

export function update(data) {
	return request({
		url: '/api/web/invoiceConfig/update',
		method: 'put',
		headers: {
			"Content-Type": "application/json; charset=UTF-8",
		},
		data
	})
}
