import request from '@/utils/request'

export function listToolPool() {
	return request({
		url: '/api/agent/tool-pool',
		method: 'get'
	})
}

export function updateToolPool(toolName, data) {
	return request({
		url: `/api/agent/tool-pool/${encodeURIComponent(toolName)}`,
		method: 'put',
		data
	})
}

export function syncToolPool() {
	return request({
		url: '/api/agent/tool-pool/sync',
		method: 'post'
	})
}
