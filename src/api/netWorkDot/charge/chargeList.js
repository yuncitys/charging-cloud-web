import request from '@/utils/request'
const qs = require('qs');
export function getList(data) {
	return request({
		url: '/api/web/price/page',
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

//添加方案
export function batchDevicePrices(data) {
	return request({
		url: '/api/web/price/batchDevicePrices',
		method: 'post',
		headers: {
			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
		},
		paramsSerializer: function(params) {
			return qs.stringify(params, {
				arrayFormat: 'false'
			})
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


//更新方案
export function updateDevicePrice(data) {
	return request({
		url: '/api/web/price/updateDevicePrice',
		method: 'post',
		headers: {
			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
		},
		paramsSerializer: function(params) {
			return qs.stringify(params, {
				arrayFormat: 'false'
			})
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

//删除方案数据
export function deleteDevicePrice(data) {
	return request({
		url: '/api/web/price/deleteDevicePrice',
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

//计费标准详情
export function findDevicePriceById(data) {
	return request({
		url: '/api/web/price/findDevicePriceById',
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

