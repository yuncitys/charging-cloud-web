import request from '@/utils/request'


// 查询所有系统配置
export function getList(data) {
	return request({
		url: '/api/permission/config/all',
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

// 保存配置
export function saveConfig(data) {
	return request({
		url: '/api/permission/config/save',
		method: 'post',
		headers: {
			"Content-Type": "application/json; charset=UTF-8",
		},
		data
	})
}
