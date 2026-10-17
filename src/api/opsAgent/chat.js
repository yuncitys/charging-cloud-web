import request from '@/utils/request'

export function sendChat(data) {
	return request({
		url: '/api/agent/chat',
		method: 'post',
		data
	})
}

export function confirmAction(id) {
	return request({
		url: `/api/agent/actions/${id}/confirm`,
		method: 'post'
	})
}
