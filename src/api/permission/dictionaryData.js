import request from '@/utils/request'

const BASE = '/api/permission/dictionaryData'

const JSON_HEADERS = {
	'Content-Type': 'application/json; charset=UTF-8'
}

export function listDictionaryData(params) {
	return request({
		url: `${BASE}/list`,
		method: 'get',
		params
	})
}

export function getDictionaryData(id) {
	return request({
		url: `${BASE}/${id}`,
		method: 'get'
	})
}

export function createDictionaryData(data) {
	return request({
		url: BASE,
		method: 'post',
		headers: JSON_HEADERS,
		data
	})
}

export function updateDictionaryData(id, data) {
	return request({
		url: `${BASE}/${id}`,
		method: 'put',
		headers: JSON_HEADERS,
		data
	})
}

export function deleteDictionaryData(id) {
	return request({
		url: `${BASE}/${id}`,
		method: 'delete'
	})
}

export function updateDictionaryDataState(id, enabledMark) {
	return request({
		url: `${BASE}/${id}/state`,
		method: 'put',
		params: { enabledMark }
	})
}

export function getDictionarySelector(enCode) {
	return request({
		url: `${BASE}/${enCode}/Selector`,
		method: 'get'
	})
}
