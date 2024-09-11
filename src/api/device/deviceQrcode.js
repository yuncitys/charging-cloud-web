import request from '@/utils/request'

export function getList(data) {
	return request({
		url: '/api/web/qr/page',
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
//解绑
export function unBindingQRCode(data) {
	return request({
		url: '/api/web/qr/unBinding',
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
// 生成插座二维码
export function generateQR(data) {
	return request({
		url: '/api/web/qr/generate',
		method: 'post',
		headers: {
			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
		},
		// responseType: 'blob',
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