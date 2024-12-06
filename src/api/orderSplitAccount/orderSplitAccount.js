import request from '@/utils/request'

//获取分成帐号
export function getSplitAccount(data) {
	return request({
		url: '/api/web/splitAccount/getByNetworkDotId',
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

//保存或更新
export function saveOrUpdate(data) {
	return request({
		url: '/api/web/splitAccount/saveOrUpdate',
		method: 'post',
		headers: {
			"Content-Type": "application/json; charset=UTF-8",
		},
		data
	})
}
