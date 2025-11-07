import request from '@/utils/request'

// 查询调度日志列表
export function listJobLog(data) {
  return request({
    url: '/api/monitor/job/log/page',
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

// 删除调度日志
export function delJobLog(jobLogId) {
  let data = {
    jobLogIds:jobLogId
  }
  return request({
    url: '/api/monitor/job/log/remove',
    method: 'delete',
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

// 清空调度日志
export function cleanJobLog() {
  return request({
    url: '/api/monitor/job/log/clean',
    method: 'delete'
  })
}

// 导出excel
export function exportExcel(data) {
	return request({
		url: '/api/monitor/job/log/export',
		method: 'post',
		headers: {
			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
		},
		responseType: 'blob',
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

// 导出excel
export function downloadExcel(data) {
	return request({
		url: '/api/monitor/job/log/download',
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

