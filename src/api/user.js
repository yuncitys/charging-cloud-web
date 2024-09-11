import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/api/oauth/login',
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

export function getRouter(data) {
  return request({
    url: '/api/oauth/currentUser',
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
	],
    data
  })
}

export function logout(data) {
  return request({
    url: '/api/oauth/logout',
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

