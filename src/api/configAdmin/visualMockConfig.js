import request from '@/utils/request'

export function getVisualMockConfig() {
	return request({
		url: '/api/web/visualMockConfig/get',
		method: 'get'
	})
}

export function updateVisualMockConfig(data) {
	return request({
		url: '/api/web/visualMockConfig/update',
		method: 'put',
		data
	})
}

export function resetVisualMockState() {
	return request({
		url: '/api/web/visualMockConfig/resetState',
		method: 'post'
	})
}
