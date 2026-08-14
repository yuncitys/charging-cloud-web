import request from '@/utils/request'

function getBaseConfig() {
	if (typeof globalThis !== 'undefined' && globalThis.BaseConfig) {
		return globalThis.BaseConfig
	}
	if (typeof window !== 'undefined' && window.BaseConfig) {
		return window.BaseConfig
	}
	return null
}

export function setLargeScreenDataMode(mode) {
	const normalized = String(mode || '').trim().toLowerCase()
	const value = normalized === 'mock' ? 'mock' : 'real'
	try {
		window.sessionStorage.setItem('largeScreenDataMode', value)
	} catch (e) {}
	try {
		window.localStorage.setItem('largeScreenDataMode', value)
	} catch (e) {}
	return value
}

export function getLargeScreenDataMode() {
	let fromStorage = ''
	try {
		fromStorage = window.sessionStorage.getItem('largeScreenDataMode') || ''
	} catch (e) {}
	if (!fromStorage) {
		try {
			fromStorage = window.localStorage.getItem('largeScreenDataMode') || ''
		} catch (e) {}
	}
	const storageMode = String(fromStorage || '').trim().toLowerCase()
	if (storageMode === 'mock' || storageMode === 'real') {
		return storageMode
	}

	const cfg = getBaseConfig()
	const cfgMode = cfg && cfg.VUE_LARGE_SCREEN_DATA_SOURCE != null ? String(cfg.VUE_LARGE_SCREEN_DATA_SOURCE) : ''
	const normalized = cfgMode.trim().toLowerCase()
	if (normalized === 'mock' || normalized === 'real') {
		return normalized
	}

	const envMode = process.env.VUE_APP_LARGE_SCREEN_DATA_SOURCE != null ? String(process.env.VUE_APP_LARGE_SCREEN_DATA_SOURCE) : ''
	const envNormalized = envMode.trim().toLowerCase()
	if (envNormalized === 'mock' || envNormalized === 'real') {
		return envNormalized
	}

	return 'real'
}

function formBody(data) {
	return {
		url: '',
		method: 'post',
		headers: {
			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
		},
		transformRequest: [
			function(payload) {
				var ret = ''
				for (var it in payload) {
					ret += encodeURIComponent(it) + '=' + encodeURIComponent(payload[it]) + '&'
				}
				ret = ret.substring(0, ret.lastIndexOf('&'))
				return ret
			}
		],
		data
	}
}

export function getVisualMockStatus() {
	return request({
		url: '/api/web/visual/mockStatus',
		method: 'post'
	})
}

export function getCount(data) {
	return request({
		...formBody(data),
		url: '/api/web/visual/getCount',
	})
}

export function getCurve(data) {
	return request({
		...formBody(data),
		url: '/api/web/visual/getCurve',
	})
}

export function getSevenDayTrendByOrder(data) {
	return request({
		...formBody(data),
		url: '/api/web/visual/getSevenDayTrendByOrder',
	})
}

export function getProvinceByDevice(data) {
	return request({
		...formBody(data),
		url: '/api/web/visual/getProvinceByDevice',
	})
}

export function getOrderList(data) {
	return request({
		...formBody(data),
		url: '/api/web/visual/getOrderList',
	})
}

export function getDeviceCountAndDeviceFeeBack(data) {
	return request({
		...formBody(data),
		url: '/api/web/visual/getDeviceCountAndDeviceFeeBack',
	})
}

export function getOrderByGe15Day(data) {
	return request({
		...formBody(data),
		url: '/api/web/visual/getOrderByGe15Day',
	})
}

export function getListByNetWorkDot(data) {
	return request({
		...formBody(data),
		url: '/api/web/visual/getListByNetWorkDot',
	})
}

export function getDeviceLogList(data) {
	return request({
		...formBody(data),
		url: '/api/web/visual/getDeviceLogList',
	})
}

export function getDeviceCount(data) {
	return request({
		...formBody(data),
		url: '/api/web/visual/getDeviceCount',
	})
}
