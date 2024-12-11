import request from '@/utils/request'

//获取计费详情
export function getOrderExpenseInfo(orderCode) {
	return request({
		url: '/api/web/orderExpenseInfo/' + orderCode,
		method: 'get',
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
		]
	})
}
