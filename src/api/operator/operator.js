import request from '@/utils/request'

//机构列表
export function getOperatorList(data) {
	return request({
		url: '/api/web/operator/page',
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

export function getOperator() {
	return request({
		url: '/api/web/operator',
		method: 'get'
	})
}

export function addOperator(data) {
	return request({
		url: '/api/web/operator/save',
		method: 'post',
		headers: {
			"Content-Type": "application/json; charset=UTF-8",
		},
		data
	})
}

export function updateOperator(data) {
	return request({
		url: '/api/web/operator/update',
		method: 'post',
		headers: {
			"Content-Type": "application/json; charset=UTF-8",
		},
		data
	})
}

export function deleteOperator(id) {
	return request({
		url: '/api/web/operator/delete/' + id,
		method: 'delete'
	})
}