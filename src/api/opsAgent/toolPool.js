import request from '@/utils/request'
import { agentPath } from './paths'

export function listToolPool() {
	return request({
		url: agentPath('/tool-pool'),
		method: 'get'
	})
}

export function updateToolPool(toolName, data) {
	return request({
		url: agentPath(`/tool-pool/${encodeURIComponent(toolName)}`),
		method: 'put',
		data: data || {}
	})
}

export function syncToolPool() {
	return request({
		url: agentPath('/tool-pool/sync'),
		method: 'post'
	})
}
