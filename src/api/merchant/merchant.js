import request from '@/utils/request'

//机构列表
export function getMerchantList(data) {
	return request({
		url: '/api/web/merchant/page',
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

export function getMerchant() {
	return request({
		url: '/api/web/merchant',
		method: 'get'
	})
}

export function addMerchant(data) {
	return request({
		url: '/api/web/merchant/save',
		method: 'post',
		headers: {
			"Content-Type": "application/json; charset=UTF-8",
		},
		data
	})
}

export function updateMerchant(data) {
	return request({
		url: '/api/web/merchant/update',
		method: 'post',
		headers: {
			"Content-Type": "application/json; charset=UTF-8",
		},
		data
	})
}

export function deleteMerchant(id) {
	return request({
		url: '/api/web/merchant/delete/' + id,
		method: 'delete'
	})
}