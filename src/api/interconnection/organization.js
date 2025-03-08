import request from '@/utils/request'

//机构列表
export function getOrganizeList(data) {
	return request({
		url: '/api/web/interconnection/organizeList',
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

export function addOrganize(data) {
	return request({
		url: '/api/web/interconnection/addOrganize',
		method: 'post',
		headers: {
			"Content-Type": "application/json; charset=UTF-8",
		},
		data
	})
}

export function updateOrganize(data) {
	return request({
		url: '/api/web/interconnection/updateOrganize',
		method: 'post',
		headers: {
			"Content-Type": "application/json; charset=UTF-8",
		},
		data
	})
}

export function getOrganize() {
	return request({
		url: '/api/web/interconnection/organize',
		method: 'get'
	})
}

export function deleteOrganize(id) {
	return request({
		url: '/api/web/interconnection/deleteOrganize/' + id,
		method: 'delete'
	})
}






export function getOrganizeSecretKeyList(data) {
	return request({
		url: '/api/web/interconnection/secretKeyList',
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

export function addOrganizeSecretKey(data) {
	return request({
		url: '/api/web/interconnection/saveSecretKey',
		method: 'post',
		headers: {
			"Content-Type": "application/json; charset=UTF-8",
		},
		data
	})
}

export function updateOrganizeSecretKey(data) {
	return request({
		url: '/api/web/interconnection/updateSecretKey',
		method: 'put',
		headers: {
			"Content-Type": "application/json; charset=UTF-8",
		},
		data
	})
}

export function deleteOrganizeSecretKey(id) {
	return request({
		url: '/api/web/interconnection/deleteSecretKey/' + id,
		method: 'delete'
	})
}