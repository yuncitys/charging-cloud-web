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

export function cancelAction(id) {
	return request({
		url: `/api/agent/actions/${id}/cancel`,
		method: 'post'
	})
}

export function listSessions(params) {
	const p = params || {}
	return request({
		url: '/api/agent/sessions',
		method: 'get',
		params: {
			offset: p.offset != null ? p.offset : 0,
			limit: p.limit != null ? p.limit : 15
		}
	})
}

export function createSession() {
	return request({
		url: '/api/agent/sessions',
		method: 'post'
	})
}

export function listSessionMessages(id, limit) {
	return request({
		url: `/api/agent/sessions/${id}/messages`,
		method: 'get',
		params: { limit: limit || 200 }
	})
}

export function renameSession(id, title) {
	return request({
		url: `/api/agent/sessions/${id}`,
		method: 'patch',
		data: { title }
	})
}

export function deleteSession(id) {
	return request({
		url: `/api/agent/sessions/${id}`,
		method: 'delete'
	})
}
