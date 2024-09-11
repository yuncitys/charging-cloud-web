import request from '@/utils/request'

// 查询定时任务调度列表
export function listJob(data) {
  return request({
    url: '/api/monitor/job/page',
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

// 查询定时任务调度详细
export function getJob(jobId) {
  const data = {
    jobId
  }
  return request({
    url: '/api/monitor/job/get',
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

// 新增定时任务调度
export function addJob(data) {
  return request({
    url: '/api/monitor/job/save',
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

// 修改定时任务调度
export function updateJob(data) {
  return request({
    url: '/api/monitor/job/edit',
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

// 删除定时任务调度
export function delJob(jobId) {
  const data = {
    jobIds:jobId
  }
  return request({
    url: '/api/monitor/job/remove',
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

// 任务状态修改
export function changeJobStatus(jobId, status) {
  const data = {
    jobId,
    status
  }
  return request({
    url: '/api/monitor/job/changeStatus',
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


// 定时任务立即执行一次
export function runJob(jobId, jobGroup) {
  const data = {
    jobId,
    jobGroup
  }
  return request({
    url: '/api/monitor/job/run',
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
