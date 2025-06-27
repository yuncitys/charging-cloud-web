import request from '@/utils/request'

//查询网点列表
export function getList(data) {
	return request({
		url: '/api/web/networkDot/page',
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

//更新网点信息
export function updateNetworkDot(data) {
	return request({
		url: '/api/web/networkDot/updateNetworkDot',
		method: 'put',
		headers: {
			"Content-Type": "application/json; charset=UTF-8",
		},
		data
	})
}

//删除网点
export function deleteNetworkDot(data) {
	return request({
		url: '/api/web/networkDot/deleteNetworkDot',
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

//添加网点
export function addNetworkDot(data) {
	return request({
		url: '/api/web/networkDot/addNetworkDot',
		method: 'post',
		headers: {
			"Content-Type": "application/json; charset=UTF-8",
		},
		data
	})
}

//导出excel
export function downloadExcel(data) {
	return request({
		url: '/api/web/networkDot/exportNetworkDot',
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

//所有站点
export function getChargingStationList(tenantId) {
	return request({
		url: '/api/web/networkDot/list/' + tenantId,
		method: 'get'
	})
}
