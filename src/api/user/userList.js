import request from '@/utils/request'

//微信
export function wxgetListNew(data) {
	return request({
		url: '/api/web/appUser/page',
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

//删除用户
export function deleteUser(data) {
	return request({
		url: '/api/web/appUser/deleteAppUser',
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

//更新用户
export function updateAppUserer(data) {
	return request({
		url: '/api/web/appUser/updateAppUser',
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

//批量删除
export function batchDeleteAppUser(data) {
	return request({
		url: '/api/web/appUser/batchDeleteAppUser',
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

//充值
export function updateCash(data) {
	return request({
		url: '/api/web/appUser/updateCash',
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

