import request from '@/utils/request'
import { agentPath } from './paths'

export function sendChat(data) {
	return request({
		url: agentPath('/chat'),
		method: 'post',
		data
	})
}

/** Persist「已停止生成」and cancel in-flight stream for this session. */
export function stopChatGeneration(sessionId) {
	return request({
		url: agentPath('/chat/stop'),
		method: 'post',
		data: { sessionId }
	})
}

export function confirmAction(id) {
	return request({
		url: agentPath(`/actions/${id}/confirm`),
		method: 'post'
	})
}

export function cancelAction(id) {
	return request({
		url: agentPath(`/actions/${id}/cancel`),
		method: 'post'
	})
}

export function listSessions(params) {
	const p = params || {}
	const query = {
		offset: p.offset != null ? p.offset : 0,
		limit: p.limit != null ? p.limit : 15
	}
	if (p.q != null && String(p.q).trim() !== '') {
		query.q = String(p.q).trim()
	}
	return request({
		url: agentPath('/sessions'),
		method: 'get',
		params: query
	})
}

export function createSession() {
	return request({
		url: agentPath('/sessions'),
		method: 'post'
	})
}

export function listSessionMessages(id, limit) {
	return request({
		url: agentPath(`/sessions/${id}/messages`),
		method: 'get',
		params: { limit: limit || 200 }
	})
}

export function listSessionPending(id) {
	return request({
		url: agentPath(`/sessions/${id}/pending`),
		method: 'get'
	})
}

export function renameSession(id, title) {
	return request({
		url: agentPath(`/sessions/${id}`),
		method: 'patch',
		data: { title }
	})
}

export function deleteSession(id) {
	return request({
		url: agentPath(`/sessions/${id}`),
		method: 'delete'
	})
}

export function fetchAgentUiConfig() {
	return request({
		url: agentPath('/ui/config'),
		method: 'get'
	})
}
