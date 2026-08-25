import request from '@/utils/request'

const BASE = '/api/permission/dictionaryType'

const JSON_HEADERS = {
	'Content-Type': 'application/json; charset=UTF-8'
}

export function listDictionaryType(params) {
	return request({
		url: `${BASE}/list`,
		method: 'get',
		params
	})
}

export function getDictionaryType(id) {
	return request({
		url: `${BASE}/${id}`,
		method: 'get'
	})
}

export function createDictionaryType(data) {
	return request({
		url: BASE,
		method: 'post',
		headers: JSON_HEADERS,
		data
	})
}

export function updateDictionaryType(id, data) {
	return request({
		url: `${BASE}/${id}`,
		method: 'put',
		headers: JSON_HEADERS,
		data
	})
}

export function deleteDictionaryType(id) {
	return request({
		url: `${BASE}/${id}`,
		method: 'delete'
	})
}

export function updateDictionaryTypeState(id, enabledMark) {
	return request({
		url: `${BASE}/${id}/state`,
		method: 'put',
		params: { enabledMark }
	})
}
