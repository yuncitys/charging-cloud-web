import request from '@/utils/request'

export function findHomeData(data) {
	return request({
		url: '/api/web/home',
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

export function findHomeDataByNetWork(data) {
	return request({
		url: '/api/web/home/networkdot',
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