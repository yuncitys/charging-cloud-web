import request from '@/utils/request'

export function connect(data) {
  return request({
  	url: '/api/message/chargePileSimulator/connect',
  	method: 'post',
  	headers: {
  		"Content-Type": "application/json; charset=UTF-8",
  	},
  	data
  })
}

export function disconnect(data) {
  return request({
  	url: '/api/message/chargePileSimulator/disconnect',
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

export function connectStatus(chargePointId) {
  return request({
  	url: '/api/message/chargePileSimulator/connectStatus/' + chargePointId,
  	method: 'get',
  	headers: {
  		"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
  	}
  })
}

export function trigger(data) {
  return request({
  	url: '/api/message/chargePileSimulator/trigger',
  	method: 'post',
  	headers: {
  		"Content-Type": "application/json; charset=UTF-8",
  	},
  	data
  })
}
