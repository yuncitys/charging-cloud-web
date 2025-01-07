import request from '@/utils/request'

export function getList(data) {
	return request({
		url: '/api/web/refundCenter/page',
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

export function getTradingOrder(data) {
	return request({
		url: '/api/web/refundCenter/getTradingOrder',
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

export function tradingRefund(data) {
  return request({
  	url: '/api/web/refundCenter/tradingRefund',
  	method: 'post',
  	headers: {
  		"Content-Type": "application/json; charset=UTF-8",
  	},
  	data
  })
}




